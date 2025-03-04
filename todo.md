# ToDo-Liste für das Lesbarkeits-Projekt

## Dringende Aufgaben
- [ ] Datenbank
- [ ] Backend PHP

## In Progress


## Ablauf
wenn ein user gestartet hat kann er durch abbrechen des versuches seine daten löschen und den gesamten versuch und die gespeicherten daten löschen kann allerdings keinen neuen versuch starten wenn er den ersten text startet zu lesen. dem user wird bevor der erste text angezeigt wird nochmal ein popup mit einer info angezeigt und 2 auswahl möglichkeiten info zreigt "wenn sie weiter klicken haben sie nicht mehr die möglichekit den versuch abbzubrechen wenn sie damit nicht einverstanden sind klicken sie bitte auf jetzt abbrechen.". wenn der user anfängt einen text der beiden zu lesen wird in den cookies gespiechert, "startReadingText1" und wenn er dann die seite neu läde wird die lese zeit automatisch für text 1 auf -1 gesetzt und bleibt da und sollte der user ganz normal fortfahren bekommt er den cookie "doneReadingText1" damit das system die normale zeit übernimmt. das selbe beim text 2.

1. Wenn der erste text angezeigt wird, und dann auf weiter geklickt wird würde für diesen text die zeit gespeichert werden
2. Wenn ich die leseempfindungs fragen beantwortet habe würden meine antworten gespeichert werden.
3. wenn ich die fragen zum text beantwortet habe werden auch diese gespeichert.
4. wenn ich den 2ten text gelesen habe wird die zeit auch wieder gespeichert.
5. wenn ich die fragen zum leseempfindes von text 2 beantwortet habe werden auch diese antworten gespeichert.
6. wenn ich die inhaltsfragen zum 2ten text beantwoertet habe werden auch diese antworten gespeichert.
7. am ende wird meine participant id gelöscht

