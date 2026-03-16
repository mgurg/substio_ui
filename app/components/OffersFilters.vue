<template>
  <UCard>
    <template #header>
      <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">{{ t('homepage.title') }}</h1>
    </template>

    <UForm :state="modelValue">
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
                    v-model="modelValue.city"
                    v-model:search-term="citySearch"
                    :items="cities"
                    :loading="isLoadingCities"
                    placeholder="Wyszukaj miasto"
                    icon="i-lucide-map-pin"
                    searchable
                    class="w-full"
                />
                <UButton
                    :disabled="!modelValue.city"
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
                  <span class="font-medium text-green-800">{{ savedCityData.name }} ({{ modelValue.distance }} km)</span>
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
                v-if="modelValue.city && !savedCityData"
                label="Odległość (km):"
                name="distance"
            >
              <div class="space-y-3">
                <USlider
                    v-model="modelValue.distance"
                    :min="10"
                    :max="50"
                    :step="10"
                    class="w-full"
                />
                <div class="flex justify-between text-sm text-gray-600">
                  <span>10 km</span>
                  <span class="font-medium">{{ modelValue.distance }} km</span>
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
                  :variant="modelValue.selectedLegalRoles.includes(role.value) ? 'solid' : 'outline'"
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
                    v-model="modelValue.search"
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
                      v-model="modelValue.invoiceRequired"
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
                  @click="emit('clear')"
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
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useI18n } from '#imports'
import { placeGetCities, offerGetLegalRoles } from "@/client/index.ts"
import type { CityIndexResponse, LegalRoleIndexResponse } from "@/client/types.gen.ts"

interface FormData {
  city: CityIndexResponse | null
  distance: number
  selectedLegalRoles: string[]
  invoiceRequired: boolean
  search: string
}

const props = defineProps<{
  modelValue: FormData
  savedCityData: CityIndexResponse | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FormData): void
  (e: 'update:savedCityData', value: CityIndexResponse | null): void
  (e: 'clear'): void
}>()

const { t } = useI18n()

const citySearch = ref('')
const cities = ref<CityIndexResponse[]>([])
const isLoadingCities = ref(false)

const legalRoles = ref<LegalRoleIndexResponse[]>([])
const isLoadingRoles = ref(false)

const searchCities = async (searchTerm: string) => {
  if (!searchTerm || searchTerm.length < 2) return

  isLoadingCities.value = true
  try {
    const response = await placeGetCities({
      path: { city_name: searchTerm }
    })

    cities.value = (response.data || []).map(city => ({
      label: city.name + " (" + city.voivodeship_name + ")",
      value: city.uuid,
      ...city
    }))
  } catch (error) {
    console.error('Error searching cities:', error)
  } finally {
    isLoadingCities.value = false
  }
}

watch(citySearch, (newVal) => {
  searchCities(newVal)
})

const fetchLegalRoles = async () => {
  isLoadingRoles.value = true
  try {
    const { data } = await offerGetLegalRoles()
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

const toggleLegalRole = (roleValue: string) => {
  const newRoles = [...props.modelValue.selectedLegalRoles]
  if (newRoles.includes(roleValue)) {
    const index = newRoles.indexOf(roleValue)
    newRoles.splice(index, 1)
  } else {
    newRoles.push(roleValue)
  }
  emit('update:modelValue', { ...props.modelValue, selectedLegalRoles: newRoles })
}

const saveCity = () => {
  if (!props.modelValue.city) return

  const selectedCity = cities.value.find(city => city.value === props.modelValue.city?.value)

  if (selectedCity) {
    const cityToSave = {
      uuid: selectedCity.uuid,
      name: selectedCity.name || (selectedCity as any).label,
      lat: selectedCity.lat,
      lon: selectedCity.lon
    }

    try {
      localStorage.setItem('savedCity', JSON.stringify(cityToSave))
      emit('update:savedCityData', cityToSave)
      console.log('City saved successfully:', cityToSave)
    } catch (error) {
      console.warn('localStorage not available, using in-memory storage', error)
      emit('update:savedCityData', cityToSave)
    }

    // @ts-ignore
    umTrackEvent('save-city', { city: selectedCity.name, uuid: selectedCity.uuid });
  }
}

const clearSavedCity = () => {
  try {
    localStorage.removeItem('savedCity')
  } catch (error) {
    console.warn('localStorage not available', error)
  }
  emit('update:savedCityData', null)
  emit('update:modelValue', { ...props.modelValue, city: null, distance: 30 })
}

onMounted(() => {
  fetchLegalRoles()
})
</script>
