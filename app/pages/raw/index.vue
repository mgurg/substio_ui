<template>
  <UContainer>
    <UCard>
      <template #header>
        <h1 class="text-4xl font-extrabold">Nowe oferty</h1>
      </template>
      {{ t('homepage.description') }}
    </UCard>

    <template v-if="isLoading">
      <USkeleton v-for="i in limit" :key="i" class="h-24 mt-5 rounded-md"/>
    </template>

    <UCard
        v-for="offer in offers"
        v-else
        :key="offer.uuid"
        class="mt-5"
    >
      <div v-if="offer.status === 'new'">
        {{ offer.raw_data }}
      </div>
      <div v-else>
        <div class="mb-3">
          {{ offer.description }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm p-3 rounded-lg">
          <div v-if="offer.date" class="flex items-center">
            <UIcon name="i-lucide-calendar" class="mr-2 h-4 w-4" />
            <strong class="mr-2">Data:</strong> {{ offer.date }}
          </div>

          <div v-if="offer.hour" class="flex items-center">
            <UIcon name="i-lucide-clock" class="mr-2 h-4 w-4" />
            <strong class="mr-2">Godzina:</strong> {{ offer.hour }}
          </div>

          <div v-if="offer.author" class="flex items-center">
            <UIcon name="i-lucide-user" class="mr-2 h-4 w-4" />
            <strong class="mr-2">Autor:</strong> {{ offer.author }}
          </div>

          <div v-if="offer.place?.name" class="flex items-center">
            <UIcon name="i-lucide-map-pin" class="mr-2 h-4 w-4" />
            <strong class="mr-2">Miejsce:</strong> {{ offer.place.name }}
          </div>
        </div>
      </div>



      <template #footer>
        <UButton :to="`/raw/${offer.uuid}`">Edit</UButton> <UButton>{{offer.status}}</UButton>
      </template>
    </UCard>

    <div class="flex justify-center mt-6 mb-10 pb-10">
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
import {useI18n} from '#imports'
import {getAllRawOffersOffersRawGet} from '~/client'
import type {RawOfferIndexResponse} from '@/client/types.gen.ts'

const {t} = useI18n()
const route = useRoute()
const router = useRouter()

const offers = ref<RawOfferIndexResponse[]>([])
const count = ref<number>(0)
const limit = ref<number>(10)
const isLoading = ref<boolean>(false)

const currentPage = ref<number>(parseInt(route.query.page as string) || 1)

const pageCount = computed(() =>
    Math.ceil(count.value / limit.value)
)

const fetchOffers = async (): Promise<void> => {
  isLoading.value = true
  const offset = (currentPage.value - 1) * limit.value

  const response = await getAllRawOffersOffersRawGet({
    query: {offset, limit: limit.value},
  })

  if (response.data) {
    offers.value = response.data.data
    count.value = response.data.count
  }

  isLoading.value = false
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  router.replace({query: {...route.query, page: String(page)}})
  fetchOffers()
}

watch(() => route.query.page, (newPage) => {
  const parsed = parseInt(newPage as string)
  if (!isNaN(parsed) && parsed !== currentPage.value) {
    currentPage.value = parsed
    fetchOffers()
  }
})

fetchOffers()
</script>


<style scoped>
</style>
