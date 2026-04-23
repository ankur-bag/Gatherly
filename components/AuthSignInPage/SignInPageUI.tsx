import { SignIn } from '@clerk/nextjs'

export function SignInPageUI() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <SignIn forceRedirectUrl="/dashboard" />
    </main>
  )
}