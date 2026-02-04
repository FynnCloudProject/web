<script setup lang="ts">
interface Props {
  modelValue?: string | number
  type?: string
  placeholder?: string
  label?: string
  id?: string
  autofocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  modelValue: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substring(7)}`)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
const inputRef = ref<HTMLInputElement | null>(null)

defineExpose({
  input: inputRef,
  focus: () => inputRef.value?.focus()
})
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {{ label }}
    </label>
    <div class="relative">
      <input ref="inputRef" :id="inputId" :type="type" :value="modelValue" :placeholder="placeholder"
        :autofocus="autofocus"
        class="block w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600 sm:text-sm transition-colors duration-200"
        @input="handleInput" />
    </div>
  </div>
</template>
