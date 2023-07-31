export type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs';

export type Value = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export type Rank =
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'
  | 'A';

export type CardAsString = `${Rank} of ${Suit}`;

export interface Card {
  hidden?: boolean;
  suit: Suit;
  rank: Rank;
  value?: Value;
  secondaryValue: Value | null;
  toString: () => CardAsString;
}
