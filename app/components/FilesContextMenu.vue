<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, computed } from 'vue'

const emit = defineEmits<{
    (e: 'action', action: string, payload?: any): void
}>()

const visible = ref(false)
const x = ref(0)
const y = ref(0)
const payload = ref<any>(null)
const menuRef = ref<HTMLElement | null>(null)

const open = async (event: MouseEvent, data?: any) => {
    event.preventDefault()
    event.stopPropagation()
    x.value = event.clientX
    y.value = event.clientY
    payload.value = data
    visible.value = true

    // Wait for render to ensure menu stays within viewport
    await nextTick()
    adjustPosition()
}

const close = () => {
    visible.value = false
    payload.value = null
}

const adjustPosition = () => {
    if (!menuRef.value) return
}

const handleClickOutside = (event: MouseEvent) => {
    if (visible.value && menuRef.value && !menuRef.value.contains(event.target as Node)) {
        close()
    }
}

const handleAction = (actionId: string) => {
    emit('action', actionId, payload.value)
    close()
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('contextmenu', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('contextmenu', handleClickOutside)
})

const { t } = useI18n()

const actions = computed(() => {
    const item = payload.value;
    if (!item) return [];

    const isDeleted = item.deletedAt != null;
    const isFolder = item.type === 'folder';


    const isOpenable = item.type === 'audio' || item.type === 'video' || item.type === 'image' || item.type === 'pdf';


    const isPlayable = item.type === 'audio' || item.type === 'video';

    if (isDeleted) {
        return [
            { label: t('files.actions.restore'), id: 'restore', icon: 'restore' },
            { label: t('files.actions.deletePermanent.button'), id: 'delete-permanently', icon: 'trash', danger: true }
        ];
    }

    const activeActions = [];


    if (isFolder || isOpenable) {
        activeActions.push({
            label: isPlayable ? t('files.actions.play') : t('files.actions.open'),
            id: 'open',
            icon: isPlayable ? 'play' : 'folder-open'
        });
    }


    if (!isFolder) {
        activeActions.push({ label: t('files.actions.download'), id: 'download', icon: 'download' });
    }


    activeActions.push(
        { label: t('files.actions.move.button'), id: 'move', icon: 'move' },
        { label: t('files.actions.rename.button'), id: 'rename', icon: 'edit' },
        { label: t('files.actions.delete.title'), id: 'move-to-recycle-bin', icon: 'trash', danger: true }
    );

    return activeActions;
});

defineExpose({ open, close })
</script>

<template>
    <Teleport to="body">
        <div v-if="visible" ref="menuRef"
            class="fixed z-9999 min-w-44 overflow-hidden rounded-xl border border-gray-100 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg animate-in fade-in zoom-in-95 duration-100 transition-none p-1.5 space-y-0.5"
            :style="{ top: `${y}px`, left: `${x}px` }" @contextmenu.prevent>
            <button v-for="action in actions" :key="action.id"
                class="group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-left transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer"
                @click="handleAction(action.id)">


                <div class="absolute inset-0 bg-linear-to-b shadow-[inset_0_2px_2px_rgba(255,255,255,0.3),0_4px_6px_rgba(0,0,0,0.1)] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-150 ease-out group-active:shadow-[inset_0_8px_16px_-2px_rgba(0,0,0,0.4)]"
                    :class="action.danger
                        ? 'from-red-500 to-red-700 group-active:from-red-600 group-active:to-red-800'
                        : 'from-primary-500 to-primary-700 group-active:from-primary-600 group-active:to-primary-800'">
                </div>


                <div class="relative z-10 flex items-center gap-2.5" :class="[
                    'group-hover:text-white',
                    action.danger ? 'text-red-600 dark:text-red-500' : 'text-gray-700 dark:text-gray-300'
                ]">

                    <svg v-if="action.icon === 'folder-open'" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path
                            d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
                    </svg>
                    <svg v-if="action.icon === 'play'" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <svg v-if="action.icon === 'download'" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                    </svg>
                    <svg v-if="action.icon === 'edit'" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                    </svg>
                    <svg v-if="action.icon === 'trash'" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                    </svg>
                    <svg v-if="action.icon === 'move'" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                        viewBox="0 0 24 24" fill="none" class="stroke-current stroke-2" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 14 20 9 15 4" />
                        <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
                    </svg>
                    <svg v-if="action.icon === 'restore'" class="w-4 h-4 stroke-2" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                    </svg>
                    <span class="text-sm font-medium">{{ action.label }}</span>
                </div>
            </button>
        </div>
    </Teleport>
</template>
