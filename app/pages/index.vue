<template>
  <UContainer>
    <UPageHero
        title="Substytucje procesowe"
        description="Otwarty katalog, który łączy adwokatów, radców prawnych i aplikantów z osobami szukającymi zastępstwa w sądzie czy prokuraturze. Wygodniejszy niż grupy na Facebooku — bez barier, bez chaosu. Konkretne i szybkie substytucje wtedy, gdy naprawdę ich potrzebujesz."
        headline="Znajdź zastępstwo szybciej"
        orientation="horizontal"
        :links="links"
    >
      <a href="/substytucje-procesowe/map" class="hidden lg:block">
        <img
            src="~/assets/map.png"
            alt="Illustration"
            class="w-full rounded-lg"
        ></a>

    </UPageHero>


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

    <UPageSection
        title="Substytucje procesowe — szybkie i skuteczne zastępstwo w sądzie"
    >
      <p class="prose prose-gray max-w-5xl mx-auto">
        Potrzebujesz zastępstwa procesowego w ostatniej chwili? A może jesteś aplikantem, adwokatem lub radcą prawnym i
        chcesz przyjąć substytucję? Nasza tablica ogłoszeń to nowoczesna alternatywa dla grup na Facebooku i
        tradycyjnych metod szukania substytutów. Znajdziesz tu ogłoszenia substytucji z całej Polski — szybko,
        przejrzyście i bez barier.
        <br><br>
        Zamiast dzwonić do znajomych lub przeszukiwać chaotyczne posty w mediach społecznościowych, skorzystaj z naszej
        platformy. Dodaj własne ogłoszenie lub odpowiedz na istniejące — niezależnie czy szukasz zastępstwa przed sądem
        cywilnym, karnym czy administracyjnym.
        <br><br>
        Nasz portal łączy kancelarie prawne, radców prawnych, adwokatów oraz aplikantów szukających realnych,
        konkretnych zleceń. Oprócz substytucji procesowych znajdziesz tu również oferty związane z wykonaniem fotokopii
        akt i innymi usługami prawnymi.
        <br><br>
        Dołącz do rosnącej społeczności prawników, którzy cenią sobie wygodę, czas i skuteczność. Wystaw ogłoszenie,
        znajdź zastępstwo i skoncentruj się na swojej pracy — my zajmiemy się resztą.
      </p>
    </UPageSection>


  </UContainer>
</template>

<script setup>
import {offerListOffers} from "@/client/index.ts";
import {substytucjeFeatures} from "@/constants/substytucjeFeatures";


const offers = ref()
const count = ref(0)
const limit = ref(10)


const features = substytucjeFeatures

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
