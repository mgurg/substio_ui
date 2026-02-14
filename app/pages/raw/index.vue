<template>
  <UContainer>
    <UCard>
      <template #header>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 class="text-3xl font-extrabold">Nowe oferty</h1>
          <UButton
              to="/raw/add"
              icon="i-lucide-plus"
              color="primary"
          >
            Dodaj ofertę
          </UButton>
        </div>
      </template>
      <!-- Filter -->
      <div class="flex items-center gap-4 mb-5">
        <USelect
            v-model="selectedStatus"
            :items="statusOptions"
            placeholder="Filtruj status"
            class="w-48"
            @change="handleFilterChange"
        />
      </div>
    </UCard>

    <div ref="scrollArea" class="mt-4 max-h-[70vh] overflow-y-auto p-2">
      <div v-if="isLoading && offers.length === 0">
        <USkeleton v-for="i in limit" :key="i" class="h-24 mt-5 rounded-md"/>
      </div>
      <div v-else>
        <OfferRawCard
            v-for="offer in offers"
            :key="offer.uuid"
            :offer="offer"
            @offer-updated="() => fetchOffers({ reset: true })"
        />
      </div>

      <UProgress
          v-if="isLoading && offers.length > 0"
          indeterminate
          size="xs"
          class="sticky bottom-0 inset-x-0 z-1 mt-4"
          :ui="{ base: 'bg-default' }"
      />

      <div
          v-if="!isLoading && hasLoaded && count === 0"
          class="text-center text-sm text-muted mt-6 mb-4"
      >
        Brak ofert do wyświetlenia.
      </div>

      <div
          v-else-if="!isLoading && hasLoaded && offers.length >= count && count > 0"
          class="text-center text-sm text-muted mt-6 mb-4"
      >
        To wszystko — więcej ofert nie ma.
      </div>

      <div ref="sentinel" class="h-px w-full"/>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import {computed, ref, watch, onActivated, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {offerListRawOffers} from "@/client"
import type {OfferStatus, RawOfferIndexResponse} from '@/client/types.gen.ts'
import {useIntersectionObserver} from '@vueuse/core'

const route = useRoute()
const router = useRouter()

const offers = ref<RawOfferIndexResponse[]>([])
const count = ref<number>(0)
const limit = ref<number>(10)
const isLoading = ref<boolean>(false)
const hasLoaded = ref<boolean>(false)
const scrollArea = ref<HTMLElement | null>(null)
const sentinel = ref<HTMLElement | null>(null)

const selectedStatus = ref<OfferStatus | null>((route.query.status as OfferStatus) ?? 'new')

const statusOptions = [
  {label: 'Wszystkie', value: null},
  {label: 'Nowe', value: 'new'},
  {label: 'Szkic', value: 'draft'},
  {label: 'Przełożone', value: 'postponed'},
  {label: 'Zaakceptowane', value: 'accepted'},
  {label: 'Odrzucone', value: 'rejected'},
  {label: 'Aktywne', value: 'active'}
]

const canLoadMore = computed(() => {
  if (!hasLoaded.value) {
    return true
  }
  return offers.value.length < count.value
})

let stopObserver: (() => void) | null = null
const startObserver = () => {
  if (stopObserver) {
    return
  }
  stopObserver = useIntersectionObserver(
    sentinel,
    ([entry]) => {
      if (entry?.isIntersecting && canLoadMore.value && !isLoading.value) {
        fetchOffers()
      }
    },
    {
      root: scrollArea,
      rootMargin: '200px'
    }
  )
}

const stopObserverIfDone = () => {
  if (canLoadMore.value) {
    return
  }
  if (stopObserver) {
    stopObserver()
    stopObserver = null
  }
}

const fetchOffers = async (options: { reset?: boolean } = {}): Promise<void> => {
  if (isLoading.value) {
    return
  }
  if (options.reset) {
    offers.value = []
    count.value = 0
    hasLoaded.value = false
  }
  if (hasLoaded.value && offers.value.length >= count.value) {
    return
  }
  isLoading.value = true
  const offset = offers.value.length

  const response = await offerListRawOffers({
    query: {
      offset,
      limit: limit.value,
      status: selectedStatus.value || undefined
    },
  })

  if (response.data) {
    offers.value = [...offers.value, ...response.data.data]
    count.value = response.data.count
    hasLoaded.value = true
  }

  isLoading.value = false
  stopObserverIfDone()
}

const handleFilterChange = () => {
  router.replace({query: {...route.query, status: selectedStatus.value ?? undefined}})
  fetchOffers({reset: true})
}

watch(() => route.query.status, (newStatus) => {
  if (newStatus !== selectedStatus.value) {
    selectedStatus.value = (newStatus as OfferStatus) ?? 'new'
    fetchOffers({reset: true})
  }
})

watch(canLoadMore, () => {
  if (canLoadMore.value) {
    startObserver()
  } else {
    stopObserverIfDone()
  }
})

onActivated(() => {
  fetchOffers({reset: true})
})

onMounted(() => {
  startObserver()
})
</script>
