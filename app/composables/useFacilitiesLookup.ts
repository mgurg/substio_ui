import {ref} from "vue"
import {placeGetFacilities} from "@/client/index.ts"
import {mapFacilityOption} from "@/utils/offerForm"

export const useFacilitiesLookup = (options = {}) => {
  const minSearchLength = options.minSearchLength ?? 2
  const clearOnShort = options.clearOnShort ?? true

  const facilitySearch = ref("")
  const facilities = ref([])
  const isLoadingFacilities = ref(false)

  const searchFacilities = async (searchTerm, placeType) => {
    if (!searchTerm || searchTerm.length < minSearchLength) {
      if (clearOnShort) {
        facilities.value = []
      }
      return
    }

    isLoadingFacilities.value = true
    try {
      const queryParams = placeType ? {place_type: placeType} : {}
      const response = await placeGetFacilities({
        path: {place_name: searchTerm},
        query: queryParams,
      })

      facilities.value = (response.data || []).map(mapFacilityOption)
    } catch (error) {
      console.error("Error searching facilities:", error)
      if (clearOnShort) {
        facilities.value = []
      }
    } finally {
      isLoadingFacilities.value = false
    }
  }

  return {
    facilitySearch,
    facilities,
    isLoadingFacilities,
    searchFacilities,
  }
}
