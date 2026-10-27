import "server-only"

import type {
  Garage,
  GarageOwnership,
  GarageService,
  GarageStaff,
  OpeningHours,
  Weekday,
} from "@/features/garages/types"
import type { VehicleType } from "@/features/masters/types"
import type { GeoPoint } from "@/lib/types"
import { businesses } from "@/mocks/businesses"
import { serviceItems } from "@/mocks/masters"
import { daysAgo, persistent, seededRandom } from "@/mocks/utils"

const WEEKDAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]

function hours(sundayOpen: boolean): OpeningHours[] {
  return WEEKDAYS.map((day) => ({
    day,
    closed: day === "sun" && !sundayOpen,
    opensAt: "09:00",
    closesAt: day === "sun" ? "13:30" : "19:30",
  }))
}

/** Typical garage prices in ₹ per service, by vehicle size. */
const BASE_PRICES: Record<string, [twoWheeler: number, fourWheeler: number]> = {
  "sv_general-service": [899, 0],
  "sv_full-car-service": [0, 4499],
  "sv_engine-oil-change": [499, 1999],
  "sv_brake-pad-replacement": [349, 1199],
  "sv_brake-fluid-change": [299, 899],
  "sv_battery-check-and-replacement": [149, 299],
  "sv_wiring-and-lighting-repair": [299, 799],
  "sv_wheel-alignment": [0, 599],
  "sv_wheel-balancing": [0, 499],
  "sv_puncture-repair": [99, 199],
  "sv_ac-service-and-gas-top-up": [0, 1899],
  "sv_foam-wash": [199, 599],
  "sv_denting-and-painting": [0, 2799],
  "sv_pre-purchase-inspection": [499, 1499],
}

function servicesFor(types: VehicleType[], priceFactor: number): GarageService[] {
  const fourWheeler = types.includes("car") || types.includes("commercial")
  return serviceItems
    .filter((service) => service.vehicleTypes.some((type) => types.includes(type)))
    .map((service) => {
      const [small, large] = BASE_PRICES[service.id] ?? [499, 999]
      const rupees = fourWheeler && large > 0 ? large : small || large
      return {
        serviceId: service.id,
        name: service.name,
        vehicleTypes: service.vehicleTypes.filter((type) => types.includes(type)),
        price: Math.round((rupees * priceFactor) / 10) * 1000,
        durationMinutes: rupees > 2000 ? 240 : rupees > 800 ? 120 : 45,
      }
    })
}

function staffFor(
  id: string,
  owner: string,
  random: ReturnType<typeof seededRandom>,
): GarageStaff[] {
  const people: [string, GarageStaff["role"]][] = [
    [owner, "owner"],
    [random.pick(["Ramesh B", "Shivakumar K", "Prasanna N"]), "service_advisor"],
    [random.pick(["Manoj", "Basavaraj", "Irfan", "Lokesh"]), "technician"],
    [random.pick(["Santosh", "Dilip", "Mahadev", "Arif"]), "technician"],
  ]
  return people.map(([name, role], index) => ({
    id: `${id}_st${index + 1}`,
    name,
    phone: `+9197${random.int(10000000, 99999999)}`,
    role,
    active: true,
  }))
}

type GarageSeed = {
  name: string
  ownership: GarageOwnership
  businessId: string | null
  ownerName: string
  phone: string
  line1: string
  area: string
  city: string
  pincode: string
  location: GeoPoint
  vehicleTypes: VehicleType[]
  pickAndDrop: boolean
  live: boolean
  rating: number
  ratingCount: number
  priceFactor: number
  approvedDaysAgo: number
}

const KANNALI_GSTIN = "29AADCK5512H1Z4"

const GARAGES: GarageSeed[] = [
  {
    name: "Kannali Garage Whitefield",
    ownership: "kannali",
    businessId: null,
    ownerName: "Kannali Garage",
    phone: "8041234501",
    line1: "No. 18, ITPL Main Road",
    area: "Whitefield",
    city: "Bengaluru",
    pincode: "560066",
    location: { lat: 12.9698, lng: 77.7499 },
    vehicleTypes: ["bike", "scooter", "car"],
    pickAndDrop: true,
    live: true,
    rating: 4.6,
    ratingCount: 214,
    priceFactor: 1,
    approvedDaysAgo: 175,
  },
  {
    name: "Kannali Garage Jayanagar",
    ownership: "kannali",
    businessId: null,
    ownerName: "Kannali Garage",
    phone: "8041234502",
    line1: "No. 402, 11th Main",
    area: "Jayanagar 4th Block",
    city: "Bengaluru",
    pincode: "560011",
    location: { lat: 12.925, lng: 77.5838 },
    vehicleTypes: ["bike", "scooter", "car"],
    pickAndDrop: true,
    live: true,
    rating: 4.5,
    ratingCount: 168,
    priceFactor: 1,
    approvedDaysAgo: 170,
  },
  {
    name: "Kannali Garage Hosur",
    ownership: "kannali",
    businessId: null,
    ownerName: "Kannali Garage",
    phone: "4344234503",
    line1: "No. 7, SIPCOT Phase 1",
    area: "Hosur",
    city: "Hosur",
    pincode: "635126",
    location: { lat: 12.7409, lng: 77.8253 },
    vehicleTypes: ["bike", "scooter", "car", "commercial"],
    pickAndDrop: false,
    live: true,
    rating: 4.3,
    ratingCount: 76,
    priceFactor: 0.95,
    approvedDaysAgo: 120,
  },
  {
    name: "Sri Sai Two Wheeler Works",
    ownership: "partner",
    businessId: "bus_001",
    ownerName: "Mahesh Kumar",
    phone: "9845321098",
    line1: "No. 14, 2nd Main",
    area: "Hanumanthanagar",
    city: "Bengaluru",
    pincode: "560019",
    location: { lat: 12.9406, lng: 77.5617 },
    vehicleTypes: ["bike", "scooter"],
    pickAndDrop: true,
    live: true,
    rating: 4.7,
    ratingCount: 132,
    priceFactor: 0.9,
    approvedDaysAgo: 160,
  },
  {
    name: "Mysuru Motor Works",
    ownership: "partner",
    businessId: "bus_010",
    ownerName: "Srinivas Gowda",
    phone: "9900210987",
    line1: "No. 9, Kalidasa Road",
    area: "VV Mohalla",
    city: "Mysuru",
    pincode: "570002",
    location: { lat: 12.3215, lng: 76.6309 },
    vehicleTypes: ["bike", "scooter", "car"],
    pickAndDrop: false,
    live: true,
    rating: 4.2,
    ratingCount: 58,
    priceFactor: 0.85,
    approvedDaysAgo: 110,
  },
  {
    name: "Royal Riders Garage",
    ownership: "partner",
    businessId: "bus_011",
    ownerName: "Tanveer Ahmed",
    phone: "9538321098",
    line1: "No. 46, 100 Feet Road",
    area: "Indiranagar",
    city: "Bengaluru",
    pincode: "560038",
    location: { lat: 12.9719, lng: 77.6412 },
    vehicleTypes: ["bike"],
    pickAndDrop: true,
    live: true,
    rating: 4.4,
    ratingCount: 91,
    priceFactor: 1.1,
    approvedDaysAgo: 100,
  },
  {
    name: "Silk Board Car Care",
    ownership: "partner",
    businessId: "bus_012",
    ownerName: "Joseph D'Souza",
    phone: "9611432109",
    line1: "No. 7, Hosur Road",
    area: "BTM Layout",
    city: "Bengaluru",
    pincode: "560076",
    location: { lat: 12.9172, lng: 77.6229 },
    vehicleTypes: ["car"],
    pickAndDrop: true,
    live: true,
    rating: 4.1,
    ratingCount: 47,
    priceFactor: 1.05,
    approvedDaysAgo: 80,
  },
  {
    name: "QuickFix Auto Care",
    ownership: "partner",
    businessId: "bus_013",
    ownerName: "Venkatesh Prasad",
    phone: "9845543210",
    line1: "No. 12, Neeladri Road",
    area: "Electronic City",
    city: "Bengaluru",
    pincode: "560100",
    location: { lat: 12.8452, lng: 77.6602 },
    vehicleTypes: ["bike", "scooter", "car"],
    pickAndDrop: false,
    live: false,
    rating: 0,
    ratingCount: 0,
    priceFactor: 1,
    approvedDaysAgo: 29,
  },
]

export const garages = persistent<Garage[]>("garages", () => {
  const random = seededRandom(11)
  return GARAGES.map((seed, index) => {
    const id = `gar_${String(index + 1).padStart(3, "0")}`
    const business = businesses.find((candidate) => candidate.id === seed.businessId)
    const phone = `+91${seed.phone}`
    // QuickFix is approved but its profile is incomplete, so it cannot go live yet.
    const complete = seed.live
    return {
      id,
      name: seed.name,
      ownership: seed.ownership,
      status: seed.live ? "live" : "not_live",
      ownerName: seed.ownerName,
      phone,
      email:
        business?.email ?? `${seed.area.toLowerCase().replace(/[^a-z]+/g, "")}@kannaligarage.in`,
      gstin: business?.gstin ?? KANNALI_GSTIN,
      address: {
        id: `${id}_addr`,
        name: seed.name,
        phone,
        line1: seed.line1,
        line2: seed.area,
        city: seed.city,
        state: seed.city === "Hosur" ? "Tamil Nadu" : "Karnataka",
        pincode: seed.pincode,
      },
      location: seed.location,
      description: `${seed.name} services ${seed.vehicleTypes.join(", ")} with trained technicians and genuine parts.`,
      photos: [],
      vehicleTypes: seed.vehicleTypes,
      openingHours: complete ? hours(index % 2 === 0) : [],
      services: complete ? servicesFor(seed.vehicleTypes, seed.priceFactor) : [],
      branches: [],
      staff: staffFor(
        id,
        seed.ownership === "kannali"
          ? random.pick(["Naveen Raj", "Harsha M", "Gopal K"])
          : seed.ownerName,
        random,
      ),
      pickAndDrop: seed.pickAndDrop,
      rating: seed.rating,
      ratingCount: seed.ratingCount,
      businessId: seed.businessId,
      approvedAt: daysAgo(seed.approvedDaysAgo),
      liveSince: seed.live ? daysAgo(seed.approvedDaysAgo - 5) : null,
    }
  })
})
