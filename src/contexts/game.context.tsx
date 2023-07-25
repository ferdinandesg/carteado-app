import Deck, { Card } from "@/models/Cards";
import { ReactNode, createContext, useEffect, useState } from "react";

interface GameContextProps {
  deck?: Deck;
  isLoading: boolean;
  players: number;
  isYourTurn: boolean;
  playerCards: Card[];
  tableCards: Card[];
  playCard?: (card: Card) => void;
}

const defaultGameProps: GameContextProps = {
  isLoading: true,
  players: 4,
  playerCards: [],
  tableCards: [],
  isYourTurn: false,
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
    const [lastCard] = tableCards.slice(-1);
    console.log({ lastCard });

    if (lastCard && card.rank < lastCard.rank)
      return alert("Your card rank is lower");
    setPlayerCards([
      ...playerCards.filter((x) => x.toString() !== card.toString()),
    ]);
    setTableCards([...tableCards, card]);
  }
  return (
    <GameContext.Provider
      value={{
        deck,
        playerCards,
        playCard,
        isLoading,
        players,
        tableCards,
        isYourTurn: true,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
