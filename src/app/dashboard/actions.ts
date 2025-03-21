"use server";
import axios from "axios";
import { cookies } from "next/headers";


export async function getBudgets() {
    try {
      const token = (await cookies()).get("access_token")?.value;
  
      if (!token) {
        return { error: "No authentication token found", company: {} };
      }
  
      const headers = {
        Authorization: `Bearer ${token}`,
      };
  
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budgets/all/statistics`,
        {
          headers,
        }
      );
  
      return { budgets: response.data, error: null };
    } catch (error: any) {
      console.error("Error fetching budget info:", error);
  
      if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
        return { error: "Error connecting to the server", Budgets: {} };
      }
  
      return { error: "Error fetching budget info", Budgets: {} };
    }
  }

  export async function getTypeChange(type: string) {
    try {
      const token = (await cookies()).get("access_token")?.value;
  
      if (!token) {
        return { error: "No authentication token found", company: {} };
      }
  
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${process.env.NEXT_EXCHANGE_API_KEY}/latest/${type}`
      );
  
      return { exchange: response.data, error: null };
    } catch (error: any) {
      console.error("Error fetching changetipe info:", error);
  
      if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
        return { error: "Error connecting to the server", Budgets: {} };
      }
  
      return { error: "Error fetching change info", Budgets: {} };
    }
  }


  export async function getInfoperCards() {
    try {
      const token = (await cookies()).get("access_token")?.value;
  
      if (!token) {
        return { error: "No authentication token found", company: {} };
      }
  
      const headers = {
        Authorization: `Bearer ${token}`,
      };
  
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budgets/all/info-cards`,
        {
          headers,
        }
      );
  
      return { info: response.data, error: null };
    } catch (error: any) {
      console.error("Error fetching info cards:", error);
  
      if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
        return { error: "Error connecting to the server", Budgets: {} };
      }
  
      return { error: "Error fetching info cards", Budgets: {} };
  }
  }
