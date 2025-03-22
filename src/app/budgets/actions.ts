"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { getSession } from "@/app/lib/session";

// Tipos para los datos de budget
export interface Budget {
  id: string;
  category_id: string;
  max_amount: number;
  user_id: string;
  start_date: string;
  end_date: string;
  status: string;
  category: {
    name: string;
    department_id?: string;
  };
  department?: {
    id: string;
    name: string;
  };
  user?: {
    name: string;
  };
}

export interface BudgetRequest {
  id: string;
  user_id: string;
  category_id: string;
  requested_amount: number;
  description: string;
  request_date: string;
  status: string;
  reviewed_by: string | null;
  category: {
    name: string;
    department_id?: string;
  };
  department?: {
    id: string;
    name: string;
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
  reviewer?: {
    name: string;
  };
}

export interface Category {
  id: string;
  name: string;
  department_id?: string;
  department?: {
    name: string;
  };
}

export interface Department {
  id: string;
  name: string;
  description?: string;
}

// Obtener todos los budgets
export async function getBudgets() {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "No authentication token found", budgets: [] };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budgets/all`,
      {
        headers,
      }
    );

    return { budgets: response.data.budgets || [], error: null };
  } catch (error: any) {
    console.error("Error fetching budgets:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", budgets: [] };
    }

    return { error: "Error fetching budgets", budgets: [] };
  }
}

// Crear un nuevo budget
export async function createBudget(data: {
  category_id: string;
  max_amount: number;
  start_date: string;
  end_date: string;
  status?: string;
  periodicity?: string;
}) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "Authorization required. Please log in.", budget: null };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Creamos una copia del objeto sin la periodicidad para enviar al backend
    // ya que el backend no maneja este campo todavía
    const { periodicity, ...apiData } = data;

    console.log('Enviando datos al servidor:', apiData);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budgets/create`,
      apiData,
      {
        headers,
      }
    );

    console.log('Respuesta del servidor:', response.data);

    // La estructura debe tener { budget: {...}, message: '...' }
    return { budget: response.data.budget || null, error: null };
  } catch (error: any) {
    console.error("Error creating budget:", error);

    // Capturar errores de autorización
    if (error.response?.status === 403) {
      return { error: "Unauthorized. Only administrators can create budgets.", budget: null };
    }

    // Capturar errores de validación
    if (error.response?.data?.errors) {
      const validationErrors = Object.values(error.response.data.errors).flat().join(', ');
      return { error: `Validation error: ${validationErrors}`, budget: null };
    }

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", budget: null };
    }

    return { error: "Error creating budget", budget: null };
  }
}

// Actualizar un budget existente
export async function updateBudget(id: string, data: {
  category_id?: string;
  max_amount?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
}) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "Authorization required. Please log in.", budget: null };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    console.log('Actualizando presupuesto:', id, data);

    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budgets/${id}`,
      data,
      {
        headers,
      }
    );

    console.log('Respuesta del servidor:', response.data);

    return { budget: response.data.budget || null, error: null };
  } catch (error: any) {
    console.error("Error updating budget:", error);

    // Capturar errores de autorización
    if (error.response?.status === 403) {
      return { error: "Unauthorized. Only administrators can update budgets.", budget: null };
    }

    // Capturar errores de validación
    if (error.response?.data?.errors) {
      const validationErrors = Object.values(error.response.data.errors).flat().join(', ');
      return { error: `Validation error: ${validationErrors}`, budget: null };
    }

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", budget: null };
    }

    return { error: "Error updating budget", budget: null };
  }
}

// Eliminar un budget existente
export async function deleteBudget(id: string) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "Authorization required. Please log in.", success: false };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    console.log('Eliminando presupuesto:', id);

    await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budgets/${id}`,
      {
        headers,
      }
    );

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error deleting budget:", error);

    // Capturar errores de autorización
    if (error.response?.status === 403) {
      return { error: "Unauthorized. Only administrators can delete budgets.", success: false };
    }

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", success: false };
    }

    return { error: "Error deleting budget", success: false };
  }
}

// Obtener todos los budget requests
export async function getBudgetRequests() {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "Authorization required. Please log in.", requests: [] };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    console.log("Fetching budget requests from:", `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budget-requests/all`);
    
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budget-requests/all?include=user,category,reviewer`,
      {
        headers,
      }
    );

    console.log("Budget requests API response structure:", {
      hasData: !!response.data,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      hasRequestsProperty: response.data && 'requests' in response.data,
      keys: response.data ? Object.keys(response.data) : []
    });
    
    if (response.data && response.data.requests && response.data.requests.length > 0) {
      const firstRequest = response.data.requests[0];
      console.log("First request structure:", {
        hasUserObject: !!firstRequest.user,
        userObjectType: typeof firstRequest.user,
        userKeys: firstRequest.user ? Object.keys(firstRequest.user) : [],
        userName: firstRequest.user ? firstRequest.user.name : 'No name property',
        userNameType: firstRequest.user ? typeof firstRequest.user.name : 'N/A',
        alternativeProperties: firstRequest.user ? {
          firstName: firstRequest.user.firstName || 'N/A',
          first_name: firstRequest.user.first_name || 'N/A',
          lastname: firstRequest.user.lastname || 'N/A',
          last_name: firstRequest.user.last_name || 'N/A',
          fullName: firstRequest.user.fullName || 'N/A',
          full_name: firstRequest.user.full_name || 'N/A',
          username: firstRequest.user.username || 'N/A',
          email: firstRequest.user.email || 'N/A'
        } : {}
      });
    }
    
    // Manejar diferentes formatos de respuesta del servidor
    let requestData = [];
    if (response.data && response.data.requests) {
      // Formato esperado: { requests: [...] }
      requestData = response.data.requests;
    } else if (Array.isArray(response.data)) {
      // Formato alternativo: directo array
      requestData = response.data;
    } else if (typeof response.data === 'object') {
      // Objeto con datos (posible paginación)
      const possibleDataField = 
        response.data.data || 
        response.data.items || 
        response.data.results || 
        response.data.budget_requests;
      
      requestData = Array.isArray(possibleDataField) ? possibleDataField : [];
    }
    
    console.log("Processed budget requests count:", requestData.length);
    
    // Asegurarse de que cada solicitud tenga información de usuario
    const processedRequests = requestData.map((request: any) => {
      // Crear una respuesta base con la información actual
      const processedRequest = { ...request };
      
      // Si no hay objeto user pero hay user_id, crear un objeto user temporal
      if (!processedRequest.user && processedRequest.user_id) {
        processedRequest.user = {
          name: `User ID: ${processedRequest.user_id}`,
          id: processedRequest.user_id
        };
      }

      // Si hay un objeto user pero no un campo name y tenemos acceso a otros campos
      if (processedRequest.user && !processedRequest.user.name) {
        const user = processedRequest.user;

        // Combinar posibles nombres
        if (user.firstName && user.lastName) {
          user.name = `${user.firstName} ${user.lastName}`;
        } else if (user.first_name && user.last_name) {
          user.name = `${user.first_name} ${user.last_name}`;
        } else if (user.firstName || user.first_name) {
          user.name = user.firstName || user.first_name;
        } else if (user.lastName || user.last_name) {
          user.name = user.lastName || user.last_name;
        } else if (user.email) {
          user.name = user.email;
        } else if (user.username) {
          user.name = user.username;
        } else {
          user.name = `User ID: ${processedRequest.user_id}`;
        }
      }
      
      return processedRequest;
    });
    
    console.log("Processed and enhanced requests:", processedRequests);
    
    return { requests: processedRequests, error: null };
  } catch (error: any) {
    console.error("Error fetching budget requests:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", requests: [] };
    }

    return { error: "Error fetching budget requests", requests: [] };
  }
}

// Crear un nuevo budget request
export async function createBudgetRequest(data: {
  category_id: string;
  requested_amount: number;
  description: string;
}) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "Authorization required. Please log in.", request: null };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    console.log('Sending budget request data to server:', data);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budget-requests/create`,
      data,
      {
        headers,
      }
    );

    console.log('Server response:', response.data);

    return { request: response.data.request || null, error: null };
  } catch (error: any) {
    console.error("Error creating budget request:", error);

    // Capturar errores de validación
    if (error.response?.data?.errors) {
      const validationErrors = Object.values(error.response.data.errors).flat().join(', ');
      return { error: `Validation error: ${validationErrors}`, request: null };
    }

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", request: null };
    }

    return { error: error.response?.data?.message || "Error creating budget request", request: null };
  }
}

// Aprobar un budget request
export async function approveBudgetRequest(id: string) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "No authentication token found", request: null };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budget-requests/${id}/approve`,
      {},
      {
        headers,
      }
    );

    // Si hay un error en la respuesta relacionado con el presupuesto
    if (response.data.error) {
      return { 
        error: response.data.error, 
        request: null,
        budgetInfo: {
          requested: response.data.requested,
          available: response.data.available,
          budget_type: response.data.budget_type,
          department: response.data.department
        }
      };
    }

    return { request: response.data, error: null };
  } catch (error: any) {
    console.error("Error approving budget request:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", request: null };
    }

    // Si el error viene del servidor y contiene información del presupuesto
    if (error.response?.data) {
      return {
        error: error.response.data.error,
        request: null,
        budgetInfo: {
          requested: error.response.data.requested,
          available: error.response.data.available,
          budget_type: error.response.data.budget_type,
          department: error.response.data.department
        }
      };
    }

    return { error: "Error approving budget request", request: null };
  }
}

// Rechazar un budget request
export async function rejectBudgetRequest(id: string) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "No authentication token found", request: null };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budget-requests/${id}/reject`,
      {},
      {
        headers,
      }
    );

    return { request: response.data, error: null };
  } catch (error: any) {
    console.error("Error rejecting budget request:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", request: null };
    }

    return { error: "Error rejecting budget request", request: null };
  }
}

// Actualizar una solicitud de presupuesto
export async function updateBudgetRequest(id: string, data: {
  category_id?: string;
  requested_amount?: number;
  description?: string;
  status?: string;
}) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "Authorization required. Please log in.", request: null };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    console.log('Updating budget request:', id, data);

    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budget-requests/${id}`,
      data,
      {
        headers,
      }
    );

    console.log('Server response:', response.data);

    return { request: response.data.request || null, error: null };
  } catch (error: any) {
    console.error("Error updating budget request:", error);

    // Capture validation errors
    if (error.response?.data?.errors) {
      const validationErrors = Object.values(error.response.data.errors).flat().join(', ');
      return { error: `Validation error: ${validationErrors}`, request: null };
    }

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", request: null };
    }

    return { error: error.response?.data?.message || "Error updating budget request", request: null };
  }
}

// Eliminar una solicitud de presupuesto
export async function deleteBudgetRequest(id: string) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "Authorization required. Please log in.", success: false };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    console.log('Deleting budget request:', id);

    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budget-requests/${id}`,
      {
        headers,
      }
    );

    console.log('Server response:', response.data);

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error deleting budget request:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", success: false };
    }

    return { error: error.response?.data?.message || "Error deleting budget request", success: false };
  }
}

// Obtener todas las categorías
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

    // Asegurémonos de que estamos accediendo a la propiedad correcta
    return { categories: response.data || [], error: null };
  } catch (error: any) {
    console.error("Error fetching categories:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", categories: [] };
    }

    return { error: "Error fetching categories", categories: [] };
  }
}

// Crear una nueva categoría
export async function createCategory(data: {
  category_name: string;
  category_type: string;
  department_id?: number;
}) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "Authorization required. Please log in.", category: null };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    console.log('Creating new category:', data);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories/create`,
      data,
      {
        headers,
      }
    );

    console.log('Server response:', response.data);

    return { category: response.data.category || null, error: null };
  } catch (error: any) {
    console.error("Error creating category:", error);

    // Capturar errores de autorización
    if (error.response?.status === 403) {
      return { error: "Unauthorized. Only administrators can create categories.", category: null };
    }

    // Capturar errores de validación
    if (error.response?.data?.errors) {
      const validationErrors = Object.values(error.response.data.errors).flat().join(', ');
      return { error: `Validation error: ${validationErrors}`, category: null };
    }

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", category: null };
    }

    return { error: "Error creating category", category: null };
  }
}

// Obtener departamentos
export async function getDepartments() {
  try {
    const token = (await cookies()).get('access_token')?.value;

    if (!token) {
      return { departments: [], error: 'Authorization required' };
    }

    const headers = {
      Authorization: `Bearer ${token}`
    };

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/all`,
      { headers }
    );

    return { departments: response.data, error: null };
  } catch (error: any) {
    console.error('Error fetching departments:', error);
    
    if (error.code === 'ECONNREFUSED' || error.response?.status === 429) {
      return { departments: [], error: 'Error connecting to the server' };
    }

    return { departments: [], error: 'Error fetching departments' };
  }
}