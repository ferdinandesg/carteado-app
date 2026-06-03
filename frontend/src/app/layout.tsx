"use client";
import "../styles/globals.scss";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import { ModalProvider } from "@/components/Modal/ModalContext";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "i18next.config";
import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher";

const inter = Inter({ subsets: ["latin"] });

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation()
  return (
    <I18nextProvider i18n={i18n}>
      <html lang="en">
        <head>
          <title>{t("pageTitles.home")}</title>
          <link rel="icon" href="/favicon.webp" type="image/png" />
        </head>
        <body className={inter.className}>
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
        </body>
      </html>
    </I18nextProvider>
  );
}