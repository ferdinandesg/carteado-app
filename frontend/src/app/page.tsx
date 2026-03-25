"use client";

import { signIn } from "next-auth/react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { Pixelify_Sans } from "next/font/google";
import { useRouter } from "next/navigation";
import { useState } from "react";

import GuestCustomizer from "@/components/GuestCustomizer";
import styles from "@/styles/Home.module.scss";
import classNames from "classnames";

const pixelify = Pixelify_Sans({
  weight: ["400"],
  subsets: ["latin"],
});

export default function Home() {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [view, setView] = useState<"initial" | "guestSetup">("initial");
  const { t } = useTranslation();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true);
    try {
      await signIn("google");
    } catch (error) {
      console.error("Error signing in with Google:", error);
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleGoToRules = () => router.push("/rules");

  if (view === "guestSetup") {
    return <GuestCustomizer onBack={() => setView("initial")} />;
  }

  return (
    <main
      className={classNames(styles.Home, "square-bg", pixelify.className)}
      role="main">
      <div className={styles.container}>
        <h1 className={styles.title}>Carteado</h1>

        <div
          className={styles.authMethods}
          role="group"
          aria-label={t("authMethods")}>
          <button
            type="button"
            className={styles.google}
            disabled={isLoadingGoogle}
            aria-busy={isLoadingGoogle}
            aria-label={isLoadingGoogle ? t("loading") : t("googleAuth")}
            onClick={handleGoogleSignIn}>
            {isLoadingGoogle ? (
              <span
                className="spinner"
                aria-hidden
              />
            ) : (
              <Image
                src="https://developers.google.com/identity/images/g-logo.png"
                alt=""
                width={25}
                height={25}
                aria-hidden
              />
            )}
            {isLoadingGoogle ? t("loading") : t("googleAuth")}
          </button>

          <button
            type="button"
            className={styles.guest}
            onClick={() => setView("guestSetup")}
            aria-label={t("joinAsGuest")}>
            {t("joinAsGuest")}
          </button>
        </div>

        <button
          type="button"
          className={styles.rulesLink}
          onClick={handleGoToRules}
          aria-label={t("seeRules")}>
          {t("seeRules")}
        </button>
      </div>

      <figure
        className={styles.banner}
        aria-hidden>
        <Image
          src="/assets/banner.png"
          alt=""
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 768px) 90vw, 30vw"
          priority
        />
      </figure>
    </main>
  );
}
