<template>
  <header class="flex items-center justify-between px-6 py-3 shadow-md">
    <!-- Navigation Links -->
    <nav>
      <ul class="flex gap-3">
        <li>
          <NuxtLink
              to="/"
              class="icon-link p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              active-class="text-primary"
          >
            <Icon name="i-lucide-home" class="w-6 h-6" />
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
              to="/substytucje-procesowe/add"
              class="px-4 py-2 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              active-class="bg-primary text-white hover:bg-primary/90"
          >
            Dodaj ogłoszenie
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Dark Mode Toggle -->
    <div class="flex items-center gap-2">
      <UButton
          :icon="colorMode.preference === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
          :aria-label="`Switch to ${colorMode.preference === 'dark' ? 'light' : 'dark'} mode`"
          class="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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

/* only text links get underline */
nav a:hover {
  text-decoration: underline;
}

/* disable underline for icon-only link */
.icon-link:hover {
  text-decoration: none;
}
</style>
