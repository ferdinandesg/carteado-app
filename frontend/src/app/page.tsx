"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import ActionButton from "@/components/buttons/ActionButton";
import GuestCustomizer from "@/components/GuestCustomizer/GuestCustomizer";
import styles from "@/styles/Home.module.scss";

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
      className={styles.Home}
      role="main">
      <section
        className={styles.hero}
        aria-labelledby="home-logo-title">
        <Image
          className={styles.logo}
          src="/assets/logo/main-logo.png"
          alt="Carteado"
          width={690}
          height={388}
          priority
        />
        <h1
          id="home-logo-title"
          className={styles.visuallyHidden}>
          Carteado
        </h1>

        <div
          className={styles.authMethods}
          role="group"
          aria-label={t("authMethods")}
          data-testid="auth-methods-section">
          <ActionButton
            type="button"
            className={styles.actionButton}
            variant="primary"
            size="lg"
            data-testid="google-signin-button"
            isLoading={isLoadingGoogle}
            aria-label={isLoadingGoogle ? t("loading") : t("googleAuth")}
            onClick={handleGoogleSignIn}
            icon={
              <Image
                className={styles.googleIcon}
                src="https://developers.google.com/identity/images/g-logo.png"
                alt=""
                width={25}
                height={25}
                aria-hidden
              />
            }>
            {isLoadingGoogle ? t("loading") : t("googleAuth")}
          </ActionButton>

          <ActionButton
            type="button"
            className={styles.actionButton}
            variant="secondary"
            size="lg"
            data-testid="guest-signin-button"
            onClick={() => setView("guestSetup")}
            aria-label={t("joinAsGuest")}>
            {t("joinAsGuest")}
          </ActionButton>

          <ActionButton
            type="button"
            className={styles.actionButton}
            variant="accent"
            size="lg"
            data-testid="rules-button"
            onClick={handleGoToRules}
            aria-label={t("seeRules")}>
            {t("seeRules")}
          </ActionButton>
        </div>
      </section>
    </main>
  );
}
