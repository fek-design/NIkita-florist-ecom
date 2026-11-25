## ADDED Requirements

### Requirement: Pickup slots
The API SHALL publish the pickup slots for a chosen day: one-hour slots within that day's opening hours, from the next whole hour on today, each marked available or full against the number of pickups the owner accepts per slot (DD-18). It SHALL NOT publish how many places are left. Opening hours and pickups per slot come from the shop settings and are placeholders until the owner confirms them.

#### Scenario: Slots for tomorrow
- **WHEN** the storefront asks for tomorrow's pickup slots and opening hours are 10–17
- **THEN** it receives seven slots, 10–11 to 16–17, each available or full

#### Scenario: Full slot
- **WHEN** the 12–13 slot has as many paid or pending pickups as allowed
- **THEN** that slot is marked full and cannot be chosen
