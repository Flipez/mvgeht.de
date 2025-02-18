import { useEffect, useState } from "react"
import { StationDelayHourChart } from "~/components/charts/station-delay-hour"
import { ControlBar } from "~/components/history/line_day_delay/control-bar"
import { fetchLineDelay } from "~/components/history/line_day_delay/fetch"
import { Separator } from "~/components/ui/separator"
import { StationsByLine } from "~/data/subway-lines"
import { ChartSettings, StationBucketList } from "~/types/history"
import { addDays, format } from "date-fns"

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export default function History() {
  const [southChartData, setSouthChartData] = useState<StationBucketList[]>([])
  const [northChartData, setNorthChartData] = useState<StationBucketList[]>([])
  const [settings, setSettings] = useState<ChartSettings>({
    chartDate: 0,
    interval: 15,
    realtime: false,
    line: "U6",
  })

  const year = 2024
  const startDate = new Date(year, 1, 16)
  const chartDateFormatted = format(
    addDays(startDate, settings.chartDate),
    "yyyy-MM-dd"
  )
  const debouncedChartDate = useDebounce(chartDateFormatted, 300)

  useEffect(() => {
    async function fetchData() {
      try {
        const [southData, northData] = await Promise.all([
          fetchLineDelay(debouncedChartDate, settings, 1),
          fetchLineDelay(debouncedChartDate, settings, 0),
        ])
        setSouthChartData(southData)
        setNorthChartData(northData)
      } catch (error) {
        console.error("Error fetching chart data:", error)
      }
    }
    fetchData()
  }, [debouncedChartDate, settings])

  return (
    <div className="container mx-auto">
      <ControlBar settings={settings} setSettings={setSettings} />
      <Separator className="my-5" />
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="w-1/2">South</th>
            <th className="w-auto whitespace-nowrap">Station</th>
            <th className="w-1/2">North</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(StationsByLine[settings.line]).map(
            (stationId: string) => {
              let stationDataSouth: StationBucketList | undefined
              if (southChartData) {
                stationDataSouth = southChartData.find(
                  (stationBucketList: StationBucketList) =>
                    stationBucketList.station === stationId
                )
              }

              let stationDataNorth: StationBucketList | undefined
              if (northChartData) {
                stationDataNorth = northChartData.find(
                  (stationBucketList: StationBucketList) =>
                    stationBucketList.station === stationId
                )
              }
              if (
                typeof stationDataSouth === "undefined" ||
                typeof stationDataNorth === "undefined"
              )
                return null
              return (
                <tr key={stationDataSouth.station}>
                  <td className="border-y">
                    <StationDelayHourChart
                      stationData={stationDataSouth}
                      day={debouncedChartDate}
                      interval={settings.interval}
                      yAxisOrientation="left"
                    />
                  </td>
                  <td className="border text-center">
                    <div className="mx-5">
                      {StationsByLine[settings.line][stationId] ??
                        "Unknown Station"}
                    </div>
                  </td>
                  <td className="border-y">
                    <StationDelayHourChart
                      stationData={stationDataNorth}
                      day={debouncedChartDate}
                      interval={settings.interval}
                      yAxisOrientation="right"
                    />
                  </td>
                </tr>
              )
            }
          )}
        </tbody>
      </table>
    </div>
  )
}
