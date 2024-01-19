<template>
  <v-container class="custom-container">
    <router-link :to="'/profile/' + user._id" class="User-link">
      <v-card class="mx-auto" max-width="100%">
        <v-card-title class="d-flex align-center justify-space-between">
          <v-avatar class="avatar" size="68">
            <img
              v-if="user.avatar"
              :src="user.avatar"
              alt="Avatar"
              class="avatar-image"
            />
            <img
              v-else
              src="../assets/default-avatar.jpg"
              alt="Avatar"
              class="avatar-image"
            />
          </v-avatar>
          <div v-if="isBlockedUser">Blocked</div>
          <div v-else>
            <v-btn
              v-if="isFollowedUser"
              color="primary"
              @click.prevent="unfollowUser"
              >Unfollow</v-btn
            >
            <v-btn v-else color="primary" @click.prevent="followUser"
              >Follow</v-btn
            >
          </div>
        </v-card-title>
        <v-card-text>
          <div v-if="user.name">{{ user.name }} @{{ user.username }}</div>
          <div v-else>@{{ user.username }}</div>
        </v-card-text>
      </v-card>
    </router-link>
  </v-container>
</template>

<script>
import userService from "../services/userService";

export default {
  data() {
    return {
      isFollowedUser: false,
      isBlockedUser: false,
      loggedInUserId: "",
    };
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  mounted() {
    this.getLoggedInUserId();
    this.checkUserStatus();
  },
  methods: {
    getLoggedInUserId() {
      const user = JSON.parse(localStorage.getItem("user"));
      this.loggedInUserId = user._id;
    },
    checkUserStatus() {
      this.isBlockedUser =
        this.user.blockedUsers.includes(this.loggedInUserId) ||
        this.user.blockedBy.includes(this.loggedInUserId);
      this.isFollowedUser = this.user.followers.includes(this.loggedInUserId);
    },
    async followUser() {
      try {
        await userService.followUser(this.user._id);
        this.isFollowedUser = true;
        this.$toast.success("User has been followed.");
      } catch (err) {
        console.error("followUser() User.vue error:", err);
        const errorMessage =
          err?.response?.data.message || "Following user failed.";
        this.$toast.error(errorMessage);
      }
    },
    async unfollowUser() {
      try {
        await userService.unfollowUser(this.user._id);
        this.isFollowedUser = false;
        this.$toast.success("User has been unfollowed.");
      } catch (err) {
        console.error("unfollowUser() User.vue error:", err);
        const errorMessage =
          err?.response?.data.message || "Unfollowing user failed.";
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

.avatar-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 50%;
}

.d-flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.justify-space-between {
  justify-content: space-between;
}

.User-link {
  text-decoration: none;
  cursor: pointer;
}
</style>
