<template>
  <div v-if="offers?.length" class="mt-4 space-y-1">
    <h3 class="text-base font-semibold mb-2">Podobne oferty</h3>
    <div
        v-for="offer in offers"
        :key="offer.uuid"
        class="text-sm text-gray-800 dark:text-gray-200 flex items-center justify-between"
    >
      <div class="truncate w-full">
        <span class="font-medium mr-2">{{ offer.place_name || 'Brak miejsca' }}:</span>
        <span>
          {{ (offer.description ?? '...').slice(0, 60) }}
          <span v-if="(offer.description ?? '').length > 60">…</span>
        </span>
      </div>
      <ULink
          :to="`/raw/${offer.uuid}`"
          target="_blank"
          class="ml-2 text-primary-600 hover:text-primary-700"
      >
        <UIcon name="i-lucide-external-link" class="w-4 h-4"/>
      </ULink>
    </div>
  </div>
</template>

<script setup>
defineProps({
  offers: {
    type: Array,
    required: true,
    default: () => []
  }
})
</script>
