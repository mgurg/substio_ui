<template>
  <UContainer>
    <div :class="['grid grid-cols-1 gap-6', offer?.raw_data ? 'md:grid-cols-2' : '']">
      <!-- Left: Offer Details -->
      <div>
        <OfferDetailsView
            :offer="offer"
            :status="offerStatus"
            :is-loading="isLoading"
            :is-generating="isGenerating"
            @generate="generateData"
        >
          <template #after-content>
            <SimilarOffersList :offers="similarOffers"/>
          </template>
        </OfferDetailsView>

        <GeneratedDataPreview
            v-if="offer?.raw_data"
            :is-generating="isGenerating"
            :generated-data="generatedData"
            @copy="copyField"
        />
      </div>

      <!-- Right: Form -->
      <div>
        <h2 class="text-2xl font-bold mb-4">Formularz</h2>

        <UForm
            ref="formRef"
            :schema="validationSchema"
            :state="formData"
            @submit="handleSubmit"
            @error="handleFormError"
        >
          <RawOfferFormFields
              v-model:form-data="formData"
              v-model:facility-search="facilitySearch"
              :facilities="facilities"
              :is-loading-facilities="isLoadingFacilities"
              v-model:city-search="citySearch"
              :cities="cities"
              :is-loading-cities="isLoadingCities"
              :legal-roles="legalRoles"
              author-email-class="flex gap-4 items-end"
              date-time-class="flex gap-4 items-end"
              author-input-class="w-72"
              email-input-class="w-72"
              date-input-class="w-64"
              time-input-class="w-36"
              roles-field-group-size="lg"
              roles-field-group-class=""
              :is-submitting="isSubmitting"
              submit-label="Zaktualizuj ofertę"
              submit-loading-label="Zapisywanie..."
              actions-class="flex gap-2"
              :on-set-place-category="setPlaceCategory"
              :on-toggle-role="toggleRole"
              :on-reset="resetForm"
          >
            <template #extraFields>
              <RawOfferStatusPicker v-model="formData.status" />
              <UFormField label="Powiadomienie:" name="submitEmail">
                <UCheckbox
                    v-model="formData.submitEmail"
                    label="Wyślij mail"
                />
              </UFormField>
            </template>
          </RawOfferFormFields>
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
import SimilarOffersList from "~/components/SimilarOffersList.vue";
import GeneratedDataPreview from "~/components/GeneratedDataPreview.vue";
import OfferDetailsView from "~/components/OfferDetailsView.vue";
import {useFacilitiesLookup} from "@/composables/useFacilitiesLookup"
import {useCitiesLookup} from "@/composables/useCitiesLookup"
import {useLegalRoles} from "@/composables/useLegalRoles"
import RawOfferFormFields from "@/components/RawOfferFormFields.vue"
import RawOfferStatusPicker from "@/components/RawOfferStatusPicker.vue"
import {buildUpdatePayload, mapCityOption, mapFacilityOption} from "@/utils/offerForm"
import {
  offerGetRawOffer,
  offerGetSimilarOffersByUser,
  offerParseRawOffer,
  offerUpdateOffer,
  placeGetCity
} from "@/client/index.ts"

// ====================
// CONSTANTS & SETUP
// ====================
const route = useRoute()
const toast = useToast()
const uuid = route.params.uuid
const isDevelopment = process.env.NODE_ENV === 'development'

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
    invoiceRequired: yup.boolean(),
    submitEmail: yup.boolean()
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
const isLoadingSimilar = ref(false)
const similarOffers = ref([])

const isGenerating = ref(false)
const generatedData = ref(null)
const isSubmitting = ref(false)

// Form data with proper initial values
const formData = ref({
  status: 'active',
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
  invoiceRequired: false,
  submitEmail: false
})

const {
  facilitySearch,
  facilities,
  isLoadingFacilities,
  searchFacilities
} = useFacilitiesLookup({clearOnShort: false})

const {
  citySearch,
  cities,
  isLoadingCities,
  searchCities
} = useCitiesLookup({clearOnShort: false})

const {
  legalRoles,
  isLoadingRoles,
  fetchLegalRoles
} = useLegalRoles()


const offerStatus = ref('')

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
    status: 'active',
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
    invoiceRequired: false,
    submitEmail: false
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
    const response = await offerGetRawOffer({
      path: {offer_uuid: uuid}
    })

    if (response.data) {
      offer.value = response.data
      await populateFormWithOfferData(response.data)
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


const fetchSimilarOffers = async () => {
  isLoadingSimilar.value = true
  try {
    const response = await offerGetSimilarOffersByUser({
      path: {offer_uuid: uuid}
    })

    if (response.data) {
      similarOffers.value = response.data
    }
  } catch (error) {
    console.error('Error fetching similar offers:', error)
  } finally {
    isLoadingSimilar.value = false
  }
}

const generateData = async () => {
  isGenerating.value = true
  try {
    const response = await offerParseRawOffer({
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

const getCityByUuid = async (cityUuid) => {
  try {
    const response = await placeGetCity({
      path: {city_uuid: cityUuid}
    })
    return response.data
  } catch (error) {
    console.error('Error fetching city by UUID:', error)
    return null
  }
}

// ====================
// FORM HANDLERS
// ====================
const handleSubmit = async (event) => {
  isSubmitting.value = true

  try {
    const updateData = buildUpdatePayload(event.data)

    await offerUpdateOffer({
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

// ====================
// UTILITY METHODS
// ====================
const populateFormWithOfferData = async (offerData) => {
  if (offerData.status) formData.value.status = offerData.status
  if (offerData.author) formData.value.author = offerData.author
  if (offerData.description) formData.value.description = offerData.description
  if (offerData.email) formData.value.email = offerData.email
  if (offerData.date) formData.value.date = offerData.date
  if (offerData.hour) {
    // Convert HH:MM:SS to HH:MM for time input
    const hourStr = String(offerData.hour).trim()
    if (hourStr.length >= 5) {
      formData.value.hour = hourStr.substring(0, 5)
    } else {
      formData.value.hour = hourStr
    }
  }
  formData.value.invoiceRequired = offerData.invoice === true
  offerStatus.value = offerData.status

  if (offerData.place) {
    // --- Court branch ---
    formData.value.placeCategory = 'court'

    const placeName = offerData.place.name.toLowerCase()
    if (placeName.includes('rejonowy')) formData.value.placeType = 'SR'
    else if (placeName.includes('apelacyjny')) formData.value.placeType = 'SA'
    else if (placeName.includes('okręgowy')) formData.value.placeType = 'SO'
    const facilityOption = mapFacilityOption(offerData.place)
    formData.value.facility = facilityOption
    facilitySearch.value = offerData.place.name
    facilities.value = [facilityOption]
  } else if (offerData.city) {
    // --- Other branch ---
    formData.value.placeCategory = 'other'

    if (offerData.place_name) {
      formData.value.place = offerData.place_name
    }
    let cityData = offerData.city


    if (!cityData.voivodeship_name && cityData.uuid) {
      const completeCityData = await getCityByUuid(cityData.uuid)
      if (completeCityData) {
        cityData = completeCityData
      }
    }

    const cityOption = mapCityOption(cityData)
    formData.value.city = cityOption
    citySearch.value = cityData.name
    cities.value = [cityOption]
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

watch(() => formData.value.placeType, (newPlaceType, oldPlaceType) => {
  if (oldPlaceType && newPlaceType !== oldPlaceType) {
    formData.value.facility = null
  }
})

// ====================
// LIFECYCLE
// ====================
onMounted(() => {
  fetchLegalRoles()
  fetchOffer()
  fetchSimilarOffers()
})
</script>
