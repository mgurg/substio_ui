<template>
  <div>
    <!-- Header section with container -->
    <UContainer>
      <div title="Mapa zleceń prawniczych" class="py-6 md:py-8 text-center">
        <h2 class="text-2xl md:text-3xl font-bold tracking-tight mb-4">
          Mapa zleceń prawniczych
        </h2>
        <div class="max-w-3xl mx-auto">
          <p class="text-sm md:text-base text-gray-600 inline leading-relaxed">
            Mapa zleceń prawniczych to intuicyjna platforma prezentująca aktualne oferty substytucji procesowych z całej
            Polski. Przeglądaj dostępne zlecenia na interaktywnej mapie i szybko znajdź sprawy, które odpowiadają Twojej
            specjalizacji.
          </p>
          <UButton class="ml-4 align-middle" size="sm" trailing-icon="i-lucide-arrow-right" to="/substytucje-procesowe">
            Zobacz wszystkie (lista)
          </UButton>
        </div>
      </div>
    </UContainer>

    <!-- Map section without container - 90% viewport width -->
    <LegalOffersMap />
  </div>
</template>

<script setup lang="ts">
import LegalOffersMap from "~/components/LegalOffersMap.vue";

defineOptions({name: 'SubstytucjeProcesoweMap'})
</script>
