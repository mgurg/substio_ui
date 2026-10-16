<script setup lang="ts">
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="w-auto h-8 shrink-0" />
      </NuxtLink>
    </template>

    <template #right>
      <UButton
          label="Blog"
          variant="ghost"
          color="neutral"
          to="/blog"
          class="hidden lg:block"
      />

      <UButton
          label="Dodaj ogłoszenie"
          variant="subtle"
          class="hidden lg:block"
          to="/substytucje-procesowe/add"
      />

      <UColorModeButton />
    </template>

    <template #body>
      <UButton
          class="mt-4"
          label="Dodaj ogłoszenie"
          variant="subtle"
          block
          to="/substytucje-procesowe/add"
          @click="umTrackEvent('create-offer')"
      />
    </template>
  </UHeader>
</template>