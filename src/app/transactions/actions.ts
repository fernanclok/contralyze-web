"use server";

import axios from "axios";
import { cookies } from "next/headers";

// Tipos para los datos de transacciones
export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  category_id: string;
  user_id: string;
  supplier_id?: string;
  client_id?: string;
  transaction_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  payment_method?: string;
  reference_number?: string;
  category?: {
    name: string;
    department_id?: string;
  };
  user?: {
    name?: string;
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
    email?: string;
    username?: string;
    id?: string;
  };
  supplier?: {
    name: string;
  };
  client?: {
    name: string;
  };
  invoices?: Invoice[];
}

export interface Invoice {
  id: string;
  transaction_id: string;
  invoice_number: string;
  file_path?: string;
  file_url?: string;
  amount: number;
  issue_date: string;
  due_date?: string;
  status: string;
  type?: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  department_id?: string;
  department?: {
    name: string;
  };
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Client {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
}

// Obtener todas las transacciones
export async function getTransactions() {
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
      { headers }
    );

    // La respuesta puede tener diferentes estructuras dependiendo del backend
    // Verificamos varias posibilidades para manejar el caso adecuadamente
    const transactions = response.data.data?.data || // Si viene en data.data
                         response.data.data || // Si viene en data
                         response.data.transactions || // Si viene en transactions
                         [];

    return { transactions, error: null };
  } catch (error: any) {
    console.error("Error fetching transactions:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", transactions: [] };
    }

    return { error: "Error fetching transactions", transactions: [] };
  }
}

// Crear una nueva transacción
export async function createTransaction(data: {
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description?: string;
  category_id?: string;
  category_name?: string;
  category_type?: string;
  department_id?: string;
  supplier_id?: string;
  client_id?: string;
  transaction_date: string;
  status?: 'pending' | 'completed' | 'cancelled';
  payment_method?: string;
  reference_number?: string;
  isNewCategory?: boolean;
}) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "Authorization required. Please log in.", transaction: null };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Create the transaction
    try {
      console.log('Sending transaction data:', data);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transactions/create`,
        data,
        { headers }
      );

      if (response.data.success) {
        return { 
          error: null, 
          transaction: response.data.transaction 
        };
      } else {
        return { 
          error: response.data.message || "Error creating transaction", 
          transaction: null 
        };
      }
    } catch (error: any) {
      console.error('Error response:', error.response?.data);
      return {
        error: error.response?.data?.message || "Error creating transaction",
        transaction: null
      };
    }
  } catch (error: any) {
    console.error("Error creating transaction:", error);

    if (error.response?.data?.errors) {
      const validationErrors = Object.values(error.response.data.errors).flat().join(', ');
      return { error: `Validation error: ${validationErrors}`, transaction: null };
    }

    return { error: error.response?.data?.message || error.message, transaction: null };
  }
}

// Crear una nueva factura para una transacción
export async function createInvoice({
  transaction_id,
  file,
  invoice_number,
  due_date,
  notes,
  status,
  type
}: {
  transaction_id: string;
  file: File;
  invoice_number: string;
  due_date?: string;
  notes?: string;
  status: string;
  type: string;
}) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "Authorization required. Please log in.", invoice: null };
    }

    const formData = new FormData();
    
    // Add file first to ensure it's sent
    if (file && file instanceof File) {
      formData.append("file", file);
      console.log("File attached:", file.name, file.size);
    } else {
      console.error("No file found or not a valid File object");
      return { error: "A valid invoice file is required", invoice: null };
    }

    // Add other fields
    formData.append('transaction_id', transaction_id);
    formData.append('invoice_number', invoice_number);
    formData.append('status', status);
    formData.append('type', type || 'invoice'); // Default to 'invoice' if not provided
    if (due_date) formData.append('due_date', due_date);
    if (notes) formData.append('notes', notes);

    // Log FormData contents for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value instanceof File ? `File (${value.name})` : value}`);
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/create`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // Let axios set Content-Type for FormData
        }
      }
    );

    if (response.data.success) {
      return { error: null, invoice: response.data.invoice };
    }

    // Handle validation errors
    if (response.data.errors) {
      const validationErrors = Object.values(response.data.errors)
        .flat()
        .join(", ");
      return { error: `Validation error: ${validationErrors}`, invoice: null };
    }
    
    return { 
      error: response.data.message || 'Error creating invoice',
      invoice: null 
    };
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    console.error('Error response data:', error.response?.data);
    
    // Handle validation errors in catch block too
    if (error.response?.data?.errors) {
      const validationErrors = Object.values(error.response.data.errors)
        .flat()
        .join(", ");
      return { error: `Validation error: ${validationErrors}`, invoice: null };
    }

    return {
      error: error.response?.data?.message || 'Error creating invoice',
      invoice: null
    };
  }
}

// Actualizar una transacción existente
export async function updateTransaction(id: string, data: {
  type?: 'income' | 'expense' | 'transfer';
  amount?: number;
  description?: string;
  category_id?: string;
  supplier_id?: string;
  client_id?: string;
  transaction_date?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  payment_method?: string;
  reference_number?: string;
}) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "Authorization required. Please log in.", transaction: null };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    console.log('Actualizando transacción:', id, data);

    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transactions/${id}`,
      data,
      { headers }
    );

    console.log('Respuesta del servidor:', response.data);

    return { transaction: response.data.data || null, error: null };
  } catch (error: any) {
    console.error("Error updating transaction:", error);

    // Capture validation errors
    if (error.response?.data?.errors) {
      const validationErrors = Object.values(error.response.data.errors).flat().join(', ');
      return { error: `Validation error: ${validationErrors}`, transaction: null };
    }

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", transaction: null };
    }

    return { error: "Error updating transaction", transaction: null };
  }
}

// Eliminar una transacción existente
export async function deleteTransaction(id: string) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "Authorization required. Please log in.", success: false };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    console.log('Eliminando transacción:', id);

    await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transactions/${id}`,
      { headers }
    );

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error deleting transaction:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", success: false };
    }

    return { error: "Error deleting transaction", success: false };
  }
}

// Obtener datos resumidos para dashboard
export async function getTransactionSummary(): Promise<{
  summary: {
    income: number;
    expense: number;
    balance: number;
    recent_transactions: any[];
    by_category: any[];
  } | null;
  error: string | null;
}> {
  try {
    console.log("getTransactionSummary: Función deshabilitada temporalmente");
    // Devolvemos un objeto mock para evitar la llamada a la API
    return {
      summary: null,
      error: "API call disabled for testing"
    };
    
    /* CÓDIGO ORIGINAL COMENTADO
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "Authorization required. Please log in.", summary: null };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transactions/summary`,
      { headers }
    );
    console.log('Respuesta del servidor:', response.data);

    // Ensure we're accessing data correctly from the API response
    return { summary: response.data.data || null, error: null };
    */
  } catch (error: any) {
    console.error("Error fetching transaction summary:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", summary: null };
    }

    return {
      error: `Error fetching transactions summary: ${
        error.response?.data?.message || error.message || "Unknown error"
      }`,
      summary: null,
    };
  }
}

// Obtener categorías
export async function getCategories() {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "No authentication token found", categories: [] };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories/all`,
      { headers }
    );

    // Ajustando según la estructura real de respuesta
    return { categories: response.data || [], error: null };
  } catch (error: any) {
    console.error("Error fetching categories:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", categories: [] };
    }

    return { error: "Error fetching categories", categories: [] };
  }
}

// Obtener proveedores
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
      { headers }
    );

    // Ajustando según la estructura real de respuesta
    return { suppliers: response.data || [], error: null };
  } catch (error: any) {
    console.error("Error fetching suppliers:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", suppliers: [] };
    }

    return { error: "Error fetching suppliers", suppliers: [] };
  }
}

// Obtener clientes
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
      { headers }
    );

    // Ajustando según la estructura real de respuesta
    return { clients: response.data || [], error: null };
  } catch (error: any) {
    console.error("Error fetching clients:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", clients: [] };
    }

    return { error: "Error fetching clients", clients: [] };
  }
}

// Obtener departamentos
export async function getDepartments() {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "No authentication token found", departments: [] };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/all`,
      { headers }
    );

    // El backend devuelve el array de departamentos directamente
    if (response.data && Array.isArray(response.data)) {
      return { departments: response.data, error: null };
    }

    console.error("Unexpected response format from departments API:", response.data);
    return { error: "Invalid response format", departments: [] };
  } catch (error: any) {
    console.error("Error fetching departments:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", departments: [] };
    }

    return { error: "Error fetching departments", departments: [] };
  }
}