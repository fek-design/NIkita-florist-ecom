## ADDED Requirements

### Requirement: One hi-fi set covers the whole shop
The hi-fi set SHALL contain, at 402 px wide, every screen a customer meets from the front page to the order confirmation and every screen the owner uses in the back office, named after the routes they become.

#### Scenario: Set complete
- **WHEN** the set is reviewed
- **THEN** it holds the front page, menu, category page, occasion page with its out-of-area state, added-to-cart confirmation, cart, checkout and order confirmation, and the back office's sign-in, orders, order detail, occasions list, edit occasion, delivery settings and sales overview

### Requirement: Every element is traced to a source
Each element in the set SHALL cite a proven pattern (Baymard, Nielsen Norman Group, Shopify Polaris), Felix's competitor analysis, the brand guide or a logged design decision. An element without one SHALL be marked on the screen as a proposal for Felix.

#### Scenario: Unsourced element
- **WHEN** an element has no pattern, competitor finding, brand rule or decision behind it
- **THEN** it carries a visible "Forslag" marker and is listed for Felix

### Requirement: Felix's design and decisions stay intact
The set SHALL keep Felix's front page and the logged decisions (DD-01 to DD-14). Changes to his front page SHALL be limited to what the decisions allow and SHALL be marked.

#### Scenario: Front page in the set
- **WHEN** the set's front page is compared with Felix's frame
- **THEN** every difference is either covered by a logged decision or marked as a proposal

### Requirement: Versions are kept between tests
Before each usability test round the set SHALL be frozen as a version: a Figma page named `vN`, PNG exports in `docs/design/versions/vN/`, and a changelog naming each change, its reason and the test finding behind it.

#### Scenario: After the first test
- **WHEN** a test finding changes a screen
- **THEN** the change is made in a new version and v1 stays unchanged, with the finding in v2's changelog
