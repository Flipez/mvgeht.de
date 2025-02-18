import { ChartSettings } from "~/types/history"

export async function fetchLineDelay(
  debouncedChartDate: string,
  settings: ChartSettings,
  south: number
) {
  let url: string
  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    url = "http://localhost:8080/line_delay"
  } else {
    url = "https://api.mvgeht.de/line_delay"
  }
  const response = await fetch(
    `${url}?
        south=${south}
        &date=${encodeURIComponent(debouncedChartDate)}
        &interval=${settings.interval}
        &label=${settings.line}
        &realtime=${settings.realtime ? 1 : 0}`.replace(/\s+/g, "")
  )

  const data = await response.json()
  return data
}
