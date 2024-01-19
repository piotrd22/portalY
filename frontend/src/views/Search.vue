<template>
  <v-container class="custom-container">
    <v-infinite-scroll :onLoad="loadUsers" :items="users">
      <div v-for="user in users" :key="user._id">
        <user :user="user"></user>
      </div>
    </v-infinite-scroll>
  </v-container>
</template>

<script>
import userService from "../services/userService";
import User from "../components/User.vue";

export default {
  data() {
    return {
      users: [],
      lastCreatedAtUser: null,
    };
  },
  props: {
    keyword: String,
    lastCreatedAt: String,
  },
  watch: {
    async $route() {
      this.users = [];
      this.lastCreatedAtUser = null;
      if (window.scrollY === 0) {
        await this.getUsers();
      } else {
        window.scrollTo(0, 0);
      }
    },
  },
  mounted() {
    this.LastCreatedAtUser = this.lastCreatedAt;
  },
  methods: {
    async getUsers() {
      try {
        const response = await userService.searchUsers(
          this.keyword,
          this.lastCreatedAtUser
        );
        this.users.push(...response.data.users);
        this.lastCreatedAtUser =
          response.data.users[response.data.users.length - 1].createdAt;
      } catch (err) {
        console.error("getUsers() Search.vue error: ", err);
      }
    },
    async loadUsers({ done }) {
      try {
        const response = await userService.searchUsers(
          this.keyword,
          this.lastCreatedAtUser
        );
        if (response.data?.users.length === 0) {
          return done("empty");
        }
        this.users.push(...response.data.users);
        this.lastCreatedAtUser =
          response.data.users[response.data.users.length - 1].createdAt;
        done("ok");
      } catch (err) {
        done("error");
        console.error("loadUsers() Search.vue error: ", err);
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
