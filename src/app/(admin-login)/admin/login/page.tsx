import AdminLoginForm from "@/components/layouts/admin-login-form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLoginPage() {
  return (
    <main className="py-12 md:py-24">

      <section className="max-w-xl mx-4 sm:mx-auto py-12 md:py-0">
        <Card>
          <CardHeader>
            <CardTitle>Login into your Admin Account</CardTitle>
            <CardDescription>Enter your email below to login to your account</CardDescription>
          </CardHeader>

          <AdminLoginForm />
        </Card>
      </section>

    </main>
  );
}