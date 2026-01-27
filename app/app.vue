<template>
  <UApp :locale="pl">
    <NuxtLoadingIndicator/>

    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import {pl} from '@nuxt/ui/locale'
</script>