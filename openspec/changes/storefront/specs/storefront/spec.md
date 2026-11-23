## Purpose

The pages a customer uses to choose flowers on a phone: the occasions, one occasion with its three tiers and the delivery choice, and the cart. They show the shop's real rules and prices from the catalogue and keep the cart between visits.

## ADDED Requirements

### Requirement: Front page leads with a featured bouquet and the top occasions
The front page SHALL follow Felix's design (DD-01), in this order: hero photo, one featured bouquet (DD-04), the four best-selling visible occasions, a "Se alle" button to the category page, and "Besøg Nikita". Each occasion card SHALL show its main photo or a Linen placeholder, its name and its lowest price ("fra 250 kr."). Until orders exist, the owner's sort order SHALL stand in for best-selling.

#### Scenario: Front page on a phone
- **WHEN** a visitor opens the front page at 390 px wide
- **THEN** the featured bouquet and four occasions appear in that order, with their lowest prices, without horizontal scrolling

#### Scenario: Before any orders
- **WHEN** no orders exist yet
- **THEN** the four occasions shown are the first four in the owner's sort order

#### Scenario: Sold out
- **WHEN** an occasion is sold out
- **THEN** its card says "Udsolgt" in text, not only by colour or opacity

### Requirement: Category page with every occasion
The category page at `/anledninger` SHALL list every visible occasion in the same card style as the front page, ordered best-selling first (owner's order until orders exist). "Se alle" on the front page SHALL lead to it.

#### Scenario: See all
- **WHEN** a visitor taps "Se alle"
- **THEN** the category page lists all five occasions

### Requirement: Delivery facts are easy to find
The delivery fee, the delivery area, the same-day cut-off and that pickup is possible SHALL be stated in plain words, read from the delivery rules, on the occasion page with the delivery choice (P3, DD-14). The fee SHALL be shown as soon as a postcode is entered, before anything is added to the cart. The front page does not carry them.

#### Scenario: Fee before checkout
- **WHEN** a visitor has entered a postcode on the occasion page
- **THEN** the delivery fee is shown before anything is added to the cart

### Requirement: Images load without jumps
Every photo SHALL have its dimensions reserved and a Linen background while it loads, so nothing on the page moves when it arrives (P7). Photos below the first screen SHALL load only as the visitor scrolls towards them; the hero photo SHALL load first.

#### Scenario: Slow connection
- **WHEN** the front page loads on a slow connection
- **THEN** each photo's place is shown as a Linen area of the final size, and the layout does not shift when the photo appears

### Requirement: Occasion page with three tiers
The occasion page SHALL be at `/anledning/<slug>` and SHALL show the name, intro, description, photos (or a placeholder area), and the three tiers with their prices including moms and sizes in words. Exactly one tier SHALL be selected at a time. An unknown or hidden occasion SHALL show a Danish not-found page with a link back to the occasions.

#### Scenario: Choosing a tier
- **WHEN** a visitor selects Stor
- **THEN** Stor is marked as selected (not by colour alone) and the price on the add button changes to Stor's price

#### Scenario: Unknown occasion
- **WHEN** a visitor opens `/anledning/findes-ikke`
- **THEN** the page answers 404 with a Danish message and a link to the front page

### Requirement: Delivery is chosen before adding
Before a bouquet can be added, the visitor SHALL choose delivery or pickup and a date from the available delivery dates. For delivery, the visitor SHALL enter a postcode; the page SHALL say at once whether the shop delivers there and at what fee, and SHALL offer pickup when it does not (P3). The order has one delivery choice: if the cart already has one, the page SHALL start from it, and choosing a different one SHALL change it for the whole cart after the visitor confirms.

#### Scenario: Postcode inside the zone
- **WHEN** a visitor chooses delivery and enters 4300
- **THEN** the page says that the shop delivers to Holbæk for 80 kr.

#### Scenario: Postcode outside the zone
- **WHEN** a visitor enters 8000
- **THEN** the page says the shop does not deliver there and offers pickup in the shop

#### Scenario: Only real dates
- **WHEN** the visitor opens the date choice
- **THEN** only the dates from the available-dates rule can be chosen

#### Scenario: Changing the delivery for the whole order
- **WHEN** the cart has delivery on one date and the visitor picks another date for a new bouquet
- **THEN** the page asks whether to move the whole order to the new date, and changes nothing unless the visitor confirms

### Requirement: Card message per bouquet
The occasion page SHALL let the visitor add a card message of at most 200 characters to each bouquet, and the cart SHALL show it with that bouquet. The message is optional.

#### Scenario: Message too long
- **WHEN** a visitor types more than 200 characters
- **THEN** the field shows how many characters remain and does not accept more

### Requirement: Cart kept across visits
The cart SHALL list each bouquet with occasion, tier, card message, unit price and quantity, and SHALL allow changing the quantity (1 to 10) and removing a bouquet. It SHALL survive a page reload and a closed tab on the same device.

#### Scenario: Reload
- **WHEN** a visitor adds a bouquet and reloads the cart page
- **THEN** the bouquet, its card message and the delivery choice are still there

#### Scenario: Quantity limits
- **WHEN** a visitor tries to set a quantity below 1 or above 10
- **THEN** the quantity stays within 1 to 10, and removing is a separate, labelled action

### Requirement: Cart totals with current prices
The cart SHALL show the delivery choice, the delivery fee (none for pickup), and the total including moms. Prices in the cart are for display: the cart SHALL refresh them from the catalogue when opened and say so if one has changed. Checkout SHALL be shown as coming, not as a working button, until the checkout exists.

#### Scenario: Totals
- **WHEN** the cart holds one Mellem Fødselsdag at 350 kr. for delivery to 4300
- **THEN** it shows 350 kr. for the bouquet, 80 kr. delivery and 430 kr. in total including moms

#### Scenario: Pickup
- **WHEN** the order is for pickup
- **THEN** no delivery fee is added

#### Scenario: Price changed since adding
- **WHEN** a bouquet's price in the catalogue differs from the price stored in the cart
- **THEN** the cart shows the current price and a short note that it was updated

#### Scenario: Unavailable bouquet
- **WHEN** a bouquet in the cart is now hidden or sold out
- **THEN** the cart marks it as unavailable and leaves it out of the total

### Requirement: Placeholder content is marked
Any occasion, price or delivery fact that the API marks as a placeholder SHALL be shown with a visible "Eksempel" label, and photo areas without owner photos SHALL say that the photo is coming.

#### Scenario: Seeded catalogue
- **WHEN** the front page shows the seeded occasions
- **THEN** each card carries the "Eksempel" label

### Requirement: Findable pages
Every page SHALL have its own Danish title and description. The site SHALL serve `sitemap.xml` with the front page and every visible occasion page, and `robots.txt` that allows search engines and AI crawlers and points to the sitemap. Each occasion page SHALL carry product data with the price range in DKK. Business data (name, address, CVR, phone) SHALL NOT be published until the owner's real details exist.

#### Scenario: Sitemap
- **WHEN** a crawler fetches `/sitemap.xml`
- **THEN** it lists the front page and the five occasion pages, and not the cart or the status page

#### Scenario: Product data
- **WHEN** a crawler reads an occasion page
- **THEN** it finds product data with the lowest and highest tier price in DKK

### Requirement: Usable on a phone and by keyboard
Every storefront page SHALL work at 390 px wide without horizontal scrolling, with tap targets of at least 44 px. Every control SHALL be reachable and usable by keyboard with the brand's visible focus ring, every field SHALL have a visible label, and errors SHALL be shown under their field. Fonts SHALL load only from the shop's own address.

#### Scenario: Keyboard only
- **WHEN** a visitor uses only the keyboard from the front page to the cart
- **THEN** they can choose an occasion, a tier, delivery, a date, and add to the cart, and the focus is always visible

#### Scenario: No third-party fonts
- **WHEN** any storefront page loads
- **THEN** no font is requested from another address
