"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { z } from "zod";

const RequisitionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),  
  justification: z.string().min(10, "Justification must be at least 10 characters long"),
  total_amount: z.string().min(0, "Total amount must be at least 0"),  
  request_date: z.string().nonempty("Please select a requested date"),
  priority: z.string().nonempty("Please select a priority level"),
  items: z.array(z.object({
    product_name: z.string(),
    product_description: z.string(),
    quantity: z.number(),
    price: z.number(),
  })).nonempty("At least one item is required"),
});

type RequisitionResult = {
  errors?: {
    title?: string[];    
    justification?: string[];
    total_amount?: string[];    
    request_date?: string[];
    priority?: string[];
    items?: string[];
    server?: string;
  };
  requisition?: any;
};

export async function addRequisition(
  prevState: any,
  formData: FormData
): Promise<RequisitionResult> {
  const formDataObj = Object.fromEntries(formData);

  // Convert total_amount to number
  formDataObj.total_amount = parseFloat(formDataObj.total_amount as string).toString();

  // Parse items as JSON
  formDataObj.items = JSON.parse(formDataObj.items as string);

  const result = RequisitionSchema.safeParse(formDataObj);

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const { title, justification, total_amount, request_date, priority, items } = result.data;

  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { errors: { server: "No authentication token found" } };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/requisitions/create`,
      { 
        title, 
        justification,
        total_amount,         
        request_date, 
        priority, 
        items 
      },
      { headers }
    );

    return { requisition: response.data };
  } catch (error: any) {
    console.error("Error adding requisition:", error);

    if (error.response && error.response.status === 422) {
      return { errors: error.response.data.errors };
    }
    return { errors: { server: "An error occurred while adding the requisition" } };
  }
}

export async function getRequisitions() {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { errors: { server: "No authentication token found" } };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/requisitions/all`, {
      headers,
    });

    return { requisitions: response.data || [], error: null };
  } catch (error: any) {
    console.error("Error getting requisitions:", error);

    if (error.code === "ECONNREFUSED" && error.response?.status === 429) {
      return { error: "Error connecting to the server", budgets: [] };
    }
    return { error: "Error fetching requisitions", requisitions: [] };
  }
}

export async function getRequisitionDashboard() {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { errors: { server: "No authentication token found" } };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/requisitions/dashboard`, {
      headers,
    });

    return { requisitionDashboard: response.data || [], error: null };
  } catch (error: any) {
    console.error("Error getting requisition dashboard:", error);

    if (error.code === "ECONNREFUSED" && error.response?.status === 429) {
      return { error: "Error connecting to the server", requisitionDashboard: [] };
    }
    return { error: "Error fetching requisition dashboard", requisitionDashboard: [] };
  }
}

export async function approveRequisition(id: string) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { errors: { server: "No authentication token found" } };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/requisitions/approve/${id}`,
      { },
      { headers }
    );

    return { requisition: response.data };
  } catch (error: any) {
    console.error("Error approving requisition:", error);

    if (error.response && error.response.status === 422) {
      return { errors: error.response.data.errors };
    }
    return { errors: { server: "An error occurred while approving the requisition" } };
  }
}

const rejectRequisitionSchema = z.object({
  rejection_reason: z.string().min(10, "Rejected reason must be at least 10 characters long"),
});

type RejectRequisitionResult = {
  errors?: {
    rejection_reason?: string[];
    server?: string;
  };
  requisition?: any;
};

export async function rejectRequisition(
  prevState: any,
  formData: FormData
) : Promise<RejectRequisitionResult> {
  const result = rejectRequisitionSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const { rejection_reason } = result.data;

  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { errors: { server: "No authentication token found" } };
    }

    const requisition_id = formData.get("requisition_id");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/requisitions/reject/${requisition_id}`,
      { rejection_reason },
      { headers }
    );

    return { requisition: response.data };
  } catch (error: any) {
    console.error("Error rejecting requisition:", error);

    if (error.response && error.response.status === 422) {
      return { errors: error.response.data.errors };
    }
    return { errors: { server: "An error occurred while rejecting the requisition" } };
  }
}

const editRequisitionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),  
  justification: z.string().min(10, "Justification must be at least 10 characters long"),
  total_amount: z.string().min(0, "Total amount must be at least 0"),  
  request_date: z.string().nonempty("Please select a requested date"),
  priority: z.string().nonempty("Please select a priority level"),
  items: z.array(z.object({
    product_name: z.string(),
    product_description: z.string(),
    quantity: z.number(),
    price: z.number(),
  })).nonempty("At least one item is required"),
});

type EditRequisitionResult = {
  errors?: {
    title?: string[];    
    justification?: string[];
    total_amount?: string[];    
    request_date?: string[];
    priority?: string[];
    items?: string[];
    server?: string;
  };
  requisition?: any;
};

export async function editRequisition(
  requisition_id: string,
  formData: FormData
): Promise<EditRequisitionResult> {
  const formDataObj = Object.fromEntries(formData);

  // Convert total_amount to number
  formDataObj.total_amount = parseFloat(formDataObj.total_amount as string).toString();

  // Parse items as JSON
  formDataObj.items = JSON.parse(formDataObj.items as string);

  const result = editRequisitionSchema.safeParse(formDataObj);

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const { title, justification, total_amount, request_date, priority, items } = result.data;

  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { errors: { server: "No authentication token found" } };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/requisitions/update/${requisition_id}`,
      { 
        title, 
        justification,
        total_amount,         
        request_date, 
        priority, 
        items 
      },
      { headers }
    );

    return { requisition: response.data };
  } catch (error: any) {
    console.error("Error editing requisition:", error);

    if (error.response && error.response.status === 422) {
      return { errors: error.response.data.errors };
    }
    return { errors: { server: "An error occurred while editing the requisition" } };
  }
}