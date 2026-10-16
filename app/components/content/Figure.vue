<script setup lang="ts">
defineProps<{
  src?: string
  alt?: string
  caption?: string
}>()
</script>

<template>
  <figure class="my-8">
    <div class="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <img
        v-if="src"
        :src="src"
        :alt="alt"
        class="w-full h-auto block"
      >
    </div>
    <figcaption v-if="caption" class="mt-3 text-center text-sm text-gray-500 dark:text-gray-400 italic">
      <slot name="caption">
        {{ caption }}
      </slot>
    </figcaption>
  </figure>
</template>
