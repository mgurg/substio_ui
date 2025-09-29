<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items: NavigationMenuItem[] = [
  {
    label: 'Regulamin',
    to: '/subaro_rf.pdf',
    target: '_blank'
  },
  {
    label: 'Polityka prywatności',
    to: '/subaro_ppf.pdf',
    target: '_blank'
  },
  {
    label: 'Blog',
    to: '/',
  }
]
</script>

<template>
  <USeparator
      class="h-px"
  />
  <UFooter>
    <template #left>
      <p class="text-muted text-sm">Copyright © {{ new Date().getFullYear() }}</p>
    </template>

    <UNavigationMenu :items="items" variant="link" />
  </UFooter>
</template>
