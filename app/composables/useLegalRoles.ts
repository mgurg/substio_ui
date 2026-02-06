import {ref} from "vue"
import {offerGetLegalRoles} from "@/client/index.ts"

export const useLegalRoles = (options = {}) => {
  const onError = options.onError

  const legalRoles = ref([])
  const isLoadingRoles = ref(false)

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
      if (onError) {
        onError(error)
      }
    } finally {
      isLoadingRoles.value = false
    }
  }

  return {
    legalRoles,
    isLoadingRoles,
    fetchLegalRoles,
  }
}
