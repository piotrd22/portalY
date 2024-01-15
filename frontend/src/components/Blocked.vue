<template>
  <div class="blocked-container">
    <v-card>
      <v-card-title>
        {{
          blockedBy
            ? "You are blocked by this user"
            : "You have blocked this user"
        }}
      </v-card-title>
      <v-card-text>
        <p>{{ message }}</p>
        <v-btn @click="unblockUser" color="primary" class="unblock-btn"
          >Unblock User</v-btn
        >
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    blockedBy: {
      type: Boolean,
      required: true,
    },
    unblockUser: {
      type: Function,
      required: true,
    },
    message: String,
  },
};
</script>

<style scoped>
.blocked-container {
  max-width: 60%;
  margin: 30px auto;
}

.unblock-btn {
  margin-top: 20px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>
