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

import authService from "./services/authService";

const checkIsAuthenticated = async () => {
  try {
    const response = await authService.isAuthenticated();
    if (response.data.isLoggedIn && response.data.userId) {
      localStorage.setItem(
        "isLoggedIn",
        JSON.stringify(response.data.isLoggedIn)
      );
      localStorage.setItem("userId", JSON.stringify(response.data.userId));
    } else {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userId");
    }
  } catch (err) {
    console.error("checkIsAuthenticated() main.js error: ", err);
  }
};

await checkIsAuthenticated();

createApp(App).use(vuetify).use(ToastPlugin).use(router).mount("#app");
