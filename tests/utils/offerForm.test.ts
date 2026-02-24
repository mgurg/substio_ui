import {describe, expect, it} from "vitest"
import {
  buildCreatePayload,
  buildUpdatePayload,
  mapCityOption,
  mapFacilityOption,
} from "../../app/utils/offerForm"

describe("offerForm helpers", () => {
  it("maps facility data into a select option", () => {
    const facility = {
      uuid: "f-1",
      name: "Test Court",
      street_name: "Main",
      street_number: "10",
      city: "Test City",
    }

    expect(mapFacilityOption(facility)).toEqual({
      label: "Test Court (Main 10)",
      value: "f-1",
      city: "Test City",
      name: "Test Court",
      street_name: "Main",
      street_number: "10",
    })
  })

  it("maps city data into a select option", () => {
    const city = {
      uuid: "c-1",
      name: "Test City",
      voivodeship_name: "Test Region",
    }

    expect(mapCityOption(city)).toEqual({
      label: "Test City (Test Region)",
      value: "c-1",
      cityName: "Test City",
      voivodeshipName: "Test Region",
    })
  })

  it("builds a create payload for a court offer", () => {
    const data = {
      description: "Example",
      author: "Author",
      email: "a@example.com",
      roles: ["r-1"],
      date: {toString: () => "2024-02-02"},
      hour: {toString: () => "10:15:00"},
      invoiceRequired: true,
      placeCategory: "court",
      facility: {name: "Court A", value: "f-1"},
    }

    const payload = buildCreatePayload(data, {
      source: "bot",
      dateSerializer: (value) => (value ? value.toString() : null),
      hourSerializer: (value) => (value ? value.toString().slice(0, 5) : null),
    })

    expect(payload).toEqual({
      description: "Example",
      author: "Author",
      email: "a@example.com",
      roles: ["r-1"],
      date: "2024-02-02",
      hour: "10:15",
      invoice: true,
      source: "bot",
      place_name: "Court A",
      facility_uuid: "f-1",
    })
  })

  it("builds a create payload for a non-court offer", () => {
    const data = {
      description: "Example",
      author: "Author",
      email: "a@example.com",
      roles: [],
      date: null,
      hour: null,
      invoiceRequired: false,
      placeCategory: "other",
      place: "Custom Place",
      city: {cityName: "Test City", value: "c-1"},
    }

    const payload = buildCreatePayload(data, {source: "user"})

    expect(payload).toEqual({
      description: "Example",
      author: "Author",
      email: "a@example.com",
      roles: [],
      date: null,
      hour: null,
      invoice: false,
      source: "user",
      place_name: "Custom Place",
      city_name: "Test City",
      city_uuid: "c-1",
    })
  })

  it("builds an update payload", () => {
    const data = {
      status: "active",
      description: "Example",
      author: "Author",
      email: "a@example.com",
      roles: ["r-1"],
      date: "2024-01-01",
      hour: "09:00",
      invoiceRequired: false,
      submitEmail: true,
      placeCategory: "court",
      facility: {name: "Court A", value: "f-1"},
    }

    expect(buildUpdatePayload(data)).toEqual({
      status: "active",
      description: "Example",
      author: "Author",
      email: "a@example.com",
      roles: ["r-1"],
      date: "2024-01-01",
      hour: "09:00",
      invoice: false,
      submit_email: true,
      place_name: "Court A",
      facility_uuid: "f-1",
    })
  })
})
