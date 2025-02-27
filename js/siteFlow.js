document.addEventListener("DOMContentLoaded", function() {
    // Container-Elemente
    const content = document.getElementById("content");
    const formular = document.getElementById("formular");
    const demographicsContainer = document.getElementById("demographics-container");
    const readingContainer = document.getElementById("reading-container");
    const textContainer = document.getElementById("text-container").querySelector(".col-12");
    const questionsContainer = document.getElementById("questions-container");
    const contentQuestions = document.getElementById("content-questions");
    const questionsTitle = document.getElementById("questions-title");
    const timerDisplay = document.getElementById("timer");
    const cancelButtonContainer = document.getElementById("cancel-button-container");
    
    // Buttons und Formulare
    const submitButton = document.querySelector("#formular button[type='submit']");
    const demographicsForm = document.getElementById("demographics-form");
    const questionsForm = document.getElementById("questions-form");
    const stopButton = document.getElementById("stop-button");
    const cancelButton = document.getElementById("cancel-button");
    
    // Variablen für den Ablauf
    // Neue Phasen:
    // 0 = Einweisung
    // 1 = Vorab-Fragen
    // 2 = Text 1
    // 3 = Fragen zum Inhalt für Text 1
    // 4 = Fragen zur Leseempfindung für Text 1
    // 5 = Text 2
    // 6 = Fragen zum Inhalt für Text 2
    // 7 = Fragen zur Leseempfindung für Text 2
    // 8 = Optionale Fragen zum ersten Text (falls implementiert)
    // 9 = Abschluss
    let currentPhase = 0;
    let currentTextNumber = 1;
    let selectedFonts = [];
    let readingTimes = [];
    let userData = {
        demographics: {
            age: "",
            gender: "",
            hasDyslexia: ""
        },
        text1: {
            font: "",
            readingTime: 0,
            readingExperience: {},
            contentQuestions: {}
        },
        text2: {
            font: "",
            readingTime: 0,
            readingExperience: {},
            contentQuestions: {}
        }
    };
    
    // Flag für optionale Fragen zum ersten Text
    let showOptionalQuestionsForText1 = false; // Kann auf true gesetzt werden, wenn gewünscht
    
    // Timer-Variablen
    let startTime;
    let timerInterval;
    let readingTimeInSeconds = 0;
    
    // Fortschrittsbalken-Element
    const progressBar = document.getElementById("progress-bar");
    const progressContainer = document.getElementById("progress-container");
    
    // Textdateien und Inhaltsfragen
    const textFiles = ["assets/text1.txt", "assets/text2.txt"];
    const contentQuestionsForText = {
        1: [
            {
                question: "Wie heißt der Protagonist der Geschichte?",
                type: "radio",
                options: ["Thomas", "Michael", "Johannes", "Peter"],
                correctAnswer: "Johannes"
            },
            {
                question: "Was entdeckt der Protagonist im Leuchtturm?",
                type: "radio",
                options: ["Eine Schatzkarte", "Ein altes Tagebuch", "Eine versteckte Tür", "Ein Gemälde"],
                correctAnswer: "Eine versteckte Tür"
            },
            {
                question: "In welcher Jahreszeit spielt die Geschichte?",
                type: "radio",
                options: ["Frühling", "Sommer", "Herbst", "Winter"],
                correctAnswer: "Herbst"
            }
        ],
        2: [
            {
                question: "Welches Tier spielt eine wichtige Rolle in der Geschichte?",
                type: "radio",
                options: ["Hund", "Katze", "Vogel", "Fuchs"],
                correctAnswer: "Katze"
            },
            {
                question: "Wo findet die Haupthandlung statt?",
                type: "radio",
                options: ["In einer Stadt", "In einem Dorf", "Auf einem Berg", "An einem See"],
                correctAnswer: "In einem Dorf"
            },
            {
                question: "Was ist das zentrale Thema der Geschichte?",
                type: "radio",
                options: ["Freundschaft", "Verlust", "Abenteuer", "Familie"],
                correctAnswer: "Freundschaft"
            }
        ]
    };
    
    // Verfügbare Schriftarten
    const availableFonts = [
        { name: "Arial", class: "font-arial" },
        { name: "Times New Roman", class: "font-times" },
        { name: "Comic Sans MS", class: "font-comic" },
        { name: "OpenDyslexic", class: "font-opendyslexic" }
    ];
    
    // Cookies-Funktionen
    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }
    
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "; expires=" + date.toUTCString();
        document.cookie = name + "=" + value + expires + "; path=/";
    }
    
    function deleteCookie(name) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    
    // Timer-Funktionen
    function startTimer() {
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 1000);
    }
    
    function updateTimer() {
        const currentTime = new Date();
        const elapsedTimeInSeconds = Math.floor((currentTime - startTime) / 1000);
        readingTimeInSeconds = elapsedTimeInSeconds;
        
        const minutes = Math.floor(elapsedTimeInSeconds / 60);
        const seconds = elapsedTimeInSeconds % 60;
        
        timerDisplay.textContent = `Lesezeit: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    function stopTimer() {
        clearInterval(timerInterval);
        return readingTimeInSeconds;
    }
    
    // Funktion zum zufälligen Mischen eines Arrays (Fisher-Yates-Algorithmus)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Funktion zum Auswählen von zwei Schriftarten (eine davon immer OpenDyslexic, zufällig zugewiesen)
    function selectRandomFonts() {
        // OpenDyslexic-Schriftart finden
        const openDyslexicFont = availableFonts.find(font => font.name === "OpenDyslexic");
        
        // Verfügbare Schriftarten ohne OpenDyslexic
        const otherFonts = availableFonts.filter(font => font.name !== "OpenDyslexic");
        
        // Zufällige Schriftart aus den anderen Schriftarten auswählen
        const shuffledFonts = shuffleArray([...otherFonts]);
        const randomFont = shuffledFonts[0];
        
        // Zufällig entscheiden, ob Text 1 oder Text 2 OpenDyslexic erhält
        const useOpenDyslexicForText1 = Math.random() < 0.5;
        
        if (useOpenDyslexicForText1) {
            // Text 1 erhält OpenDyslexic, Text 2 erhält eine zufällige andere Schriftart
            return [openDyslexicFont, randomFont];
        } else {
            // Text 1 erhält eine zufällige andere Schriftart, Text 2 erhält OpenDyslexic
            return [randomFont, openDyslexicFont];
        }
    }
    
    // Funktion zum Anzeigen der Dankesmeldung
    function showThankYouMessage() {
        // Alle Container ausblenden
        content.classList.add("d-none");
        formular.classList.add("d-none");
        demographicsContainer.classList.add("d-none");
        readingContainer.classList.add("d-none");
        questionsContainer.classList.add("d-none");
        cancelButtonContainer.classList.add("d-none");
        
        // Fortschrittsanzeige ausblenden
        progressContainer.classList.add("d-none");
        
        // Falls es bereits eine Dankesmeldung gibt, diese entfernen
        const existingThankYou = document.querySelector(".thank-you-container");
        if (existingThankYou) {
            existingThankYou.remove();
        }
        
        // Neuen Container für die Dankesmeldung erstellen
        const thankYouContainer = document.createElement("div");
        thankYouContainer.classList.add("container", "mt-4", "bg-light", "p-4", "rounded", "shadow-sm", "thank-you-container");
        
        // Dankesmeldung hinzufügen
        thankYouContainer.innerHTML = `
            <div class="row">
                <div class="col-12 text-center">
                    <div class="alert alert-success">
                        <h2>Vielen Dank für Ihre Teilnahme!</h2>
                        <p>Ihre Antworten wurden erfolgreich gespeichert.</p>
                        <p>Lesezeiten: 
                           Text 1 (${userData.text1.font}): ${readingTimes[0]} Sekunden, 
                           Text 2 (${userData.text2.font}): ${readingTimes[1]} Sekunden
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        // Dankesmeldung zur Seite hinzufügen
        document.body.insertBefore(thankYouContainer, document.querySelector("footer"));
        
        // Cookie setzen, dass der Nutzer teilgenommen hat
        setCookie("umfrageAbgeschlossen", JSON.stringify(userData), 365);
    }
    
    // Funktion zum Laden und Anzeigen des Textes
    function loadAndDisplayText(textNumber, fontClass) {
        // Textcontainer leeren
        textContainer.innerHTML = "";
        
        // Textnummer im Titel anzeigen
        const textHeading = document.createElement("h3");
        textHeading.classList.add("text-center", "mt-3", "mb-4");
        textHeading.innerText = `Text ${textNumber}`;
        textContainer.appendChild(textHeading);
        
        // Text laden
        fetch(textFiles[textNumber - 1])
            .then(response => response.text())
            .then(data => {
                // Neues div-Element erstellen
                const textDiv = document.createElement("div");
                textDiv.classList.add("text-content", fontClass);
                
                // Markdown mit marked.js verarbeiten
                textDiv.innerHTML = marked.parse(data);
                
                // Text zum Container hinzufügen
                textContainer.appendChild(textDiv);
            })
            .catch(error => {
                console.error(`Error loading text${textNumber}.txt:`, error);
                const errorMessage = document.createElement("p");
                errorMessage.textContent = "Der Text konnte nicht geladen werden. Bitte versuchen Sie es später erneut.";
                errorMessage.classList.add("text-center", "text-danger");
                textContainer.appendChild(errorMessage);
            });
    }
    
    // Funktion zum Anzeigen der Fragen zur Leseempfindung
    function showReadingExperienceQuestions(textNumber) {
        questionsContainer.classList.remove("d-none");
        
        // Titel anpassen
        questionsTitle.textContent = `Fragen zur Leseempfindung - Text ${textNumber}`;
        
        // Inhaltsfragen ausblenden
        contentQuestions.classList.add("d-none");
        
        // Sicherstellen, dass die Leseempfindungsfragen sichtbar sind
        const readingExperienceSection = document.querySelector(".question-section:first-child");
        if (readingExperienceSection) {
            readingExperienceSection.classList.remove("d-none");
        }
    }
    
    // Funktion zum Anzeigen der Inhaltsfragen
    function showContentQuestions(textNumber) {
        questionsContainer.classList.remove("d-none");
        
        // Titel anpassen
        questionsTitle.textContent = `Fragen zum Inhalt - Text ${textNumber}`;
        
        // Leseempfindungsfragen ausblenden
        const readingExperienceSection = document.querySelector(".question-section:first-child");
        if (readingExperienceSection) {
            readingExperienceSection.classList.add("d-none");
        }
        
        // Inhaltsfragen anzeigen
        contentQuestions.classList.remove("d-none");
        
        // Inhaltsfragen für den entsprechenden Text erstellen
        createContentQuestions(textNumber);
    }
    
    // Funktion zum Erstellen der Inhaltsfragen für den jeweiligen Text
    function createContentQuestions(textNumber) {
        contentQuestions.innerHTML = "";
        
        const questions = contentQuestionsForText[textNumber];
        
        questions.forEach((q, index) => {
            const questionDiv = document.createElement("div");
            questionDiv.classList.add("mb-4");
            
            const questionTitle = document.createElement("h4");
            questionTitle.textContent = q.question;
            questionDiv.appendChild(questionTitle);
            
            if (q.type === "radio") {
                q.options.forEach((option, optIndex) => {
                    const optionId = `q${textNumber}_${index}_${optIndex}`;
                    
                    const radioDiv = document.createElement("div");
                    radioDiv.classList.add("form-check");
                    
                    const radioInput = document.createElement("input");
                    radioInput.classList.add("form-check-input");
                    radioInput.type = "radio";
                    radioInput.name = `q${textNumber}_${index}`;
                    radioInput.id = optionId;
                    radioInput.value = option;
                    radioInput.required = true;
                    
                    const radioLabel = document.createElement("label");
                    radioLabel.classList.add("form-check-label");
                    radioLabel.htmlFor = optionId;
                    radioLabel.textContent = option;
                    
                    radioDiv.appendChild(radioInput);
                    radioDiv.appendChild(radioLabel);
                    questionDiv.appendChild(radioDiv);
                });
            }
            
            contentQuestions.appendChild(questionDiv);
        });
    }
    
    // Funktion zur Überprüfung der Antworten
    function evaluateAnswers(textNumber, formData) {
        const questions = contentQuestionsForText[textNumber];
        const results = {
            correct: 0,
            total: questions.length,
            answers: {}
        };
        
        questions.forEach((q, index) => {
            const answerKey = `q${textNumber}_${index}`;
            const givenAnswer = formData.get(answerKey);
            results.answers[answerKey] = {
                question: q.question,
                givenAnswer: givenAnswer,
                correctAnswer: q.correctAnswer,
                isCorrect: givenAnswer === q.correctAnswer
            };
            
            if (givenAnswer === q.correctAnswer) {
                results.correct++;
            }
        });
        
        return results;
    }
    
    // Funktion zum Aktualisieren des Fortschrittsbalkens
    function updateProgressBar() {
        if (!progressBar) return;
        
        // Insgesamt 10 Phasen (0-9), also Fortschritt in Prozent berechnen
        const totalPhases = 9; // 0-based zählung, daher 9 anstatt 10
        const progressPercent = Math.round((currentPhase / totalPhases) * 100);
        
        // Fortschritt aktualisieren
        progressBar.style.width = progressPercent + "%";
        progressBar.setAttribute("aria-valuenow", progressPercent);
        progressBar.textContent = progressPercent + "%";
        
        // Fortschrittscontainer anzeigen, außer in der Einführungsphase
        if (currentPhase > 0) {
            progressContainer.classList.remove("d-none");
        } else {
            progressContainer.classList.add("d-none");
        }
    }
    
    // Funktion für den Phasenwechsel
    function proceedToNextPhase() {
        // Aktuelle Phase basierend auf currentPhase
        switch (currentPhase) {
            case 0: // Einweisung -> Vorab-Fragen
                content.classList.add("d-none");
                formular.classList.add("d-none");
                demographicsContainer.classList.remove("d-none");
                cancelButtonContainer.classList.remove("d-none");
                currentPhase = 1;
                break;
                
            case 1: // Vorab-Fragen -> Text 1
                demographicsContainer.classList.add("d-none");
                readingContainer.classList.remove("d-none");
                
                // Zwei zufällige Schriftarten auswählen
                selectedFonts = selectRandomFonts();
                
                // Text 1 mit erster Schriftart laden
                loadAndDisplayText(1, selectedFonts[0].class);
                
                // Schriftart speichern
                userData.text1.font = selectedFonts[0].name;
                
                // Timer starten
                startTimer();
                currentPhase = 2;
                break;
                
            case 2: // Text 1 -> Fragen zum Inhalt für Text 1
                readingContainer.classList.add("d-none");
                
                // Timer stoppen und Lesezeit speichern
                const readingTime1 = stopTimer();
                readingTimes[0] = readingTime1;
                userData.text1.readingTime = readingTime1;
                
                // Inhaltsfragen für Text 1 anzeigen
                showContentQuestions(1);
                
                currentPhase = 3;
                break;
                
            case 3: // Fragen zum Inhalt für Text 1 -> Fragen zur Leseempfindung für Text 1
                // Fragen zur Leseempfindung anzeigen
                showReadingExperienceQuestions(1);
                
                currentPhase = 4;
                break;
                
            case 4: // Fragen zur Leseempfindung für Text 1 -> Text 2
                questionsContainer.classList.add("d-none");
                readingContainer.classList.remove("d-none");
                
                // Text 2 mit zweiter Schriftart laden
                loadAndDisplayText(2, selectedFonts[1].class);
                
                // Schriftart speichern
                userData.text2.font = selectedFonts[1].name;
                
                // Timer zurücksetzen und neu starten
                readingTimeInSeconds = 0;
                startTimer();
                
                currentPhase = 5;
                break;
                
            case 5: // Text 2 -> Fragen zum Inhalt für Text 2
                readingContainer.classList.add("d-none");
                
                // Timer stoppen und Lesezeit speichern
                const readingTime2 = stopTimer();
                readingTimes[1] = readingTime2;
                userData.text2.readingTime = readingTime2;
                
                // Inhaltsfragen für Text 2 anzeigen
                showContentQuestions(2);
                
                currentPhase = 6;
                break;
                
            case 6: // Fragen zum Inhalt für Text 2 -> Fragen zur Leseempfindung für Text 2
                // Fragen zur Leseempfindung anzeigen
                showReadingExperienceQuestions(2);
                
                currentPhase = 7;
                break;
                
            case 7: // Fragen zur Leseempfindung für Text 2 -> Optionale Fragen zum ersten Text oder Abschluss
                if (showOptionalQuestionsForText1) {
                    // Hier könnten optionale Fragen zum ersten Text angezeigt werden
                    // Für jetzt überspringen wir diese Phase
                    currentPhase = 8;
                    proceedToNextPhase(); // Direkt zur nächsten Phase weitergehen
                } else {
                    // Direkt zum Abschluss
                    showThankYouMessage();
                    currentPhase = 9;
                }
                break;
                
            case 8: // Optionale Fragen zum ersten Text -> Abschluss
                showThankYouMessage();
                currentPhase = 9;
                break;
        }
        
        // Fortschrittsbalken aktualisieren
        updateProgressBar();
    }
    
    // Überprüfen, ob der Benutzer bereits teilgenommen hat
    const hasParticipated = getCookie("umfrageAbgeschlossen");
    
    if (hasParticipated) {
        // Wenn der Benutzer bereits teilgenommen hat, nur Dankesmeldung anzeigen
        content.classList.add("d-none");
        formular.classList.add("d-none");
        cancelButtonContainer.classList.add("d-none");
        progressContainer.classList.add("d-none"); // Fortschrittsanzeige ausblenden
        
        // Daten aus dem Cookie laden
        try {
            userData = JSON.parse(hasParticipated);
            if (userData.text1 && userData.text2) {
                readingTimes = [userData.text1.readingTime, userData.text2.readingTime];
            }
        } catch (e) {
            console.error("Fehler beim Parsen der gespeicherten Daten:", e);
        }
        
        showThankYouMessage();
        return; // Weitere Ausführung stoppen
    }
    
    // Startansicht: Einweisung und Formular anzeigen
    content.classList.remove("d-none");
    formular.classList.remove("d-none");
    demographicsContainer.classList.add("d-none");
    readingContainer.classList.add("d-none");
    questionsContainer.classList.add("d-none");
    cancelButtonContainer.classList.add("d-none");
    
    // Event-Listener für den Abbrechen-Button
    if (cancelButton) {
        cancelButton.addEventListener("click", function() {
            // Bestätigungsdialog anzeigen
            if (confirm("Möchten Sie die Umfrage wirklich abbrechen? Alle bisher gespeicherten Daten werden gelöscht.")) {
                // Cookie löschen
                deleteCookie("umfrageAbgeschlossen");
                
                // Timer stoppen, falls er läuft
                if (timerInterval) {
                    stopTimer();
                }
                
                // Seite neu laden, um zur Startansicht zurückzukehren
                window.location.reload();
            }
        });
    }
    
    // Event-Listener für den Stop-Button (Fertig gelesen)
    if (stopButton) {
        stopButton.addEventListener("click", function() {
            proceedToNextPhase();
        });
    }
    
    // Event-Listener für das Datenschutz-Formular
    if (submitButton) {
        submitButton.addEventListener("click", function(event) {
            event.preventDefault();
            
            // Datenschutz-Checkbox überprüfen
            const checkbox = document.getElementById("flexCheckDefault");
            if (!checkbox.checked) {
                // Validierungsfeedback anzeigen
                checkbox.classList.add("is-invalid");
                return;
            }
            
            // Wenn die Checkbox angekreuzt ist, zur nächsten Phase wechseln
            proceedToNextPhase();
        });
    }
    
    // Event-Listener für das Demografie-Formular
    if (demographicsForm) {
        demographicsForm.addEventListener("submit", function(event) {
            event.preventDefault();
            
            // Formulardaten sammeln
            const formData = new FormData(demographicsForm);
            userData.demographics = {
                age: formData.get("age"),
                gender: formData.get("gender"),
                hasDyslexia: formData.get("dyslexia")
            };
            
            proceedToNextPhase();
        });
    }
    
    // Event-Listener für das Fragen-Formular
    if (questionsForm) {
        questionsForm.addEventListener("submit", function(event) {
            event.preventDefault();
            
            // Formulardaten sammeln
            const formData = new FormData(questionsForm);
            
            // Je nach Phase unterschiedliche Daten speichern
            if (currentPhase === 3) { // Fragen zum Inhalt für Text 1
                userData.text1.contentQuestions = evaluateAnswers(1, formData);
            } else if (currentPhase === 4) { // Fragen zur Leseempfindung für Text 1
                userData.text1.readingExperience = {
                    readability: formData.get("readability"),
                    effort: formData.get("effort"),
                    fontLiking: formData.get("fontLiking"),
                    comments: formData.get("comments")
                };
            } else if (currentPhase === 6) { // Fragen zum Inhalt für Text 2
                userData.text2.contentQuestions = evaluateAnswers(2, formData);
            } else if (currentPhase === 7) { // Fragen zur Leseempfindung für Text 2
                userData.text2.readingExperience = {
                    readability: formData.get("readability"),
                    effort: formData.get("effort"),
                    fontLiking: formData.get("fontLiking"),
                    comments: formData.get("comments")
                };
            }
            
            // Formular zurücksetzen für die nächste Phase
            questionsForm.reset();
            
            proceedToNextPhase();
        });
    }
    
    // Funktion zum Ausblenden leerer Sektionen
    function hideEmptyQuestionSections() {
        const contentQuestionsDiv = document.getElementById('content-questions');
        if (contentQuestionsDiv) {
            const parentSection = contentQuestionsDiv.closest('.question-section');
            if (parentSection && (contentQuestionsDiv.classList.contains('d-none') || contentQuestionsDiv.children.length === 0)) {
                parentSection.style.display = 'none';
            } else if (parentSection) {
                parentSection.style.display = '';
            }
        }
    }
    
    // Diese Funktion nach dem Laden der Seite und nach dem Aktualisieren der Fragen aufrufen
    hideEmptyQuestionSections();
    
    // Beobachter für Änderungen an content-questions einrichten
    const contentQuestionsDiv = document.getElementById('content-questions');
    if (contentQuestionsDiv) {
        const observer = new MutationObserver(hideEmptyQuestionSections);
        observer.observe(contentQuestionsDiv, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }
    
    // Vorhandene createContentQuestions-Funktion erweitern
    const originalCreateContentQuestions = createContentQuestions;
    if (typeof createContentQuestions === 'function') {
        createContentQuestions = function() {
            originalCreateContentQuestions.apply(this, arguments);
            hideEmptyQuestionSections();
        };
    }
});

