<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FileItem } from '~/types/file'
import { shareApi, type ShareLinkDTO } from '~/services/shareApi'

const props = defineProps<{
  modelValue: boolean
  file?: FileItem
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { t } = useI18n()
const { toast } = useToast()

const links = ref<ShareLinkDTO[]>([])
const isLoading = ref(false)
const isCopied = ref(false)

const shareUrl = (token: string) => {
  const origin = window.location.origin
  return `${origin}/s/${token}`
}

const fetchLinks = async () => {
  if (!props.file) return
  isLoading.value = true
  try {
    links.value = await shareApi.listShareLinks(props.file.id)
  } catch {
    links.value = []
  } finally {
    isLoading.value = false
  }
}

const createLink = async () => {
  if (!props.file) return
  try {
    const link = await shareApi.createShareLink(props.file.id)
    links.value.unshift(link)
  } catch {
    toast.error(t('files.share.createFailed'))
  }
}

const revokeLink = async (link: ShareLinkDTO) => {
  if (!props.file) return
  try {
    await shareApi.revokeShareLink(props.file.id, link.id)
    links.value = links.value.filter(l => l.id !== link.id)
  } catch {
    toast.error(t('files.share.revokeFailed'))
  }
}

const copyToClipboard = async (url: string) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url)
    } else {
      const textArea = document.createElement('textarea')
      textArea.value = url
      textArea.style.top = '0'
      textArea.style.left = '0'
      textArea.style.position = 'fixed'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      if (!successful) {
        throw new Error('execCommand copy returned false')
      }
    }
    isCopied.value = true
    toast.success(t('files.share.copied'))
    setTimeout(() => { isCopied.value = false }, 2000)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    toast.warning(t('files.share.copyFailed'))
  }
}

watch(() => props.modelValue, (open) => {
  if (open) fetchLinks()
})
</script>

<template>
  <AppDialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)"
    :title="t('files.share.title')">
    <div class="space-y-4 p-1">
      <!-- File info -->
      <div v-if="file" class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-neutral-800">
        <FileIcon :file-type="file.type" class="w-8 h-8 shrink-0" />
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ file.name }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ file.type === 'folder' ? t('files.share.folder') : file.size }}
          </p>
        </div>
      </div>

      <!-- Create link button -->
      <AppButton :label="t('files.share.createLink')" variant="primary" block @click="createLink" />

      <!-- Existing links -->
      <div v-if="links.length > 0" class="space-y-2">
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {{ t('files.share.activeLinks') }}
        </p>
        <div v-for="link in links" :key="link.id"
          class="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700">
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-700 dark:text-gray-300 truncate font-mono">
              {{ shareUrl(link.token) }}
            </p>
            <p v-if="link.expiresAt" class="text-xs text-gray-400 mt-0.5">
              {{ t('files.share.expires') }}: {{ new Date(link.expiresAt).toLocaleDateString() }}
            </p>
          </div>
          <button
            class="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-500 transition-colors"
            @click="copyToClipboard(shareUrl(link.token))" :title="t('files.share.copy')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          </button>
          <button
            class="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 transition-colors"
            @click="revokeLink(link)" :title="t('files.share.revoke')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <p v-else-if="!isLoading" class="text-sm text-gray-400 dark:text-gray-500 text-center py-2">
        {{ t('files.share.noLinks') }}
      </p>
    </div>
  </AppDialog>
</template>
