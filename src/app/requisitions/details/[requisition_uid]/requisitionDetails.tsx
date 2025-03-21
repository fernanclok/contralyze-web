"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Download,
  Edit,
  FileText,
  Package,
  ShoppingCart,
  User,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { RejectRequisitionSheet } from "./rejectRequisitionSheet";
import { approveRequisition } from "@/app/requisitions/actions";

export default function RequisitionDetails({
  requisition,
  user,
  hasError,
}: {
  requisition: any;
  user: any;
  hasError: boolean;
}) {
  const params = useParams();
  const router = useRouter();
  const id = params.requisition_uid;

  const requisitionData = requisition.find(
    (req: any) => req.requisition_uid === id
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApproveRequisition = async () => {
    setLoading(true);
    setError(null);
    const result = await approveRequisition(requisitionData.id);
    setLoading(false);

    if (result.errors) {
      setError(result.errors);
    } else {
      router.refresh();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
      case "in checkout":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "medium":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100";
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    return date.toLocaleDateString("en-CA", options).replace(/\//g, "-");
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  

  return (
    <>
      <div className="flex items-center mb-6">
        <Link href="/requisitions?tab=list" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Requisition Details</h1>
      </div>

      {hasError && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <p className="font-medium">Connection Error</p>
            <p className="text-sm">
                Could not connect to the server.
                All creation and editing actions have been disabled.
              </p>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>error approving requisition</AlertDescription>
        </Alert>
      )}

      <div ref={contentRef}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-black">
                      {requisitionData.title}
                    </CardTitle>
                    <CardDescription className="text-black">
                      ID: {requisitionData.requisition_uid}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(requisitionData.status)}>
                    {requisitionData.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-black">
                      <User className="h-4 w-4 mr-2" />
                      <span>Requester:</span>
                    </div>
                    <span className="text-gray-500">
                      {requisitionData.created_by.first_name}{" "}
                      {requisitionData.created_by.last_name}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-black">
                      <Package className="h-4 w-4 mr-2" />
                      <span>Department:</span>
                    </div>
                    <span className="text-gray-500">
                      {requisitionData.department.name}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-black">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Request Date:</span>
                    </div>
                    <span className="text-gray-500">
                      {requisitionData.request_date}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-black">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Priority:</span>
                    </div>
                    <Badge className={getPriorityColor(requisitionData.priority)}>
                      {requisitionData.priority}
                    </Badge>
                  </div>
                  {requisitionData.reviewed_by && (
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-black">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>
                          {requisitionData.status === "Approved"
                            ? "Approved by:"
                            : "Rejected by:"}
                        </span>
                      </div>
                      <span className="text-gray-500">
                        {requisitionData.reviewed_by.first_name}{" "}
                        {requisitionData.reviewed_by.last_name} on{" "}
                        {formatDate(requisitionData.updated_at)}
                      </span>
                    </div>
                  )}
                  {requisitionData.rejection_reason && (
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-black">
                        <XCircle className="h-4 w-4 mr-2" />
                        <span>Rejection Reason:</span>
                      </div>
                      <span className="text-gray-500">
                        {requisitionData.rejection_reason}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1 pt-2">
                  <h3 className="text-sm font-medium text-black">
                    Justification
                  </h3>
                  <p className="text-sm text-gray-500">
                    {requisitionData.justification}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="w-full">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-black">Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.isArray(requisitionData.items) ? (
                      requisitionData.items.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg"
                        >
                          <div className="md:col-span-4">
                            <h4 className="font-medium text-black">
                              {item.product_name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {item.product_description}
                            </p>
                          </div>
                          <div className="md:col-span-2 flex flex-col">
                            <span className="text-black">Quantity</span>
                            <span className="text-gray-500">{item.quantity}</span>
                          </div>
                          <div className="md:col-span-3 flex flex-col">
                            <span className="text-black">Price</span>
                            <span className="text-gray-500">
                              {item.price.toFixed(2)}
                            </span>
                          </div>
                          <div className="md:col-span-3 flex flex-col">
                            <span className="text-black">Subtotal</span>
                            <span className="text-gray-500">
                              {(item.quantity * item.price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                        <p>No items found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="print:hidden">
              <CardHeader>
                <CardTitle className="text-lg text-black">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {requisitionData.status === "Pending" && (
                  <>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={handleApproveRequisition}
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {loading ? "Approving..." : "Approve Requisition"}
                    </Button>
                    <RejectRequisitionSheet id={requisitionData.id} />
                  </>
                )}

                <Button variant="outline" className="w-full" onClick={() => reactToPrintFn()}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                {requisitionData.status === "Pending" && (
                  <Link href={`/requisitions/details/${requisitionData.requisition_uid}/edit`}>
                    <Button variant="outline" className="w-full mt-4">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Requisition
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-black">Resume</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-black">ID:</span>
                  <span className="text-gray-500">
                    {requisitionData.requisition_uid}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Status:</span>
                  <Badge className={getStatusColor(requisitionData.status)}>
                    {requisitionData.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Created Date:</span>
                  <span className="text-gray-500">
                    {formatDate(requisitionData.created_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Request Date:</span>
                  <span className="text-gray-500">
                    {requisitionData.request_date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Total Items:</span>
                  <span className="text-gray-500">
                    {requisitionData.items.length}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t mt-2">
                  <span className="font-medium text-black">Total:</span>
                  <span className="font-bold text-gray-500">
                    {requisitionData.total_amount}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}