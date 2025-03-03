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
    
        return { supplier: response.data, error: null };
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        return { error: "Error fetching suppliers", suppliers: [] };
    }
}

