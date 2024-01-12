<template>
  <v-container class="custom-container">
    <create-post-form :addPostFromParent="addPostFromParent"></create-post-form>
    <v-infinite-scroll :onLoad="loadMore" :items="feed">
      <div v-for="post in feed" :key="post._id">
        <post
          :post="post"
          :updatePostFromParent="updatePostFromParent"
          :deletePostFromParent="deletePostFromParent"
          :addPostFromParent="addPostFromParent"
        ></post>
      </div>
    </v-infinite-scroll>
  </v-container>
</template>

<script>
import postService from "../services/postService";
import Post from "../components/Post.vue";
import CreatePostForm from "../components/CreatePostForm.vue";

export default {
  data() {
    return {
      user: null,
      feed: [],
      page: 1,
    };
  },
  methods: {
    async fetchFeed(page) {
      return await postService.getFeed(page);
    },
    async loadMore({ done }) {
      try {
        const response = await postService.getFeed(this.page);
        if (response.data.posts.length === 0) {
          return done("empty");
        }
        this.feed.push(...response.data.posts);
        this.page++;
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
</style>
