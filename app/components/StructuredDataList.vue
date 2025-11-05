<script setup lang="ts">
import {watch} from 'vue'
import {useHead} from '#imports'

const runtimeConfig = useRuntimeConfig()

const props = defineProps<{ offers: any[] }>()

const baseDomain = runtimeConfig.public.baseDomain;

function buildStructuredData(offers: any[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Aktualne zlecenia substytucyjne",
    "itemListOrder": "https://schema.org/ItemListOrderDescending",
    "numberOfItems": offers.length,
    "itemListElement": offers.map((offer, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "JobPosting",
        "title": `Substytucja procesowa – ${offer.place_name || offer.city?.name || 'nieokreślone miejsce'}`,
        "description": offer.description,
        "hiringOrganization": {
          "@type": "LegalService",
          "name": offer.author,
          "email": offer.email
        },
        "url": `https://${baseDomain}/substytucje-procesowe`,
        "validThrough": offer.valid_to
      }
    }))
  }
}

// watch for offers becoming available
watch(
    () => props.offers,
    (offers) => {
      if (offers && offers.length > 0) {
        useHead({
          script: [
            {
              type: 'application/ld+json',
              innerHTML: JSON.stringify(buildStructuredData(offers), null, 2),
              tagPriority: 'low'
            }
          ]
        })
      }
    },
    {immediate: true, deep: true}
)
</script>

<template>
  <div style="display:none;"/>
</template>
