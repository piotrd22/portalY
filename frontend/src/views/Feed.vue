<template>
  <v-container class="custom-container">
    <create-post-form
      :addPostFromParent="addPostFromParent"
      :addNewPostToFeedSocket="addNewPostToFeedSocket"
    ></create-post-form>

    <v-btn class="load-button" v-if="newPostsLength > 0" @click="loadNewPosts">
      Load more posts
      <v-badge :content="newPostsLength" color="primary" inline></v-badge>
    </v-btn>

    <v-infinite-scroll :onLoad="loadMore" :items="feed">
      <div v-for="post in feed" :key="post._id">
        <post
          :post="post"
          :updatePostFromParent="updatePostFromParent"
          :deletePostFromParent="deletePostFromParent"
          :addPostFromParent="addPostFromParent"
          :addNewPostToFeedSocket="addNewPostToFeedSocket"
        ></post>
      </div>
    </v-infinite-scroll>
  </v-container>
</template>

<script>
import postService from "../services/postService";
import Post from "../components/Post.vue";
import CreatePostForm from "../components/CreatePostForm.vue";
import { useSocketStore } from "../stores";

export default {
  data() {
    return {
      feed: [],
      lastCreatedAt: null,
      room: "",
      socket: useSocketStore().socket,
      newPostsLength: 0,
    };
  },
  mounted() {
    this.socket.on("newFeedPosts", () => {
      this.newPostsLength++;
    });
  },
  created() {
    this.joinRoom();
  },
  beforeUnmount() {
    this.leaveRoom();
  },
  methods: {
    async loadMore({ done }) {
      try {
        const response = await postService.getFeed(this.lastCreatedAt);
        if (response.data.posts.length === 0) {
          return done("empty");
        }
        this.feed.push(...response.data.posts);
        this.lastCreatedAt = this.feed[this.feed.length - 1]?.createdAt;
        done("ok");
      } catch (err) {
        done("error");
        console.error("loadMore() Feed.vue error: ", err);
      }
    },
    addPostFromParent(newPost) {
      this.feed.unshift(newPost);
    },
    updatePostFromParent(newPost) {
      const postToUpdate = this.feed.find((post) => post._id === newPost._id);
      if (postToUpdate) {
        postToUpdate.content = newPost.content;
      }
    },
    deletePostFromParent(id) {
      this.feed = this.feed.filter((post) => post._id !== id);
    },
    joinRoom() {
      const user = JSON.parse(localStorage.getItem("user"));
      const loggedInUserId = user._id;
      this.room = loggedInUserId;
      this.socket.emit("joinRoom", this.room);
    },
    leaveRoom() {
      this.socket.emit("leaveRoom", this.room);
      this.room = "";
      this.newPostsLength = 0;
    },
    addNewPostToFeedSocket() {
      this.socket.emit("newFeedPost");
    },
    async loadNewPosts() {
      try {
        this.feed = [];
        this.lastCreatedAt = null;
        const response = await postService.getFeed(this.lastCreatedAt);
        this.feed = response.data.posts;
        this.lastCreatedAt = this.feed[this.feed.length - 1]?.createdAt;
        this.newPostsLength = 0;
      } catch (err) {
        console.error("loadNewPosts() Feed.vue error: ", err);
      }
    },
  },
  components: {
    Post,
    CreatePostForm,
  },
};
</script>

<style scoped>
.custom-container {
  max-width: 60%;
}

.load-button {
  margin-top: 10px;
}
</style>
