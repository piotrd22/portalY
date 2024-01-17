<template>
  <v-container class="custom-container" v-if="user">
    <div class="avatar-container">
      <v-avatar size="175" class="avatar-image-container">
        <img
          v-if="user.avatar"
          :src="user.avatar"
          alt="User Avatar"
          class="avatar-image"
        />
        <img
          v-else
          src="../assets/default-avatar.jpg"
          alt="User Avatar"
          class="avatar-image"
        />
      </v-avatar>
    </div>

    <div class="main-container">
      <v-file-input
        v-model="files"
        accept="image/png, image/jpeg, image/jpg"
        placeholder="Pick an avatar"
        prepend-icon="mdi-camera"
        label="Update Avatar"
        class="file-input"
      ></v-file-input>

      <v-btn @click="updateAvatar" class="update-btn" v-if="files.length > 0">
        Update Avatar
      </v-btn>

      <v-btn
        @click="deleteAvatar"
        color="warning"
        class="delete-btn"
        v-if="user.avatar"
      >
        Delete Avatar
      </v-btn>

      <v-form @submit.prevent="updateUser" class="update-user-form">
        <v-text-field
          v-model="formData.name"
          label="Name"
          outlined
        ></v-text-field>

        <v-text-field
          v-model="formData.birthDate"
          :value="formData.birthDate"
          type="date"
          label="Birth Date"
          outlined
        ></v-text-field>

        <v-textarea v-model="formData.bio" label="Bio" outlined></v-textarea>

        <v-text-field
          v-model="formData.website"
          label="Website"
          outlined
        ></v-text-field>

        <v-btn type="submit" class="update-btn">Update</v-btn>
        <v-btn color="primary" @click="resetForm" class="reset-btn"
          >Reset</v-btn
        >
      </v-form>

      <v-form @submit.prevent="updateUsername" class="update-username-form">
        <v-text-field
          v-model="username"
          label="Username"
          outlined
        ></v-text-field>
        <v-btn type="submit" class="update-btn">Update</v-btn>
        <v-btn color="primary" @click="resetUsernameForm" class="reset-btn"
          >Reset</v-btn
        >
      </v-form>

      <v-form @submit.prevent="updatePassword" class="update-password-form">
        <v-text-field
          v-model="newPassword"
          :append-icon="newPasswordShow ? 'mdi-eye' : 'mdi-eye-off'"
          :type="newPasswordShow ? 'text' : 'password'"
          label="New Password"
          name="input-10-1"
          outlined
          @click:append="newPasswordShow = !newPasswordShow"
        ></v-text-field>
        <v-text-field
          v-model="oldPassword"
          :append-icon="oldPasswordShow ? 'mdi-eye' : 'mdi-eye-off'"
          :type="oldPasswordShow ? 'text' : 'password'"
          label="Old Password"
          name="input-10-1"
          outlined
          @click:append="oldPasswordShow = !oldPasswordShow"
        ></v-text-field>
        <v-btn type="submit" class="update-btn">Update</v-btn>
      </v-form>

      <div class="delete-user">
        <v-btn color="red" @click="openDeleteUserDialog"
          >Delete Your Account</v-btn
        >
      </div>
    </div>

    <v-dialog v-model="deleteUserDialog" persistent max-width="500">
      <v-card>
        <v-card-text>
          <p>Are you sure you want to delete your account?</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" dark @click="deleteUser">Delete Account</v-btn>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="closeDeleteUserDialog"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import userService from "../services/userService";

export default {
  data() {
    return {
      user: null,
      files: [],
      formData: {
        name: "",
        birthDate: null,
        bio: "",
        website: "",
      },
      username: "",
      newPassword: "",
      newPasswordShow: false,
      oldPassword: "",
      oldPasswordShow: false,
      deleteUserDialog: false,
    };
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  mounted() {
    this.getUserById();
  },
  methods: {
    formatDate(date) {
      const formattedDate = new Date(date);
      const year = formattedDate.getFullYear();
      const month = (formattedDate.getMonth() + 1).toString().padStart(2, "0");
      const day = formattedDate.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    async getUserById() {
      try {
        const response = await userService.getUserById(this.id);
        this.user = response.data.user;
        this.formData.name = this.user.name || "";
        this.formData.birthDate = this.formatDate(this.user.birthDate) || null;
        this.formData.bio = this.user.bio || "";
        this.formData.website = this.user.website || "";
        this.username = this.user.username;
      } catch (err) {
        console.error("getUserById() EditProfile.vue error: ", err);
      }
    },
    async updateAvatar() {
      try {
        const response = await userService.updateAvatar(this.id, this.files[0]);
        this.user.avatar = response.data.user.avatar;
        this.files = [];

        const localStorageUser = {
          _id: response.data.user._id,
          avatar: response.data.user.avatar,
          username: response.data.user.username,
        };
        localStorage.setItem("user", JSON.stringify(localStorageUser));
        window.dispatchEvent(
          new CustomEvent("user-localstorage-changed", {
            detail: {
              user: localStorageUser,
            },
          })
        );

        this.$toast.success("Success");
      } catch (err) {
        console.error("updateAvatar() EditProfile.vue error:", err);
        const errorMessage =
          err?.response?.data.message || "Updating user failed.";
        this.$toast.error(errorMessage);
      }
    },
    async deleteAvatar() {
      try {
        const response = await userService.deleteAvatar(this.id);
        this.user.avatar = response.data.user.avatar;

        const localStorageUser = {
          _id: response.data.user._id,
          avatar: response.data.user.avatar,
          username: response.data.user.username,
        };
        localStorage.setItem("user", JSON.stringify(localStorageUser));
        window.dispatchEvent(
          new CustomEvent("user-localstorage-changed", {
            detail: {
              user: localStorageUser,
            },
          })
        );

        this.$toast.success("Success");
      } catch (err) {
        console.error("deleteAvatar() EditProfile.vue error:", err);
        const errorMessage =
          err?.response?.data.message || "Updating user failed.";
        this.$toast.error(errorMessage);
      }
    },
    async updateUser() {
      try {
        const response = await userService.updateUser(this.id, this.formData);
        this.user = response.data.user;
        this.$toast.success("Success");
      } catch (err) {
        console.error("updateUser() EditProfile.vue error:", err);
        const errorMessage =
          err?.response?.data.message || "Updating user failed.";
        this.$toast.error(errorMessage);
      }
    },
    resetForm() {
      this.formData.name = this.user.name || "";
      this.formData.birthDate = this.formatDate(this.user.birthDate) || null;
      this.formData.bio = this.user.bio || "";
      this.formData.website = this.user.website || "";
    },
    async updateUsername() {
      try {
        const response = await userService.updateUsername(
          this.id,
          this.username
        );
        this.user = response.data.user;

        const localStorageUser = {
          _id: response.data.user._id,
          avatar: response.data.user.avatar,
          username: response.data.user.username,
        };
        localStorage.setItem("user", JSON.stringify(localStorageUser));
        window.dispatchEvent(
          new CustomEvent("user-localstorage-changed", {
            detail: {
              user: localStorageUser,
            },
          })
        );

        this.$toast.success("Success");
      } catch (err) {
        console.error("updateUsername() EditProfile.vue error:", err);
        const errorMessage =
          err?.response?.data.message || "Updating user failed.";
        this.$toast.error(errorMessage);
      }
    },
    resetUsernameForm() {
      this.username = this.user.username || "";
    },
    async updatePassword() {
      try {
        await userService.updatePassword(
          this.id,
          this.newPassword,
          this.oldPassword
        );
        this.newPassword = "";
        this.oldPassword = "";
        this.$toast.success("Success");
      } catch (err) {
        console.error("updatePassword() EditProfile.vue error:", err);
        const errorMessage =
          err?.response?.data.message || "Updating user failed.";
        this.$toast.error(errorMessage);
      }
    },
    openDeleteUserDialog() {
      this.deleteUserDialog = true;
    },
    closeDeleteUserDialog() {
      this.deleteUserDialog = false;
    },
    async deleteUser() {
      try {
        await userService.deleteUser(this.id);
        this.$router.push({ name: "Home" });
        location.reload();
      } catch (err) {
        console.error("deleteUser() EditProfile.vue error:", err);
        const errorMessage =
          err?.response?.data.message || "Deleting user failed.";
        this.$toast.error(errorMessage);
      }
    },
  },
};
</script>

<style scoped>
.custom-container {
  max-width: 60%;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 50%;
}

.main-container {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}

.delete-user,
.update-username-form,
.update-password-form,
.update-user-form {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid black;
}
</style>
