import GtfsRTBindings from 'gtfs-realtime-bindings'
import { gtfs_rt_url } from '../config'
import { endTimer, startTimer } from '../timers'
import { type Departure } from './types'

const getStopTimesRealtime = async (
    routes: Map<string, string>,
    vehicleTypes: Map<string, string>
): Promise<Departure[]> => {
    startTimer('loadStopTimesRealtime')

    const stop_times = await fetch(gtfs_rt_url)
        .then((response) => response.arrayBuffer())
        .then((buffer) =>
            GtfsRTBindings.transit_realtime.FeedMessage.decode(
                new Uint8Array(buffer)
            )
        )
        .then((feed) =>
            feed.entity
                .map(({ tripUpdate }) => {
                    if (!tripUpdate?.trip.routeId) return undefined

                    return {
                        route: routes.get(tripUpdate.trip.routeId),
                        vehicleType:
                            vehicleTypes.get(tripUpdate.trip.routeId) ?? 'bus',
                        routeId: tripUpdate.trip.routeId,
                        stopId: tripUpdate.stopTimeUpdate[0].stopId,
                        realtime: true,
                    }
                })
                .filter((departure) => departure !== undefined)
        )

    endTimer('loadStopTimesRealtime')

    return stop_times
}
