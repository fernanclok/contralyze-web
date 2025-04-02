import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    const { id } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Get invoice details from backend
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${id}`,
      { headers }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching invoice' },
      { status: error.response?.status || 500 }
    );
  }
}
