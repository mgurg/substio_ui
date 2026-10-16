<script setup lang="ts">
import { formatDate } from '~/utils/formatDate'

const route = useRoute()
const { data: post } = await useAsyncData(`blog-post-${route.path}`, () => {
  return queryCollection('blog').path(route.path).first()
})

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

useSeoMeta({
  title: post.value.title,
  ogTitle: post.value.title,
  description: post.value.description,
  ogDescription: post.value.description,
})
</script>

<template>
  <UContainer v-if="post" class="py-8 max-w-3xl">
    <UButton
      to="/blog"
      variant="ghost"
      icon="i-heroicons-arrow-left"
      class="mb-8"
    >
      Powrót do bloga
    </UButton>

    <article>
      <header class="mb-8">
        <h1 class="text-4xl font-bold mb-4">
          {{ post.title }}
        </h1>
        <div class="text-gray-500 flex items-center gap-4">
          <time :datetime="post.date">{{ formatDate(post.date) }}</time>
        </div>
      </header>

      <div class="prose prose-primary dark:prose-invert max-w-none prose-img:rounded-xl prose-img:border prose-img:border-gray-200 dark:prose-img:border-gray-800">
        <ContentRenderer :value="post" />
      </div>
    </article>
  </UContainer>
</template>

<style scoped>
</style>
