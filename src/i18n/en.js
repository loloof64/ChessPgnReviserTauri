export default {
  side: {
    white: "White",
    black: "Black",
  },
  gameFinished: {
    checkmate: "{player} won by checkmate !",
    stalemate: "Draw by stalemate !",
    "three-fold-repetition": "Draw by three-fold repetition !",
    "missing-material": "Draw by missing material !",
    "50-moves-rule": "Draw by the fifty moves rule !",
  },
  dialogs: {
    okButton: "OK",
    confirmButton: "Confirm",
    cancelButton: "Cancel",
    newGameConfirmation:
      "Do you want to stop current game and start a new one ?",
    stopGameConfirmation: "Do you want to stop current game ?",
    cancelledNewGame: "Cancelled new game.",
    newGameError: "An error occured : cancelled new game.",
    gameWon: "You've guessed all the game.",
    gameLost:
      "You made a wrong move\nMain line: {mainMove}\nVariations: {variations}",
    variationSelectionTitle: "Select the next move",
    variationSelectionMainMove: "Main move",
    variationSelectionVariations: "Variations",
  },
  newGameDialog: {
    title: "Select the game to study :",
    first: "First game",
    previous: "Previous game",
    next: "Next game",
    last: "Last game",
    whiteMode: "White",
    blackMode: "Black",
    guess: "Guess the move",
    manual: "Automatic game : you select the variations",
    auto: "Automatic game : computer selects randomly the variations",
  },
};
