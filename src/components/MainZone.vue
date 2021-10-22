<template>
  <div id="main_zone">
    <div id="buttons_zone">
      <img
        class="button"
        @click="newGameRequest"
        width="50"
        height="50"
        src="../assets/images/start.png"
      />
      <img
        class="button"
        @click="reverseBoard"
        width="50"
        height="50"
        src="../assets/images/reverse.png"
      />
      <img
        class="button"
        @click="stopGameRequest"
        width="50"
        height="50"
        src="../assets/images/stop.png"
      />
      <img
        class="button"
        v-if="gameInReview"
        @click="saveGameToPgn"
        width="50"
        height="50"
        src="../assets/images/disk.png"
      />
    </div>
    <div id="game_zone">
      <loloof64-chessboard
        ref="board"
        :reversed="reversed"
        :white_player_human="playersTypes.whiteHuman"
        :black_player_human="playersTypes.blackHuman"
        white_cell_color="navajowhite"
        black_cell_color="peru"
        background="gray"
        :size="450"
        @move-done="handleMoveDone"
      />
      <history-component
        ref="history"
        width="400px"
        height="410px"
        @position-request="handlePositionRequest"
      />
      <game-selector ref="gameSelector" />
    </div>
    <ModalDialog ref="alertDialog">
      <p class="dialog-content">
        {{ alertDialogContent }}
      </p>

      <button class="ok-button" @click="handleAlertClose">
        {{ okButton }}
      </button>
    </ModalDialog>
    <ModalDialog ref="confirmDialog">
      <p class="dialog-content">
        {{ confirmDialogContent }}
      </p>

      <div>
        <button class="cancel-button" @click="handleCancel">
          {{ cancelButton }}
        </button>
        <button class="confirm-button" @click="handleConfirm">
          {{ confirmButton }}
        </button>
      </div>
    </ModalDialog>
    <ModalDialog ref="selectVariationMoveDialog">
      <div class="variationSelectionRoot">
        <h5>{{ variationSelectionTitle }}</h5>
        <span class="subtitle">{{ variationSelectionMainMoveLabel }}</span>
        <span class="standard" @click="playMainMove">{{
          nextHalfMoveSan
        }}</span>
        <span class="subtitle">{{ variationSelectionVariationsLabel }}</span>
        <ul class="variationSelectionList">
          <li
            class="variationSelectionItem"
            v-for="item in nextHalfMoveVariationsSanList"
            :key="item"
            @click="() => handleVariationMoveSelected(item)"
          >
            {{ item }}
          </li>
        </ul>
      </div>
    </ModalDialog>
  </div>
</template>

<script>
import parser from "@mliebelt/pgn-parser";
import HistoryComponent from "@/components/HistoryComponent.vue";
import GameSelector from "@/components/GameSelector.vue";
import ModalDialog from "@/components/ModalDialog.vue";
import { ref, reactive, watch } from "vue";
import { useI18n } from "vue-i18n";
import { open, save } from "@tauri-apps/api/dialog";
import { readTextFile, writeFile } from "@tauri-apps/api/fs";

import {
  PLAYER_MODE_CHOOSE_MOVE,
  PLAYER_MODE_GUESS_MOVE,
  PLAYER_MODE_RANDOM_MOVE,
} from "../constants";

export default {
  components: { HistoryComponent, GameSelector, ModalDialog },
  setup(props, ctx) {
    const { t } = useI18n();

    const board = ref();
    const history = ref();
    const gameSelector = ref();
    const reversed = ref(false);
    const playersTypes = reactive({
      whiteHuman: true,
      blackHuman: true,
    });
    let expectedMoves = reactive([]);
    const nextHalfMoveSan = ref("");
    let nextHalfMoveVariationsSanList = ref([]);
    const nodeIndex = ref(0);
    let currentNode = reactive({});

    const whiteMode = ref(PLAYER_MODE_GUESS_MOVE);
    const blackMode = ref(PLAYER_MODE_GUESS_MOVE);

    const gameData = ref();

    const gameString = ref('');

    const gameInReview = ref(false);
    const alertDialog = ref();
    const alertDialogContent = ref("");
    const confirmDialog = ref();
    const confirmDialogContent = ref("");
    const selectVariationMoveDialog = ref();
    const okButton = ref(t("dialogs.okButton"));
    const confirmButton = ref(t("dialogs.confirmButton"));
    const cancelButton = ref(t("dialogs.cancelButton"));
    const variationSelectionTitle = ref(t("dialogs.variationSelectionTitle"));
    const variationSelectionMainMoveLabel = ref(
      t("dialogs.variationSelectionMainMove")
    );
    const variationSelectionVariationsLabel = ref(
      t("dialogs.variationSelectionVariations")
    );

    const onConfirmHandler = ref(() => {});

    async function newGameRequest() {
      const boardPosition = await board.value.getCurrentPosition();
      const boardStalled = boardPosition.startsWith(
        "8/8/8/8/8/8/8/8 w - - 0 1"
      );
      if (!boardStalled) {
        showConfirm(t("dialogs.newGameConfirmation"), doStartNewGame);
      } else {
        doStartNewGame();
      }
    }

    function handleConfirm() {
      onConfirmHandler.value();
      confirmDialog.value.close();
    }

    function handleCancel() {
      confirmDialog.value.close();
    }

    function handleAlertClose() {
      alertDialog.value.close();
    }

    function showAlert(message) {
      alertDialogContent.value = message;
      alertDialog.value.open();
    }

    function showConfirm(message, onConfirm) {
      confirmDialogContent.value = message;
      onConfirmHandler.value = onConfirm;
      confirmDialog.value.open();
    }

    async function doStartNewGame() {
      try {
        const selectedFile = await open({
          directory: false,
          multiple: false,
          filters: [{ name: t("misc.pgnFilter"), extensions: ["pgn"] }],
        });
        if (!selectedFile) {
          showAlert(t("dialogs.cancelledNewGame"));
          return;
        }
        const fileContent = await readTextFile(selectedFile, {});
        const parsedGames = parser.parse(fileContent, { startRule: "games" });
        let selectedGameParams;
        try {
          selectedGameParams = await gameSelector.value.open(parsedGames);
        } catch (err) {
          console.error(err);
          showAlert(t("dialogs.cancelledNewGame"));
          return;
        }

        const {
          index: selectedGameIndex,
          whiteMode: whiteModeParam,
          blackMode: blackModeParam,
        } = selectedGameParams;

        const selectedGame = parsedGames[selectedGameIndex];
        const startPosition =
          selectedGame.tags["FEN"] ||
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        const startsAsBlack = startPosition.split(" ")[1] === "b";
        const whiteSideNotInGuessMode =
          whiteModeParam !== PLAYER_MODE_GUESS_MOVE;
        const blackSideInGuessMode = blackModeParam === PLAYER_MODE_GUESS_MOVE;
        reversed.value =
          blackSideInGuessMode && whiteSideNotInGuessMode;
        expectedMoves = selectedGame.moves;
        currentNode = filterMoves(expectedMoves);
        nodeIndex.value = 0;
        nextHalfMoveSan.value =
          expectedMoves[nodeIndex.value].notation.notation;
        nextHalfMoveVariationsSanList.value = expectedMoves[
          nodeIndex.value
        ].variations.map((elt) => elt[0].notation.notation);
        whiteMode.value = whiteModeParam;
        blackMode.value = blackModeParam;
        playersTypes.whiteHuman = whiteMode.value === PLAYER_MODE_GUESS_MOVE;
        playersTypes.blackHuman = blackMode.value === PLAYER_MODE_GUESS_MOVE;
        const moveNumber = parseInt(startPosition.split(" ")[5]);

        gameData.value = {
          gameNumber: selectedGameIndex + 1,
          filePath: selectedFile,
          gameGoal: selectedGame.tags["Goal"],
          whiteMode: whiteModeParam,
          blackMode: blackModeParam,
        };

        setTimeout(async () => {
          gameInReview.value = false;
          history.value.newGame(moveNumber, !startsAsBlack);
          await board.value.newGame(startPosition);

          // Lets the interface refresh before next move if not manual.
          setTimeout(() => {
            playNextMoveIfPossible();
          }, 50);
        }, 50);
      } catch (err) {
        console.error(err);
        showAlert(t("dialogs.newGameError"));
      }
    }

    function playNextMoveIfPossible() {
      const whiteTurn = board.value.isWhiteTurn();
      const currentMoveInGuessMode =
        (whiteTurn && whiteMode.value === PLAYER_MODE_GUESS_MOVE) ||
        (!whiteTurn && blackMode.value === PLAYER_MODE_GUESS_MOVE);

      if (currentMoveInGuessMode) return;
      const nextMoveHasVariations =
        nextHalfMoveVariationsSanList.value.length > 0;

      if (nextMoveHasVariations) {
        const currentMode = whiteTurn ? whiteMode.value : blackMode.value;
        const isInAutoSelectMode = currentMode === PLAYER_MODE_RANDOM_MOVE;

        if (isInAutoSelectMode) {
          const mustPlayMainMove = Math.random() >= 0.5;
          if (mustPlayMainMove) {
            board.value.playMoveSan(nextHalfMoveSan.value);
          } else {
            const variationsCount = nextHalfMoveVariationsSanList.value.length;
            const selectedVariationIndex = parseInt(
              Math.random() * variationsCount
            );
            const selectedMoveSan =
              nextHalfMoveVariationsSanList.value[selectedVariationIndex];
            board.value.playMoveSan(selectedMoveSan);
          }
        }
        // Lets user choose next move.
        else {
          selectVariationMoveDialog.value.open();

          // We should NOT try to play next move, in order to avoid infinite loop
          // If we don't return now, this is what will happen, because of following lines !
          return;
        }
      }
      // Simply plays next move.
      else {
        board.value.playMoveSan(nextHalfMoveSan.value);
      }
    }

    function reverseBoard() {
      reversed.value = !reversed.value;
    }

    function checkMainMoveCorrectness(moveObject) {
      const moveSan = moveObject.moveSan;
      return moveSan === nextHalfMoveSan.value;
    }

    function getVariationMoveIndex(moveObject) {
      const moveSan = moveObject.moveSan;
      return nextHalfMoveVariationsSanList.value.findIndex(
        (item) => item === moveSan
      );
    }

    // Strips result node from moves array.
    function filterMoves(nodesArray) {
      return nodesArray.filter((elt) => !!elt.notation);
    }

    // Updates current move pointer, next main move and next variations (if possible).
    // Also tries to play next move if should be played automatically.
    function advanceNode() {
      nodeIndex.value++;
      if (nodeIndex.value < currentNode.length) {
        nextHalfMoveSan.value = currentNode[nodeIndex.value].notation.notation;
        nextHalfMoveVariationsSanList.value = currentNode[
          nodeIndex.value
        ].variations.map((elt) => elt[0].notation.notation);

        // Lets the interface refresh before next move if not manual.
        setTimeout(() => {
          playNextMoveIfPossible();
        }, 50);
      } else {
        handleGameWon();
      }
    }

    function handleGameWon() {
      board.value.stop();
      gameString.value = getGamePgnString();
      history.value.gotoLast();
      gameInReview.value = true;
      showAlert(t("dialogs.gameWon"));
    }

    function moveSanToMoveFan(moveSan, whiteTurn) {
      const charset = "nbrqkNBRQK";
      const firstPieceCharIndex = moveSan
        .split("")
        .findIndex((elt) => charset.includes(elt));
      if (firstPieceCharIndex < 0) return moveSan;

      const firstPieceChar = moveSan.charAt(firstPieceCharIndex);
      const firstPart = moveSan.substring(0, firstPieceCharIndex);
      const lastPart = moveSan.substring(firstPieceCharIndex + 1);

      let middlePart;
      switch (firstPieceChar) {
        case "N":
          middlePart = whiteTurn ? "\u2658" : "\u265e";
          break;
        case "B":
          middlePart = whiteTurn ? "\u2657" : "\u265d";
          break;
        case "R":
          middlePart = whiteTurn ? "\u2656" : "\u265c";
          break;
        case "Q":
          middlePart = whiteTurn ? "\u2655" : "\u265b";
          break;
        case "K":
          middlePart = whiteTurn ? "\u2654" : "\u265a";
          break;
      }

      return `${firstPart}${middlePart}${lastPart}`;
    }

    /* Be careful !
    Called after EACH move : human or not
    */
    function handleMoveDone(event) {
      const payload = event.detail.moveObject;
      const isExpectecMainMove = checkMainMoveCorrectness(payload);
      const expectedVariationMoveIndex = getVariationMoveIndex(payload);
      const matchAVariationMove = expectedVariationMoveIndex >= 0;
      // User found the main move
      if (isExpectecMainMove) {
        history.value.addItem(payload);
        advanceNode();
      }
      // User found a variation move
      else if (matchAVariationMove) {
        currentNode = filterMoves(
          currentNode[nodeIndex.value].variations[expectedVariationMoveIndex]
        );
        nodeIndex.value = 0;
        history.value.addItem(payload);
        advanceNode();
      }
      // User failed to find an expected move.
      else {
        const moveFan = moveSanToMoveFan(
          nextHalfMoveSan.value,
          !board.value.isWhiteTurn()
        );
        const variationsFans = nextHalfMoveVariationsSanList.value.map((elt) =>
          moveSanToMoveFan(elt, !board.value.isWhiteTurn())
        );
        history.value.addItem(payload);
        board.value.stop();
        gameString.value = getGamePgnString();
        history.value.gotoLast();
        gameInReview.value = true;
        showAlert(
          t("dialogs.gameLost", {
            mainMove: moveFan,
            variations: variationsFans.join(" | "),
          })
        );
        return;
      }
    }

    function handlePositionRequest(event) {
      const success = board.value.setPositionAndLastMove(event);
      if (success) {
        history.value.notifyNodeSelected(event.index);
      }
    }

    function handleVariationMoveSelected(moveSan) {
      board.value.playMoveSan(moveSan);
      selectVariationMoveDialog.value.close();
    }

    function playMainMove() {
      board.value.playMoveSan(nextHalfMoveSan.value);
      selectVariationMoveDialog.value.close();
    }

    async function stopGameRequest() {
      const boardPosition = await board.value.getCurrentPosition();
      const boardStalled = boardPosition.startsWith(
        "8/8/8/8/8/8/8/8 w - - 0 1"
      );
      const gameInProgress = board.value.gameIsInProgress();
      if (!boardStalled && gameInProgress) {
        showConfirm(t("dialogs.stopGameConfirmation"), doStopGame);
      }
    }

    function doStopGame() {
      board.value.stop();
      gameString.value = getGamePgnString();
      history.value.gotoLast();
      gameInReview.value = true;
    }

    function gameModeToPlayerName(gameMode) {
      if (gameMode === PLAYER_MODE_GUESS_MOVE) return "Player (guess moves)";
      if (gameMode === PLAYER_MODE_RANDOM_MOVE)
        return "Computer (automatic moves selection)";
      if (gameMode === PLAYER_MODE_CHOOSE_MOVE)
        return "Computer (manual moves selection)";
      return "?";
    }

    /**
     * Gets the game pgn string
     * Must be called before an history move is commited, as it clears the current game data !
     */
    function getGamePgnString() {
      let whiteName = gameModeToPlayerName(whiteMode.value);
      let blackName = gameModeToPlayerName(blackMode.value);
      return board.value.gamePgn({ whiteName, blackName });
    }

    async function saveGameToPgn() {
      try {
        const selectedFile = await save({
          filters: [{ name: t("misc.pgnFilter"), extensions: ["pgn"] }],
        });
        if (!selectedFile) {
          showAlert(t("dialogs.cancelledSaveGame"));
          return;
        }

        await writeFile({
          contents: gameString.value,
          path: selectedFile,
        });

        showAlert(t("dialogs.saveGameSuccess"));
      } catch (ex) {
        console.error(ex);
        showAlert(t("dialogs.saveGameError"));
      }
    }

    watch(gameData, () => {
      ctx.emit("gameDataReady", gameData.value);
    });

    return {
      board,
      history,
      gameSelector,
      reversed,
      newGameRequest,
      reverseBoard,
      handleMoveDone,
      handlePositionRequest,
      playersTypes,
      alertDialog,
      alertDialogContent,
      confirmDialog,
      confirmDialogContent,
      okButton,
      confirmButton,
      cancelButton,
      handleConfirm,
      handleCancel,
      handleAlertClose,
      handleVariationMoveSelected,
      playMainMove,
      selectVariationMoveDialog,
      variationSelectionTitle,
      nextHalfMoveSan,
      nextHalfMoveVariationsSanList,
      variationSelectionMainMoveLabel,
      variationSelectionVariationsLabel,
      stopGameRequest,
      gameInReview,
      saveGameToPgn,
    };
  },
};
</script>

<style scoped>
#main_zone {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#buttons_zone {
  margin: 10px 0px;
}

.button {
  margin: 0px 5px;
  border: 1px solid black;
}

span.subtitle {
  font-size: 1.3rem;
  font-weight: bold;
}

span.standard {
  font-size: 1.1rem;
  font-weight: lighter;
}

#game_zone {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-self: flex-start;
  width: 100%;
}

.variationSelectionRoot {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: flex-start;
}

.variationSelectionList {
  overflow-y: scroll;
}

.variationSelectionItem {
  list-style-type: none;
  font-size: 1.2rem;
}

loloof64-chessboard {
  margin: 0 10px;
}

.ok-button,
.confirm-button,
.cancel-button {
  font-size: 1.1rem;
}
</style>