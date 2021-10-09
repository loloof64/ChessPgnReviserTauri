<template>
  <Dialog
    v-model:visible="displayModal"
    :modal="true"
    :closeOnEscape="false"
    :dismissableMask="false"
    :closable="false"
  >
    <h4 class="title">{{ title }}</h4>
    <div class="pagination">{{ currentGameNumber }} / {{ gamesCount }}</div>
    <div class="navigation">
      <button :label="firstLabel" @click="gotoFirstGame">&#x21E4;</button>
      <button :label="previousLabel" @click="gotoPreviousGame">&#x2B05;</button>
      <button :label="nextLabel" @click="gotoNextGame">&#x27A1;</button>
      <button :label="lastLabel" @click="gotoLastGame">&#x21E5;</button>
      <input ref="gameInput" type="number" @change="gotoQueried" />
    </div>
    <loloof64-chessboard
      ref="board"
      :white_player_human="false"
      :black_player_human="false"
      :size="350"
      :reversed="boardReversed"
    />
    <div class="buttonsZone">
      <button class="cancel" @click="cancel">{{ cancelButton }}</button>
      <button class="confirm" @click="confirm">{{ okButton }}</button>
    </div>
  </Dialog>
</template>

<script>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
export default {
  setup() {
    const { t } = useI18n();
    const title = ref(t("newGameDialog.title"));
    const okButton = ref(t("dialogs.okButton"));
    const cancelButton = ref(t("dialogs.cancelButton"));
    const displayModal = ref(false);
    const okClicked = ref(false);
    const cancelClicked = ref(false);
    const gameIndex = ref(0);
    const gameInput = ref();
    const board = ref();
    const boardReversed = ref(false);
    const gamesArray = ref();
    const firstLabel = ref(t("newGameDialog.first"));
    const previousLabel = ref(t("newGameDialog.previous"));
    const nextLabel = ref(t("newGameDialog.next"));
    const lastLabel = ref(t("newGameDialog.last"));

    function getCurrentGameStartPosition() {
      const selectedGame = gamesArray.value[gameIndex.value];
      const startPosition =
        selectedGame.tags["FEN"] ||
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      return startPosition;
    }

    function gotoGame() {
      const startPosition = getCurrentGameStartPosition();
      board.value.newGame(startPosition);
      const isReversed = startPosition.split(" ")[1] === "b";
      boardReversed.value = isReversed;
      gameInput.value.value = gameIndex.value + 1;
    }

    function open(games) {
      gamesArray.value = games;
      const CHECK_INTERVAL_MS = 200;
      okClicked.value = false;
      cancelClicked.value = false;
      gameIndex.value = 0;

      return new Promise((resolve, reject) => {
        let handler;

        function checkButtonClicked() {
          if (okClicked.value) {
            displayModal.value = false;
            clearInterval(handler, checkButtonClicked);
            resolve(gameIndex.value);
            return;
          }
          if (cancelClicked.value) {
            displayModal.value = false;
            clearInterval(handler, checkButtonClicked);
            reject("Cancelled game selection");
            return;
          }
        }

        handler = setInterval(checkButtonClicked, CHECK_INTERVAL_MS);
        displayModal.value = true;
        setTimeout(() => {
          // dialog must be visible AND ready before calling this !
          gotoGame();
        }, 50);
      });
    }

    function confirm() {
      okClicked.value = true;
    }

    function cancel() {
      cancelClicked.value = true;
    }

    const currentGameNumber = computed(() => gameIndex.value + 1);
    const gamesCount = computed(() => gamesArray.value.length);

    function gotoFirstGame() {
      gameIndex.value = 0;
      gotoGame();
    }

    function gotoLastGame() {
      gameIndex.value = gamesArray.value.length - 1;
      gotoGame();
    }

    function gotoPreviousGame() {
      if (gameIndex.value > 0) {
        gameIndex.value -= 1;
        gotoGame();
      }
    }

    function gotoNextGame() {
      if (gameIndex.value < gamesArray.value.length - 1) {
        gameIndex.value += 1;
        gotoGame();
      }
    }

    function gotoQueried() {
      try {
        const queriedIndex = parseInt(gameInput.value.value) - 1;
        if (queriedIndex < 0) return;
        if (queriedIndex > gamesArray.value.length - 1) return;

        gameIndex.value = queriedIndex;
        gotoGame();
      } catch (err) {
        console.error(err);
      } finally {
        gameInput.value.value = gameIndex.value + 1;
      }
    }

    return {
      board,
      title,
      displayModal,
      open,
      okClicked,
      cancelClicked,
      okButton,
      cancelButton,
      confirm,
      cancel,
      currentGameNumber,
      gamesCount,
      firstLabel,
      previousLabel,
      nextLabel,
      lastLabel,
      gotoFirstGame,
      gotoLastGame,
      gotoPreviousGame,
      gotoNextGame,
      boardReversed,
      gameInput,
      gotoQueried,
    };
  },
};
</script>

<style>
.p-dialog-content {
  width: 48vw;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  overflow-y: scroll;
}

.buttonsZone {
  align-self: flex-end;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

button {
  font-size: 1.3rem;
  color: white;
}

.confirm {
  background-color: green;
}

.cancel {
  background-color: red;
}

.title,
.pagination,
.navigation * {
  font-size: 1.2rem;
  margin: 0.1rem 0;
}

.navigation button {
  color: black;
  margin: 0 0.2rem;
}
</style>