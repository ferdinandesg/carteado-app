"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import ActionButton from "@/components/buttons/ActionButton";
import BackButton from "@/components/buttons/BackButton";
import CardComponent from "@/components/Card";
import useTitle from "@/hooks/useTitle";
import styles from "@/styles/Rules.module.scss";

function Rules() {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  useTitle({ title: t("pageTitles.rules") });

  const rules = useMemo(
    () => [
      {
        title: t("Rules.rule1Title"),
        text: t("Rules.rule1Text"),
      },
      {
        title: t("Rules.rule2Title"),
        text: t("Rules.rule2Text"),
      },
      {
        title: t("Rules.rule3Title"),
        text: t("Rules.rule3Text"),
        extra: (
          <ul className={styles.specialCardsList}>
            <li className={styles.specialCard}>
              <CardComponent
                card={{
                  rank: "2",
                  suit: "hearts",
                  secondaryValue: 2,
                  toString: "2 of hearts",
                  value: 2,
                }}
              />
              <span>{t("Rules.specialCards2")}</span>
            </li>
            <li className={styles.specialCard}>
              <CardComponent
                card={{
                  rank: "10",
                  suit: "hearts",
                  secondaryValue: 10,
                  toString: "10 of hearts",
                  value: 10,
                }}
              />
              <span>{t("Rules.specialCards10")}</span>
            </li>
          </ul>
        ),
      },
      {
        title: t("Rules.rule4Title"),
        text: t("Rules.rule4Text"),
      },
      {
        title: t("Rules.rule5Title"),
        text: t("Rules.rule5Text"),
      },
      {
        title: t("Rules.rule6Title"),
        text: t("Rules.rule6Text"),
      },
    ],
    [t]
  );

  const activeRule = rules[activeStep];
  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === rules.length - 1;

  return (
    <main className={styles.Rules}>
      <div className={styles.rulesContainer}>
        <header className={styles.header}>
          <ActionButton
            type="button"
            className={styles.actionButton}
            variant="secondary"
            size="lg"
            data-testid="guest-signin-button"
            onClick={() => window.history.back()}
            aria-label={t("back")}>
            {t("back")}
          </ActionButton>
          <div>
            <h1 className={styles.rulesTitle}>{t("Rules.title")}</h1>
            <p className={styles.introText}>{t("Rules.intro")}</p>
          </div>
        </header>

        <nav
          className={styles.stepper}
          aria-label={t("Rules.title")}>
          {rules.map((rule, index) => (
            <button
              key={rule.title}
              type="button"
              className={
                index === activeStep
                  ? `${styles.step} ${styles.activeStep}`
                  : styles.step
              }
              onClick={() => setActiveStep(index)}
              aria-current={index === activeStep ? "step" : undefined}>
              {rule.title}
            </button>
          ))}
        </nav>

        <section
          className={styles.ruleCard}
          aria-live="polite">
          <h2 className={styles.ruleTitle}>{activeRule.title}</h2>
          <p className={styles.ruleText}>{activeRule.text}</p>
          {activeRule.extra}
        </section>

        <footer className={styles.controls}>
          <ActionButton
            type="button"
            variant="secondary"
            disabled={isFirstStep}
            onClick={() => setActiveStep((step) => Math.max(step - 1, 0))}>
            {t("Rules.previous")}
          </ActionButton>
          <ActionButton
            type="button"
            variant={isLastStep ? "accent" : "primary"}
            disabled={isLastStep}
            onClick={() =>
              setActiveStep((step) => Math.min(step + 1, rules.length - 1))
            }>
            {t("Rules.next")}
          </ActionButton>
        </footer>
      </div>
    </main>
  );
}

export default Rules;
