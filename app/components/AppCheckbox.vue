<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    modelValue?: boolean
    indeterminate?: boolean
    label?: string
    disabled?: boolean
    color?: string
    size?: 'sm' | 'md' | 'lg'
    boxClass?: string
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    indeterminate: false,
    disabled: false,
    color: 'primary',
    size: 'md',
    boxClass: ''
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'change', value: boolean): void
}>()

const toggle = () => {
    if (props.disabled) return
    const newValue = !props.modelValue
    emit('update:modelValue', newValue)
    emit('change', newValue)
}

const sizeClasses = computed(() => {
    const map = {
        sm: 'h-3 w-3 rounded-xs',
        md: 'h-4 w-4 rounded',
        lg: 'h-5 w-5 rounded-md'
    }
    return map[props.size]
})

const colorClasses = computed(() => {
    if (props.disabled) {
        return 'bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-400 cursor-not-allowed'
    }

    if (props.modelValue || props.indeterminate) {
        return [
            `bg-${props.color}-500 border-${props.color}-500`,
            'text-white',
            `hover:bg-${props.color}-600 hover:border-${props.color}-600`,
            `dark:bg-${props.color}-500 dark:border-${props.color}-500`,
            `focus:ring-2 focus:ring-${props.color}-500/20 focus:ring-offset-0`
        ].join(' ')
    }

    return [
        'bg-white dark:bg-zinc-900',
        'border-gray-300 dark:border-zinc-600',
        `text-${props.color}-600`,
        `hover:border-${props.color}-500 dark:hover:border-${props.color}-400`,
        `focus:ring-2 focus:ring-${props.color}-500/20 focus:ring-offset-0`
    ].join(' ')
})
</script>

<template>
    <div class="inline-flex items-center gap-2 align-middle" :class="{ 'opacity-50 pointer-events-none': disabled }">
        <div class="relative flex items-center justify-center cursor-pointer group" @click.stop="toggle">
            <!-- Background/Border Box -->
            <div class="border transition-all duration-200 ease-out flex items-center justify-center shadow-sm"
                :class="[sizeClasses, colorClasses, boxClass]">
                <!-- Checkmark Icon -->
                <svg v-if="modelValue && !indeterminate" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"
                    class="w-[70%] h-[70%] transition-transform duration-200 transform scale-100">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>

                <!-- Indeterminate Icon (Dash) -->
                <svg v-if="indeterminate" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"
                    class="w-[70%] h-[70%] transition-transform duration-200 transform scale-100">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </div>

            <!-- Hidden Input for accessibility/form submission if needed -->
            <input type="checkbox" class="sr-only" :checked="modelValue" :disabled="disabled" @change="toggle">
        </div>

        <label v-if="label" class="text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer select-none"
            @click.stop="toggle">
            {{ label }}
        </label>
    </div>
</template>
