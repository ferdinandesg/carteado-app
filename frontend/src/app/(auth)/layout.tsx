'use client'
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter()
  const { status } = useSession()
  if (status === "loading") return <div>Loading...</div>
  if (status === "unauthenticated") {
    router.push("/")
    return null
  }
  return (
    <div className="bg-gradient-to-r from-green-800 via-green-700 to-green-800  h-screen w-screen">
      {children}
    </div>
  );
}
