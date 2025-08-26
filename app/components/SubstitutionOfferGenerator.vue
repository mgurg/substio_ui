<template>
  <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold text-blue-900 dark:text-blue-100">Oferta zastępstwa procesowego</h3>
      <button
          class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors duration-200 flex items-center gap-2"
          :class="{ 'bg-green-600 hover:bg-green-700': copied }"
          @click="copyToClipboard"
      >
        <svg v-if="!copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
              stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        {{ copied ? 'Skopiowano!' : 'Kopiuj' }}
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 p-4 rounded-md border">
      <div
          class="text-sm font-mono whitespace-pre-wrap text-gray-800 dark:text-gray-200"
          v-html="formatForDisplay(generatePost)"/>
    </div>

    <div class="mt-3 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-4">
      <span>📘 Facebook markdown: **pogrubienie**, *kursywa*</span>
      <span>•</span>
      <span>Kliknij "Kopiuj" aby skopiować</span>
    </div>
  </div>
</template>

<script setup>
import {computed, ref} from 'vue'

const props = defineProps({
  formData: {
    type: Object,
    required: true
  },
  additionalData: {
    type: Object,
    default: () => ({})
  }
})

const copied = ref(false)


console.log('formData:', props.formData)

// Extract location text with city information
const getLocationText = computed(() => {
  if (props.formData.placeCategory === 'court') {
    if (props.formData.facility) {
      return `#${props.formData.facility.city} - ${props.formData.facility.label}`
    }
  } else if (props.formData.placeCategory === 'other') {
    return `#${props.formData.city.label} ${props.formData.place}`
  }
  return 'Miejsce'
})

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Generate the post content
const generatePost = computed(() => {
  const parts = []

  // Title
  parts.push('🏛️ **ZASTĘPSTWO PROCESOWE**')

  // Location with city info
  const location = getLocationText.value
  if (location && location !== 'Miejsce') {
    parts.push(`📍 **Miejsce**: ${location}`)
  }

  // Date and time
  if (props.formData.date || props.formData.hour) {
    const dateTime = []
    if (props.formData.date) {
      dateTime.push(formatDate(props.formData.date))
    }
    if (props.formData.hour) {
      dateTime.push(`godz. ${props.formData.hour}`)
    }
    if (dateTime.length > 0) {
      parts.push(`🗓️ **Termin**: ${dateTime.join(' ')}`)
    }
  }

  // Legal roles
  if (props.formData.roles?.length) {
    const roleLabels = props.formData.roles
        .map(roleValue => props.additionalData.legalRoles?.find(r => r.value === roleValue)?.label)
        .filter(Boolean)
    if (roleLabels.length) {
      parts.push(`⚖️ **Dla**: ${roleLabels.sort((a, b) => a.localeCompare(b)).join(', ')}`);
    }
  }

  // Court type (only for courts)
  // if (props.formData.placeCategory === 'court' && props.formData.placeType) {
  //   const courtType = props.additionalData.courtTypes?.find(t => t.value === props.formData.placeType)?.label
  //   if (courtType) {
  //     parts.push(`🏛️ **Typ sądu**: ${courtType}`)
  //   }
  // }

  // Description
  if (props.formData.description?.trim()) {
    parts.push(`📝 **Opis**: ${props.formData.description.trim()}`)
  }

  // Invoice requirement
  if (props.formData.invoiceRequired) {
    parts.push(`🧾 **Faktura**: Wymagana`)
  }

  // Contact information
  if (props.formData.author || props.formData.email) {
    const contact = []
    // if (props.formData.author?.trim()) {
    //   contact.push(props.formData.author.trim())
    // }
    if (props.formData.email?.trim()) {
      contact.push(`${props.formData.email.trim()}`)
    }
    if (contact.length > 0) {
      parts.push(`👤 **Kontakt**: ${contact.join(' • ')}`)
    }
  }

  // Add separator and call to action
  if (parts.length > 1) {
    parts.push('---')
    parts.push('💬 *Zainteresowani proszę o kontakt w komentarzu lub wiadomość prywatną*')
  }

  return parts.join('\n\n')
})

// Format text for HTML display (convert markdown-like syntax to HTML)
const formatForDisplay = (text) => {
  return text
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Line breaks
      .replace(/\n/g, '<br>')
      // Horizontal rule
      .replace(/---/g, '<hr class="my-2 border-gray-300 dark:border-gray-600">')
}

// Copy to clipboard functionality
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatePost.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}
</script>