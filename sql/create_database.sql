-- Dyslexie-Studie Datenbankschema
-- Erstellt eine Datenbank zur Studie über die Wirkung von Schriftarten bei Dyslexie

-- Tabelle für Teilnehmer
CREATE TABLE IF NOT EXISTS teilnehmer (
    participantId VARCHAR(36) PRIMARY KEY,
    age VARCHAR(20) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    hasDyslexia BOOLEAN NOT NULL,
    timestamp DATETIME NOT NULL
);

-- Tabelle für Leseerfahrungen
CREATE TABLE IF NOT EXISTS leseerfahrung (
    readingId VARCHAR(36) PRIMARY KEY,
    participantId VARCHAR(36) NOT NULL,
    textNumber INT NOT NULL,
    fontName VARCHAR(50) NOT NULL,
    readingTimeInSec INT NOT NULL,
    readability INT NOT NULL,
    perceivedReadingSpeed INT NOT NULL,
    fontLiking INT NOT NULL,
    comments TEXT,
    FOREIGN KEY (participantId) REFERENCES teilnehmer(participantId),
    CHECK (textNumber IN (1, 2)),
    CHECK (readability BETWEEN 1 AND 5),
    CHECK (perceivedReadingSpeed BETWEEN 1 AND 5),
    CHECK (fontLiking BETWEEN 1 AND 5)
);

-- Tabelle für Inhaltsfragen
CREATE TABLE IF NOT EXISTS inhaltsfragen (
    questionId VARCHAR(36) PRIMARY KEY,
    readingId VARCHAR(36) NOT NULL,
    question INT NOT NULL,
    givenAnswer INT NOT NULL,
    correctAnswer INT NOT NULL,
    FOREIGN KEY (readingId) REFERENCES leseerfahrung(readingId)
);

-- Indizes für bessere Abfrageleistung
CREATE INDEX idx_teilnehmer_dyslexia ON teilnehmer(hasDyslexia);
CREATE INDEX idx_leseerfahrung_font ON leseerfahrung(fontName);
CREATE INDEX idx_leseerfahrung_participant ON leseerfahrung(participantId);
CREATE INDEX idx_inhaltsfragen_reading ON inhaltsfragen(readingId);

-- Kommentar zur Datenbanknutzung
-- Diese Datenbank speichert die Ergebnisse der Dyslexie-Studie.
-- Die UUID-Felder sollten in der Anwendung generiert werden, bevor Daten eingefügt werden.
-- Die CHECK-Constraints stellen sicher, dass nur gültige Werte eingefügt werden können. 