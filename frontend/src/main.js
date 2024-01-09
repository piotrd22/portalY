import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.min.css";

const vuetify = createVuetify({
  theme: {
    // defaultTheme: "dark",
  },
  components,
  directives,
});

import ToastPlugin from "vue-toast-notification";
import "vue-toast-notification/dist/theme-bootstrap.css";

createApp(App).use(vuetify).use(ToastPlugin).use(router).mount("#app");
