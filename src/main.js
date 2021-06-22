import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import App from "./App.vue";

import messages from "./i18n";

// https://stackoverflow.com/a/31135571/662618
function getLang() {
  if (navigator.languages != undefined) return navigator.languages[0];
  return navigator.language;
}

const locale = getLang();

const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: "en",
  messages,
});

const app = createApp(App);

app.use(i18n);
app.mount("#app");
