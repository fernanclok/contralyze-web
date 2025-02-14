"use server";

import { z } from "zod";
import axios from "axios";
import { createSession } from "../lib/session";
import { redirect } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .trim(),
});

type LoginResult = {
  errors?: {
    email?: string[];
    password?: string[];
    server?: string;
  };
  user?: any;
};

export async function login(prevState: any, formData: FormData): Promise<LoginResult> {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  let user;

  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/login`, {
      email,
      password,
    }, { withCredentials: true });

    user = response.data.user;
  } catch (error) {
    return {
      errors: {
        server: "Invalid password or email, please try again",
      },
    };
  };

  await createSession(user.id, user.role);

  redirect("/dashboard");
}