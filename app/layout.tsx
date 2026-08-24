import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppChrome } from "@/components/AppChrome";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "API Control Center",
  description: "Monitor and manage your API services with alerts and notifications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}><AppChrome>{children}</AppChrome></body>
    </html>
  );
}
