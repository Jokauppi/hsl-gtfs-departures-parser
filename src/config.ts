const second = 1000
const minute = 60 * second
const hour = 60 * minute
const day = 24 * hour

export const dayOffset = 0 * day
export const timeOffset = 0 * hour

export const gtfs_rt_url =
    'https://infopalvelut.storage.hsldev.com/gtfs/hsl.zip'

export const stopsToInclude = new Set([
    '1240134', // A.I. Virtasen aukio (N)
    '1240133', // A.I. Virtasen aukio (S)
    '1240103', // Kustaa Vaasan tie (N)
    '1240118', // Kustaa Vaasan tie (S)
    '1230109', // Hämeentie (N)
    '1230112', // Hämeentie (S)
    '1240418', // 8,6 Trams (N)
    '1240419', // 8,6 Trams (S)
    '1210405', // 13 Tram (W)
    '1210406', // 13 Tram (E)
    '1240102', // Kyläsaarenkatu (S)
])

export const excludeRoutesFromStop: Record<string, string[]> = {
    '1230112': ['1053', '1506'],
    '1230109': ['1506'],
    '1240103': ['1056'],
    '1240118': ['1056'],
    '1240102': ['1055'],
}
