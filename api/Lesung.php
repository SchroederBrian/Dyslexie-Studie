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
    // Endpunkt für Speicherung von Lesedaten
    /*
    * POST: Speichere die Daten in der Datenbank
    * @param: TeilnehmerID, Lesedaten: {Textnummer, Schriftart, Lesezeit, Lesbarkeit, EmpfundeneLesegeschwindigkeit, Bewertung, Kommentar}
    * Return: Die ID der Lesung
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
        $participantID = $data['TeilnehmerID'];

        $readingData = $data['Lesedaten'];

        $stmt = $conn->prepare("INSERT INTO `Reading`(`readingId`, `participantId`, `textNumber`, `fontName`, `readingTimeInSec`, `readability`, `perceivedReadingSpeed`, `fontLiking`, `comments`) VALUES (?,?,?,?,?,?,?,?,?)");
        if (!$stmt) {
            throw new Exception('Prepared Statement Fehler: ' . $conn->error);
        }

        $stmt->bind_param("ssisiiiis", $id, $participantID, $readingData['Textnummer'],  $readingData['Schriftart'], $readingData['Lesezeit'], $readingData['Lesbarkeit'], $readingData['EmpfundeneLesegeschwindigkeit'] , $readingData['Bewertung'] , $readingData['Kommentar']);

        // Statement ausführen
        if (!$stmt->execute()) {
            throw new Exception('Execute Fehler: ' . $stmt->error);
        }
        // Return the ID if successful
        echo json_encode(['readingId' => $id, 'success' => true]);


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