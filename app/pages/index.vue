<template>
  <UContainer>
    <UCard>
      <template #header>
        <h1 class="text-4xl font-extrabold">Zastępstwa procesowe</h1>
      </template>
    Lista zastępstw procesowych
    </UCard>

    <UCard class="mt-5">
      <template #header>
        <h2 class="text-3xl">EEE</h2>
      </template>

      {{offers}}
      <template #footer>
        <UButton to="/">III</UButton>
      </template>
    </UCard>


  </UContainer>
</template>

<script setup>
import {readOffersGet} from "@/client/index.ts";

const offers = ref("aaa")

const fetchOffers = async () => {
  const response = await readOffersGet({
    query: {offset: 0, limit:10},
  });

  console.log(response.data)
}

fetchOffers()

</script>


<style scoped>
</style>
