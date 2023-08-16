"use client";
import Deck, { Card } from "@/models/Cards";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSocket } from "./socket.context";
import { useSession } from "next-auth/react";
import useModalContext from "@/components/Modal/ModalContext";
import { useForm } from "react-hook-form";
interface GameContextProps {
  deck?: Deck;
  isLoading: boolean;
  isYourTurn: boolean;
  tableCards: Card[];
  cardsPlayed: Card[];
  handCards: Card[];
  bunchCards: Card[];
  playCard: (card: Card) => void;
  retrieveCard: (card: Card) => void;
  endTurn: () => void;
  drawTable: () => void;
  handlePickCards: (cards: Card[]) => void;
  //Dispatch<SetStateAction<Card[]>>
}

interface Player {
  hand: Card[];
  table: Card[];
  userId: string;
};
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

type GameFormProps = {
  players: Player[]
  bunchCards: Card[]
}


export function GameProvider({ children }: { children: ReactNode }) {
  const { data } = useSession();
  const { socket } = useSocket();
  const { setValue } = useForm<GameFormProps>();
  const { setShowModal } = useModalContext();
  const [deck, setDeck] = useState<Deck>();
  const [tableCards, setTableCards] = useState<Card[]>([]);
  const [bunchCards, setBunchCards] = useState<Card[]>([]);
  const [handCards, setHandCards] = useState<Card[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [cardsPlayed, setCardsPlayed] = useState<Card[]>([]);

  useEffect(() => {
    if (!socket) return;
    socket.on("give_cards", (payload: string) => {
      const cards: StartGamePayloadType = JSON.parse(payload);
      if (data?.user?.id === cards.id) {
        setTableCards([...cards.tableCards]);
      }
    });
    socket.on("begin_match", () => setLoading(false));
    socket.on("selected_hand", (payload) => {
      const obj: SelectHandsType = JSON.parse(payload);
      if (data?.user?.id === obj.id) {
        setTableCards([...obj.player.table]);
        setHandCards([...obj.player.hand]);
      }
    });
    socket.on("refresh_cards", (payload) => {
      const obj = JSON.parse(payload);

      if (data?.user?.id === obj.player.userId) {
        setTableCards([...obj.player.table]);
        setHandCards([...obj.player.hand]);
      }
      setBunchCards([...obj.bunch]);
    });

    socket.on("load_table", (room) => {
      const payload: LoadTableProps = JSON.parse(room);
      const foundPlayer = payload.players.find((x) => x.userId === data?.user.id);
      setBunchCards([...payload.bunch]);
      if (!foundPlayer) return;
      if (data?.user?.id === foundPlayer.userId) {
        setTableCards([...foundPlayer.table]);
        setHandCards([...foundPlayer.hand]);
      }
      setShowModal(false);
    });

    return () => {
      socket.off("give_cards");
      socket.off("select_cards");
      socket.off("selected_hand");
      socket.off("refresh_cards");
      socket.off("load_table");
    };
  }, [socket]);

  function playCard(card: Card) {
    socket?.emit("play_card", { card });
  }

  const handlePickCards = (cards: Card[]) => {
    socket?.emit("pick_hand", { cards });
  };

  const retrieveCard = (card: Card) => {
    setBunchCards((m) => [...m.filter((x) => x.toString !== card.toString)]);
    setCardsPlayed((m) => [...m.filter((x) => x.toString !== card.toString)]);
    setHandCards((m) => [...m, card]);
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
        deck,
        handCards,
        tableCards,
        bunchCards,
        cardsPlayed,
        isLoading,
        isYourTurn: true,
        playCard,
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
