"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { signUp } from "./actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EyeIcon, EyeOffIcon, AlertCircle } from "lucide-react";

export default function MultiStepSignUpForm() {
  const [step, setStep] = useState(1);
  const [state, signUpAction] = useActionState(signUp, undefined);
  const [showPassword, setShowPassword] = useState(false);

  // Estado para almacenar los datos del primer paso
  const [companyData, setCompanyData] = useState({
    company_name: "",
    company_email: "",
    company_phone: "",
    company_address: "",
    company_city: "",
    company_state: "",
    company_zip: "",
    company_size: "",
  });

  // Manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyData({
      ...companyData,
      [e.target.name]: e.target.value,
    });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="max-w-md mx-auto p-3">
      {step === 1 && (
        <form className="space-y-6">
          <h2 className="text-xl font-semibold">Company Information</h2>
          <div className="space-y-2">
            <Label htmlFor="company_name">Name</Label>
            <Input
              id="company_name"
              name="company_name"
              placeholder="Company Name"
              type="text"
              value={companyData.company_name}
              onChange={handleChange}
            />
            {state?.errors?.company_name && (
              <p className="text-red-500 text-sm">
                {state.errors.company_name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_email">Email</Label>
            <Input
              id="company_email"
              name="company_email"
              placeholder="Company Email"
              type="email"
              value={companyData.company_email}
              onChange={handleChange}
            />
            {state?.errors?.company_email && (
              <p className="text-red-500 text-sm">
                {state.errors.company_email}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_phone">Phone</Label>
            <Input
              id="company_phone"
              name="company_phone"
              placeholder="Company Phone"
              type="tel"
              value={companyData.company_phone}
              onChange={handleChange}
            />
            {state?.errors?.company_phone && (
              <p className="text-red-500 text-sm">
                {state.errors.company_phone}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_address">Address</Label>
            <Input
              id="company_address"
              name="company_address"
              placeholder="Company Address"
              type="text"
              value={companyData.company_address}
              onChange={handleChange}
            />
            {state?.errors?.company_address && (
              <p className="text-red-500 text-sm">
                {state.errors.company_address}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_city">City</Label>
            <Input
              id="company_city"
              name="company_city"
              placeholder="Company City"
              type="text"
              value={companyData.company_city}
              onChange={handleChange}
            />
            {state?.errors?.company_city && (
              <p className="text-red-500 text-sm">
                {state.errors.company_city}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_state">State</Label>
            <Input
              id="company_state"
              name="company_state"
              placeholder="Company State"
              type="text"
              value={companyData.company_state}
              onChange={handleChange}
            />
            {state?.errors?.company_state && (
              <p className="text-red-500 text-sm">
                {state.errors.company_state}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_zip">Zip</Label>
            <Input
              id="company_zip"
              name="company_zip"
              placeholder="Company Zip"
              type="text"
              value={companyData.company_zip}
              onChange={handleChange}
            />
            {state?.errors?.company_zip && (
              <p className="text-red-500 text-sm">{state.errors.company_zip}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_size">Company size</Label>
            <Input
              id="company_size"
              name="company_size"
              placeholder="e.g. 1-10 employees"
              type="text"
              value={companyData.company_size}
              onChange={handleChange}
            />
            {state?.errors?.company_size && (
              <p className="text-red-500 text-sm">
                {state.errors.company_size}
              </p>
            )}
          </div>
          <Button
            type="button"
            onClick={nextStep}
            className="w-full bg-primary text-white"
          >
            Next
          </Button>
        </form>
      )}

      {step === 2 && (
        <form
          action={async (formData) => {
            // Agregar datos del primer paso al formData antes de enviarlo
            Object.entries(companyData).forEach(([key, value]) => {
              formData.append(key, value);
            });

            await signUpAction(formData);
          }}
          className="space-y-6"
        >
          <h2 className="text-xl font-semibold">User Information</h2>
          {state?.errors?.server && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.errors.server}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              name="first_name"
              placeholder="John"
              type="text"
            />
            {state?.errors?.first_name && (
              <p className="text-red-500 text-sm">{state.errors.first_name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              placeholder="Doe"
              type="text"
            />
            {state?.errors?.last_name && (
              <p className="text-red-500 text-sm">{state.errors.last_name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="name@company.com"
              type="email"
            />
            {state?.errors?.email && (
              <p className="text-red-500 text-sm">{state.errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeIcon className="h-5 w-5" />
                ) : (
                  <EyeOffIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {state?.errors?.password && (
              <p className="text-red-500 text-sm">{state.errors.password}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
            />
            {state?.errors?.confirm_password && (
              <p className="text-red-500 text-sm">
                {state.errors.confirm_password}
              </p>
            )}
          </div>
          <div className="flex justify-between">
            <Button
              type="button"
              onClick={prevStep}
              className="bg-primary text-white"
            >
              Back
            </Button>
          </div>
          <SubmitButton />
        </form>
      )}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className=" w-full bg-primary text-white"
      disabled={pending}
    >
      {pending ? "Creating account..." : "Create Account"}
    </Button>
  );
}
