"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { logout } from "./actions";
import Icon from "@mdi/react";
import { mdiViewDashboard, mdiAccountBoxMultiple, mdiTruck, mdiArchiveOutline, mdiFileDocumentOutline, mdiCashMultiple } from "@mdi/js";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  userRole: string;
  userName: string;
}

const getInitials = (fullname: string) => {
  const names = fullname.split(" ");
  const firstInitial = names[0].charAt(0).toUpperCase() || "";
  const lastInitial =
    names.length > 1 ? names[names.length - 1].charAt(0).toUpperCase() : "";
  return firstInitial + lastInitial;
};

const menuItems: {
  [key in "admin" | "user"]: { path: string; label: string; icon: string }[];
} = {
  admin: [
    { path: "/dashboard", label: "Dashboard", icon: mdiViewDashboard },
    { path: "/transactions", label: "Transactions", icon: mdiArchiveOutline },
    { path: "/requisitions", label: "Requisitions", icon: mdiFileDocumentOutline },
    { path: "/dashboard/budgets", label: "Budgets", icon: mdiCashMultiple },
    { path: "/clients", label: "Clients", icon: mdiAccountBoxMultiple },
    { path: "/suppliers", label: "Suppliers", icon: mdiTruck },
  ],
  user: [
    { path: "/dashboard", label: "Dashboard", icon: mdiViewDashboard },
    { path: "/transactions", label: "Transactions", icon: mdiArchiveOutline },
    { path: "/requisitions", label: "Requisitions", icon: mdiFileDocumentOutline },
    { path: "/dashboard/budgets", label: "Budgets", icon: mdiCashMultiple },
    { path: "/clients", label: "Clients", icon: mdiAccountBoxMultiple },
    { path: "/suppliers", label: "Suppliers", icon: mdiTruck },
  ],
};

const AuthenticatedLayout = ({ children, userRole, userName }: AuthenticatedLayoutProps) => {
  const [allowedRoutes, setAllowedRoutes] = useState<
    { path: string; label: string; icon: string }[]
  >([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setAllowedRoutes(menuItems[userRole as "admin" | "user"] || []);
  }, [userRole]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 z-40 w-54 h-screen bg-gray-50 flex flex-col justify-between">
        <div className="px-3 py-4 overflow-y-auto flex-1">
          <ul className="space-y-2 font-medium">
            {allowedRoutes.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center p-2 rounded-lg ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-900 hover:bg-primary hover:text-primary-foreground"
                    }`}
                  >
                    <Icon path={item.icon} size={1} className="mr-3" />
                    <span className="ml-3">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Avatar y nombre del usuario con menú desplegable */}
        <div className="p-2 relative border-t">
          <button
            className="flex items-center space-x-3 w-full p-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Avatar>
              <AvatarImage alt="User Avatar" />
              <AvatarFallback>{getInitials(userName)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{userName}</span>
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute bottom-full mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg"
            >
              <ul className="py-2">
                {userRole === "admin" && (
                  <li>
                    <Link
                      href="/manage-company"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Manage Company
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 ml-56 p-6">{children}</div>
    </div>
  );
};

export default AuthenticatedLayout;
