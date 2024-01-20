<template>
  <v-form ref="createReplyForm" @submit.prevent="createReply">
    <div class="custom-form">
      <v-textarea
        v-model="newReply"
        label="Post your reply"
        required
        rows="3"
        :auto-grow="false"
        :rules="createReplyRules"
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
        const validationResult = await this.$refs.createReplyForm.validate();
        if (validationResult.valid) {
          const response = await postService.createReply(
            this.newReply,
            this.postId
          );
          this.$refs.createReplyForm.reset();
          this.addPostFromParent(response.data.post);
          this.addPostToThreadSocket();
          this.$toast.success("Reply successfully added!");
        }
      } catch (err) {
        console.error("createReply() ReplyPostForm.vue error:", err);
        const errorMessage = err.response.data.message || "Added post failed.";
        this.$toast.error(errorMessage);
      }
    },
  },
  computed: {
    createReplyRules() {
      return [
        (value) => !!value || "Content is required",
        (value) => !/^\s+$/.test(value) || "Content cannot be only whitespace",
      ];
    },
  },
  props: {
    addPostFromParent: {
      type: Function,
      required: true,
    },
    addPostToThreadSocket: {
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
