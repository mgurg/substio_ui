<template>
  <UContainer>
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="flex items-center text-3xl font-bold mb-2 gap-4">
          <UButton icon="i-lucide-arrow-left" to="/raw" variant="outline">wróć</UButton>
          <span class="flex-1">Dodaj nową ofertę</span>
        </h1>
        <p class="text-gray-600 dark:text-gray-400">Wypełnij formularz aby dodać nową ofertę do systemu</p>
      </div>

      <!-- Main Form -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm mt-6 mb-6 px-6 py-4">

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
            <UButtonGroup>
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
            </UButtonGroup>
          </UFormField>

          <!-- Court Fields -->
          <template v-if="formData.placeCategory === 'court'">
            <UFormField
                label="Typ sądu:"
                name="placeType"
            >
              <UButtonGroup>
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
              </UButtonGroup>
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

          <!-- Description -->
          <UFormField label="Opis:" name="description">
            <UTextarea
                v-model="formData.description"
                placeholder="Wprowadź opis oferty"
                :rows="4"
                class="w-full"
            />
          </UFormField>

          <!-- Author and Email -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Autor:" name="author">
              <UInput
                  v-model="formData.author"
                  placeholder="Wprowadź autora oferty"
                  class="w-full"
              />
            </UFormField>

            <UFormField label="Email:" name="email">
              <UInput
                  v-model="formData.email"
                  type="email"
                  placeholder="email@example.com"
                  class="w-full"
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

          <!-- Legal Roles -->
          <UFormField label="Role prawne:" name="roles">
            <UButtonGroup size="lg" class="flex-wrap">
              <UButton
                  v-for="role in legalRoles"
                  :key="role.value"
                  :variant="formData.roles.includes(role.value) ? 'solid' : 'outline'"
                  color="primary"
                  type="button"
                  class="mb-2"
                  @click="toggleRole(role.value)"
              >
                {{ role.label }}
              </UButton>
            </UButtonGroup>
          </UFormField>

          <!-- Date and Time -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Data:" name="date">
              <UInput
                  v-model="formData.date"
                  type="date"
                  placeholder="Wybierz datę"
                  class="w-full"
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
                  class="w-full"
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

          <!-- Invoice Checkbox -->
          <UFormField label="Faktura:" name="invoiceRequired">
            <UCheckbox
                v-model="formData.invoiceRequired"
                label="Wymagana faktura"
            />
          </UFormField>

          <!-- Submit Buttons -->
          <div class="flex gap-3 pt-4">
            <UButton
                type="submit"
                :loading="isSubmitting"
                size="lg"
                icon="i-lucide-plus"
            >
              {{ isSubmitting ? 'Dodawanie...' : 'Dodaj ofertę' }}
            </UButton>

            <UButton
                variant="outline"
                type="button"
                size="lg"
                icon="i-lucide-refresh-cw"
                @click="resetForm"
            >
              Wyczyść formularz
            </UButton>
          </div>
        </UForm>
      </div>

      <!-- Success Message -->
      <div
          v-if="showSuccessMessage"
          class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
      >
        <div class="flex items-center">
          <UIcon name="i-lucide-check-circle" class="text-green-600 mr-3" size="20" />
          <div>
            <h3 class="font-semibold text-green-800">Oferta została dodana pomyślnie!</h3>
            <p class="text-green-700 text-sm mt-1">Możesz dodać kolejną ofertę lub wrócić do listy.</p>
          </div>
        </div>
        <div class="mt-3 flex gap-2">
          <UButton
              size="sm"
              color="green"
              variant="outline"
              icon="i-lucide-plus"
              @click="resetForm"
          >
            Dodaj kolejną
          </UButton>
          <UButton
              size="sm"
              color="green"
              variant="outline"
              to="/raw"
              icon="i-lucide-list"
          >
            Powrót do listy
          </UButton>
        </div>
      </div>
    </div>

    <!-- Debug Panel -->
    <DebugPanel
        v-if="isDevelopment"
        :form-data="formData"
        :additional-data="{
          facilities,
          cities,
          legalRoles,
          facilitySearch,
          citySearch,
          isLoadingFacilities,
          isLoadingCities,
          isSubmitting
        }"
    />
  </UContainer>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import * as yup from 'yup'
import {
  getCitiesPlacesCityCityNameGet,
  getFacilitiesPlacesFacilityPlaceNameGet,
  getLegalRolesOffersLegalRolesGet,
    createUserOfferOffersPost
} from '~/client'
import DebugPanel from "~/components/DebugPanel.vue"

// ====================
// CONSTANTS & SETUP
// ====================
const toast = useToast()
const isDevelopment = process.env.NODE_ENV === 'development'

const courtTypes = [
  {value: 'SR', label: 'Rejonowy'},
  {value: 'SA', label: 'Apelacyjny'},
  {value: 'SO', label: 'Okręgowy'}
]

// ====================
// VALIDATION SCHEMA
// ====================
const validationSchema = computed(() => {
  const baseSchema = {
    placeCategory: yup.string().required('Wybierz kategorię').oneOf(['court', 'other']),
    author: yup.string().required('Autor jest wymagany').max(100),
    description: yup.string().required('Opis jest wymagany').max(1000),
    email: yup.string().email('Nieprawidłowy format email').required('Email jest wymagany').max(128),
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
const isSubmitting = ref(false)
const showSuccessMessage = ref(false)

// Form data with proper initial values
const formData = ref({
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

// ====================
// FORM METHODS
// ====================
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
  showSuccessMessage.value = false
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
  showSuccessMessage.value = false
}

// ====================
// API METHODS
// ====================
const searchFacilities = async (searchTerm, placeType) => {
  if (!searchTerm || searchTerm.length < 2) {
    facilities.value = []
    return
  }

  isLoadingFacilities.value = true
  try {
    const queryParams = placeType ? {place_type: placeType} : {}
    const response = await getFacilitiesPlacesFacilityPlaceNameGet({
      path: {place_name: searchTerm},
      query: queryParams
    })

    facilities.value = (response.data || []).map(facility => ({
      label: facility.name,
      value: facility.uuid
    }))
  } catch (error) {
    console.error('Error searching facilities:', error)
    facilities.value = []
  } finally {
    isLoadingFacilities.value = false
  }
}

const searchCities = async (searchTerm) => {
  if (!searchTerm || searchTerm.length < 2) {
    cities.value = []
    return
  }

  isLoadingCities.value = true
  try {
    const response = await getCitiesPlacesCityCityNameGet({
      path: {city_name: searchTerm}
    })

    cities.value = (response.data || []).map(city => ({
      label: city.name,
      value: city.uuid
    }))
  } catch (error) {
    console.error('Error searching cities:', error)
    cities.value = []
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
    toast.add({
      title: 'Błąd',
      description: 'Nie udało się pobrać ról prawnych',
      color: 'error'
    })
  } finally {
    isLoadingRoles.value = false
  }
}

// ====================
// FORM HANDLERS
// ====================
const handleSubmit = async (event) => {
  isSubmitting.value = true
  showSuccessMessage.value = false

  try {
    const createData = buildCreatePayload(event.data)

    await createUserOfferOffersPost({
      body: createData
    })

    showSuccessMessage.value = true

    toast.add({
      title: 'Sukces',
      description: 'Oferta została dodana pomyślnie',
      color: 'success'
    })

    // Scroll to success message
    setTimeout(() => {
      const successElement = document.querySelector('.bg-green-50')
      successElement?.scrollIntoView({behavior: 'smooth', block: 'center'})
    }, 100)

  } catch (error) {
    console.error('Form submission error:', error)
    toast.add({
      title: 'Błąd',
      description: error.response?.data?.detail || 'Błąd podczas dodawania oferty',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

const handleFormError = (event) => {
  const element = document.getElementById(event.errors[0].id)
  element?.focus()
  element?.scrollIntoView({behavior: 'smooth', block: 'center'})
}

const buildCreatePayload = (data) => {
  const payload = {
    description: data.description,
    author: data.author,
    email: data.email,
    roles: data.roles || [],
    date: data.date || null,
    hour: data.hour || null,
    invoice: data.invoiceRequired || false,
    source: 'user'
  }

  if (data.placeCategory === 'court' && data.facility) {
    payload.place_name = data.facility.label
    payload.facility_uuid = data.facility.value
  } else if (data.placeCategory === 'other') {
    payload.place_name = data.place
    if (data.city) {
      payload.city_name = data.city.label
      payload.city_uuid = data.city.value
    }
  }

  return payload
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
})

// ====================
// META
// ====================
definePageMeta({
  title: 'Dodaj ofertę'
})

useSeoMeta({
  title: 'Dodaj nową ofertę',
  description: 'Formularz dodawania nowej oferty do systemu'
})
</script>