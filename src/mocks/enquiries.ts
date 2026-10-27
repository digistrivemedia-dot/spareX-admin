import "server-only"

import type { Enquiry, EnquiryKind, EnquiryStatus } from "@/features/enquiries/types"
import type { VehicleType } from "@/features/masters/types"
import type { ActorRef } from "@/lib/types"
import { customers } from "@/mocks/customers"
import { daysAgo, persistent } from "@/mocks/utils"

const ADMIN: ActorRef = { type: "admin", id: "adm_suresh", name: "Suresh Reddy" }

/** [kind, status, customer number (0 = guest), vehicle [type, brand, model, variant, year], part query, message, days ago] */
type EnquirySeed = [
  EnquiryKind,
  EnquiryStatus,
  number,
  [VehicleType, string, string, string | null, number | null],
  string | null,
  string,
  number,
]

const ENQUIRIES: EnquirySeed[] = [
  [
    "vehicle_not_listed",
    "new",
    3,
    ["bike", "Triumph", "Speed 400", null, 2024],
    null,
    "Please add the Triumph Speed 400.",
    0,
  ],
  [
    "no_part_fits",
    "new",
    0,
    ["car", "Kia", "Seltos", "HTX Diesel", 2023],
    "Front brake pads",
    "No brake pads show up for my Seltos.",
    1,
  ],
  [
    "vehicle_not_listed",
    "in_progress",
    9,
    ["scooter", "Ather", "450X", "Gen 3", 2023],
    null,
    "Ather 450X is missing from the scooter list.",
    2,
  ],
  [
    "no_part_fits",
    "in_progress",
    15,
    ["bike", "Royal Enfield", "Himalayan 450", "Base", 2024],
    "Chain sprocket kit",
    "Need a chain kit for the new Himalayan.",
    4,
  ],
  [
    "no_part_fits",
    "resolved",
    20,
    ["car", "Tata", "Nexon", "EV Long Range", 2024],
    "Cabin air filter",
    "Cabin filter for Nexon EV?",
    9,
  ],
  [
    "vehicle_not_listed",
    "resolved",
    0,
    ["commercial", "Ashok Leyland", "Dost+", null, 2022],
    null,
    "We run 6 Dost+ trucks. Please add them.",
    15,
  ],
  [
    "no_part_fits",
    "closed",
    27,
    ["bike", "Yamaha", "RX 100", null, 1994],
    "Piston kit",
    "Looking for an RX 100 piston kit.",
    26,
  ],
  [
    "vehicle_not_listed",
    "closed",
    33,
    ["car", "Hyundai", "Santro", "GLS", 2008],
    null,
    "Old Santro not listed.",
    40,
  ],
]

export const enquiries = persistent<Enquiry[]>("enquiries", () =>
  ENQUIRIES.map(
    (
      [
        kind,
        status,
        customerNumber,
        [vehicleType, brand, model, variant, year],
        partQuery,
        message,
        days,
      ],
      index,
    ) => {
      const customer = customers[customerNumber - 1]
      const guest = customerNumber === 0
      const createdAt = daysAgo(days, 18)
      const handled = status !== "new"
      return {
        id: `enq_${String(index + 1).padStart(3, "0")}`,
        number: `ENQ-${501 + index}`,
        kind,
        status,
        customerId: guest ? null : (customer?.id ?? null),
        name: guest ? (index === 1 ? "Rakesh Varma" : "Udupi Logistics") : (customer?.name ?? ""),
        phone: guest ? (index === 1 ? "+919845776655" : "+919538765432") : (customer?.phone ?? ""),
        email: guest ? null : (customer?.email ?? null),
        vehicle: { vehicleType, brand, model, variant, year },
        partQuery,
        message,
        notes: handled
          ? [
              {
                id: `enq_${index + 1}_n1`,
                at: daysAgo(Math.max(days - 1, 0), 11),
                by: ADMIN,
                text:
                  kind === "vehicle_not_listed"
                    ? "Checking variant data with the brand."
                    : "Checking with suppliers for a fitting part.",
              },
            ]
          : [],
        reply:
          status === "resolved" || status === "closed"
            ? {
                text:
                  status === "resolved"
                    ? "Thanks for telling us. It's now listed on SpareX."
                    : "Sorry, we can't source this at the moment.",
                at: daysAgo(Math.max(days - 2, 0), 16),
                by: ADMIN,
              }
            : null,
        createdAt,
      }
    },
  ),
)
