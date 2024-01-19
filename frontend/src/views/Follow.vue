<template>
  <v-container class="custom-container">
    <v-card>
      <v-tabs v-model="tab" bg-color="primary">
        <v-tab value="followers">Followers</v-tab>
        <v-tab value="followings">Followings</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="tab">
          <v-window-item value="followers">
            <v-infinite-scroll :onLoad="loadUserFollowers" :items="followers">
              <div v-for="follower in followers" :key="follower._id">
                <User :user="follower" />
              </div>
            </v-infinite-scroll>
          </v-window-item>

          <v-window-item value="followings">
            <v-infinite-scroll :onLoad="loadUserFollowings" :items="followings">
              <div v-for="following in followings" :key="following._id">
                <User :user="following" />
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
      followers: [],
      followings: [],
      lastCreatedAtFollower: null,
      lastCreatedAtFollowing: null,
    };
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    following: String,
  },
  mounted() {
    this.checkTab();
  },
  methods: {
    checkTab() {
      if (this.following === "true") {
        this.tab = "followings";
      }
    },
    async loadUserFollowers({ done }) {
      try {
        const response = await userService.getUserFollowers(
          this.id,
          this.lastCreatedAtFollower
        );
        if (response.data.followers.length === 0) {
          return done("empty");
        }
        this.followers.push(...response.data.followers);
        this.lastCreatedAtFollower =
          this.followers[this.followers.length - 1].createdAt;
        done("ok");
      } catch (err) {
        done("error");
        console.error("loadUserFollowers() Follow.vue error:", err);
      }
    },
    async loadUserFollowings({ done }) {
      try {
        const response = await userService.getUserFollowings(
          this.id,
          this.lastCreatedAtFollowing
        );
        console.log(response);
        if (response.data.followings.length === 0) {
          return done("empty");
        }
        this.followings.push(...response.data.followings);
        this.lastCreatedAtFollowing =
          this.followings[this.followings.length - 1].createdAt;
        done("ok");
      } catch (err) {
        done("error");
        console.error("loadUserFollowings() Follow.vue error:", err);
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
