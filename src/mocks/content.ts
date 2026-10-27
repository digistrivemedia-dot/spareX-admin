import "server-only"

import type {
  Banner,
  ContentPage,
  Faq,
  FeaturedCategory,
  FeaturedProduct,
} from "@/features/content/types"
import type { ActorRef } from "@/lib/types"
import { daysAgo, persistent } from "@/mocks/utils"

const EDITOR: ActorRef = { type: "admin", id: "adm_meera", name: "Meera Iyer" }

export const banners = persistent<Banner[]>("banners", () => [
  {
    id: "ban_1",
    title: "Monsoon ready: tyres and wipers",
    placement: "b2c_hero",
    webImageUrl: null,
    mobileImageUrl: null,
    linkUrl: "/c/tyres",
    startsAt: daysAgo(20),
    endsAt: daysAgo(-25),
    sortOrder: 1,
    active: true,
  },
  {
    id: "ban_2",
    title: "Genuine engine oils from Motul, Castrol and Shell",
    placement: "b2c_hero",
    webImageUrl: null,
    mobileImageUrl: null,
    linkUrl: "/c/engine-oil-and-lubricants",
    startsAt: daysAgo(45),
    endsAt: null,
    sortOrder: 2,
    active: true,
  },
  {
    id: "ban_3",
    title: "Free pick and drop on your next service",
    placement: "b2c_dashboard_promo",
    webImageUrl: null,
    mobileImageUrl: null,
    linkUrl: "/services",
    startsAt: daysAgo(10),
    endsAt: daysAgo(-50),
    sortOrder: 1,
    active: true,
  },
  {
    id: "ban_4",
    title: "Extra 3% off on bulk battery orders this month",
    placement: "b2b_offers",
    webImageUrl: null,
    mobileImageUrl: null,
    linkUrl: "/b2b/c/batteries",
    startsAt: daysAgo(5),
    endsAt: daysAgo(-26),
    sortOrder: 1,
    active: true,
  },
  {
    id: "ban_5",
    title: "Deliveries in Mysuru resume from Monday after the Dasara holidays",
    placement: "announcement_strip",
    webImageUrl: null,
    mobileImageUrl: null,
    linkUrl: "",
    startsAt: daysAgo(3),
    endsAt: daysAgo(-4),
    sortOrder: 1,
    active: false,
  },
])

export const featuredCategories = persistent<FeaturedCategory[]>("featured-categories", () =>
  [
    "cat_engine-oil-and-lubricants",
    "cat_batteries",
    "cat_tyres",
    "cat_brakes",
    "cat_filters",
    "cat_lighting",
  ].map((categoryId, index) => ({ id: `fc_${index + 1}`, categoryId, sortOrder: index + 1 })),
)

export const featuredProducts = persistent<FeaturedProduct[]>("featured-products", () =>
  ["prd_001", "prd_002", "prd_029", "prd_032", "prd_037", "prd_044", "prd_058", "prd_062"].map(
    (productId, index) => ({
      id: `fp_${index + 1}`,
      productId,
      sortOrder: index + 1,
    }),
  ),
)

function page(
  slug: string,
  title: string,
  kind: ContentPage["kind"],
  sections: [string, string[]][],
  days: number,
): ContentPage {
  return {
    id: `page_${slug}`,
    slug,
    title,
    kind,
    sections: sections.map(([heading, paragraphs], index) => ({
      id: `${slug}_${index + 1}`,
      heading,
      paragraphs,
    })),
    published: true,
    updatedAt: daysAgo(days),
    updatedBy: EDITOR,
  }
}

export const contentPages = persistent<ContentPage[]>("content-pages", () => [
  page(
    "privacy-policy",
    "Privacy policy",
    "policy",
    [
      [
        "What we collect",
        [
          "We collect your name, mobile number, email, addresses and vehicle details to deliver parts and book services.",
        ],
      ],
      [
        "How we use it",
        [
          "Your data is used only to process orders, bookings and support requests. We never sell your data.",
        ],
      ],
      [
        "Your rights",
        [
          "You can ask us to correct or delete your data at any time from your account or by writing to privacy@kannaligarage.in.",
        ],
      ],
    ],
    40,
  ),
  page(
    "terms-of-use",
    "Terms of use",
    "policy",
    [
      [
        "Using SpareX",
        ["SpareX is operated by Kannali Garage. By using the site you agree to these terms."],
      ],
      [
        "Prices and availability",
        [
          "Prices include GST. Stock and prices can change without notice until an order is confirmed.",
        ],
      ],
    ],
    40,
  ),
  page(
    "return-policy",
    "Return and refund policy",
    "policy",
    [
      [
        "Return window",
        [
          "You can request a return within 7 days of delivery for damaged, defective or wrong items, or parts that do not fit.",
        ],
      ],
      [
        "Non-returnable items",
        ["Engine oil and electrical parts cannot be returned once the seal is opened."],
      ],
      [
        "Refunds",
        [
          "Approved refunds reach your original payment method within 5–7 working days. B2B credit orders receive a credit note.",
        ],
      ],
    ],
    25,
  ),
  page(
    "shipping-policy",
    "Shipping policy",
    "policy",
    [
      [
        "Delivery areas",
        [
          "We deliver across Bengaluru, Hosur and Mysuru, and to serviceable PIN codes across Karnataka and Tamil Nadu.",
        ],
      ],
      [
        "Delivery charges",
        ["Delivery is free on orders above ₹499. A charge of ₹49 applies below that."],
      ],
    ],
    60,
  ),
  page(
    "cancellation-policy",
    "Cancellation policy",
    "policy",
    [
      [
        "Cancelling an order",
        ["You can cancel an order until it is shipped. Prepaid orders are refunded in full."],
      ],
      [
        "Cancelling a service booking",
        ["You can cancel a service booking at any time from My bookings, at no charge."],
      ],
    ],
    60,
  ),
  page(
    "how-fitment-works",
    "How fitment works",
    "help",
    [
      [
        "Pick your vehicle",
        [
          "Choose your vehicle type, brand, model, variant and year. We show only parts that fit it.",
        ],
      ],
      [
        "Can't find your vehicle?",
        ['Tell us with the "My vehicle isn\'t listed" form and our team will add it.'],
      ],
    ],
    15,
  ),
])

const FAQS: [Faq["category"], string, string][] = [
  [
    "fitment",
    "How do I know a part fits my vehicle?",
    "Add your vehicle in My garage. Every product page then shows whether it fits.",
  ],
  [
    "fitment",
    "My vehicle isn't listed. What do I do?",
    'Use the "My vehicle isn\'t listed" form. We usually add it within two working days.',
  ],
  [
    "orders",
    "Can I cancel my order?",
    "Yes, until it is shipped. Go to My orders and choose Cancel.",
  ],
  [
    "orders",
    "How do I track my order?",
    "Once shipped, My orders shows the courier name and tracking number.",
  ],
  [
    "returns",
    "How many days do I have to return a part?",
    "7 days from delivery, for damaged, defective, wrong or non-fitting parts.",
  ],
  ["returns", "Can I return engine oil?", "Only if the seal is unopened."],
  [
    "payments",
    "Which payment methods do you accept?",
    "UPI, cards, net banking and wallets through Razorpay. Businesses can also pay by bank transfer or on credit.",
  ],
  [
    "payments",
    "Is GST included in the price?",
    "Yes. All prices include GST, and you can add your GSTIN at checkout for a GST invoice.",
  ],
  [
    "service",
    "Is pick and drop really free?",
    "Yes, at garages that offer it. Choose a pickup window when you book.",
  ],
  [
    "account",
    "How do I delete my account?",
    "Go to Profile, then Delete account. We process requests under the DPDP Act.",
  ],
]

export const faqs = persistent<Faq[]>("faqs", () =>
  FAQS.map(([category, question, answer], index) => ({
    id: `faq_${index + 1}`,
    question,
    answer,
    category,
    sortOrder: index + 1,
    active: true,
  })),
)
