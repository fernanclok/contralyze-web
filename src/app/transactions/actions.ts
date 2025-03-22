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
  amount: number;
  issue_date: string;
  due_date?: string;
  status: string;
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
      {
        headers,
      }
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
  supplier_id?: string;
  client_id?: string;
  transaction_date: string;
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

    console.log('Enviando datos al servidor:', data);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transactions/create`,
      data,
      {
        headers,
      }
    );

    console.log('Respuesta del servidor:', response.data);

    return { transaction: response.data.data || null, error: null };
  } catch (error: any) {
    console.error("Error creating transaction:", error);

    // Capturar errores de validación
    if (error.response?.data?.errors) {
      const validationErrors = Object.values(error.response.data.errors).flat().join(', ');
      return { error: `Validation error: ${validationErrors}`, transaction: null };
    }

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", transaction: null };
    }

    return { error: "Error creating transaction", transaction: null };
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
      {
        headers,
      }
    );

    console.log('Respuesta del servidor:', response.data);

    return { transaction: response.data.data || null, error: null };
  } catch (error: any) {
    console.error("Error updating transaction:", error);

    // Capturar errores de validación
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
      {
        headers,
      }
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
export async function getTransactionSummary() {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "No authentication token found", summary: null };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transactions/summary`,
      {
        headers,
      }
    );

    return { summary: response.data.data || null, error: null };
  } catch (error: any) {
    console.error("Error fetching transaction summary:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", summary: null };
    }

    return { error: "Error fetching transaction summary", summary: null };
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
      {
        headers,
      }
    );

    return { categories: response.data.categories || [], error: null };
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
      {
        headers,
      }
    );

    return { suppliers: response.data.suppliers || [], error: null };
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
      {
        headers,
      }
    );

    return { clients: response.data.clients || [], error: null };
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
      {
        headers,
      }
    );

    return { departments: response.data.departments || [], error: null };
  } catch (error: any) {
    console.error("Error fetching departments:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", departments: [] };
    }

    return { error: "Error fetching departments", departments: [] };
  }
} 