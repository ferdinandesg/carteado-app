"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ALL_SUITS,
  TRUCO_RANK_ORDER,
  type Rank,
  type Suit,
} from "shared/cards";
import {
  GameStatus,
  isTrucoGame,
  PowerId,
  type ITrucoGameState,
} from "shared/game";

import ActionButton from "@/components/buttons/ActionButton";
import CardComponent from "@/components/Card";
import TrucoGame from "@/components/Game/truco.game";
import ModalGameFinished from "@/components/Modal/ModalGameFinished/ModalGameFinished";
import { useGameStore } from "@/contexts/game.store";
import {
  GameActionsProvider,
  type GameActions,
} from "@/hooks/game/useGameActions";
import useTitle from "@/hooks/useTitle";
import { useTypedGame } from "@/hooks/useTypedGame";
import {
  acceptSandboxTruco,
  addCardToSandboxHand,
  askSandboxTruco,
  createSandboxTrucoGame,
  dealSandboxRound,
  makeSandboxCard,
  pickRandomHandCard,
  playSandboxCard,
  rejectSandboxTruco,
  SANDBOX_BOT_DELAY_MS,
  SANDBOX_BOT_ID,
  SANDBOX_YOU_ID,
} from "@/lib/sandbox/trucoSandboxGame";
import styles from "@/styles/Sandbox.module.scss";
import gameStyles from "@/styles/Game.module.scss";

const TRUCO_RANKS = Object.keys(TRUCO_RANK_ORDER) as Rank[];
const POWERS = Object.values(PowerId);

function patchSandbox(mutate: (game: ITrucoGameState) => ITrucoGameState) {
  const current = useGameStore.getState().game;
  if (!isTrucoGame(current)) return;
  useGameStore.getState().setGame(mutate(current));
}

export default function SandboxClient() {
  const { t } = useTranslation();
  const router = useRouter();
  useTitle({ title: t("pageTitles.sandbox") });

  const [rank, setRank] = useState<Rank>("7");
  const [suit, setSuit] = useState<Suit>("clubs");
  const [powerId, setPowerId] = useState<string>("");
  const [hidden, setHidden] = useState(false);

  const game = useTypedGame(isTrucoGame);
  const waitingBot = game?.playerTurn === SANDBOX_BOT_ID;
  const waitingTruco =
    game?.trucoState === "PENDING" && game.trucoAskerId === SANDBOX_YOU_ID;
  const preview = makeSandboxCard(rank, suit, powerId || undefined);

  useLayoutEffect(() => {
    const previous = useGameStore.getState();
    useGameStore.setState({
      userId: SANDBOX_YOU_ID,
      game: createSandboxTrucoGame({
        you: t("Sandbox.you"),
        bot: t("Sandbox.bot"),
      }),
    });
    return () => {
      useGameStore.setState({
        game: previous.game,
        userId: previous.userId,
      });
    };
  }, [t]);

  useEffect(() => {
    if (!game || game.status === GameStatus.FINISHED) return;

    if (game.trucoState === "PENDING" && game.trucoAskerId === SANDBOX_YOU_ID) {
      const timer = window.setTimeout(() => {
        patchSandbox((current) => acceptSandboxTruco(current, SANDBOX_BOT_ID));
      }, SANDBOX_BOT_DELAY_MS);
      return () => window.clearTimeout(timer);
    }

    if (game.playerTurn !== SANDBOX_BOT_ID || game.trucoState === "PENDING") {
      return;
    }

    const bot = game.players.find((player) => player.userId === SANDBOX_BOT_ID);
    if (!bot?.hand.length) return;

    const timer = window.setTimeout(() => {
      const current = useGameStore.getState().game;
      if (
        !isTrucoGame(current) ||
        current.status === GameStatus.FINISHED ||
        current.playerTurn !== SANDBOX_BOT_ID ||
        current.trucoState === "PENDING"
      ) {
        return;
      }
      const hand =
        current.players.find((player) => player.userId === SANDBOX_BOT_ID)
          ?.hand ?? [];
      const card = pickRandomHandCard(hand);
      if (!card) return;
      const { game: next } = playSandboxCard(current, SANDBOX_BOT_ID, card);
      useGameStore.getState().setGame(next);
    }, SANDBOX_BOT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [game]);

  const sandboxActions = useMemo<GameActions>(
    () => ({
      playCard: (card) =>
        patchSandbox((current) => {
          const { game, privateResult } = playSandboxCard(
            current,
            SANDBOX_YOU_ID,
            card
          );
          if (privateResult) {
            useGameStore.getState().setPowerPeek(privateResult);
          }
          return game;
        }),
      askTruco: () =>
        patchSandbox((current) => askSandboxTruco(current, SANDBOX_YOU_ID)),
      acceptTruco: () =>
        patchSandbox((current) => acceptSandboxTruco(current, SANDBOX_YOU_ID)),
      rejectTruco: () => patchSandbox(rejectSandboxTruco),
      handlePickCards: () => {},
      undoPlay: () => {},
      endTurn: () => {},
      pickUpBunch: () => {},
    }),
    []
  );

  return (
    <main className={styles.Sandbox}>
      <aside className={styles.controls}>
        <ActionButton
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => router.back()}>
          {t("back")}
        </ActionButton>
        <h1 className={styles.title}>{t("Sandbox.title")}</h1>
        <p className={styles.intro}>{t("Sandbox.intro")}</p>

        <label className={styles.field}>
          {t("Sandbox.rank")}
          <select
            className={styles.select}
            value={rank}
            onChange={(event) => setRank(event.target.value as Rank)}>
            {TRUCO_RANKS.map((item) => (
              <option
                key={item}
                value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          {t("Sandbox.suit")}
          <select
            className={styles.select}
            value={suit}
            onChange={(event) => setSuit(event.target.value as Suit)}>
            {ALL_SUITS.map((item) => (
              <option
                key={item}
                value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          {t("Sandbox.power")}
          <select
            className={styles.select}
            value={powerId}
            onChange={(event) => setPowerId(event.target.value)}>
            <option value="">{t("Sandbox.noPower")}</option>
            {POWERS.map((id) => (
              <option
                key={id}
                value={id}>
                {t(`Powers.${id}.name`)}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={hidden}
            onChange={(event) => setHidden(event.target.checked)}
          />
          {t("Sandbox.hidden")}
        </label>
        <div className={styles.preview}>
          <CardComponent
            card={preview}
            isHidden={hidden}
            canHover
            height={120}
          />
        </div>
        <ActionButton
          type="button"
          variant="primary"
          size="sm"
          disabled={!game}
          onClick={() =>
            game &&
            patchSandbox((current) =>
              addCardToSandboxHand(current, SANDBOX_YOU_ID, preview)
            )
          }>
          {t("Sandbox.addToHand")}
        </ActionButton>
        <ActionButton
          type="button"
          variant="secondary"
          size="sm"
          disabled={!game}
          onClick={() =>
            game &&
            patchSandbox((current) => ({
              ...dealSandboxRound(current, {
                you: t("Sandbox.you"),
                bot: t("Sandbox.bot"),
              }),
              id: `sandbox-${Date.now()}`,
            }))
          }>
          {t("Sandbox.newHand")}
        </ActionButton>
        <ActionButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            patchSandbox(() =>
              createSandboxTrucoGame({
                you: t("Sandbox.you"),
                bot: t("Sandbox.bot"),
              })
            )
          }>
          {t("Sandbox.resetMatch")}
        </ActionButton>
        {(waitingBot || waitingTruco) && (
          <p className={styles.hint}>{t("Sandbox.waitingBot")}</p>
        )}
      </aside>

      <section className={styles.gameStage}>
        <GameActionsProvider value={sandboxActions}>
          <div className={gameStyles.gameRoot}>
            <TrucoGame />
            <ModalGameFinished isOpen={game?.status === GameStatus.FINISHED} />
          </div>
        </GameActionsProvider>
      </section>
    </main>
  );
}
