<template>
  <div class="flex min-h-screen flex-col items-stretch">
    <HeaderComponent />
    <div class="grow px-3 sm:px-6"> <!-- Adjusted padding -->
      <slot />
    </div>
  </div>
</template>

<script setup>
</script>

<style>
main {
  min-height: calc(100vh - 100px); /* Adjust as needed */
}
</style>
