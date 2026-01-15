import { defineStore } from "pinia";
import { ref } from "vue";

export const useNavStore = defineStore("nav", () => {
    const refreshAction = ref<(() => void) | null>(null);

    const setRefreshAction = (fn: (() => void) | null) => {
        refreshAction.value = fn;
    };

    return { refreshAction, setRefreshAction };
});