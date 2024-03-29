import { createApp } from "vue";
import { createPinia } from "pinia";
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

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(vuetify);
app.use(ToastPlugin);
app.use(router);

import authService from "./services/authService";
import { useSocketStore } from "./stores";

const checkIsAuthenticated = async () => {
  try {
    const response = await authService.isAuthenticated();

    if (response.data.isLoggedIn && response.data.user) {
      const socketStore = useSocketStore();

      localStorage.setItem(
        "isLoggedIn",
        JSON.stringify(response.data.isLoggedIn)
      );
      localStorage.setItem("user", JSON.stringify(response.data.user));
      socketStore.initializeSocket();
    } else {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
    }
  } catch (err) {
    console.error("checkIsAuthenticated() main.js error: ", err);
  }
};

const createAppWithAuthentication = async () => {
  try {
    await checkIsAuthenticated();
    app.mount("#app");
  } catch (err) {
    console.error("createAppWithAuthentication error: ", err);
  }
};

createAppWithAuthentication();
