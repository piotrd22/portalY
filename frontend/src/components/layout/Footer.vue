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
            <v-btn
              v-if="showButton"
              @click="scrollToTop"
              icon
              class="social-btn"
              color="primary"
            >
              <v-icon>mdi-arrow-up</v-icon>
            </v-btn>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script>
export default {
  data() {
    return {
      showButton: false,
    };
  },
  methods: {
    openLink(url) {
      window.open(url, "_blank");
    },
    openMail(mailto) {
      window.location.href = mailto;
    },
    handleScroll() {
      const scrollPosition =
        window.scrollY || document.documentElement.scrollTop;
      this.showButton = scrollPosition > 20;
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
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
