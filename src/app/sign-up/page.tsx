import SignUpForm from "./signUp-form";
import Image from "next/image";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-primary via-primary-light to-primary-lighter flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <Link href="/" className="inline-flex items-center">
          <Image src="/img/Contralyze.png" alt="Contralyze Logo" width={100} height={100} className="text-white" />
          <span className="text-3xl font-bold text-white">Centralyze</span>
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-8 text-gray-900">Create an account</h1>
          <SignUpForm />
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link
              href="/"
              className="text-primary hover:text-primary-light font-semibold hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
