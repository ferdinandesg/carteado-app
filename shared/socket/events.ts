import { IGameState } from "shared/game";
import { RoomInterface } from "../types/room";
import {
  ChatMessage,
  JoinChatPayload,
  JoinRoomPayload,
  LeaveRoomPayload,
  PickHandPayload,
  PlayCardPayload,
  SendMessagePayload,
  SetPlayerStatusPayload,
  SystemNoticePayload,
} from "./payloads";

/** Eventos que o servidor emite e o cliente escuta (namespace `/room`). */
export interface ServerToClientEvents {
  error: (code: string) => void;
  info: (code: string) => void;
  game_updated: (game: IGameState) => void;
  room_updated: (room: RoomInterface) => void;
  room_joined: (payload: { room: RoomInterface }) => void;
  user_joined: (payload: SystemNoticePayload) => void;
  player_joined: (payload: SystemNoticePayload) => void;
  join_chat: (payload: ChatMessage) => void;
  load_messages: (messages: ChatMessage[]) => void;
  receive_message: (message: ChatMessage) => void;
}

/** Eventos que o cliente emite e o servidor escuta (namespace `/room`). */
export interface ClientToServerEvents {
  join_room: (payload: JoinRoomPayload) => void;
  quit: (payload: LeaveRoomPayload) => void;
  set_player_status: (payload: SetPlayerStatusPayload) => void;
  start_game: () => void;
  play_card: (payload: PlayCardPayload) => void;
  pick_hand: (payload: PickHandPayload) => void;
  retrieve_card: () => void;
  end_turn: () => void;
  draw_table: () => void;
  ask_truco: () => void;
  accept_truco: () => void;
  reject_truco: () => void;
  join_chat: (payload: JoinChatPayload) => void;
  send_message: (payload: SendMessagePayload) => void;
}

export type ServerEventName = keyof ServerToClientEvents;
export type ClientEventName = keyof ClientToServerEvents;
