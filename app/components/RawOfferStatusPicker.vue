<template>
  <div class="flex flex-col gap-2">
    <UFormField label="Status:" name="status">
      <div class="flex gap-2 flex-wrap">
        <UButton
            v-for="status in statusOptions"
            :key="status.value"
            :icon="status.icon"
            :variant="modelValue === status.value ? 'solid' : 'outline'"
            :color="status.color"
            type="button"
            size="md"
            :title="status.label"
            @click="$emit('update:modelValue', status.value)"
        />
      </div>
      <div class="text-sm text-gray-500 mt-1">
        Wybrany status: <span class="font-medium">{{ statusLabel }}</span>
      </div>
    </UFormField>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits(['update:modelValue'])

const statusOptions = [
  {value: 'imported', label: 'Imported', icon: 'i-lucide-download', color: 'neutral'},
  {value: 'new', label: 'New', icon: 'i-lucide-plus-circle', color: 'neutral'},
  {value: 'draft', label: 'Draft', icon: 'i-lucide-file-text', color: 'neutral'},
  {value: 'spam', label: 'Spam', icon: 'i-lucide-shield-x', color: 'warning'},
  {value: 'postponed', label: 'Postponed', icon: 'i-lucide-clock', color: 'neutral'},
  {value: 'accepted', label: 'Accepted', icon: 'i-lucide-check-circle', color: 'green'},
  {value: 'rejected', label: 'Rejected', icon: 'i-lucide-x-circle', color: 'error'},
  {value: 'active', label: 'Active', icon: 'i-lucide-play-circle', color: 'primary'}
]

const statusLabel = computed(() => {
  return statusOptions.find(status => status.value === props.modelValue)?.label || props.modelValue
})
</script>
