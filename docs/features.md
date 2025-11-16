# Features
 - login + oauth?
 - Display the map
 - Displaying current(ish) alerts
    - Decide when they expire
    - pop-up for new alerts
    - determine relative closeness by ip code or distance?
 - Create an alert
 - profile (change zip)
 - Upvoting sightings

# Concerns
 - People false reporting
 - How much data do we want to collect from users
 - How do we inform users of new sightings
    - the server needs to know who to ping/inform when a new sighting occurs

# Screens
 - Login screen
    - oauth?: name, email + zip-code
    - Grab zip through current location?

- Map screen
    - Google map API
    - Button to add pin
        - 1. use current location?
        - 2. click to add in specific location? (no button)
    - Change zip??
    - List of recent alerts (~1 day) + points on map

- Info pop-up 
    - when (get auto)
    - where (get auto)
    - details (input)
    - image?