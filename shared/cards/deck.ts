import { ALL_RANKS, ALL_SUITS, RANK_TO_VALUE } from "./constants";
import { Card } from "./types";

class Deck {
  public cards: Card[] = [];
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
          toString: `${rank} of ${suit}`,
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
    // 1. Puxe todas as 9 cartas de uma vez
    const playerDeck: Card[] = [];
    for (let i = 0; i < 9; i++) {
      const cardDrawed = this.draw();
      if (cardDrawed) {
        playerDeck.push({ ...cardDrawed, isHidden: false }); // Começam todas visíveis
      }
    }

    // 2. Escolha 3 índices únicos aleatórios para esconder
    const hiddenIndices = new Set<number>();
    while (hiddenIndices.size < 3) {
      const randomIndex = Math.floor(Math.random() * playerDeck.length);
      hiddenIndices.add(randomIndex);
    }

    // 3. Aplique a propriedade 'isHidden' nos índices escolhidos
    hiddenIndices.forEach((index) => {
      playerDeck[index].isHidden = true;
    });

    return playerDeck;
  }

  public serialize(): string {
    return JSON.stringify(this.cards);
  }

  public static deserialize(serialized: string): Deck {
    const cards = JSON.parse(serialized);
    const deck = new Deck();
    deck.cards = cards;
    return deck;
  }
}

export default Deck;
