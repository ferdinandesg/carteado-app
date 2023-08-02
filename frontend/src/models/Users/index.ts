import { Card } from "../Cards";

export type UserSession = {
    email: string;
    name: string;
    image: string,
    rank?: number
}

export type Player = {
    hand: Card[],
    table: Card[],
    user: UserSession
}