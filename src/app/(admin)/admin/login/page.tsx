import AdminLoginForm from "@/components/layouts/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="py-12 md:py-24">

      <section className="max-w-3xl mx-4 md:mx-auto py-12 md:py-0">
        <div className="bg-card p-6 md:p-12 rounded-md space-y-6">
          <h1 className="text-2xl md:text-4xl font-bold text-center">
            <span className="text-primary">Estambay</span> Moto Rental{" "}<br/>
            <span className="opacity-50 text-xl">Admin Panel</span>
          </h1>

          <AdminLoginForm />
        </div>
      </section>

    </main>
  );
}