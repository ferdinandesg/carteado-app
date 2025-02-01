'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import ptFlag from 'public/flags/brasil.png';
import enFlag from 'public/flags/eua.png';

import styles from "@styles/LanguageSwitcher.module.scss"

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();
    const router = useRouter();

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
        router.refresh();
    };

    return (
        <div className={styles.LanguageSwitcher}>
            <Image
                src={ptFlag}
                alt="Português"
                width={30}
                className={styles.languageIcon}
                onClick={() => handleLanguageChange('pt')}
            />
            <Image
                src={enFlag}
                alt="English"
                width={30}
                className={styles.languageIcon}
                onClick={() => handleLanguageChange('en')}
            />
        </div>
    );
};

export default LanguageSwitcher;
