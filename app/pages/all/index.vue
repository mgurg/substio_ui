<template>
  <UContainer>
    <!-- Filters Section -->
    <UCard>
      <template #header>
        <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">{{ t('homepage.title') }}</h1>
      </template>

      <UForm :state="formData">
        <div class="space-y-6">
          <!-- Filters Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- City Filter -->
            <UFormField
                label="Miasto:"
                name="city"
                class="w-full"
            >
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
            </UFormField>

            <!-- Legal Role Filter -->
            <UFormField
                label="Role prawne:"
                name="legalRoles"
                class="w-full"
            >
              <UButtonGroup class="flex-wrap">
                <UButton
                    v-for="role in legalRoles"
                    :key="role.value"
                    :variant="formData.selectedLegalRoles.includes(role.value) ? 'solid' : 'outline'"
                    color="primary"
                    type="button"
                    size="sm"
                    @click="toggleLegalRole(role.value)"
                    :loading="isLoadingRoles"
                >
                  {{ role.label }}
                </UButton>
              </UButtonGroup>
            </UFormField>

            <!-- Invoice Required Filter -->
            <UFormField
                label="Wymagana faktura:"
                name="invoiceRequired"
                class="w-full"
            >
              <UCheckbox
                  v-model="formData.invoiceRequired"
                  label="Wymagana faktura"
              />
            </UFormField>
          </div>

          <!-- City Management Buttons -->
          <div class="flex flex-wrap gap-3">
            <UButton
                :disabled="!formData.city"
                color="primary"
                icon="i-lucide-save"
                @click="saveCity"
            >
              Zapisz miasto
            </UButton>

            <UButton
                v-if="savedCityData"
                color="red"
                variant="outline"
                icon="i-lucide-trash-2"
                @click="clearSavedCity"
            >
              Usuń zapisane miasto
            </UButton>

            <UButton
                variant="outline"
                icon="i-lucide-filter-x"
                @click="clearAllFilters"
            >
              Wyczyść filtry
            </UButton>
          </div>

          <!-- Saved City Display -->
          <div v-if="savedCityData" class="p-4 bg-green-50 rounded-lg border border-green-200">
            <div class="flex items-center mb-2">
              <UIcon name="i-lucide-check-circle" class="mr-2 h-5 w-5 text-green-600"/>
              <span class="font-semibold text-green-800">Zapisane miasto:</span>
            </div>
            <div class="text-green-700">
              <div><strong>{{ savedCityData.name }}</strong></div>
            </div>
          </div>
        </div>
      </UForm>
    </UCard>

    <!-- Offers List -->
    <OfferCard 
      v-for="offer in offers" 
      :key="offer.uuid" 
      :offer="offer"
      :detailed="true"
    />

    <!-- Pagination -->
    <div class="flex justify-center mt-6 mb-10 pb-10">
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
import { useI18n } from '#imports'
import { getAllOffersOffersGet, getCitiesPlacesCityCityNameGet, getLegalRolesOffersLegalRolesGet } from "@/client/index.ts"
import { ref, watch, onMounted, computed } from "vue"

const { t } = useI18n()

// Reactive data
const allOffers = ref([]) // Store all fetched offers
const offers = ref([]) // Store filtered offers for display
const count = ref(0)
const limit = ref(10)
const currentPage = ref(1)

const citySearch = ref('')
const cities = ref([])
const isLoadingCities = ref(false)

// Legal roles data
const legalRoles = ref([])
const isLoadingRoles = ref(false)

const formData = ref({
  city: null,
  selectedLegalRoles: [],
  invoiceRequired: false
})

const savedCityData = ref(null)

// Computed
const pageCount = computed(() => Math.ceil(count.value / limit.value))

// Methods
const searchCities = async (searchTerm) => {
  if (!searchTerm || searchTerm.length < 2) return

  isLoadingCities.value = true
  try {
    const response = await getCitiesPlacesCityCityNameGet({
      path: { city_name: searchTerm }
    })

    cities.value = (response.data || []).map(city => ({
      label: city.name,
      value: city.uuid,
      ...city // Keep all city data for saving
    }))
  } catch (error) {
    console.error('Error searching cities:', error)
  } finally {
    isLoadingCities.value = false
  }
}

const fetchOffers = async () => {
  try {
    const response = await getAllOffersOffersGet({
      query: {
        offset: (currentPage.value - 1) * limit.value,
        limit: limit.value
      },
    })

    if (response.data) {
      allOffers.value = response.data.data || []
      count.value = response.data.count || 0
      limit.value = response.data.limit || 10
      filterOffers()
    }
  } catch (error) {
    console.error('Error fetching offers:', error)
  }
}

const fetchLegalRoles = async () => {
  isLoadingRoles.value = true
  try {
    const { data } = await getLegalRolesOffersLegalRolesGet()
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

const filterOffers = () => {
  let filtered = [...allOffers.value]

  // Filter by city if selected
  if (formData.value.city) {
    // Assuming offers have a city field or location data
    // This would need to be adjusted based on actual offer structure
    filtered = filtered.filter(offer => {
      return offer.facility?.city_uuid === formData.value.city?.value ||
             offer.facility?.city?.uuid === formData.value.city?.value
    })
  }

  // Filter by legal roles if selected
  if (formData.value.selectedLegalRoles && formData.value.selectedLegalRoles.length > 0) {
    filtered = filtered.filter(offer => {
      return offer.legal_roles?.some(role => 
        formData.value.selectedLegalRoles.includes(role.uuid)
      )
    })
  }

  // Filter by invoice required if selected
  if (formData.value.invoiceRequired) {
    filtered = filtered.filter(offer => {
      return offer.invoice_required === true
    })
  }

  offers.value = filtered
}

const clearAllFilters = () => {
  formData.value.city = null
  formData.value.selectedLegalRoles = []
  formData.value.invoiceRequired = false
  filterOffers()
}

const saveCity = () => {
  console.log('Saving city:', formData.value.city)
  // if (!formData.value.city) return

  console.log('Cities:', cities.value)


  // Find the full city data from cities array
  const selectedCity = cities.value.find(city => city.value === formData.value.city.value)

  console.log('Selected city:', selectedCity)

  if (selectedCity) {
    const cityToSave = {
      uuid: selectedCity.uuid,
      name: selectedCity.name || selectedCity.label,
      lat: selectedCity.lat,
      lon: selectedCity.lon
    }

    // Save to localStorage
    localStorage.setItem('savedCity', JSON.stringify(cityToSave))
    savedCityData.value = cityToSave

    // Show success notification (if you have a notification system)
    console.log('City saved successfully:', cityToSave)
  }
}

const clearSavedCity = () => {
  localStorage.removeItem('savedCity')
  savedCityData.value = null
  formData.value.city = null
  filterOffers()
}

const loadSavedCity = () => {
  try {
    const saved = localStorage.getItem('savedCity')
    if (saved) {
      savedCityData.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Error loading saved city:', error)
  }
}


const handlePageChange = (page) => {
  currentPage.value = page
  fetchOffers()
}

// Watchers
watch(citySearch, (searchTerm) => {
  searchCities(searchTerm)
})

// Watch for filter changes and apply filtering
watch(() => formData.value.city, () => {
  filterOffers()
})

watch(() => formData.value.selectedLegalRoles, () => {
  filterOffers()
})

watch(() => formData.value.invoiceRequired, () => {
  filterOffers()
})

// Lifecycle
onMounted(() => {
  loadSavedCity()
  fetchOffers()
  fetchLegalRoles()
})
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>