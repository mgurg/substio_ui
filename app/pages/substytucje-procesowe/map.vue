<template>
  <UContainer>
    <UPageSection title="Mapa zleceń prawniczych">
      <p class="prose prose-gray max-w-5xl mx-auto">
        Mapa zleceń prawniczych to intuicyjna platforma prezentująca aktualne oferty substytucji procesowych z całej
        Polski.
        <br><br>
        Przeglądaj dostępne zlecenia na interaktywnej mapie i szybko znajdź sprawy, które odpowiadają Twojej
        specjalizacji. Idealne narzędzie dla adwokatów i radców prawnych szukających dodatkowych zleceń lub wsparcia w
        prowadzeniu spraw.
      </p>
    </UPageSection>
    <UPageSection style="height: 600px; position: relative;">
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

        <MapboxNavigationControl />
        <MapboxFullscreenControl />
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
            <svg class="w-5 h-5 text-blue-600 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-700">Sąd</p>
              <p class="text-sm text-gray-900">{{ selectedOffer.court }}</p>
            </div>
          </div>

          <div class="flex items-start">
            <svg class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-700">Lokalizacja</p>
              <p class="text-sm text-gray-900">{{ selectedOffer.city }}</p>
            </div>
          </div>

          <div class="flex items-start">
            <svg class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-700">Data</p>
              <p class="text-sm text-gray-900">{{ selectedOffer.date }}</p>
            </div>
          </div>

          <div class="flex items-start">
            <svg class="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-700">Wynagrodzenie</p>
              <p class="text-lg font-bold text-green-600">{{ selectedOffer.fee }} PLN</p>
            </div>
          </div>

          <div class="pt-2 border-t border-gray-200">
            <p class="text-sm font-medium text-gray-700 mb-1">Opis</p>
            <p class="text-sm text-gray-600">{{ selectedOffer.description }}</p>
          </div>

          <div class="pt-2">
            <p class="text-sm font-medium text-gray-700 mb-2">Specjalizacja</p>
            <div class="flex flex-wrap gap-2">
              <span
                  v-for="spec in selectedOffer.specialization"
                  :key="spec"
                  class="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
              >
                {{ spec }}
              </span>
            </div>
          </div>
        </div>

        <button
            class="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            @click="applyForOffer"
        >
          Aplikuj na zlecenie
        </button>
      </div>
    </UPageSection>
  </UContainer>
</template>

<script setup>
import { ref, computed } from 'vue'

const mapRef = ref(null)
const selectedOffer = ref(null)

// Hardcoded legal substitution offers
// Structure designed to be API-ready
const legalOffers = ref([
  {
    id: 1,
    title: "Substytucja procesowa - sprawa cywilna",
    court: "Sąd Okręgowy w Warszawie",
    caseType: "cywilna",
    date: "2024-01-15",
    fee: 800,
    city: "Warszawa",
    coordinates: [21.0122, 52.2297],
    description: "Sprawa o zapłatę, wymagana substytucja na rozprawę",
    specialization: ["prawo cywilne", "sprawy gospodarcze"]
  },
  {
    id: 2,
    title: "Reprezentacja w sprawie karnej",
    court: "Sąd Rejonowy w Krakowie",
    caseType: "karna",
    date: "2024-01-18",
    fee: 1200,
    city: "Kraków",
    coordinates: [19.9450, 50.0647],
    description: "Obrona w sprawie karnej skarbowej",
    specialization: ["prawo karne", "prawo karne skarbowe"]
  },
  {
    id: 3,
    title: "Sprawa administracyjna",
    court: "Wojewódzki Sąd Administracyjny w Warszawie",
    caseType: "administracyjna",
    date: "2024-01-20",
    fee: 1500,
    city: "Warszawa",
    coordinates: [20.9950, 52.2400],
    description: "Odwołanie od decyzji ZUS",
    specialization: ["prawo administracyjne"]
  },
  {
    id: 4,
    title: "Substytucja - sprawa rodzinna",
    court: "Sąd Okręgowy w Poznaniu",
    caseType: "rodzinna",
    date: "2024-01-22",
    fee: 900,
    city: "Poznań",
    coordinates: [16.9252, 52.4064],
    description: "Sprawa o alimenty",
    specialization: ["prawo rodzinne"]
  },
  {
    id: 5,
    title: "Sprawa gospodarcza",
    court: "Sąd Okręgowy we Wrocławiu",
    caseType: "gospodarcza",
    date: "2024-01-25",
    fee: 2000,
    city: "Wrocław",
    coordinates: [17.0385, 51.1079],
    description: "Spór handlowy między przedsiębiorcami",
    specialization: ["prawo gospodarcze", "prawo handlowe"]
  },
  {
    id: 6,
    title: "Substytucja procesowa - odwołanie",
    court: "Sąd Apelacyjny w Gdańsku",
    caseType: "cywilna",
    date: "2024-01-28",
    fee: 1800,
    city: "Gdańsk",
    coordinates: [18.6466, 54.3520],
    description: "Reprezentacja w postępowaniu odwoławczym",
    specialization: ["prawo cywilne"]
  },
  {
    id: 7,
    title: "Sprawa karna - obrona",
    court: "Sąd Okręgowy w Katowicach",
    caseType: "karna",
    date: "2024-02-01",
    fee: 1400,
    city: "Katowice",
    coordinates: [19.0238, 50.2649],
    description: "Obrona w sprawie o przestępstwo przeciwko mieniu",
    specialization: ["prawo karne"]
  },
  {
    id: 8,
    title: "Reprezentacja w sprawie cywilnej",
    court: "Sąd Okręgowy w Łodzi",
    caseType: "cywilna",
    date: "2024-02-03",
    fee: 950,
    city: "Łódź",
    coordinates: [19.4560, 51.7592],
    description: "Sprawa o odszkodowanie",
    specialization: ["prawo cywilne", "prawo deliktowe"]
  },
  {
    id: 9,
    title: "Substytucja - sprawa administracyjna",
    court: "WSA w Krakowie",
    caseType: "administracyjna",
    date: "2024-02-05",
    fee: 1300,
    city: "Kraków",
    coordinates: [19.9350, 50.0547],
    description: "Skarga na decyzję organu podatkowego",
    specialization: ["prawo administracyjne", "prawo podatkowe"]
  },
  {
    id: 10,
    title: "Sprawa gospodarcza - pilne",
    court: "Sąd Okręgowy w Warszawie",
    caseType: "gospodarcza",
    date: "2024-02-07",
    fee: 2200,
    city: "Warszawa",
    coordinates: [21.0200, 52.2350],
    description: "Zabezpieczenie roszczenia w sprawie gospodarczej",
    specialization: ["prawo gospodarcze"]
  }
])

// Create GeoJSON source
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
        title: offer.title,
        court: offer.court,
        caseType: offer.caseType,
        date: offer.date,
        fee: offer.fee,
        city: offer.city,
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

const applyForOffer = () => {
  console.log('Applying for offer:', selectedOffer.value.id)
  // Add your application logic here
  // alert('Funkcja aplikacji będzie dostępna wkrótce!')
}
</script>