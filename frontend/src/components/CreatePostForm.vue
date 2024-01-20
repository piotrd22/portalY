<template>
  <v-form ref="createPostForm" @submit.prevent="createPost">
    <div class="custom-form">
      <v-textarea
        v-model="newPostContent"
        label="What is happening?!"
        required
        rows="3"
        :auto-grow="false"
        :rules="createPostRules"
        class="custom-textarea"
      ></v-textarea>

      <v-btn type="submit" color="primary" class="mx-auto">Add post</v-btn>
    </div>
  </v-form>
</template>

<script>
import postService from "../services/postService";

export default {
  data() {
    return {
      newPostContent: "",
    };
  },
  methods: {
    async createPost() {
      try {
        const validationResult = await this.$refs.createPostForm.validate();
        if (validationResult.valid) {
          const response = await postService.createPost({
            content: this.newPostContent,
          });
          this.$refs.createPostForm.reset();
          this.addPostFromParent(response.data.post);
          this.$toast.success("Post successfully added!");
        }
      } catch (err) {
        console.error("createPost() Form.vue error:", err);
        const errorMessage = err.response.data.message || "Added post failed.";
        this.$toast.error(errorMessage);
      }
    },
  },
  computed: {
    createPostRules() {
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
