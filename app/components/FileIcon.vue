<script setup lang="ts">
import type { FileType } from '~/types/file'
import type { Component } from 'vue'
import IconFolder from '~/components/icons/IconFolder.vue'
import IconImage from '~/components/icons/IconImage.vue'
import IconVideo from '~/components/icons/IconVideo.vue'
import IconAudio from '~/components/icons/IconAudio.vue'
import IconPdf from '~/components/icons/IconPdf.vue'
import IconDoc from '~/components/icons/IconDoc.vue'
import IconSheet from '~/components/icons/IconSheet.vue'
import IconSlide from '~/components/icons/IconSlide.vue'
import IconArchive from '~/components/icons/IconArchive.vue'
import IconCode from '~/components/icons/IconCode.vue'
import IconFile from '~/components/icons/IconFile.vue'

const props = defineProps<{
  fileType: FileType
  selected?: boolean
}>()

const iconMap: Record<FileType, Component> = {
  folder: IconFolder,
  image: IconImage,
  video: IconVideo,
  audio: IconAudio,
  pdf: IconPdf,
  doc: IconDoc,
  sheet: IconSheet,
  slide: IconSlide,
  archive: IconArchive,
  code: IconCode,
  file: IconFile
}

const colorMap: Record<FileType, string> = {
  folder: 'text-yellow-500 ',
  image: 'text-purple-500',
  video: 'text-pink-500',
  audio: 'text-yellow-600',
  pdf: 'text-red-500',
  doc: 'text-primary-600',
  sheet: 'text-green-600',
  slide: 'text-orange-500',
  archive: 'text-gray-600',
  code: 'text-indigo-500',
  file: 'text-gray-400'
}

const currentComponent = computed(() => iconMap[props.fileType] || IconFile)
const currentColorClass = computed(() => props.selected ? 'text-white' : (colorMap[props.fileType] || 'text-gray-400'))
</script>

<template>
  <component :is="currentComponent" class="w-6 h-6" :class="currentColorClass" />
</template>