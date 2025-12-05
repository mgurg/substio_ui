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
    </UPageSection>
  </UContainer>
</template>

<script setup>
import { ref, computed } from 'vue'

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
  console.log('Marker clicked:', props)

  // You can add a popup or modal here
  alert(`${props.title}\n${props.court}\nWynagrodzenie: ${props.fee} PLN`)
}
</script>