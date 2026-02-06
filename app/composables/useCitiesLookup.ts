import {ref} from "vue"
import {placeGetCities} from "@/client/index.ts"
import {mapCityOption} from "@/utils/offerForm"

export const useCitiesLookup = (options = {}) => {
  const minSearchLength = options.minSearchLength ?? 2
  const clearOnShort = options.clearOnShort ?? true

  const citySearch = ref("")
  const cities = ref([])
  const isLoadingCities = ref(false)

  const searchCities = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < minSearchLength) {
      if (clearOnShort) {
        cities.value = []
      }
      return
    }

    isLoadingCities.value = true
    try {
      const response = await placeGetCities({
        path: {city_name: searchTerm},
      })

      cities.value = (response.data || []).map(mapCityOption)
    } catch (error) {
      console.error("Error searching cities:", error)
      if (clearOnShort) {
        cities.value = []
      }
    } finally {
      isLoadingCities.value = false
    }
  }

  return {
    citySearch,
    cities,
    isLoadingCities,
    searchCities,
  }
}
