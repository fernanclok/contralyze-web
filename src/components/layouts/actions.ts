"use server";

import axios from "axios";
import { deleteSession } from "../../app/lib/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function logout() {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "No authentication token found" };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`,
      {},
      { headers }
    );
  } catch (error) {
    console.error(error);
  }


  deleteSession();

  redirect("/");
}
