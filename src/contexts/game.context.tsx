import Deck, { Card } from "@/models/Cards";
import { ReactNode, createContext, useEffect, useState } from "react";

interface GameContextProps {
  deck?: Deck;
  isLoading: boolean;
  players: number;
  isYourTurn: boolean;
  tableCards: Card[];
  handCards: Card[];
  bunchCards: Card[];
  playCard: (card: Card) => void;
  drawTable: () => void;
  handlePickCards: (cards: Card[]) => void;
}

const defaultGameProps: GameContextProps = {
  isLoading: true,
  players: 4,
  tableCards: [],
  handCards: [],
  bunchCards: [],
  isYourTurn: false,
  playCard: (card: Card) => {},
  drawTable: () => {},
  handlePickCards: (cards: Card[]) => {},
};

export const GameContext = createContext(defaultGameProps);

export function GameProvider({ children }: { children: ReactNode }) {
  const [deck, setDeck] = useState<Deck>();
  const [tableCards, setTableCards] = useState<Card[]>([]);
  const [bunchCards, setBunchCards] = useState<Card[]>([]);
  const [handCards, setHandCards] = useState<Card[]>([]);
  const [playerTurn, setPlayerTurn] = useState<boolean>(true);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [players, setPlayers] = useState<number>(4);
  const [nextPlayer, setNextPlayer] = useState<number>(0);

  useEffect(() => {
    const newDeck = new Deck();
    setLoading(false);
    setTableCards(newDeck.giveTableCards());
    setDeck(newDeck);
  }, []);

  function playCard(card: Card) {
    if (!playerTurn) return;
    const [lastCard] = bunchCards.slice(-1);
    if (lastCard && lastCard.value! > card.value!)
      return alert("Your card rank is lower");
    setBunchCards((m) => [...m, card]);
    applyRules(card, 1);
  }

  const handlePickCards = (cards: Card[]) => {
    setHandCards([...cards]);
    setTableCards([
      ...tableCards.filter(
        (x) => !cards.some((y) => y.toString() === x.toString())
      ),
    ]);
  };

  const applyRules = async (card: Card, quantity: number) => {
    switch (card.rank) {
      case "2":
        setNextPlayer(Math.floor((quantity + nextPlayer) / players));
        card.value = 1;
        break;
      case "10":
        setBunchCards([]);
        card.value = 1;
        break;
      default:
        break;
    }
    const lastThree = bunchCards.slice(-3);
    if (
      lastThree.length === 3 &&
      lastThree.every((x) => x.rank === card.rank)
    ) {
      setBunchCards([]);
    }
    setHandCards([
      ...handCards.filter((x) => x.toString() !== card.toString()),
    ]);
    drawCard();
  };

  const drawCard = () => {
    if (handCards.length >= 4) return;

    const draweeCard = deck!.draw();
    if (!draweeCard) return;
    setHandCards((m) => [
      ...m,
      {
        ...draweeCard,
        hidden: false,
      },
    ]);
  };

  const drawTable = () => {
    setHandCards((m) => [...m, ...bunchCards]);
    setBunchCards([]);
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
        drawTable,
        handlePickCards,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
