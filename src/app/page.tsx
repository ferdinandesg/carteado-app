'use client'
import Deck, { Card } from "@/models/Cards";
import {useState, useEffect} from 'react'

export default function Home() {
  const [cards, setCards] = useState<Card[]>([])
  const [deck, setDeck] = useState<Deck>()
  useEffect(() => {
    setDeck(new Deck())
  }, [])
  console.log(deck);

  const handleDrawCard = () => {
    const cardDraw = deck!.draw()
    if(!cardDraw) return
    setCards(m => [...m, cardDraw])
  }
  return (
    <div className="flex flex-col w-1/2 m-auto">
      <div className="flex flex-wrap gap-2">
        {cards.map(card => <span className="border rounded p-2" key={card.toString()}>{card.toString()}</span>)}
      </div>
      <button className="bg-gray-500 hover:bg-gray-600 transition mt-2 p-2 text-white" onClick={handleDrawCard}>Draw a card</button>
      
    </div>
  );
}
