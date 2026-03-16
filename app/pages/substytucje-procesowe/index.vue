<template>
  <UContainer>
    <!-- Filters Section -->
    <OffersFilters
        v-model="formData"
        v-model:saved-city-data="savedCityData"
        @clear="clearAllFilters"
    />


    <!-- Loading State -->
    <div v-if="isLoadingOffers" class="flex justify-center py-8">
      <UIcon name="i-lucide-loader-2" class="animate-spin h-8 w-8"/>
    </div>

    <!-- Offers List -->
    <OfferCard
        v-for="offer in offers"
        :key="offer.uuid"
        :offer="offer"
        :detailed="true"
    />

    <StructuredDataList :offers="offers"/>

    <!-- No Results -->
    <div v-if="!isLoadingOffers && offers.length === 0" class="text-center py-8">
      <UIcon name="i-lucide-search-x" class="h-12 w-12 mx-auto mb-4 text-gray-400"/>
      <p class="text-gray-600">Nie znaleziono ofert spełniających kryteria wyszukiwania.</p>
    </div>

    <!-- Pagination -->
    <div v-if="offers.length > 0" class="flex justify-center mt-6 mb-10 pb-10">
      <UPagination
          v-model:page="currentPage"
          :page-count="pageCount"
          :total="count"
          @update:page="handlePageChange"
      />
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import {useI18n} from '#imports'
import {offerListOffers} from "@/client/index.ts"
import {computed, onMounted, ref, watch} from "vue"
import StructuredDataList from "~/components/StructuredDataList.vue";
import OffersFilters from "~/components/OffersFilters.vue";
import type {OfferIndexResponse} from "@/client/types.gen.ts"

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
const currentPage = ref(1)
const isLoadingOffers = ref(false)

const formData = ref({
  city: null as any | null,
  distance: 30,
  selectedLegalRoles: [] as string[],
  invoiceRequired: false,
  search: ''
})

const savedCityData = ref<any | null>(null)

// Computed
const pageCount = computed(() => Math.ceil(count.value / limit.value))

// Methods
const buildQueryParams = () => {
  const params = {
    offset: (currentPage.value - 1) * limit.value,
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

const fetchOffers = async () => {
  isLoadingOffers.value = true
  try {
    const queryParams = buildQueryParams()

    const response = await offerListOffers({
      query: queryParams
    })

    if (response.data) {
      offers.value = response.data.data || []
      count.value = response.data.count || 0
      limit.value = response.data.limit || 10
    }
  } catch (error) {
    console.error('Error fetching offers:', error)
    offers.value = []
    count.value = 0
  } finally {
    isLoadingOffers.value = false
  }
}

const clearAllFilters = () => {
  formData.value.city = null
  formData.value.distance = 30
  formData.value.selectedLegalRoles = []
  formData.value.invoiceRequired = false
  formData.value.search = ''
  currentPage.value = 1
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

const handlePageChange = (page) => {
  currentPage.value = page
}

// Debounced search function to avoid too many API calls
const debouncedFetchOffers = debounce(fetchOffers, 300)

// Watch for filter changes and refetch offers
watch(() => formData.value.city, () => {
  currentPage.value = 1
  fetchOffers()
})

watch(() => formData.value.distance, () => {
  if (formData.value.city || savedCityData.value) {
    currentPage.value = 1
    debouncedFetchOffers()
  }
})

watch(() => formData.value.selectedLegalRoles, () => {
  currentPage.value = 1
  fetchOffers()
}, {deep: true})

watch(() => formData.value.invoiceRequired, () => {
  currentPage.value = 1
  fetchOffers()
})

watch(() => formData.value.search, () => {
  currentPage.value = 1
  debouncedFetchOffers()
})

watch(() => currentPage.value, () => {
  fetchOffers()
})

watch(() => savedCityData.value, () => {
  if (formData.value.city || savedCityData.value) {
    fetchOffers()
  }
}, {deep: true})

// Lifecycle
onMounted(() => {
  loadSavedCity()
  fetchOffers()
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