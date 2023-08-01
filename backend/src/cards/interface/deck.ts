import { ALL_RANKS, ALL_SUITS, RANK_TO_VALUE } from "./constants";
import { Card } from "./types";

class Deck {
  private cards: Card[] = [];
  private numberOfFullDecks: number;

  constructor(numberOfFullDecks: number = 1) {
    this.numberOfFullDecks = numberOfFullDecks;
    this.shuffle();
  }

  private resetDeck(): void {
    for (let i = 0; i < this.numberOfFullDecks; i++) {
      this.cards.push(...this.getFullDeck());
    }
  }

  private getFullDeck(): Card[] {
    const cards: Card[] = [];

    for (let suit of ALL_SUITS) {
      for (let rank of ALL_RANKS) {
        const value = RANK_TO_VALUE[rank];
        cards.push({
          suit,
          rank,
          value: Array.isArray(value) ? value[0] : value,
          secondaryValue: Array.isArray(value) ? value[1] : null,
          toString: () => `${rank} of ${suit}`,
        });
      }
    }
    return cards;
  }

  getCards(): Card[] {
    return [...this.cards];
  }

  shuffle(): void {
    this.resetDeck();
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw(): Card | null {
    return this.cards.pop() ?? null;
  }

  isThisYourCard(cardOne: Card, cardTwo: Card): boolean {
    return cardOne.rank === cardTwo.rank && cardOne.suit === cardTwo.suit;
  }

  giveTableCards(): Card[] {
    const playerDeck: Card[] = [];
    while (playerDeck.length < 9) {
      const cardDrawed = this.draw();
      const hiddenCards = playerDeck.filter((x) => x.hidden);
      playerDeck.push({
        ...cardDrawed!,
        hidden: hiddenCards.length < 3 ?? Math.floor(Math.random() * 10) > 5
      });
    }
    return playerDeck;
  }
}

export default Deck;
