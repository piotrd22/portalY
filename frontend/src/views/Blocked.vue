<template>
  <v-container class="custom-container">
    <v-card>
      <v-tabs v-model="tab" bg-color="primary">
        <v-tab value="blockedUsers">Blocked Users</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="tab">
          <v-window-item value="blockedUsers">
            <v-infinite-scroll :onLoad="loadBlockedUsers" :items="blockedUsers">
              <div v-for="blockedUser in blockedUsers" :key="blockedUser._id">
                <User :user="blockedUser" />
              </div>
            </v-infinite-scroll>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import userService from "../services/userService";
import User from "../components/User.vue";

export default {
  data() {
    return {
      tab: null,
      blockedUsers: [],
      lastCreatedAtBlockedUser: null,
    };
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  mounted() {},
  methods: {
    async loadBlockedUsers({ done }) {
      try {
        const response = await userService.getBlockedUsers(
          this.id,
          this.lastCreatedAtBlockedUser
        );
        if (response.data.blockedUsers.length === 0) {
          return done("empty");
        }
        this.blockedUsers.push(...response.data.blockedUsers);
        this.lastCreatedAtBlockedUser =
          this.blockedUsers[this.blockedUsers.length - 1].createdAt;
        done("ok");
      } catch (err) {
        done("error");
        console.error("loadBlockedUsers() Blocked.vue error:", err);
      }
    },
  },
  components: {
    User,
  },
};
</script>

<style scoped>
.custom-container {
  max-width: 60%;
}
</style>
