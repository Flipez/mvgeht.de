// eslint-disable-next-line import/no-named-as-default
import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: {
      Title: "Is the MVG working or should you walk?",
      Description: "An unofficial departure monitor for Munich's subways",
      Tabs: {
        Matrix: "Matrix",
        Table: "Table",
        Map: "Map",
      },
      Welcome: {
        Card: {
          Status: {
            Title: "Status",
            Description: "Cross-Station Information",
            Content:
              "Currently the Subway has <delay>{{ delay }}</delay> delay on average, which is <delayText>{{ delayText }}</delayText>",
          },
          Highscore: {
            Title: "Highscore",
            Description: "Top Stations",
            Content:
              "The largest delay on average is at the <station>{{ station }}</station> Station, currently at {{ delay }}.",
          },
          About: {
            Title: "MVGeht",
            Description: "What do I see here?",
            Content:
              "If none of the next subways of a station has delay, the station will be displayed <green>green</green>. Has at least one subway a delay of under 5 minutes, the station is <yellow>yellow</yellow>. With more than 5 Minutes the station will be <red>red</red>.",
          },
        },
      },
      Table: {
        Filter: "Filter stations...",
        Columns: {
          Station: "Station",
          Departures: "Departures",
        },
      },
      Misc: {
        Delay: "delay",
        Departed: "departed",
        SecondsShort: "Sec",
      },
    },
  },
  de: {
    translation: {
      Title: "Geht die MVG oder gehst du zu Fuß?",
      Description:
        "Ein inoffizieller Abfahrtsmonitor für die U-Bahnen in München",
      Tabs: {
        Matrix: "Matrix",
        Table: "Tabelle",
        Map: "Karte",
      },
      Welcome: {
        Card: {
          Status: {
            Title: "Zustand",
            Description: "Stationsübergreifende Informationen",
            Content:
              "Aktuell haben die U-Bahnen im Durchschnitt <delay>{{ delay }}</delay> Verspätung, das ist <delayText>{{ delayText }}</delayText>.",
          },
          Highscore: {
            Title: "Highscore",
            Description: "Top Stationen",
            Content:
              "Die größte durchschnittliche Verspätung hat im Moment die Station <station>{{ station }}</station> mit {{ delay }}.",
          },
          About: {
            Title: "MVGeht",
            Description: "Was sehen meine Augen hier?",
            Content:
              "Wenn keine der nächsten U-Bahnen an einer Station mehr als 0 Minuten Verspätung hat, also alle pünktlich sind, dann wird die Station <green>grün</green> angezeigt. Hat mindestens eine U-Bahn maximal 5 Minuten Verspätung, dann ist die Station <yellow>gelb</yellow>. Bei mehr als 5 Minuten Verspätung wird die Station dann <red>rot</red> dargestellt.",
          },
        },
      },
      Table: {
        Filter: "Stationen filtern...",
        Columns: {
          Station: "Station",
          Departures: "Abfahrten",
        },
      },
      Misc: {
        Delay: "Verspätung",
        Departed: "abgefahren",
        SecondsShort: "Sek",
      },
    },
  },
}

// eslint-disable-next-line import/no-named-as-default-member
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "de",

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })

export default i18n
