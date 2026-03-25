import Deck from "./deck";
import { FULL_DECK_CARD_COUNT } from "./constants";

describe("Deck", () => {
  it("cria um baralho completo com 52 cartas por padrão", () => {
    const deck = new Deck();
    const cards = deck.getCards();
    expect(cards).toHaveLength(FULL_DECK_CARD_COUNT);
  });

  it("cria múltiplos baralhos quando especificado", () => {
    const deck = new Deck(2);
    const cards = deck.getCards();
    expect(cards).toHaveLength(FULL_DECK_CARD_COUNT * 2);
  });

  it("draw retorna cartas até esvaziar", () => {
    const deck = new Deck();
    for (let i = 0; i < FULL_DECK_CARD_COUNT; i++) {
      const card = deck.draw();
      expect(card).not.toBeNull();
    }
    expect(deck.draw()).toBeNull();
  });

  it("getCards retorna cópia do array", () => {
    const deck = new Deck();
    const cards1 = deck.getCards();
    const cards2 = deck.getCards();
    expect(cards1).not.toBe(cards2);
    expect(cards1).toEqual(cards2);
  });

  it("shuffle produz baralho com 52 cartas únicas válidas", () => {
    const deck = new Deck();
    const cards = deck.getCards().map((c) => `${c.rank}-${c.suit}`);
    expect(cards).toHaveLength(FULL_DECK_CARD_COUNT);
    expect(new Set(cards).size).toBe(FULL_DECK_CARD_COUNT);
  });

  it("serialize e deserialize preservam o estado", () => {
    const deck = new Deck();
    deck.draw();
    deck.draw();
    const serialized = deck.serialize();
    const restored = Deck.deserialize(serialized);
    expect(restored.getCards()).toEqual(deck.getCards());
    expect(restored.getCards()).toHaveLength(FULL_DECK_CARD_COUNT - 2);
  });

  it("isThisYourCard compara rank e suit corretamente", () => {
    const deck = new Deck();
    const cards = deck.getCards();
    const card1 = cards[0];
    const card2 = { ...card1 };
    const card3 = cards[1];
    expect(deck.isThisYourCard(card1, card2)).toBe(true);
    expect(deck.isThisYourCard(card1, card3)).toBe(false);
  });
});
