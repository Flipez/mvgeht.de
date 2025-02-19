import { Departure, Station, StationList } from "~/types/departures"
import { t } from "i18next"
import moment from "moment"

// eslint-disable-next-line import/no-named-as-default-member
const { unix } = moment

/**
 * Formats a delay in minutes into a human-readable string.
 * @param {number} minutes - The delay in minutes.
 * @returns {string} The formatted delay string (e.g., "5m 30s").
 */
export function formatDelay(minutes: number) {
  const mins = Math.floor(minutes)
  const secs = Math.round((minutes - mins) * 60)

  if (mins === 0) {
    return `${secs}s`
  }
  if (secs === 0) {
    return `${mins}m`
  }
  return `${mins}m ${secs}s`
}

/**
 * Converts a timestamp to a human-readable relative time string.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted relative time string (e.g., "2 minutes ago", "30 seconds", "5 Min")
 */
export function relativeTime(timestamp: number): string {
  const date = unix(timestamp / 1000)
  const diffInSeconds = date.diff(moment(), "seconds")

  // Future time more than a minute
  if (diffInSeconds >= 60) {
    return `${Math.round(diffInSeconds / 60)} Min`
  }

  if (diffInSeconds < 0) {
    return t("Misc.Departed")
  }

  // Within a minute (past)
  const absDiff = Math.abs(diffInSeconds)
  return `${absDiff} ${t("Misc.SecondsShort")}`
}

/**
 * Formats a timestamp into a time string (e.g., "14:30").
 * @param {number} timestamp - The timestamp in milliseconds.
 * @returns {string} The formatted time string.
 */
export function formatTime(timestamp: number): string {
  const date = unix(timestamp / 1000)
  return date.format("HH:mm")
}

export function stationWithMostDelay(stations: StationList): Station | null {
  if (Object.values(stations).length == 0) {
    return null
  }
  const max = Object.values(stations).reduce((prev, current) =>
    prev && prev.avgDelay > current.avgDelay ? prev : current
  )
  return max
}

export function departureWithMostDelay(station: Station): Departure {
  const max = Object.values(station.departures).reduce((prev, current) =>
    prev && prev.delayInMinutes > current.delayInMinutes ? prev : current
  )
  return max
}
