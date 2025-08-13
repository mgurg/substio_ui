<template>
  <UContainer>
    <!-- City Selection Card -->
    <UCard>
      <template #header>
        <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">{{ t('homepage.title') }}</h1>
      </template>

      <Form>
        <div class="space-y-4">
          <UFormField
              label="Miasto:"
              name="city"
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

          <div class="flex gap-3">
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
          </div>

          <!-- Saved City Display -->
          <div v-if="savedCityData" class="p-4 bg-green-50 rounded-lg border border-green-200">
            <div class="flex items-center mb-2">
              <UIcon name="i-lucide-check-circle" class="mr-2 h-5 w-5 text-green-600"/>
              <span class="font-semibold text-green-800">Zapisane miasto:</span>
            </div>
            <div class="text-green-700">
              <div><strong>{{ savedCityData.name }}</strong></div>
<!--              <div class="text-sm text-green-600">-->
<!--                Współrzędne: {{ savedCityData.lat }}, {{ savedCityData.lon }}-->
<!--              </div>-->
<!--              <div class="text-sm text-green-600">-->
<!--                UUID: {{ savedCityData.uuid }}-->
<!--              </div>-->
            </div>
          </div>
        </div>
      </Form>
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
import { getAllOffersOffersGet, getCitiesPlacesCityCityNameGet } from "@/client/index.ts"
import { ref, watch, onMounted, computed } from "vue"

const { t } = useI18n()

// Reactive data
const offers = ref([])
const count = ref(0)
const limit = ref(10)
const currentPage = ref(1)

const citySearch = ref('')
const cities = ref([])
const isLoadingCities = ref(false)

const formData = ref({
  city: null,
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
      offers.value = response.data.data || []
      count.value = response.data.count || 0
      limit.value = response.data.limit || 10
    }
  } catch (error) {
    console.error('Error fetching offers:', error)
  }
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

// Lifecycle
onMounted(() => {
  loadSavedCity()
  fetchOffers()
})
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>