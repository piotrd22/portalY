<template>
  <div class="home-container">
    <v-row justify="center" align="center">
      <v-col cols="12" md="4">
        <div class="svg-container">
          <img src="../assets/home.svg" alt="SVG" class="svg-image" />
        </div>
      </v-col>

      <v-col cols="12" md="7" lg="6">
        <v-card class="mx-auto vertical-card" :variant="'outlined'">
          <div class="card-background"></div>

          <v-card-title class="headline larger-text"
            >The latest events from around the world</v-card-title
          >
          <v-card-subtitle class="mb-4"
            >Read about the latest events around the world</v-card-subtitle
          >

          <v-card-actions>
            <v-btn large color="primary" @click="openRegisterDialog"
              >Register</v-btn
            >
            <v-btn large color="secondary" @click="openLoginDialog"
              >Log in</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="registerDialog" persistent max-width="500">
      <v-card>
        <v-card-title class="text-h5 larger-text">Registration</v-card-title>
        <v-card-text>
          <v-form ref="registerForm" @submit.prevent="register">
            <v-text-field
              v-model="registerUsername"
              label="Username"
              :rules="[(v) => !!v || 'This field is required']"
            ></v-text-field>
            <v-text-field
              v-model="registerPassword"
              label="Password"
              type="password"
              :rules="[(v) => !!v || 'This field is required']"
            ></v-text-field>
            <v-btn type="submit" color="primary" @click="register"
              >Register</v-btn
            >
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="closeRegisterDialog"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="loginDialog" persistent max-width="500">
      <v-card>
        <v-card-title class="text-h5 larger-text">Log in</v-card-title>
        <v-card-text>
          <v-form ref="loginForm" @submit.prevent="login">
            <v-text-field
              v-model="loginUsername"
              label="Username"
              :rules="[(v) => !!v || 'This field is required']"
            ></v-text-field>
            <v-text-field
              v-model="loginPassword"
              label="Password"
              type="password"
              :rules="[(v) => !!v || 'This field is required']"
            ></v-text-field>
            <v-btn type="submit" color="primary" @click="login">Log in</v-btn>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeLoginDialog">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import authService from "../services/authService";
import userService from "../services/userService";

export default {
  data() {
    return {
      loginDialog: false,
      registerDialog: false,
      loginUsername: "",
      loginPassword: "",
      registerUsername: "",
      registerPassword: "",
    };
  },
  methods: {
    openLoginDialog() {
      this.loginDialog = true;
    },
    openRegisterDialog() {
      this.registerDialog = true;
    },
    closeLoginDialog() {
      this.loginDialog = false;
      this.loginUsername = "";
      this.loginPassword = "";
    },
    closeRegisterDialog() {
      this.registerDialog = false;
      this.registerUsername = "";
      this.registerPassword = "";
    },
    async login() {
      try {
        const validationResult = await this.$refs.loginForm.validate();
        if (validationResult.valid) {
          const res = await authService.login({
            username: this.loginUsername,
            password: this.loginPassword,
          });
          this.closeLoginDialog();

          // https://stackoverflow.com/questions/42974170/is-there-any-way-to-watch-for-localstorage-in-vuejs
          const localStorageUser = {
            _id: res.data._id,
            avatar: res.data.avatar,
            username: res.data.username,
          };
          localStorage.setItem("user", JSON.stringify(localStorageUser));
          window.dispatchEvent(
            new CustomEvent("user-localstorage-changed", {
              detail: {
                user: localStorageUser,
              },
            })
          );

          localStorage.setItem("isLoggedIn", JSON.stringify(true));
          window.dispatchEvent(
            new CustomEvent("isLoggedIn-localstorage-changed", {
              detail: {
                storage: true,
              },
            })
          );

          this.$router.push({ name: "Feed" });
        }
      } catch (err) {
        console.error("Login error:", err);
        const errorMessage =
          err?.response?.data.message ||
          "Login failed. Please check your credentials and try again.";
        this.$toast.error(errorMessage);
      }
    },
    async register() {
      try {
        const validationResult = await this.$refs.registerForm.validate();
        if (validationResult.valid) {
          await userService.createUser({
            username: this.registerUsername,
            password: this.registerPassword,
          });
          this.closeRegisterDialog();
          this.$toast.success("Registered successfully. Please log in.");
        }
      } catch (err) {
        console.log(err);
        console.error("Registration error:", err);
        const errorMessage =
          err.response.data.message || "Registration failed.";
        this.$toast.error(errorMessage);
      }
    },
  },
};
</script>

<style scoped>
.home-container {
  height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.svg-container {
  display: flex;
  justify-content: center;
}

.svg-image {
  max-width: 100%;
  height: auto;
  max-height: 400px;
}

.larger-text {
  font-size: 1.2em;
}
</style>
