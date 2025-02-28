import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";

export default async function ClientPage({ children }: { children: React.ReactNode }) {
  let session;

  try {
    session = await getSession();
  } catch (error) {
    console.error("Error fetching session:", error);
    session = null;
  }

  const userRole = session?.role || "user";
  const userName = session? `${session.userFirstName} ${session.userLastName}`.trim() : "Guest";
  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
      <h1 className="text-2xl font-bold mb-4">Bienvenido al clients</h1>
      
      <div className="w-full flex justify-between items-center mb-4">
                  <input
                    type="text"
                    placeholder="Search clients"
                    className="w-1/3 px-2 py-2 text-sm text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring focus:ring-primary"
                  />
                    <button className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg">
                        Search
                    </button>
                </div>
    </AuthenticatedLayout>
  );
}
