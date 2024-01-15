<template>
  <div v-if="post">
    <Post
      :post="parent"
      :isParent="true"
      :addPostFromParent="callAddPostFromParent"
      :updatePostFromParent="callUpdateParentPostFromParent"
      :deletePostFromParent="callDeleteParentPostFromParent"
    />
    <Post
      v-if="post"
      :post="post"
      :isMain="true"
      :addPostFromParent="callAddPostFromParent"
      :updatePostFromParent="callUpdatePostFromParent"
      :deletePostFromParent="callDeletePostFromParent"
      :replyToPostFromParent="callReplyToPostFromParent"
    />
  </div>
</template>

<script>
import Post from "./Post.vue";

export default {
  data() {
    return {
      parent: this.post.parents[this.post.parents.length - 1],
    };
  },
  methods: {
    callAddPostFromParent(newPost) {
      this.addPostFromParent(newPost);
    },
    callUpdatePostFromParent(newPost) {
      this.updatePostFromParent(newPost);
    },
    callDeletePostFromParent(id) {
      this.deletePostFromParent(id);
    },
    callReplyToPostFromParent(newPost) {
      this.replyToPostFromParent(newPost);
    },
    callUpdateParentPostFromParent(newPost) {
      this.updateParentPostFromParent(newPost);
    },
    callDeleteParentPostFromParent(id) {
      this.deleteParentPostFromParent(id);
    },
  },
  props: {
    post: {
      type: Object,
      required: true,
    },
    updatePostFromParent: {
      type: Function,
      required: true,
    },
    deletePostFromParent: {
      type: Function,
      required: true,
    },
    addPostFromParent: {
      type: Function,
      required: true,
    },
    updateParentPostFromParent: {
      type: Function,
      required: true,
    },
    deleteParentPostFromParent: {
      type: Function,
      required: true,
    },
    replyToPostFromParent: {
      type: Function,
      required: true,
    },
  },
  components: {
    Post,
  },
};
</script>
