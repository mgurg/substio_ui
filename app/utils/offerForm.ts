export const mapFacilityOption = (facility) => {
  const street = `${facility.street_name || ""} ${facility.street_number || ""}`.trim()

  return {
    label: `${facility.name}${street ? ` (${street})` : ""}`,
    value: facility.uuid,
    city: facility.city,
    name: facility.name,
    street_name: facility.street_name,
    street_number: facility.street_number,
  }
}

export const mapCityOption = (city) => ({
  label: city.voivodeship_name
    ? `${city.name} (${city.voivodeship_name})`
    : city.name,
  value: city.uuid,
  cityName: city.name,
  voivodeshipName: city.voivodeship_name,
})

export const buildCreatePayload = (data, options = {}) => {
  const dateSerializer = options.dateSerializer || ((value) => value ?? null)
  const hourSerializer = options.hourSerializer || ((value) => value ?? null)

  const payload = {
    description: data.description,
    author: data.author,
    email: data.email,
    roles: data.roles || [],
    date: dateSerializer(data.date),
    hour: hourSerializer(data.hour),
    invoice: data.invoiceRequired || false,
    source: options.source || "user",
  }

  if (data.placeCategory === "court" && data.facility) {
    payload.place_name = data.facility.name || data.facility.label
    payload.facility_uuid = data.facility.value
  } else if (data.placeCategory === "other") {
    payload.place_name = data.place
    if (data.city) {
      payload.city_name = data.city.cityName || data.city.name || data.city.label
      payload.city_uuid = data.city.value
    }
  }

  return payload
}

export const buildUpdatePayload = (data) => {
  const payload = {
    status: data.status,
    description: data.description || null,
    author: data.author || null,
    email: data.email,
    roles: data.roles || [],
    date: data.date,
    hour: data.hour,
    invoice: data.invoiceRequired,
    submit_email: data.submitEmail,
  }

  if (data.placeCategory === "court" && data.facility) {
    payload.place_name = data.facility.name || data.facility.label
    payload.facility_uuid = data.facility.value
  } else if (data.placeCategory === "other") {
    payload.place_name = data.place
    if (data.city) {
      payload.city_name = data.city.cityName || data.city.name || data.city.label
      payload.city_uuid = data.city.value
    }
  }

  return payload
}
