## MODIFIED Requirements

### Requirement: Card message per bouquet
The occasion page SHALL offer a card for each bouquet behind a link that states its price, "+ Tilføj et kort (20 kr.)", so the field is shown only to those who want a card. The message SHALL be at most 200 characters. A bouquet with a card message SHALL carry the card price, shown in the price summary before adding and in the cart; removing the text, or closing the card again, SHALL leave the bouquet without a card and without the price.

#### Scenario: No card wanted
- **WHEN** a visitor adds a bouquet without opening "+ Tilføj et kort (20 kr.)"
- **THEN** the bouquet is added without a card message and without the card price, and no card field was shown

#### Scenario: Card with a message
- **WHEN** a visitor adds Bisættelse Mellem (400 kr.) with a card message, for delivery to 4300
- **THEN** the summary reads 400 kr. + kort 20 kr. + levering 80 kr. = 500 kr. inkl. moms

#### Scenario: Message too long
- **WHEN** a visitor types more than 200 characters
- **THEN** the field shows how many characters remain and does not accept more

### Requirement: Delivery is chosen before adding
Before a bouquet can be added, the visitor SHALL choose delivery or pickup and a date from the available delivery dates. For delivery, the visitor SHALL enter a postcode or a town name in one field; while they type, the page SHALL suggest matching places from the shop's delivery list. The page SHALL say at once whether the shop delivers there and at what fee, and SHALL offer pickup when it does not (P3). The order has one delivery choice: if the cart already has one, the page SHALL start from it, and choosing a different one SHALL change it for the whole cart after the visitor confirms.

#### Scenario: Postcode inside the zone
- **WHEN** a visitor chooses delivery and enters 4300
- **THEN** the page says that the shop delivers to Holbæk for 80 kr.

#### Scenario: Town name
- **WHEN** a visitor types "Vipp" and picks "4390 Vipperød" from the suggestions
- **THEN** the page says that the shop delivers to Vipperød and at what fee

#### Scenario: Town outside the zone
- **WHEN** a visitor types a town that is not on the delivery list, such as "Aarhus"
- **THEN** no place is suggested, and the page says the shop does not deliver there and offers pickup in the shop

#### Scenario: Postcode outside the zone
- **WHEN** a visitor enters 8000
- **THEN** the page says the shop does not deliver there and offers pickup in the shop

#### Scenario: Only real dates
- **WHEN** the visitor opens the date choice
- **THEN** only the dates from the available-dates rule can be chosen

#### Scenario: Changing the delivery for the whole order
- **WHEN** the cart has delivery on one date and the visitor picks another date for a new bouquet
- **THEN** the page asks whether to move the whole order to the new date, and changes nothing unless the visitor confirms

## ADDED Requirements

### Requirement: Wishes per bouquet
The occasion page SHALL offer, behind a link "+ Ønsker til buketten", an optional field of at most 200 characters for wishes about the bouquet, with a line saying that the bouquet is bound with the season's flowers and the wish is followed as far as possible. The wish SHALL belong to that bouquet, and the cart SHALL show it with the bouquet.

#### Scenario: A colour wish
- **WHEN** a visitor opens "+ Ønsker til buketten", writes "Gerne hvide og grønne farver" and adds the bouquet
- **THEN** the cart shows the wish with that bouquet

#### Scenario: Two bouquets, two wishes
- **WHEN** a visitor adds two bouquets with different wishes
- **THEN** each wish stays with its own bouquet in the cart, the order and the slip
