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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Endpunkt für Speicherung von Antworten
    /*
    * POST: Speichere die Daten in der Datenbank
    * @param:  LeseID ,Frage: {Fragenummer, Antwort , RichtigeAntwort}
    */

    try{
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
        $readingID = $data['LeseID'];

        $questionData = $data['Frage'];

        $stmt = $conn->prepare("INSERT INTO `Question`(`questionId`, `readingId`, `question`, `givenAnswer`, `correctAnswer`) VALUES (?,?,?,?,?)");
        if (!$stmt) {
            throw new Exception('Prepared Statement Fehler: ' . $conn->error);
        }

        $stmt->bind_param("sssss", $id, $readingID, $questionData['Fragenummer'], $questionData['Antwort'], $questionData['RichtigeAntwort']);

        // Statement ausführen
        if (!$stmt->execute()) {
            throw new Exception('Execute Fehler: ' . $stmt->error);
        }


    }catch (Exception $e) {
        // Fehlermeldung zurückgeben
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage(), 'success' => false]);
        // In die Fehlerlog schreiben
        error_log('API-Fehler: ' . $e->getMessage());
    }

} else{
    echo json_encode("Invalid request type. Only POST Supported");
}