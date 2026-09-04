"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import ptFlag from "public/flags/brasil.png";
import enFlag from "public/flags/eua.png";

import styles from "@/styles/LanguageSwitcher.module.scss";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const router = useRouter();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    router.refresh();
  };

  const isMobileHeight = useMediaQuery("(max-height: 768px)");
  const iconSize = isMobileHeight ? 20 : 30;
  return (
    <div className={styles.LanguageSwitcher}>
      <Image
        src={ptFlag}
        alt="Português"
        width={iconSize}
        className={styles.languageIcon}
        onClick={() => handleLanguageChange("pt")}
      />
      <Image
        src={enFlag}
        alt="English"
        width={iconSize}
        className={styles.languageIcon}
        onClick={() => handleLanguageChange("en")}
      />
    </div>
  );
};

export default LanguageSwitcher;
