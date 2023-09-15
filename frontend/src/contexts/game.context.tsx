"use client";
import { Card } from "@/models/Cards";
import {
  Dispatch,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSocket } from "./socket.context";
import { useSession } from "next-auth/react";
import useModalContext from "@/components/Modal/ModalContext";
import { Player } from "@/models/Users";

interface GameContextProps {
  isPlaying: boolean;
  isLoading: boolean;
  tableCards: Card[];
  handCards: Card[];
  bunchCards: Card[];
  turn: string | undefined;
  retrieveCard: (card: Card) => void;
  endTurn: () => void;
  drawTable: () => void;
  handlePickCards: (cards: Card[]) => void;
}


interface LoadTableProps {
  bunch: Card[];
  players: {
    hand: Card[];
    table: Card[];
    userId: string;
  }[];
}

type StartGamePayloadType = {
  tableCards: Card[];
  id: string;
};

type SelectHandsType = {
  id: string;
  player: {
    hand: Card[];
    table: Card[];
  };
};
const GameContext = createContext<GameContextProps | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { data } = useSession();
  const { socket } = useSocket();
  const { setShowModal } = useModalContext();

  const [turn, setTurn] = useState<string>();
  const [tableCards, setTableCards] = useState<Card[]>([]);
  const [bunchCards, setBunchCards] = useState<Card[]>([]);
  const [handCards, setHandCards] = useState<Card[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isPlaying, setPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (!socket) return;


    socket.on("refresh_cards", (payload) => {
      const obj = JSON.parse(payload);

      if (data?.user?.id === obj.player.userId) {
        setTableCards([...obj.player.table]);
        setHandCards([...obj.player.hand]);
      }
      setBunchCards([...obj.bunch]);
    });

    return () => {
      socket.off("refresh_cards");
    };
  }, [socket]);

 

  const handlePickCards = (cards: Card[]) => {
    socket?.emit("pick_hand", { cards });
  };

  const retrieveCard = (card: Card) => {
    socket?.emit("retrieve_card", { card })
    // setBunchCards((m) => [...m.filter((x) => x.toString !== card.toString)]);
    // setCardsPlayed((m) => [...m.filter((x) => x.toString !== card.toString)]);
    // setHandCards((m) => [...m, card]);
  };

  const endTurn = () => {
    socket?.emit("end_turn");
  };

  const drawTable = () => {
    socket?.emit("draw_table");
  };

  return (
    <GameContext.Provider
      value={{
        handCards,
        tableCards,
        bunchCards,
        isLoading,
        isPlaying,
        turn,
        endTurn,
        drawTable,
        retrieveCard,
        handlePickCards,
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
