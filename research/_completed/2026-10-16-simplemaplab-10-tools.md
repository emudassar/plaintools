# 2026-10-16: 10 location tools modelled on simplemaplab.com

User asked: research simplemaplab.com in Semrush, find 10 tools with search volume that get traffic, keyword-research
them, pick low competition, build better versions, test, push once at the end.

## Competitor (Semrush sr05, US db, 2026-10-15 snapshot)

simplemaplab.com: 99.8K organic traffic, 225 pages. Top tool pages by traffic: time-zone-finder 21.2K, my-elevation
11.9K, what-zip-code-am-i-in 11K, equator 7.1K, halfway-between-two-places 4.3K, address-to-county-lookup 4K,
what-city-am-i-in 3.6K, what-state-am-i-in 2.9K, what-country-am-i-in 2.5K, crow-flies-distance 2.5K,
distance-between-two-places 1.8K, map-radius-tool 1.7K, random-location-generator 1.1K, what-county-am-i-in 711,
sun-position-calculator 201, horizon-distance-calculator 38.

## Keyword research (Semrush KMT, US; volume / KD) and SERP check (top-10 page AS / ref domains)

| # | Slug | Main keyword | Vol / KD | SERP |
|---|---|---|---|---|
| 1 | what-is-my-elevation | what is my elevation (+ current elevation 12,100/38, elevation finder 1,600/17) | 12,100 / 36 | weak: whatismyelevation.com strong, rest AS 0-25 small sites |
| 2 | what-county-am-i-in | what county am i in (+ right now 8,100/33) | 74,000 / 39 | weak: geocodify, ultimaps, randymajors, small sites RD 2-20 |
| 3 | what-state-am-i-in | what state am i in (+ right now 3,600/39) | 14,800 / 41 | weak: latlng.work AS0, gps-coordinates.org RD3 |
| 4 | what-country-am-i-in | what country am i in | 18,100 / 25 | weak: mapdevelopers RD3, simplemaplab RD1 |
| 5 | as-the-crow-flies-distance-calculator | (+ crow flies distance 2,400/23, finder 1,600/14) | 2,900 / 28 | medium: gps-coordinates.net, freemaptools; mapscaping RD35 |
| 6 | halfway-point-between-two-cities-calculator | (+ halfway point between two cities 1,300/32) | 1,900 / 13 | medium: travelmath, meetways; mappr RD4 |
| 7 | random-location-generator | random location generator | 3,600 / 12 | weak: hiveword (names), random.org, small sites AS0 |
| 8 | radius-map | radius map (+ mile radius map 1,900/35, map radius 2,900/25) | 8,100 / 23 | very weak: obeattie github AS7, app stores, forums |
| 9 | sun-position-calculator | sun position calculator | 720 / 27 | not checked |
| 10 | distance-to-horizon-calculator | distance to horizon calculator | 210 / 12 | not checked |

Rejected: what time zone am i in (135K/55; timeanddate, nist.time.gov, 24timezones hold the SERP), antipodes map
(antipodesmap.com AS65 RD1,176), what is my zip code (KD50; OSM postcodes not authoritative), what city am i in
(KD62), latitude and longitude finder (KD76), dms to decimal (KD62), gps coordinate converter (KD54).

## Sources verified 2026-10-16 (curl, CORS checked with an Origin header)

- USGS EPQS `https://epqs.nationalmap.gov/v1/json?x=&y=&units=Feet|Meters&wkid=4326`: ACAO *, 3DEP. Value is a number
  or a numeric string; resolution 1 (m) or arc-second degrees; covers US + some of Canada/Mexico; ocean returns a
  plain-text 'Invalid or missing input parameters' or 'Call failed' with HTTP 200. Timings 1.2-5.8 s (hedge it).
- Open-Meteo Elevation API `https://api.open-meteo.com/v1/elevation?latitude=&longitude=`: ACAO *, Copernicus DEM
  GLO-90 (90 m). Ocean -> 0. Everest 8,724 (90 m cell averages, not summits). Attribution to Copernicus + Open-Meteo
  required. Forecast API `timezone=auto` returns IANA timezone for a point (used by sun tool).
- FCC Area API `https://geo.fcc.gov/api/census/area?lat=&lon=&format=json`: ACAO *, Census 2020 blocks: county_name,
  county_fips, state_name, state_code, block_fips. Outside US/ocean -> `results: []`. PR works (municipio).
- Photon reverse (already used): country, countrycode, state, county, city, postcode.
- OSM tiles `https://tile.openstreetmap.org/{z}/{x}/{y}.png`: ACAO *, tile usage policy read: visible attribution
  "© OpenStreetMap contributors", browser default UA + Referer fine, no prefetch/bulk, no no-cache headers.
- Vincenty 1975 (NGS PUBS_LIB/inverse.pdf) inverse + direct on WGS84 (a 6378137, f 1/298.257223563).
- MathWorld Sphere Point Picking: phi = acos(2v-1) -> lat = asin(2v-1), lon uniform.
- NOAA GML Solar Calculation Details: Meeus equations; sunrise/sunset 0.833 deg refraction; +-1 min within +-72 lat,
  10 min outside; refraction model bands 85/5/-0.575 deg; calculator no longer maintained (said on page).
- Wikipedia Horizon: d = sqrt(2Rh + h^2), R 6371 km, 3.57 sqrt(h); A. T. Young (SDSU Green Flash): refraction
  R' = 7R/6 -> 3.86 sqrt(h) km.
- W3C Geolocation: coords.altitude is metres above the WGS84 ellipsoid (not sea level).
