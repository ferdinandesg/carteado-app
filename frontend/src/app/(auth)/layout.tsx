"use client";
import "react-toastify/dist/ReactToastify.css";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import classNames from "classnames";

import styles from "@/styles/Menu.module.scss";
import { SocketProvider } from "@/contexts/socket.context";

/** Complementa o middleware: sessão que expira com a página aberta volta ao login. */
function useRedirectWhenSessionEnds() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
  }, [status, router]);
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useRedirectWhenSessionEnds();

  return (
    <div className={classNames(styles.RootLayout, "app-background")}>
      <SocketProvider>{children}</SocketProvider>
    </div>
  );
}
