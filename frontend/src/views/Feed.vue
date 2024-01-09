<template>
  <div>Feed</div>
</template>

<script>
import postService from '../services/postService';

export default {
  data() {
    return {
      feed: [],
    };
  },
  mounted() {
    this.fetchFeed();
  },
  methods: {
    async fetchFeed() {
      try {
        const response = await postService.getFeed();
        this.feed = response.data.posts;
        console.log(this.feed[0]._id)
      } catch (error) {
        console.error("Wystąpił błąd podczas pobierania danych feeda:", error);
      }
    },
  },
};
</script>
