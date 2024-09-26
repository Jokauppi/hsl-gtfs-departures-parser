export const dateFromYYYYMMDD = (timestamp: string) =>
    new Date(
        parseInt(timestamp.substring(0, 4)),
        parseInt(timestamp.substring(4, 6)) - 1,
        parseInt(timestamp.substring(6, 8))
    )
