<template>
  <nav class="relative z-0 bg-background dark:bg-[#151515]" style="-webkit-app-region: drag">
    <ul class="relative z-10 flex items-center px-2" @mouseleave="handleMouseLeave">
      <div :style="hoverStyle"
        class="absolute left-0 top-1 -z-10 rounded-sm bg-border/70 blur-mode:bg-background/75 transition-all duration-250 ease-in-out" />

      <div :style="activeStyle"
        class="absolute bottom-0 left-0 h-0.5 bg-foreground transition-all duration-300 ease-in-out" />

      <li v-for="item in navItems" :key="item.id" :ref="setItemRef(item.id)" class="p-2 pt-1 group"
        style="-webkit-app-region: none" @mouseenter="handleMouseEnter(item.id)" @click="
          () => {
            setActive(item.id);
            $router.push(`/${item.id}`);
          }
        ">
        <div :class="cn(
          'relative z-20 rounded-md px-0.5 py-1.5 text-sm transition-colors cursor-default select-none flex items-center gap-2',
          activeId === item.id
            ? 'text-foreground'
            : 'text-foreground/40 dark:text-foreground/70 group-hover:text-foreground'
        )
          ">
          <component :is="item.icon" class="size-4" />
          <span>{{ item.label }}</span>
        </div>
      </li>

      <li :ref="setItemRef('settings')" class="p-2 pt-1 group absolute right-2" style="-webkit-app-region: none"
        @mouseenter="handleMouseEnter('settings')" @click="
          () => {
            setActive('settings');
            $router.push(`/settings`);
          }
        ">
        <div :class="cn(
          'relative z-20 rounded-md px-0.5 py-1.5 text-sm transition-colors cursor-default select-none flex items-center gap-2',
          activeId === 'settings'
            ? 'text-foreground'
            : 'text-foreground/40 dark:text-foreground/70 group-hover:text-foreground'
        )
          ">
          <SettingsIcon class="size-4" />
          <span>设置</span>
        </div>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, onUnmounted, ComponentPublicInstance } from "vue";
import type { Component, CSSProperties } from "vue";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  LayoutGridIcon,
  SettingsIcon
} from "lucide-vue-next";

interface NavItem {
  id: string;
  icon: Component;
  label: string;
}

const navItems: NavItem[] = [
  { id: "home", icon: HomeIcon, label: "主页" },
  { id: "tunnel", icon: LayoutGridIcon, label: "隧道" },
];

const activeId = ref<string>(navItems[0]!.id);

const hoverStyle = ref<CSSProperties>({
  opacity: 0,
  transform: "translate3d(0, 0, 0)",
  width: "0px",
  height: "0px"
});

const activeStyle = ref<CSSProperties>({
  opacity: 0,
  transform: "translate3d(0, 0, 0)",
  width: "0px"
});

const itemRefs = ref<Map<string, HTMLLIElement>>(new Map());

const setItemRef = (id: string) => (el: Element | ComponentPublicInstance | null) => {
  if (el && el instanceof HTMLLIElement) {
    itemRefs.value.set(id, el);
  } else {
    itemRefs.value.delete(id);
  }
};

const handleMouseEnter = (id: string) => {
  const el = itemRefs.value.get(id);
  if (el) {
    const { offsetLeft, offsetTop, offsetWidth } = el;

    hoverStyle.value = {
      opacity: 1,
      transform: `translate3d(${offsetLeft}px, ${offsetTop}px, 0px)`,
      width: `${offsetWidth}px`,
      height: "32px"
    };
  }
};

const handleMouseLeave = () => {
  hoverStyle.value = { ...hoverStyle.value, opacity: 0 };
};

const setActive = (id: string) => {
  activeId.value = id;
};

const updateActiveIndicator = () => {
  const activeEl = itemRefs.value.get(activeId.value);
  if (activeEl) {
    const { offsetLeft, offsetWidth } = activeEl;

    activeStyle.value = {
      opacity: 1,
      transform: `translate3d(${offsetLeft}px, 0px, 0px)`,
      width: `${offsetWidth}px`
    };
  }
};

onMounted(() => {
  updateActiveIndicator();

  watch(activeId, () => {
    updateActiveIndicator();
  });

  window.addEventListener("resize", updateActiveIndicator);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateActiveIndicator);
});
</script>
