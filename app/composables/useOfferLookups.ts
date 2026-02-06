import {ref} from "vue"
import {offerGetLegalRoles, placeGetCities, placeGetFacilities} from "@/client/index.ts"
import {mapCityOption, mapFacilityOption} from "@/utils/offerForm"

export const useOfferLookups = (options = {}) => {
  const minSearchLength = options.minSearchLength ?? 2
  const clearOnShort = options.clearOnShort ?? true
  const onRolesError = options.onRolesError

  const facilitySearch = ref("")
  const facilities = ref([])
  const isLoadingFacilities = ref(false)

  const citySearch = ref("")
  const cities = ref([])
  const isLoadingCities = ref(false)

  const legalRoles = ref([])
  const isLoadingRoles = ref(false)

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

  const fetchLegalRoles = async () => {
    isLoadingRoles.value = true
    try {
      const {data} = await offerGetLegalRoles()
      if (data) {
        legalRoles.value = data.map((role) => ({
          label: role.name,
          value: role.uuid,
        }))
      }
    } catch (error) {
      console.error("Error fetching legal roles:", error)
      if (onRolesError) {
        onRolesError(error)
      }
    } finally {
      isLoadingRoles.value = false
    }
  }

  return {
    facilitySearch,
    facilities,
    isLoadingFacilities,
    citySearch,
    cities,
    isLoadingCities,
    legalRoles,
    isLoadingRoles,
    searchFacilities,
    searchCities,
    fetchLegalRoles,
  }
}
