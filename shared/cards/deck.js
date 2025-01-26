"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
class Deck {
    cards = [];
    numberOfFullDecks;
    constructor(numberOfFullDecks = 1) {
        this.numberOfFullDecks = numberOfFullDecks;
        this.shuffle();
    }
    resetDeck() {
        for (let i = 0; i < this.numberOfFullDecks; i++) {
            this.cards.push(...this.getFullDeck());
        }
    }
    getFullDeck() {
        const cards = [];
        for (let suit of constants_1.ALL_SUITS) {
            for (let rank of constants_1.ALL_RANKS) {
                const value = constants_1.RANK_TO_VALUE[rank];
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
    getCards() {
        return [...this.cards];
    }
    shuffle() {
        this.resetDeck();
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    draw() {
        return this.cards.pop() ?? null;
    }
    isThisYourCard(cardOne, cardTwo) {
        return cardOne.rank === cardTwo.rank && cardOne.suit === cardTwo.suit;
    }
    giveTableCards() {
        const playerDeck = [];
        while (playerDeck.length < 9) {
            const cardDrawed = this.draw();
            const hiddenCards = playerDeck.filter((x) => x.hidden).length;
            let shouldBeHidden = hiddenCards < 3 ? Math.random() > 0.5 : false;
            if (playerDeck.length === 8 && hiddenCards < 3) {
                shouldBeHidden = true;
            }
            playerDeck.push({
                ...cardDrawed,
                hidden: shouldBeHidden,
            });
        }
        return playerDeck;
    }
    serialize() {
        return JSON.stringify({
            cards: this.cards,
        });
    }
    static deserialize(serialized) {
        const { cards } = JSON.parse(serialized);
        const deck = new Deck();
        deck.cards = cards;
        return deck;
    }
}
exports.default = Deck;
