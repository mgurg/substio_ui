<template>
  <UContainer>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Left: Offer Details -->
      <div>

        <h2 class="text-2xl font-bold mb-4"><UButton icon="i-lucide-arrow-left" class="mr-4" to="/raw">wróć</UButton> Dane oferty</h2>

        <USkeleton v-if="isLoading" class="h-32 w-full"/>

        <div v-else>
          <p><strong>UUID:</strong> {{ offer?.uuid }}</p>
          <p><strong>Author:</strong> {{ offer?.author }}</p>
          <p><strong>Raw Data:</strong></p>
          <p class="bg-gray-100 p-4 rounded">{{ offer?.raw_data }}</p>

          <UButton
              icon="i-lucide-rocket"
              class="mt-6"
              :loading="isGenerating"
              @click="generateData()"
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
                class="bg-green-50 border border-green-200 rounded-lg p-4">
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
                    class="flex items-center justify-between">
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
                    class="flex items-center justify-between">
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
                    class="flex items-center justify-between">
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
            :schema="schema"
            :state="formData"
            class="space-y-6"
            @submit="handleSubmit"

        >
          <!-- Place Type Selection -->
          <UFormField
              label="Typ sądu:"
              name="placeType"
              :error="errors.placeType"
          >
            <UButtonGroup>
              <UButton
                  :variant="formData.placeType === 'SR' ? 'solid' : 'outline'"
                  color="primary"
                  type="button"
                  @click="togglePlaceType('SR')"
              >
                Rejonowy
              </UButton>
              <UButton
                  :variant="formData.placeType === 'SA' ? 'solid' : 'outline'"
                  color="primary"
                  type="button"
                  @click="togglePlaceType('SA')"
              >
                Apelacyjny
              </UButton>
              <UButton
                  :variant="formData.placeType === 'SO' ? 'solid' : 'outline'"
                  color="primary"
                  type="button"
                  @click="togglePlaceType('SO')"
              >
                Okręgowy
              </UButton>
            </UButtonGroup>
          </UFormField>

          <!-- Facility Search -->
          <UFormField
              label="Placówka:"
              name="facility"
              :error="errors.facility"
          >
            <USelectMenu
                v-model="formData.facility"
                v-model:search-term="facilitySearch"
                :items="facilities"
                :loading="isLoadingFacilities"
                placeholder="Wyszukaj placówkę"
                icon="i-lucide-building"
                class="w-full"
                searchable
            />
          </UFormField>

          <!-- Author -->
          <UFormField
              label="Autor:"
              name="author"
              :error="errors.author"
          >
            <UInput
                v-model="formData.author"
                placeholder="Wprowadź autora oferty"
                class="w-full"
            />
          </UFormField>

          <!-- Description -->
          <UFormField
              label="Opis:"
              name="description"
              :error="errors.description"
          >
            <UTextarea
                v-model="formData.description"
                placeholder="Wprowadź opis oferty"
                class="w-full"
                :rows="4"
            />
          </UFormField>

          <UFormField label="Email" name="email">
            <UInput v-model="formData.email" type="email" class="w-72" placeholder="email@example.com"/>
          </UFormField>

          <!-- Legal Roles -->
          <UFormField
              label="Role prawne:"
              name="roles"
              :error="errors.roles"
          >
            <UButtonGroup>
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
            </UButtonGroup>
          </UFormField>

          <!-- Date and Hour -->
          <div class="flex gap-4 items-end">
            <UFormField
                label="Data:"
                name="date"
                :error="errors.date"
            >
              <UInput
                  v-model="formData.date"
                  type="date"
                  placeholder="Wybierz datę"
                  class="w-36"
                  :ui="{ trailing: 'pe-1' }"
              >
                <template #trailing>
                  <UButton
                      color="neutral"
                      variant="link"
                      size="sm"
                      icon="i-lucide-circle-x"
                      aria-label="Clear input"
                      @click="formData.date = null"
                  />
                </template>
              </uinput>
            </UFormField>

            <UFormField
                label="Godzina:"
                name="hour"
                :error="errors.hour"
            >
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
                      aria-label="Clear input"
                      @click="formData.hour = null"
                  />
                </template>
              </UInput>
            </UFormField>

          </div>
          <!-- Submit Button -->
          <div class="flex gap-2">
            <UButton
                type="submit"
                :loading="isSubmitting"
            >
              {{ isSubmitting ? 'Zapisywanie...' : 'Zaktualizuj ofertę' }}
            </UButton>

            <UButton
                variant="outline"
                type="button"
                @click="resetForm"
            >
              Wyczyść formularz
            </UButton>
          </div>

          <!-- Debug Info (remove in production) -->
          <div v-if="isDevelopment" class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="font-semibold mb-2">Debug Info:</h3>
            <pre class="text-xs">{{
                JSON.stringify({
                  formData,
                  errors,
                  isFormValid
                }, null, 2)
              }}</pre>
          </div>
        </UForm>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import {useRoute} from 'vue-router'
import {
  getFacilitiesPlacesFacilityPlaceNameGet,
  getLegalRolesOffersLegalRolesGet,
  getRawOfferOffersRawOfferUuidGet,
  parseRawOffersParseOfferUuidGet,
  type ParseResponse,
  type RawOfferIndexResponse,
  updateOfferOffersOfferUuidPatch
} from '~/client'
import {computed, onMounted, ref, watch} from 'vue'
import * as yup from 'yup'

const route = useRoute()
const toast = useToast()
const uuid = route.params.uuid as string

// Validation Schema
const schema = yup.object({
  placeType: yup
      .string()
      .oneOf(['SR', 'SA', 'SO'], 'Wybierz typ sądu'),
  facility: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.string().required()
      })
      .nullable(),
  author: yup
      .string(),
  description: yup
      .string(),
  email: yup
      .string(),
  roles: yup
      .array()
      .of(yup.string().required()),
  date: yup
      .string()
      .nullable(),
  // .matches(/^\d{4}-\d{2}-\d{2}$/, 'Nieprawidłowy format daty'),
  hour: yup
      .string()
      .nullable(),
  // .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Nieprawidłowy format godziny'),
})

// Constants
const isDevelopment = process.env.NODE_ENV === 'development'

const offer = ref<RawOfferIndexResponse>()
const isLoading = ref(false)
const isGenerating = ref(false)
const generatedData = ref<ParseResponse | null>(null)

// Form state
const formRef = ref()
const formData = ref({
  placeType: undefined,
  facility: null,
  author: null,
  description: null,
  email: null,
  roles: [],
  date: null,
  hour: null
})

const errors = ref({})
const isSubmitting = ref(false)

// Facilities state
const facilitySearch = ref('')
const facilities = ref([])
const isLoadingFacilities = ref(false)

// Legal roles state
const legalRoles = ref([])
const isLoadingRoles = ref(false)

// Computed properties
const isFormValid = computed(() => {
  try {
    schema.validateSync(formData.value)
    return true
  } catch {
    return false
  }
})

// Helper function to populate form with offer data
const populateFormWithOfferData = (offerData: RawOfferIndexResponse) => {
  // Populate author
  if (offerData.author) {
    formData.value.author = offerData.author
  }

  // Populate description
  if (offerData.description) {
    formData.value.description = offerData.description
  }

  // Populate email
  if (offerData.email) {
    formData.value.email = offerData.email
  }

  // Populate place/facility
  if (offerData.place) {
    formData.value.facility = {
      label: offerData.place.name,
      value: offerData.place.uuid
    }
    facilitySearch.value = offerData.place.name

    // Try to determine place type from the place name
    const placeName = offerData.place.name.toLowerCase()
    if (placeName.includes('rejonowy')) {
      formData.value.placeType = 'SR'
    } else if (placeName.includes('apelacyjny')) {
      formData.value.placeType = 'SA'
    } else if (placeName.includes('okręgowy')) {
      formData.value.placeType = 'SO'
    }
  }

  // Populate legal roles
  if (offerData.legal_roles && offerData.legal_roles.length > 0) {
    formData.value.roles = offerData.legal_roles.map(role => role.uuid)
  }

  if (offerData.date) {
    formData.value.date = offerData.date
  }

  if (offerData.hour) {
    formData.value.hour = offerData.hour
  }
}

const fetchOffer = async () => {
  isLoading.value = true

  const response = await getRawOfferOffersRawOfferUuidGet({
    path: {offer_uuid: uuid},
  })

  if (response.data) {
    offer.value = response.data

    // Populate form with the fetched offer data
    populateFormWithOfferData(response.data)
  }

  isLoading.value = false
}

const generateData = async () => {
  isGenerating.value = true

  try {
    const response = await parseRawOffersParseOfferUuidGet({
      path: {offer_uuid: uuid},
    })

    if (response.data) {
      generatedData.value = response.data as ParseResponse
      console.log('Generated data:', response.data)

      if (response.data.success) {
        toast.add({
          title: 'Sukces',
          description: 'Dane zostały wygenerowane pomyślnie',
          color: 'success'
        });
      } else {
        toast.add({
          title: 'Błąd',
          description: response.data.error || 'Nie udało się wygenerować danych',
          color: 'error'
        });
      }
    }
  } catch (error) {
    console.error('Error generating data:', error)
    toast.add({
      title: 'Błąd',
      description: 'Wystąpił błąd podczas generowania danych',
      color: 'error'
    });
  } finally {
    isGenerating.value = false
  }
}

// Enhanced function to copy individual fields with better mapping
const copyField = (fieldName: string, value: string) => {
  if (!value) return

  // Map generated data fields to form fields
  switch (fieldName) {
    case 'place_type':
      // Map place type abbreviations
      if (value.toLowerCase().includes('rejonowy')) {
        formData.value.placeType = 'SR'
      } else if (value.toLowerCase().includes('apelacyjny')) {
        formData.value.placeType = 'SA'
      } else if (value.toLowerCase().includes('okręgowy')) {
        formData.value.placeType = 'SO'
      }
      break
    case 'place_name':
      // For facility, we need to set both the search term and create a facility object
      facilitySearch.value = value
      formData.value.facility = {label: value, value: value}
      break
    case 'description':
      formData.value.description = value
      break
    case 'date':
      // Convert date format if needed (e.g., from "31.07.2025" to "2025-07-31")
      try {
        if (value.includes('.')) {
          const [day, month, year] = value.split('.')
          formData.value.date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        } else {
          formData.value.date = value
        }
      } catch (e) {
        formData.value.date = value
      }
      break
    case 'time':
      // Convert time format if needed
      formData.value.hour = value.replace('.', ':')
      break
    case 'legal_roles':
      // This would need mapping between role names and UUIDs
      // You might need to match against the loaded legalRoles
      break
    case 'email':
      formData.value.email = value
      break
  }
}

// Methods
const togglePlaceType = (type) => {
  formData.value.placeType = formData.value.placeType === type ? undefined : type
  formData.value.facility = null
  clearFieldError('placeType')
}

const toggleRole = (roleValue) => {
  if (formData.value.roles.includes(roleValue)) {
    formData.value.roles = formData.value.roles.filter(r => r !== roleValue)
  } else {
    formData.value.roles = [...formData.value.roles, roleValue]
  }
  clearFieldError('roles')
}

const clearFieldError = (field) => {
  if (errors.value[field]) {
    const {[field]: _, ...newErrors} = errors.value
    errors.value = newErrors
  }
}

const resetForm = () => {
  formData.value = {
    placeType: undefined,
    facility: null,
    author: '',
    description: '',
    email: '',
    roles: [],
    date: '',
    hour: ''
  }
  errors.value = {}
  facilitySearch.value = ''
  facilities.value = []
}

// API calls
const searchFacilities = async (searchTerm, placeType) => {
  if (!searchTerm || searchTerm.length < 2) {
    return
  }

  isLoadingFacilities.value = true
  try {
    const queryParams = {}
    if (placeType) {
      queryParams.place_type = placeType
    }

    const response = await getFacilitiesPlacesFacilityPlaceNameGet({
      path: {place_name: searchTerm},
      query: queryParams
    })

    const data = response.data

    facilities.value = (data ?? []).map((facility) => ({
      label: facility.name,
      value: facility.uuid
    }))
  } catch (error) {
    console.error('Error searching facilities:', error)
    toast.add({
      title: 'Błąd',
      description: 'Błąd podczas wyszukiwania placówek',
      color: 'error'
    });
  } finally {
    isLoadingFacilities.value = false
  }
}

const fetchLegalRoles = async () => {
  isLoadingRoles.value = true
  try {
    const {data} = await getLegalRolesOffersLegalRolesGet()
    if (data) {
      legalRoles.value = data.map((role) => ({
        label: role.name,
        value: role.uuid
      }))
    }
  } catch (error) {
    console.error('Error fetching legal roles:', error)
    toast.add({
      title: 'Błąd',
      description: 'Błąd podczas pobierania ról prawnych',
      color: 'error'
    });
  } finally {
    isLoadingRoles.value = false
  }
}

const updateOffer = async (validatedData) => {
  try {
    const body: any = {}

    if (validatedData.description) body.description = validatedData.description
    if (validatedData.roles?.length) body.roles = validatedData.roles
    if (validatedData.date) body.date = validatedData.date
    if (validatedData.hour) body.hour = validatedData.hour
    if (validatedData.facility?.label) body.place_name = validatedData.facility.label
    if (validatedData.facility?.value) body.place_uuid = validatedData.facility.value
    if (validatedData.author) body.author = validatedData.author
    if (validatedData.email) body.email = validatedData.email
    body.status = 'accepted'

    await updateOfferOffersOfferUuidPatch({
      path: {offer_uuid: uuid},
      body
    })

    toast.add({
      title: 'Sukces',
      description: 'Oferta została zaktualizowana pomyślnie',
      color: 'success'
    });
  } catch (error) {
    console.error('Error updating offer:', error)
    throw error // Re-throw to be handled by form submit
  }
}

// Event handlers
const handleSubmit = async (event) => {
  isSubmitting.value = true
  errors.value = {}

  try {
    await updateOffer(event.data)
  } catch (error) {
    console.error('Form submission error:', error)
    toast.add({
      title: 'Błąd',
      description: 'Błąd podczas aktualizacji oferty',
      color: 'error'
    });
  } finally {
    isSubmitting.value = false
  }
}

const onError = (event) => {
  const element = document.getElementById(event.errors[0].id)
  element?.focus()
  element?.scrollIntoView({behavior: 'smooth', block: 'center'})
}

// Watchers
watch([facilitySearch, () => formData.value.placeType],
    ([newSearch, newPlaceType]) => {
      searchFacilities(newSearch, newPlaceType)
    }
)

// Clear facility when place type changes
watch(() => formData.value.placeType, () => {
  formData.value.facility = null
})

// Lifecycle
onMounted(() => {
  fetchLegalRoles()
  fetchOffer()
})
</script>