"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";

import styles from "@styles/Menu.module.scss";
import { Pixelify_Sans } from "next/font/google";
import classNames from "classnames";

const pixelify = Pixelify_Sans({ weight: ["700", "700"], subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { status } = useSession();
  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }
  return (
    <div className={classNames(styles.RootLayout, pixelify.className)}>
      {children}
    </div>
  );
}
