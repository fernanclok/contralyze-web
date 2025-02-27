"use server";
import axios from "axios";
import { cookies } from "next/headers";
import { z } from "zod";

// COMPANY ACTIONS

export async function getCompanyInfo() {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "No authentication token found", company: {} };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/companies/company/info`,
      {
        headers,
      }
    );

    return { company: response.data, error: null };
  } catch (error: any) {
    console.error("Error fetching company info:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", company: {} };
    }

    return { error: "Error fetching company info", company: {} };
  }
}

// USER ACTIONS

export async function getUsers() {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "No authentication token found", users: [] };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/all`,
      {
        headers,
      }
    );

    return { users: response.data, error: null };
  } catch (error: any) {
    console.error("Error fetching users:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", users: [] };
    }

    return { error: "Error fetching users", users: [] };
  }
}

const userSchema = z
  .object({
    first_name: z
      .string()
      .min(2, { message: "First name must be at least 2 characters" })
      .trim(),
    last_name: z
      .string()
      .min(2, { message: "Last name must be at least 2 characters" })
      .trim(),
    email: z.string().email({ message: "Invalid email address" }).trim(),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .trim(),
    confirm_password: z.string().trim(),
    role: z.enum(["admin", "user"]),
    department_id: z.string().min(1, { message: "Department is required" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type UserResult = {
  errors?: {
    first_name?: string[];
    last_name?: string[];
    email?: string[];
    password?: string[];
    confirm_password?: string[];
    role?: string[];
    department_id?: string[];
    server?: string;
  };
  user?: any;
};

export async function addUser(
  prevState: any,
  formData: FormData
): Promise<UserResult> {
  const result = userSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { first_name, last_name, email, password, role, department_id } =
    result.data;

  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return {
        errors: {
          server: "No authentication token found, please log in again",
        },
      };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/create`,
      {
        first_name,
        last_name,
        email,
        password,
        role,
        department_id,
      },
      {
        headers,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error adding user:", error);

    if (error.response && error.response.status === 422) {
      return {
        errors: error.response.data.errors, // El backend ya envía los errores en este formato
      };
    }

    return {
      errors: {
        server: "Error adding user, please try again",
      },
    };
  }
}

const editUserSchema = z
  .object({
    first_name: z
      .string()
      .min(2, { message: "First name must be at least 2 characters" })
      .trim(),
    last_name: z
      .string()
      .min(2, { message: "Last name must be at least 2 characters" })
      .trim(),
    email: z.string().email({ message: "Invalid email address" }).trim(),
    role: z.enum(["admin", "user"]),
    status: z.enum(["active", "inactive"]),
    department_id: z.string().min(1, { message: "Department is required" }),
    new_password: z.string().optional(),
  })
  .refine((data) => !data.new_password || data.new_password.length >= 6, {
    message: "Password must be at least 6 characters",
    path: ["new_password"],
  });

export async function editUser(prevState: any, formData: FormData) {
  const result = editUserSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { first_name, last_name, email, role, status, department_id, new_password } = result.data;
  const userId = formData.get("user_id") as string;

  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return {
        errors: {
          server: "No authentication token found, please log in again",
        },
      };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/update/${userId}`,
      {
        first_name,
        last_name,
        email,
        role,
        status,
        department_id,
        ...(new_password && { password: new_password }),
      },
      {
        headers,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error editing user:", error);

    if (error.response && error.response.status === 422) {
      return {
        errors: error.response.data.errors,
      };
    }

    return {
      errors: {
        server: "Error editing user, please try again",
      },
    };
  }
}

export async function deleteUser(prevState: any, userId: string) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "No authentication token found" };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };
    
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/delete/${userId}`,
      {
        headers,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Error deleting user" };
  }
}

// DEPARTMENT ACTIONS

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

    return { departments: response.data, error: null };
  } catch (error: any) {
    console.error("Error fetching departments:", error);

    if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      return { error: "Error connecting to the server", departments: [] };
    }

    return { error: "Error fetching departments", departments: [] };
  }
}

const DepartmentSchema = z.object({
  department_name: z.string().nonempty("Department name is required"),
  department_description: z
    .string()
    .nonempty("Department description is required"),
});

type AddDepartmentResult = {
  errors?: {
    department_name?: string[];
    department_description?: string[];
    server?: string;
  };
};

export async function addDepartment(
  prevState: any,
  formData: FormData
): Promise<AddDepartmentResult> {
  const result = DepartmentSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { department_name, department_description } = result.data;

  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return {
        errors: {
          server: "No authentication token found, please log in again",
        },
      };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/create`,
      {
        department_name,
        department_description,
      },
      {
        headers,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error adding department:", error);
    return {
      errors: {
        server: "Error adding department, please try again",
      },
    };
  }
}

export async function deleteDepartment(prevState: any, departmentId: string) {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return { error: "No authentication token found" };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/delete/${departmentId}`,
      {
        headers,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting department:", error);
    return { error: "Error deleting department" };
  }
}

export async function editDepartment(prevState: any, formData: FormData) {
  const result = DepartmentSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { department_name, department_description } = result.data;
  const departmentId = formData.get("department_id") as string;

  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return {
        errors: {
          server: "No authentication token found, please log in again",
        },
      };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/update/${departmentId}`,
      {
        department_name,
        department_description,
      },
      {
        headers,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error editing department:", error);
    return {
      errors: {
        server: "Error editing department, please try again",
      },
    };
  }
}
