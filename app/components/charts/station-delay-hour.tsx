import React from "react"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "~/components/ui/chart"
import { Bucket, StationBucketList } from "~/types/history"
import { format } from "date-fns"
import { Area, AreaChart, YAxis } from "recharts"

import { ShowPercentage } from "../history/line_day_delay/control-bar"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

// Helper to generate time buckets between two timestamps (inclusive)
function generateTimeBuckets(
  startTime: number,
  endTime: number,
  intervalMinutes: number
) {
  const buckets = []
  const interval = intervalMinutes * 60 * 1000 // in ms
  for (let t = startTime; t <= endTime; t += interval) {
    buckets.push(t)
  }
  return buckets
}

function fillMissingBuckets(
  bucketsData: Bucket[],
  startTime: number,
  endTime: number,
  intervalMinutes: number
) {
  const completeBuckets = generateTimeBuckets(
    startTime,
    endTime,
    intervalMinutes
  )
  // Create a lookup from timestamp to data
  const lookup: { [key: number]: Bucket } = {}
  bucketsData.forEach((item: Bucket) => {
    // Convert bucket string to timestamp
    const time = new Date(item.bucket.replace(" ", "T")).getTime()
    lookup[time] = item
  })

  // Create a new array with every bucket; if missing, avgDelay is null
  return completeBuckets.map((time) => {
    return lookup[time]
      ? { ...lookup[time], bucket: time }
      : { bucket: time, avgDelay: null, numDepartures: null }
  })
}

interface ChartElement {
  payload?: DataPayload | undefined
  value?: number | string | undefined | (string | number)[]
}

interface DataPayload {
  avgDelay: number
  numDepartures: number
  bucket: string
}

interface CustomTooltipProps {
  active?: boolean
  elements?: ChartElement[]
  showPercentage: boolean
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  elements,
  showPercentage,
}) => {
  if (!active || !elements?.length || !elements[0].payload) {
    return null
  }

  const { bucket, numDepartures } = elements[0].payload
  const value = Number(elements[0].value).toFixed(2)
  const measureLabel = showPercentage ? "% delayed" : "Avg Delay"

  return (
    <div
      style={{ position: "relative", zIndex: 9999 }}
      className="rounded border bg-white p-2 shadow"
    >
      <p className="text-sm">{`Time: ${format(bucket, "HH:mm")}`}</p>
      <p className="text-sm">{`# Departures: ${numDepartures}`}</p>
      <p className="text-sm">{`${measureLabel}: ${value}`}</p>
    </div>
  )
}

export function StationDelayHourChart({
  stationData,
  day,
  interval,
  yAxisOrientation,
  showPercentage,
}: {
  stationData: StationBucketList
  day: string
  interval: number
  yAxisOrientation: "left" | "right"
  showPercentage: boolean
}) {
  const startOfDay = new Date(`${day}T00:00:00`).getTime()
  const endOfDay = new Date(`${day}T00:00:00`)
  endOfDay.setDate(endOfDay.getDate() + 1) // Move to the next day
  const endOfDayMs = endOfDay.getTime()

  const intervalMinutes = interval

  const processedData = fillMissingBuckets(
    stationData.buckets,
    startOfDay,
    endOfDayMs,
    intervalMinutes
  )

  return (
    <ChartContainer className="h-[35px] w-full" config={chartConfig}>
      <AreaChart
        accessibilityLayer
        data={processedData}
        margin={{
          left: 0,
          right: 0,
          top: 2,
          bottom: 2,
        }}
      >
        <ChartTooltip
          cursor={false}
          /* eslint-disable react/prop-types */
          content={(props) => (
            <CustomTooltip
              active={props.active}
              elements={props.payload}
              showPercentage={showPercentage}
            />
          )}
          wrapperStyle={{ zIndex: 9999 }}
        />
        <YAxis
          domain={[0, showPercentage ? 100 : 10]}
          orientation={yAxisOrientation}
        />
        <Area
          isAnimationActive={false}
          dataKey={showPercentage ? "percentageThreshold" : "avgDelay"}
          type="step"
          fill="var(--color-desktop)"
          fillOpacity={0.4}
          stroke="var(--color-desktop)"
        />
      </AreaChart>
    </ChartContainer>
  )
}
