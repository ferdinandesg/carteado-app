'use client'
import Deck, { Card } from "@/models/Cards";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { SocketContext } from "./socket.context";
import { useSession } from 'next-auth/react'
interface GameContextProps {
  deck?: Deck;
  isLoading: boolean;
  players: number;
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
}


type StartGamePayloadType = {
  tableCards: Card[]
  email: string
}

type SelectHandsType = {
  email: string
  player: {
    hand: Card[]
    table: Card[]
  }
}
export const GameContext = createContext<GameContextProps | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { data } = useSession();
  const { socket } = useContext(SocketContext)!;
  const [deck, setDeck] = useState<Deck>();
  const [tableCards, setTableCards] = useState<Card[]>([]);
  const [bunchCards, setBunchCards] = useState<Card[]>([]);
  const [handCards, setHandCards] = useState<Card[]>([]);
  const [playerTurn, setPlayerTurn] = useState<boolean>(true);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [players, setPlayers] = useState<number>(4);
  const [cardsPlayed, setCardsPlayed] = useState<Card[]>([]);
  const [nextPlayer, setNextPlayer] = useState<number>(0);

  useEffect(() => {
    if (!socket) return
    socket.on("give_cards", (payload: string) => {
      const cards: StartGamePayloadType = JSON.parse(payload)
      if (data?.user?.email === cards.email) {
        // cards.tableCards.forEach(card => card.toString = `${card.rank} of ${card.suit}`)
        setTableCards([...cards.tableCards])
      }
    })
    socket.on("select_cards", (payload) => {
      setPlayerTurn(payload)
      setLoading(false)
    })
    socket.on("selected_hand", (payload) => {
      const obj: SelectHandsType = JSON.parse(payload)
      if (data?.user?.email === obj.email) {
        setTableCards([...obj.player.table])
        setHandCards([...obj.player.hand])
      }
    })
    socket.on("refresh_cards", (payload) => {
      const obj = JSON.parse(payload)
      console.log({ playerTurn: obj.playerTurn });

      if (obj.playerTurn) setPlayerTurn(obj.playerTurn)
      if (data?.user?.email === obj.player.user.email) {
        setTableCards([...obj.player.table])
        setHandCards([...obj.player.hand])
      }
      setBunchCards([...obj.bunch])
      console.log({ obj });
    })

  }, [socket]);

  function playCard(card: Card) {
    socket?.emit("play_card", { card })
  }

  const handlePickCards = (cards: Card[]) => {
    socket?.emit("pick_hand", { cards })
  };

  const retrieveCard = (card: Card) => {
    setBunchCards((m) => [
      ...m.filter((x) => x.toString !== card.toString),
    ]);
    setCardsPlayed((m) => [
      ...m.filter((x) => x.toString !== card.toString),
    ]);
    setHandCards((m) => [...m, card]);
  };

  const endTurn = () => {
    socket?.emit("end_turn")
  };

  const drawCards = () => {
    if (handCards.length >= 4) return;
    const draweesCard: Card[] = [];
    for (let i = handCards.length; i < 3; i++) {
      const draweeCard = deck!.draw();
      if (!draweeCard) return;
      draweesCard.push(draweeCard);
    }
    setHandCards((m) => [...m, ...draweesCard]);
  };

  const drawTable = () => {
    if (!playerTurn) return;
    setHandCards((m) => [...m, ...bunchCards]);
    setCardsPlayed(m => []);
    setBunchCards(m => []);
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
        players,
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
