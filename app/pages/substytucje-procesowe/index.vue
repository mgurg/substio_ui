<template>
  <UContainer>
    <!-- Filters Section -->
    <UCard>
      <template #header>
        <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">{{ t('homepage.title') }}</h1>
      </template>

      <UForm :state="formData">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Left Column - Filters -->
          <div class="lg:col-span-9 space-y-6">
            <!-- City Section -->
            <div class="space-y-4">
              <!-- City Filter (only show when no city is saved) -->
              <UFormField
                  v-if="!savedCityData"
                  label="Miasto:"
                  name="city"
              >
                <div class="space-y-2">
                  <USelectMenu
                      v-model="formData.city"
                      v-model:search-term="citySearch"
                      :items="cities"
                      :loading="isLoadingCities"
                      placeholder="Wyszukaj miasto"
                      icon="i-lucide-map-pin"
                      searchable
                      class="w-full"
                  />
                  <UButton
                      :disabled="!formData.city"
                      color="primary"
                      size="md"
                      icon="i-lucide-save"
                      @click="saveCity"
                  >
                    Zapisz miasto
                  </UButton>
                </div>
              </UFormField>

              <!-- Saved City Display (show when city is saved) -->
              <UFormField
                  v-if="savedCityData"
                  label="Miasto:"
                  name="savedCity"
              >
                <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div class="flex items-center">
                    <UIcon name="i-lucide-map-pin" class="mr-2 h-5 w-5 text-green-600"/>
                    <span class="font-medium text-green-800">{{ savedCityData.name }} ({{ formData.distance }} km)</span>
                  </div>
                  <UButton
                      color="red"
                      variant="outline"
                      size="md"
                      icon="i-lucide-trash-2"
                      @click="clearSavedCity"
                  >
                    Usuń
                  </UButton>
                </div>
              </UFormField>

              <!-- Distance Slider (only show when city is selected but not saved) -->
              <UFormField
                  v-if="formData.city && !savedCityData"
                  label="Odległość (km):"
                  name="distance"
              >
                <div class="space-y-3">
                  <USlider
                      v-model="formData.distance"
                      :min="10"
                      :max="50"
                      :step="10"
                      class="w-full"
                  />
                  <div class="flex justify-between text-sm text-gray-600">
                    <span>10 km</span>
                    <span class="font-medium">{{ formData.distance }} km</span>
                    <span>50 km</span>
                  </div>
                </div>
              </UFormField>
            </div>

            <!-- Legal Roles Row -->
            <UFormField
                label="Role prawne:"
                name="legalRoles"
            >
              <div class="flex flex-wrap gap-2">
                <UButton
                    v-for="role in legalRoles"
                    :key="role.value"
                    :variant="formData.selectedLegalRoles.includes(role.value) ? 'solid' : 'outline'"
                    color="primary"
                    type="button"
                    size="md"
                    :loading="isLoadingRoles"
                    @click="toggleLegalRole(role.value)"
                >
                  {{ role.label }}
                </UButton>
              </div>
            </UFormField>

            <!-- Search / Invoice / Clear row -->
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
              <!-- Search -->
              <div class="lg:col-span-7">
                <UFormField label="Szukaj:" name="search">
                  <UInput
                      v-model="formData.search"
                      placeholder="Wyszukaj oferty..."
                      icon="i-lucide-search"
                      size="lg"
                  />
                </UFormField>
              </div>

              <!-- Invoice -->
              <div class="lg:col-span-3">
                <UFormField label="Wymagana faktura:" name="invoiceRequired">
                  <div class="pt-3">
                    <UCheckbox
                        v-model="formData.invoiceRequired"
                        label="Wymagana faktura"
                    />
                  </div>
                </UFormField>
              </div>

              <!-- Clear filters -->
              <div class="lg:col-span-2 flex lg:justify-end">
                <UButton
                    variant="outline"
                    icon="i-lucide-filter-x"
                    class="w-full lg:w-auto"
                    @click="clearAllFilters"
                >
                  Wyczyść filtry
                </UButton>
              </div>
            </div>
          </div>

          <!-- Right Column - Map -->
          <div class="lg:col-span-3 hidden lg:flex items-center">
            <a href="/substytucje-procesowe/map" class="block w-full">
              <img
                  src="~/assets/map.png"
                  alt="Mapa substytucji procesowych"
                  class="w-full rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              >
            </a>
          </div>
        </div>
      </UForm>
    </UCard>


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

<script setup>
import {useI18n} from '#imports'
import {offerListOffers, placeGetCities, offerGetLegalRoles} from "@/client/index.ts"
import {ref, watch, onMounted, computed} from "vue"
import StructuredDataList from "~/components/StructuredDataList.vue";

const {t} = useI18n()

const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

// Reactive data
const offers = ref([])
const count = ref(0)
const limit = ref(10)
const currentPage = ref(1)
const isLoadingOffers = ref(false)

const citySearch = ref('')
const cities = ref([])
const isLoadingCities = ref(false)

// Legal roles data
const legalRoles = ref([])
const isLoadingRoles = ref(false)

const formData = ref({
  city: null,
  distance: 30,
  selectedLegalRoles: [],
  invoiceRequired: false,
  search: ''
})

const savedCityData = ref(null)

// Computed
const pageCount = computed(() => Math.ceil(count.value / limit.value))

// Methods
const searchCities = async (searchTerm) => {
  if (!searchTerm || searchTerm.length < 2) return

  isLoadingCities.value = true
  try {
    const response = await placeGetCities({
      path: {city_name: searchTerm}
    })

    cities.value = (response.data || []).map(city => ({
      label: city.name + " (" + city.voivodeship_name + ")",
      value: city.uuid,
      ...city // Keep all city data for saving
    }))
  } catch (error) {
    console.error('Error searching cities:', error)
  } finally {
    isLoadingCities.value = false
  }
}

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

const fetchLegalRoles = async () => {
  isLoadingRoles.value = true
  try {
    const {data} = await offerGetLegalRoles()
    if (data) {
      legalRoles.value = data.map((role) => ({
        label: role.name,
        value: role.uuid
      }))
    }
  } catch (error) {
    console.error('Error fetching legal roles:', error)
  } finally {
    isLoadingRoles.value = false
  }
}

const toggleLegalRole = (roleValue) => {
  if (formData.value.selectedLegalRoles.includes(roleValue)) {
    formData.value.selectedLegalRoles = formData.value.selectedLegalRoles.filter(r => r !== roleValue)
  } else {
    formData.value.selectedLegalRoles = [...formData.value.selectedLegalRoles, roleValue]
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

const saveCity = () => {
  if (!formData.value.city) return

  const selectedCity = cities.value.find(city => city.value === formData.value.city.value)

  if (selectedCity) {
    const cityToSave = {
      uuid: selectedCity.uuid,
      name: selectedCity.name || selectedCity.label,
      lat: selectedCity.lat,
      lon: selectedCity.lon
    }

    // Save to localStorage (Note: This won't work in Claude artifacts)
    try {
      localStorage.setItem('savedCity', JSON.stringify(cityToSave))
      savedCityData.value = cityToSave
      console.log('City saved successfully:', cityToSave)
    } catch (error) {
      console.warn('localStorage not available, using in-memory storage', error)
      savedCityData.value = cityToSave
    }

    umTrackEvent('save-city', {city: selectedCity.name, uuid: selectedCity.uuid});
  }
}

const clearSavedCity = () => {
  try {
    localStorage.removeItem('savedCity')
  } catch (error) {
    console.warn('localStorage not available', error)
  }
  savedCityData.value = null
  formData.value.city = null
  formData.value.distance = 30
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

// Watchers
watch(citySearch, (searchTerm) => {
  searchCities(searchTerm)
})

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
  fetchLegalRoles()
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