<template>
  <UContainer>
    <UPageHero
        title="Substytucje procesowe"
        description="Otwarty katalog, który łączy adwokatów, radców prawnych i aplikantów z osobami szukającymi zastępstwa w sądzie czy prokuraturze. Wygodniejszy niż grupy na Facebooku — bez barier, bez chaosu. Konkretne i szybkie substytucje wtedy, gdy naprawdę ich potrzebujesz."
        headline="Znajdź zastępstwo szybciej"
        :links="links"
    />


    <h2 class="text-2xl md:text-3xl">Najnowsze zastępstwa procesowe:</h2>

    <OfferCard
        v-for="offer in offers"
        :key="offer.uuid"
        :offer="offer"
        :detailed="true"
    />

    <div class="flex justify-center">
      <UButton class="my-6" size="xl" trailing-icon="i-lucide-arrow-right" to="/substytucje-procesowe">Zobacz
        wszystkie
      </UButton>
    </div>


    <UPageSection
        title="Zapomnij o grupach na Facebooku"
        description="Dlaczego ta tablica ogłoszeń o zastępstwach procesowych jest lepszy od zamkniętych grup na Facebooku?"
    >
      <UPageGrid>
        <UPageCard
            v-for="(item, index) in features"
            :key="index"
            v-bind="item"
            spotlight
        />
      </UPageGrid>
    </UPageSection>

    <FAQ/>
  </UContainer>
</template>

<script setup>
import {offerListOffers} from "@/client/index.ts";


const offers = ref()
const count = ref(0)
const limit = ref(10)


const features = [
  {
    title: "Otwarty dla każdego",
    description: "bez konieczności proszenia o dołączenie do grupy",
    icon: "i-lucide-users",
  },
  {
    title: "Wygodne filtrowanie ogłoszeń",
    description: "wyszukuj po mieście, terminie rozprawy, czy rodzaju sprawy.",
    icon: "i-lucide-filter",
  },
  {
    title: "Tylko aktualne oferty",
    description: "ogłoszenia publikowane na bieżąco",
    icon: "i-lucide-clock",
  },
  {
    title: "Bez zbędnego szumu",
    description: "tylko oferty substytucji, bez reklam i postów niezwiązanych z tematem.",
    icon: "i-lucide-ban",
  },
  {
    title: "Powiadomienia o nowych ofertach",
    description: "🚧 otrzymuj natychmiastowe informacje o nowych ogłoszeniach w interesującym Cię regionie",
    icon: "i-lucide-bell",
  },
  {
    title: "Łatwe nawiązywanie kontaktu",
    description: "bezpośrednie wiadomości do ogłaszającego – bez pośredników i zbędnych formalności",
    icon: "i-lucide-message-circle",
  }
];

const links = ref([
  {
    label: 'Dodaj ogłoszenie',
    to: '/substytucje-procesowe/add',
    icon: 'i-lucide-plus'
  },
  {
    label: 'Przeglądaj oferty',
    to: '/substytucje-procesowe',
    color: 'neutral',
    variant: 'subtle',
    trailingIcon: 'i-lucide-arrow-right'
  }
])

const fetchOffers = async () => {
  const response = await offerListOffers({
    query: {offset: 0, limit: 3},
  });

  if (response.data) {
    offers.value = response.data.data
    count.value = response.data.count
    limit.value = response.data.limit
  }
}

fetchOffers()

</script>


<style scoped>
</style>
