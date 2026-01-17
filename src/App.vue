<template>
  <div class="flex flex-col h-screen transition-colors duration-300 bg-secondary dark:bg-background">
    <AppTitle/>
    <AppNavBar/>

    <div class="p-3">
      <router-view/>
    </div>

    <Toaster position="bottom-right"/>
  </div>
</template>

<script setup lang="ts">
import AppNavBar from "./components/app/AppNavBar.vue";
import AppTitle from "./components/app/AppTitle.vue";
import {toast, Toaster} from "vue-sonner";
import "vue-sonner/style.css";
import {useColorMode} from "@vueuse/core";
import {onMounted} from "vue";
import {load} from "@tauri-apps/plugin-store";
import {useFrpStore} from "@/store/frp.ts";
import {API_URL, FRPC_PATH} from "@/lib/env.ts";

const mode = useColorMode();
mode.value = "auto";

onMounted(async () => {
  const store = await load("settings.json", {
    defaults: {
      auto_tunnel: false,
      api_url: "https://api.hayfrp.com",
      frpc_path: "",
      tunnels: [],
    },
    autoSave: true,
  });

  API_URL.value = await store.get("api_url") || "https://api.hayfrp.com";
  FRPC_PATH.value = await store.get("frpc_path") || "";

  // 隧道自启动
  if (await store.get("auto_tunnel")) {
    const frpStore = useFrpStore();
    const tunnels: any[] = (await store.get("tunnels")) ?? [];

    if (tunnels.length === 0) return;

    const task = (async () => {
      const results = await Promise.allSettled(
          tunnels.map(t => frpStore.run(t.id, t.args))
      );
      const failCount = results.filter(r => r.status === "rejected").length;
      if (failCount > 0) throw new Error(`启动失败 ${failCount} 个`);

      return results.length;
    })();

    toast.promise(task, {
      loading: "正在启动隧道",
      success: (count: number) => `启动完成, 共 ${count} 个隧道`,
      error: (e: any) => e.message,
    });
  }

});
</script>
