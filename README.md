# Datenmodell

>### Teilnehmer-Tabelle

| Feld          | Typ      | Beschreibung                                           |
|---------------|----------|--------------------------------------------------------|
| participantId | String   | Eindeutige ID für jeden Teilnehmer (generierte UUID)   |
| age           | String   | Altersgruppe des Teilnehmers                           |
| gender        | String   | Geschlecht des Teilnehmers                             |
| hasDyslexia   | Boolean  | Gibt an, ob der Teilnehmer Dyslexie hat                |
| timestamp     | DateTime | Zeitpunkt der Teilnahme                                |

---

>### Leseerfahrung-Tabelle

| Feld             | Typ      | Beschreibung                                     |
|------------------|----------|-------------------------------------------------|
| readingId        | String   | Eindeutige ID für jede Leseerfahrung             |
| participantId    | String   | Referenz auf den Teilnehmer (Fremdschlüssel)     |
| textNumber       | Integer  | 1 oder 2 (für Text 1 oder Text 2)                |
| fontName         | String   | Name der verwendeten Schriftart                  |
| isOpenDyslexic   | Boolean  | Gibt an, ob OpenDyslexic verwendet wurde         |
| readingTimeInSec | Integer  | Lesezeit in Sekunden                             |
| readability      | Integer  | Bewertung der Lesbarkeit (1-5)                   |
| effort           | Integer  | Bewertung des Leseaufwands (1-5)                 |
| fontLiking       | Integer  | Bewertung der Schriftart (1-5)                   |
| comments         | Text     | Offene Anmerkungen des Teilnehmers               |

---

>### Inhaltsfragen-Tabelle

| Feld             | Typ      | Beschreibung                                     |
|------------------|----------|-------------------------------------------------|
| questionId       | String   | Eindeutige ID für jede Antwort                   |
| readingId        | String   | Referenz auf die Leseerfahrung (Fremdschlüssel)  |
| questionText     | Text     | Fragetext                                        |
| givenAnswer      | Text     | Vom Teilnehmer gegebene Antwort                  |
| correctAnswer    | Text     | Korrekte Antwort                                 |
| isCorrect        | Boolean  | Gibt an, ob die Antwort korrekt war              |

---