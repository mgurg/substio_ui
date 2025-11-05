<script setup lang="ts">
import {watch} from 'vue'
import {useHead} from '#imports'

const runtimeConfig = useRuntimeConfig()

const props = defineProps<{ offers: any[] }>()

const baseDomain = runtimeConfig.public.baseDomain;

function extractCityName(placeName: string): string {
  return placeName.replace(/^Sąd.*w /, '').replace(/^Komenda.*w /, '')
}

function buildJobLocation(offer: any) {
  if (offer.place) {
    return {
      "@type": "Place",
      "name": offer.place.name,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": extractCityName(offer.place.name)
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": offer.place.lat,
        "longitude": offer.place.lon
      }
    }
  }

  if (offer.city) {
    return {
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
    }
  }

  return {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "PL"
    }
  }
}

function buildJobPosting(offer: any): object {
  return {
    "@type": "JobPosting",
    "title": `Substytucja procesowa – ${offer.place_name || offer.city?.name || 'nieokreślone miejsce'}`,
    "description": offer.description,
    "datePosted": new Date(offer.valid_to).toISOString().split('T')[0],
    "hiringOrganization": {
      "@type": "Organization",
      "name": offer.author
    },
    "jobLocation": buildJobLocation(offer),
    "url": `https://${baseDomain}/substytucje-procesowe`,
    "validThrough": offer.valid_to
  }
}

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
      "item": buildJobPosting(offer)
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