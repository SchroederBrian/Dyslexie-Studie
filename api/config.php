<?php
// Datenbankverbindung herstellen
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "dyslexie_studie";

// Verbindung herstellen
$conn = new mysqli($servername, $username, $password, $dbname);

// Fehlermeldungen aktivieren
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// Verbindung überprüfen
if ($conn->connect_error) {
    die("Verbindung fehlgeschlagen: " . $conn->connect_error);
}

// UTF-8-Setzung
$conn->set_charset("utf8");

// Debug-Ausgabe
error_log("Verbindung erfolgreich hergestellt");
?>


