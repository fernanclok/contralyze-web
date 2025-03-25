export interface Category {
  id: string;
  name: string;
  description?: string;
  department_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetRequest {
  id: string;
  user_id: string;
  category_id: string;
  requested_amount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  request_date: string;
  reviewed_by?: string;
  category?: Category;
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  created_at?: string;
  updated_at?: string;
}
