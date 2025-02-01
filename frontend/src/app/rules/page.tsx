"use client";
import BackButton from '@/components/buttons/BackButton';
import CardComponent from '@/components/Card';
import styles from '@styles/Rules.module.scss';
import classNames from 'classnames';
import { Pixelify_Sans } from 'next/font/google';
import { useTranslation } from 'react-i18next';
const pixelify = Pixelify_Sans({
    weight: ["400"],
    subsets: ["latin"],
});
function Rules() {
    const { t } = useTranslation()

    return (
        <div className={classNames("square-bg", styles.Rules, pixelify.className)}>
            <div className={styles.rulesContainer}>
                <BackButton
                    onClick={() => window.history.back()}
                    size={24} color='white' />
                <h1 className={styles.rulesTitle}>{t('Rules.title')}</h1>
                <p className={styles.introText}>{t('Rules.intro')}</p>

                <div className={styles.rule}>
                    <h2 className={styles.ruleTitle}>{t('Rules.rule1Title')}</h2>
                    <p className={styles.ruleText}>{t('Rules.rule1Text')}</p>
                </div>

                <div className={styles.rule}>
                    <h2 className={styles.ruleTitle}>{t('Rules.rule2Title')}</h2>
                    <p className={styles.ruleText}>{t('Rules.rule2Text')}</p>
                </div>

                <div className={styles.rule}>
                    <h2 className={styles.ruleTitle}>{t('Rules.rule3Title')}</h2>
                    <p className={styles.ruleText}>{t('Rules.rule3Text')}</p>
                    <ul className={styles.specialCardsList}>
                        <li className={styles.specialCard}>
                            <CardComponent card={{
                                rank: "2",
                                suit: "hearts",
                                secondaryValue: 2,
                                toString: "2 of hearts"
                            }} />
                            {t('Rules.specialCards2')}</li>
                        <li className={styles.specialCard}>
                            <CardComponent card={{
                                rank: "10",
                                suit: "hearts",
                                secondaryValue: 10,
                                toString: "10 of hearts"
                            }} />
                            {t('Rules.specialCards10')}</li>
                    </ul>
                </div>

                <div className={styles.rule}>
                    <h2 className={styles.ruleTitle}>{t('Rules.rule4Title')}</h2>
                    <p className={styles.ruleText}>{t('Rules.rule4Text')}</p>
                </div>

                <div className={styles.rule}>
                    <h2 className={styles.ruleTitle}>{t('Rules.rule5Title')}</h2>
                    <p className={styles.ruleText}>{t('Rules.rule5Text')}</p>
                </div>

                <div className={styles.rule}>
                    <h2 className={styles.ruleTitle}>{t('Rules.rule6Title')}</h2>
                    <p className={styles.ruleText}>{t('Rules.rule6Text')}</p>
                </div>
            </div>
        </div>
    );
};

export default Rules;
