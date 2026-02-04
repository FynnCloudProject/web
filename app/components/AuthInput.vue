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
</script>

<template>
  <div class="w-full">
    <div class="relative">
      <input :id="inputId" :type="type" :value="modelValue" :placeholder="placeholder" :autofocus="autofocus"
        class="block w-full rounded-lg bg-white/15 shadow-xl px-5 py-3.5 text-white placeholder-white/90 focus:outline-none sm:text-lg transition-colors duration-300 border-1 border-white/15"
        @input="handleInput" />
    </div>
  </div>
</template>
