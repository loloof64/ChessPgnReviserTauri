<template>
  <Dialog
    v-model:visible="displayModal"
    :modal="true"
    :closeOnEscape="false"
    :dismissableMask="false"
    :closable="false"
  >
    <h4>{{ title }}</h4>
    <div></div>
    <loloof64-chessboard
      ref="board"
      :size="350"
      white_player_human="false"
      black_player_human="false"
    />
    <div class="buttonsZone">
      <button class="cancel" @click="cancel">{{ cancelButton }}</button>
      <button class="confirm" @click="confirm">{{ okButton }}</button>
    </div>
  </Dialog>
</template>

<script>
import "@loloof64/chessboard-component/dist";
import { ref } from "vue";
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
    const board = ref();

    function open() {
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
      });
    }

    function confirm() {
      okClicked.value = true;
    }

    function cancel() {
      cancelClicked.value = true;
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
</style>