## Purpose

Defines the florist's brand system (logo, colour, typography, tokens, guide and skill) so that every screen and every AI session draws on the same recorded, owner-approved choices.

## ADDED Requirements

### Requirement: Logo comes from Felix
The logo artwork SHALL be designed and supplied by Felix. AI-generated logo artwork MUST NOT be part of the brand. The logo SHALL NOT contain the shop's phone number.

#### Scenario: Logo files delivered
- **WHEN** the logo files are added to the brand folder
- **THEN** they are vector files supplied by Felix, they contain no phone number, and the brand guide names Felix as their author

#### Scenario: Logo stays legible when small
- **WHEN** the logo or its small mark is rendered at 16, 32 and 64 px on every ground colour
- **THEN** it is recognisable at each size, or the brand guide states the minimum size below which the small mark is used instead

### Requirement: Brand serif for headings, system font for body
The logo and headings SHALL use Ancizar Serif, served from the shop's own domain under a licence that permits commercial self-hosting. Body and interface text SHALL use the visitor's system font stack, so it reads like the text people meet every day on their device and needs no download. Every typeface in use MUST render the Danish letters æ, ø and å.

#### Scenario: Body typeface confirmed on a specimen
- **WHEN** Felix reviews Danish sample copy (heading, product name, price, button, body at 16 px) at a 390 px viewport
- **THEN** the body typeface is recorded as approved or replaced, with the reason, before it is written into the brand guide

#### Scenario: Danish letters render
- **WHEN** text containing æ, ø, å, Æ, Ø and Å is shown in headings and in body text, in every weight used
- **THEN** each letter renders in the intended typeface: headings from Ancizar Serif, body from the system font, with no missing-glyph boxes

#### Scenario: No third-party font requests
- **WHEN** the brand board is loaded with the network panel open
- **THEN** the only font files requested are the brand serif files from a local path, and none come from an external font service

### Requirement: Colours have roles and checked pairings
Every brand colour SHALL have a named role. The brand guide SHALL list which text and background pairings are allowed and which are forbidden. Every allowed pairing MUST meet WCAG 2.1 AA: at least 4.5:1 for body text, and at least 3:1 for large text and interface parts.

#### Scenario: Pairing table is computed
- **WHEN** the contrast of every text and background pairing is calculated from the token values
- **THEN** each allowed pairing meets its threshold and each failing pairing is listed as forbidden

#### Scenario: Palette source recorded
- **WHEN** a colour is added to the palette
- **THEN** the decision log records where it came from (Felix, the owner or the shop's material) and why it was kept

### Requirement: Tokens are the single source
Colour and type values SHALL be defined once as design tokens. The brand board and later the app SHALL read them from there.

#### Scenario: One change, visible everywhere
- **WHEN** one colour token value is changed
- **THEN** the brand board shows the new value everywhere that colour is used, with no other file edited

### Requirement: Brand guide and project skill
The repository SHALL contain a brand guide covering logo use, colour roles and pairings, typography, imagery direction, Danish voice and licence status, and a project skill that gives AI sessions the same rules. The Anthropic brand skill MUST NOT remain in the project once the florist's skill exists.

#### Scenario: AI session applies the florist's brand
- **WHEN** a new AI session is asked to style a component
- **THEN** the florist brand skill is available, and no skill in the project carries another organisation's colours or fonts

#### Scenario: Licence status is complete
- **WHEN** the licence table in the brand guide is read
- **THEN** the logo and each font has a named licence, holder and source, and none is marked unknown

### Requirement: Owner approval
The brand SHALL be approved by the shop owner before it is merged and applied to the storefront.

#### Scenario: Sign-off recorded
- **WHEN** the owner has reviewed the brand board
- **THEN** the approval, its date and any requested changes are recorded in the process note
