export const createRawOfferFormData = () => ({
  placeCategory: "court",
  facility: null,
  place: "",
  city: null,
  author: "",
  description: "",
  email: null,
  roles: [],
  date: null,
  hour: null,
  invoiceRequired: false,
})

export const useRawOfferForm = (options) => {
  const {
    formData,
    facilitySearch,
    facilities,
    citySearch,
    cities,
    showSuccessMessage,
  } = options

  const setPlaceCategory = (category) => {
    formData.value.placeCategory = category
    if (category === "court") {
      formData.value.place = ""
      formData.value.city = null
      citySearch.value = ""
      cities.value = []
    } else if (category === "other") {
      formData.value.facility = null
      facilitySearch.value = ""
      facilities.value = []
    }

    if (showSuccessMessage) {
      showSuccessMessage.value = false
    }
  }

  const resetForm = () => {
    formData.value = createRawOfferFormData()
    facilitySearch.value = ""
    citySearch.value = ""
    facilities.value = []
    cities.value = []
    if (showSuccessMessage) {
      showSuccessMessage.value = false
    }
  }

  return {
    setPlaceCategory,
    resetForm,
  }
}
