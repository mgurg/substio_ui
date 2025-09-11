<template>
  <UContainer>
    <UCard>
      <template #header>
        <h1 class="text-3xl font-extrabold">Nowe oferty</h1>
      </template>
      <!-- Filter -->
      <div class="flex items-center gap-4 mb-5">
        <USelect
            v-model="selectedStatus"
            :items="statusOptions"
            placeholder="Filtruj status"
            class="w-48"
            @change="handleFilterChange"
        />
      </div>
    </UCard>

    <div v-if="isLoading">
      <USkeleton v-for="i in limit" :key="i" class="h-24 mt-5 rounded-md"/>
    </div>
    <div v-else>
      <OfferRawCard
          v-for="offer in offers"
          :key="offer.uuid"
          :offer="offer"
          @offer-updated="fetchOffers"
      />
    </div>

    <div v-if="count > 0 && pageCount > 1" class="flex justify-center mt-6 mb-10 pb-10">
      <UPagination
          v-model:page="currentPage"
          :page-count="pageCount"
          :total="count"
          @update:page="handlePageChange"
      />
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {getAllRawOffersOffersRawGet} from "@/client/index.ts"
import type {OfferStatus, RawOfferIndexResponse} from '@/client/types.gen.ts'

const route = useRoute()
const router = useRouter()

const offers = ref<RawOfferIndexResponse[]>([])
const count = ref<number>(0)
const limit = ref<number>(10)
const isLoading = ref<boolean>(false)

const currentPage = ref<number>(parseInt(route.query.page as string) || 1)
const selectedStatus = ref<OfferStatus | null>((route.query.status as OfferStatus) ?? 'new')

const statusOptions = [
  {label: 'Wszystkie', value: null},
  {label: 'Nowe', value: 'new'},
  {label: 'Szkic', value: 'draft'},
  {label: 'Przełożone', value: 'postponed'},
  {label: 'Zaakceptowane', value: 'accepted'},
  {label: 'Odrzucone', value: 'rejected'},
  {label: 'Aktywne', value: 'active'}
]

const pageCount = computed(() =>
    Math.ceil(count.value / limit.value)
)

const fetchOffers = async (): Promise<void> => {
  isLoading.value = true
  const offset = (currentPage.value - 1) * limit.value

  const response = await getAllRawOffersOffersRawGet({
    query: {
      offset,
      limit: limit.value,
      status: selectedStatus.value || undefined
    },
  })

  if (response.data) {
    offers.value = response.data.data
    count.value = response.data.count
  }

  isLoading.value = false
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  router.replace({query: {...route.query, page: String(page), status: selectedStatus.value ?? undefined}})
  fetchOffers()
}

const handleFilterChange = () => {
  currentPage.value = 1
  router.replace({query: {...route.query, page: "1", status: selectedStatus.value ?? undefined}})
  fetchOffers()
}

watch(() => route.query.page, (newPage) => {
  const parsed = parseInt(newPage as string)
  if (!isNaN(parsed) && parsed !== currentPage.value) {
    currentPage.value = parsed
    fetchOffers()
  }
})

watch(() => route.query.status, (newStatus) => {
  if (newStatus !== selectedStatus.value) {
    selectedStatus.value = (newStatus as OfferStatus) ?? 'new'
    fetchOffers()
  }
})

fetchOffers()
</script>