"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import axios from "axios";

export async function getSuppliers() {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "No authentication token found", suppliers: [] };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/suppliers/all`,
      {
        headers,
      }
    );

    return { suppliers: response.data || [], error: null };
  } catch (error: any) {
    console.error("Error fetching suppliers:", error);

    if (error.code === "ECONNREFUSED" && error.response?.status === 429) {
      return { error: "Error connecting to the server", suppliers: [] };
    }
    return { error: "Error fetching suppliers", suppliers: [] };
  }
}

const supplierSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Supplier name must be at least 3 characters long" })
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

type SupplierResult = {
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    address?: string[];
    server?: string;
  };
  supplier?: any;
};

export async function addSupplier(
    prevState: any,
    formData: FormData
) : Promise<SupplierResult> {
    const result = supplierSchema.safeParse(Object.fromEntries(formData));

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
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/suppliers/create`,
      {
        name,
        email,
        phone,
        address
      },
      {
        headers,
      }
    );

    return { supplier: response.data };
  } catch (error: any) {
    console.error("Error adding supplier:", error);
    
    if (error.response && error.response.status === 403 || error.response.status === 422) {
      return { errors: error.response.data.errors };
    }
    return { errors: { server: "Error adding supplier" } };
  }
}

const editSupplierSchema = z.object({
    name: z
        .string()
        .min(3, { message: "Supplier name must be at least 3 characters long" })
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

export async function editSupplier(prevState: any, formData: FormData) {
    const result = editSupplierSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors };
    }

    const { name, email, phone, address, isActive } = result.data;
    const supplierId = formData.get("supplier_id") as string;

    try {
        const token = (await cookies()).get("access_token")?.value;

        if (!token) {
            return { errors: { server: "No authentication token found" } };
        }

        const headers = {
            Authorization: `Bearer ${token}`,
        };

        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/suppliers/supplier/update/${supplierId}`,
            {
                name,
                email,
                phone,
                address,
                isActive
            },
            {
                headers,
            }
        );

        return { supplier: response.data };
    } catch (error: any) {
        console.error("Error editing supplier:", error);

        if (error.response && error.response.status === 422) {
            return { errors: error.response.data.errors };
        }
        return { errors: { server: "Error editing supplier" } };
    }
}
