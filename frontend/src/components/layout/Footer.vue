<template>
  <v-footer app>
    <v-container>
      <v-row align="center">
        <v-col>
          <div class="caption">
            &copy; {{ new Date().getFullYear() }} PortalY | Author: Piotr
            Damrych
          </div>
        </v-col>
        <v-col class="social-icons">
          <v-row align="center" justify="end">
            <v-btn
              icon
              class="social-btn"
              @click="openLink('https://github.com/piotrd22')"
            >
              <v-icon>mdi-github</v-icon>
            </v-btn>
            <v-btn
              icon
              class="social-btn"
              @click="
                openLink('https://www.linkedin.com/in/piotr-damrych-146a1421a/')
              "
            >
              <v-icon>mdi-linkedin</v-icon>
            </v-btn>
            <v-btn
              icon
              class="social-btn"
              @click="openMail('mailto:piotr.damrych@icloud.com')"
            >
              <v-icon>mdi-email</v-icon>
            </v-btn>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script>
export default {
  methods: {
    openLink(url) {
      window.open(url, "_blank");
    },
    openMail(mailto) {
      window.location.href = mailto;
    },
  },
};
</script>

<style scoped>
.caption {
  font-size: 12px;
}

.social-icons {
  margin-left: auto;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.social-btn {
  margin-left: 10px;
}
</style>
