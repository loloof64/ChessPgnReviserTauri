<template>
  <Dialog
    v-model:visible="displayModal"
    :modal="true"
    :closeOnEscape="false"
    :dismissableMask="false"
    :closable="false"
  >
    <h4 class="title">{{ title }}</h4>
    <h5 class="goal">{{ goalCaption }} : {{ goalValue }}</h5>
    <div class="pagination">{{ currentGameNumber }} / {{ gamesCount }}</div>
    <div class="navigation">
      <button :label="firstLabel" @click="gotoFirstGame">&#x21E4;</button>
      <button :label="previousLabel" @click="gotoPreviousGame">&#x2B05;</button>
      <button :label="nextLabel" @click="gotoNextGame">&#x27A1;</button>
      <button :label="lastLabel" @click="gotoLastGame">&#x21E5;</button>
      <input ref="gameInput" type="number" @change="gotoQueried" />
    </div>
    <div class="mainZone">
      <loloof64-chessboard
        ref="board"
        :white_player_human="false"
        :black_player_human="false"
        :size="300"
        :reversed="boardReversed"
      />
      <div class="optionsZone">
        <div class="optionLine">
          <span>{{ whiteModeLabel }}</span>
          <select @change="handleWhiteChange" ref="whiteSelect">
            <option value="guess">
              <span>{{ guessLabel }}</span>
            </option>
            <option value="manual">
              <span>{{ manualLabel }}</span>
            </option>
            <option value="auto">
              <span>{{ autoLabel }}</span>
            </option>
          </select>
          <img :class="whiteOptionClass" width="20" height="20" />
        </div>
        <div class="optionLine">
          <span>{{ blackModeLabel }}</span>
          <select @change="handleBlackChange" ref="blackSelect">
            <option value="guess">
              <span>{{ guessLabel }}</span>
            </option>
            <option value="manual">
              <span>{{ manualLabel }}</span>
            </option>
            <option value="auto">
              <span>{{ autoLabel }}</span>
            </option>
          </select>
          <img :class="blackOptionClass" width="20" height="20" />
        </div>
      </div>
    </div>
    <div class="buttonsZone">
      <button class="cancel" @click="cancel">{{ cancelButton }}</button>
      <button class="confirm" @click="confirm">{{ okButton }}</button>
    </div>
  </Dialog>
</template>

<script>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

import {
  PLAYER_MODE_GUESS_MOVE,
  PLAYER_MODE_CHOOSE_MOVE,
  PLAYER_MODE_RANDOM_MOVE,
} from "../constants";

export default {
  setup() {
    const { t } = useI18n();
    const title = ref(t("newGameDialog.title"));
    const okButton = ref(t("dialogs.okButton"));
    const cancelButton = ref(t("dialogs.cancelButton"));
    const whiteModeLabel = ref(t("newGameDialog.whiteMode"));
    const blackModeLabel = ref(t("newGameDialog.blackMode"));
    const guessLabel = ref(t("gameMode.guess"));
    const manualLabel = ref(t("gameMode.manual"));
    const autoLabel = ref(t("gameMode.auto"));
    const goalCaption = ref(t("goal.caption"));
    const goalValue = ref(t("goal.unknown"));
    const displayModal = ref(false);
    const okClicked = ref(false);
    const cancelClicked = ref(false);
    const gameIndex = ref(0);
    const whiteModeParam = ref(PLAYER_MODE_GUESS_MOVE);
    const blackModeParam = ref(PLAYER_MODE_GUESS_MOVE);
    const gameInput = ref();
    const board = ref();
    const boardReversed = ref(false);
    const gamesArray = ref();
    const whiteSelect = ref();
    const blackSelect = ref();
    const firstLabel = ref(t("newGameDialog.first"));
    const previousLabel = ref(t("newGameDialog.previous"));
    const nextLabel = ref(t("newGameDialog.next"));
    const lastLabel = ref(t("newGameDialog.last"));

    const whiteOptionClass = ref({ guess: true, manual: false, auto: false });
    const blackOptionClass = ref({ guess: true, manual: false, auto: false });

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
      updateGoalValue();
    }

    function updateGoalValue() {
      const selectedGame = gamesArray.value[gameIndex.value];
      const currentGameGoal = selectedGame.tags["Goal"];
      const isWhiteWin = currentGameGoal === "1-0";
      const isBlackWin = currentGameGoal === "0-1";
      const isDraw = currentGameGoal === "1/2-1/2";

      if (isWhiteWin) {
        goalValue.value = t("goal.whiteWin");
      } else if (isBlackWin) {
        goalValue.value = t("goal.blackWin");
      } else if (isDraw) {
        goalValue.value = t("goal.draw");
      } else {
        goalValue.value = "?";
      }
    }

    function open(games) {
      gamesArray.value = games;
      const CHECK_INTERVAL_MS = 200;
      okClicked.value = false;
      cancelClicked.value = false;
      gameIndex.value = 0;
      whiteModeParam.value = 0;
      blackModeParam.value = 0;
      whiteOptionClass.value = selectClassFromValue(whiteModeParam.value);
      blackOptionClass.value = selectClassFromValue(blackModeParam.value);

      return new Promise((resolve, reject) => {
        let handler;

        function checkButtonClicked() {
          if (okClicked.value) {
            displayModal.value = false;
            clearInterval(handler, checkButtonClicked);
            // Waiting for dialog to be closed
            setTimeout(() => {
              resolve({
                index: gameIndex.value,
                whiteMode: whiteModeParam.value,
                blackMode: blackModeParam.value,
              });
            }, 50);
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

    function selectClassFromValue(value) {
      switch (value) {
        case "auto":
          return {
            guess: false,
            manual: false,
            auto: true,
          };
        case "manual":
          return {
            guess: false,
            manual: true,
            auto: false,
          };
        case "guess":
        default:
          return {
            guess: true,
            manual: false,
            auto: false,
          };
      }
    }

    function modeFromValue(value) {
      switch (value) {
        case "auto":
          return PLAYER_MODE_RANDOM_MOVE;
        case "manual":
          return PLAYER_MODE_CHOOSE_MOVE;
        case "guess":
        default:
          return PLAYER_MODE_GUESS_MOVE;
      }
    }

    function handleWhiteChange() {
      const newValue = whiteSelect.value.value;
      const selectClass = selectClassFromValue(newValue);
      whiteOptionClass.value = selectClass;
      whiteModeParam.value = modeFromValue(newValue);
    }

    function handleBlackChange() {
      const newValue = blackSelect.value.value;
      const selectClass = selectClassFromValue(newValue);
      blackOptionClass.value = selectClass;
      blackModeParam.value = modeFromValue(newValue);
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

      whiteModeLabel,
      blackModeLabel,
      guessLabel,
      manualLabel,
      autoLabel,

      handleWhiteChange,
      handleBlackChange,

      whiteSelect,
      blackSelect,

      whiteOptionClass,
      blackOptionClass,

      goalCaption,
      goalValue,
    };
  },
};
</script>

<style>
.p-dialog-content {
  width: 98vw;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  overflow-y: scroll;
}

.mainZone {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.optionsZone {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.optionLine {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 2px 8px;
}

.optionLine > span {
  font-size: 0.8rem;
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
.goal,
.pagination,
.navigation * {
  font-size: 1.2rem;
  margin: 0.1rem 0;
}

.goal {
  font-size: 1rem;
}

.navigation button {
  color: black;
  margin: 0 0.2rem;
}

select > option {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 0 6px;
}

.guess {
  content: url("../assets/images/question_mark.png");
}

.manual {
  content: url("../assets/images/cross_arrows.png");
}

.auto {
  content: url("../assets/images/dices.png");
}

select > option > span {
  font-size: 0.3rem;
}
</style>