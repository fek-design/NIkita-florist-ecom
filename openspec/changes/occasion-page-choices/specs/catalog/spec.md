## ADDED Requirements

### Requirement: Delivery places found by town or postcode
The API SHALL suggest places on the shop's delivery list that match what a customer types: the start of a postcode or of a town name, without regard to case and to the Danish letters æ, ø and å being typed as such. Each suggestion SHALL give the postcode and the town. At most eight places SHALL be suggested, and nothing from outside the delivery list.

#### Scenario: Start of a town
- **WHEN** a customer types "hol"
- **THEN** the suggestions include "4300 Holbæk"

#### Scenario: Start of a postcode
- **WHEN** a customer types "43"
- **THEN** the suggestions include the places whose postcode starts with 43, such as 4300 Holbæk and 4340 Tølløse

#### Scenario: Not on the list
- **WHEN** a customer types "Aarhus"
- **THEN** there are no suggestions
