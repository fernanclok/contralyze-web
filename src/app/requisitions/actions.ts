"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { z } from "zod";

const RequisitionSchema = z.object({
    title: z
    .string()
    .min(5, "Title must be at least 5 characters long"),
    priority: z
    .string({message: "Please select a priority level"}),
    requested_date: z
    .string({message: "Please select a requested date"}),
    justification: z
    .string()
    .min(10, "Justification must be at least 10 characters long"),
});

type RequisitionResult = {
    errors?: {
        title?: string[];
        priority?: string[];
        requested_date?: string[];
        justification?: string[];
        server?: string;
    };
    requisition?: any;
};

export async function addRequisition(
    prevState: any,
    formData: FormData
) : Promise<RequisitionResult> {
    const result = RequisitionSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors };
    }

    const { title, priority, requested_date, justification } = result.data;

    try {
        const token = (await cookies()).get("access_token")?.value;

        if (!token) {
            return { errors: { server: "No authentication token found" } };
        }

        const headers = {
            Authorization: `Bearer ${token}`,
        };

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/requisitions`,
            { title, priority, requested_date, justification },
            { headers }
        );

        return { requisition: response.data };
    }
    catch (error: any) {
        console.error("Error adding requisition:", error);

        if (error.response && error.response.status === 422) {
            return { errors: error.response.data };
        }
        return { errors: { server: "An error occurred while adding the requisition" } };
    }
}