# Spec Delta

## Purpose

Defines the florist's visual identity as concrete, checkable assets and rules: logo variants, colour and type tokens, and licence status. Every screen and every AI session uses this one brand.

## ADDED Requirements

### Requirement: Scalable logo variants
The brand SHALL provide the logo as SVG in four lockups (primary circle, horizontal, wordmark, leaf mark), each in full colour, ink and white, with a transparent background.

#### Scenario: Variant set is complete
- **WHEN** the logo folder is listed
- **THEN** it contains 12 SVG files, one per lockup and colour, and none contains an embedded raster image

#### Scenario: Scales without quality loss
- **WHEN** any SVG variant is rendered at 64 px and at 2000 px wide
- **THEN** edges are sharp at both sizes and the variant shows no background fill

### Requirement: Logo contains no contact details
No logo variant SHALL contain a phone number, address or other contact detail.

#### Scenario: Phone number removed
- **WHEN** any logo variant is inspected
- **THEN** it contains no phone number (the old "TLF. 28 25 74 13" line is gone), address, email or web address

### Requirement: Small-size mark stays legible
The brand SHALL provide a simplified leaf mark that remains recognisable as a ginkgo leaf at 16 px and 32 px, for use as favicon and social avatar.

#### Scenario: Favicon legibility
- **WHEN** the favicon is rendered at 16 px and 32 px
- **THEN** the leaf outline reads as one clear shape, not merged or broken lines

### Requirement: Colour tokens with defined roles
The brand SHALL define each colour as a named token with a hex value and a role: page ground, sand, brown, ink, and functional colours for error, success and focus.

#### Scenario: Starting palette preserved
- **WHEN** the colour tokens are read
- **THEN** sand #DCD4D1, brown #7A644F and ink #2D2A26 are present, or any change to them is recorded with its reason

#### Scenario: Flowers carry the colour
- **WHEN** the token set is reviewed
- **THEN** it contains no decorative accent hue beyond the brand neutrals and the functional colours

### Requirement: Approved colour pairings meet WCAG 2.1 AA
Every text and background pairing the brand guide allows SHALL meet 4.5:1 for body text, or 3:1 for large text and UI graphics. Failing pairings SHALL be listed as forbidden.

#### Scenario: Pairing table is verified
- **WHEN** the contrast of every allowed pairing is computed from the token values
- **THEN** each meets the threshold for its stated use

#### Scenario: Known failing pairing is forbidden
- **WHEN** the guide's forbidden list is read
- **THEN** it includes brown on ink (2.56:1) and brown body text on sand (3.82:1)

### Requirement: Web typography limited and licensed
The brand SHALL use at most two type families on the web, each with a licence that permits web embedding in a commercial site, plus a defined fallback stack and type scale.

#### Scenario: Licence recorded
- **WHEN** the typography section of the guide is read
- **THEN** each family lists its licence and source, and the licence permits commercial web use

### Requirement: Licence status for every logo element
The brand guide SHALL record each logo typeface and the artwork with its licence and licence holder. No element with a non-commercial or unknown licence SHALL ship.

#### Scenario: Old non-commercial font retired
- **WHEN** the launch logo is inspected
- **THEN** it uses no "A Day Without Sun" glyphs, and every typeface in it has a commercial licence recorded with its holder

#### Scenario: Web use checked separately
- **WHEN** a logo typeface is also proposed as a web font
- **THEN** the guide records whether its licence permits self-hosted web embedding that does not depend on one person's subscription

### Requirement: Original logo artwork
All logo artwork SHALL be original vector work made for this brand: AI-constructed paths for the leaf, and Felix's typography. No part SHALL be traced from the old leaf or taken from image-model or stock imagery.

#### Scenario: No traced or embedded artwork
- **WHEN** the delivered SVGs are inspected and compared with the old logo
- **THEN** they contain no embedded raster image, and the leaf is a new construction rather than a trace of the old one

#### Scenario: Feel of the old logo kept
- **WHEN** the old and new logos are shown side by side to the owner
- **THEN** she confirms that the new one keeps the feel (circle, ginkgo, classic serif name, warm brown), and her sign-off is recorded

#### Scenario: One leaf family across sizes
- **WHEN** the detailed leaf (primary lockup) and the small-size leaf mark are shown side by side
- **THEN** they share the same silhouette and stem, and differ only in the number of veins

### Requirement: Tokens are the single source
The brand board and the webshop SHALL read colour and type values from the same token file, so the documented brand and the built site cannot differ.

#### Scenario: Board uses tokens
- **WHEN** a token value is changed
- **THEN** the brand board shows the new value without its own markup being edited
