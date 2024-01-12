import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Feed from "../views/Feed.vue";
import NotFound from "../views/NotFound.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/feed",
    name: "Feed",
    component: Feed,
    meta: { requiresAuth: true },
  },
  { path: "/:pathMatch(.*)*", component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const isAuthenticated = () => {
  return JSON.parse(localStorage.getItem("isLoggedIn"));
};

router.beforeEach((to, _, next) => {
  if (to.meta.requiresAuth) {
    const authenticated = isAuthenticated();
    if (authenticated) {
      next();
    } else {
      next({ name: "Home" });
    }
  } else if (to.name === "Home" && isAuthenticated()) {
    next({ name: "Feed" });
  } else {
    next();
  }
});

export default router;
