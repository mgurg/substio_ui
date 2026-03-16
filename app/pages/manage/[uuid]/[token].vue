<template>
  <UContainer>
    <div v-if="isLoading" class="space-y-4">
      <USkeleton class="h-12 w-3/4" />
      <USkeleton class="h-64 w-full" />
    </div>

    <div v-else-if="offer">
      <div class="mb-6 flex justify-between items-center">
        <h1 class="text-2xl font-bold">Zarządzaj swoją ofertą</h1>
        <UBadge :color="statusColor" variant="solid">
          {{ statusLabel }}
        </UBadge>
      </div>

      <UCard>
        <template #header>
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-xl font-semibold">{{ offer.place_name || 'Oferta' }}</h2>
              <div class="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <UIcon name="i-lucide-calendar" />
                <span>{{ offer.date || 'Brak daty' }}</span>
                <span v-if="offer.hour">•</span>
                <UIcon v-if="offer.hour" name="i-lucide-clock" />
                <span v-if="offer.hour">{{ offer.hour }}</span>
              </div>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ offer.description }}</p>

          <div v-if="offer.legal_roles && offer.legal_roles.length" class="flex flex-wrap gap-2">
            <UBadge v-for="role in offer.legal_roles" :key="role.uuid" variant="soft" color="neutral">
              {{ role.name }}
            </UBadge>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              v-if="canCancel"
              color="error"
              variant="outline"
              icon="i-lucide-trash-2"
              :loading="isCancelling"
              @click="handleCancel"
            >
              Anuluj ofertę
            </UButton>
            <UButton
              to="/substytucje-procesowe"
              color="neutral"
              variant="ghost"
            >
              Wróć do listy
            </UButton>
          </div>
        </template>
      </UCard>

      <div class="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div class="flex gap-3">
          <UIcon name="i-lucide-info" class="text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 class="font-semibold text-blue-900 dark:text-blue-100">Informacja o statusie</h3>
            <p class="text-sm text-blue-800 dark:text-blue-200 mt-1">
              {{ statusDescription }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <UIcon name="i-lucide-alert-circle" class="text-gray-400 text-5xl mb-4" />
      <h2 class="text-xl font-semibold">Nie znaleziono oferty</h2>
      <p class="text-gray-500 mt-2">Link może być nieprawidłowy lub oferta została już usunięta.</p>
      <UButton to="/substytucje-procesowe" class="mt-6">Wróć do strony głównej</UButton>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref, computed } from "vue"
import { offerGetOfferById } from "~/client"

const route = useRoute()
const toast = useToast()
const { uuid, token } = route.params

const offer = ref<any>(null)
const isLoading = ref(true)
const isCancelling = ref(false)

// Placeholder for extended API
// Assuming we will have:
// offerGetManagedOffer({ path: { offer_uuid: uuid }, query: { token } })
// offerCancelManagedOffer({ path: { offer_uuid: uuid }, query: { token } })

const fetchOffer = async () => {
  isLoading.value = true
  try {
    // For now, using standard get to show details, 
    // but in reality we need the one with token validation
    // @ts-ignore
    const { data } = await offerGetOfferById({
      path: { offer_uuid: uuid as string }
    })
    offer.value = data
  } catch (error) {
    console.error('Error fetching offer:', error)
  } finally {
    isLoading.value = false
  }
}

const handleCancel = async () => {
  if (!confirm('Czy na pewno chcesz anulować tę ofertę?')) return

  isCancelling.value = true
  try {
    // Proposing: await offerCancelManagedOffer({ path: { offer_uuid: uuid }, query: { token } })
    toast.add({
      title: 'Sukces',
      description: 'Oferta została anulowana',
      color: 'success'
    })
    // In a real scenario, after cancellation we might want to redirect or re-fetch
    await fetchOffer()
  } catch (error) {
    toast.add({
      title: 'Błąd',
      description: 'Nie udało się anulować oferty',
      color: 'error'
    })
  } finally {
    isCancelling.value = false
  }
}

const statusLabel = computed(() => {
  if (!offer.value) return ''
  const status = offer.value.status
  switch (status) {
    case 'new': return 'Oczekuje na zatwierdzenie'
    case 'accepted': return 'Zaakceptowana'
    case 'active': return 'Aktywna'
    case 'rejected': return 'Odrzucona'
    case 'spam': return 'Spam'
    default: return status
  }
})

const statusColor = computed(() => {
  if (!offer.value) return 'neutral'
  const status = offer.value.status
  switch (status) {
    case 'new': return 'warning'
    case 'accepted':
    case 'active': return 'success'
    case 'rejected':
    case 'spam': return 'error'
    default: return 'neutral'
  }
})

const statusDescription = computed(() => {
  if (!offer.value) return ''
  const status = offer.value.status
  switch (status) {
    case 'new': return 'Twoja oferta została zapisana i oczekuje na weryfikację przez administratora. Zostanie opublikowana niezwłocznie po zatwierdzeniu.'
    case 'accepted':
    case 'active': return 'Twoja oferta jest obecnie widoczna dla innych użytkowników.'
    case 'rejected': return 'Twoja oferta została odrzucona przez administratora.'
    case 'spam': return 'Twoja oferta została oznaczona jako spam.'
    default: return 'Status Twojej oferty.'
  }
})

const canCancel = computed(() => {
  return offer.value && !['rejected', 'spam'].includes(offer.value.status)
})

onMounted(() => {
  fetchOffer()
})

definePageMeta({
  title: 'Zarządzanie ofertą'
})
</script>
