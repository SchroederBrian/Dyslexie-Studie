# Studie zur Wirkung von Schriftarten bei Dyslexie

## Projektübersicht
Diese Anwendung dient zur Durchführung einer Studie über die Auswirkungen verschiedener Schriftarten, insbesondere OpenDyslexic, auf das Leseverständnis und den Lesekomfort bei Personen mit und ohne Dyslexie.

## Ziele der Studie
- Vergleich der Leseeffizienz zwischen Standard-Schriftarten und OpenDyslexic
- Untersuchung der subjektiven Leseerfahrung bei verschiedenen Schriftarten
- Sammlung von quantitativen und qualitativen Daten zum Leseverständnis
- Analyse der Unterschiede zwischen Personen mit und ohne Dyslexie

## Technische Umsetzung
Die Anwendung sammelt strukturierte Daten gemäß dem unten beschriebenen Datenmodell und speichert diese zur späteren Analyse.

## Datenmodell

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

| Feld                   | Typ      | Beschreibung                                     |
|------------------------|----------|--------------------------------------------------|
| readingId              | String   | Eindeutige ID für jede Leseerfahrung             |
| participantId          | String   | Referenz auf den Teilnehmer (Fremdschlüssel)     |
| textNumber             | Integer  | 1 oder 2 (für Text 1 oder Text 2)                |
| fontName               | String   | Name der verwendeten Schriftart                  |
| readingTimeInSec       | Integer  | Lesezeit in Sekunden                             |
| readability            | Integer  | Bewertung der Lesbarkeit (1-5)                   |
| perceivedReadingSpeed  | Integer  | Bewertung des Leseaufwands (1-5)                 |
| fontLiking             | Integer  | Bewertung der Schriftart (1-5)                   |
| comments               | Text     | Offene Anmerkungen des Teilnehmers               |

---

>### Inhaltsfragen-Tabelle

| Feld             | Typ      | Beschreibung                                     |
|------------------|----------|--------------------------------------------------|
| questionId       | String   | Eindeutige ID für jede Antwort                   |
| readingId        | String   | Referenz auf die Leseerfahrung (Fremdschlüssel)  |
| question         | Integer  | Ausgewählte Frage                                |
| givenAnswer      | Integer  | Vom Teilnehmer gegebene Antwort                  |
| correctAnswer    | Integer  | Korrekte Antwort                                 |

---

## Ablauf der Studie
1. **Demographische Daten:** Teilnehmer geben Alter, Geschlecht und Informationen zu Dyslexie an
2. **Erster Lesetest:** 
   - Zufällige Zuweisung einer Schriftart (eine davon OpenDyslexic)
   - Lesen von Text 1 mit Zeitmessung
   - Bewertung der Leseerfahrung (Lesbarkeit, Empfundende Lesezeit, Schriftart)
   - Beantwortung von 4 Multiple-Choice Inhaltsfragen
   - Optional: Weitere Anmerkungen
3. **Zweiter Lesetest:**
   - Automatische Zuweisung der anderen Schriftart
   - Lesen von Text 2 mit Zeitmessung  
   - Bewertung der Leseerfahrung (Lesbarkeit, Empfundende Lesezeit, Schriftart)
   - Beantwortung von 4 Multiple-Choice Inhaltsfragen
   - Optional: Weitere Anmerkungen
4. **Abschluss:** Speicherung aller Daten und Danksagung

## Datenerfassung und -analyse
Die gesammelten Daten werden in der konfigurierten Datenbank gespeichert und können über die Admin-Oberfläche oder direkte Datenbankabfragen für die Analyse exportiert werden.

## Lizenz
Dieses Projekt ist unter der MIT-Lizenz veröffentlicht. Siehe [LICENSE](LICENSE) für weitere Details.
