export default {
  side: {
    white: "Les Blancs",
    black: "Les Noirs",
  },
  gameFinished: {
    checkmate: "{player} ont gagné par échec et mat !",
    stalemate: "Nulle par pat !",
    "three-fold-repetition": "Nulle par triple répétition !",
    "missing-material": "Nulle par manque de matériel !",
    "50-moves-rule": "Nulle par la règle des 50 coups !",
  },
  dialogs: {
    okButton: "OK",
    confirmButton: "Confirmer",
    cancelButton: "Annuler",
    newGameConfirmation:
      "Souhaitez-vous arrêter la partie en cours et démarrer une nouvelle ?",
    stopGameConfirmation: "Souhaitez-vous arrêter la partie en cours ?",
    cancelledNewGame: "Annulation de la nouvelle partie.",
    newGameError: "Une erreur est survenue: annulation de la nouvelle partie.",
    gameWon: "Vous avez deviné l'ensemble de la partie.",
    gameLost:
      "Vous vous êtes trompé de coup\nLigne principale: {mainMove}\nVariantes: {variations}",
    variationSelectionTitle: "Choisissez le prochain coup",
    variationSelectionMainMove: "Coup principal",
    variationSelectionVariations: "Variantes",
    cancelledSaveGame: "Annulation de la sauvegarde du fichier.",
    saveGameError: "Une erreur est survenue: annulation de la sauvegarde de la partie.",
    saveGameSuccess: "Partie sauvegardée.",
  },
  newGameDialog: {
    title: "Choisissez la partie à étudier :",
    first: "Première partie",
    previous: "Partie précédente",
    next: "Partie suivante",
    last: "Dernière partie",
    whiteMode: "Blancs",
    blackMode: "Noirs",
  },
  gameMode: {
    guess: "Deviner les coups",
    manual: "Jeu automatique : vous choisissez les variantes",
    auto: "Jeu automatique : l'ordinateur choisit aléatoirement les variantes",
  },
  goal: {
    caption: "Objectif",
    unknown: "?",
    whiteWin: "Gain blanc",
    blackWin: "Gain noir",
    draw: "Nulle",
  },
  statusBar: {
    noGameRunning: "Aucune partie démarrée",
    white: "Blancs",
    black: "Noirs",
    game: "Partie",
    number: "n°",
  },
  misc: {
    pgnFilter: "Fichier pgn (*.pgn)",
  }
};
