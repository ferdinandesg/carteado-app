"use client";

import classNames from "classnames";
import {
  AnimatePresence,
  motion,
  useAnimate,
  useReducedMotion,
} from "motion/react";
import { useEffect, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import CardComponent from "@/components/Card";
import { seatAnchor, useSeatAnchors } from "@/hooks/game/useSeatAnchors";
import type { TrucoEffect, XrayPeek } from "@/hooks/game/useTrucoPresentation";
import { testIds } from "@/tests/testIds";

import styles from "@/styles/TrucoEffects.module.scss";

type TrucoEffectsProps = {
  effect: TrucoEffect | null;
  xrayPeek?: XrayPeek | null;
  children: ReactNode;
};

/** Escalada da aposta: 3 → 1, 6 → 2, 9 → 3, 12 → 4. */
export function getBetLevel(bet: number): 1 | 2 | 3 | 4 {
  if (bet >= 12) return 4;
  if (bet >= 9) return 3;
  if (bet >= 6) return 2;
  return 1;
}

const BET_STAMP_KEY: Record<number, string> = {
  1: "Truco.stamp.truco",
  2: "Truco.stamp.six",
  3: "Truco.stamp.nine",
  4: "Truco.stamp.twelve",
};

function shakeKeyframes(level: number) {
  const amp = 6 + level * 4;
  return {
    x: [0, -amp, amp, -amp * 0.7, amp * 0.7, -amp * 0.3, 0],
    rotate: [0, -level * 0.4, level * 0.4, 0],
  };
}

function useStampCopy(effect: TrucoEffect | null) {
  const { t } = useTranslation();

  return useMemo(() => {
    if (!effect) return null;

    switch (effect.kind) {
      case "trucoAsked": {
        const level = getBetLevel(effect.bet);
        return { text: t(BET_STAMP_KEY[level]), tone: `level${level}` };
      }
      case "trucoAccepted":
        return { text: t("Truco.stamp.accepted"), tone: "accepted" };
      case "trucoRejected":
        return {
          text: t("Truco.stamp.rejected"),
          tone: effect.won ? "won" : "lost",
        };
      case "roundFinished":
        return {
          text: t(
            effect.won ? "Truco.stamp.roundWon" : "Truco.stamp.roundLost",
            {
              points: effect.points,
            }
          ),
          tone: effect.won ? "won" : "lost",
        };
      case "matchFinished":
        return {
          text: t(effect.won ? "Truco.stamp.victory" : "Truco.stamp.defeat"),
          tone: effect.won ? "won" : "lost",
        };
      case "powerUsed":
        return {
          text: t("Truco.stamp.power", {
            name: t(`Powers.${effect.powerId}.name`),
          }),
          tone: "power",
        };
      default:
        return null;
    }
  }, [effect, t]);
}

/**
 * Overlay de efeitos do Truco em volta da mesa: shake, vinheta e selos
 * ("TRUCO!", "SEIS!", "CORREU!"...). Respeita `prefers-reduced-motion`.
 */
export default function TrucoEffects({
  effect,
  xrayPeek = null,
  children,
}: TrucoEffectsProps) {
  const [scope, animate] = useAnimate();
  const reduceMotion = useReducedMotion();
  const anchors = useSeatAnchors();
  const stamp = useStampCopy(effect);

  const isAsk = effect?.kind === "trucoAsked";
  const level = isAsk ? getBetLevel(effect.bet) : 0;

  useEffect(() => {
    if (!effect || effect.kind !== "trucoAsked") return;

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(30 + level * 15);
    }

    if (reduceMotion || !scope.current) return;

    const controls = animate(scope.current, shakeKeyframes(level), {
      duration: 0.15 + level * 0.1,
      ease: "easeInOut",
    });

    return () => controls.stop();
  }, [effect, level, reduceMotion, animate, scope]);

  // Selo nasce perto de quem pediu e assenta entre o assento e o centro.
  const stampOrigin = useMemo(() => {
    if (!effect || effect.kind !== "trucoAsked" || reduceMotion) return null;
    return anchors.getOffset("center", seatAnchor(effect.askerId));
  }, [anchors, effect, reduceMotion]);

  const peekOrigin = useMemo(() => {
    if (!xrayPeek) return { x: 0, y: 0 };
    return (
      anchors.getOffset("center", seatAnchor(xrayPeek.targetUserId)) ?? {
        x: 0,
        y: 0,
      }
    );
  }, [anchors, xrayPeek]);

  return (
    <div className={styles.root}>
      <motion.div
        ref={scope}
        className={styles.shakeLayer}>
        {children}
      </motion.div>

      <AnimatePresence>
        {isAsk && (
          <motion.div
            key={`vignette-${effect.id}`}
            className={classNames(styles.vignette, styles[`level${level}`])}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.55, 0.9, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {effect && stamp && (
          <motion.div
            key={`stamp-${effect.id}`}
            className={classNames(styles.stamp, styles[stamp.tone])}
            data-testid={testIds.game.trucoStamp}
            initial={{
              x: stampOrigin?.x ?? 0,
              y: stampOrigin?.y ?? 0,
              scale: reduceMotion ? 1 : 0.3,
              rotate: reduceMotion ? 0 : -14,
              opacity: 0,
            }}
            animate={{
              x: (stampOrigin?.x ?? 0) * 0.35,
              y: (stampOrigin?.y ?? 0) * 0.35,
              scale: reduceMotion ? 1 : [0.3, 1.25, 1],
              rotate: -6,
              opacity: 1,
            }}
            exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.8, y: -30 }}
            transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}>
            {stamp.text}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {xrayPeek && (
          <motion.div
            key={`xray-${xrayPeek.id}`}
            className={styles.xrayPeek}
            data-testid={testIds.game.xrayPeek}
            initial={{
              x: peekOrigin.x,
              y: peekOrigin.y,
              scale: reduceMotion ? 1 : 0.4,
              rotateY: reduceMotion ? 0 : 90,
              opacity: 0,
            }}
            animate={{
              x: peekOrigin.x * 0.82,
              y: peekOrigin.y * 0.82,
              scale: 1,
              rotateY: 0,
              opacity: 1,
            }}
            exit={{
              x: peekOrigin.x,
              y: peekOrigin.y,
              scale: reduceMotion ? 1 : 0.55,
              rotateY: reduceMotion ? 0 : -80,
              opacity: 0,
            }}
            transition={{
              duration: reduceMotion ? 0.15 : 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}>
            <CardComponent
              card={xrayPeek.card}
              size="md"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
