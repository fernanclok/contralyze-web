import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";
import { getUsers } from "@/app/manage-users/actions";

export default async function ManageUserPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  const userRole = session?.role || "user";
  const userName = session ? `${session.userFirstName} ${session.userLastName}`.trim() : "Guest";

 const users = await getUsers();

  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
    <h1 className="text-2xl font-bold mb-2">Manage users</h1>
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3">ID</th>
            <th scope="col" className="px-6 py-3">Name</th>
            <th scope="col" className="px-6 py-3">Email</th>
            <th scope="col" className="px-6 py-3">Role</th>
            <th scope="col" className="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user: any) => (
              <tr key={user.id} className="border-b border-gray-200 odd:bg-white even:bg-gray-50">
                <td className="px-6 py-4">{user.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {user.first_name} {user.last_name}
                </td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4">
                  <a
                    href="#"
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  >
                    Edit
                  </a>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </AuthenticatedLayout>
);
}
