<template>
  <UContainer>
    <UCard>
      <template #header>
        <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">{{ t('homepage.title') }}</h1>
      </template>

      <p class="leading-relaxed">Otwarty katalog, który łączy zlecających z prawnikami, aplikantami i
        kancelariami. Wyszukuj substytucje adwokackie, substytucje radców prawnych oraz jednorazowe zastępstwa
        procesowe. Wygodniej niż zamknięte grupy na Facebooku — bez potrzeby dołączania, bez zbędnego szumu.</p>


    </UCard>

    <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight pt-5 pl-5">Najnowsze zastępstwa procesowe:</h2>

    <OfferCard 
      v-for="offer in offers" 
      :key="offer.uuid" 
      :offer="offer"
      :detailed="true"
    />

<div class="flex justify-center">
  <UButton class="my-6" size="xl" trailing-icon="i-lucide-arrow-right" to="/substytucje-procesowe">Zobacz wszystkie</UButton>
</div>

    <UCard class="mt-5">
      <section>
        <h3 class="text-xl font-semibold">FAQ — najczęściej zadawane pytania</h3>
        <div class="mt-4 space-y-4">
          <div>
            <h4 class="font-semibold">Czym jest substytucja procesowa?</h4>
            <p class="mt-1">Substytucja procesowa to zlecenie prowadzenia sprawy lub zastąpienia
              pełnomocnika w sądzie przez innego prawnika lub aplikanta.</p>
          </div>
          <div>

              <h4 class="font-semibold">Jak to działa?</h4>
              <ol class="mt-4 space-y-2 list-decimal list-inside">
                <li>Przeglądasz ogłoszenia – wybierasz interesującą Cię ofertę substytucji.</li>
                <li>Kontaktujesz się bezpośrednio ze zlecającym – bez pośredników i ukrytych kosztów.</li>
                <li>Ustalasz szczegóły – i możesz przystąpić do realizacji zlecenia.</li>
              </ol>

          </div>

          <div>
            <h4 class="font-semibold">Dlaczego nasz katalog jest lepszy od zamkniętych grup na Facebooku?</h4>
            <ul class="mt-4 list-disc list-inside space-y-2">
              <li><strong>Otwarty dla każdego</strong> – bez konieczności proszenia o dołączenie do grupy.</li>
              <li><strong>Wygodne filtrowanie ogłoszeń</strong> – wyszukuj po mieście, terminie rozprawy, czy
                rodzaju sprawy.
              </li>
              <li><strong>Tylko aktualne oferty</strong> – ogłoszenia publikowane na bieżąco.</li>
              <li><strong>Bez zbędnego szumu</strong> – tylko oferty substytucji, bez reklam i postów niezwiązanych z
                tematem.
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold">Kto może korzystać z katalogu?</h4>
            <p class="mt-1">Z katalogu mogą korzystać adwokaci, radcowie prawni, aplikanci oraz inne
              osoby uprawnione do reprezentowania klientów przed sądem.</p>
          </div>
          <div>
            <h4 class="font-semibold">Jak dodać ogłoszenie?</h4>
            <p class="mt-1">Dodanie ogłoszenia jest proste – wystarczy wypełnić formularz, podać miasto,
              termin i krótki opis sprawy.</p>
          </div>
          <div>
            <h4 class="font-semibold">Czy korzystanie z katalogu jest płatne?</h4>
            <p class="mt-1">Przeglądanie i dodawanie ogłoszeń jest bezpłatne.</p>
          </div>
        </div>
      </section>
    </UCard>
  </UContainer>
</template>

<script setup>
import {useI18n} from '#imports'
import {getAllOffersOffersGet} from"@/client/index.ts";

const {t} = useI18n()

const offers = ref()
const count = ref(0)
const limit = ref(10)

const fetchOffers = async () => {
  const response = await getAllOffersOffersGet({
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
