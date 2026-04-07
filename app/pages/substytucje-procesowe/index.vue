<template>
  <UContainer>
    <!-- Filters Section -->
    <OffersFilters
        v-model="formData"
        v-model:saved-city-data="savedCityData"
        @clear="clearAllFilters"
    />


    <!-- Loading State -->
    <div v-if="isLoadingOffers && offers.length === 0">
      <USkeleton v-for="i in limit" :key="i" class="h-24 mt-5 rounded-md"/>
    </div>

    <!-- Offers List -->
    <div v-else>
      <OfferCard
          v-for="offer in offers"
          :key="offer.uuid"
          :offer="offer"
          :detailed="true"
      />
    </div>

    <UProgress
        v-if="isLoadingOffers && offers.length > 0"
        indeterminate
        size="xs"
        class="sticky bottom-0 inset-x-0 z-1 mt-4"
        :ui="{ base: 'bg-default' }"
    />

    <StructuredDataList :offers="offers"/>

    <!-- No Results -->
    <div v-if="!isLoadingOffers && hasLoaded && offers.length === 0" class="text-center py-8">
      <UIcon name="i-lucide-search-x" class="h-12 w-12 mx-auto mb-4 text-gray-400"/>
      <p class="text-gray-600">Nie znaleziono ofert spełniających kryteria wyszukiwania.</p>
    </div>

    <div
        v-else-if="!isLoadingOffers && hasLoaded && offers.length >= count && count > 0"
        class="text-center text-sm text-gray-500 mt-6 mb-10 pb-10"
    >
      To wszystko — więcej ofert nie ma.
    </div>

    <div ref="sentinel" class="h-px w-full"/>
  </UContainer>
</template>

<script setup lang="ts">
import {useI18n} from '#imports'
import {offerListOffers} from "@/client"
import {computed, onMounted, ref, watch} from "vue"
import StructuredDataList from "~/components/StructuredDataList.vue";
import OffersFilters from "~/components/OffersFilters.vue";
import type {OfferIndexResponse} from "@/client/types.gen.ts"
import {useIntersectionObserver} from '@vueuse/core'

const {t} = useI18n()

const debounce = (func: Function, delay: number) => {
  let timeoutId: any
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    // @ts-ignore
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

// Reactive data
const offers = ref<OfferIndexResponse[]>([])
const count = ref(0)
const limit = ref(10)
const isLoadingOffers = ref(false)
const hasLoaded = ref(false)
const sentinel = ref<HTMLElement | null>(null)

const formData = ref({
  city: null as any | null,
  distance: 30,
  selectedLegalRoles: [] as string[],
  invoiceRequired: false,
  search: ''
})

const savedCityData = ref<any | null>(null)

// Computed
const canLoadMore = computed(() => {
  if (!hasLoaded.value) {
    return true
  }
  return offers.value.length < count.value
})

// Methods
let stopObserver: (() => void) | null = null
const startObserver = () => {
  if (stopObserver) {
    return
  }
  const { stop } = useIntersectionObserver(
      sentinel,
      ([entry]) => {
        if (entry?.isIntersecting && canLoadMore.value && !isLoadingOffers.value) {
          fetchOffers()
        }
      },
      {
        rootMargin: '200px'
      }
  )
  stopObserver = stop
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

const buildQueryParams = () => {
  const params = {
    offset: offers.value.length,
    limit: limit.value
  }

  // Add search term
  if (formData.value.search && formData.value.search.trim()) {
    params.search = formData.value.search.trim()
  }

  // Add location-based filters
  if ((formData.value.city || savedCityData.value) && savedCityData.value) {
    params.lat = savedCityData.value.lat
    params.lon = savedCityData.value.lon

    // Add distance if specified
    if (formData.value.distance && formData.value.distance > 0) {
      params.distance_km = parseFloat(formData.value.distance)
    }
  }

  // Add legal roles filter
  if (formData.value.selectedLegalRoles.length > 0) {
    params.legal_role_uuids = formData.value.selectedLegalRoles
  }

  // Add invoice filter
  if (formData.value.invoiceRequired) {
    params.invoice = true
  }

  return params
}

const fetchOffers = async (options: { reset?: boolean } = {}) => {
  if (isLoadingOffers.value) {
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
  isLoadingOffers.value = true
  try {
    const queryParams = buildQueryParams()

    const response = await offerListOffers({
      query: queryParams
    })

    if (response.data) {
      offers.value = [...offers.value, ...(response.data.data || [])]
      count.value = response.data.count || 0
      limit.value = response.data.limit || 10
      hasLoaded.value = true
    }
  } catch (error) {
    console.error('Error fetching offers:', error)
    if (options.reset) {
      offers.value = []
      count.value = 0
    }
  } finally {
    isLoadingOffers.value = false
    stopObserverIfDone()
  }
}

const clearAllFilters = () => {
  formData.value.city = null
  formData.value.distance = 30
  formData.value.selectedLegalRoles = []
  formData.value.invoiceRequired = false
  formData.value.search = ''
  fetchOffers({ reset: true })
}

const loadSavedCity = () => {
  try {
    const saved = localStorage.getItem('savedCity')
    if (saved) {
      savedCityData.value = JSON.parse(saved)
    }
  } catch (error) {
    console.warn('Error loading saved city or localStorage not available:', error)
  }
}

// Debounced search function to avoid too many API calls
const debouncedFetchOffers = debounce(() => fetchOffers({ reset: true }), 300)

// Watch for filter changes and refetch offers
watch(() => formData.value.city, () => {
  fetchOffers({ reset: true })
})

watch(() => formData.value.distance, () => {
  if (formData.value.city || savedCityData.value) {
    debouncedFetchOffers()
  }
})

watch(() => formData.value.selectedLegalRoles, () => {
  fetchOffers({ reset: true })
}, {deep: true})

watch(() => formData.value.invoiceRequired, () => {
  fetchOffers({ reset: true })
})

watch(() => formData.value.search, () => {
  debouncedFetchOffers()
})

watch(canLoadMore, () => {
  if (canLoadMore.value) {
    startObserver()
  } else {
    stopObserverIfDone()
  }
})

watch(() => savedCityData.value, () => {
  if (formData.value.city || savedCityData.value) {
    fetchOffers({ reset: true })
  }
}, {deep: true})

// Lifecycle
onMounted(() => {
  loadSavedCity()
  fetchOffers()
  startObserver()
})

definePageMeta({
  title: 'Oferty substytucji'
})

useSeoMeta({
  title: 'Znajdź substytucję procesową – przeglądaj aktualne oferty',
  description: 'Przeglądaj aktualne ogłoszenia o substytucjach procesowych. Wyszukuj wg lokalizacji, specjalizacji i terminów – znajdź odpowiednie zastępstwo w kilka chwil.',
})

</script>

<style scoped>
/* Add any custom styles here if needed */
</style>