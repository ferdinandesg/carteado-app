import Deck, { Card } from "@/models/Cards";
import { ReactNode, createContext, useEffect, useState } from "react";

interface GameContextProps {
  deck?: Deck;
  isLoading: boolean;
  players: number;
  playerCards: Card[];
  tableCards: Card[];
  playCard?: (card: Card) => void;
}

const defaultGameProps: GameContextProps = {
  isLoading: true,
  players: 4,
  playerCards: [],
  tableCards: [],
};

export const GameContext = createContext(defaultGameProps);

export function GameProvider({ children }: { children: ReactNode }) {
  const [deck, setDeck] = useState<Deck>();
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [tableCards, setTableCards] = useState<Card[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [players, setPlayers] = useState<number>(4);

  useEffect(() => {
    const newDeck = new Deck();
    setDeck(newDeck);
    setLoading(false);
    for (let i = 0; i < 3; i++) {
      setPlayerCards((m) => [...m, newDeck.draw()!]);
    }
  }, []);

  function playCard(card: Card) {
    console.log({ card });
    if (card.rank < tableCards[0]?.rank)
      return alert("Your card rank is lower");
    setPlayerCards([
      ...playerCards.filter((x) => x.toString() !== card.toString()),
    ]);
    setTableCards([...tableCards, card]);
  }
  return (
    <GameContext.Provider
      value={{ deck, playerCards, playCard, isLoading, players, tableCards }}
    >
      {children}
    </GameContext.Provider>
  );
}
