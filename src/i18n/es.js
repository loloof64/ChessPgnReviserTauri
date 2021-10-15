export default {
  side: {
    white: "Blancos",
    black: "Negros",
  },
  gameFinished: {
    checkmate: "{player} ganaron por jaque mate !",
    stalemate: "Igualdad por paralización !",
    "three-fold-repetition": "Igualdad por triple repetición !",
    "missing-material": "Igualdad por falta de material !",
    "50-moves-rule": "Igualdad por la regla de los 50 golpes !",
  },
  dialogs: {
    okButton: "OK",
    confirmButton: "Confirmar",
    cancelButton: "Cancelar",
    newGameConfirmation:
      "¿Quieres detener el juego actual y comenzar uno nuevo?",
    stopGameConfirmation: "¿Quieres detener el juego actual?",
    cancelledNewGame: "Nuevo juego cancelado.",
    newGameError: "Ocurrió un error: nuevo juego cancelado.",
    gameWon: "Has adivinado todo el juego.",
    gameLost:
      "Hiciste un movimiento en falso\nLínea principal: {mainMove}\nVariaciones: {variations}",
    variationSelectionTitle: "Seleccione el siguiente golpe",
    variationSelectionMainMove: "Golpe principal",
    variationSelectionVariations: "Variaciones",
  },
  newGameDialog: {
    title: "Selecciona el juego para estudiar :",
    first: "Primer juego",
    previous: "Juego anterior",
    next: "Siguiente juego",
    last: "Último juego",
    whiteMode: "Blancos",
    blackMode: "Negros",
  },
  gameMode: {
    guess: "Adivina el golpe",
    manual: "Juego automático: usted selecciona las variaciónes",
    auto:
      "Juego automático: la computadora selecciona aleatoriamente las variaciónes",
  },
  goal: {
    caption: "Objetivo",
    unknown: "?",
    whiteWin: "Los Blancos ganan",
    blackWin: "Los Negros ganan",
    draw: "Draw",
  },
  statusBar: {
    noGameRunning: "No hay juego en ejecución",
    white: "Blancos",
    black: "Negros",
    game: "Juego",
    number: "n°",
  },
};
