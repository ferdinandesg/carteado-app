"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { I18nextProvider } from "react-i18next";
import { ToastContainer } from "react-toastify";

import { ModalProvider } from "@/components/Modal/ModalContext";
import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher";
import i18n from "i18next.config";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <I18nextProvider i18n={i18n}>
      <header>
        <LanguageSwitcher />
      </header>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <ModalProvider>{children}</ModalProvider>
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
    </I18nextProvider>
  );
}
