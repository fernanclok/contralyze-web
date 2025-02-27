"use client";

import { useEffect, useState } from "react";
import { emmiter } from "@/lib/emmiter";

type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed right-5 bottom-5 flex items-center w-full max-w-xs p-4 space-x-4 rounded-lg shadow-lg text-white ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
      role="alert"
    >
      <div className="text-sm font-medium">{message}</div>
      <button onClick={onClose} className="ml-auto text-white">
        ✖
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    const handler = (event: { message: string; type: ToastType }) => {
      setToast(event);
      setTimeout(() => setToast(null), 3000);
    };

    emmiter.on("showToast", handler);
    return () => emmiter.off("showToast", handler);
  }, []);

  if (!toast) return null;

  return <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />;
}
