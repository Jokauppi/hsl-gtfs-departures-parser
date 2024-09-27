# HSL GTFS & GTFS-RT Departures Parser

Terminal application using HSL's [open GTFS APIs](https://www.hsl.fi/en/hsl/open-data) to parse route data for specified stops to allow querying for upcoming departures.

![image](https://github.com/user-attachments/assets/0a8cfb60-9d90-44b0-aa31-d818e66e8065)

This project is meant as a testing ground to create logic for node.js endpoints supplying data to a public transport timetable display.

## Installation & Usage

```bash
git clone https://github.com/Jokauppi/hsl-gtfs-departures-parser.git
cd hsl-gtfs-departures-parser
npm install
npm start
```

Included stops are specified in [config.ts](src/config.ts). Different GTFS URLs may also be specified but CSV parsing may fail if column indexes don't match.

Application assumes unzipped GTFS data is placed in `./data` directory.
