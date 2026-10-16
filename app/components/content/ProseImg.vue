<script setup lang="ts">
defineProps<{
  src: string
  alt?: string
  width?: string | number
  height?: string | number
}>()
</script>

<template>
  <img
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    class="rounded-xl border border-gray-200 dark:border-gray-800 my-8 w-full h-auto block"
  >
</template>
