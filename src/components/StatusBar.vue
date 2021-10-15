<template>
  <div id="root">
    <span v-if="!gameInProgress">
      {{ noGameRunning }}
    </span>

    <span v-if="gameInProgress"> {{ white }} : {{ whiteMode }} </span>
    <img v-if="gameInProgress" :src="whiteModeImg" />

    <span v-if="gameInProgress"> - </span>

    <span v-if="gameInProgress"> {{ black }} : {{ blackMode }} </span>
    <img v-if="gameInProgress" :src="blackModeImg" />

    <span v-if="gameInProgress" class="section"> | </span>

    <span v-if="gameInProgress">
      {{ simpleFileName }}
    </span>

    <span v-if="gameInProgress"> - </span>

    <span v-if="gameInProgress">
      {{ game }} {{ number }} {{ gameNumber }}
    </span>

    <span v-if="gameInProgress" class="section"> | </span>

    <span v-if="gameInProgress"> {{ goal }} : {{ gameGoal }} </span>
  </div>
</template>

<script>
import { ref, computed, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import {
  PLAYER_MODE_GUESS_MOVE,
  PLAYER_MODE_RANDOM_MOVE,
  PLAYER_MODE_CHOOSE_MOVE,
} from "../constants";
export default {
  props: {
    gameData: {
      type: Object,
      default: () => {
        return undefined;
      },
    },
  },
  setup(props) {
    const { t } = useI18n();
    const noGameRunning = ref(t("statusBar.noGameRunning"));
    const white = ref(t("statusBar.white"));
    const black = ref(t("statusBar.black"));
    const game = ref(t("statusBar.game"));
    const number = ref(t("statusBar.number"));
    const goal = ref(t("goal.caption"));
    const whiteMode = ref(getWhiteModeString());
    const blackMode = ref(getBlackModeString());
    const whiteModeImg = ref(getWhiteModeImg());
    const blackModeImg = ref(getBlackModeImg());
    const gameInProgress = computed(() => !!props.gameData);
    const gameNumber = ref(props.gameData?.gameNumber);
    const simpleFileName = ref(getSimpleFileName(props.gameData?.filePath));
    const gameGoal = ref(getGameGoalString(props.gameData?.gameGoal));

    function getWhiteModeString() {
      const isInGuessMode = props.gameData?.whiteMode === PLAYER_MODE_GUESS_MOVE;
      const isInManualMode =
        props.gameData?.whiteMode === PLAYER_MODE_CHOOSE_MOVE;
      const isInAutoMode = props.gameData?.whiteMode === PLAYER_MODE_RANDOM_MOVE;

      if (isInGuessMode) return t("gameMode.guess");
      if (isInManualMode) return t("gameMode.manual");
      if (isInAutoMode) return t("gameMode.auto");
      return "?";
    }

    function getBlackModeString() {
      const isInGuessMode = props.gameData?.blackMode === PLAYER_MODE_GUESS_MOVE;
      const isInManualMode =
        props.gameData?.blackMode === PLAYER_MODE_CHOOSE_MOVE;
      const isInAutoMode = props.gameData?.blackMode === PLAYER_MODE_RANDOM_MOVE;

      if (isInGuessMode) return t("gameMode.guess");
      if (isInManualMode) return t("gameMode.manual");
      if (isInAutoMode) return t("gameMode.auto");
      return "?";
    }

    function getSimpleFileName(filePath) {
      if (filePath?.includes("\\")) {
        const lastPartIndex = filePath?.lastIndexOf("\\") + 1;
        return filePath?.substring(lastPartIndex);
      } else if (filePath?.includes("/")) {
        const lastPartIndex = filePath?.lastIndexOf("/") + 1;
        return filePath?.substring(lastPartIndex);
      }
      return filePath;
    }

    function getGameGoalString(goalValue) {
      if (goalValue === "1-0") return t("goal.whiteWin");
      if (goalValue === "0-1") return t("goal.blackWin");
      if (goalValue === "1/2-1/2") return t("goal.draw");
      return t("goal.unknown");
    }

    function getWhiteModeImg() {
      if (props.gameData?.whiteMode === PLAYER_MODE_GUESS_MOVE)
        return "../assets/images/question_mark.png";
      if (props.gameData?.whiteMode === PLAYER_MODE_RANDOM_MOVE)
        return "../assets/images/dices.png";
      if (props.gameData?.whiteMode === PLAYER_MODE_CHOOSE_MOVE)
        return "../assets/images/cross_arrows.png";
      return undefined;
    }

    function getBlackModeImg() {
      if (props.gameData?.blackMode === PLAYER_MODE_GUESS_MOVE)
        return "../assets/images/question_mark.png";
      if (props.gameData?.blackMode === PLAYER_MODE_RANDOM_MOVE)
        return "../assets/images/dices.png";
      if (props.gameData?.blackMode === PLAYER_MODE_CHOOSE_MOVE)
        return "../assets/images/cross_arrows.png";
      return undefined;
    }

    watchEffect(() => {
      whiteMode.value = getWhiteModeString();
      blackMode.value = getBlackModeString();
      whiteModeImg.value = getWhiteModeImg();
      blackModeImg.value = getBlackModeImg();
      gameNumber.value = props.gameData?.gameNumber;
      simpleFileName.value = getSimpleFileName(props.gameData?.filePath);
      gameGoal.value = getGameGoalString(props.gameData?.gameGoal);
    });

    return {
      noGameRunning,
      white,
      black,
      game,
      number,
      goal,
      whiteMode,
      blackMode,
      whiteModeImg,
      blackModeImg,
      gameInProgress,
      gameNumber,
      simpleFileName,
      gameGoal,
    };
  },
};
</script>

<style scoped>
#root {
  width: 100%;
  height: 10vh;
  background-color: gray;
  color: black;
  font-size: 1.2rem;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

span {
  margin: 0 2vw;
}

span.section {
  margin: 0 4vw;
}

img {
  width: 8vh;
  height: 8vh;
}
</style>