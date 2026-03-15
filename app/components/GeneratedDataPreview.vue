<template>
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
          class="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
      >
        <h3 class="font-semibold text-green-800 dark:text-green-300 mb-3">Dane zostały wygenerowane pomyślnie:</h3>

        <div class="space-y-3 text-sm">
          <div v-if="generatedData.data.location" class="flex items-center justify-between">
            <div>
              <strong>Lokalizacja:</strong> {{ generatedData.data.location }}
            </div>
            <UButton
                icon="i-lucide-copy"
                size="xs"
                variant="outline"
                @click="$emit('copy', 'place_type', generatedData.data.location)"
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
                @click="$emit('copy', 'place_name', generatedData.data.location_full_name)"
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
                @click="$emit('copy', 'date', generatedData.data.date.join(', '))"
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
                @click="$emit('copy', 'time', generatedData.data.time.join(', '))"
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
                @click="$emit('copy', 'description', generatedData.data.description)"
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
                @click="$emit('copy', 'legal_roles', generatedData.data.legal_roles.join(', '))"
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
                @click="$emit('copy', 'email', generatedData.data.email)"
            >
              Kopiuj
            </UButton>
          </div>
        </div>
      </div>

      <div v-else-if="!generatedData.success" class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h3 class="font-semibold text-red-800 dark:text-red-300 mb-2">Błąd podczas generowania:</h3>
        <p class="text-red-700 dark:text-red-400 text-sm">{{ generatedData.error || 'Nieznany błąd' }}</p>
      </div>
    </div>

    <div v-else class="text-gray-500 text-sm">
      Kliknij "Generuj" aby wygenerować dane z surowych danych oferty.
    </div>
  </div>
</template>

<script setup>
defineProps({
  isGenerating: Boolean,
  generatedData: Object
})

defineEmits(['copy'])
</script>
