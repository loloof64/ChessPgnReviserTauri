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
        size="350"
        :reversed="reversed"
        white_player_human="true"
        black_player_human="true"
        @checkmate="handleCheckmate"
        @stalemate="handleStalemate"
        @perpetual-draw="handlePerpetualDraw"
        @missing-material-draw="handleMissingMaterialDraw"
        @fifty-moves-draw="handleFiftyMovesDraw"
        @move-done="handleMoveDone"
      />
      <history-component width="350px" height="350px" :items="historyItems" />
    </div>
  </div>
</template>

<script>
const CHESSBOARD_CB_DELAY_MS = 50;

import "@loloof64/chessboard-component/dist";
import HistoryComponent from "./HistoryComponent.vue";
import { ref, reactive } from "vue";
import { useI18n } from "vue-i18n";
export default {
  components: { HistoryComponent },
  setup() {
    const { t } = useI18n();

    const board = ref();
    const reversed = ref(false);
    const historyItems = reactive([]);

    function newGame() {
      historyItems.splice(0, historyItems.length);
      board.value.newGame();
    }

    function reverseBoard() {
      reversed.value = !reversed.value;
    }

    function handleCheckmate({ whiteTurnBeforeMove }) {
      const player = whiteTurnBeforeMove ? t("side.white") : t("side.black");
      setTimeout(
        () => alert(t("gameFinished.checkmate", { player })),
        CHESSBOARD_CB_DELAY_MS
      );
    }

    function handleStalemate() {
      setTimeout(
        () => alert(t("gameFinished.stalemate")),
        CHESSBOARD_CB_DELAY_MS
      );
    }

    function handlePerpetualDraw() {
      setTimeout(
        () => alert(t("gameFinished.checkmate")),
        CHESSBOARD_CB_DELAY_MS
      );
    }

    function handleMissingMaterialDraw() {
      setTimeout(
        () => alert(t("gameFinished.three-fold-repetition")),
        CHESSBOARD_CB_DELAY_MS
      );
    }

    function handleFiftyMovesDraw() {
      setTimeout(
        () => alert(t("gameFinished.50-moves-rule")),
        CHESSBOARD_CB_DELAY_MS
      );
    }

    function handleMoveDone(event) {
      const payload = event.detail.moveObject;
      if ((payload.whiteTurn) ) {
        historyItems.push({text: `${payload.moveNumber}.`});
      }
      historyItems.push({text: payload.moveFan});
    }

    return {
      board,
      reversed,
      historyItems,
      newGame,
      reverseBoard,
      handleCheckmate,
      handleStalemate,
      handlePerpetualDraw,
      handleMissingMaterialDraw,
      handleFiftyMovesDraw,
      handleMoveDone,
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
  width: 780px;
}
</style>