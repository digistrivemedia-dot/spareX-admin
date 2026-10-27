import "server-only"

import type {
  FuelType,
  InspectionSection,
  InspectionTemplate,
  PartBrand,
  ProductCategory,
  ServiceCategory,
  ServiceItem,
  VehicleBrand,
  VehicleModel,
  VehicleType,
  VehicleTypeRecord,
  VehicleVariant,
} from "@/features/masters/types"
import { daysAgo, persistent } from "@/mocks/utils"

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export const vehicleTypes = persistent<VehicleTypeRecord[]>("vehicle-types", () => [
  {
    id: "bike",
    name: "Bike",
    description: "Motorcycles of every engine size",
    sortOrder: 1,
    active: true,
  },
  {
    id: "scooter",
    name: "Scooter",
    description: "Geared-less scooters, petrol and electric",
    sortOrder: 2,
    active: true,
  },
  {
    id: "car",
    name: "Car",
    description: "Hatchbacks, sedans and SUVs",
    sortOrder: 3,
    active: true,
  },
  {
    id: "commercial",
    name: "Commercial",
    description: "Pickups, mini trucks and three-wheelers",
    sortOrder: 4,
    active: true,
  },
])

/** [variant name, fuel, engine cc, battery kWh, first year, last year] */
type VariantSeed = [string, FuelType, number | null, number | null, number, number]
type ModelSeed = { name: string; type: VehicleType; variants: VariantSeed[] }
type BrandSeed = { name: string; description: string; models: ModelSeed[] }

const VEHICLE_MASTER: BrandSeed[] = [
  {
    name: "Hero",
    description: "India's largest two-wheeler maker, known for fuel-efficient commuters.",
    models: [
      {
        name: "Splendor Plus",
        type: "bike",
        variants: [
          ["Self Alloy", "petrol", 97, null, 2021, 2025],
          ["XTEC", "petrol", 97, null, 2022, 2025],
        ],
      },
      { name: "Passion Pro", type: "bike", variants: [["Disc", "petrol", 113, null, 2022, 2025]] },
      {
        name: "Xtreme 160R",
        type: "bike",
        variants: [
          ["Single Disc", "petrol", 163, null, 2021, 2024],
          ["4V", "petrol", 163, null, 2023, 2025],
        ],
      },
      { name: "Vida V1", type: "scooter", variants: [["Pro", "electric", null, 3.94, 2023, 2025]] },
    ],
  },
  {
    name: "Honda",
    description: "Honda Motorcycle and Scooter India: scooters, commuters and premium bikes.",
    models: [
      {
        name: "Activa 6G",
        type: "scooter",
        variants: [
          ["STD", "petrol", 110, null, 2021, 2025],
          ["DLX", "petrol", 110, null, 2021, 2025],
        ],
      },
      {
        name: "Shine 125",
        type: "bike",
        variants: [
          ["Drum", "petrol", 124, null, 2021, 2025],
          ["Disc", "petrol", 124, null, 2021, 2025],
        ],
      },
      { name: "Unicorn", type: "bike", variants: [["STD", "petrol", 162, null, 2021, 2025]] },
    ],
  },
  {
    name: "Bajaj",
    description: "Motorcycles, the Chetak electric scooter and three-wheelers.",
    models: [
      {
        name: "Pulsar 150",
        type: "bike",
        variants: [
          ["Single Disc", "petrol", 149, null, 2021, 2025],
          ["Twin Disc", "petrol", 149, null, 2021, 2025],
        ],
      },
      { name: "Pulsar NS200", type: "bike", variants: [["ABS", "petrol", 199, null, 2021, 2025]] },
      {
        name: "Chetak",
        type: "scooter",
        variants: [
          ["Urbane", "electric", null, 2.9, 2022, 2025],
          ["Premium", "electric", null, 3.2, 2022, 2025],
        ],
      },
      {
        name: "RE Compact",
        type: "commercial",
        variants: [
          ["CNG", "cng", 236, null, 2021, 2025],
          ["Diesel", "diesel", 470, null, 2021, 2024],
        ],
      },
    ],
  },
  {
    name: "TVS",
    description: "Commuter and performance bikes, scooters and the iQube electric.",
    models: [
      {
        name: "Apache RTR 160 4V",
        type: "bike",
        variants: [["Disc", "petrol", 160, null, 2021, 2025]],
      },
      {
        name: "Raider 125",
        type: "bike",
        variants: [
          ["Drum", "petrol", 125, null, 2022, 2025],
          ["Disc", "petrol", 125, null, 2022, 2025],
        ],
      },
      {
        name: "Jupiter",
        type: "scooter",
        variants: [["Classic", "petrol", 110, null, 2021, 2025]],
      },
      { name: "iQube", type: "scooter", variants: [["S", "electric", null, 3.4, 2022, 2025]] },
    ],
  },
  {
    name: "Royal Enfield",
    description: "Classic and adventure motorcycles.",
    models: [
      {
        name: "Classic 350",
        type: "bike",
        variants: [
          ["Signals", "petrol", 349, null, 2021, 2025],
          ["Chrome", "petrol", 349, null, 2022, 2025],
        ],
      },
      {
        name: "Bullet 350",
        type: "bike",
        variants: [["Standard", "petrol", 349, null, 2023, 2025]],
      },
      { name: "Hunter 350", type: "bike", variants: [["Metro", "petrol", 349, null, 2022, 2025]] },
      {
        name: "Himalayan 450",
        type: "bike",
        variants: [["Base", "petrol", 452, null, 2023, 2025]],
      },
    ],
  },
  {
    name: "KTM",
    description: "Performance street and sport motorcycles.",
    models: [
      { name: "Duke 200", type: "bike", variants: [["Standard", "petrol", 199, null, 2021, 2025]] },
      { name: "Duke 390", type: "bike", variants: [["Standard", "petrol", 399, null, 2022, 2025]] },
      { name: "RC 200", type: "bike", variants: [["Standard", "petrol", 199, null, 2021, 2025]] },
    ],
  },
  {
    name: "Yamaha",
    description: "Sport bikes and hybrid scooters.",
    models: [
      { name: "FZ-S V3", type: "bike", variants: [["Standard", "petrol", 149, null, 2021, 2025]] },
      { name: "R15 V4", type: "bike", variants: [["Standard", "petrol", 155, null, 2021, 2025]] },
      {
        name: "Fascino 125",
        type: "scooter",
        variants: [["Hybrid Disc", "hybrid", 125, null, 2022, 2025]],
      },
    ],
  },
  {
    name: "Suzuki",
    description: "Suzuki Motorcycle India: scooters and sport bikes.",
    models: [
      {
        name: "Access 125",
        type: "scooter",
        variants: [
          ["Standard", "petrol", 124, null, 2021, 2025],
          ["Special Edition", "petrol", 124, null, 2021, 2025],
        ],
      },
      {
        name: "Burgman Street",
        type: "scooter",
        variants: [["Standard", "petrol", 124, null, 2021, 2025]],
      },
      {
        name: "Gixxer SF",
        type: "bike",
        variants: [["Standard", "petrol", 155, null, 2021, 2024]],
      },
    ],
  },
  {
    name: "Maruti Suzuki",
    description: "India's largest car maker, plus the Super Carry mini truck.",
    models: [
      {
        name: "Swift",
        type: "car",
        variants: [
          ["VXi", "petrol", 1197, null, 2021, 2025],
          ["ZXi", "petrol", 1197, null, 2021, 2025],
          ["VXi CNG", "cng", 1197, null, 2023, 2025],
        ],
      },
      {
        name: "Baleno",
        type: "car",
        variants: [
          ["Delta", "petrol", 1197, null, 2022, 2025],
          ["Zeta", "petrol", 1197, null, 2022, 2025],
        ],
      },
      {
        name: "Brezza",
        type: "car",
        variants: [
          ["LXi", "petrol", 1462, null, 2022, 2025],
          ["ZXi CNG", "cng", 1462, null, 2023, 2025],
        ],
      },
      {
        name: "Super Carry",
        type: "commercial",
        variants: [
          ["Petrol", "petrol", 1196, null, 2021, 2025],
          ["CNG", "cng", 1196, null, 2021, 2025],
        ],
      },
    ],
  },
  {
    name: "Hyundai",
    description: "Hatchbacks and SUVs.",
    models: [
      {
        name: "Creta",
        type: "car",
        variants: [
          ["SX Petrol", "petrol", 1497, null, 2021, 2025],
          ["SX Diesel", "diesel", 1493, null, 2021, 2025],
        ],
      },
      { name: "i20", type: "car", variants: [["Asta", "petrol", 1197, null, 2021, 2025]] },
      {
        name: "Venue",
        type: "car",
        variants: [
          ["S(O) Turbo", "petrol", 998, null, 2022, 2025],
          ["SX Diesel", "diesel", 1493, null, 2022, 2025],
        ],
      },
    ],
  },
  {
    name: "Tata",
    description: "Cars, electric cars and light commercial vehicles.",
    models: [
      {
        name: "Nexon",
        type: "car",
        variants: [
          ["Creative Petrol", "petrol", 1199, null, 2022, 2025],
          ["Creative Diesel", "diesel", 1497, null, 2022, 2025],
          ["EV Long Range", "electric", null, 40.5, 2023, 2025],
        ],
      },
      {
        name: "Tiago",
        type: "car",
        variants: [
          ["XZ", "petrol", 1199, null, 2021, 2025],
          ["XZ iCNG", "cng", 1199, null, 2022, 2025],
          ["EV", "electric", null, 24, 2023, 2025],
        ],
      },
      {
        name: "Ace Gold",
        type: "commercial",
        variants: [
          ["Diesel", "diesel", 702, null, 2021, 2025],
          ["Petrol CX", "petrol", 694, null, 2022, 2025],
          ["EV", "electric", null, 21.3, 2023, 2025],
        ],
      },
    ],
  },
  {
    name: "Mahindra",
    description: "SUVs and pickups.",
    models: [
      {
        name: "XUV700",
        type: "car",
        variants: [
          ["AX5 Petrol", "petrol", 1997, null, 2021, 2025],
          ["AX7 Diesel", "diesel", 2184, null, 2021, 2025],
        ],
      },
      {
        name: "Scorpio-N",
        type: "car",
        variants: [["Z8 Diesel", "diesel", 2184, null, 2022, 2025]],
      },
      {
        name: "Bolero Pik-Up",
        type: "commercial",
        variants: [["1.7 T", "diesel", 2523, null, 2021, 2025]],
      },
    ],
  },
]

function yearsBetween(first: number, last: number): number[] {
  return Array.from({ length: last - first + 1 }, (_, i) => first + i)
}

function buildVehicleMaster() {
  const brands: VehicleBrand[] = []
  const models: VehicleModel[] = []
  const variants: VehicleVariant[] = []

  VEHICLE_MASTER.forEach((brand, brandIndex) => {
    const brandId = `vb_${slugify(brand.name)}`
    brands.push({
      id: brandId,
      name: brand.name,
      slug: slugify(brand.name),
      logoUrl: null,
      description: brand.description,
      vehicleTypes: [...new Set(brand.models.map((model) => model.type))],
      active: true,
      createdAt: daysAgo(200 - brandIndex),
    })
    for (const model of brand.models) {
      const modelId = `vm_${slugify(`${brand.name} ${model.name}`)}`
      models.push({ id: modelId, brandId, name: model.name, vehicleType: model.type, active: true })
      for (const [name, fuel, engineCc, batteryKwh, first, last] of model.variants) {
        variants.push({
          id: `vv_${slugify(`${brand.name} ${model.name} ${name}`)}`,
          modelId,
          name,
          fuel,
          engineCc,
          batteryKwh,
          years: yearsBetween(first, last),
          active: true,
        })
      }
    }
  })
  return { brands, models, variants }
}

const vehicleMaster = persistent("vehicle-master", buildVehicleMaster)
export const vehicleBrands = vehicleMaster.brands
export const vehicleModels = vehicleMaster.models
export const vehicleVariants = vehicleMaster.variants

const CATEGORY_TREE: [string, string[]][] = [
  ["Engine oil and lubricants", ["Engine oil", "Gear oil", "Brake fluid"]],
  ["Filters", ["Oil filters", "Air filters", "Fuel filters", "Cabin filters"]],
  ["Brakes", ["Brake pads", "Brake shoes", "Brake discs"]],
  ["Batteries", ["Two-wheeler batteries", "Car batteries", "Commercial batteries"]],
  ["Tyres", ["Two-wheeler tyres", "Car tyres", "Commercial tyres"]],
  ["Lighting", ["Bulbs", "Lamp assemblies", "Indicators"]],
  ["Electricals", ["Spark plugs", "Horns", "Relays", "Wiper blades"]],
  ["Clutch and transmission", ["Chain sprocket kits", "Clutch plates"]],
  ["Suspension", ["Shock absorbers", "Struts"]],
  ["Helmets and riding gear", ["Helmets"]],
]

export const productCategories = persistent<ProductCategory[]>("product-categories", () =>
  CATEGORY_TREE.flatMap(([name, children], index) => {
    const parentId = `cat_${slugify(name)}`
    return [
      {
        id: parentId,
        name,
        slug: slugify(name),
        parentId: null,
        imageUrl: null,
        sortOrder: index + 1,
        active: true,
      },
      ...children.map((child, childIndex) => ({
        id: `cat_${slugify(child)}`,
        name: child,
        slug: slugify(child),
        parentId,
        imageUrl: null,
        sortOrder: childIndex + 1,
        active: true,
      })),
    ]
  }),
)

const PART_BRANDS: [string, boolean][] = [
  ["Motul", false],
  ["Castrol", false],
  ["Shell", false],
  ["Rolon", false],
  ["Bosch", false],
  ["Uno Minda", false],
  ["Exide", false],
  ["Amaron", false],
  ["MRF", false],
  ["TVS Eurogrip", false],
  ["Philips", false],
  ["Steelbird", false],
  ["Honda Genuine Parts", true],
  ["Hero Genuine Parts", true],
  ["Bajaj Genuine Parts", true],
  ["Maruti Suzuki Genuine Parts", true],
  ["Tata Genuine Parts", true],
]

export const partBrands = persistent<PartBrand[]>("part-brands", () =>
  PART_BRANDS.map(([name, isOem]) => ({
    id: `pb_${slugify(name)}`,
    name,
    slug: slugify(name),
    logoUrl: null,
    isOem,
    active: true,
  })),
)

const ALL_TYPES: VehicleType[] = ["bike", "scooter", "car", "commercial"]
const TWO_WHEELERS: VehicleType[] = ["bike", "scooter"]
const FOUR_WHEELERS: VehicleType[] = ["car", "commercial"]

const SERVICE_MASTER: [string, [string, string, VehicleType[]][]][] = [
  [
    "Periodic service",
    [
      [
        "General service",
        "Oil change, filter clean, chain adjustment, brake check and wash.",
        TWO_WHEELERS,
      ],
      [
        "Full car service",
        "Engine oil and filters, 40-point inspection, top-ups and wash.",
        FOUR_WHEELERS,
      ],
      ["Engine oil change", "Drain and refill engine oil with a new oil filter.", ALL_TYPES],
    ],
  ],
  [
    "Brakes",
    [
      ["Brake pad replacement", "Replace worn pads and check discs.", ALL_TYPES],
      ["Brake fluid change", "Flush and refill brake fluid.", ALL_TYPES],
    ],
  ],
  [
    "Electrical",
    [
      [
        "Battery check and replacement",
        "Test the battery and charging system; replace if needed.",
        ALL_TYPES,
      ],
      ["Wiring and lighting repair", "Fix wiring faults, bulbs and switches.", ALL_TYPES],
    ],
  ],
  [
    "Tyres and wheels",
    [
      ["Wheel alignment", "Computerised wheel alignment.", FOUR_WHEELERS],
      ["Wheel balancing", "Balance all wheels.", FOUR_WHEELERS],
      ["Puncture repair", "Tubeless or tube puncture repair.", ALL_TYPES],
    ],
  ],
  [
    "AC service",
    [["AC service and gas top-up", "Clean the AC system and top up refrigerant.", ["car"]]],
  ],
  [
    "Cleaning and body",
    [
      ["Foam wash", "Exterior foam wash and interior vacuum.", ALL_TYPES],
      ["Denting and painting", "Panel repair and paint, per panel.", FOUR_WHEELERS],
    ],
  ],
  [
    "Inspection",
    [
      [
        "Pre-purchase inspection",
        "Full inspection report before buying a used vehicle.",
        ALL_TYPES,
      ],
    ],
  ],
]

export const serviceCategories = persistent<ServiceCategory[]>("service-categories", () =>
  SERVICE_MASTER.map(([name], index) => ({
    id: `sc_${slugify(name)}`,
    name,
    sortOrder: index + 1,
    active: true,
  })),
)

export const serviceItems = persistent<ServiceItem[]>("service-items", () =>
  SERVICE_MASTER.flatMap(([category, services]) =>
    services.map(([name, description, types]) => ({
      id: `sv_${slugify(name)}`,
      categoryId: `sc_${slugify(category)}`,
      name,
      description,
      vehicleTypes: types,
      active: true,
    })),
  ),
)

const INSPECTION_ITEMS: Record<InspectionSection, string[]> = {
  engine: ["Oil level and condition", "Unusual noise", "Leaks"],
  brakes: ["Front pad / shoe wear", "Rear pad / shoe wear", "Brake fluid level"],
  tyres: ["Tread depth", "Tyre pressure", "Sidewall damage"],
  battery: ["Voltage", "Terminals"],
  suspension: ["Front suspension", "Rear suspension"],
  lights: ["Headlamp", "Indicators", "Brake light"],
  ac: ["Cooling", "Blower"],
  electricals: ["Horn", "Starter", "Wiring"],
  fluids: ["Coolant", "Washer fluid"],
  body: ["Scratches and dents", "Mirrors"],
}

export const inspectionTemplates = persistent<InspectionTemplate[]>("inspection-templates", () =>
  ALL_TYPES.map((vehicleType, index) => ({
    id: `it_${vehicleType}`,
    vehicleType,
    sections: (Object.keys(INSPECTION_ITEMS) as InspectionSection[])
      .filter(
        (section) => section !== "ac" || vehicleType === "car" || vehicleType === "commercial",
      )
      .map((section) => ({
        section,
        items: INSPECTION_ITEMS[section].map((label) => ({
          id: `${vehicleType}_${slugify(label)}`,
          label,
        })),
      })),
    updatedAt: daysAgo(60 - index * 5),
  })),
)
