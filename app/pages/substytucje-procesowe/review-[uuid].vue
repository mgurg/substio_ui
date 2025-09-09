<template>
  <UContainer>
    <!-- Skeleton while loading -->
    <USkeleton v-if="isLoading" class="w-full h-64 mt-5 rounded-xl" />
    <OfferReviewCard
        v-else-if="offer"
        :offer="offer"
        @reject="handleReject"
    />
<!--    <div v-else class="text-center text-gray-500 mt-10">-->
<!--      Nie znaleziono oferty-->
<!--    </div>-->
  </UContainer>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { getReviewOfferOffersOfferUuidGet, rejectOfferOffersRejectOfferUuidPatch } from "~/client"
import { onMounted, ref } from "vue"

const route = useRoute()
const router = useRouter()
const toast = useToast()

const uuid = route.params.uuid as string
const offer = ref<any>(null)
const isLoading = ref(false)

const fetchOffer = async (uuid: string) => {
  isLoading.value = true
  try {
    const { data } = await getReviewOfferOffersOfferUuidGet({
      path: { offer_uuid: uuid }
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
    await rejectOfferOffersRejectOfferUuidPatch({
      path: { offer_uuid: uuid }
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

onMounted(() => {
  fetchOffer(uuid)
})
</script>
