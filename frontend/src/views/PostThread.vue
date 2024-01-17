<template>
  <v-container class="custom-container">
    <div v-if="parents && parents.length > 0">
      <div v-for="parent in parents" :key="parent._id">
        <Post
          :post="parent"
          :isParent="true"
          :addPostFromParent="quotePostFromParent"
          :updatePostFromParent="updateParentsPostFromParent"
          :deletePostFromParent="deleteParentsPostFromParent"
        />
      </div>
    </div>

    <Post
      v-if="post"
      :isMain="true"
      :post="post"
      :addPostFromParent="quotePostFromParent"
      :updatePostFromParent="updateMainPostFromParent"
      :deletePostFromParent="deleteMainPostFromParent"
      :replyToPostFromParent="addRepliesPostFromParent"
    />

    <reply-post-form
      v-if="post"
      :postId="post._id"
      :addPostFromParent="addRepliesPostFromParent"
      :addPostToThreadSocket="addPostToThreadSocket"
    ></reply-post-form>

    <v-infinite-scroll :onLoad="loadMoreReplies" :items="replies">
      <div v-for="reply in replies" :key="reply._id">
        <Post
          :post="reply"
          :addPostFromParent="quotePostFromParent"
          :updatePostFromParent="updateRepliesPostFromParent"
          :deletePostFromParent="deleteRepliesPostFromParent"
        />
      </div>
    </v-infinite-scroll>
  </v-container>
</template>

<script>
import postService from "../services/postService";
import Post from "../components/Post.vue";
import ReplyPostForm from "../components/ReplyPostForm.vue";
import socket from "../socket";

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      parents: [],
      replies: [],
      post: null,
      page: 1,
      room: "",
      timeoutId: null,
    };
  },
  watch: {
    async $route() {
      this.leaveRoom();
      this.page = 1;
      this.replies = [];
      await this.fetchPost();
      if (window.scrollY === 0) {
        await this.fetchReplies();
      } else {
        window.scrollTo(0, 0);
      }
      this.joinRoom();
    },
  },
  mounted() {
    socket.on("newPosts", () => {
      // timeoutId is useful when there are new posts,
      // but we don't want to show messages every time there are new posts,
      // so we wait X seconds to display such a toast
      if (!this.timeoutId) {
        this.timeoutId = setTimeout(() => {
          this.$toast.clear();
          this.$toast.info(
            "New posts have been added to the thread you are in. Refresh the page.",
            {
              duration: 10000,
            }
          );
          this.timeoutId = null;
        }, 10000);
      }
    });
  },
  created() {
    this.fetchPost();
    this.joinRoom();
  },
  beforeUnmount() {
    this.leaveRoom();
  },
  methods: {
    async fetchPost() {
      try {
        const response = await postService.getPostById(this.id);
        this.parents = response.data.post.parents;
        this.post = response.data.post;
      } catch (error) {
        console.error("Error fetching post data:", error);
      }
    },
    async fetchReplies() {
      try {
        const response = await postService.getPostReplies(this.id, this.page);
        this.replies = response.data.replies;
        this.page++;
      } catch (error) {
        console.error("Error fetching replies data:", error);
      }
    },
    async loadMoreReplies({ done }) {
      try {
        const response = await postService.getPostReplies(this.id, this.page);
        if (response.data.replies.length === 0) {
          return done("empty");
        }

        this.replies.push(...response.data.replies);
        this.page++;
        done("ok");
      } catch (error) {
        done("error");
        console.error("loadMoreReplies() PostThread.vue error: ", error);
      }
    },
    addRepliesPostFromParent(newPost) {
      this.replies.unshift(newPost);
    },
    quotePostFromParent(newPost) {
      console.log(newPost);
    },
    updateRepliesPostFromParent(newPost) {
      const postToUpdate = this.replies.find(
        (post) => post._id === newPost._id
      );
      if (postToUpdate) {
        postToUpdate.content = newPost.content;
      }
    },
    deleteRepliesPostFromParent(id) {
      this.replies = this.replies.filter((post) => post._id !== id);
    },
    updateParentsPostFromParent(newPost) {
      const postToUpdate = this.parents.find(
        (post) => post._id === newPost._id
      );
      if (postToUpdate) {
        postToUpdate.content = newPost.content;
      }
    },
    deleteParentsPostFromParent(id) {
      const postToUpdate = this.parents.find((post) => post._id === id);
      if (postToUpdate) {
        postToUpdate.content = "[deleted]";
      }
    },
    updateMainPostFromParent(newPost) {
      this.post.content = newPost.content;
    },
    deleteMainPostFromParent(_) {
      this.post.content = "[deleted]";
    },
    joinRoom() {
      this.room = `/post/${this.id}`;
      socket.emit("joinRoom", this.room);
    },
    leaveRoom() {
      socket.emit("leaveRoom", this.room);
      this.room = "";
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    },
    addPostToThreadSocket() {
      socket.emit("newPost", this.room);
    },
  },
  components: {
    Post,
    ReplyPostForm,
  },
};
</script>

<style scoped>
.custom-container {
  max-width: 60%;
}
</style>
