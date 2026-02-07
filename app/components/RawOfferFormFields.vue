<template>
  <div class="space-y-6">
    <UFormField label="Kategoria:" name="placeCategory">
      <UFieldGroup>
        <UButton
          :variant="formData.placeCategory === 'court' ? 'solid' : 'outline'"
          color="primary"
          type="button"
          @click="onSetPlaceCategory('court')"
        >
          Sąd
        </UButton>
        <UButton
          :variant="formData.placeCategory === 'other' ? 'solid' : 'outline'"
          color="primary"
          type="button"
          @click="onSetPlaceCategory('other')"
        >
          Inne
        </UButton>
      </UFieldGroup>
    </UFormField>

    <template v-if="formData.placeCategory === 'court'">
      <UFormField label="Placówka:" name="facility" :required="requireFields">
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

    <template v-else-if="formData.placeCategory === 'other'">
      <UFormField label="Miejsce:" name="place" :required="requireFields">
        <UInput
          v-model="formData.place"
          placeholder="Podaj nazwę miejsca"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Miasto:" name="city" :required="requireFields">
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

    <UFormField label="Opis:" name="description" :required="requireFields">
      <UTextarea
        v-model="formData.description"
        placeholder="Wprowadź opis oferty"
        :rows="4"
        class="w-full"
      />
    </UFormField>

    <div :class="authorEmailClass">
      <UFormField label="Autor:" name="author" :required="requireFields">
        <UInput
          v-model="formData.author"
          placeholder="Wprowadź autora oferty"
          :class="authorInputClass"
        />
      </UFormField>

      <UFormField label="Email:" name="email" :required="requireFields">
        <UInput
          v-model="formData.email"
          type="email"
          placeholder="email@example.com"
          :class="emailInputClass"
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
      <UFieldGroup :size="rolesFieldGroupSize" :class="rolesFieldGroupClass">
        <UButton
          v-for="role in legalRoles"
          :key="role.value"
          :variant="formData.roles.includes(role.value) ? 'solid' : 'outline'"
          color="primary"
          type="button"
          :class="rolesButtonClass"
          @click="onToggleRole(role.value)"
        >
          {{ role.label }}
        </UButton>
      </UFieldGroup>
    </UFormField>

    <div :class="dateTimeClass">
      <UFormField label="Data:" name="date">
        <slot name="dateInput">
          <UInput
            v-model="formData.date"
            type="date"
            placeholder="Wybierz datę"
            :class="dateInputClass"
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
        </slot>
      </UFormField>

      <UFormField label="Godzina:" name="hour">
        <slot name="timeInput">
          <UInput
            v-model="formData.hour"
            type="time"
            placeholder="Wybierz godzinę"
            :class="timeInputClass"
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
        </slot>
      </UFormField>
    </div>

    <p v-if="showDateDescription" class="text-sm text-gray-500 dark:text-gray-400 -mt-2">
      {{ dateDescription }}
    </p>

    <UFormField label="Faktura:" name="invoiceRequired">
      <UCheckbox
        v-model="formData.invoiceRequired"
        label="Wymagana faktura"
      />
    </UFormField>

    <slot name="extraFields" />

    <div :class="actionsClass">
      <UButton
        type="submit"
        :loading="isSubmitting"
        :size="submitSize"
        :icon="submitIcon"
        :class="submitClass"
      >
        {{ isSubmitting ? submitLoadingLabel : submitLabel }}
      </UButton>

      <UButton
        v-if="showReset"
        variant="outline"
        type="button"
        :size="resetSize"
        :icon="resetIcon"
        :class="resetClass"
        @click="onReset"
      >
        {{ resetLabel }}
      </UButton>
    </div>
  </div>
</template>

<script setup>
const formData = defineModel("formData", {required: true})
const facilitySearch = defineModel("facilitySearch", {required: true})
const citySearch = defineModel("citySearch", {required: true})

defineProps({
  facilities: {type: Array, required: true},
  isLoadingFacilities: {type: Boolean, required: true},
  cities: {type: Array, required: true},
  isLoadingCities: {type: Boolean, required: true},
  legalRoles: {type: Array, required: true},
  requireFields: {type: Boolean, default: false},
  authorEmailClass: {type: String, default: "grid grid-cols-1 md:grid-cols-2 gap-4"},
  dateTimeClass: {type: String, default: "grid grid-cols-1 md:grid-cols-2 gap-4"},
  authorInputClass: {type: String, default: "w-full"},
  emailInputClass: {type: String, default: "w-full"},
  dateInputClass: {type: String, default: "w-full"},
  timeInputClass: {type: String, default: "w-full"},
  rolesFieldGroupClass: {type: String, default: "flex-wrap"},
  rolesFieldGroupSize: {type: String, default: "sm"},
  rolesButtonClass: {type: String, default: ""},
  isSubmitting: {type: Boolean, default: false},
  submitLabel: {type: String, default: "Zapisz"},
  submitLoadingLabel: {type: String, default: "Zapisywanie..."},
  submitIcon: {type: String, default: undefined},
  submitSize: {type: String, default: "md"},
  submitClass: {type: String, default: ""},
  resetLabel: {type: String, default: "Wyczyść formularz"},
  resetIcon: {type: String, default: undefined},
  resetSize: {type: String, default: "md"},
  resetClass: {type: String, default: ""},
  actionsClass: {type: String, default: "flex gap-2"},
  showReset: {type: Boolean, default: true},
  showDateDescription: {type: Boolean, default: false},
  dateDescription: {type: String, default: "Oferty bez podanej daty są ważne 7 dni"},
  onSetPlaceCategory: {type: Function, required: true},
  onToggleRole: {type: Function, required: true},
  onReset: {type: Function, required: true},
})
</script>
