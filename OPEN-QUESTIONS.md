# Admin panel: open questions

Everything below is **built with the default** shown, so nothing is blocked. Before the backend starts, the lead goes
through this list (with the client where needed) and fills in **Answer**. A changed default is then a small edit.

**Agent:** add new rows at the end with the next free ID. Never delete rows; when an answer arrives, fill in
**Answer** and set **Status** to `Answered`.

| ID | Question | Affects | Default built | Answer | Status |
|---|---|---|---|---|---|
| Q-01 | What can **Admin** do vs **Super Admin**? | A05–A08, all permissions | Admin has everything except admin users, roles, settings and integrations | | Open |
| Q-02 | Vehicle types: bike, scooter, car, commercial, with **electric as a fuel type**? (The proposal listed EV as a separate category.) | A21–A23, fitment, B2C and B2B filters | Bike, scooter, car, commercial; electric is a fuel | | Open |
| Q-03 | Should **product reviews** ever return? (B2C has none; only garages are rated.) | A50 | Built, `productReviews` switch off | | Open |
| Q-04 | When a vehicle is sold, does the **new owner see the full history** (including prices)? | A12, B2C service history | Transfer keeps the full history; prices visible to the new owner | | Open |
| Q-05 | **Cash on delivery** for B2C: allowed? Limit, fee, excluded PINs? | A55 Delivery, A34, A37 | COD off for B2C; on for B2B | | Open |
| Q-06 | **Coupons** at launch? | A47, A48, B2C cart and checkout | Screens built; coupons not shown on B2C | | Open |
| Q-07 | Stock: one quantity per product, or **per Kannali location / warehouse**? | A31, A29, B2B stock display | One quantity per product | | Open |
| Q-08 | Service prices: set **only by each garage**, or does Kannali also set base or maximum prices? | A26, A20 | Garages set prices; the service master has names and categories only | | Open |
| Q-09 | How do **online service payments reach partner garages** (paid to Kannali then settled, or straight to the garage)? Any platform fee? | A59, A37, reports | Paid to Kannali, settled to the garage; A59 hidden from the menu until answered | | Open |
| Q-10 | Do imports need **Excel (.xlsx)**, or is CSV enough? (Excel needs a new library.) | A30 | CSV only | | Open |
| Q-11 | **Credit rules:** who may change limits, default terms, what happens when an invoice is overdue (block new credit orders after how many days)? | A17, A18, B2B checkout | Net 30; warn when overdue, block when over the limit or on hold | | Open |
| Q-12 | **Return window** and **non-returnable categories**? | A36, A55, B2C returns | 7 days after delivery; engine oil and electricals non-returnable once opened | | Open |
| Q-13 | Kannali's **legal name, GSTIN, registered address** and **invoice / credit-note number format**? | A55, every invoice and credit note | Placeholders; format `KG/26-27/0001` and `CN/26-27/0001` | | Open |
| Q-14 | Is there an **inspection fee** when every estimate item is rejected? (B2B currently closes the job with no fee.) | A55 Service, A43 | No fee (matches B2B) | | Open |
| Q-15 | **Pickup time windows** for free pick and drop (how many, what times)? Any distance limit? | A55 Service, A41 | 9–11 AM, 11 AM–1 PM, 2–4 PM, 4–6 PM; no distance limit | | Open |
| Q-16 | **Notification channels and events** (SMS, WhatsApp, email, push)? | Later; no screen at launch | Not built | | Open |
| Q-17 | Which **8 named admin positions** from the client's sheet will become roles, and when? | A07, permissions | Not built; roles are data, so they can be added later | | Open |
| Q-18 | **Database**: MongoDB (proposal) or PostgreSQL? | Backend only | Frontend unaffected | | Open |
| Q-19 | **Installation** of parts by Kannali / garages, sold with the product? | A29 | Built, `productInstallation` switch off | | Open |
| Q-20 | **Booking time slots**, or date only + pickup window (as B2C has now)? | A40, A41, A55 | Built, `bookingTimeSlots` switch off | | Open |
| Q-21 | How long does an **admin session** last, and should it end after a period of inactivity? | A01, all screens | 12-hour session, no inactivity timeout (`SESSION_MAX_AGE_SECONDS` in `features/auth/cookies.ts`) | | Open |
| Q-22 | Is there a **maximum B2B discount** admin can give a business? | A32, A14 | 50% (`MAX_B2B_DISCOUNT_PERCENT` in `lib/constants.ts`) | | Open |
| Q-23 | Can credit be **turned off while a business still owes money**, or only put on hold? | A18 | Only when nothing is outstanding; otherwise put it on hold | | Open |
| Q-24 | Can admin **cancel a booking after the garage has started work** (vehicle checked in)? | A41 | No: only pending or accepted bookings; once in the workshop the garage closes the job card | | Open |
| Q-25 | Can admin issue a **refund outside a cancellation or return** (e.g. a goodwill or partial refund on a delivered order)? | A34, A37 | No: a cancelled Razorpay order is refunded in full automatically; other refunds go through returns (A36) | | Open |
| Q-26 | Does admin **convert an accepted quotation into an order**, or does the business place the order from B2B? | A39 | The business accepts and orders on B2B; admin edits, sends and re-sends only | | Open |
| Q-27 | Does a **replacement** create a new order (and reduce stock), and does a **returned item go back into stock**? | A36, A31 | Replacement is recorded as `<order no.>-R` with no new order; stock is not changed by returns | | Open |
| Q-28 | Can admin **raise a credit note without a return** (e.g. short supply, price correction)? | A58 | No: credit notes come from returns (and cancelled credit orders); the seeded short-supply note shows the format | | Open |
| Q-29 | Can an **invited admin be re-sent or cancelled**, and how long is an **invitation link** valid? | A05, A06 | Invite only; the invited admin shows as "Invited" until they sign in; no resend or expiry shown | | Open |
| Q-30 | Can **banners, FAQs and coupons be deleted**, or only switched off? | A44, A46, A48 | Banners and FAQs can be deleted (with confirmation); coupons can only be made inactive, to keep order history | | Open |
| Q-31 | How should **revenue be counted in reports**: incl. or excl. GST, and are refunds and credit notes deducted? | A04, A51, A53 | Incl. GST, cancelled orders excluded, refunds not deducted (shown separately in Payments and Credit notes) | | Open |
| Q-32 | Which **SMS / OTP provider** will be used, and are there other integrations (email, WhatsApp)? | A56 | MSG91 shown as a placeholder; Razorpay and SMS only | | Open |
