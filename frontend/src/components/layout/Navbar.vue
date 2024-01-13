<template>
  <v-app-bar app>
    <v-btn v-if="isGoBackPage" @click="goBack">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
    <v-toolbar-title>
      <v-btn @click="navigateToHomeOrFeed" text>
        <span class="portal-text">PortalY</span>
      </v-btn>
    </v-toolbar-title>
    <v-btn v-if="isLoggedIn" @click="logout" text> Logout </v-btn>
  </v-app-bar>
</template>

<script>
import authService from "../../services/authService";

export default {
  data() {
    return {
      isLoggedIn: false,
    };
  },
  mounted() {
    this.isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn")) || false;

    // https://stackoverflow.com/questions/42974170/is-there-any-way-to-watch-for-localstorage-in-vuejs
    window.addEventListener("isLoggedIn-localstorage-changed", (event) => {
      this.isLoggedIn = event.detail.storage;
    });
  },
  computed: {
    isGoBackPage() {
      return (
        this.$route.name === "PostThread" ||
        this.$route.name === "PostQuotedBy" ||
        this.$route.name === "Profile"
      );
    },
  },
  methods: {
    async logout() {
      try {
        await authService.logout();

        localStorage.setItem("isLoggedIn", JSON.stringify(false));
        window.dispatchEvent(
          new CustomEvent("isLoggedIn-localstorage-changed", {
            detail: {
              storage: false,
            },
          })
        );

        localStorage.removeItem("userId");

        this.$router.push({ name: "Home" });
      } catch (err) {
        console.error("Logout error:", err);

        localStorage.setItem("isLoggedIn", JSON.stringify(false));
        window.dispatchEvent(
          new CustomEvent("isLoggedIn-localstorage-changed", {
            detail: {
              storage: false,
            },
          })
        );

        localStorage.removeItem("userId");

        const errorMessage = err.response?.data.message || "Logout failed.";
        this.$toast.error(errorMessage);
      }
    },
    navigateToHomeOrFeed() {
      const routeName = this.isLoggedIn ? "Feed" : "Home";
      this.$router.push({ name: routeName });
    },
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.portal-text {
  font-weight: bold;
  font-size: 1.2em;
}
</style>
