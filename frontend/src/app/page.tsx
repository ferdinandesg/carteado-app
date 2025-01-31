"use client";
import { signIn } from "next-auth/react";
import { useTranslation } from "next-i18next";

import styles from "@styles/Home.module.scss";
import classNames from "classnames";
import Image from "next/image";
import { Pixelify_Sans } from "next/font/google";

const pixelify = Pixelify_Sans({
  weight: ["400"],
  subsets: ["latin"],
});
function Home() {
  const { t } = useTranslation()
  return (
    <>
      <div className={classNames(styles.Home, "square-bg", pixelify.className)}>
        <div className={styles.container}>
          <h1 className={styles.title}>Carteado</h1>
          <div className={styles.authMethods}>
            <button
              className={styles.google}
              onClick={() => signIn("google")}>
              <Image
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google Logo"
                width={25}
                height={25}
              />
              {t("googleAuth")}
            </button>
            <button
              disabled
              className="bg-gray-500 text-white hover:bg-gray-500 transition p-2 rounded">
              {t("joinAsGuest")}
            </button>
          </div>
          <span className={styles.rulesButton}>
            {t("seeRules")}
          </span>
        </div>
      </div>
    </>
  );
}

export default Home
