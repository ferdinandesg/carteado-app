"use client";
import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "Carteado App",
    description: "Jogasso",
};
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
