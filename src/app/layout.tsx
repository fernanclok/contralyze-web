import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui/toast";
import { PusherProvider } from "@/contexts/PusherContext";
import ClientWrapper from "@/components/ClientWrapper"; // Importa el nuevo componente

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "Contralyze",
  description: "Contralyze is a platform for managing your company finance.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PusherProvider>
          {children}
          <ToastContainer />
          <ClientWrapper /> {/* Se ejecutará el useEffect desde aquí */}
        </PusherProvider>
      </body>
    </html>
  );
}
