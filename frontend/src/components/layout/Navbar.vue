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

    <v-text-field
      v-if="isLoggedIn && user.username"
      class="narrow-text-field"
      density="compact"
      variant="solo"
      label="Search"
      append-inner-icon="mdi-magnify"
      single-line
      hide-details
      @click:append-inner="searchUsers"
      v-model="searchKeyword"
    ></v-text-field>

    <v-btn v-if="isLoggedIn && user.username" @click="navigateToProfile" text>
      @{{ user.username }}
      <v-avatar size="36" class="avatar">
        <img
          v-if="user.avatar"
          :src="user.avatar"
          alt="User Avatar"
          class="avatar-image"
        />
        <img
          v-else
          src="../../assets/default-avatar.jpg"
          alt="User Avatar"
          class="avatar-image"
        />
      </v-avatar>
    </v-btn>

    <v-btn v-if="isLoggedIn" @click="logout" text>Logout</v-btn>
  </v-app-bar>
</template>

<script>
import authService from "../../services/authService";

export default {
  data() {
    return {
      isLoggedIn: false,
      user: null,
      searchKeyword: "",
    };
  },
  mounted() {
    this.isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn")) || false;
    this.user = JSON.parse(localStorage.getItem("user")) || {};

    // https://stackoverflow.com/questions/42974170/is-there-any-way-to-watch-for-localstorage-in-vuejs
    window.addEventListener("isLoggedIn-localstorage-changed", (event) => {
      this.isLoggedIn = event.detail.storage;
    });

    window.addEventListener("user-localstorage-changed", (event) => {
      this.user = event.detail.user;
    });
  },
  computed: {
    isGoBackPage() {
      return this.$route.name !== "Feed" && this.$route.name !== "Home";
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

        localStorage.removeItem("user");
        window.dispatchEvent(
          new CustomEvent("user-localstorage-changed", {
            detail: {
              storage: false,
            },
          })
        );

        this.$router.push({ name: "Home" });
      } catch (err) {
        console.error("Logout error:", err);
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
    navigateToProfile() {
      const id = this.user._id;
      this.$router.push({ name: "Profile", params: { id } });
    },
    async searchUsers() {
      try {
        let lastCreatedAt = new Date().toISOString();
        this.$router.push({
          name: "Search",
          query: {
            keyword: this.searchKeyword,
            lastCreatedAt: lastCreatedAt,
          },
        });
        this.searchKeyword = "";
      } catch (err) {
        console.error("searchUsers() Navbar.vue error: ", err);
      }
    },
  },
};
</script>

<style scoped>
.portal-text {
  font-weight: bold;
  font-size: 1.2em;
}

.avatar-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 50%;
}
.avatar {
  margin-left: 10px;
}

.narrow-text-field {
  max-width: 300px;
}
</style>
