"use client";
import { Card } from "@/models/Cards";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSocket } from "./socket.context";
import { useSession } from "next-auth/react";
import useGameState from "@/hooks/useGameState";
import { useParams } from "next/navigation";
import { Player } from "@/models/Users";
import { GameState } from "@/@types/game";

interface GameContextProps {
  bunchCards: Card[];
  retrieveCard: () => void;
  endTurn: () => void;
  drawTable: () => void;
  handlePickCards: (cards: Card[]) => void;
  player?: Player,
  rotatedPlayers: Player[]
  game?: GameState;
  playCard: (card: Card) => void;
}

const GameContext = createContext<GameContextProps | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { id } = useParams();
  const { data } = useSession();
  const { game, updateGame } = useGameState(String(id));

  const players = game?.players || [];
  const player = players.find((p) => p.userId === data?.user.id);
  const currentPlayerIndex = game?.players.findIndex((p) => p.userId === data?.user.id);
  const rotatedPlayers = [
    ...players.slice(currentPlayerIndex),
    ...players.slice(0, currentPlayerIndex),
  ];
  const { socket } = useSocket();

  useEffect(() => {
    if (!id || !socket) return;
    socket.on('game_update', (updatedGame: GameState) => updateGame(updatedGame));

    return () => {
      socket.off("game_update");
    };
  }, [id, socket]);

  const playCard = (card: Card) => {
    if(!socket) return;
    socket.emit("play_card", { card });
  }

  const handlePickCards = (cards: Card[]) => {
    if(!socket) return;
    socket.emit("pick_hand", { cards });
  };

  const retrieveCard = () => {
    if(!socket) return;
    socket.emit("retrieve_card")
  };

  const endTurn = () => {
    if(!socket) return;
    socket.emit("end_turn");
  };

  const drawTable = () => {
    if(!socket) return;
    socket.emit("draw_table");
  };

  return (
    <GameContext.Provider
      value={{
        game,
        player,
        rotatedPlayers,
        bunchCards: game?.bunch || [],
        endTurn,
        drawTable,
        retrieveCard,
        handlePickCards,
        playCard
      }}
    >
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
