package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

func connectClickhouse() driver.Conn {
	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{"clickhouse.auch.cool:9000"},
		Auth: clickhouse.Auth{
			Database: "mvg",
			Username: "default",
			Password: os.Getenv("CLICKHOUSE_PASSWORD"),
		},
	})
	if err != nil {
		panic(err)
	}
	v, err := conn.ServerVersion()
	if err != nil {
		panic(err)
	}
	fmt.Println(v)

	return conn
}

type LineDelayDay struct {
	Station string              `json:"station"`
	Name    string              `json:"name"`
	Stop    int32               `json:"stop"`
	Buckets []map[string]string `json:"buckets"`
}

func getDayRange(dateStr string) (startOfDay, endOfDay string, err error) {
	// Define the layout for parsing the date (assuming the input is in "YYYY-MM-DD" format).
	const layout = "2006-01-02"
	// Parse the date.
	t, err := time.Parse(layout, dateStr)
	if err != nil {
		return "", "", err
	}

	// Use the year, month, and day from t to create a new time at midnight.
	year, month, day := t.Date()
	loc := t.Location() // Use the same location as t
	startTime := time.Date(year, month, day, 0, 0, 0, 0, loc)
	// The end time is the start time plus 24 hours.
	endTime := startTime.Add(24 * time.Hour)

	// Format the timestamps as strings in the desired format.
	// For example, using the ISO 8601 layout:
	const outputLayout = "2006-01-02"
	startOfDay = startTime.Format(outputLayout)
	endOfDay = endTime.Format(outputLayout)
	return
}

func getDelayForLine(interval string, day string, label string, isSouth string, realtime string, conn driver.Conn) []LineDelayDay {
	start, end, err := getDayRange(day)
	if err != nil {
		fmt.Println("Error:", err)
		return nil
	}
	fmt.Println("Start of day:", start)
	fmt.Println("End of day:", end)

	query := `
  	SELECT
      station,
      name,
      stop,
      arrayMap(
          x -> map('bucket', toString(x.1), 'avgDelay', toString(x.2)),
          groupArray((bucket, avgDelay))
      ) AS buckets

  FROM
  (
      SELECT
          responses_dedup.station AS station,
          thisStation.name AS name,
          thisStation.stop AS stop,
          toStartOfInterval(plannedDepartureTime, INTERVAL ? minute) AS bucket,
          avg(delayInMinutes) AS avgDelay
      FROM mvg.responses_dedup
      INNER JOIN mvg.lines as thisStation ON (responses_dedup.station = thisStation.station AND responses_dedup.label = thisStation.label)
      INNER JOIN mvg.lines as destStation ON (responses_dedup.destination = destStation.name AND responses_dedup.label = thisStation.label)
			WHERE plannedDepartureTime >= ? AND plannedDepartureTime < ?
			AND responses_dedup.label = ?
      AND (thisStation.stop < destStation.stop) = ?
			AND (? = 0 OR realtime = 1)
      GROUP BY responses_dedup.station, bucket, thisStation.name, thisStation.stop
      ORDER BY bucket
  )
  GROUP BY station, name, stop
  ORDER BY stop
	`

	rows, err := conn.Query(context.Background(), query, interval, start, end, label, isSouth, realtime)
	if err != nil {
		log.Fatal("error running query: ", err)
	}
	defer rows.Close()

	var results []LineDelayDay

	for rows.Next() {
		var station, name string
		var stop int32
		var buckets []map[string]string

		if err := rows.Scan(&station, &name, &stop, &buckets); err != nil {
			log.Fatal("Error scanning row:", err)
		}

		results = append(results, LineDelayDay{
			Station: station,
			Name:    name,
			Stop:    stop,
			Buckets: buckets,
		})
	}

	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}

	return results
}
