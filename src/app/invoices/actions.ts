"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { Invoice } from "@/app/transactions/actions";

// Interfaces para Invoice (ampliada)
export interface InvoiceDetailed extends Invoice {
  transaction?: {
    id: string;
    type: "income" | "expense" | "transfer";
    amount: number;
    description?: string;
    status: "pending" | "completed" | "cancelled";
    payment_method?: string;
    reference_number?: string;
    transaction_date: string;
  };
}

// Obtener todas las facturas
export async function getInvoices() {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "No authentication token found", invoices: [] };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/all`,
      {
        headers,
      }
    );

    const invoices =
      response.data.data?.data ||
      response.data.data ||
      response.data.invoices ||
      [];

    return { invoices, error: null };
  } catch (error: any) {
    console.error("Error fetching invoices:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", invoices: [] };
    }

    return { error: "Error fetching invoices", invoices: [] };
  }
}

// Crear una nueva factura
export async function createInvoice(data: {
  transaction_id: string;
  invoice_number: string;
  amount: number;
  issue_date: string;
  due_date?: string;
  status: string;
  notes?: string;
  file?: File;
}) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "Authorization required. Please log in.", invoice: null };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    };

    // Crear un FormData si hay un archivo
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === "file" && value) {
          if (value instanceof File) {
            formData.append("file", value);
          }
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/create`,
      formData,
      {
        headers,
      }
    );

    return { invoice: response.data.data || null, error: null };
  } catch (error: any) {
    console.error("Error creating invoice:", error);

    // Capturar errores de validación
    if (error.response?.data?.errors) {
      const validationErrors = Object.values(error.response.data.errors)
        .flat()
        .join(", ");
      return { error: `Validation error: ${validationErrors}`, invoice: null };
    }

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", invoice: null };
    }

    return { error: "Error creating invoice", invoice: null };
  }
}

// Actualizar una factura
export async function updateInvoice(
  id: string,
  data: {
    transaction_id?: string;
    invoice_number?: string;
    amount?: number;
    issue_date?: string;
    due_date?: string;
    status?: string;
    notes?: string;
    file?: File;
  }
) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "Authorization required. Please log in.", invoice: null };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    };

    // Crear un FormData si hay un archivo
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === "file" && value) {
          if (value instanceof File) {
            formData.append("file", value);
          }
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Método especial para actualizar con archivo
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${id}/update`,
      formData,
      {
        headers,
      }
    );

    return { invoice: response.data.data || null, error: null };
  } catch (error: any) {
    console.error("Error updating invoice:", error);

    // Capturar errores de validación
    if (error.response?.data?.errors) {
      const validationErrors = Object.values(error.response.data.errors)
        .flat()
        .join(", ");
      return { error: `Validation error: ${validationErrors}`, invoice: null };
    }

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", invoice: null };
    }

    return { error: "Error updating invoice", invoice: null };
  }
}

// Eliminar una factura
export async function deleteInvoice(id: string) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return {
        error: "Authorization required. Please log in.",
        success: false,
      };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${id}`,
      {
        headers,
      }
    );

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error deleting invoice:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", success: false };
    }

    return { error: "Error deleting invoice", success: false };
  }
}

// Obtener transacciones para asociar con facturas
export async function getTransactionsForInvoice() {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "No authentication token found", transactions: [] };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transactions/all`,
      {
        headers,
      }
    );

    const transactions =
      response.data.data?.data ||
      response.data.data ||
      response.data.transactions ||
      [];

    return { transactions, error: null };
  } catch (error: any) {
    console.error("Error fetching transactions for invoice:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", transactions: [] };
    }

    return { error: "Error fetching transactions", transactions: [] };
  }
}

// Descargar archivo de factura
export async function downloadInvoiceFile(id: string) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "Authorization required. Please log in.", url: null };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${id}/download`,
      {
        headers,
        responseType: "blob",
      }
    );

    // Crear un URL para el blob
    const url = URL.createObjectURL(new Blob([response.data]));
    return { url, error: null };
  } catch (error: any) {
    console.error("Error downloading invoice file:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", url: null };
    }

    return { error: "Error downloading invoice file", url: null };
  }
}
