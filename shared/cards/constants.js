"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RANK_TO_VALUE = exports.ALL_SUITS = exports.ALL_RANKS = exports.SUIT_TO_COLOR = exports.FULL_DECK_CARD_COUNT = void 0;
exports.FULL_DECK_CARD_COUNT = 52;
exports.SUIT_TO_COLOR = {
    hearts: "red",
    diamonds: "red",
    spades: "black",
    clubs: "black",
};
exports.ALL_RANKS = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
];
exports.ALL_SUITS = ["hearts", "diamonds", "spades", "clubs"];
// If it's an array, it'll be [primaryValue, secondaryValue].
exports.RANK_TO_VALUE = {
    "2": 14,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 14,
    J: 11,
    Q: 12,
    K: 13,
    A: [14, 1],
};
