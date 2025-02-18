import { Dispatch, SetStateAction } from "react"
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu"
import { Label } from "~/components/label"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Slider } from "~/components/ui/slider"
import { StationsByLine } from "~/data/subway-lines"
import { SubwayLine } from "~/types/departures"
import { ChartSettings } from "~/types/history"
import { addDays } from "date-fns"
import moment from "moment"

export function RealtimeCheckbox({
  settings,
  setSettings,
}: {
  settings: ChartSettings
  setSettings: Dispatch<SetStateAction<ChartSettings>>
}) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        checked={settings.realtime}
        onCheckedChange={(checked) =>
          setSettings((prev: ChartSettings) => ({
            ...prev,
            realtime: checked as boolean,
          }))
        }
      />
      <span>Realtime</span>
    </div>
  )
}

export function IntervalDropdown({
  settings,
  setSettings,
}: {
  settings: ChartSettings
  setSettings: Dispatch<SetStateAction<ChartSettings>>
}) {
  // Define your interval options.
  const options = [
    { value: 5, label: "5 Minutes" },
    { value: 10, label: "10 Minutes" },
    { value: 20, label: "20 Minutes" },
    { value: 60, label: "60 Minutes" },
  ]

  return (
    <div className="mr-10">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline">
            Interval: {settings.interval} Minutes
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuArrow />
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() =>
                setSettings((prev: ChartSettings) => ({
                  ...prev,
                  interval: option.value,
                }))
              }
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function LineDropdown({
  settings,
  setSettings,
}: {
  settings: ChartSettings
  setSettings: Dispatch<SetStateAction<ChartSettings>>
}) {
  const options = (Object.keys(StationsByLine) as SubwayLine[]).map((line) => ({
    value: line,
    label: <Label label={line} />,
  }))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Label label={settings.line} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuArrow />
        <DropdownMenuLabel>Line</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() =>
              setSettings((prev: ChartSettings) => ({
                ...prev,
                line: option.value,
              }))
            }
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function DateSlider({
  settings,
  setSettings,
}: {
  settings: ChartSettings
  setSettings: Dispatch<SetStateAction<ChartSettings>>
}) {
  const year = 2024
  const startDate = new Date(year, 1, 16) // January 1, 2024
  const daysInYear = year % 4 === 0 ? 366 : 365 // 2024 is a leap year

  // Calculate the selected date by adding the dayIndex to the start of the year.
  const selectedDate = addDays(startDate, settings.chartDate)
  const formattedDate = moment(selectedDate, "yyyy-MM-dd").format(
    "dddd, MMM Do YY"
  )

  return (
    <div className="ml-5 space-y-4">
      <p>Selected Date: {formattedDate}</p>
      <Slider
        value={[settings.chartDate]}
        min={0}
        max={daysInYear - 1}
        step={1}
        onValueChange={(value) =>
          setSettings((prev: ChartSettings) => ({
            ...prev,
            chartDate: value[0],
          }))
        }
      />
    </div>
  )
}

export function ControlBar({
  settings,
  setSettings,
}: {
  settings: ChartSettings
  setSettings: Dispatch<SetStateAction<ChartSettings>>
}) {
  return (
    <div className="mt-2 flex items-center justify-between">
      <DateSlider settings={settings} setSettings={setSettings} />
      <RealtimeCheckbox settings={settings} setSettings={setSettings} />
      <LineDropdown settings={settings} setSettings={setSettings} />
      <IntervalDropdown settings={settings} setSettings={setSettings} />
    </div>
  )
}
