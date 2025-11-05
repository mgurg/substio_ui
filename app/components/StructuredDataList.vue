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
        "datePosted": new Date(offer.created_at).toISOString().split('T')[0],
        "hiringOrganization": {
          "@type": "Organization",
          "name": offer.author
        },
        "jobLocation": offer.place ? {
          "@type": "Place",
          "name": offer.place.name,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": offer.place.name.replace(/^Sąd.*w /, '').replace(/^Komenda.*w /, '')
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": offer.place.lat,
            "longitude": offer.place.lon
          }
        } : offer.city ? {
          "@type": "Place",
          "name": offer.city.name,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": offer.city.name
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": offer.city.lat,
            "longitude": offer.city.lon
          }
        } : {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "PL"
          }
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