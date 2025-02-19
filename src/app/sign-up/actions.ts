"use server";

import { z } from "zod";
import axios from "axios";
import { redirect } from "next/navigation";

const signUpSchema = z
  .object({
    company_name: z
      .string()
      .min(2, { message: "Company name must be at least 2 characters" })
      .trim(),
    company_email: z
      .string()
      .email({ message: "Invalid email address" })
      .trim(),
    company_phone: z
      .string()
      .min(10, {
        message: "Phone number must be at least 10 characters",
      })
      .trim(),
    company_address: z
      .string()
      .min(2, { message: "Company address must be at least 2 characters" })
      .trim(),
    company_city: z
      .string()
      .min(2, { message: "Company city must be at least 2 characters" })
      .trim(),
    company_state: z
      .string()
      .min(2, { message: "Company state must be at least 2 characters" })
      .trim(),
    company_zip: z
      .string()
      .min(2, { message: "Company zip must be at least 2 characters" })
      .trim(),
    company_size: z
      .string()
      .min(2, { message: "Company size must be at least 2 characters" })
      .trim(),
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
      .min(6, { message: "Password must be at least 6 characters" })
      .trim(),
    confirm_password: z.string().trim(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type SignUpResult = {
  errors?: {
    company_name?: string[];
    company_email?: string[];
    company_phone?: string[];
    company_address?: string[];
    company_city?: string[];
    company_state?: string[];
    company_zip?: string[];
    company_size?: string[];
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

  const {
    company_name,
    company_email,
    company_phone,
    company_address,
    company_city,
    company_state,
    company_zip,
    company_size,
    first_name,
    last_name,
    email,
    password,
  } = result.data;

  let user;

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`,
      {
        company_name,
        company_email,
        company_phone,
        company_address,
        company_city,
        company_state,
        company_zip,
        company_size,
        first_name,
        last_name,
        email,
        password,
        role: "admin",
      },
      { withCredentials: true }
    );

    user = response.data.user;
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      const message = error.response.data.message;

      if (message === "Company email already registered") {
        return { errors: { company_email: [message] } };
      }

      if (message === "User email already registered") {
        return { errors: { email: [message] } };
      }

      return {
        errors: { server: message || "An error occurred, please try again" },
      };
    }

    return { errors: { server: "An error occurred, please try again" } };
  }

  redirect("/");
}
