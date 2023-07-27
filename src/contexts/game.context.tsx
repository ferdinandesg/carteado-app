import Deck, { Card, PlayerCard } from "@/models/Cards";
import { ReactNode, createContext, useEffect, useState } from "react";

interface GameContextProps {
  deck?: Deck;
  isLoading: boolean;
  players: number;
  isYourTurn: boolean;
  tableCards: PlayerCard[];
  handCards: PlayerCard[];
  bunchCards: Card[];
  playCard: (card: Card) => void;
  drawCard: () => void;
  setHandCards: (cards: PlayerCard[]) => void;
}

const defaultGameProps: GameContextProps = {
  isLoading: true,
  players: 4,
  tableCards: [],
  handCards: [],
  bunchCards: [],
  isYourTurn: false,
  playCard: (card: Card) => {},
  drawCard: () => {},
  setHandCards: (cards: PlayerCard[]) => {},
};

export const GameContext = createContext(defaultGameProps);

export function GameProvider({ children }: { children: ReactNode }) {
  const [deck, setDeck] = useState<Deck>();
  const [tableCards, setTableCards] = useState<PlayerCard[]>([]);
  const [bunchCards, setBunchCards] = useState<Card[]>([]);
  const [handCards, setHandCards] = useState<PlayerCard[]>([]);
  const [isYourTurn, setPlayerTurn] = useState<boolean>(true);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [players, setPlayers] = useState<number>(4);

  useEffect(() => {
    const newDeck = new Deck();
    setLoading(false);
    setTableCards(newDeck.givetableCards());
    setDeck(newDeck);
  }, []);

  function playCard(card: Card) {
    const [lastBunchCard] = bunchCards.slice(-1);
    if (lastBunchCard && card.value < lastBunchCard.value)
      return alert("Your card rank is lower");
    setTableCards([
      ...tableCards.filter((x) => x.toString() !== card.toString()),
    ]);
    setBunchCards((m) => [...m, card]);
  }

  const drawCard = () => {
    if (!isYourTurn) return;
    if (tableCards.length === 3) return alert("You cant draw than 3 cards");
  };

  return (
    <GameContext.Provider
      value={{
        deck,
        handCards,
        tableCards,
        bunchCards,
        playCard,
        isLoading,
        players,
        isYourTurn: true,
        drawCard,
        setHandCards,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
