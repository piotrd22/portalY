<template>
  <router-link
    v-if="post"
    :to="`/post/${post._id}`"
    :key="`/post/${post._id}`"
    class="post-link"
  >
    <div :class="getPostClasses">
      <div v-if="post.user">
        <router-link :to="`/profile/${post.user._id}`" class="user-info">
          <v-avatar :size="40">
            <img
              v-if="post.user.avatar"
              :src="post.user.avatar"
              alt="User Avatar"
              class="avatar-image"
            />
            <img
              v-else
              src="../assets/default-avatar.jpg"
              alt="Default Avatar"
              class="avatar-image"
            />
          </v-avatar>
          <span v-if="post.user.username" class="username">
            @{{ post.user.username }}
          </span>
          <span v-else class="username"> [bug] </span>
        </router-link>
      </div>

      <div v-else>
        <div class="user-info">
          <v-avatar :size="40">
            <img
              src="../assets/default-avatar.jpg"
              alt="Default Avatar"
              class="avatar-image"
            />
          </v-avatar>
          <span class="username"> [deleted] </span>
        </div>
      </div>

      <div class="content">{{ post.content }}</div>

      <router-link
        v-if="post.quotedPost"
        :to="`/post/${post.quotedPost._id}`"
        :key="`/post/${post.quotedPost._id}`"
        class="quoted-link"
      >
        <div v-if="post.quotedPost" class="quoted-post">
          <router-link
            v-if="post.quotedPost.user"
            :to="`/profile/${post.quotedPost.user._id}`"
            class="quoted-user-info"
          >
            <v-avatar :size="30">
              <img
                v-if="post.quotedPost.user.avatar"
                :src="post.quotedPost.user.avatar"
                alt="Quoted User Avatar"
                class="avatar-image"
              />
              <img
                v-else
                src="../assets/default-avatar.jpg"
                alt="Default Avatar"
                class="avatar-image"
              />
            </v-avatar>
            <span v-if="post.quotedPost.user.username" class="username">
              @{{ post.quotedPost.user.username }}
            </span>
          </router-link>

          <div v-else>
            <v-avatar :size="30">
              <img
                src="../assets/default-avatar.jpg"
                alt="Default Avatar"
                class="avatar-image"
              />
            </v-avatar>
            <span class="username"> [deleted] </span>
          </div>

          <div class="quoted-content">{{ post.quotedPost.content }}</div>
        </div>
      </router-link>

      <div class="post-details">
        <div>
          <v-icon class="v-icon">mdi-calendar-clock</v-icon>
          <span>{{ formatDate(post.createdAt) }}</span>
          <v-icon class="v-icon reply-icon" @click.prevent="openReplyPostDialog"
            >mdi-comment-multiple</v-icon
          >
          <span>{{ post.replies.length }}</span>
          <v-icon class="v-icon quote-icon" @click.prevent="openQuotePostDialog"
            >mdi-format-quote-close</v-icon
          >
          <router-link :to="`/post/${post._id}/quotes`" class="quote-link">
            {{ quotedLength }}
          </router-link>
        </div>
        <div v-if="isThisUserPost(post)">
          <v-icon @click.prevent="openUpdatePostDialog" class="update-icon"
            >mdi-pencil</v-icon
          >
          <v-icon @click.prevent="openDeletePostDialog" class="delete-icon"
            >mdi-delete</v-icon
          >
        </div>
      </div>
    </div>
  </router-link>

  <v-dialog v-model="updatePostDialog" persistent max-width="500">
    <v-card>
      <v-card-title>Update Post</v-card-title>
      <v-card-text>
        <v-text-field v-model="updatePostContent"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn type="submit" color="primary" @click="updatePost"
          >Update Post</v-btn
        >
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="closeUpdatePostDialog"
          >Close</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="deletePostDialog" persistent max-width="500">
    <v-card>
      <v-card-text>
        <p>Are you sure you want to delete this post?</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" dark @click="deletePost">Delete Post</v-btn>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="closeDeletePostDialog"
          >Close</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="quotePostDialog" persistent max-width="600">
    <v-card>
      <v-card-title> Quote Post </v-card-title>
      <v-card-text>
        <v-text-field v-model="quotePostContent"></v-text-field>
        <div>
          <div class="user-info">
            <v-avatar :size="40">
              <img
                v-if="post.user.avatar"
                :src="post.user.avatar"
                alt="Quoted User Avatar"
                class="avatar-image"
              />
              <img
                v-else
                src="../assets/default-avatar.jpg"
                alt="Default Avatar"
                class="avatar-image"
              />
            </v-avatar>
            <span v-if="post.user.username" class="username">
              @{{ post.user.username }}
            </span>
            <span v-else class="username"> [deleted] </span>
          </div>
          <p>{{ post.content }}</p>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="quotePost"> Quote Post </v-btn>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="closeQuotePostDialog"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="replyPostDialog" persistent max-width="500">
    <v-card>
      <v-card-title>Reply</v-card-title>
      <v-card-text>
        <v-text-field v-model="replyPostContent"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn type="submit" color="primary" @click="createReply">Reply</v-btn>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="closeReplyPostDialog"
          >Close</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import postService from "../services/postService";
import socket from "../socket";

export default {
  data() {
    return {
      updatePostDialog: false,
      updatePostContent: this.post.content,
      deletePostDialog: false,
      quotePostDialog: false,
      quotePostContent: "",
      quotedLength: this.post.quotedBy.length,
      replyPostDialog: false,
      replyPostContent: "",
    };
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
    isMain: {
      type: Boolean,
      default: false,
    },
    isParent: {
      type: Boolean,
      default: false,
    },
    replyToPostFromParent: Function,
  },
  computed: {
    getPostClasses() {
      if (this.isMain) {
        return "main-post";
      } else if (this.isParent) {
        return "post-parent";
      } else {
        return "post";
      }
    },
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
    isThisUserPost(post) {
      const user = JSON.parse(localStorage.getItem("user"));
      return post.user && user._id && post.user._id === user._id;
    },
    openUpdatePostDialog() {
      this.updatePostDialog = true;
    },
    closeUpdatePostDialog() {
      this.updatePostDialog = false;
    },
    async updatePost() {
      try {
        const response = await postService.updatePost(
          { content: this.updatePostContent },
          this.post._id
        );
        this.closeUpdatePostDialog();
        this.$toast.success("Post successfully updated!");
        this.updatePostFromParent(response.data.post);
      } catch (err) {
        console.error("updatePost() Post.vue error:", err);
        const errorMessage =
          err?.response?.data.message || "Updating post failed.";
        this.$toast.error(errorMessage);
      }
    },
    openDeletePostDialog() {
      this.deletePostDialog = true;
    },
    closeDeletePostDialog() {
      this.deletePostDialog = false;
    },
    async deletePost() {
      try {
        await postService.deletePost(this.post._id);
        this.closeDeletePostDialog();
        this.$toast.success("Post successfully deleted!");
        this.deletePostFromParent(this.post._id);
      } catch (err) {
        console.error("deletePost() Post.vue error:", err);
        const errorMessage =
          err?.response?.data.message || "Deleting post failed.";
        this.$toast.error(errorMessage);
      }
    },
    openQuotePostDialog() {
      this.quotePostDialog = true;
    },
    closeQuotePostDialog() {
      this.quotePostContent = "";
      this.quotePostDialog = false;
    },
    async quotePost() {
      try {
        const response = await postService.createQuote(
          this.quotePostContent,
          this.post._id
        );
        this.closeQuotePostDialog();
        this.$toast.success("Post successfully quoted!");
        this.quotedLength++;
        this.quotePostContent = "";
        this.addPostFromParent(response.data.post);
      } catch (err) {
        console.error("quotePost() Post.vue error:", err);
        const errorMessage =
          err?.response?.data.message || "Quoting post failed.";
        this.$toast.error(errorMessage);
      }
    },
    openReplyPostDialog() {
      this.replyPostDialog = true;
    },
    closeReplyPostDialog() {
      (this.replyPostContent = ""), (this.replyPostDialog = false);
    },
    async createReply() {
      try {
        const response = await postService.createReply(
          this.replyPostContent,
          this.post._id
        );
        this.closeReplyPostDialog();
        this.$toast.success("Reply successfully added!");
        this.post.replies.push(response.data.post);
        this.replyPostContent = "";
        this.addPostToThreadSocket();
        if (this.replyToPostFromParent) {
          this.replyToPostFromParent(response.data.post);
        }
      } catch (err) {
        console.error("createReply() Post.vue error:", err);
        const errorMessage = err?.response?.data.message || "Replying failed.";
        this.$toast.error(errorMessage);
      }
    },
    addPostToThreadSocket() {
      socket.emit("newPost", `/post/${this.post._id}`);
    },
  },
};
</script>

<style scoped>
.post {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ddd;
}

.post-parent {
  margin-bottom: 10px;
  padding: 10px;
  border-left: 2px solid #ddd;
}

.main-post {
  margin-bottom: 20px;
  padding: 10px;
  border: 2px solid #ddd;
}

.content {
  margin-left: 10px;
  margin-bottom: 10px;
  margin-top: 10px;
}

.quoted-content {
  margin-left: 5px;
  margin-bottom: 5px;
  margin-top: 5px;
}

.post-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.post-link a {
  color: black;
  text-decoration: none;
}

.user-info,
.quoted-user-info {
  display: flex;
  align-items: center;
}

.avatar-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 50%;
  cursor: pointer;
}

.post-link .deleted-user,
.post-link .quoted-link {
  color: black;
  text-decoration: none;
}

.quoted-post {
  border-left: 2px solid #ddd;
  margin-left: 30px;
  padding-left: 10px;
}

.username {
  margin-left: 5px;
  text-decoration: none;
  color: #9e9e9e;
}

.post-details {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #424242;
  margin-top: 10px;
}

.v-icon {
  margin-left: 10px;
}

.post-details div span {
  margin-left: 5px;
}

.update-icon:hover {
  color: #2196f3;
}

.delete-icon:hover {
  color: #f44336;
}

.quote-icon:hover {
  color: #9c27b0;
}

.reply-icon:hover {
  color: #009688;
}

.quote-length:hover {
  color: #9c27b0;
}
</style>
