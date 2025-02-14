"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { signUp } from "./actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EyeIcon, EyeOffIcon, AlertCircle } from "lucide-react";

export default function SignUpForm() {
  const [state, signUpAction] = useActionState(signUp, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={signUpAction} className="space-y-6">
      {/* Muestra el mensaje de error general */}
      {state?.errors?.server && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {state.errors.server}
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="first_name">First Name</Label>
        <Input
          id="first_name"
          name="first_name"
          placeholder="John"
          type="text"
          autoCapitalize="words"
          autoComplete="given-name"
          autoCorrect="off"
          className="border-gray-200 focus:border-primary focus:ring-primary"
        />
        {state?.errors?.first_name && (
          <p className="text-red-500">{state.errors.first_name}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="last_name">Last Name</Label>
        <Input
          id="last_name"
          name="last_name"
          placeholder="Doe"
          type="text"
          autoCapitalize="words"
          autoComplete="family-name"
          autoCorrect="off"
          className="border-gray-200 focus:border-primary focus:ring-primary"
        />
        {state?.errors?.last_name && (
          <p className="text-red-500">{state.errors.last_name}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          placeholder="name@company.com"
          type="email"
          autoCapitalize="none"
          className="border-gray-200 focus:border-primary focus:ring-primary"
        />
        {state?.errors?.email && (
          <p className="text-red-500">{state.errors.email}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className="border-gray-200 focus:border-primary focus:ring-primary pr-10"
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
          <p className="text-red-500">{state.errors.password}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm_password">Confirm Password</Label>
        <Input
          id="confirm_password"
          name="confirm_password"
          type="password"
          className="border-gray-200 focus:border-primary focus:ring-primary"
        />
        {state?.errors?.confirm_password && (
          <p className="text-red-500">{state.errors.confirm_password}</p>
        )}
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full bg-primary hover:bg-primary-light text-white"
      disabled={pending}
    >
      {pending ? (
        <div className="flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span className="ml-2">Creating account...</span>
        </div>
      ) : (
        "Create Account"
      )}
    </Button>
  );
}