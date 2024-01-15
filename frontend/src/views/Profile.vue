<template>
  <v-container class="custom-container" v-if="isBlocked">
    <div v-if="isBlocked">
      <Blocked
        :blockedBy="blockedBy"
        :unblockUser="unblockUser"
        :message="blockedMessage"
      />
    </div>
  </v-container>
  <v-container class="custom-container" v-else-if="user">
    <div class="header-container">
      <div class="avatar-container">
        <v-avatar size="175">
          <img
            v-if="user.avatar"
            :src="user.avatar"
            alt="User Avatar"
            class="avatar-image"
          />
          <img
            v-else
            src="../assets/default-avatar.jpg"
            alt="User Avatar"
            class="avatar-image"
          />
        </v-avatar>
      </div>

      <div class="user-info">
        <h2 v-if="user.name">{{ user.name }}</h2>
        <h2 v-else>@{{ user.username }}</h2>
        <span v-if="user.name">@{{ user.username }}</span>

        <div class="icon-info">
          <div>
            <v-icon class="v-icon">mdi-calendar</v-icon>
            <span>Joined {{ formatDate(user.createdAt) }}</span>
          </div>

          <div v-if="user.birthDate">
            <v-icon class="v-icon">mdi-cake</v-icon>
            <span>{{ formatDate(user.birthDate) }}</span>
          </div>

          <div v-if="user.website">
            <v-icon class="v-icon">mdi-earth</v-icon>
            <a :href="user.website" target="_blank" class="website-link">{{
              user.website
            }}</a>
          </div>
        </div>

        <div class="icon-info">
          <div>
            <router-link
              :to="'/profile/' + id + '/followers'"
              class="router-link"
            >
              <span>{{ followersLength }} Followers</span>
            </router-link>
          </div>

          <div>
            <router-link
              :to="'/profile/' + id + '/following'"
              class="router-link"
            >
              <span>{{ followingLength }} Following</span>
            </router-link>
          </div>
        </div>

        <div class="bio-container" v-if="user.bio">
          <p>{{ user.bio }}</p>
        </div>
      </div>
    </div>

    <div class="action-buttons" v-if="id !== loggedInUserId">
      <v-btn v-if="isFollowedUser" @click="unfollowUser">Unfollow</v-btn>
      <v-btn v-else @click="followUser">Follow</v-btn>
      <v-btn @click="blockUser">Block</v-btn>
    </div>

    <div class="action-buttons" v-else>
      <router-link :to="'/profile/' + id + '/edit'" class="router-link">
        <v-btn>Edit Profile </v-btn>
      </router-link>
    </div>

    <v-card>
      <v-tabs v-model="tab" bg-color="primary">
        <v-tab value="posts">Posts</v-tab>
        <v-tab value="replies">Replies</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="tab">
          <v-window-item value="posts">
            <v-infinite-scroll :onLoad="loadUserPosts" :items="posts">
              <div v-for="post in posts" :key="post._id">
                <Post
                  :post="post"
                  :addPostFromParent="quotePostFromParent"
                  :updatePostFromParent="updatePostsPostFromParent"
                  :deletePostFromParent="deletePostsPostFromParent"
                />
              </div>
            </v-infinite-scroll>
          </v-window-item>

          <v-window-item value="replies">
            <v-infinite-scroll :onLoad="loadUserReplies" :items="replies">
              <div v-for="reply in replies" :key="reply._id">
                <PostWithParent
                  :post="reply"
                  :addPostFromParent="addPostFromParent"
                  :deletePostFromParent="deleteReplyPostFromParent"
                  :updatePostFromParent="updateReplyPostFromParent"
                  :updateParentPostFromParent="updateReplyParentPostFromParent"
                  :deleteParentPostFromParent="deleteReplyParentPostFromParent"
                  :replyToPostFromParent="replyToPostFromParent"
                />
              </div>
            </v-infinite-scroll>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import userService from "../services/userService";
import Post from "../components/Post.vue";
import Blocked from "../components/Blocked.vue";
import PostWithParent from "../components/PostWithParent.vue";

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      user: null,
      followersLength: 0,
      followingLength: 0,
      loggedInUserId: null,
      isFollowedUser: false,
      tab: null,
      posts: [],
      postsPage: 1,
      replies: [],
      repliesPage: 1,
      isBlocked: false,
      blockedBy: false,
      blockedMessage: "",
    };
  },
  watch: {
    async $route() {
      this.postsPage = 1;
      this.posts = [];
      await this.getUserById();
      window.scrollTo(0, 0);
    },
  },
  mounted() {
    this.getUserById();
    this.getLoggedInUserId();
  },
  methods: {
    async getUserById() {
      try {
        const response = await userService.getUserById(this.id);
        this.user = response.data.user;
        this.isFollowedUser = this.user.followers.includes(this.loggedInUserId);
        this.followersLength = this.user.followers.length;
        this.followingLength = this.user.following.length;
      } catch (err) {
        if (err.response && err.response.status === 403) {
          this.isBlocked = true;
          this.blockedBy = err.response.data?.blockedBy;
          this.blockedMessage = err.response.data?.message;
        } else {
          console.error("getUserById() Profile.vue error:", err);
        }
      }
    },
    getLoggedInUserId() {
      const user = JSON.parse(localStorage.getItem("user"));
      this.loggedInUserId = user._id;
    },
    formatDate(date) {
      const options = { year: "numeric", month: "numeric", day: "numeric" };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    async followUser() {
      try {
        await userService.followUser(this.id);
        this.isFollowedUser = true;
        this.$toast.success("User has been followed.");
        this.followersLength++;
      } catch (err) {
        console.error("followUser() Profile.vue error:", err);
        const errorMessage =
          err?.response?.data.message || "Following user failed.";
        this.$toast.error(errorMessage);
      }
    },
    async unfollowUser() {
      try {
        await userService.unfollowUser(this.id);
        this.isFollowedUser = false;
        this.$toast.success("User has been unfollowed.");
        this.followersLength--;
      } catch (err) {
        console.error("unfollowUser() Profile.vue error:", err);
        const errorMessage =
          err?.response?.data.message || "Unfollowing user failed.";
        this.$toast.error(errorMessage);
      }
    },
    async blockUser() {
      try {
        await userService.blockUser(this.id);
        this.$toast.success("User has been blocked.");
        location.reload();
      } catch (err) {
        console.error("blockUser() Profile.vue error:", err);
        const errorMessage =
          err?.response?.data.message || "Blocking user failed.";
        this.$toast.error(errorMessage);
      }
    },
    async unblockUser() {
      try {
        await userService.unblockUser(this.id);
        this.$toast.success("User has been unblocked.");
        location.reload();
      } catch (err) {
        console.error("unblockUser() Profile.vue error:", err);
        const errorMessage =
          err?.response?.data.message || "Unblocking user failed.";
        this.$toast.error(errorMessage);
      }
    },
    async loadUserPosts({ done }) {
      try {
        const response = await userService.getUserPosts(
          this.id,
          this.postsPage
        );
        if (response.data.posts.length === 0) {
          return done("empty");
        }
        this.posts.push(...response.data.posts);
        this.postsPage++;
        done("ok");
      } catch (err) {
        done("error");
        console.error("loadUserPosts() Profile.vue error:", err);
      }
    },
    updatePostsPostFromParent(newPost) {
      const postToUpdate = this.posts.find((post) => post._id === newPost._id);
      if (postToUpdate) {
        postToUpdate.content = newPost.content;
      }
    },
    deletePostsPostFromParent(id) {
      this.posts = this.posts.filter((post) => post._id !== id);
    },
    quotePostFromParent(newPost) {
      this.posts.unshift(newPost);
    },
    async loadUserReplies({ done }) {
      try {
        const response = await userService.getUserReplies(
          this.id,
          this.repliesPage
        );
        if (response.data.replies.length === 0) {
          return done("empty");
        }
        this.replies.push(...response.data.replies);
        this.repliesPage++;
        done("ok");
      } catch (err) {
        done("error");
        console.error("loadUserReplies() Profile.vue error:", err);
      }
    },
    addPostFromParent(newPost) {
      this.posts.unshift(newPost);
    },
    deleteReplyPostFromParent(id) {
      this.replies = this.replies.filter((post) => post._id !== id);
    },
    updateReplyPostFromParent(newPost) {
      const postToUpdate = this.replies.find(
        (post) => post._id === newPost._id
      );
      if (postToUpdate) {
        postToUpdate.content = newPost.content;
      }
    },
    updateReplyParentPostFromParent(newPost) {
      const postsToUpdate = this.replies.filter((post) =>
        post.parents.some((parent, index) => {
          const lastParentIndex = post.parents.length - 1;
          return parent._id === newPost._id && index === lastParentIndex;
        })
      );

      postsToUpdate.forEach((postToUpdate) => {
        const lastParentIndex = postToUpdate.parents.length - 1;
        const lastParent = postToUpdate.parents[lastParentIndex];

        if (lastParent) {
          lastParent.content = newPost.content;
        }
      });
    },
    deleteReplyParentPostFromParent(id) {
      const postsToUpdate = this.replies.filter((post) =>
        post.parents.some((parent, index) => {
          const lastParentIndex = post.parents.length - 1;
          return parent._id === id && index === lastParentIndex;
        })
      );

      postsToUpdate.forEach((postToUpdate) => {
        const lastParentIndex = postToUpdate.parents.length - 1;
        const lastParent = postToUpdate.parents[lastParentIndex];

        if (lastParent) {
          lastParent.content = "[deleted]";
        }
      });
    },
    replyToPostFromParent(newPost) {
      console.log("todo");
    },
  },
  components: {
    Post,
    Blocked,
    PostWithParent,
  },
};
</script>

<style scoped>
.custom-container {
  max-width: 60%;
}

.v-icon {
  margin-right: 3px;
}

.header-container {
  display: flex;
  align-items: start;
}

.avatar-container {
  margin-right: 20px;
}

.avatar-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 50%;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.icon-info {
  display: flex;
  align-items: center;
  margin-top: 10px;

  div {
    margin-right: 10px;
  }
}

.bio-container {
  margin-top: 10px;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.website-link {
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}

.website-link:hover {
  color: #2196f3;
}

.router-link {
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}

.router-link:hover {
  color: #2196f3;
}

.v-card {
  margin-top: 30px;
}
</style>
