<template>
  <UCard>
    <!-- Header -->
    <template #header>
      <div class="flex justify-between items-start gap-4">
        <div class="flex-1 min-w-0">
          <h2 class="text-xl font-bold  mb-1 truncate">
            {{ offer.place_name }}
          </h2>
          <div v-if="offer.date || offer.hour" class="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <UIcon v-if="offer.date" name="i-lucide-calendar" class="h-4 w-4 mr-1" />
            <span v-if="offer.date">{{ offer.date }}</span>

            <template v-if="offer.date && offer.hour">
              <span class="mx-2">•</span>
            </template>

            <UIcon v-if="offer.hour" name="i-lucide-clock" class="h-4 w-4 mr-1 text-gray-500 flex-shrink-0" />
            <span v-if="offer.hour">{{ offer.hour }}</span>
          </div>
        </div>


      </div>
    </template>

    <!-- Description -->
    <div class="mb-4">
      <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
        {{ offer.description }}
      </p>
    </div>

    <!-- Key Info -->
    <div class="mb-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
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
      <!-- Email always visible -->
      <div class="flex-shrink-0">
        <UBadge variant="soft" color="blue" size="lg" class="px-3 py-1">
          <UIcon name="i-lucide-mail" class="h-3 w-3 mr-1" />
          {{ offer.email }}
        </UBadge>
      </div>
    </div>

    <!-- Detailed Info -->
    <div v-if="offer.valid_to || offer.url || offer.author" class="pt-3 mt-4">
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
      </div>
    </div>

    <!-- Footer with Actions -->
    <div class="border-t border-gray-200 dark:border-gray-700 pt-3 mt-4 flex justify-end gap-2">
      <UButton
          color="error"
          variant="soft"
          icon="i-lucide-x"
          @click="$emit('reject', offer)"
      >
        Odrzuć
      </UButton>
      <UButton
          color="success"
          variant="solid"
          icon="i-lucide-check"
          @click="approveOffer"
      >
        Zatwierdź
      </UButton>
    </div>
  </UCard>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  offer: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['reject', 'accept'])

const router = useRouter()

const approveOffer = () => {
  emit('accept', props.offer)
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
