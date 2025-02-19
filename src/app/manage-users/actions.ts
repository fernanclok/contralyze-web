"use server";
import axios from "axios";
import { cookies } from "next/headers"; // Next.js para acceder a cookies en el servidor

export async function getUsers() {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "No authentication token found" };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/all`,
      {
        headers,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return { error: "Failed to fetch users" };
  }
}
