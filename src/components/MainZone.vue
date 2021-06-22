<template>
  <div class="main_zone">
    <div class="buttons_zone">
      <img class="button" @click="newGame" width="50" height="50" src="../assets/start.png" />
      <img class="button" @click="reverseBoard" width="50" height="50" src="../assets/reverse.png" />
    </div>
  <loloof64-chessboard
    v-pre
    ref="board"
    size="300"
    :reversed="reversed"
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
    const reversed = ref(false);

    const newGame = function () {
      board.value.newGame();
    };

    const reverseBoard = function() {
      reversed.value = !reversed.value;
      console.log(reversed.value);
    }

    return {
      board,
      reversed,
      newGame,
      reverseBoard,
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