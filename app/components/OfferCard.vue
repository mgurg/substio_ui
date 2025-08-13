<template>
  <UCard :variant="variant" class="mt-5">
    <template #header>
      <div class="flex justify-between items-start">
        <h2 class="text-3xl">{{ offer.place?.name }}</h2>

        <!-- Email Button or Registration Notice (only in detailed mode) -->
        <div v-if="detailed" class="ml-4">
          <UButton
              v-if="offer.email"
              color="primary"
              icon="i-lucide-mail"
              size="sm"
              @click="sendEmail(offer.email)"
          >
            Napisz email
          </UButton>
          <div v-else class="text-sm text-gray-500 italic">
            Tylko dla zarejestrowanych użytkowników
          </div>
        </div>
      </div>
    </template>

    <div :class="detailed ? 'mb-4' : 'mb-3'">
      <p :class="detailed ? 'text-gray-700' : ''">{{ offer.description }}</p>
    </div>

    <!-- Offer Details Grid -->
    <div 
        :class="[
          'grid grid-cols-1 md:grid-cols-2 gap-2 text-sm p-3 rounded-lg',
          detailed ? 'gap-3 p-4 bg-gray-100 dark:bg-gray-800' : ''
        ]"
    >
      <div v-if="offer.date" class="flex items-center">
        <UIcon 
            :class="['mr-2 h-4 w-4', detailed ? 'text-gray-600' : '']" 
            name="i-lucide-calendar"
        />
        <strong class="mr-2">Data:</strong> {{ offer.date }}
      </div>

      <div v-if="offer.hour" class="flex items-center">
        <UIcon 
            :class="['mr-2 h-4 w-4', detailed ? 'text-gray-600' : '']" 
            name="i-lucide-clock"
        />
        <strong class="mr-2">Godzina:</strong> {{ offer.hour }}
      </div>

      <div v-if="offer.author" class="flex items-center">
        <UIcon 
            :class="['mr-2 h-4 w-4', detailed ? 'text-gray-600' : '']" 
            name="i-lucide-user"
        />
        <strong class="mr-2">Autor:</strong> {{ offer.author }}
      </div>

      <div v-if="offer.place?.name" class="flex items-center">
        <UIcon 
            :class="['mr-2 h-4 w-4', detailed ? 'text-gray-600' : '']" 
            name="i-lucide-map-pin"
        />
        <strong class="mr-2">Miejsce:</strong> {{ offer.place.name }}
      </div>

      <!-- Legal Roles (only in detailed mode) -->
      <div v-if="detailed && offer.legal_roles && offer.legal_roles.length > 0" class="flex items-center">
        <UIcon class="mr-2 h-4 w-4 text-gray-600" name="i-lucide-briefcase"/>
        <strong class="mr-2">Dla:</strong>
        <UBadge
            v-for="role in offer.legal_roles"
            :key="role.uuid"
            variant="soft"
            color="blue"
        >
          {{ role.name }}
        </UBadge>
      </div>

      <!-- Valid To (only in detailed mode) -->
      <div v-if="detailed && offer.valid_to" class="flex items-center">
        <UIcon class="mr-2 h-4 w-4 text-gray-600" name="i-lucide-calendar-x"/>
        <strong class="mr-2">Ważne do:</strong> {{ formatDate(offer.valid_to) }}
      </div>

      <!-- URL (only in detailed mode) -->
      <div v-if="detailed && offer.url" class="flex items-center">
        <UIcon class="mr-2 h-4 w-4 text-gray-600" name="i-lucide-external-link"/>
        <strong class="mr-2">Link:</strong>
        <a :href="offer.url" target="_blank" class="text-blue-600 hover:underline">
          Otwórz link
        </a>
      </div>
    </div>
  </UCard>
</template>

<script setup>
defineProps({
  offer: {
    type: Object,
    required: true
  },
  detailed: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'subtle'
  }
})

const sendEmail = (email) => {
  window.location.href = `mailto:${email}`
}

const formatDate = (dateString) => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}
</script>

<style scoped>
</style>