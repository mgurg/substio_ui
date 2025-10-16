<template>
  <UContainer>
    <!-- Skeleton while loading -->
    <div>
      <UPageHeader          title="Zatwierdź lub odrzuć"      />

      <USkeleton v-if="isLoading" class="w-full h-64 mt-5"/>
      <OfferReviewCard
          v-else-if="offer"
          :offer="offer"
          @reject="handleReject"
          @accept="handleAccept"
      />

    </div>

    <div class="flex justify-center">
      <UButton class="my-6" size="xl" trailing-icon="i-lucide-arrow-right" to="/substytucje-procesowe">
        Zobacz wszystkie oferty
      </UButton>
    </div>

    <div>
      <UPageHeader
          title="Wszystkie substytucje procesowe w jednym miejscu"
          description="Największy otwarty katalog zastępstw procesowych w Polsce"
      />

      <UPageGrid>
        <UPageCard
            v-for="(item, index) in features"
            :key="index"
            v-bind="item"
            spotlight
        />
      </UPageGrid>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import {useRoute, useRouter} from 'vue-router'
import {offerAcceptOffer, offerGetOfferById, offerRejectOffer} from "~/client"
import {onMounted, ref} from "vue"

const route = useRoute()
const router = useRouter()
const toast = useToast()

const uuid = route.params.uuid as string
const offer = ref<any>(null)
const isLoading = ref(false)

const fetchOffer = async (uuid: string) => {
  isLoading.value = true
  try {
    const {data} = await offerGetOfferById({
      path: {offer_uuid: uuid}
    })
    offer.value = data ?? null
  } catch (error) {
    console.error("Error fetching offer:", error)
    toast.add({
      title: "Błąd",
      description: "Nie udało się pobrać oferty",
      color: "error"
    })
  } finally {
    isLoading.value = false
  }
}

const handleReject = async () => {
  isLoading.value = true
  try {
    await offerRejectOffer({
      path: {offer_uuid: uuid}
    })

    toast.add({
      title: "Sukces",
      description: "Oferta została odrzucona",
      color: "success"
    })

    await router.push("/substytucje-procesowe")
  } catch (error) {
    console.error("Error rejecting offer:", error)
    toast.add({
      title: "Błąd",
      description: "Nie udało się odrzucić oferty",
      color: "error"
    })
  } finally {
    isLoading.value = false
  }
}


const handleAccept = async () => {
  isLoading.value = true
  try {
    await offerAcceptOffer({
      path: {offer_uuid: uuid}
    })

    toast.add({
      title: "Sukces",
      description: "Oferta została zaakceptowana",
      color: "success"
    })

    await router.push("/substytucje-procesowe")
  } catch (error) {
    console.error("Error rejecting offer:", error)
    toast.add({
      title: "Błąd",
      description: "Nie udało się zaakceptować oferty",
      color: "error"
    })
  } finally {
    isLoading.value = false
  }
}

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


onMounted(() => {
  fetchOffer(uuid)
})
</script>
