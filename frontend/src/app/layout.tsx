"use client";
import { SocketProvider } from "@/contexts/socket.context";
import "../styles/globals.scss";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import { ModalProvider } from "@/components/Modal/ModalContext";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const inter = Inter({ subsets: ["latin"] });

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <QueryClientProvider client={queryClient}>
            <SocketProvider>
              <ModalProvider>{children}</ModalProvider>
            </SocketProvider>
            <ToastContainer
              position="top-right"
              autoClose={2000}
              hideProgressBar
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss={false}
              draggable={false}
              pauseOnHover={false}
              theme="light"
            />
          </QueryClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
