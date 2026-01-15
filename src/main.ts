import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/home" },
    { path: "/home", component: () => import("./pages/home.vue") },
    { path: "/tunnel", component: () => import("./pages/tunnel.vue") },
    { path: "/settings", component: () => import("./pages/settings.vue") },
  ],
});
const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.mount("#app");