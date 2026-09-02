export const CHANNEL = {
  SERVER: {
    CONNECTION: "connection",
    DISCONNECTING: "disconnecting",
    ERROR: "error",
    GAME_UPDATED: "game_updated",
    INFO: "info",
    JOIN_CHAT: "join_chat",
    LOAD_MESSAGES: "load_messages",
    PLAYER_JOINED: "player_joined",
    RECEIVE_MESSAGE: "receive_message",
    ROOM_JOINED: "room_joined",
    ROOM_UPDATED: "room_updated",
    USER_JOINED: "user_joined",
  },
  CLIENT: {
    ACCEPT_TRUCO: "accept_truco",
    ASK_TRUCO: "ask_truco",
    CONNECTION: "connection",
    DRAW_TABLE: "draw_table",
    END_TURN: "end_turn",
    JOIN_ROOM: "join_room",
    LEAVE_ROOM: "quit",
    PICK_HAND: "pick_hand",
    PLAY_CARD: "play_card",
    REJECT_TRUCO: "reject_truco",
    RETRIEVE_CARD: "retrieve_card",
    START_GAME: "start_game",
    JOIN_CHAT: "join_chat",
    SEND_MESSAGE: "send_message",
    SET_PLAYER_STATUS: "set_player_status",
  },
} as const;

export type ServerChannel =
  (typeof CHANNEL.SERVER)[keyof typeof CHANNEL.SERVER];
export type ClientChannel =
  (typeof CHANNEL.CLIENT)[keyof typeof CHANNEL.CLIENT];
