"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { z } from "zod";

export async function getClients() {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "No authentication token found", clients: [] };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/clients/all`,
      {
        headers,
      }
    );

    return { client: response.data, error: null };
  } catch (error) {
    console.error("Error fetching clients:", error);
    return { error: "Error fetching clients", clients: [] };
  }
}

const clientSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Client name must be at least 3 characters long" })
    .trim(),
  email: z.string().email({ message: "Invalid email address" }).trim(),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 characters long" })
    .trim(),
  address: z
    .string()
    .min(10, { message: "Address must be at least 10 characters long" })
    .trim(),
});

type ClientResult = {
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    address?: string[];
    server?: string;
  };
  client?: any;
};

export async function addClient(
  prevState: any,
  formData: FormData
): Promise<ClientResult> {
  const result = clientSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const { name, email, phone, address } = result.data;

  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { errors: { server: "No authentication token found" } };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/clients/create`,
      {
        name,
        email,
        phone,
        address,
      },
      {
        headers,
      }
    );

    return { client: response.data };
  } catch (error: any) {
    console.error("Error adding client:", error);

    if (error.response && error.response.status === 422) {
      return { errors: error.response.data.errors };
    }
    return { errors: { server: "Error adding client" } };
  }
}

const editClientSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Client name must be at least 3 characters long" })
    .trim(),
  email: z.string().email({ message: "Invalid email address" }).trim(),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 characters long" })
    .trim(),
  address: z
    .string()
    .min(10, { message: "Address must be at least 10 characters long" })
    .trim(),
  isActive: z.string().nullable(),
});

export async function editClient(prevState: any, formData: FormData) {
    const result = editClientSchema.safeParse(Object.fromEntries(formData));
    
    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors };
    }
    
    const { name, email, phone, address, isActive } = result.data;
    const clientId = formData.get("client_id") as string;
    
    try {
        const token = (await cookies()).get("access_token")?.value;
    
        if (!token) {
        return { errors: { server: "No authentication token found" } };
        }
    
        const headers = {
        Authorization: `Bearer ${token}`,
        };
    
        const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/clients/client/update/${clientId}`,
        {
            name,
            email,
            phone,
            address,
            isActive,
        },
        {
            headers,
        }
        );
    
        return { client: response.data };
    } catch (error: any) {
        console.error("Error editing client:", error);
    
        if (error.response && error.response.status === 422) {
        return { errors: error.response.data.errors };
        }
        return { errors: { server: "Error editing client" } };
    }
}
