<template>
  <div class="main_zone">
    <div class="buttons_zone">
      <img class="button" @click="newGame" width="50" height="50" src="../assets/start.png" />
    </div>
  <loloof64-chessboard
    v-pre
    ref="board"
    size="300"
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

.buttons_zone {
  margin: 10px 0px;
}

.button {
  border: 1px solid black;
}
</style>