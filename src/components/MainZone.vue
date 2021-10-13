<template>
  <div id="main_zone">
    <div id="buttons_zone">
      <img
        class="button"
        @click="newGame"
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
    </div>
    <div id="game_zone">
      <loloof64-chessboard
        ref="board"
        :reversed="reversed"
        :white_player_human="whiteHuman"
        :black_player_human="blackHuman"
        :size="400"
        @move-done="handleMoveDone"
      />
      <history-component
        ref="history"
        width="400px"
        height="370px"
        @position-request="handlePositionRequest"
      />
      <game-selector ref="gameSelector" />
    </div>
    <Dialog
      class="dialog"
      v-model:visible="alertDialogVisible"
      closeable="false"
      :modal="true"
    >
      <p class="dialog-content">
        {{ alertDialogContent }}
      </p>

      <template #footer>
        <Button class="ok-button" :label="okButton" @click="handleAlertClose" />
      </template>
    </Dialog>
    <Dialog
      class="dialog"
      v-model:visible="confirmDialogVisible"
      closeable="false"
      :modal="true"
    >
      <p class="dialog-content">
        {{ confirmDialogContent }}
      </p>

      <template #footer>
        <Button
          class="cancel-button"
          :label="cancelButton"
          @click="handleCancel"
        />
        <Button
          class="confirm-button"
          :label="confirmButton"
          @click="handleConfirm"
        />
      </template>
    </Dialog>
  </div>
</template>

<script>
import parser from "@mliebelt/pgn-parser";
import HistoryComponent from "./HistoryComponent.vue";
import GameSelector from "@/components/GameSelector.vue";
import { ref, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { open } from "@tauri-apps/api/dialog";
import { readTextFile } from "@tauri-apps/api/fs";
export default {
  components: { HistoryComponent, GameSelector },
  setup() {
    const { t } = useI18n();

    const board = ref();
    const history = ref();
    const gameSelector = ref();
    const reversed = ref(false);
    const whiteHuman = ref(true);
    const blackHuman = ref(true);
    let expectedMoves = reactive([]);
    const nextHalfMoveSan = ref("");
    let nextHalfMoveVariationsSans = reactive([]);
    const nodeIndex = ref(0);
    let currentNode = reactive({});

    const alertDialogVisible = ref(false);
    const alertDialogContent = ref("");
    const confirmDialogVisible = ref(false);
    const confirmDialogContent = ref("");
    const okButton = ref(t("dialogs.okButton"));
    const confirmButton = ref(t("dialogs.confirmButton"));
    const cancelButton = ref(t("dialogs.cancelButton"));

    const onConfirmHandler = ref(() => {});

    async function newGame() {
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
      confirmDialogVisible.value = false;
    }

    function handleCancel() {
      confirmDialogVisible.value = false;
    }

    function handleAlertClose() {
      alertDialogVisible.value = false;
    }

    function showAlert(message) {
      alertDialogContent.value = message;
      alertDialogVisible.value = true;
    }

    function showConfirm(message, onConfirm) {
      confirmDialogContent.value = message;
      onConfirmHandler.value = onConfirm;
      confirmDialogVisible.value = true;
    }

    async function doStartNewGame() {
      try {
        const selectedFile = await open({
          directory: false,
          multiple: false,
          filters: [{ name: "Pgn file (*.pgn)", extensions: ["pgn"] }],
        });
        if (!selectedFile) {
          showAlert(t("dialogs.cancelledNewGame"));
          return;
        }
        const fileContent = await readTextFile(selectedFile, {});
        const parsedGames = parser.parse(fileContent, { startRule: "games" });
        let selectedGameIndex;
        try {
          selectedGameIndex = await gameSelector.value.open(parsedGames);
        } catch(err) {
          console.error(err)
          showAlert(t("dialogs.cancelledNewGame"));
          return;
        }
        
        const selectedGame = parsedGames[selectedGameIndex];
        const startPosition =
          selectedGame.tags["FEN"] ||
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        const startsAsBlack = startPosition.split(' ')[1] === 'b';
        reversed.value = startsAsBlack;
        expectedMoves = selectedGame.moves;
        currentNode = expectedMoves;
        nodeIndex.value = 0;
        nextHalfMoveSan.value =
          expectedMoves[nodeIndex.value].notation.notation;
        nextHalfMoveVariationsSans = expectedMoves[
          nodeIndex.value
        ].variations.map((elt) => elt[0].notation.notation);
        whiteHuman.value = true;
        blackHuman.value = true;
        const moveNumber = parseInt(startPosition.split(' ')[5]);
        history.value.newGame(moveNumber, !startsAsBlack);
        await board.value.newGame(startPosition);
      } catch (err) {
        console.error(err);
        showAlert(t("dialogs.newGameError"));
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
      return nextHalfMoveVariationsSans.findIndex((item) => item === moveSan);
    }

    function advanceNode() {
      nextHalfMoveSan.value = currentNode[nodeIndex.value].notation.notation;
      nextHalfMoveVariationsSans = currentNode[nodeIndex.value].variations.map(
        (elt) => elt[0].notation.notation
      );
    }

    function handleGameWon() {
      board.value.stop();
      history.value.gotoLast();
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

    function handleMoveDone(event) {
      const payload = event.detail.moveObject;
      const isExpectecMainMove = checkMainMoveCorrectness(payload);
      const expectedVariationMoveIndex = getVariationMoveIndex(payload);
      if (isExpectecMainMove) {
        history.value.addItem(payload);
        nodeIndex.value++;
        if (nodeIndex.value < currentNode.length - 1) {
          advanceNode();
        } else {
          handleGameWon();
        }
      } else if (expectedVariationMoveIndex >= 0) {
        currentNode =
          currentNode[nodeIndex.value].variations[expectedVariationMoveIndex];
        nodeIndex.value = 1;
        history.value.addItem(payload);
        if (nodeIndex.value < currentNode.length || 0) {
          advanceNode();
        } else {
          handleGameWon();
        }
      } else {
        const moveFan = moveSanToMoveFan(
          nextHalfMoveSan.value,
          !board.value.isWhiteTurn()
        );
        const variationsFans = nextHalfMoveVariationsSans.map((elt) =>
          moveSanToMoveFan(elt, !board.value.isWhiteTurn())
        );
        history.value.addItem(payload);
        board.value.stop();
        history.value.gotoLast();
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

    return {
      board,
      history,
      gameSelector,
      reversed,
      newGame,
      reverseBoard,
      handleMoveDone,
      handlePositionRequest,
      whiteHuman,
      blackHuman,
      alertDialogVisible,
      alertDialogContent,
      confirmDialogVisible,
      confirmDialogContent,
      okButton,
      confirmButton,
      cancelButton,
      handleConfirm,
      handleCancel,
      handleAlertClose,
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

#game_zone {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-self: flex-start;
  width: 850px;
}
</style>