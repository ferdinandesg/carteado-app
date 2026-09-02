"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

import CardComponent from "@/components/Card";
import {
  seatAnchor,
  useSeatAnchors,
  type AnchorId,
} from "@/hooks/game/useSeatAnchors";
import type {
  DepartingTrick,
  PlayedEntry,
} from "@/hooks/game/useTrucoPresentation";
import { TIMINGS } from "@/hooks/game/useTrucoPresentation";
import { getPileTransform } from "@/lib/cards/pileLayout";

import styles from "@/styles/TrucoTable.module.scss";

type TrucoTablePresenterProps = {
  bunch: PlayedEntry[];
  departing: DepartingTrick | null;
  myUserId: string | null;
  /** Prefixo de `layoutId` compartilhado com o leque do jogador local. */
  layoutPrefix?: string;
};

const pileVars = (index: number, count: number) => {
  const { x, y, rotate } = getPileTransform(index, count, "spread");
  return {
    "--dx": `${x}%`,
    "--dy": `${y}%`,
    "--rot": `${rotate}deg`,
  } as React.CSSProperties;
};

function PlayedCard({
  entry,
  index,
  count,
  isMine,
  layoutPrefix,
}: {
  entry: PlayedEntry;
  index: number;
  count: number;
  isMine: boolean;
  layoutPrefix: string;
}) {
  const anchors = useSeatAnchors();
  const reduceMotion = useReducedMotion();

  // Carta do jogador local voa via layoutId (leque → centro). Carta de
  // oponente entra a partir do assento dele.
  const origin = useMemo(() => {
    if (reduceMotion) return null;
    if (entry.fromDeck) return anchors.getOffset("center", "deck");
    if (isMine || !entry.playerId) return null;
    return anchors.getOffset("center", seatAnchor(entry.playerId));
  }, [anchors, entry.fromDeck, entry.playerId, isMine, reduceMotion]);

  const enter = origin
    ? { x: origin.x, y: origin.y, scale: 0.7, opacity: 0.6 }
    : { scale: 0.9, opacity: 0 };
  const leave = origin
    ? { x: origin.x, y: origin.y, scale: 0.7, opacity: 0 }
    : { scale: 0.85, opacity: 0 };

  const useLayoutFly = isMine && !entry.fromDeck;

  return (
    <div
      className={styles.playedCard}
      style={pileVars(index, count)}>
      {useLayoutFly ? (
        <CardComponent
          card={entry.card}
          size="lg"
          layoutId={`${layoutPrefix}-${entry.key}`}
        />
      ) : (
        <AnimatePresence>
          <motion.div
            key={entry.key}
            initial={enter}
            animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            exit={leave}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}>
            <CardComponent
              card={entry.card}
              size="lg"
            />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function DepartingCards({ trick }: { trick: DepartingTrick }) {
  const anchors = useSeatAnchors();
  const reduceMotion = useReducedMotion();

  const exit = useMemo(() => {
    if (trick.target === "tie" || reduceMotion) {
      return { opacity: 0, scale: 0.7, y: -12 };
    }
    const target: AnchorId =
      trick.target === "ours" ? "pile:ours" : "pile:opponent";
    const offset = anchors.getOffset("center", target);
    return offset
      ? { x: offset.x, y: offset.y, scale: 0.55, opacity: 0.85 }
      : { opacity: 0, scale: 0.6 };
  }, [anchors, trick.target, reduceMotion]);

  return (
    <motion.div
      className={styles.departing}
      data-target={trick.target}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      exit={exit}
      transition={{ duration: TIMINGS.depart / 1000, ease: [0.4, 0, 0.2, 1] }}>
      {trick.cards.map((entry, index) => (
        <div
          key={entry.key}
          className={styles.playedCard}
          style={pileVars(index, trick.cards.length)}>
          <CardComponent
            card={entry.card}
            size="lg"
          />
        </div>
      ))}
    </motion.div>
  );
}

/** Centro da mesa (slot 5): cartas da vaza atual + vaza saindo para a pilha. */
export default function TrucoTablePresenter({
  bunch,
  departing,
  myUserId,
  layoutPrefix = "card",
}: TrucoTablePresenterProps) {
  return (
    <div className={styles.center}>
      <AnimatePresence>
        {departing && (
          <DepartingCards
            key={`departing-${departing.id}`}
            trick={departing}
          />
        )}
      </AnimatePresence>

      <div className={styles.spread}>
        {bunch.map((entry, index) => (
          <PlayedCard
            key={entry.key}
            entry={entry}
            index={index}
            count={bunch.length}
            isMine={entry.playerId !== null && entry.playerId === myUserId}
            layoutPrefix={layoutPrefix}
          />
        ))}
      </div>
    </div>
  );
}
