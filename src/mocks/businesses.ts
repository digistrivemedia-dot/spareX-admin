import "server-only"

import type {
  ApplicationStatus,
  Business,
  BusinessApplication,
  BusinessDocument,
  BusinessType,
  BusinessUser,
} from "@/features/businesses/types"
import type { ActorRef, Address, GeoPoint } from "@/lib/types"
import { SAMPLE_DOCUMENT_URL } from "@/mocks/vehicles"
import { daysAgo, persistent } from "@/mocks/utils"

type Place = {
  line1: string
  area: string
  city: string
  state: string
  pincode: string
  location: GeoPoint
}

function address(id: string, name: string, phone: string, place: Place): Address {
  return {
    id,
    name,
    phone,
    line1: place.line1,
    line2: place.area,
    city: place.city,
    state: place.state,
    pincode: place.pincode,
  }
}

function place(
  line1: string,
  area: string,
  pincode: string,
  lat: number,
  lng: number,
  city = "Bengaluru",
): Place {
  return {
    line1,
    area,
    city,
    state: city === "Hosur" ? "Tamil Nadu" : "Karnataka",
    pincode,
    location: { lat, lng },
  }
}

/** [name, type, GSTIN, owner, phone, place, discount %, status] */
type BusinessSeed = [
  string,
  BusinessType,
  string,
  string,
  string,
  Place,
  number,
  Business["status"],
]

const BUSINESSES: BusinessSeed[] = [
  [
    "Sri Sai Two Wheeler Works",
    "garage_workshop",
    "29AAKFS4821M1Z3",
    "Mahesh Kumar",
    "9845321098",
    place("No. 14, 2nd Main", "Hanumanthanagar", "560019", 12.9406, 77.5617),
    12,
    "active",
  ],
  [
    "Namma Wheels Fleet Services",
    "fleet_operator",
    "29AAGCN7712K1Z8",
    "Raghavendra Rao",
    "9880432109",
    place("Plot 22, Phase 2", "Peenya Industrial Area", "560058", 13.0285, 77.5196),
    10,
    "active",
  ],
  [
    "Lakshmi Auto Spares",
    "parts_retailer",
    "29ABDPL3345Q1Z2",
    "Lakshmi Narayan",
    "9741543210",
    place("No. 88, Avenue Road", "Chickpet", "560053", 12.9698, 77.5779),
    15,
    "active",
  ],
  [
    "Vinayaka Motors",
    "dealer",
    "29AAFFV9021H1Z5",
    "Ganesh Bhat",
    "9900654321",
    place("No. 5, Tumkur Road", "Yeshwanthpur", "560022", 13.0236, 77.5501),
    14,
    "active",
  ],
  [
    "Udupi Logistics",
    "fleet_operator",
    "29AACCU5567B1Z9",
    "Sudhir Shetty",
    "9538765432",
    place("Survey No. 41", "Bommasandra", "560099", 12.8176, 77.6963),
    8,
    "active",
  ],
  [
    "Bharath Auto Agencies",
    "dealer",
    "29AAHFB2234N1Z1",
    "Bharath Kumar",
    "9611876543",
    place("No. 210, Dr Rajkumar Road", "Rajajinagar", "560010", 12.9915, 77.5541),
    12,
    "active",
  ],
  [
    "Speedline Moto Spares",
    "reseller",
    "29ABRPS6612C1Z4",
    "Sandeep M",
    "9845987654",
    place("No. 3, Kalasipalya Main Road", "Kalasipalya", "560002", 12.9601, 77.5767),
    10,
    "on_hold",
  ],
  [
    "Greenfield Facility Services Pvt Ltd",
    "corporate",
    "29AAICG4410L1Z6",
    "Neha Kapoor",
    "9880098765",
    place("Tower C, EPIP Zone", "Whitefield", "560066", 12.9784, 77.7273),
    5,
    "active",
  ],
  [
    "Hosur Auto Hub",
    "parts_retailer",
    "33AAQFH1189D1Z7",
    "Murugan S",
    "9741109876",
    place("No. 17, Bagalur Road", "Hosur", "635109", 12.7409, 77.8253, "Hosur"),
    12,
    "active",
  ],
  [
    "Mysuru Motor Works",
    "garage_workshop",
    "29AAJFM5521E1Z0",
    "Srinivas Gowda",
    "9900210987",
    place("No. 9, Kalidasa Road", "VV Mohalla", "570002", 12.3215, 76.6309, "Mysuru"),
    12,
    "active",
  ],
  [
    "Royal Riders Garage",
    "garage_workshop",
    "29ABCFR7734G1Z2",
    "Tanveer Ahmed",
    "9538321098",
    place("No. 46, 100 Feet Road", "Indiranagar", "560038", 12.9719, 77.6412),
    12,
    "active",
  ],
  [
    "Silk Board Car Care",
    "garage_workshop",
    "29AAMFS8845J1Z5",
    "Joseph D'Souza",
    "9611432109",
    place("No. 7, Hosur Road", "BTM Layout", "560076", 12.9172, 77.6229),
    10,
    "active",
  ],
  [
    "QuickFix Auto Care",
    "garage_workshop",
    "29AAPFQ3390K1Z8",
    "Venkatesh Prasad",
    "9845543210",
    place("No. 12, Neeladri Road", "Electronic City", "560100", 12.8452, 77.6602),
    10,
    "active",
  ],
  [
    "Om Shakti Two Wheeler Garage",
    "garage_workshop",
    "29ACSPO2276F1Z3",
    "Shakti Prasad",
    "9880654321",
    place("No. 61, Puttenahalli Road", "Yelahanka", "560064", 13.1007, 77.5963),
    10,
    "active",
  ],
  [
    "City Cabs Bengaluru",
    "fleet_operator",
    "29AAFCC6658P1Z1",
    "Arun Joseph",
    "9741765432",
    place("No. 3, Outer Ring Road", "Hebbal", "560024", 13.0358, 77.597),
    8,
    "active",
  ],
]

function usersFor(
  id: string,
  owner: string,
  phone: string,
  emailDomain: string,
  index: number,
): BusinessUser[] {
  const users: BusinessUser[] = [
    {
      id: `${id}_u1`,
      name: owner,
      email: `${owner.split(" ")[0]?.toLowerCase()}@${emailDomain}`,
      phone: `+91${phone}`,
      role: "owner",
      active: true,
    },
  ]
  if (index % 2 === 0) {
    users.push({
      id: `${id}_u2`,
      name: "Purchase desk",
      email: `purchase@${emailDomain}`,
      phone: `+9198450${String(10000 + index * 7).slice(0, 5)}`,
      role: "purchaser",
      active: true,
    })
  }
  if (index % 3 === 0) {
    users.push({
      id: `${id}_u3`,
      name: "Accounts",
      email: `accounts@${emailDomain}`,
      phone: `+9199000${String(20000 + index * 11).slice(0, 5)}`,
      role: "accountant",
      active: index !== 6,
    })
  }
  return users
}

export const businesses = persistent<Business[]>("businesses", () =>
  BUSINESSES.map(([name, type, gstin, owner, phone, where, discountPercent, status], index) => {
    const id = `bus_${String(index + 1).padStart(3, "0")}`
    const emailDomain = `${name
      .toLowerCase()
      .replace(/[^a-z]+/g, "")
      .slice(0, 18)}.in`
    return {
      id,
      name,
      type,
      gstin,
      pan: gstin.slice(2, 12),
      ownerName: owner,
      phone: `+91${phone}`,
      email: `${owner.split(" ")[0]?.toLowerCase()}@${emailDomain}`,
      address: address(`${id}_addr`, name, `+91${phone}`, where),
      location: where.location,
      branches:
        index === 0 || index === 3
          ? [
              {
                id: `${id}_br1`,
                name: `${name}, Banashankari`,
                gstin: null,
                address: address(
                  `${id}_br1_addr`,
                  name,
                  `+91${phone}`,
                  place(
                    "No. 101, 80 Feet Road",
                    "Banashankari 3rd Stage",
                    "560085",
                    12.9255,
                    77.5468,
                  ),
                ),
              },
            ]
          : [],
      users: usersFor(id, owner, phone, emailDomain, index),
      discountPercent,
      status,
      holdReason:
        status === "on_hold"
          ? "GST returns not filed for two quarters; waiting for updated certificate."
          : null,
      applicationId: index === 12 ? "app_007" : index === 13 ? "app_008" : null,
      approvedAt: daysAgo(index === 12 ? 29 : index === 13 ? 44 : 170 - index * 6),
    }
  }),
)

const ADMIN_REVIEWERS: ActorRef[] = [
  { type: "admin", id: "adm_kiran", name: "Kiran Gowda" },
  { type: "admin", id: "adm_priya", name: "Priya Nair" },
]

function documentsFor(id: string): BusinessDocument[] {
  return [
    {
      id: `${id}_gst`,
      type: "gst_certificate",
      name: "GST registration certificate.pdf",
      url: SAMPLE_DOCUMENT_URL,
      mimeType: "application/pdf",
      sizeBytes: 248_000,
    },
    {
      id: `${id}_pan`,
      type: "pan_card",
      name: "PAN card.pdf",
      url: SAMPLE_DOCUMENT_URL,
      mimeType: "application/pdf",
      sizeBytes: 132_000,
    },
    {
      id: `${id}_tl`,
      type: "trade_licence",
      name: "Trade licence.pdf",
      url: SAMPLE_DOCUMENT_URL,
      mimeType: "application/pdf",
      sizeBytes: 310_000,
    },
  ]
}

/** [name, type, GSTIN, contact, phone, place, status, days ago] */
type ApplicationSeed = [
  string,
  BusinessType,
  string,
  string,
  string,
  Place,
  ApplicationStatus,
  number,
]

const APPLICATIONS: ApplicationSeed[] = [
  [
    "Sri Ganesh Auto Electricals",
    "parts_retailer",
    "29AAWFS2210R1Z4",
    "Ganesh Rao",
    "9845112233",
    place("No. 23, SP Road", "Chickpet", "560002", 12.9667, 77.5788),
    "submitted",
    1,
  ],
  [
    "Metro Fleet Solutions",
    "fleet_operator",
    "29AAECM8890T1Z6",
    "Rajesh Iyer",
    "9880223344",
    place("No. 8, Old Madras Road", "KR Puram", "560036", 13.0075, 77.6959),
    "submitted",
    2,
  ],
  [
    "Kaveri Motors",
    "dealer",
    "29AAKFK4471S1Z2",
    "Prakash Kaveri",
    "9741334455",
    place("No. 56, Mysore Road", "Kengeri", "560060", 12.9081, 77.4826),
    "under_review",
    5,
  ],
  [
    "Precision Car Clinic",
    "garage_workshop",
    "29AAOFP6632V1Z9",
    "Dinesh Pai",
    "9900445566",
    place("No. 4, Sarjapur Main Road", "Kaikondrahalli", "560035", 12.9116, 77.6721),
    "under_review",
    8,
  ],
  [
    "Raja Tyres and Spares",
    "reseller",
    "33AAVFR1145W1Z1",
    "Raja Shekar",
    "9538556677",
    place("No. 31, Denkanikottai Road", "Hosur", "635109", 12.7316, 77.8302, "Hosur"),
    "sent_back",
    12,
  ],
  [
    "Quick Parts Online",
    "reseller",
    "29AAXCQ9908Y1Z7",
    "Varun Mehta",
    "9611667788",
    place("No. 2, Hosur Road", "Bommanahalli", "560068", 12.9089, 77.6239),
    "rejected",
    20,
  ],
  [
    "QuickFix Auto Care",
    "garage_workshop",
    "29AAPFQ3390K1Z8",
    "Venkatesh Prasad",
    "9845543210",
    place("No. 12, Neeladri Road", "Electronic City", "560100", 12.8452, 77.6602),
    "approved",
    33,
  ],
  [
    "Om Shakti Two Wheeler Garage",
    "garage_workshop",
    "29ACSPO2276F1Z3",
    "Shakti Prasad",
    "9880654321",
    place("No. 61, Puttenahalli Road", "Yelahanka", "560064", 13.1007, 77.5963),
    "approved",
    48,
  ],
]

export const applications = persistent<BusinessApplication[]>("applications", () =>
  APPLICATIONS.map(
    ([businessName, type, gstin, contactName, phone, where, status, days], index) => {
      const id = `app_${String(index + 1).padStart(3, "0")}`
      const applicant: ActorRef = { type: "business", id, name: contactName }
      const reviewer = ADMIN_REVIEWERS[index % ADMIN_REVIEWERS.length]
      const history: BusinessApplication["history"] = [
        { status: "submitted", at: daysAgo(days, 10), by: applicant },
      ]
      if (status !== "submitted")
        history.push({ status: "under_review", at: daysAgo(days - 1, 12), by: reviewer })
      if (status === "sent_back")
        history.push({
          status,
          at: daysAgo(days - 2, 16),
          by: reviewer,
          note: "GST certificate is not readable. Please upload a clear copy.",
        })
      if (status === "rejected")
        history.push({
          status,
          at: daysAgo(days - 3, 15),
          by: reviewer,
          note: "GSTIN shows as cancelled on the GST portal.",
        })
      if (status === "approved")
        history.push({
          status,
          at: daysAgo(days - 4, 17),
          by: reviewer,
          note: "Verified documents and visited the workshop.",
        })
      return {
        id,
        number: `APP-${1001 + index}`,
        businessName,
        type,
        gstin,
        pan: gstin.slice(2, 12),
        contactName,
        phone: `+91${phone}`,
        email: `${contactName.split(" ")[0]?.toLowerCase()}@${businessName
          .toLowerCase()
          .replace(/[^a-z]+/g, "")
          .slice(0, 16)}.in`,
        address: address(`${id}_addr`, businessName, `+91${phone}`, where),
        location: where.location,
        photos: [],
        documents: documentsFor(id),
        status,
        submittedAt: daysAgo(days, 10),
        sentBackFields: status === "sent_back" ? ["gst_certificate"] : [],
        note:
          status === "sent_back"
            ? "GST certificate is not readable. Please upload a clear copy."
            : null,
        rejectionReason:
          status === "rejected" ? "GSTIN shows as cancelled on the GST portal." : null,
        businessId: index === 6 ? "bus_013" : index === 7 ? "bus_014" : null,
        history,
      }
    },
  ),
)
