<template>
  <v-form @submit.prevent="createReply">
    <div class="custom-form">
      <v-textarea
        v-model="newReply"
        label="Post your reply"
        required
        rows="3"
        :auto-grow="false"
        class="custom-textarea"
      ></v-textarea>

      <v-btn type="submit" color="primary" class="mx-auto">reply</v-btn>
    </div>
  </v-form>
</template>

<script>
import postService from "../services/postService";

export default {
  data() {
    return {
      newReply: "",
    };
  },
  methods: {
    async createReply() {
      try {
        const response = await postService.createReply(
          this.newReply,
          this.postId
        );
        this.newReply = "";
        this.addPostFromParent(response.data.post);
        this.$toast.success("Reply successfully added!");
      } catch (err) {
        console.error("createReply() ReplyPostForm.vue error:", err);
        const errorMessage = err.response.data.message || "Added post failed.";
        this.$toast.error(errorMessage);
      }
    },
  },
  props: {
    addPostFromParent: {
      type: Function,
      required: true,
    },
    postId: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.custom-form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
}

.custom-textarea {
  width: 100%;
}
</style>
