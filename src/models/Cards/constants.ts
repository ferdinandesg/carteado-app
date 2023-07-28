import { Rank, Suit, Value } from './types';

export const FULL_DECK_CARD_COUNT = 52;

export const SUIT_TO_COLOR: Record<Suit, 'red' | 'black'> = {
    hearts: 'red',
    diamonds: 'red',
    spades: 'black',
    clubs: 'black',
};

export const ALL_RANKS: Rank[] = [
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
    'A',
];

export const ALL_SUITS: Suit[] = ['hearts', 'diamonds', 'spades', 'clubs'];

// If it's an array, it'll be [primaryValue, secondaryValue].
export const RANK_TO_VALUE: Record<Rank, Value | Value[]> = {
    '2': 14,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 14,
    J: 11,
    Q: 12,
    K: 13,
    A: [14, 1],
};