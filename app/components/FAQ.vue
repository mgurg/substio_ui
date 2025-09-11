<script setup lang="ts">
import { ref } from 'vue'

// Rozwijamy pierwsze pytanie w pierwszej sekcji
const expandedItems = ref(['dla-kogo-0'])

const items = [
  {
    label: 'Dla kogo jest Subaro?',
    key: 'dla-kogo',
    questions: [
      {
        key: 'dla-kogo-0',
        label: 'Czym jest substytucja procesowa?',
        content: 'Substytucja procesowa to zlecenie prowadzenia sprawy lub zastąpienia pełnomocnika w sądzie przez innego prawnika lub aplikanta.'
      },
      {
        key: 'dla-kogo-1',
        label: 'Kto może korzystać z katalogu?',
        content: 'Z katalogu mogą korzystać adwokaci, radcowie prawni, aplikanci oraz inne osoby uprawnione do reprezentowania klientów przed sądem.'
      },
      {
        key: 'dla-kogo-2',
        label: 'Czy mogę korzystać jako aplikant?',
        content: 'Tak, Subaro jest dostępne zarówno dla adwokatów, radców prawnych, jak i aplikantów.'
      },
      {
        key: 'dla-kogo-3',
        label: 'Czy korzystanie z katalogu jest płatne?',
        content: 'Przeglądanie i dodawanie ogłoszeń jest bezpłatne.'
      },
      {
        key: 'dla-kogo-4',
        label: 'Czy muszę mieć działalność gospodarczą?',
        content: 'Nie, nie jest wymagane prowadzenie działalności gospodarczej, ale może to być wymagane przez ogłaszającego.'
      }
    ]
  },
  {
    label: 'Jak działa publikacja ogłoszeń?',
    key: 'jak-dziala',
    questions: [
      {
        key: 'jak-dziala-0',
        label: 'Czy ogłoszenia są moderowane?',
        content: 'Tak, każde ogłoszenie przechodzi podstawową moderację, by zapewnić jakość i zgodność z regulaminem.'
      },
      {
        key: 'jak-dziala-1',
        label: 'Jak długo widoczne jest ogłoszenie?',
        content: 'Ogłoszenia są widoczne przez 7 dni jeżeli nie wybrano daty w trakcie ich tworzenia.'
      }
    ]
  },
  {
    label: 'Kwestie techniczne',
    key: 'techniczne',
    questions: [
      {
        key: 'techniczne-0',
        label: 'Czy Subaro działa na telefonie?',
        content: 'Tak, serwis jest w pełni responsywny i dostosowany do urządzeń mobilnych.'
      },
      {
        key: 'techniczne-1',
        label: 'Czy potrzebuję konta, aby przeglądać ogłoszenia?',
        content: 'Nie, korzystanie z serwisu nie wymaga rejestracji.'
      }
    ]
  }
]

const ui = {
  root: 'flex items-center gap-4 w-full',
  list: 'relative flex bg-transparent dark:bg-transparent gap-2 px-0',
  indicator: 'absolute top-[4px] duration-200 ease-out focus:outline-none rounded-lg bg-elevated/60',
  trigger: 'px-3 py-2 rounded-lg hover:bg-muted/50 data-[state=active]:text-highlighted data-[state=inactive]:text-muted',
  label: 'truncate'
}
</script>

<template>
  <UPageSection
      title="Najczęściej zadawane pytania"
      description="Zebraliśmy odpowiedzi na najczęściej pojawiające się pytania dotyczące działania Subaro."
      :ui="{
      container: 'px-0 !pt-0 gap-4 sm:gap-4',
      title: 'text-left text-xl sm:text-xl lg:text-2xl font-medium',
      description: 'text-left mt-2 text-sm sm:text-md lg:text-sm text-muted'
    }"
  >
    <UTabs
        :items="items"
        orientation="horizontal"
        :ui="ui"
    >
      <template #content="{ item }">
        <UAccordion
            v-model="expandedItems"
            :items="item.questions"
            :multiple="true"
            trailing-icon="lucide:plus"
            :unmount-on-hide="false"
            :ui="{
            item: 'border-none',
            trigger: 'mb-2 border-0 group px-4 transform-gpu rounded-lg bg-elevated/60 will-change-transform hover:bg-muted/50 text-base',
            trailingIcon: 'group-data-[state=closed]:rotate-0 group-data-[state=open]:rotate-135 text-base text-muted'
          }"
        >
          <template #body="{ item: _item }">
            <p class="text-sm text-muted">{{ _item.content }}</p>
          </template>
        </UAccordion>
      </template>
    </UTabs>
  </UPageSection>
</template>
