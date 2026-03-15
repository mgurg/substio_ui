<template>
  <div v-if="offer?.raw_data">
    <h2 class="flex items-center text-2xl font-bold mb-4 gap-4">
      <UButton icon="i-lucide-arrow-left" to="/raw">wróć</UButton>
      <span class="flex-1">Dane oferty</span>
      <UBadge size="lg" color="neutral" variant="soft">{{ status }}</UBadge>
    </h2>

    <USkeleton v-if="isLoading" class="h-32 w-full"/>

    <div v-else>
      <div class="flex flex-wrap items-center gap-2 mb-2">
        <UButton
            v-if="offer?.email"
            :to="`https://${offer.email.split('@')[1]}`"
            target="_blank"
            size="sm"
            variant="outline"
            icon="i-lucide-globe"
        >
          {{ offer.email.split('@')[1] }}
        </UButton>
        <UButton
            v-if="offer?.offer_uid"
            :to="offer.offer_uid"
            target="_blank"
            size="sm"
            variant="outline"
            icon="i-lucide-external-link"
        >
          Zobacz ogłoszenie
        </UButton>
      </div>

      <div class="space-y-2">
        <p><strong>Author:</strong> {{ offer?.author }}</p>
        <p class="bg-gray-100 dark:bg-gray-800 p-4 rounded">{{ offer?.raw_data }}</p>
      </div>

      <slot name="after-content" />

      <UButton
          icon="i-lucide-rocket"
          class="mt-6"
          :loading="isGenerating"
          @click="$emit('generate')"
      >
        Generuj
      </UButton>
    </div>
  </div>
</template>

<script setup>
defineProps({
  offer: Object,
  status: String,
  isLoading: Boolean,
  isGenerating: Boolean
})

defineEmits(['generate'])
</script>
