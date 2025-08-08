<template>
  <header class="flex items-center justify-between px-4 py-2 shadow-md">
    <!-- Navigation Links -->
    <nav>
      <ul class="flex gap-4">
        <li>
          <NuxtLink to="/" active-class="text-primary" class="hover:text-primary">START</NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Dark Mode Toggle -->
    <div class="flex items-center gap-2">
      <UButton
          :icon="colorMode.preference === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
          :aria-label="`Switch to ${colorMode.preference === 'dark' ? 'light' : 'dark'} mode`"
          class="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-700 dark:hover:bg-gray-100"
          @click="toggleDarkMode"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

const toggleDarkMode = () => {
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
}

</script>

<style scoped>
header {
  background-color: var(--ui-background);
  color: var(--ui-text);
  padding: 1rem;
  margin-bottom: 3rem;
}

nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

nav li {
  display: inline-block;
}

a {
  text-decoration: none;
  color: inherit;
}

a:hover {
  text-decoration: underline;
}

.text-primary {
  color: var(--ui-primary);
}
</style>
