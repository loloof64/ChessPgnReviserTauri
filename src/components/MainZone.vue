<template>
  <div class="main_zone">
    <button @click="newGame">New game</button>
  <loloof64-chessboard
    v-pre
    ref="board"
    size="300"
    left="50"
    top="50"
    white_player_human="true"
    black_player_human="true"
  ></loloof64-chessboard>
  </div>
</template>

<script>
import "@loloof64/chessboard-component/dist";
import { ref } from "vue";
export default {
  setup() {
    const board = ref();

    const newGame = function () {
      console.dir(board.value);
      board.value.newGame();
    };

    return {
      board,
      newGame,
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
</style>