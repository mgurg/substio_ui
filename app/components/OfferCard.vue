<template>
  <UCard class="mt-5 hover:shadow-lg transition-shadow duration-200">
    <!-- Header with Place and Contact -->
    <template #header>
      <div class="flex justify-between items-start gap-4">
        <div class="flex-1 min-w-0">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate">
            {{ offer.place?.name }}
          </h2>
          <div v-if="offer.date" class="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <UIcon name="i-lucide-calendar" class="h-4 w-4 mr-1" />
            {{ offer.date }}
          </div>
        </div>

        <!-- Contact Button - Always Visible -->
        <div class="flex-shrink-0">
          <UButton
              v-if="offer.email"
              color="primary"
              icon="i-lucide-mail"
              size="md"
              class="font-medium"
              @click="sendEmail(offer.email)"
          >
            Kontakt
          </UButton>
          <UBadge v-else variant="soft" color="gray" size="lg" class="px-3 py-1">
            <UIcon name="i-lucide-lock" class="h-3 w-3 mr-1" />
            Tylko dla zarejestrowanych
          </UBadge>
        </div>
      </div>
    </template>

    <!-- Description -->
    <div class="mb-4">
      <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
        {{ offer.description }}
      </p>
    </div>

    <!-- Key Information -->
    <div class="space-y-3 mb-4">
      <!-- Author -->
      <div v-if="offer.author" class="flex items-center text-sm">
        <UIcon name="i-lucide-user" class="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
        <span class="font-medium text-gray-600 dark:text-gray-400 mr-2">Autor:</span>
        <span class="text-gray-900 dark:text-white">{{ offer.author }}</span>
      </div>

      <!-- Time -->
      <div v-if="offer.hour" class="flex items-center text-sm">
        <UIcon name="i-lucide-clock" class="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
        <span class="font-medium text-gray-600 dark:text-gray-400 mr-2">Godzina:</span>
        <span class="text-gray-900 dark:text-white">{{ offer.hour }}</span>
      </div>

      <!-- Legal Roles -->
      <div v-if="offer.legal_roles && offer.legal_roles.length > 0" class="flex items-start text-sm">
        <UIcon name="i-lucide-briefcase" class="h-4 w-4 mr-3 text-gray-500 flex-shrink-0 mt-0.5" />
        <div class="flex-1">
          <span class="font-medium text-gray-600 dark:text-gray-400 mr-2">Dla:</span>
          <div class="flex flex-wrap gap-2 mt-1">
            <UBadge
                v-for="role in offer.legal_roles"
                :key="role.uuid"
                variant="soft"
                color="blue"
                size="sm"
            >
              {{ role.name }}
            </UBadge>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer with Additional Info -->
    <div v-if="detailed && (offer.valid_to || offer.url)" class="border-t border-gray-200 dark:border-gray-700 pt-3 mt-4">
      <div class="flex flex-wrap gap-4 text-xs text-gray-500">
        <!-- Valid To -->
        <div v-if="offer.valid_to" class="flex items-center">
          <UIcon name="i-lucide-calendar-x" class="h-3 w-3 mr-1" />
          <span>Ważne do: {{ formatDate(offer.valid_to) }}</span>
        </div>

        <!-- External Link -->
        <div v-if="offer.url" class="flex items-center">
          <UIcon name="i-lucide-external-link" class="h-3 w-3 mr-1" />
          <a :href="offer.url" target="_blank" class="text-blue-600 hover:underline">
            Link zewnętrzny
          </a>
        </div>
      </div>
    </div>

    <!-- Urgent/Priority Indicator -->
    <div v-if="isUrgent" class="absolute top-3 left-3">
      <UBadge color="red" variant="solid" size="sm">
        <UIcon name="i-lucide-zap" class="h-3 w-3 mr-1" />
        Pilne
      </UBadge>
    </div>
  </UCard>
</template>

<script setup>
const props = defineProps({
  offer: {
    type: Object,
    required: true
  },
  detailed: {
    type: Boolean,
    default: false
  }
})

// Check if offer is urgent based on description keywords
const isUrgent = computed(() => {
  if (!props.offer.description) return false
  const urgentKeywords = ['pilne', 'natychmiast', 'jak najszybciej', 'срочно', 'urgent']
  return urgentKeywords.some(keyword =>
      props.offer.description.toLowerCase().includes(keyword.toLowerCase())
  )
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
.card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-hover:hover {
  transform: translateY(-2px);
}
</style>