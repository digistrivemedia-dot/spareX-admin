import "server-only"

import type { Vehicle } from "@/features/vehicles/types"
import { customers } from "@/mocks/customers"
import { vehicleModels, vehicleVariants } from "@/mocks/masters"
import { dateOnly, daysAgo, daysFromNow, persistent, seededRandom } from "@/mocks/utils"

export const SAMPLE_DOCUMENT_URL = "/images/documents/sample-document.pdf"

const COLOURS = [
  "Pearl White",
  "Matte Black",
  "Racing Red",
  "Silver",
  "Midnight Blue",
  "Grey",
  "Gunmetal",
]
const LETTERS = "ABCDEFGHJKLMNPRSTUVWXYZ"

function registration(city: string, random: ReturnType<typeof seededRandom>): string {
  const office =
    city === "Hosur"
      ? "TN 70"
      : city === "Mysuru"
        ? "KA 09"
        : random.pick(["KA 01", "KA 03", "KA 05", "KA 51", "KA 53"])
  const series = `${random.pick([...LETTERS])}${random.pick([...LETTERS])}`
  return `${office} ${series} ${random.int(1000, 9999)}`
}

type VehicleSeed = { variantId: string; year: number }

/** Arjun Rao's vehicles match the B2C demo; the rest are picked deterministically from the vehicle master. */
const FIXED: Record<string, VehicleSeed[]> = {
  cus_001: [
    { variantId: "vv_royal-enfield-classic-350-signals", year: 2023 },
    { variantId: "vv_maruti-suzuki-swift-zxi", year: 2022 },
  ],
}

function buildVehicles(): Vehicle[] {
  const random = seededRandom(42)
  const vehicles: Vehicle[] = []

  const add = (seed: VehicleSeed, ownerId: string | null, city: string, createdDaysAgo: number) => {
    const variant = vehicleVariants.find((candidate) => candidate.id === seed.variantId)
    const model = vehicleModels.find((candidate) => candidate.id === variant?.modelId)
    if (!variant || !model) throw new Error(`Unknown demo variant ${seed.variantId}`)
    const owner = customers.find((customer) => customer.id === ownerId)
    const id = `veh_${String(vehicles.length + 1).padStart(3, "0")}`
    const createdAt = daysAgo(createdDaysAgo, 12)
    vehicles.push({
      id,
      registrationNumber: registration(city, random),
      vehicleType: model.vehicleType,
      brandId: model.brandId,
      modelId: model.id,
      variantId: variant.id,
      year: seed.year,
      fuel: variant.fuel,
      colour: random.pick(COLOURS),
      chassisNumber: `MA${random.int(1, 9)}${Array.from({ length: 14 }, () => random.pick([..."0123456789ABCDEFGHJKLMNPRSTUVWXYZ"])).join("")}`,
      odometerKm: random.int(2500, model.vehicleType === "commercial" ? 140000 : 60000),
      ownerId,
      owners: owner
        ? [{ customerId: owner.id, customerName: owner.name, from: dateOnly(createdAt), to: null }]
        : [],
      documents: [
        {
          id: `${id}_rc`,
          type: "rc",
          number: `RC${random.int(100000, 999999)}`,
          expiresOn: null,
          fileUrl: SAMPLE_DOCUMENT_URL,
        },
        {
          id: `${id}_ins`,
          type: "insurance",
          number: `POL${random.int(1000000, 9999999)}`,
          expiresOn: daysFromNow(random.int(-20, 330)),
          fileUrl: SAMPLE_DOCUMENT_URL,
        },
      ],
      addedBy: owner ? "customer" : "garage",
      createdAt,
    })
  }

  customers.forEach((customer, index) => {
    const city = customer.addresses[0]?.city ?? "Bengaluru"
    const seeds =
      FIXED[customer.id] ??
      Array.from({ length: index % 3 === 2 ? 1 : 2 }, () => {
        const variant = random.pick(vehicleVariants)
        return { variantId: variant.id, year: random.pick(variant.years) }
      })
    seeds.forEach((seed) => add(seed, customer.id, city, 88 - index * 2))
  })

  // Walk-in vehicles a garage added that are not yet linked to a customer.
  add({ variantId: "vv_bajaj-pulsar-150-single-disc", year: 2021 }, null, "Bengaluru", 20)
  add({ variantId: "vv_tata-ace-gold-diesel", year: 2022 }, null, "Hosur", 11)
  add({ variantId: "vv_honda-activa-6g-std", year: 2024 }, null, "Mysuru", 4)

  // One vehicle sold by Anjali Deshpande to Vikram Shetty.
  const transferred = vehicles.find((vehicle) => vehicle.ownerId === "cus_016")
  const seller = customers.find((customer) => customer.id === "cus_016")
  const buyer = customers.find((customer) => customer.id === "cus_005")
  if (transferred && seller && buyer) {
    const transferDate = dateOnly(daysAgo(21))
    transferred.ownerId = buyer.id
    transferred.owners = [
      {
        customerId: seller.id,
        customerName: seller.name,
        from: dateOnly(transferred.createdAt),
        to: transferDate,
      },
      { customerId: buyer.id, customerName: buyer.name, from: transferDate, to: null },
    ]
  }
  return vehicles
}

export const vehicles = persistent<Vehicle[]>("vehicles", buildVehicles)
