import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  const session = await getSession();

  const userRole = session?.role || "user";
  const userName = session? `${session.userFirstName} ${session.userLastName}`.trim() : "Guest";
  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
      <h1 className="text-2xl font-bold">Bienvenido al transactions</h1>
      <p>Esta es la página principal del transactions.</p>
    </AuthenticatedLayout>
  );
}
