export const testIds = {
  room: {
    stage: "room-stage",
    loading: "room-loading",
    participantsPanel: "room-participants-panel",
    participantsList: "room-participants-list",
    backButton: "room-back-button",
  },
  lobby: {
    ready: "lobby-ready-button",
    startGame: "lobby-start-game-button",
  },
  game: {
    root: "game-root",
    table: "game-table",
    tableLoading: "game-table-loading",
    cardFan: "game-card-fan",
    choosingPhase: "game-choosing-phase",
    confirmHand: "game-confirm-hand",
    pickUpBunch: "game-pick-up-bunch",
    endTurn: "game-end-turn",
    askTruco: "game-ask-truco",
    acceptTruco: "game-accept-truco",
    rejectTruco: "game-reject-truco",
    deckCount: "game-deck-count",
    trucoHud: "game-truco-hud",
  },
  menu: {
    shell: "menu-shell",
    content: "menu-content",
    friendsPanel: "menu-friends-panel",
    friendsToggle: "menu-friends-toggle",
  },
} as const;
