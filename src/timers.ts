const timers: Record<string, number> = {}

export const startTimer = (label: string) => {
    timers[label] = Date.now()

    console.log(`Starting ${label}`)
}

export const endTimer = (label: string) => {
    const start = timers[label]

    if (!start) {
        console.log(`No timer was started for ${label}`)
        return
    }

    const duration = Date.now() - start?.valueOf()

    console.log(`${label} took ${duration}ms`)
}
