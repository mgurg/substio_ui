<script setup lang="ts">
import { formatDate } from '~/utils/formatDate'

const { data: posts } = await useAsyncData('blog-list', async () => {
  try {
    const result = await queryCollection('blog').all()
    console.log('Blog posts from collection:', result)
    return result
  } catch (e) {
    console.error('Error fetching blog posts:', e)
    return []
  }
})

useSeoMeta({
  title: 'Blog - Substytucje procesowe',
  description: 'Aktualności, poradniki i przemyślenia na temat zastępstw procesowych.',
})
</script>

<template>
  <UContainer class="py-12">
    <div class="max-w-4xl mx-auto">
      <header class="mb-12 text-center">
        <h1 class="text-4xl font-bold mb-4">Blog</h1>
        <p class="text-xl text-gray-500">
          Wszystko o zastępstwach procesowych w jednym miejscu.
        </p>
      </header>

      <div v-if="posts && posts.length" class="grid gap-8">
        <UCard
          v-for="post in posts"
          :key="post.path"
          class="overflow-hidden"
        >
          <div class="flex flex-col md:flex-row gap-6">
            <div class="flex-1">
              <div class="text-sm text-gray-500 mb-2">
                {{ formatDate(post.date) }}
              </div>
              <h2 class="text-2xl font-bold mb-3">
                <NuxtLink :to="post.path" class="hover:text-primary-500 transition-colors">
                  {{ post.title }}
                </NuxtLink>
              </h2>
              <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {{ post.summary || post.description }}
              </p>
              <UButton
                :to="post.path"
                variant="link"
                color="primary"
                class="px-0"
              >
                Czytaj więcej
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
      <div v-else class="text-center py-12">
        <p class="text-gray-500 text-lg">Jeszcze nic tutaj nie ma. Zapraszamy wkrótce!</p>
      </div>
    </div>
  </UContainer>
</template>
