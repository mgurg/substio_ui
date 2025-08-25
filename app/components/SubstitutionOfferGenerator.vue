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
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        {{ copied ? 'Skopiowano!' : 'Kopiuj' }}
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 p-4 rounded-md border">
      <div class="text-sm font-mono whitespace-pre-wrap text-gray-800 dark:text-gray-200" v-html="formatForDisplay(generatePost)"/>
    </div>

    <div class="mt-3 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-4">
      <span>📘 Facebook markdown: **pogrubienie**, *kursywa*</span>
      <span>•</span>
      <span>Kliknij "Kopiuj" aby skopiować</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  formData: Object,
  additionalData: Object
})

const copied = ref(false)

const generatePost = computed(() => {
  const data = props.formData
  const additionalData = props.additionalData
  if (!data) return ''

  let post = ''

  // Get city name for hashtag (only for non-court types)
  if (data.placeCategory !== 'court') {
    const cityName = getCityName(data)
    if (cityName) {
      post += `**#${cityName}**\n`
    }
  }

  // Add facility or place name
  const placeName = getPlaceName(data)
  if (placeName) {
    post += `${placeName}\t`
  }

  // Add date (show even without hour)
  if (data.date) {
    const date = new Date(data.date)
    const formattedDate = date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    let dateTimeStr = `${formattedDate}r.`

    // Add hour if available
    if (data.hour) {
      dateTimeStr += `, godz. ${data.hour}`
    }

    post += `[${dateTimeStr}],\n`
  }

  // Add description/case type with spacing
  if (data.description) {
    post += `\n*${data.description}*,\n\n`
  }

  // Add roles based on actual selected roles
  const rolesText = getRolesText(data.roles, additionalData?.legalRoles)
  if (rolesText) {
    post += `**${rolesText}**,\n`
  }

  // Add contact info
  post += `\nOferty i stawki proszę priv.`

  // Add author contact if available
  // if (data.author) {
  //   post += `\n📞 Kontakt: ${data.author}`
  // }

  return post
})

// Helper functions
const getCityName = (data) => {
  if (data.placeCategory === 'court' && data.facility?.label) {
    // Extract city from court name (e.g., "Sąd Rejonowy Katowice-Wschód w Katowicach" -> "Katowice")
    const match = data.facility.label.match(/w\s+([^,\s]+)/i)
    if (match) {
      return match[1].replace(/ach$|e$/, '') // Remove common Polish city endings
    }
  } else if (data.placeCategory === 'other' && data.city?.label) {
    return data.city.label
  }
  return null
}

const getPlaceName = (data) => {
  if (data.placeCategory === 'court' && data.facility?.label) {
    return data.facility.label
  } else if (data.placeCategory === 'other' && data.place) {
    return data.place
  }
  return null
}

const getRolesText = (selectedRoles, legalRoles) => {
  // If no roles selected, show nothing
  if (!selectedRoles || selectedRoles.length === 0) {
    return null
  }

  // If we don't have role data, show nothing
  if (!legalRoles || legalRoles.length === 0) {
    return null
  }

  // Map selected role UUIDs to their labels
  const roleLabels = selectedRoles
      .map(roleId => {
        const role = legalRoles.find(r => r.value === roleId)
        return role ? role.label : null
      })
      .filter(Boolean)

  // Show the actual selected roles, or nothing if mapping failed
  return roleLabels.length > 0 ? roleLabels.join('/') : null
}

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

const formatForDisplay = (text) => {
  return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
}
</script>