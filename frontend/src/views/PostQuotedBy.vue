<template>
  <v-container class="custom-container">
    <v-infinite-scroll :onLoad="loadMoreQuotes" :items="quotes">
      <div v-for="quote in quotes" :key="quote._id">
        <Post
          :post="quote"
          :addPostFromParent="quotePostFromParent"
          :updatePostFromParent="updateQuotesPostFromParent"
          :deletePostFromParent="deleteQuotesPostFromParent"
        />
      </div>
    </v-infinite-scroll>
  </v-container>
</template>

<script>
import postService from "../services/postService";
import Post from "../components/Post.vue";

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      quotes: [],
      lastCreatedAt: null,
    };
  },
  methods: {
    async loadMoreQuotes({ done }) {
      try {
        const response = await postService.getPostQuotedBy(
          this.id,
          this.lastCreatedAt
        );
        if (response.data.quotedBy.length === 0) {
          return done("empty");
        }
        this.quotes.push(...response.data.quotedBy);
        this.lastCreatedAt = this.quotes[this.quotes.length - 1].createdAt;
        done("ok");
      } catch (error) {
        done("error");
        console.error("loadMoreQuotes() PostQuotedBy.vue error: ", error);
      }
    },
    quotePostFromParent(newPost) {
      console.log(newPost);
    },
    updateQuotesPostFromParent(newPost) {
      const postToUpdate = this.quotes.find((post) => post._id === newPost._id);
      if (postToUpdate) {
        postToUpdate.content = newPost.content;
      }
    },
    deleteQuotesPostFromParent(id) {
      this.quotes = this.feed.filter((post) => post._id !== id);
    },
  },
  components: {
    Post,
  },
};
</script>

<style scoped>
.custom-container {
  max-width: 60%;
}
</style>
