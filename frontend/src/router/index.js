import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Feed from "../views/Feed.vue";
import PostThread from "../views/PostThread.vue";
import PostQuotedBy from "../views/PostQuotedBy.vue";
import Profile from "../views/Profile.vue";
import EditProfile from "../views/EditProfile.vue";
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
  {
    path: "/post/:id",
    name: "PostThread",
    component: PostThread,
    props: true, // Passes id as a property of the component
    meta: { requiresAuth: true },
  },
  {
    path: "/post/:id/quotes",
    name: "PostQuotedBy",
    component: PostQuotedBy,
    props: true, // Passes id as a property of the component
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/:id",
    name: "Profile",
    component: Profile,
    props: true, // Passes id as a property of the component
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/:id/edit",
    name: "EditProfile",
    component: EditProfile,
    props: true, // Passes id as a property of the component
    meta: { requireMe: true },
  },
  { path: "/:pathMatch(.*)*", name: "NotFound", component: NotFound },
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
  } else if (to.meta.requireMe) {
    const user = JSON.parse(localStorage.getItem("user"));
    const propsId = to.params.id;
    if (user && propsId && user._id === propsId) {
      next();
    } else {
      next({ name: "NotFound" });
    }
  } else if (to.name === "Home" && isAuthenticated()) {
    next({ name: "Feed" });
  } else {
    next();
  }
});

export default router;
