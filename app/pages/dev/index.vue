<template>
  <UContainer>
    <UCard>
      <template #header>
        <h1 class="text-4xl font-extrabold">Nowe oferty</h1>
      </template>

      <UForm
          ref="formRef"
          :schema="schema"
          :state="formData"
          class="space-y-6"
          @submit="handleSubmit"
          @error="onError"
      >
        <!-- Place Type Selection -->
        <UFormField
            label="Typ sądu:"
            name="placeType"
            :error="errors.placeType"
        >
          <UFieldGroup>
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
          </UFieldGroup>
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
              class="w-72"
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
              class="w-72"
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
              class="w-72"
              :rows="4"
          />
        </UFormField>

        <!-- Legal Roles -->
        <UFormField
            label="Role prawne:"
            name="roles"
            :error="errors.roles"
        >
          <UFieldGroup>
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

        <!-- Date -->
        <UFormField
            label="Data:"
            name="date"
            :error="errors.date"
        >
          <UInput
              v-model="formData.date"
              type="date"
              placeholder="Wybierz datę"
              class="w-72"
          />
        </UFormField>

        <!-- Hour -->
        <UFormField
            label="Godzina:"
            name="hour"
            :error="errors.hour"
        >
          <UInput
              v-model="formData.hour"
              type="time"
              placeholder="Wybierz godzinę"
              class="w-72"
          />
        </UFormField>

        <!-- Submit Button -->
        <div class="flex gap-2">
          <UButton
              type="submit"
              :loading="isSubmitting"
              :disabled="!isFormValid"
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
    </UCard>
  </UContainer>
</template>

<script setup>
import {computed, onMounted, ref, watch} from 'vue'
import * as yup from 'yup'
import {
  getFacilitiesPlacesFacilityPlaceNameGet,
  getLegalRolesOffersLegalRolesGet,
  updateOfferOffersOfferUuidPatch
} from "@/client/index.ts"

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
      .nullable()
      .required('Placówka jest wymagana'),
  author: yup
      .string()
      .min(2, 'Autor musi mieć co najmniej 2 znaki')
      .max(100, 'Autor nie może przekraczać 100 znaków')
      .required('Autor jest wymagany'),
  description: yup
      .string()
      .min(10, 'Opis musi mieć co najmniej 10 znaków')
      .max(1000, 'Opis nie może przekraczać 1000 znaków')
      .required('Opis jest wymagany'),
  roles: yup
      .array()
      .of(yup.string().required())
      .min(1, 'Wybierz co najmniej jedną rolę prawną')
      .required('Role prawne są wymagane'),
  date: yup
      .string()
      .matches(/^\d{4}-\d{2}-\d{2}$/, 'Nieprawidłowy format daty')
      .test('future-date', 'Data nie może być wcześniejsza niż dzisiaj', (value) => {
        if (!value) return false
        try {
          const inputDate = new Date(value)
          const today = new Date()
          today.setHours(0, 0, 0, 0) // Reset time to start of day
          return inputDate >= today
        } catch {
          return false
        }
      })
      .required('Data jest wymagana'),
  hour: yup
      .string()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Nieprawidłowy format godziny')
      .required('Godzina jest wymagana')
})

// Constants
const OFFER_UUID = '74cc0dfe-23b7-4820-85e1-e5697f34ea79'
const isDevelopment = process.env.NODE_ENV === 'development'

// Form state
const formRef = ref()
const formData = ref({
  placeType: undefined,
  facility: null,
  author: '',
  description: '',
  roles: [],
  date: new Date().toISOString().split('T')[0], // Today's date as default
  hour: '15:00'
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

const toggleRole = (roleValue) => {
  if (formData.value.roles.includes(roleValue)) {
    formData.value.roles = formData.value.roles.filter(r => r !== roleValue)
  } else {
    formData.value.roles = [...formData.value.roles, roleValue]
  }
  clearFieldError('roles')
}

// Computed properties
const isFormValid = computed(() => {
  try {
    schema.validateSync(formData.value)
    return true
  } catch {
    return false
  }
})

// Methods
const togglePlaceType = (type) => {
  formData.value.placeType = formData.value.placeType === type ? undefined : type
  formData.value.facility = null
  clearFieldError('placeType')
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
    roles: [],
    date: new Date().toISOString().split('T')[0],
    hour: '15:00'
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
    // You could add toast notification here
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
    // You could add toast notification here
  } finally {
    isLoadingRoles.value = false
  }
}

const updateOffer = async (validatedData) => {
  try {
    await updateOfferOffersOfferUuidPatch({
      path: {offer_uuid: OFFER_UUID},
      body: {
        description: validatedData.description,
        roles: validatedData.roles,
        date: validatedData.date,
        hour: validatedData.hour,
        place_name: validatedData.facility?.label,
        place_uuid: validatedData.facility?.value,
      }
    })

    // You could add success toast notification here
    console.log('Offer updated successfully')
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
    // You could add success notification or redirect here
  } catch (error) {
    console.error('Form submission error:', error)
    // You could add error notification here
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

// Clear field errors when the user starts typing
// watch(() => formData.value.author, () => clearFieldError('author'))
// watch(() => formData.value.description, () => clearFieldError('description'))
// watch(() => formData.value.roles, () => clearFieldError('roles'))
// watch(() => formData.value.date, () => clearFieldError('date'))
// watch(() => formData.value.hour, () => clearFieldError('hour'))
// watch(() => formData.value.facility, () => clearFieldError('facility'))

// Lifecycle
onMounted(() => {
  fetchLegalRoles()
})
</script>

<style scoped>
</style>