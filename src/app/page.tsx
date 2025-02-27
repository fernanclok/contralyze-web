import LoginForm from "./login/login-form"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-primary via-primary-light to-primary-lighter flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <Link href="/" className="inline-flex items-center space-x-2">
          <Image src="/img/Contralyze.png" alt="Contralyze Logo" width={100} height={100} className="text-white" />
            <span className="text-3xl font-bold text-white">Contralyze</span>
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-8 text-gray-900">Welcome back</h1>
          <LoginForm />
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Don&apos;t have an account? </span>
            <Link href="/sign-up" className="text-primary hover:text-primary-light font-semibold hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

