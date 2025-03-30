import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    const { id } = await Promise.resolve(context.params);

    if (!token) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // First get invoice details to get the file URL
    const invoiceResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${id}`,
      { headers }
    );

    const invoiceData = invoiceResponse.data?.data || invoiceResponse.data;
    if (!invoiceData) {
      return NextResponse.json(
        { error: "No invoice data received" },
        { status: 404 }
      );
    }

    // Get file URL from invoice data
    const fileUrl = invoiceData.file_url || invoiceData.file_path || invoiceData.url;
    if (!fileUrl) {
      return NextResponse.json(
        { error: "No file URL found for this invoice" },
        { status: 404 }
      );
    }

    // Try to get file directly from Laravel storage endpoint
    try {
      const fileResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${id}/download`,
        { 
          headers,
          responseType: 'arraybuffer'
        }
      );

      // Get content type from response
      const contentType = fileResponse.headers['content-type'] || 'application/octet-stream';

      // Return the file with proper headers
      return new NextResponse(fileResponse.data, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="invoice-${id}"`,
        },
      });
    } catch (storageError) {
      console.error('Error getting file from storage, trying direct URL:', storageError);

      // If storage endpoint fails, try the direct URL as fallback
      const fullFileUrl = fileUrl.startsWith('http') 
        ? fileUrl 
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}${fileUrl}`;

      const fileResponse = await axios.get(fullFileUrl, { 
        headers,
        responseType: 'arraybuffer'
      });

      // Get content type from response
      const contentType = fileResponse.headers['content-type'] || 'application/octet-stream';

      // Return the file with proper headers
      return new NextResponse(fileResponse.data, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="invoice-${id}"`,
        },
      });
    }
  } catch (error: any) {
    console.error('Error fetching invoice file:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching invoice file' },
      { status: error.response?.status || 500 }
    );
  }
}
