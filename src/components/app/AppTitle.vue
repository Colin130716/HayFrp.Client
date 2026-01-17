<template>
  <div
    class="p-2 pb-0 flex items-center justify-between w-full bg-background dark:bg-[#151515]"
    style="-webkit-app-region: drag"
  >
    <span class="ml-1"><b>HAYFRP</b></span>

    <div class="flex items-center gap-2">
      <Button
          v-if="navStore.refreshAction"
          variant="ghost"
          class="size-8"
          style="-webkit-app-region: none"
          @click="navStore.refreshAction"
      >
        <RotateCwIcon />
      </Button>

      <Button
        variant="ghost"
        class="size-8"
        style="-webkit-app-region: none"
        @click="getCurrentWindow().minimize()"
      >
        <MinusIcon />
      </Button>

      <Button
        variant="ghost"
        class="size-8"
        style="-webkit-app-region: none"
        @click="getCurrentWindow().hide()"
      >
        <XIcon />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MinusIcon, XIcon, RotateCwIcon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {useNavStore} from "@/store/nav.ts";

const navStore = useNavStore();
</script>
