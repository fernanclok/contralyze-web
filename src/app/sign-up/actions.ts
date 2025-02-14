"use server";

import { z } from "zod";
import axios from "axios";
import { createSession } from "../lib/session";
import { redirect } from "next/navigation";

const signUpSchema = z
  .object({
    first_name: z
      .string()
      .min(2, { message: "First name must be at least 2 characters" })
      .trim(),
    last_name: z
      .string()
      .min(2, { message: "Last name must be at least 2 characters" })
      .trim(),
    email: z.string().email({ message: "Invalid email address" }).trim(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .trim(),
    confirm_password: z.string().trim(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type SignUpResult = {
  errors?: {
    first_name?: string[];
    last_name?: string[];
    email?: string[];
    password?: string[];
    confirm_password?: string[];
    server?: string;
  };
  user?: any;
};

export async function signUp(
  prevState: any,
  formData: FormData
): Promise<SignUpResult> {
  const result = signUpSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { first_name, last_name, email, password } = result.data;

  let user;

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/register`,
      {
        first_name,
        last_name,
        email,
        password,
        role: "admin",
      },
      { withCredentials: true }
    );

    user = response.data.user;
  } catch (error) {
    return {
      errors: {
        server: "An error occurred, please try again",
      },
    };
  }

  await createSession(user.id, user.role);

  redirect("/dashboard");
}
