<template>
  <UContainer>
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="flex items-center text-3xl font-bold mb-2 gap-4">
          <UButton icon="i-lucide-arrow-left" to="/raw" variant="outline">wróć</UButton>
          <span class="flex-1">Dodaj surową ofertę</span>
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Wypełnij formularz, aby utworzyć surową ofertę w systemie.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left Column - Form -->
        <div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-6 py-4">
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
                    label="Placówka:"
                    name="facility"
                    required
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
                    required
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
                    required
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
              <UFormField label="Opis:" name="description" required>
                <UTextarea
                    v-model="formData.description"
                    placeholder="Wprowadź opis oferty"
                    :rows="4"
                    class="w-full"
                />
              </UFormField>

              <!-- Author and Email -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="Autor:" name="author" required>
                  <UInput
                      v-model="formData.author"
                      placeholder="Wprowadź autora oferty"
                      class="w-full"
                  />
                </UFormField>

                <UFormField label="Email:" name="email" required>
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
                <UFieldGroup size="sm" class="flex-wrap">
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
                </UFieldGroup>
              </UFormField>

              <!-- Date and Time -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="Data:" name="date">
                  <UInputDate ref="inputDate" v-model="formData.date" :min-value="minDate" class="w-full">
                    <template #trailing>
                      <UPopover :reference="inputDate?.inputsRef?.[3]?.$el">
                        <UButton
                            color="neutral"
                            variant="link"
                            size="sm"
                            icon="i-lucide-calendar"
                            aria-label="Wybierz datę"
                            class="px-0"
                        />
                        <template #content>
                          <UCalendar v-model="formData.date" :min-value="minDate" class="p-2"/>
                        </template>
                      </UPopover>
                    </template>
                  </UInputDate>
                </UFormField>

                <UFormField label="Godzina:" name="hour">
                  <UInputTime v-model="formData.hour" class="w-full" />
                </UFormField>
              </div>

              <!-- Date Description -->
              <p class="text-sm text-gray-500 dark:text-gray-400 -mt-2">
                Oferty bez podanej daty są ważne 7 dni
              </p>

              <!-- Invoice Checkbox -->
              <UFormField label="Faktura:" name="invoiceRequired">
                <UCheckbox
                    v-model="formData.invoiceRequired"
                    label="Wymagana faktura"
                />
              </UFormField>

              <!-- Submit Buttons -->
              <div class="flex flex-col gap-3 pt-4">
                <UButton
                    type="submit"
                    :loading="isSubmitting"
                    size="lg"
                    icon="i-lucide-plus"
                    class="w-full"
                >
                  {{ isSubmitting ? 'Dodawanie...' : 'Dodaj ofertę' }}
                </UButton>

                <UButton
                    variant="outline"
                    type="button"
                    size="lg"
                    icon="i-lucide-refresh-cw"
                    class="w-full"
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
              class="bg-green-50 border border-green-200 rounded-lg p-4 mt-6"
          >
            <div class="flex items-center">
              <UIcon name="i-lucide-check-circle" class="text-green-600 mr-3" size="20"/>
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

        <!-- Right Column - Scratchpad -->
        <div class="lg:sticky lg:top-4 lg:self-start">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-6 py-4">
            <h2 class="text-lg font-semibold mb-3">Notatki</h2>
            <UTextarea
                v-model="scratchpad"
                placeholder="Wklej tymczasowe dane..."
                :rows="12"
                class="w-full"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Pole pomocnicze, nie jest wysyłane razem z formularzem.
            </p>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup>
import {getLocalTimeZone, today} from '@internationalized/date'
import {computed, onMounted, ref, watch} from 'vue'
import * as yup from 'yup'
import {offerCreateOffer} from "@/client/index.ts"
import {useOfferLookups} from "@/composables/useOfferLookups"
import {buildCreatePayload} from "@/utils/offerForm"

// ====================
// CONSTANTS & SETUP
// ====================
const toast = useToast()

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
    date: yup.mixed().nullable(),
    hour: yup.mixed().nullable(),
    invoiceRequired: yup.boolean()
  }

  if (formData.value.placeCategory === 'court') {
    return yup.object({
      ...baseSchema,
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
const scratchpad = ref('')
const inputDate = ref(null)
const minDate = today(getLocalTimeZone())

// Form data with proper initial values
const formData = ref({
  placeCategory: 'court',
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

const {
  facilitySearch,
  facilities,
  isLoadingFacilities,
  citySearch,
  cities,
  isLoadingCities,
  legalRoles,
  isLoadingRoles,
  searchFacilities,
  searchCities,
  fetchLegalRoles
} = useOfferLookups({
  onRolesError: () => {
    toast.add({
      title: 'Błąd',
      description: 'Nie udało się pobrać ról prawnych',
      color: 'error'
    })
  }
})

// ====================
// FORM METHODS
// ====================
const setPlaceCategory = (category) => {
  formData.value.placeCategory = category
  if (category === 'court') {
    formData.value.place = ''
    formData.value.city = null
    citySearch.value = ''
    cities.value = []
  } else if (category === 'other') {
    formData.value.facility = null
    facilitySearch.value = ''
    facilities.value = []
  }

  showSuccessMessage.value = false
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
// FORM HANDLERS
// ====================
const handleSubmit = async (event) => {
  isSubmitting.value = true
  showSuccessMessage.value = false

  try {
    const createData = buildCreatePayload(event.data, {
      source: 'bot',
      dateSerializer: (value) => (value ? value.toString() : null),
      hourSerializer: (value) => (value ? value.toString().slice(0, 5) : null)
    })
    await offerCreateOffer({
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

// ====================
// WATCHERS
// ====================
watch(facilitySearch, (searchTerm) => {
  searchFacilities(searchTerm)
})

watch(citySearch, (searchTerm) => {
  searchCities(searchTerm)
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
  title: 'Dodaj ogłoszenie – substytucje + post na Facebooka',
  description: 'Opublikuj ogłoszenie o substytucji procesowej i automatycznie wygeneruj post na Facebooka. Szybko, skutecznie, bez formalności.'
})
</script>
