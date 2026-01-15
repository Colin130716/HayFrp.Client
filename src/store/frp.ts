import {defineStore} from "pinia";
import {invoke} from "@tauri-apps/api/core";
import {listen, type UnlistenFn} from "@tauri-apps/api/event";
import {load} from "@tauri-apps/plugin-store";
import {FRPC_PATH} from "@/lib/env.ts";

interface ProcessState {
    id: string;
    isRunning: boolean;
    logs: string[];
    unlistenFns: UnlistenFn[];
}

export const useFrpStore = defineStore("frp", {
    state: () => ({
        processes: {} as Record<string, ProcessState>,
    }),

    actions: {
        async run(id: string, args: string[]) {
            if (this.processes[id]?.isRunning) {
                await this.kill(id);
            }

            this.processes[id] = {
                id,
                isRunning: true,
                logs: [],
                unlistenFns: [],
            };

            const filter = (str: string) => {
                return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
                    .replace(/(HayFrpToken[：:])([^,\]\s]+)/g, '$1****************')
                    .replace(/(ConnectToken[：:])([^,\]\s]+)/g, '$1****************');
            }

            try {
                const store = await load("settings.json", {
                    defaults: {
                        auto_tunnel: false,
                        tunnels: [],
                    },
                    autoSave: true,
                });

                if (await store.get("auto_tunnel")) {
                    const tunnels: any[] = await store.get("tunnels") || [];

                    if (!tunnels.find((tunnel) => tunnel.id === id)) {
                        tunnels.push({id, args});
                        await store.set("tunnels", tunnels);
                    }
                }

                const unlistenStdout = await listen<string>(`log-stdout-${id}`, (event) => {
                    this.addLog(id, filter(event.payload.toString()));
                });

                const unlistenStderr = await listen<string>(`log-stderr-${id}`, (event) => {
                    this.addLog(id, filter(event.payload.toString()));
                });

                const unlistenExit = await listen<string>(`process-exit-${id}`, () => {
                    this.cleanup(id);
                });

                this.processes[id].unlistenFns.push(unlistenStdout, unlistenStderr, unlistenExit);

                await invoke("run_program", {id, path: FRPC_PATH.value, args});
            } catch (error) {
                this.addLog(id, `启动失败: ${error}`);
                await this.cleanup(id);
                throw error;
            }
        },

        async kill(id: string) {
            try {
                await invoke("kill_program", {id});
                await this.cleanup(id);
            } catch (error) {
                console.error(`Kill process ${id} failed:`, error);
            }
        },

        async killAll() {
            const ids = Object.keys(this.processes);
            await Promise.all(ids.map((id) => this.kill(id)));
        },

        addLog(id: string, message: string) {
            if (this.processes[id]) {
                this.processes[id].logs.push(message);

                // 防止日志太多炸了
                if (this.processes[id].logs.length > 300) {
                    this.processes[id].logs.shift();
                }
            }
        },

        async cleanup(id: string) {
            if (this.processes[id]) {
                this.processes[id].isRunning = false;
                this.processes[id].unlistenFns.forEach((unlisten) => unlisten());
                this.processes[id].unlistenFns = [];
            }

            const store = await load("settings.json", {
                defaults: {
                    auto_tunnel: false,
                    tunnels: [],
                },
                autoSave: true,
            });

            if (await store.get("auto_tunnel")) {
                const tunnels: any[] = await store.get("tunnels") || [];
                tunnels.find((tunnel) => tunnel.id === id) && tunnels.splice(tunnels.indexOf(id), 1);
                await store.set("tunnels", tunnels);
            }
        },

        async remove(id: string) {
            await this.cleanup(id);
            delete this.processes[id];
        }
    },
});