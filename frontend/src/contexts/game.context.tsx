"use client";
import { Card } from "shared/cards";
import { GameState, PlayerWithUser } from "shared/types";

import { ReactNode, createContext, useContext, useEffect } from "react";
import { useSocket } from "./socket.context";
import { useSession } from "next-auth/react";
import useGameState from "@/hooks/useGameState";
import { useParams } from "next/navigation";
import { User } from "next-auth";

interface GameContextProps {
  bunchCards: Card[];
  undoPlay: () => void;
  endTurn: () => void;
  pickUpBunch: () => void;
  handlePickCards: (cards: Card[]) => void;
  askTruco: () => void;
  rejectTruco: () => void;
  acceptTruco: () => void;
  player?: PlayerWithUser;
  rotatedPlayers: PlayerWithUser[];
  game?: GameState;
  playCard: (card: Card) => void;
  cards: Card[]
}

const GameContext = createContext<GameContextProps | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { id } = useParams();
  const { data } = useSession();
  const { game, updateGame } = useGameState(String(id));

  const players = game?.players || [];
  const player = players.find((p) => p.userId === data?.user.id);
  const currentPlayerIndex = game?.players.findIndex(
    (p) => p.userId === data?.user.id
  );

  const rotatedPlayers = [
    ...players.slice(currentPlayerIndex),
    ...players.slice(0, currentPlayerIndex),
  ];

  const { socket } = useSocket();

  useEffect(() => {
    if (!id || !socket) return;
    socket.on("game_update", (updatedGame: GameState) => {
      updateGame(updatedGame);
    });

    return () => {
      socket.off("game_update");
    };
  }, [id, socket]);

  const playCard = (card: Card) => {
    if (!socket) return;
    socket.emit("play_card", { card });
  };

  const handlePickCards = (cards: Card[]) => {
    if (!socket) return;
    socket.emit("pick_hand", { cards });
  };

  const undoPlay = () => {
    if (!socket) return;
    socket.emit("retrieve_card");
  };

  const endTurn = () => {
    if (!socket) return;
    socket.emit("end_turn");
  };

  const pickUpBunch = () => {
    if (!socket) return;
    socket.emit("draw_table");
  };

  const askTruco = () => {
    if (!socket) return;
    socket.emit("ask_truco");
  }
  const rejectTruco = () => {
    if (!socket) return;
    socket.emit("reject_truco");
  }
  const acceptTruco = () => {
    if (!socket) return;
    socket.emit("accept_truco");
  }

  return (
    <GameContext.Provider
      value={{
        game,
        player,
        rotatedPlayers,
        bunchCards: game?.bunch || [],
        endTurn,
        pickUpBunch,
        undoPlay,
        handlePickCards,
        playCard,
        askTruco,
        rejectTruco,
        acceptTruco,
        cards: game?.deck.cards || []
      }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context)
    throw new Error("useGameContext must be used within a GameContextProvider");
  return context;
}
