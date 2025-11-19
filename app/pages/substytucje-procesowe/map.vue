<template>
  <UContainer>
    <UPageSection
        title="Mapa zleceń prawniczych"
    >
      <p class="prose prose-gray max-w-5xl mx-auto">
        Mapa zleceń prawniczych to intuicyjna platforma prezentująca aktualne oferty substytucji procesowych z całej
        Polski.
        <br><br>
        Przeglądaj dostępne zlecenia na interaktywnej mapie i szybko znajdź sprawy, które odpowiadają Twojej
        specjalizacji. Idealne narzędzie dla adwokatów i radców prawnych szukających dodatkowych zleceń lub wsparcia w
        prowadzeniu spraw.
      </p>
    </UPageSection>
    <UPageSection style="height: 600px">
      <MapboxMap
          map-id="{ID}"
          style="position: absolute; top: 0; bottom: 0;width: 100%; height: 100%; z-index: 1;"
          :options="{
        style: 'mapbox://styles/mapbox/light-v11',
        center:[19.0, 52.0],
        zoom: 6
      }"
      />

    </UPageSection>
  </UContainer>
</template>

<script setup>

</script>
