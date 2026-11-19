## ADDED Requirements

### Requirement: Available delivery dates
The API SHALL list the dates a customer can choose, for delivery or for pickup, from today in Danish time up to 60 days ahead. A date SHALL be offered only if it is one of the delivery weekdays and not a closed date. Today SHALL be offered only before the same-day cut-off time. The answer SHALL NOT reveal the daily capacity. Capacity is added to this rule when orders exist.

#### Scenario: Before the cut-off
- **WHEN** dates are requested at 10:00 Danish time on a delivery weekday
- **THEN** today is the first date offered

#### Scenario: After the cut-off
- **WHEN** dates are requested at 12:30 Danish time on a delivery weekday with a 12:00 cut-off
- **THEN** today is not offered and the first date is the next delivery weekday

#### Scenario: Closed days and weekdays
- **WHEN** the week contains a Sunday (not a delivery weekday) and a closed date
- **THEN** neither date is offered

#### Scenario: Window
- **WHEN** dates are requested
- **THEN** no date later than 60 days from today in Danish time is offered
