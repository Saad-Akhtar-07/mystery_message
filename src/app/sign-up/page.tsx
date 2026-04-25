import { SignUpForm } from "@/app/sign-up/sign-up-form";

export default function SignUpPage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-zinc-100 p-8 space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-zinc-900">Create Account</h1>
            <p className="text-sm text-zinc-600">
              Join Mystery Message and start sharing anonymous messages today
            </p>
          </div>

          {/* Form */}
          <SignUpForm />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-zinc-500">or</span>
            </div>
          </div>

          {/* Social/Additional Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-xs text-zinc-600 text-center">
              💡 By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Footer Trust Signal */}
 
      </div>
    </main>
  );
}
