<template>
  <UContainer>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Left: Offer Details -->
      <div v-if="offer?.raw_data">
        <h2 class="flex items-center text-2xl font-bold mb-4 gap-4">
          <UButton icon="i-lucide-arrow-left" to="/raw">wróć</UButton>
          <span class="flex-1">Dane oferty</span>
          <UBadge size="lg" color="neutral" variant="soft">{{ offerStatus }}</UBadge>
        </h2>

        <USkeleton v-if="isLoading" class="h-32 w-full"/>

        <div v-else>
          <p><strong>UUID:</strong> {{ offer?.uuid }}</p>
          <p><strong>Author:</strong> {{ offer?.author }}</p>
          <p><strong>Raw Data:</strong></p>
          <p class="bg-gray-100 dark:bg-gray-800 p-4 rounded">{{ offer?.raw_data }}</p>

          <UButton
              icon="i-lucide-rocket"
              class="mt-6"
              :loading="isGenerating"
              @click="generateData"
          >
            Generuj
          </UButton>
        </div>

        <!-- Generated Data Section -->
        <div class="mt-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold">Wygenerowane dane</h2>
          </div>

          <div v-if="isGenerating" class="space-y-2">
            <USkeleton class="h-4 w-full"/>
            <USkeleton class="h-4 w-3/4"/>
            <USkeleton class="h-4 w-1/2"/>
          </div>

          <div v-else-if="generatedData">
            <div
                v-if="generatedData.success && generatedData.data"
                class="bg-green-50 border border-green-200 rounded-lg p-4"
            >
              <h3 class="font-semibold text-green-800 mb-3">Dane zostały wygenerowane pomyślnie:</h3>

              <div class="space-y-3 text-sm">
                <div v-if="generatedData.data.location" class="flex items-center justify-between">
                  <div>
                    <strong>Lokalizacja:</strong> {{ generatedData.data.location }}
                  </div>
                  <UButton
                      icon="i-lucide-copy"
                      size="xs"
                      variant="outline"
                      @click="copyField('place_type', generatedData.data.location)"
                  >
                    Kopiuj
                  </UButton>
                </div>

                <div v-if="generatedData.data.location_full_name" class="flex items-center justify-between">
                  <div>
                    <strong>Pełna nazwa miejsca:</strong> {{ generatedData.data.location_full_name }}
                  </div>
                  <UButton
                      icon="i-lucide-copy"
                      size="xs"
                      variant="outline"
                      @click="copyField('place_name', generatedData.data.location_full_name)"
                  >
                    Kopiuj
                  </UButton>
                </div>

                <div
                    v-if="generatedData.data.date && generatedData.data.date.length"
                    class="flex items-center justify-between"
                >
                  <div>
                    <strong>Data:</strong> {{ generatedData.data.date.join(', ') }}
                  </div>
                  <UButton
                      icon="i-lucide-copy"
                      size="xs"
                      variant="outline"
                      @click="copyField('date', generatedData.data.date.join(', '))"
                  >
                    Kopiuj
                  </UButton>
                </div>

                <div
                    v-if="generatedData.data.time && generatedData.data.time.length"
                    class="flex items-center justify-between"
                >
                  <div>
                    <strong>Czas:</strong> {{ generatedData.data.time.join(', ') }}
                  </div>
                  <UButton
                      icon="i-lucide-copy"
                      size="xs"
                      variant="outline"
                      @click="copyField('time', generatedData.data.time.join(', '))"
                  >
                    Kopiuj
                  </UButton>
                </div>

                <div v-if="generatedData.data.description" class="flex items-start justify-between">
                  <div class="flex-1 mr-2">
                    <strong>Opis:</strong> {{ generatedData.data.description }}
                  </div>
                  <UButton
                      icon="i-lucide-copy"
                      size="xs"
                      variant="outline"
                      @click="copyField('description', generatedData.data.description)"
                  >
                    Kopiuj
                  </UButton>
                </div>

                <div
                    v-if="generatedData.data.legal_roles && generatedData.data.legal_roles.length"
                    class="flex items-center justify-between"
                >
                  <div>
                    <strong>Role prawne:</strong> {{ generatedData.data.legal_roles.join(', ') }}
                  </div>
                  <UButton
                      icon="i-lucide-copy"
                      size="xs"
                      variant="outline"
                      @click="copyField('legal_roles', generatedData.data.legal_roles.join(', '))"
                  >
                    Kopiuj
                  </UButton>
                </div>

                <div v-if="generatedData.data.email" class="flex items-center justify-between">
                  <div>
                    <strong>Email:</strong> {{ generatedData.data.email }}
                  </div>
                  <UButton
                      icon="i-lucide-copy"
                      size="xs"
                      variant="outline"
                      @click="copyField('email', generatedData.data.email)"
                  >
                    Kopiuj
                  </UButton>
                </div>
              </div>
            </div>

            <div v-else-if="!generatedData.success" class="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 class="font-semibold text-red-800 mb-2">Błąd podczas generowania:</h3>
              <p class="text-red-700 text-sm">{{ generatedData.error || 'Nieznany błąd' }}</p>
            </div>
          </div>

          <div v-else class="text-gray-500 text-sm">
            Kliknij "Generuj" aby wygenerować dane z surowych danych oferty.
          </div>
        </div>
      </div>

      <!-- Right: Form -->
      <div>
        <h2 class="text-2xl font-bold mb-4">Formularz</h2>

        <UForm
            ref="formRef"
            :schema="validationSchema"
            :state="formData"
            class="space-y-6"
            @submit="handleSubmit"
            @error="handleFormError"
        >
          <!-- Category Selection -->
          <UFormField
              label="Kategoria:"
              name="placeCategory"
          >
            <UFieldGroup>
              <UButton
                  :variant="formData.placeCategory === 'court' ? 'solid' : 'outline'"
                  color="primary"
                  type="button"
                  @click="setPlaceCategory('court')"
              >
                Sąd
              </UButton>
              <UButton
                  :variant="formData.placeCategory === 'other' ? 'solid' : 'outline'"
                  color="primary"
                  type="button"
                  @click="setPlaceCategory('other')"
              >
                Inne
              </UButton>
            </UFieldGroup>
          </UFormField>

          <!-- Court Fields -->
          <template v-if="formData.placeCategory === 'court'">
            <UFormField
                label="Typ sądu:"
                name="placeType"
            >
              <UFieldGroup>
                <UButton
                    v-for="type in courtTypes"
                    :key="type.value"
                    :variant="formData.placeType === type.value ? 'solid' : 'outline'"
                    color="primary"
                    type="button"
                    @click="setPlaceType(type.value)"
                >
                  {{ type.label }}
                </UButton>
              </UFieldGroup>
            </UFormField>

            <UFormField
                label="Placówka:"
                name="facility"
            >
              <USelectMenu
                  v-model="formData.facility"
                  v-model:search-term="facilitySearch"
                  :items="facilities"
                  :loading="isLoadingFacilities"
                  placeholder="Wyszukaj placówkę"
                  icon="i-lucide-building"
                  searchable
                  class="w-full"
                  :highlight="!!formData.facility"
                  color="primary"
                  :trailing-icon="!!formData.facility ? 'i-lucide-check' : undefined"
              />
            </UFormField>
          </template>

          <!-- Other Fields -->
          <template v-else-if="formData.placeCategory === 'other'">
            <UFormField
                label="Miejsce:"
                name="place"
            >
              <UInput
                  v-model="formData.place"
                  placeholder="Podaj nazwę miejsca"
                  class="w-full"
              />
            </UFormField>

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
                  :highlight="!!formData.city"
                  color="primary"
                  :trailing-icon="!!formData.city ? 'i-lucide-check' : undefined"
              />
            </UFormField>
          </template>

          <!-- Common Fields -->
          <UFormField label="Opis:" name="description">
            <UTextarea
                v-model="formData.description"
                placeholder="Wprowadź opis oferty"
                :rows="4"
                class="w-full"
            />
          </UFormField>

          <div class="flex gap-4 items-end">
            <UFormField label="Autor:" name="author">
              <UInput v-model="formData.author" placeholder="Wprowadź autora oferty" class="w-72"/>
            </UFormField>

            <UFormField label="Email:" name="email">
              <UInput
                  v-model="formData.email"
                  type="email"
                  placeholder="email@example.com"
                  class="w-72"
                  :ui="{ trailing: 'pe-1' }"
              >
                <template #trailing>
                  <UButton
                      color="neutral"
                      variant="link"
                      size="sm"
                      icon="i-lucide-circle-x"
                      @click="formData.email = null"
                  />
                </template>
              </UInput>
            </UFormField>
          </div>
          <UFormField label="Role prawne:" name="roles">
            <UFieldGroup size="lg">
              <UButton
                  v-for="role in legalRoles"
                  :key="role.value"
                  :variant="formData.roles.includes(role.value) ? 'solid' : 'outline'"
                  color="primary"
                  type="button"
                  @click="toggleRole(role.value)"
              >
                {{ role.label }}
              </UButton>
            </UFieldGroup>
          </UFormField>

          <!-- Date and Time -->
          <div class="flex gap-4 items-end">
            <UFormField label="Data:" name="date">
              <UInput
                  v-model="formData.date"
                  type="date"
                  placeholder="Wybierz datę"
                  class="w-64"
                  :ui="{ trailing: 'pe-1' }"
              >
                <template #trailing>
                  <UButton
                      color="neutral"
                      variant="link"
                      size="sm"
                      icon="i-lucide-circle-x"
                      @click="formData.date = null"
                  />
                </template>
              </UInput>
            </UFormField>

            <UFormField label="Godzina:" name="hour">
              <UInput
                  v-model="formData.hour"
                  type="time"
                  placeholder="Wybierz godzinę"
                  class="w-36"
                  :ui="{ trailing: 'pe-1' }"
              >
                <template #trailing>
                  <UButton
                      color="neutral"
                      variant="link"
                      size="sm"
                      icon="i-lucide-circle-x"
                      @click="formData.hour = null"
                  />
                </template>
              </UInput>
            </UFormField>
          </div>

          <UFormField label="Faktura:" name="invoiceRequired">
            <UCheckbox
                v-model="formData.invoiceRequired"
                label="Wymagana faktura"
            />
          </UFormField>

          <!-- Status Selection Bar -->
          <UFormField label="Status:" name="status">
            <div class="flex gap-2 flex-wrap">
              <UButton
                  v-for="status in statusOptions"
                  :key="status.value"
                  :icon="status.icon"
                  :variant="formData.status === status.value ? 'solid' : 'outline'"
                  :color="status.color"
                  type="button"
                  size="md"
                  :title="status.label"
                  @click="setStatus(status.value)"
              />
            </div>
            <div class="text-sm text-gray-500 mt-1">
              Wybrany status: <span class="font-medium">{{ getStatusLabel(formData.status) }}</span>
            </div>
          </UFormField>

          <!-- Submit Buttons -->
          <div class="flex gap-2">
            <UButton type="submit" :loading="isSubmitting">
              {{ isSubmitting ? 'Zapisywanie...' : 'Zaktualizuj ofertę' }}
            </UButton>
            <UButton variant="outline" type="button" @click="resetForm">
              Wyczyść formularz
            </UButton>
          </div>

        </UForm>
      </div>
    </div>
    <!-- Debug Info -->
    <DebugPanel
        v-if="isDevelopment"
        :form-data="formData"
    />
  </UContainer>
</template>

<script setup>
import {useRoute} from 'vue-router'
import {computed, onMounted, ref, watch} from 'vue'
import * as yup from 'yup'
import {
  getCitiesPlacesCityCityNameGet,
  getCityPlacesCityUuidCityUuidGet,
  getFacilitiesPlacesFacilityPlaceNameGet,
  getFacilityPlacesFacilityUuidPlaceUuidGet,
  getLegalRolesOffersLegalRolesGet,
  getRawOfferOffersRawOfferUuidGet,
  parseRawOffersParseOfferUuidGet,
  updateOfferOffersOfferUuidPatch
} from '~/client'
import DebugPanel from "~/components/DebugPanel.vue";

// ====================
// CONSTANTS & SETUP
// ====================
const route = useRoute()
const toast = useToast()
const uuid = route.params.uuid
const isDevelopment = process.env.NODE_ENV === 'development'

const courtTypes = [
  {value: 'SR', label: 'Rejonowy'},
  {value: 'SA', label: 'Apelacyjny'},
  {value: 'SO', label: 'Okręgowy'}
]

const statusOptions = [
  {value: 'imported', label: 'Imported', icon: 'i-lucide-download', color: 'neutral'},
  {value: 'new', label: 'New', icon: 'i-lucide-plus-circle', color: 'neutral'},
  {value: 'draft', label: 'Draft', icon: 'i-lucide-file-text', color: 'neutral'},
  {value: 'spam', label: 'Spam', icon: 'i-lucide-shield-x', color: 'warning'},
  {value: 'postponed', label: 'Postponed', icon: 'i-lucide-clock', color: 'neutral'},
  {value: 'accepted', label: 'Accepted', icon: 'i-lucide-check-circle', color: 'green'},
  {value: 'rejected', label: 'Rejected', icon: 'i-lucide-x-circle', color: 'error'},
  {value: 'active', label: 'Active', icon: 'i-lucide-play-circle', color: 'primary'}
]

// ====================
// VALIDATION SCHEMA
// ====================
const validationSchema = computed(() => {
  const baseSchema = {
    status: yup.string().required('Wybierz status').oneOf(['imported', 'new', 'draft', 'spam', 'postponed', 'accepted', 'rejected', 'active']),
    placeCategory: yup.string().required('Wybierz kategorię').oneOf(['court', 'other']),
    author: yup.string(),
    description: yup.string().required(),
    email: yup.string().email('Nieprawidłowy format email').nullable(),
    roles: yup.array().of(yup.string()),
    date: yup.string().nullable(),
    hour: yup.string().nullable(),
    invoiceRequired: yup.boolean()
  }

  if (formData.value.placeCategory === 'court') {
    return yup.object({
      ...baseSchema,
      placeType: yup.string().oneOf(['SR', 'SA', 'SO']).nullable(),
      facility: yup.object({
        label: yup.string().required(),
        value: yup.string().required()
      }).required('Wybierz placówkę')
    })
  } else if (formData.value.placeCategory === 'other') {
    return yup.object({
      ...baseSchema,
      place: yup.string().required('Podaj nazwę miejsca'),
      city: yup.object({
        label: yup.string().required(),
        value: yup.string().required()
      }).required('Wybierz miasto')
    })
  }

  return yup.object(baseSchema)
})

// ====================
// REACTIVE STATE
// ====================
const offer = ref(null)
const isLoading = ref(false)
const isGenerating = ref(false)
const generatedData = ref(null)
const isSubmitting = ref(false)

// Form data with proper initial values
const formData = ref({
  status: 'new',
  placeCategory: 'court',
  placeType: null,
  facility: null,
  place: '',
  city: null,
  author: '',
  description: '',
  email: null,
  roles: [],
  date: null,
  hour: null,
  invoiceRequired: false
})

// Search states
const facilitySearch = ref('')
const facilities = ref([])
const isLoadingFacilities = ref(false)

const citySearch = ref('')
const cities = ref([])
const isLoadingCities = ref(false)

const legalRoles = ref([])
const isLoadingRoles = ref(false)


const offerStatus = ref('')

// ====================
// FORM METHODS
// ====================
const setStatus = (status) => {
  formData.value.status = status
}

const getStatusLabel = (statusValue) => {
  return statusOptions.find(status => status.value === statusValue)?.label || statusValue
}

const setPlaceCategory = (category) => {
  formData.value.placeCategory = category
  // Reset category-specific fields
  if (category === 'court') {
    formData.value.place = ''
    formData.value.city = null
  } else {
    formData.value.placeType = null
    formData.value.facility = null
  }
}

const setPlaceType = (type) => {
  formData.value.placeType = formData.value.placeType === type ? null : type
  formData.value.facility = null
  facilitySearch.value = ''
}

const toggleRole = (roleValue) => {
  const currentRoles = formData.value.roles
  if (currentRoles.includes(roleValue)) {
    formData.value.roles = currentRoles.filter(r => r !== roleValue)
  } else {
    formData.value.roles = [...currentRoles, roleValue]
  }
}

const resetForm = () => {
  formData.value = {
    status: 'new',
    placeCategory: 'court',
    placeType: null,
    facility: null,
    place: '',
    city: null,
    author: '',
    description: '',
    email: null,
    roles: [],
    date: null,
    hour: null,
    invoiceRequired: false
  }
  facilitySearch.value = ''
  citySearch.value = ''
  facilities.value = []
  cities.value = []
}

// ====================
// API METHODS
// ====================
const fetchOffer = async () => {
  isLoading.value = true
  try {
    const response = await getRawOfferOffersRawOfferUuidGet({
      path: {offer_uuid: uuid}
    })

    if (response.data) {
      offer.value = response.data
      populateFormWithOfferData(response.data)
    }
  } catch (error) {
    console.error('Error fetching offer:', error)
    toast.add({
      title: 'Błąd',
      description: 'Nie udało się pobrać danych oferty',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const generateData = async () => {
  isGenerating.value = true
  try {
    const response = await parseRawOffersParseOfferUuidGet({
      path: {offer_uuid: uuid}
    })

    if (response.data) {
      generatedData.value = response.data

      if (response.data.success) {
        toast.add({
          title: 'Sukces',
          description: 'Dane zostały wygenerowane pomyślnie',
          color: 'success'
        })
      } else {
        toast.add({
          title: 'Błąd',
          description: response.data.error || 'Nie udało się wygenerować danych',
          color: 'error'
        })
      }
    }
  } catch (error) {
    console.error('Error generating data:', error)
    toast.add({
      title: 'Błąd',
      description: 'Wystąpił błąd podczas generowania danych',
      color: 'error'
    })
  } finally {
    isGenerating.value = false
  }
}

const searchFacilities = async (searchTerm, placeType) => {
  if (!searchTerm || searchTerm.length < 2) return

  isLoadingFacilities.value = true
  try {
    const queryParams = placeType ? {place_type: placeType} : {}
    const response = await getFacilitiesPlacesFacilityPlaceNameGet({
      path: {place_name: searchTerm},
      query: queryParams
    })

    facilities.value = (response.data || []).map(facility => {
      const street = `${facility.street_name || ""} ${facility.street_number || ""}`.trim();

      return {
        label: `${facility.name}${street ? ` (${street})` : ""}`,
        value: facility.uuid,
        city: facility.city,
        name: facility.name,
        street_name: facility.street_name,
        street_number: facility.street_number,
      };
    });

  } catch (error) {
    console.error('Error searching facilities:', error)
  } finally {
    isLoadingFacilities.value = false
  }
}

const getCityByUuid = async (cityUuid) => {
  try {
    const response = await getCityPlacesCityUuidCityUuidGet({
      path: {city_uuid: cityUuid}
    })
    return response.data
  } catch (error) {
    console.error('Error fetching city by UUID:', error)
    return null
  }
}

const getPlaceByUuid = async (placeUuid) => {
  try {
    const response = await getFacilityPlacesFacilityUuidPlaceUuidGet({
      path: {place_uuid: placeUuid}
    })
    return response.data
  } catch (error) {
    console.error('Error fetching place by UUID:', error)
    return null
  }
}

const searchCities = async (searchTerm) => {
  if (!searchTerm || searchTerm.length < 2) return

  isLoadingCities.value = true
  try {
    const response = await getCitiesPlacesCityCityNameGet({
      path: {city_name: searchTerm}
    })

    cities.value = (response.data || []).map(city => ({
      label: city.name + " (" + city.voivodeship_name + ")",
      value: city.uuid,
      cityName: city.name,
      voivodeshipName: city.voivodeship_name
    }))

  } catch (error) {
    console.error('Error searching cities:', error)
  } finally {
    isLoadingCities.value = false
  }
}

const fetchLegalRoles = async () => {
  isLoadingRoles.value = true
  try {
    const {data} = await getLegalRolesOffersLegalRolesGet()
    if (data) {
      legalRoles.value = data.map(role => ({
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

// ====================
// FORM HANDLERS
// ====================
const handleSubmit = async (event) => {
  isSubmitting.value = true

  try {
    const updateData = buildUpdatePayload(event.data)

    await updateOfferOffersOfferUuidPatch({
      path: {offer_uuid: uuid},
      body: updateData
    })

    toast.add({
      title: 'Sukces',
      description: 'Oferta została zaktualizowana pomyślnie',
      color: 'success'
    })
  } catch (error) {
    console.error('Form submission error:', error)
    toast.add({
      title: 'Błąd',
      description: 'Błąd podczas aktualizacji oferty',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
  await fetchOffer()
}

const handleFormError = (event) => {
  const element = document.getElementById(event.errors[0].id)
  element?.focus()
  element?.scrollIntoView({behavior: 'smooth', block: 'center'})
}

const buildUpdatePayload = (data) => {
  const payload = {
    status: data.status,
    description: data.description || null,
    author: data.author || null,
    email: data.email,
    roles: data.roles || [],
    date: data.date,
    hour: data.hour,
    invoice: data.invoiceRequired
  }

  if (data.placeCategory === 'court' && data.facility) {
    payload.place_name = data.facility.name
    payload.facility_uuid = data.facility.value
  } else if (data.placeCategory === 'other') {
    payload.place_name = data.place
    if (data.city) {
      payload.city_name = data.city.cityName
      payload.city_uuid = data.city.value
    }
  }

  return payload
}

// ====================
// UTILITY METHODS
// ====================
const populateFormWithOfferData = async (offerData) => {
  if (offerData.status) formData.value.status = offerData.status
  if (offerData.author) formData.value.author = offerData.author
  if (offerData.description) formData.value.description = offerData.description
  if (offerData.email) formData.value.email = offerData.email
  if (offerData.date) formData.value.date = offerData.date
  if (offerData.hour) formData.value.hour = offerData.hour
  formData.value.invoiceRequired = offerData.invoice === true
  offerStatus.value = offerData.status

  if (offerData.place) {
    // --- Court branch ---
    formData.value.placeCategory = 'court'
    formData.value.facility = {
      label: offerData.place.name,
      value: offerData.place.uuid
    }
    facilitySearch.value = offerData.place.name

    const placeName = offerData.place.name.toLowerCase()
    if (placeName.includes('rejonowy')) formData.value.placeType = 'SR'
    else if (placeName.includes('apelacyjny')) formData.value.placeType = 'SA'
    else if (placeName.includes('okręgowy')) formData.value.placeType = 'SO'
  } else if (offerData.city) {
    // --- Other branch ---
    formData.value.placeCategory = 'other'

    if (offerData.place_name) {
      formData.value.place = offerData.place_name
    }
    let facilityData = offerData.facility

    if (!facilityData.street_name && facilityData.uuid) {
      const completeFacilityData = await getPlaceByUuid(facilityData.uuid)
      if (completeFacilityData) {
        facilityData = completeFacilityData
      }
    }

    const facilityLabel = facilityData.street_name
        ? `${facilityData.name} (${facilityData.street_name})`
        : facilityData.name

    formData.value.facility = {
      label: facilityLabel,
      value: facilityData.uuid,
      city: facilityData.city,
      name: facilityData.name,
      street_name: facilityData.street_name,
      street_number: facilityData.street_number,
    }

    let cityData = offerData.city


    if (!cityData.voivodeship_name && cityData.uuid) {
      const completeCityData = await getCityByUuid(cityData.uuid)
      if (completeCityData) {
        cityData = completeCityData
      }
    }

    const cityLabel = cityData.voivodeship_name
        ? `${cityData.name} (${cityData.voivodeship_name})`
        : cityData.name

    formData.value.city = {
      label: cityLabel,
      value: cityData.uuid,
      cityName: cityData.name,
      voivodeshipName: cityData.voivodeship_name
    }
    citySearch.value = cityData.name
  }

  if (offerData.legal_roles?.length) {
    formData.value.roles = offerData.legal_roles.map(role => role.uuid)
  }
}

const copyField = (fieldName, value) => {
  if (!value) return

  const fieldMappings = {
    place_type: () => {
      if (value.toLowerCase().includes('rejonowy')) formData.value.placeType = 'SR'
      else if (value.toLowerCase().includes('apelacyjny')) formData.value.placeType = 'SA'
      else if (value.toLowerCase().includes('okręgowy')) formData.value.placeType = 'SO'
    },
    place_name: () => {
      facilitySearch.value = value
      formData.value.facility = {label: value, value: value}
    },
    description: () => formData.value.description = value,
    date: () => {
      try {
        if (value.includes('.')) {
          const [day, month, year] = value.split('.')
          formData.value.date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        } else {
          formData.value.date = value
        }
      } catch {
        formData.value.date = value
      }
    },
    time: () => formData.value.hour = value.replace('.', ':'),
    email: () => formData.value.email = value,
    legal_roles: () => {
      // Split the comma-separated role names
      const roleNames = value.split(',').map(role => role.trim())

      console.log(roleNames)

      console.log(legalRoles.value)
      formData.value.roles = legalRoles.value
          .filter(role => roleNames.includes(role.label.toLowerCase()))
          .map(role => role.value)
    }
  }

  fieldMappings[fieldName]?.()
}

// ====================
// WATCHERS
// ====================
watch([facilitySearch, () => formData.value.placeType], ([searchTerm, placeType]) => {
  searchFacilities(searchTerm, placeType)
})

watch(citySearch, (searchTerm) => {
  searchCities(searchTerm)
})

watch(() => formData.value.placeType, () => {
  formData.value.facility = null
})

// ====================
// LIFECYCLE
// ====================
onMounted(() => {
  fetchLegalRoles()
  fetchOffer()
})
</script>