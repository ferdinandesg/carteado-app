'use client'
import Deck, { Card } from "@/models/Cards";
import { ReactNode, createContext, useEffect, useState } from "react";

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

const defaultGameProps: GameContextProps = {
  isLoading: true,
  players: 4,
  tableCards: [],
  handCards: [],
  bunchCards: [],
  cardsPlayed: [],
  isYourTurn: false,
  playCard: (card: Card) => {},
  drawTable: () => {},
  endTurn: () => {},
  retrieveCard: (cards: Card) => {},
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
  const [cardsPlayed, setCardsPlayed] = useState<Card[]>([]);
  const [nextPlayer, setNextPlayer] = useState<number>(0);

  useEffect(() => {
    const newDeck = new Deck();
    setLoading(false);
    setTableCards(newDeck.giveTableCards());
    setDeck(newDeck);
  }, []);

  function playCard(card: Card) {
    const lastThree = bunchCards.slice(-3);
    if (
      lastThree.length === 3 &&
      lastThree.every((x) => x.rank === card.rank)
    ) {
      setBunchCards([]);
      setHandCards([
        ...handCards.filter((x) => x.toString() !== card.toString()),
      ]);
      return;
    }
    if (!playerTurn) return;
    applyRules(card);
  }

  const handlePickCards = (cards: Card[]) => {
    setHandCards([...cards]);
    setTableCards([
      ...tableCards.filter(
        (x) => !cards.some((y) => y.toString() === x.toString())
      ),
    ]);
  };

  const applyRules = async (card: Card, quantity: number = 1) => {
    const [lastCard] = bunchCards.slice(-1);
    if (lastCard && lastCard.value! > card.value!)
    return alert("Your card rank is lower");
    switch (card.rank) {
      case "2":
        setNextPlayer(Math.floor((quantity + nextPlayer) / players));
        card.value = 1;
        break;
      case "10":
        card.value = 1;
        break;
    }
    

    // if (cardsPlayed.length > 0 && lastCard && lastCard.value! !== card.value!) {
    //   console.log({lastCard});
    //   console.log({card});
      
    //   return alert("Your card rank different from your last played");
    // }
   
    setBunchCards((m) => [...m, card]);
    setHandCards([
      ...handCards.filter((x) => x.toString() !== card.toString()),
    ]);
    setCardsPlayed((m) => [...m, card]);
  };

  const retrieveCard = (card: Card) => {
    setBunchCards((m) => [
      ...m.filter((x) => x.toString() !== card.toString()),
    ]);
    setCardsPlayed((m) => [
      ...m.filter((x) => x.toString() !== card.toString()),
    ]);
    setHandCards((m) => [...m, card]);
  };

  const endTurn = () => {
    if (cardsPlayed.length === 0) return;
    if (bunchCards.some((x) => x.rank === "10"))
      setBunchCards((m) => [
        ...m.slice(m.findLastIndex((x) => x.rank === "10")+1),
      ]);
    setCardsPlayed([]);
    drawCards();
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
