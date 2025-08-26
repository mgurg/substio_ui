<template>
  <UCard class="p-1 my-3 space-y-3">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <!-- left section -->
      <div class="flex items-center gap-2">
        <span class="font-medium text-lg">{{ offer.author }}</span>
        <UButton
            v-if="offer.author_uid"
            :href="offer.author_uid"
            target="_blank"
            size="md"
            variant="ghost"
        >
          <Icon name="lucide:external-link" class="w-4 h-4" />
        </UButton>
      </div>

      <!-- right section: badges -->
      <div class="flex items-center gap-2">
        <UBadge :color="statusColor" size="md">{{ offer.status }}</UBadge>
        <UBadge
            v-if="hasEmailInRaw"
            color="neutral"
            size="md"
            icon="i-lucide-mail-check"
        />
      </div>
    </div>

    <!-- Description / Raw text -->
    <p class="text-md text-gray-800 py-3">
      {{ offer.description || truncate(offer.raw_data, 220) }}
    </p>

    <!-- Place, date, roles -->
    <div class="flex flex-wrap gap-3 text-md">
      <div v-if="offer.place" class="flex items-center gap-1">
        <Icon name="lucide:map-pin" class="w-4 h-4" />
        <span>{{ offer.place.name }}</span>
      </div>

      <div v-if="offer.date || offer.hour" class="flex items-center gap-1">
        <Icon name="lucide:calendar" class="w-4 h-4" />
        <span>
          {{ offer.date || 'Brak daty' }}
          <span v-if="offer.hour">, {{ offer.hour }}</span>
        </span>
      </div>

      <div v-if="offer.legal_roles.length" class="flex flex-wrap gap-1">
        <UBadge
            v-for="role in offer.legal_roles"
            :key="role.uuid"
            color="primary"
            variant="soft"
        >
          {{ role.name }}
        </UBadge>
      </div>
    </div>

    <!-- Links -->
    <div class="flex gap-2 mt-2">
      <UButton
          v-if="offer.offer_uid"
          :href="offer.offer_uid"
          target="_blank"
          size="md"
          variant="outline"
      >
        Zobacz ofertę
      </UButton>
      <UButton
          v-if="offer.email"
          :href="`mailto:${offer.email}`"
          size="md"
          variant="outline"
      >
        Kontakt
      </UButton>
      <UButton :to="`/raw/${offer.uuid}`">Edytuj</UButton>
    </div>

    <!-- Metadata -->
    <div class="text-md text-gray-500 mt-3">
      Dodano: {{ new Date(offer.added_at).toLocaleString() }} · Źródło: {{ offer.source }}
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  offer: any
}>()

const hasEmailInRaw = computed(() =>
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(props.offer.raw_data ?? "")
)


const statusColor = computed(() => {
  switch (props.offer.status) {
    case 'new': return 'info'
    case 'accepted': return 'success'
    default: return 'neutral'
  }
})

function truncate(text: string, length: number) {
  return text && text.length > length ? text.substring(0, length) + '…' : text
}
</script>
