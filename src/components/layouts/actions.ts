"use server";

import axios from "axios";
import { deleteSession } from "../../app/lib/session";
import { redirect } from "next/navigation";

export async function logout() {
  try {
    await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`,
      { withCredentials: true }
    );
  } catch (error) {
    console.error(error);
  }

  deleteSession();

  redirect("/");
}
