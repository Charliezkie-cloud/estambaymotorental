import { AdminLoginForm } from "@/components/layouts/admin-login-form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/public/favicon.jpg";
import Image from "next/image";

export default function AdminLoginPage() {
  return (
    <main className="min-h-svh flex flex-col items-center justify-center p-4 sm:p-6 bg-background relative overflow-hidden">
      {/* Ambient background theme tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-background to-background pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Branding header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Image src={Logo} alt={"Estambay Moto Rentals Logo"} height={64} width={64} loading="lazy" className="rounded-full" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Estambay Moto Rentals
          </h1>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Admin Portal
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="space-y-1.5 text-center pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">
              Sign in to your account
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Enter your email and password to access the admin dashboard
            </CardDescription>
          </CardHeader>

          <AdminLoginForm />
        </Card>

        {/* Footer info */}
        <p className="text-center text-xs text-muted-foreground">
          Authorized personnel only
        </p>
      </div>
    </main>
  );
}
