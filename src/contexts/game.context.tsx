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
  drawCard?: () => void;
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
  const [isYourTurn, setPlayerTurn] = useState<boolean>(true);
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
    const [lastCard] = tableCards.slice(-1);
    if (lastCard && card.rank < lastCard.rank)
      return alert("Your card rank is lower");
    setPlayerCards([
      ...playerCards.filter((x) => x.toString() !== card.toString()),
    ]);
    setTableCards([...tableCards, card]);
  }

  const drawCard = () => {
    if (!isYourTurn) return;
    if (playerCards.length === 3) return alert("You cant draw than 3 cards");
    setPlayerCards((m) => [...m, deck!.draw()!]);
  };

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
        drawCard,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
