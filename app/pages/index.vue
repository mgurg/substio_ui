<template>
  <UContainer>
    <UCard>
      <template #header>
        <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">{{ t('homepage.title') }}</h1>
      </template>


      <p class="leading-relaxed">Otwarty katalog, który łączy zlecających z prawnikami, aplikantami i
        kancelariami. Wyszukuj substytucje adwokackie, substytucje radców prawnych oraz jednorazowe zastępstwa
        procesowe. Wygodniej niż zamknięte grupy na Facebooku — bez potrzeby dołączania, bez zbędnego szumu.</p>


      <section>
        <h3 class="text-xl font-semibold pt-6">Dlaczego nasz katalog jest lepszy od zamkniętych grup na Facebooku?</h3>
        <ul class="mt-4 list-disc list-inside space-y-2">
          <li><strong>Otwarty dla każdego</strong> – bez konieczności proszenia o dołączenie do grupy.</li>
          <li><strong>🚧 Wygodne filtrowanie ogłoszeń</strong> – wyszukuj po mieście, terminie rozprawy, stawce czy
            rodzaju sprawy.
          </li>
          <li><strong>Tylko aktualne oferty</strong> – ogłoszenia publikowane na bieżąco.</li>
          <li><strong>Bez zbędnego szumu</strong> – tylko oferty substytucji, bez reklam i postów niezwiązanych z
            tematem.
          </li>
        </ul>
      </section>

      <section>
        <h3 class="text-xl font-semibold pt-6">Jak to działa?</h3>
        <ol class="mt-4 space-y-2 list-decimal list-inside ">
          <li>Przeglądasz ogłoszenia – wybierasz interesującą Cię ofertę substytucji.</li>
          <li>🚧 Kontaktujesz się bezpośrednio ze zlecającym – bez pośredników i ukrytych kosztów.</li>
          <li>Ustalasz szczegóły – i możesz przystąpić do realizacji zlecenia.</li>
        </ol>
      </section>


    </UCard>

    <UCard v-for="offer in offers" :key="offer.uuid" class="mt-5">
      <template #header>
        <h2 class="text-3xl">{{ offer.place.name }}</h2>
      </template>

      <div class="mb-3">
        {{ offer.description }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm  bg-gray-50 p-3 rounded-lg">
        <div v-if="offer.date" class="flex items-center">
          <UIcon class="mr-2 h-4 w-4" name="i-lucide-calendar"/>
          <strong class="mr-2">Data:</strong> {{ offer.date }}
        </div>

        <div v-if="offer.hour" class="flex items-center">
          <UIcon class="mr-2 h-4 w-4" name="i-lucide-clock"/>
          <strong class="mr-2">Godzina:</strong> {{ offer.hour }}
        </div>

        <div v-if="offer.author" class="flex items-center">
          <UIcon class="mr-2 h-4 w-4" name="i-lucide-user"/>
          <strong class="mr-2">Autor:</strong> {{ offer.author }}
        </div>

        <div v-if="offer.place?.name" class="flex items-center">
          <UIcon class="mr-2 h-4 w-4" name="i-lucide-map-pin"/>
          <strong class="mr-2">Miejsce:</strong> {{ offer.place.name }}
        </div>
      </div>
      <!--<template #footer>-->
      <!--<UButton to="/">III</UButton>-->
      <!--</template>-->
    </UCard>

    <UCard class="mt-5">
      <section>
        <h3 class="text-xl font-semibold">FAQ — najczęściej zadawane pytania</h3>
        <div class="mt-4 space-y-4">
          <div>
            <h4 class="font-semibold">Czym jest substytucja procesowa?</h4>
            <p class="mt-1 ">Substytucja procesowa to zlecenie prowadzenia sprawy lub zastąpienia
              pełnomocnika w sądzie przez innego prawnika lub aplikanta.</p>
          </div>
          <div>
            <h4 class="font-semibold">Kto może korzystać z katalogu?</h4>
            <p class="mt-1 ">Z katalogu mogą korzystać adwokaci, radcowie prawni, aplikanci oraz inne
              osoby uprawnione do reprezentowania klientów przed sądem.</p>
          </div>
          <div>
            <h4 class="font-semibold">Jak dodać ogłoszenie?</h4>
            <p class="mt-1 ">🚧 Dodanie ogłoszenia jest proste – wystarczy wypełnić formularz, podać miasto,
              termin, stawkę i krótki opis sprawy.</p>
          </div>
          <div>
            <h4 class="font-semibold">Czy korzystanie z katalogu jest płatne?</h4>
            <p class="mt-1 ">Przeglądanie i dodawanie ogłoszeń jest bezpłatne.</p>
          </div>
        </div>
      </section>
    </UCard>
  </UContainer>
</template>

<script setup>
import {useI18n} from '#imports'
import {getAllOffersOffersGet} from "@/client/index.ts";

const {t} = useI18n()

const offers = ref()
const count = ref(0)
const limit = ref(10)

const fetchOffers = async () => {
  const response = await getAllOffersOffersGet({
    query: {offset: 0, limit: 10},
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
