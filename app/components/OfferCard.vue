<template>
  <UCard class="mt-5 hover:shadow-lg transition-shadow duration-200">
    <!-- Header with Place and Contact -->
    <template #header>
      <div class="flex justify-between items-start gap-4">
        <div class="flex-1 min-w-0">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate">
            {{ offer.place_name }}
          </h2>
          <div v-if="offer.date || offer.hour" class="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <UIcon v-if="offer.date" name="i-lucide-calendar" class="h-4 w-4 mr-1" />
            <span v-if="offer.date">{{ offer.date }}</span>

            <template v-if="offer.date && offer.hour">
              <span class="mx-2">•</span>
            </template>

            <UIcon v-if="offer.hour" name="i-lucide-clock" class="h-4 w-4 mr-1 text-gray-500 flex-shrink-0" />
            <span v-if="offer.hour" class="text-gray-900 dark:text-white">{{ offer.hour }}</span>

            <!-- Urgent Badge Inline -->
            <UBadge v-if="isUrgent" color="warning" variant="solid" size="md" class="ml-2">
              <UIcon name="i-lucide-zap" class="h-3 w-3 mr-1" />
              Pilne
            </UBadge>
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
              @click="sendEmail(offer.email, offer.place_name)"
          >
            <span class="hidden sm:inline">Kontakt</span>
          </UButton>
          <UBadge v-else variant="soft" icon="i-lucide-lock" color="gray" size="lg" class="px-3 py-1">
            <span class="hidden sm:inline">Kontakt dla zalogowanych</span>
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
    <div class="mb-4">
      <!-- Time and Legal Roles in one line on desktop -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <!-- Legal Roles - More prominent -->
        <div v-if="offer.legal_roles && offer.legal_roles.length > 0" class="flex items-center gap-2">
          <UIcon name="i-lucide-briefcase" class="h-4 w-4 text-blue-600 flex-shrink-0" />
          <div class="flex flex-wrap gap-2">
            <UBadge
                v-for="role in offer.legal_roles"
                :key="role.uuid"
                variant="soft"
                color="neutral"
                size="md"
                class="font-medium"
            >
              {{ role.name }}
            </UBadge>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer with Additional Info -->
    <div v-if="detailed && (offer.valid_to || offer.url || offer.author)" class="border-t border-gray-200 dark:border-gray-700 pt-3 mt-4">
      <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <!-- Author -->
        <div v-if="offer.author" class="flex items-center">
          <UIcon name="i-lucide-user" class="h-3 w-3 mr-1" />
          <span>{{ offer.author }}</span>
        </div>

        <!-- Valid To -->
        <div v-if="offer.valid_to" class="flex items-center">
          <UIcon name="i-lucide-calendar-x" class="h-3 w-3 mr-1" />
          <span>Ważne do: {{ formatDate(offer.valid_to) }}</span>
        </div>

        <!-- External Link -->
<!--        <div v-if="offer.url" class="flex items-center">-->
<!--          <UIcon name="i-lucide-external-link" class="h-3 w-3 mr-1" />-->
<!--          <a :href="offer.url" target="_blank" class="text-blue-600 hover:underline">-->
<!--            Link zewnętrzny-->
<!--          </a>-->
<!--        </div>-->
      </div>
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

// Check if the offer is urgent based on description keywords
const isUrgent = computed(() => {
  if (!props.offer.description) return false
  const urgentKeywords = ['pilne', 'natychmiast', 'jak najszybciej']
  return urgentKeywords.some(keyword =>
      props.offer.description.toLowerCase().includes(keyword.toLowerCase())
  )
})

const sendEmail = (email, offer) => {
  const subject = `Zastępstwo procesowe w ${offer.place?.name ?? ''}`
  const body = `Dzień dobry,\n\nPiszę w sprawie oferty dotyczącej ${offer.place?.name ?? ''}.\n\n`

  const encodedSubject = encodeURIComponent(subject)
  const encodedBody = encodeURIComponent(body)

  window.location.href = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`
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