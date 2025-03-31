"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { Invoice } from "@/app/transactions/actions";

// Interfaces para Invoice (ampliada)
export interface InvoiceDetailed extends Invoice {
  type?: string;
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

    console.log("URL de la API:", `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/all`);
    
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/all`,
      {
        headers,
      }
    );

    console.log("Response data:", response.data);
    
    const invoices =
      response.data.data?.data ||
      response.data.data ||
      response.data.invoices ||
      [];

    return { invoices, error: null };
  } catch (error: any) {
    console.error("Error fetching invoices:", error);
    console.error("Error response data:", error.response?.data);
    console.error("Error status:", error.response?.status);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", invoices: [] };
    }

    return { 
      error: `Error fetching invoices: ${error.message || 'Unknown error'}`, 
      invoices: [] 
    };
  }
}

// Crear una nueva factura
export async function createInvoice(data: {
  transaction_id: string;
  invoice_number: string;
  due_date?: string;
  status: string;
  notes?: string;
  file?: File;
  type?: string;
}) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "Authorization required. Please log in.", invoice: null };
    }

    // IMPORTANTE: No incluir Content-Type para FormData, axios lo establecerá automáticamente
    const headers = {
      Authorization: `Bearer ${token}`,
      // Eliminamos "Content-Type": "multipart/form-data" ya que axios lo establecerá 
      // con el boundary correcto cuando detecte que estamos enviando FormData
    };

    // Crear un FormData para el archivo
    const formData = new FormData();
    
    // Añadir type si no está definido
    const dataWithDefaults = {
      ...data,
      type: data.type || 'invoice' // Valor por defecto si no se proporciona
    };
    
    console.log("Datos a enviar:", dataWithDefaults);
    
    // Primero agregamos el archivo para asegurarnos de que se envía
    if (dataWithDefaults.file && dataWithDefaults.file instanceof File) {
      formData.append("file", dataWithDefaults.file);
      console.log("Archivo adjunto:", dataWithDefaults.file.name, dataWithDefaults.file.size);
    } else {
      console.error("No se encontró archivo o no es un objeto File válido");
      return { error: "A valid invoice file is required", invoice: null };
    }
    
    // Luego agregamos el resto de los campos
    Object.entries(dataWithDefaults).forEach(([key, value]) => {
      if (value !== undefined && key !== 'file') {
        formData.append(key, String(value));
      }
    });

    // Verificar contenido de FormData (solo para depuración)
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value instanceof File ? `File (${value.name})` : value}`);
    }

    console.log("URL de la API:", `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/create`);
    
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/create`,
      formData,
      {
        headers,
      }
    );

    console.log("Response data:", response.data);
    
    return { invoice: response.data.data || null, error: null };
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    console.error("Error response data:", error.response?.data);
    console.error("Error status:", error.response?.status);

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

    return { 
      error: `Error creating invoice: ${error.message || 'Unknown error'}`, 
      invoice: null 
    };
  }
}

// Actualizar una factura
export async function updateInvoice(
  id: string,
  data: {
    transaction_id?: string;
    invoice_number?: string;
    due_date?: string;
    status?: string;
    type?: string;
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
    console.log("Datos a enviar:", data);
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === "file" && value) {
          if (value instanceof File) {
            formData.append("file", value);
            console.log("Archivo adjunto:", value.name, value.size);
          }
        } else {
          formData.append(key, String(value));
        }
      }
    });

    console.log("URL de la API:", `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${id}/update`);
    
    // Método especial para actualizar con archivo
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${id}/update`,
      formData,
      {
        headers,
      }
    );

    console.log("Response data:", response.data);
    
    return { invoice: response.data.data || null, error: null };
  } catch (error: any) {
    console.error("Error updating invoice:", error);
    console.error("Error response data:", error.response?.data);
    console.error("Error status:", error.response?.status);

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

    return { 
      error: `Error updating invoice: ${error.message || 'Unknown error'}`, 
      invoice: null 
    };
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

    console.log("URL de la API:", `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${id}`);
    
    await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${id}`,
      {
        headers,
      }
    );

    console.log("Factura eliminada con éxito");
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error deleting invoice:", error);
    console.error("Error response data:", error.response?.data);
    console.error("Error status:", error.response?.status);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", success: false };
    }

    return { 
      error: `Error deleting invoice: ${error.message || 'Unknown error'}`, 
      success: false 
    };
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

    console.log("URL de la API:", `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transactions/all`);
    
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transactions/all`,
      {
        headers,
      }
    );

    console.log("Response data:", response.data);
    
    const transactions =
      response.data.data?.data ||
      response.data.data ||
      response.data.transactions ||
      [];

    return { transactions, error: null };
  } catch (error: any) {
    console.error("Error fetching transactions for invoice:", error);
    console.error("Error response data:", error.response?.data);
    console.error("Error status:", error.response?.status);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", transactions: [] };
    }

    return { 
      error: `Error fetching transactions: ${error.message || 'Unknown error'}`, 
      transactions: [] 
    };
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

    // First get the invoice details to get the file URL
    console.log("Fetching invoice details for ID:", id);
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/show/${id}`,
      { headers }
    );

    console.log("Invoice details response:", response.data);

    // Check if we need to unwrap the data property
    const invoiceData = response.data?.data || response.data;
    console.log("Invoice data after unwrapping:", invoiceData);

    if (!invoiceData) {
      return { error: "No invoice data received", url: null };
    }

    // Try different possible file URL fields
    const fileUrl = invoiceData.file_url || invoiceData.file_path || invoiceData.url;
    console.log("File URL found:", fileUrl);

    if (!fileUrl) {
      return { error: "No file URL found for this invoice", url: null };
    }

    // Make sure we have a full URL
    const fullFileUrl = fileUrl.startsWith('http') 
      ? fileUrl 
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}${fileUrl}`;
    console.log("Full file URL:", fullFileUrl);

    // Now download the actual file
    const fileResponse = await axios.get(fullFileUrl, {
      headers,
      responseType: "blob",
    });

    console.log("File downloaded successfully");
    
    // Create a URL for the blob
    const url = URL.createObjectURL(new Blob([fileResponse.data], {
      type: fileResponse.headers['content-type']
    }));
    return { url, error: null };
  } catch (error: any) {
    console.error("Error downloading invoice file:", error);
    console.error("Error response data:", error.response?.data);
    console.error("Error status:", error.response?.status);

    // If it's a 404, try the direct file endpoint
    if (error.response?.status === 404) {
      try {
        console.log("Trying direct file endpoint");
        const fileResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${id}/file`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: "blob",
          }
        );

        console.log("File downloaded successfully from direct endpoint");
        const url = URL.createObjectURL(new Blob([fileResponse.data], {
          type: fileResponse.headers['content-type']
        }));
        return { url, error: null };
      } catch (directError: any) {
        console.error("Error with direct file endpoint:", directError);
        return { 
          error: `Error downloading invoice file: ${directError.message || 'Unknown error'}`, 
          url: null 
        };
      }
    }

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", url: null };
    }

    return { 
      error: `Error downloading invoice file: ${error.message || 'Unknown error'}`, 
      url: null 
    };
  }
}
