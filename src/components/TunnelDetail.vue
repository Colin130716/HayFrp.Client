<template>
  <div
      v-if="tunnel"
      ref="overlayRef"
      class="absolute inset-0 z-50 flex flex-col bg-background dark:bg-[#151515] p-3 overflow-hidden border origin-top-left rounded-md"
  >
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <ButtonGroup class="h-7">
          <Badge variant="outline" class="rounded-sm"><span>{{ tunnel.proxy_type.toUpperCase() }}</span></Badge>
          <Badge v-if="tunnel.use_encryption == 'true'" variant="outline" class="rounded-sm">加密</Badge>
          <Badge v-if="tunnel.use_compression == 'true'" variant="outline" class="rounded-sm">压缩</Badge>
        </ButtonGroup>
        <span class="text-sm">
          <b>{{ tunnel.proxy_name }}</b> <span class="text-muted-foreground">#{{ tunnel.id }} {{
            tunnel.local_ip
          }}:{{ tunnel.local_port }} - {{ tunnel.node_domain }}:{{ tunnel.remote_port }}</span>
        </span>
      </div>

      <div class="flex items-center gap-2">
        <Switch
            v-if="tunnel.status === 'true'"
            v-model:model-value="isRunning"
            @click.stop
            @update:model-value="(value) => emit('switch', { id: tunnel.id, value })"
        />

        <ButtonGroup>
          <Button @click="clearLog" variant="outline" class="size-7">
            <CircleOffIcon class="size-3"/>
          </Button>
          <Button @click="handleCopy" variant="outline" class="size-7">
            <CopyIcon class="size-3"/>
          </Button>
        </ButtonGroup>

        <Button @click="handleClose" variant="outline" class="size-7">
          <XIcon class="size-4"/>
        </Button>
      </div>
    </div>

    <div ref="logContainer" class="flex flex-col overflow-y-auto text-sm gap-1">
      <div
          v-for="(item, index) in logs"
          :key="index"
          class="font-mono leading-[1.2] whitespace-pre-wrap select-text"
      >
        {{ item }}
      </div>

      <div v-if="logs.length === 0" class="flex flex-col gap-2 items-center justify-center h-screen">
        <MoonStarIcon class="size-13"/>
        <span>这里干净的很呐</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, nextTick, watch} from "vue";
import {useFrpStore} from "@/store/frp";
import {Badge} from "@/components/ui/badge";
import {ButtonGroup} from "@/components/ui/button-group";
import {Switch} from "@/components/ui/switch";
import {Button} from "@/components/ui/button";
import {XIcon, CopyIcon, MoonStarIcon, CircleOffIcon} from "lucide-vue-next";
import {writeText} from "@tauri-apps/plugin-clipboard-manager";
import {toast} from "vue-sonner";

const props = defineProps<{ tunnel: any, initialRect: any }>();
const emit = defineEmits(["close", "switch"]);

const frpStore = useFrpStore();
const overlayRef = ref<HTMLElement | null>(null);
const logContainer = ref<HTMLElement | null>(null);

const logs = computed(() => frpStore.processes[props.tunnel.id]?.logs || []);
const isRunning = computed({
  get: () => frpStore.processes[props.tunnel.id]?.isRunning || false,
  set: () => {
  }
});

const handleClose = () => {
  if (!overlayRef.value) return emit('close');

  const el = overlayRef.value;
  const item = props.initialRect;
  const parent = el.parentElement?.getBoundingClientRect();

  if (!parent) return emit('close');

  const scaleX = item.width / parent.width;
  const scaleY = item.height / parent.height;
  const translateX = item.left - parent.left;
  const translateY = item.top - parent.top;

  const animation = el.animate([
    {
      opacity: 1,
      transform: 'translate(0, 0) scale(1, 1)',
      clipPath: 'inset(0 round 0px)'
    },
    {
      opacity: 0,
      transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`,
      clipPath: 'inset(0 round 12px)'
    }
  ], {
    duration: 450,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    fill: 'forwards'
  });

  animation.onfinish = () => emit('close');
};

const handleCopy = async () => {
  await writeText(`${props.tunnel.node_domain}:${props.tunnel.remote_port}`);
  toast.success(`复制成功 #${props.tunnel.id}`, {
    description: `${props.tunnel.node_domain}:${props.tunnel.remote_port}`
  });
};

const clearLog = async () => {
  frpStore.processes[props.tunnel.id].logs = [];
  toast.success(`清空成功 #${props.tunnel.id}`);
};

onMounted(async () => {
  if (!overlayRef.value) return;

  const el = overlayRef.value;
  const item = props.initialRect;
  const parent = el.parentElement?.getBoundingClientRect();

  if (!parent) return;

  const scaleX = item.width / parent.width;
  const scaleY = item.height / parent.height;
  const translateX = item.left - parent.left;
  const translateY = item.top - parent.top;

  el.animate([
    {
      opacity: 0,
      transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`,
      clipPath: 'inset(0 round 12px)'
    },
    {
      opacity: 1,
      transform: 'translate(0, 0) scale(1, 1)',
      clipPath: 'inset(0 round 0px)'
    }
  ], {
    duration: 500,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    fill: 'both'
  });


  if (logContainer.value) logContainer.value.scrollTo({top: logContainer.value.scrollHeight});
});

watch(() => logs.value.length, async () => {
  await nextTick();
  if (logContainer.value) logContainer.value.scrollTo({top: logContainer.value.scrollHeight, behavior: "smooth"});
});
</script>