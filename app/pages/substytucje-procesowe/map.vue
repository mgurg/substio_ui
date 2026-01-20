<template>
  <div>
    <!-- Header section with container -->
    <UContainer>
      <div title="Mapa zleceń prawniczych" class="py-6 md:py-12 text-center">
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
          Mapa zleceń prawniczych
        </h2>
        <p class="text-lg max-w-3xl mx-auto">
          Mapa zleceń prawniczych to intuicyjna platforma prezentująca aktualne oferty substytucji procesowych z całej
          Polski. Przeglądaj dostępne zlecenia na interaktywnej mapie i szybko znajdź sprawy, które odpowiadają Twojej
          specjalizacji.
        </p>

        <div class="flex justify-center">
          <UButton class="my-6" size="xl" trailing-icon="i-lucide-arrow-right" to="/substytucje-procesowe">
            Zobacz wszystkie
          </UButton>
        </div>
      </div>
    </UContainer>

    <!-- Map section without container - 90% viewport width -->
    <div class="w-[90vw] mx-auto py-4 md:py-6 relative" style="height: 600px;">
      <MapboxMap
          ref="mapRef"
          map-id="legalOffersMap"
          style="position: absolute; top: 0; bottom: 0; width: 100%; height: 100%; z-index: 1;"
          :options="{
              style: 'mapbox://styles/mapbox/light-v11',
              center: [19.0, 52.0],
              zoom: 6
            }"
          @styleload="onStyleLoad"
      >
        <MapboxSource
            source-id="legal-offers"
            :source="geojsonSource"
        />

        <MapboxLayer
            :layer="clusterLayer"
            @click="onClusterClick"
        />

        <MapboxLayer
            :layer="clusterCountLayer"
        />

        <MapboxLayer
            :layer="unclusteredPointLayer"
            @click="onMarkerClick"
        />

        <MapboxNavigationControl/>
        <MapboxFullscreenControl/>
      </MapboxMap>

      <!-- Offer Details Popup -->
      <div
          v-if="selectedOffer"
          class="absolute bg-white rounded-lg shadow-xl p-6 z-10"
          style="top: 20px; right: 20px; max-width: 400px;"
      >
        <button
            class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            @click="selectedOffer = null"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <h3 class="text-xl font-semibold text-gray-900 mb-4 pr-6">
          {{ selectedOffer.title }}
        </h3>

        <div class="space-y-3">
          <div class="flex items-start">
            <svg
                class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
              <path
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-700">Lokalizacja</p>
              <p class="text-sm text-gray-900">{{ selectedOffer.placeName }}</p>
            </div>
          </div>

          <div class="flex items-start">
            <svg
                class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
              <path
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-700">Data</p>
              <p class="text-sm text-gray-900">{{ selectedOffer.date }}</p>
            </div>
          </div>

          <div class="pt-2 border-t border-gray-200">
            <p class="text-sm font-medium text-gray-700 mb-1">Opis</p>
            <p class="text-sm text-gray-600">{{ selectedOffer.description }}</p>
          </div>

          <button
              class="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isSending"
              @click="applyForOffer"
          >
            <span v-if="isSending">Pobieranie...</span>
            <span v-else>Aplikuj na zlecenie</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {offerGetOfferEmail, offerListMapOffers} from "@/client/index.ts";

const mapRef = ref(null)
const selectedOffer = ref(null)

const isSending = ref(false)

// Offers fetched from API
const legalOffers = ref([])

const fetchOffers = async () => {
  try {
    const response = await offerListMapOffers()
    const items = response?.data ?? []

    // Track coordinates to detect duplicates
    const coordMap = new Map()

    // Map API response and handle duplicate coordinates
    legalOffers.value = items.map((o) => {
      const lat = parseFloat(o.lat)
      const lon = parseFloat(o.lon)
      let finalLon = isFinite(lon) ? lon : 0
      let finalLat = isFinite(lat) ? lat : 0

      // Create a key for this coordinate pair
      const coordKey = `${finalLat},${finalLon}`

      // If we've seen these coordinates before, add a small offset
      if (coordMap.has(coordKey)) {
        const count = coordMap.get(coordKey)
        coordMap.set(coordKey, count + 1)

        // Add small offset (roughly 50-100 meters) in a circular pattern
        const angle = (count * 137.5) * (Math.PI / 180) // Golden angle for even distribution
        const offset = 0.001 * (1 + count * 0.3) // Increase offset for each duplicate
        finalLon += offset * Math.cos(angle)
        finalLat += offset * Math.sin(angle)
      } else {
        coordMap.set(coordKey, 1)
      }

      return {
        id: o.uuid,
        placeName: o.place_name || '',
        description: o.description || '',
        coordinates: [finalLon, finalLat],
        date: o.date|| '',
      }
    })
  } catch (e) {
    console.error('Nie udało się pobrać ofert dla mapy', e)
    legalOffers.value = []
  }
}

// Create GeoJSON source (only necessary properties)
const geojsonSource = computed(() => ({
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: legalOffers.value.map(offer => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: offer.coordinates
      },
      properties: {
        id: offer.id,
        placeName: offer.placeName,
        description: offer.description
      }
    }))
  },
  cluster: true,
  clusterMaxZoom: 14,
  clusterRadius: 50
}))

// Cluster layer
const clusterLayer = {
  id: 'clusters',
  type: 'circle',
  source: 'legal-offers',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#3b82f6',
      5,
      '#8b5cf6',
      10,
      '#ec4899'
    ],
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      20,
      5,
      30,
      10,
      40
    ],
    'circle-opacity': 0.8
  }
}

// Cluster count layer
const clusterCountLayer = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'legal-offers',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12
  },
  paint: {
    'text-color': '#ffffff'
  }
}

// Unclustered point layer
const unclusteredPointLayer = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'legal-offers',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#3b82f6',
    'circle-radius': 8,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff'
  }
}

const onStyleLoad = () => {
  console.log('Map style loaded')
}

const onMarkerClick = (event) => {
  const props = event.features[0].properties

  // Find the full offer object
  selectedOffer.value = legalOffers.value.find(offer => offer.id === props.id)
}

const onClusterClick = (event) => {
  // Get the map instance and zoom into the cluster
  if (mapRef.value?.mapInstance) {
    const features = event.features
    const clusterId = features[0].properties.cluster_id
    const coordinates = features[0].geometry.coordinates

    const source = mapRef.value.mapInstance.getSource('legal-offers')
    source.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return

      mapRef.value.mapInstance.easeTo({
        center: coordinates,
        zoom: zoom
      })
    })
  }
}


const applyForOffer = async () => {
  const offer = selectedOffer.value
  if (!offer) return

  if (isSending.value) return

  umTrackEvent('show-email', {offer: offer.id})

  isSending.value = true
  try {
    const response = await offerGetOfferEmail({
      path: {offer_uuid: offer.id}
    })

    const email = response?.data?.email

    if (!email) {
      toast.add({
        title: "Błąd",
        description: "Nie udało się pobrać adresu e-mail.",
        color: "error"
      })
      return
    }

    const subject = `Zastępstwo procesowe ${offer.placeName ?? ''}`
    const body = `Dzień dobry,\n\nPiszę w sprawie zastępstwa ${offer.placeName ?? ''}.\n\n`

    const encodedSubject = encodeURIComponent(subject)
    const encodedBody = encodeURIComponent(body)

    window.location.href = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`
  } catch (e) {
    console.error(e)
    toast.add({
      title: "Błąd",
      description: "Wystąpił błąd podczas pobierania adresu e-mail.",
      color: "error"
    })
  } finally {
    isSending.value = false
  }
}

fetchOffers()
</script>