<template>
  <div class="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
    <h3 class="font-semibold mb-2">Debug Info:</h3>
    <pre class="text-xs">{{ JSON.stringify({ formData }, null, 2) }}</pre>
  </div>
</template>

<script setup>
defineProps({
  formData: Object
})
</script>