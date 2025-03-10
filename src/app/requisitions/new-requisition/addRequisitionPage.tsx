"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Car, Save } from "lucide-react";

import { addRequisition } from "@/app/requisitions/actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { emmiter } from "@/lib/emmiter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

export default function AddRequisition() {
  const [state, setState] = useState<any>(null);
  const [items, setItems] = useState([
    { name: "", description: "", quantity: 0, price: 0 },
  ]);
  const router = useRouter();

  const handleAddRequisition = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await addRequisition(state, formData);
    if (!result.errors) {
      emmiter.emit("showToast", {
        message: "Requisition added successfully",
        type: "success",
      });
      router.push("/requisitions");
    }
    setState(result);
  };

  const addItem = () => {
    setItems([...items, { name: "", description: "", quantity: 0, price: 0 }]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  return (
    <>
      <div className="flex items-center mb-6">
        <Link href="/requisitions" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">New requisition of purchase</h1>
      </div>

      <form onSubmit={handleAddRequisition} className="space-y-6">
        {state?.errors?.server && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.errors.server}</AlertDescription>
          </Alert>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="text-black">General Information</CardTitle>
            <CardDescription className="text-gray-500">
              Fill in the information of the requisition
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-black">
                Title
              </Label>
              <Input
                type="text"
                id="title"
                name="title"
                placeholder="Ej: Purchase of office supplies"
                className="text-black"
              />
              {state?.errors?.title && (
                <p className="text-sm text-red-500">{state.errors.title}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Justification (ocupa 2 columnas en pantallas medianas y grandes) */}
              <div className="md:col-span-2">
                <Label htmlFor="justification" className="text-black">
                  Justification
                </Label>
                <Textarea
                  id="justification"
                  name="justification"
                  placeholder="Explain why the purchase is necessary and how it will be beneficial"
                  className="text-black min-h-[100px] w-full"
                />
                {state?.errors?.justification && (
                  <p className="text-sm text-red-500">
                    {state.errors.justification}
                  </p>
                )}
              </div>

              {/* Priority (ocupa una columna en pantallas medianas y grandes) */}
              <div>
                <Label htmlFor="priority" className="text-black">
                  Priority
                </Label>
                <Select name="priority">
                  <SelectTrigger className="w-full text-black">
                    <SelectValue placeholder="Select a priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                {state?.errors?.priority && (
                  <p className="text-sm text-red-500">
                    {state.errors.priority}
                  </p>
                )}
                <Label htmlFor="requested_date" className="text-black">
                  Requested date
                </Label>
                <Input
                  type="date"
                  id="requested_date"
                  name="requested_date"
                  className="text-black w-full"
                />
                {state?.errors?.requested_date && (
                  <p className="text-sm text-red-500">
                    {state.errors.requested_date}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-black">Requested Articles</CardTitle>
            <CardDescription className="text-gray-500">
              Add the articles that you want request.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 p-4 border rounded-lg"
              >
                <div className="md:col-span-3">
                  <Label htmlFor="article_name" className="text-black">
                    Article Name
                  </Label>
                  <Input
                    type="text"
                    id="article_name"
                    name="article_name"
                    placeholder="Ej: Laptop Dell Inspiron 15"
                    value={item.name}
                    onChange={(e) => updateItem(index, "name", e.target.value)}
                    className="text-black"
                  />
                </div>
                <div className="md:col-span-4">
                  <Label htmlFor="description" className="text-black">
                    Description
                  </Label>
                  <Input
                    type="text"
                    id="description"
                    name="description"
                    placeholder="Ej: 16GB RAM, 1TB SSD, 15.6 inches"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                    className="text-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="quantity" className="text-black">
                    Quantity
                  </Label>
                  <Input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "quantity",
                        Number.parseInt(e.target.value) || 1
                      )
                    }
                    className="text-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="price" className="text-black">
                    Price
                  </Label>
                  <Input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "price",
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                    className="text-black"
                  />
                </div>
                <div className="md:col-span-1 flex items-end justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center mt-4">
              <Button type="button" className="bg-primary hover:bg-primary-light text-white" onClick={addItem}>
                Add article
              </Button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Estimated total:</p>
                <p className="text-xl font-bold">
                  ${calculateTotal().toFixed(2)}
                </p>{" "}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="bg-primary hover:bg-primary-light text-white"
      disabled={pending}
    >
      {pending ? (
        <div className="flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span className="ml-2">Creating...</span>
        </div>
      ) : (
        "Add Requisition"
      )}
    </Button>
  );
}
