"use server";

import { z } from "zod";
import axios from "axios";
import { createSession, storeTokenBackend } from "../lib/session";
import { redirect } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).trim(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .trim(),
});

type LoginResult = {
  errors?: {
    email?: string[];
    password?: string[];
    server?: string;
  };
  user?: any;
  token?: string;
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
  let token;

  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
      email,
      password,
    }, { withCredentials: true });

    console.log(response.data);

    user = response.data.user;
    token = response.data.token.original.access_token;
  } catch (error) {
    return {
      errors: {
        server: "Invalid password or email, please try again",
      },
    };
  };

  await createSession(
    user.id, 
    user.role, 
    user.first_name, 
    user.last_name, 
    user.department_id ? String(user.department_id) : undefined
  );
  console.log('department_id:', user.department_id);
  await storeTokenBackend(token);

  redirect("/dashboard");
}