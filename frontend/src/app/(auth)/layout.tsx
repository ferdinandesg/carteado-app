"use client";
import type { Metadata } from "next";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "Carteado App",
  description: "Jogasso",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-r from-green-800 via-green-700 to-green-800  h-screen w-screen">
      {children}
    </div>
  );
}
