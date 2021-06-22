<template>
  <div class="main_zone">
    <div class="buttons_zone">
      <img
        class="button"
        @click="newGame"
        width="50"
        height="50"
        src="../assets/start.png"
      />
      <img
        class="button"
        @click="reverseBoard"
        width="50"
        height="50"
        src="../assets/reverse.png"
      />
    </div>
    <loloof64-chessboard
      ref="board"
      size="300"
      :reversed="reversed"
      white_player_human="true"
      black_player_human="true"
      @checkmate="handleCheckmate"
      @stalemate="handleStalemate"
      @perpetual-draw="handlePerpetualDraw"
      @missing-material-draw="handleMissingMaterialDraw"
      @fifty-moves-draw="handleFiftyMovesDraw"
    ></loloof64-chessboard>
  </div>
</template>

<script>
const CHESSBOARD_CB_DELAY_MS = 50;

import "@loloof64/chessboard-component/dist";
import { ref } from "vue";
export default {
  setup() {
    const board = ref();
    const reversed = ref(false);

    function newGame() {
      board.value.newGame();
    }

    function reverseBoard() {
      reversed.value = !reversed.value;
    }

    function handleCheckmate({ whiteTurnBeforeMove }) {
      const player = whiteTurnBeforeMove ? "White" : "Black";
      setTimeout(() => alert(`${player} won by checkmate !`), CHESSBOARD_CB_DELAY_MS);
    }

    function handleStalemate() {
      setTimeout(() => alert('Draw by stalemate !'), CHESSBOARD_CB_DELAY_MS);
    }

    function handlePerpetualDraw() {
      setTimeout(() => alert('Draw by three-fold repetition !'), CHESSBOARD_CB_DELAY_MS);
    }

    function handleMissingMaterialDraw() {
      setTimeout(() => alert('Draw by missing material !'), CHESSBOARD_CB_DELAY_MS);
    }

    function handleFiftyMovesDraw() {
      setTimeout(() => alert('Draw by the fifty moves rule !'), CHESSBOARD_CB_DELAY_MS);
    }

    return {
      board,
      reversed,
      newGame,
      reverseBoard,
      handleCheckmate,
      handleStalemate,
      handlePerpetualDraw,
      handleMissingMaterialDraw,
      handleFiftyMovesDraw,
    };
  },
};
</script>

<style scoped>
.main_zone {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.buttons_zone {
  margin: 10px 0px;
}

.button {
  margin: 0px 5px;
  border: 1px solid black;
}
</style>