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
      <img
        class="button"
        @click="stopGame"
        width="50"
        height="50"
        src="../assets/images/stop.png"
      />
    </div>
    <div id="game_zone">
      <loloof64-chessboard
        ref="board"
        size="400"
        :reversed="reversed"
        :white_player_human="whiteHuman"
        :black_player_human="blackHuman"
        @checkmate="handleCheckmate"
        @stalemate="handleStalemate"
        @perpetual-draw="handlePerpetualDraw"
        @missing-material-draw="handleMissingMaterialDraw"
        @fifty-moves-draw="handleFiftyMovesDraw"
        @move-done="handleMoveDone"
      />
      <history-component
        ref="history"
        width="400px"
        height="370px"
        @position-request="handlePositionRequest"
      />
    </div>
  </div>
</template>

<script>
const CHESSBOARD_CB_DELAY_MS = 50;

import "@loloof64/chessboard-component/dist";
import parser from "@mliebelt/pgn-parser";
import HistoryComponent from "./HistoryComponent.vue";
import { ref, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { open } from "@tauri-apps/api/dialog";
import { readTextFile } from "@tauri-apps/api/fs";
export default {
  components: { HistoryComponent },
  setup() {
    const { t } = useI18n();

    const board = ref();
    const history = ref();
    const reversed = ref(false);
    const whiteHuman = ref(true);
    const blackHuman = ref(true);
    let expectedMoves = reactive([]);
    const nextHalfMoveSan = ref("");
    let nextHalfMoveVariationsSans = reactive([]);
    const nodeIndex = ref(0);
    let currentNode = reactive({});

    async function newGame() {
      const boardStalled = board.value
        .getCurrentPosition()
        .startsWith("8/8/8/8/8/8/8/8 w - - 0 1");
      if (!boardStalled) {
        const userConfirmed = await confirm(t("dialogs.newGameConfirmation"));
        if (userConfirmed) {
          doStartNewGame();
        }
      } else {
        doStartNewGame();
      }
    }

    async function doStartNewGame() {
      try {
        const selectedFile = await open({
          directory: false,
          multiple: false,
          filters: [{ name: "Pgn file (*.pgn)", extensions: ["pgn"] }],
        });
        if (!selectedFile) {
          alert(t("dialogs.cancelledNewGame"));
          return;
        }
        const fileContent = await readTextFile(selectedFile, {});
        const parsedGames = parser.parse(fileContent, { startRule: "games" });
        const selectedGameIndex = 0;
        const selectedGame = parsedGames[selectedGameIndex];
        const startPosition =
          selectedGame.tags["FEN"] ||
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
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
        history.value.newGame(startPosition);
        board.value.newGame(startPosition);
      } catch (err) {
        console.error(err);
        alert(t("dialogs.newGameError"));
      }
    }

    function reverseBoard() {
      reversed.value = !reversed.value;
    }

    function handleCheckmate({ whiteTurnBeforeMove }) {
      const player = whiteTurnBeforeMove ? t("side.white") : t("side.black");
      setTimeout(() => {
        history.value.gotoLast();
        alert(t("gameFinished.checkmate", { player }));
      }, CHESSBOARD_CB_DELAY_MS);
    }

    function handleStalemate() {
      setTimeout(() => {
        history.value.gotoLast();
        alert(t("gameFinished.stalemate"));
      }, CHESSBOARD_CB_DELAY_MS);
    }

    function handlePerpetualDraw() {
      setTimeout(() => {
        history.value.gotoLast();
        alert(t("gameFinished.checkmate"));
      }, CHESSBOARD_CB_DELAY_MS);
    }

    function handleMissingMaterialDraw() {
      setTimeout(() => {
        history.value.gotoLast();
        alert(t("gameFinished.three-fold-repetition"));
      }, CHESSBOARD_CB_DELAY_MS);
    }

    function handleFiftyMovesDraw() {
      setTimeout(() => {
        history.value.gotoLast();
        alert(t("gameFinished.50-moves-rule"));
      }, CHESSBOARD_CB_DELAY_MS);
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
      alert(t("dialogs.gameWon"));
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
        nodeIndex.value++;
        if (nodeIndex.value < currentNode.length - 1) {
          advanceNode();
        } else {
          handleGameWon();
        }
        history.value.addItem(payload);
      } else if (expectedVariationMoveIndex >= 0) {
        currentNode =
          currentNode[nodeIndex.value].variations[expectedVariationMoveIndex];
        nodeIndex.value = 1;
        if (nodeIndex.value < currentNode.length || 0) {
          advanceNode();
        } else {
          handleGameWon();
        }
        history.value.addItem(payload);
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
        alert(
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

    async function stopGame() {
      if (!board.value.gameIsInProgress()) return;
      const confirmed = await confirm(t("dialogs.stopGameConfirmation"));
      if (confirmed) {
        board.value.stop();
        history.value.gotoLast();
      }
    }

    return {
      board,
      history,
      reversed,
      newGame,
      stopGame,
      reverseBoard,
      handleCheckmate,
      handleStalemate,
      handlePerpetualDraw,
      handleMissingMaterialDraw,
      handleFiftyMovesDraw,
      handleMoveDone,
      handlePositionRequest,
      whiteHuman,
      blackHuman,
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