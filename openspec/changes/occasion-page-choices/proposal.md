# Proposal

## Why

The occasion page always shows a card field, although not everyone wants a card, and someone ordering several bouquets may want one card per bouquet or none. There is no way to say what the bouquet should be like ("kun hvide", "ingen liljer"), so such wishes would reach the owner by phone, against her wish for minimal screen and phone time. Delivery asks for a four-digit postcode, while most people think in towns ("Vipperød", "Holbæk"). Felix raised all three on 27 Nov; the explore that day settled the scope with one rule: ask only what changes the bouquet or whether delivery succeeds, and nothing the owner would have to call back about.

## What Changes

- **Card per bouquet, optional, folded away and priced:** the card is offered behind "+ Tilføj et kort (20 kr.)" on the occasion page; opening it shows the field (200 characters, as now). A card costs 20 kr. per bouquet (the owner, 27 Nov), priced on the server like everything else. The slip prints the card text in a box the owner can cut out and put in the card, as she does with Interflora's slips.
- **Wishes per bouquet, new and optional:** "+ Ønsker til buketten" opens a short field (200 characters) with one calm line under it: Nikita binds with the season's flowers and follows the wish as far as she can. The wish travels with the bouquet to the cart, the confirmation email, the confirmation page and the owner's printed slip.
- **Town or postcode in one field:** the delivery field accepts a postcode or a town name and suggests places from the shop's own delivery list as the visitor types ("Hol" → "4300 Holbæk"). The zone and fee check works as today; no outside address service.
- Add-ons (chocolate, vase) stay out of this change: the owner's answers on which and at what price come first.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `storefront` (introduced by the `storefront` change, not yet archived): the card requirement becomes optional and folded away; a wishes requirement is added; delivery accepts a town name as well as a postcode.
- `orders` (introduced by the `checkout-payment` change, not yet archived): each bouquet line records the wish, and the confirmation and the owner's slip show it.
- `catalog`: delivery places can be found by town name as well as by postcode.

## Impact

- **Backend:** a `wish` column on order lines and a card price per line (migration 0009, at most 200 characters), the checkout body's items take `wish`; pricing adds 20 kr. for each bouquet with a card, as a setting the owner can change later; the slip and confirmation templates print the wish, and the card text in a cut-out box; a search over the delivery postcodes by town or postcode prefix.
- **Frontend:** the occasion page form (card and wish toggles, the combined place field), the cart line, the checkout summary and the confirmation page; the cart store keeps the wish per line.
- **Order of merging:** after `storefront` and `checkout-payment`, whose specs this change modifies; it branches from `feature/storefront`.
- **From the owner interview of 27 Nov:** a card costs 20 kr. per bouquet; she follows wishes "as far as she can". Still unanswered: whether two bouquets usually go to the same recipient (one delivery per basket stays meanwhile).
