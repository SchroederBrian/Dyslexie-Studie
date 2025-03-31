<?php
// Fehlerberichterstattung aktivieren
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Stellen Sie sicher, dass mysqli Fehler als Exceptions behandelt
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// Datenbankverbindung herstellen
try {
    require_once 'config.php';

    // Prüfen, ob $conn existiert und eine gültige Verbindung ist
    if (!isset($conn) || $conn->connect_error) {
        throw new Exception('Datenbankverbindung fehlgeschlagen: ' . ($conn->connect_error ?? 'Keine Verbindung'));
    }
} catch (Exception $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => 'Konfigurationsfehler: ' . $e->getMessage(), 'success' => false]);
    exit;
}

// Request-Methode prüfen und entsprechend handeln
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Endpunkt für die Teilnehmerdaten Speicherung
    /*
    * POST: Speichere die Daten in der Datenbank
    * @param: hasDyslexia, isEmployee
    * Return: Die ID des Teilnehmers
    */
    try {
        // Prüfen, ob Daten empfangen wurden
        $input = file_get_contents('php://input');
        if (empty($input)) {
            throw new Exception('Keine Daten empfangen');
        }

        // Gesendete Daten der Webseite vom aufrufen der funktion auslesen
        $data = json_decode($input, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Ungültiges JSON: ' . json_last_error_msg());
        }

        // Generiere eine zufällige ID
        $id = uniqid('', true);

        // Daten aus dem Request extrahieren
        $dyslexie = $data['hasDyslexia'] == 'yes' ? 1 : 0;
        $isEmployee = $data['isEmployee'] == 'yes' ? 1 : 0;

        // Log der empfangenen Daten
        error_log("Erhaltene Daten: " . print_r($data, true));

        // Aktuelles Datum und Zeit
        $timestamp = date('Y-m-d H:i:s');

        // Prepared Statement erstellen
        $stmt = $conn->prepare("INSERT INTO Participant (participantId, hasDyslexia, timestamp, employee) VALUES (?, ?, ?, ?)");
        if (!$stmt) {
            throw new Exception('Prepared Statement Fehler: ' . $conn->error);
        }

        // Parameter binden
        $stmt->bind_param("sisi", $id, $dyslexie, $timestamp, $isEmployee);

        // Statement ausführen
        if (!$stmt->execute()) {
            throw new Exception('Execute Fehler: ' . $stmt->error);
        }

        // Return the ID if successful
        echo json_encode(['participantId' => $id, 'success' => true]);
    } catch (Exception $e) {
        // Fehlermeldung zurückgeben
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage(), 'success' => false]);
        // In die Fehlerlog schreiben
        error_log('API-Fehler: ' . $e->getMessage());
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Endpunkt für das Löschen der Daten aus der Datenbank
    /*
    * DELETE: Lösche die Daten aus der Datenbank
    * @param: participantId
    * Return: Erfolgsmeldung
    */
    try {
        // Prüfen, ob Daten empfangen wurden
        $input = file_get_contents('php://input');
        if (empty($input)) {
            throw new Exception('Keine Daten empfangen');
        }

        // Daten aus dem Request extrahieren
        $data = json_decode($input, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Ungültiges JSON: ' . json_last_error_msg());
        }

        // ParticipantId aus dem Request extrahieren
        $participantId = $data['participantId'] ?? null;
        if (empty($participantId)) {
            throw new Exception('ParticipantId fehlt');
        }

        // Transaktion starten
        $conn->begin_transaction();

        try {
            // Zuerst prüfen, ob der Teilnehmer existiert
            $checkStmt = $conn->prepare("SELECT 1 FROM Participant WHERE participantId = ?");
            $checkStmt->bind_param("s", $participantId);
            $checkStmt->execute();
            $result = $checkStmt->get_result();

            if ($result->num_rows === 0) {
                throw new Exception('Teilnehmer nicht gefunden');
            }

            // Hole zuerst alle readingIds für diesen Teilnehmer
            $readingIdsStmt = $conn->prepare("SELECT readingId FROM Reading WHERE participantId = ?");
            if (!$readingIdsStmt) {
                throw new Exception('Prepared Statement Fehler beim Abrufen der readingIds: ' . $conn->error);
            }

            $readingIdsStmt->bind_param("s", $participantId);
            $readingIdsStmt->execute();
            $readingIdsResult = $readingIdsStmt->get_result();

            // Lösche alle zugehörigen Inhaltsfragen für jeden readingId
            while ($row = $readingIdsResult->fetch_assoc()) {
                $readingId = $row['readingId'];
                $deleteQuestions = $conn->prepare("DELETE FROM Question WHERE readingId = ?");
                if (!$deleteQuestions) {
                    throw new Exception('Prepared Statement Fehler beim Löschen der Inhaltsfragen: ' . $conn->error);
                }
                $deleteQuestions->bind_param("s", $readingId);
                $deleteQuestions->execute();
            }

            // Dann alle Leseerfahrungen dieses Teilnehmers löschen
            $deleteReading = $conn->prepare("DELETE FROM Reading WHERE participantId = ?");

            if (!$deleteReading) {
                throw new Exception('Prepared Statement Fehler beim Löschen der Leseerfahrungen: ' . $conn->error);
            }

            $deleteReading->bind_param("s", $participantId);
            $deleteReading->execute();

            // Schließlich den Teilnehmer selbst löschen
            $deleteParticipant = $conn->prepare("DELETE FROM Participant WHERE participantId = ?");

            if (!$deleteParticipant) {
                throw new Exception('Prepared Statement Fehler beim Löschen des Teilnehmers: ' . $conn->error);
            }

            $deleteParticipant->bind_param("s", $participantId);
            $deleteParticipant->execute();

            // Transaktion bestätigen
            $conn->commit();

            // Erfolgsmeldung zurückgeben
            http_response_code(200);
            echo json_encode(['message' => 'Daten erfolgreich gelöscht', 'success' => true]);
        } catch (Exception $innerEx) {
            // Transaktion rückgängig machen bei Fehlern
            $conn->rollback();
            throw $innerEx;
        }
    } catch (Exception $e) {
        // Fehlermeldung zurückgeben
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage(), 'success' => false]);
        // In die Fehlerlog schreiben
        error_log('API-Fehler beim Löschen: ' . $e->getMessage());
    }
} else {
    // Falsche HTTP-Methode
    http_response_code(405);
    echo json_encode(['error' => 'Methode nicht erlaubt', 'success' => false]);
}
?>
