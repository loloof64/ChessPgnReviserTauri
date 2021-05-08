<template>
  <div>
    <button @click="newGame">New game</button>
  </div>
  <loloof64-chessboard
    v-pre
    ref="board"
    size="300"
    left="50"
    top="50"
    white_player_human="true"
    black_player_human="true"
  ></loloof64-chessboard>
</template>

<script>
import "@loloof64/chessboard-component/dist";
import { ref } from "vue";
export default {
  setup() {
    const board = ref();

    const newGame = function () {
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
</style>