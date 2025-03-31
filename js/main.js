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
    const confirmDeleteModal = document.getElementById("confirm-delete-modal");
    
    // Buttons und Formulare
    const submitButton = document.querySelector("#formular button[type='submit']");
    const demographicsForm = document.getElementById("demographics-form");
    const questionsForm = document.getElementById("questions-form");
    const stopButton = document.getElementById("stop-button");
    const cancelButton = document.getElementById("cancel-button");
    const confirmDeleteButton = document.getElementById("confirm-delete-button");
    
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
    let selectedFonts = [];
    let readingTimes = [];
    let userData = {
        demographics: {
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
                "question": "Wie heißt der Protagonist der Geschichte?",
                "type": "radio",
                "options": ["Thomas", "Michael", "Jonas", "Peter"],
                "correctAnswer": "Jonas"
            },
            {
                "question": "Was entdeckt Jonas im Leuchtturm?",
                "type": "radio",
                "options": ["Eine Schatzkarte", "Ein altes Tagebuch", "Eine versteckte Tür", "Einen alten Mann"],
                "correctAnswer": "Einen alten Mann"
            },
            {
                "question": "Warum meiden die Dorfbewohner den Leuchtturm?",
                "type": "radio",
                "options": [
                    "Sie glauben, dass dort Geister leben.",
                    "Der Leuchtturm ist einsturzgefährdet.",
                    "Es gibt gefährliche Strömungen in der Nähe.",
                    "Der alte Mann hat sie verjagt."
                ],
                "correctAnswer": "Sie glauben, dass dort Geister leben."
            },
            {
                "question": "Welche Aufgabe übernimmt Jonas am Ende der Geschichte?",
                "type": "radio",
                "options": [
                    "Er bewacht den Leuchtturm.",
                    "Er hilft dem alten Mann, das Licht zu bewahren.",
                    "Er verlässt das Dorf.",
                    "Er entdeckt einen Schatz."
                ],
                "correctAnswer": "Er hilft dem alten Mann, das Licht zu bewahren."
            },
            {
                "question": "Welche Farbe hatte das Dach des Leuchtturms?",
                "type": "radio",
                "options": [
                    "Grün",
                    "Braun",
                    "Rot",
                    "Wurde nicht genannt"
                ],
                "correctAnswer": "Grün"
            },
            {
                "question": "Welches Wetter herrschte während der Geschichte?",
                "type": "radio",
                "options": [
                    "Strahlende Sonne",
                    "Bewölkt",
                    "Stürmisch",
                    "Wurde nicht genannt"
                ],
                "correctAnswer": "Stürmisch"
            }
        ],
        2: [
            {
                "question": "Wie heißt die Protagonistin der Geschichte?",
                "type": "radio",
                "options": ["Marie", "Luna", "Gerda", "Fuchsbach"],
                "correctAnswer": "Marie"
            },
            {
                "question": "Was erbt die Protagonistin, als sie in das Dorf zieht?",
                "type": "radio",
                "options": ["Ein altes Fachwerkhaus", "Ein modernes Apartment", "Ein Café", "Eine Scheune"],
                "correctAnswer": "Ein altes Fachwerkhaus"
            },
            {
                "question": "Wie heißt die Katze, die die Protagonistin an ihrem ersten Abend begegnet?",
                "type": "radio",
                "options": ["Mia", "Luna", "Bella", "Schatzi"],
                "correctAnswer": "Luna"
            },
            {
                "question": "Wie verändert sich das Leben der Protagonistin im Laufe der Geschichte?",
                "type": "radio",
                "options": [
                    "Sie bleibt einsam und isoliert.",
                    "Sie wird Teil der Dorfgemeinschaft.",
                    "Sie kehrt in die Stadt zurück.",
                    "Sie verkauft das geerbte Haus."
                ],
                "correctAnswer": "Sie wird Teil der Dorfgemeinschaft."
            },
            {
                "question": "Was gibt die Protagonistin der Katze am ersten Abend?",
                "type": "radio",
                "options": ["Ein Stück Wurst", "Katzenfutter", "Kochschinken", "Thunfisch"],
                "correctAnswer": "Thunfisch"
            },
            {
                "question": "Wie heißt die Lehrerin in Dorf?",
                "type": "radio",
                "options": ["Gerda", "Mia", "Gerlinde", "Es wurde kein Name Genannt"],
                "correctAnswer": "Es wurde kein Name Genannt"
            },
        ]
    };
    
    // Verfügbare Schriftarten
    const availableFonts = [
        { name: "Arial", class: "font-arial" },
        { name: "Times New Roman", class: "font-times" },
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
        confirmDeleteModal.classList.add("d-none");
        progressContainer.classList.add("d-none");
        
        // Falls es bereits eine Dankesmeldung gibt, diese entfernen
        const existingThankYou = document.querySelector(".thank-you-container");
        if (existingThankYou) {
            existingThankYou.remove();
        }
        
        // Neuen Container für die Dankesmeldung erstellen
        const thankYouContainer = document.createElement("div");
        thankYouContainer.classList.add("container", "mt-4", "bg-light", "p-4", "rounded", "shadow-sm", "thank-you-container");
        
        // Formatiere Leseerfahrung
        function formatReadingExperience(experience) {
            if (!experience || Object.keys(experience).length === 0) return "Keine Daten";
            
            return `
                <div class="mb-2">
                    <strong>Lesbarkeit:</strong> ${experience.readability || 'Keine Angabe'}/5
                </div>
                <div class="mb-2">
                    <strong>Aufwand:</strong> ${experience.effort || 'Keine Angabe'}/5
                </div>
                <div class="mb-2">
                    <strong>Schriftart-Bewertung:</strong> ${experience.fontLiking || 'Keine Angabe'}/5
                </div>
                <div class="mb-2">
                    <strong>Kommentare:</strong> ${experience.comments || 'Keine Kommentare'}
                </div>
            `;
        }
        
        // Formatiere Inhaltsfragen
        function formatContentQuestions(questions) {
            if (!questions || Object.keys(questions).length === 0) return "Keine Daten";
            
            let result = `<div class="mb-2"><strong>Korrekte Antworten:</strong> ${questions.correct || 0}/${questions.total || 0}</div>`;
            
            if (questions.answers && Object.keys(questions.answers).length > 0) {
                result += `<div class="accordion mt-3" id="questionsAccordion">`;
                
                let i = 0;
                for (const key in questions.answers) {
                    const answer = questions.answers[key];
                    const isCorrect = answer.isCorrect ? 'success' : 'danger';
                    const correctIcon = answer.isCorrect ? 'check' : 'times';
                    
                    result += `
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="heading${i}">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                                       data-bs-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}">
                                    Frage ${i+1}: <span class="ms-2 text-${isCorrect}">
                                        <i class="fas fa-${correctIcon} me-1"></i>
                                        ${answer.isCorrect ? 'Richtig' : 'Falsch'}
                                    </span>
                                </button>
                            </h2>
                            <div id="collapse${i}" class="accordion-collapse collapse" 
                                 aria-labelledby="heading${i}" data-bs-parent="#questionsAccordion">
                                <div class="accordion-body">
                                    <p><strong>Frage:</strong> ${answer.question}</p>
                                    <p><strong>Ihre Antwort:</strong> ${answer.givenAnswer || 'Keine Antwort'}</p>
                                    <p><strong>Richtige Antwort:</strong> ${answer.correctAnswer}</p>
                                </div>
                            </div>
                        </div>
                    `;
                    i++;
                }
                
                result += `</div>`;
            }
            
            return result;
        }


        
        // Dyslexie formatieren
        function formatDyslexia(hasDyslexia) {
            if (!hasDyslexia) return 'Keine Angabe';
            switch(hasDyslexia) {
                case 'yes': return 'Ja';
                case 'no': return 'Nein';
                case 'unsure': return 'Unsicher';
                default: return hasDyslexia;
            }
        }
        
        // Dankesmeldung und Datenzusammenfassung hinzufügen
        thankYouContainer.innerHTML = `
            <div class="row">
                <div class="col-12 text-center">
                    <div class="alert alert-success">
                        <h2>Vielen Dank für Ihre Teilnahme!</h2>
                        <p>Ihre Antworten wurden erfolgreich gespeichert.</p>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card mb-4">
                        <div class="card-header bg-primary text-white">
                            <h3 class="mb-0">Ihre Daten im Überblick</h3>
                        </div>
                        <div class="card-body">
                            <!-- Demographische Daten -->
                            <div class="mb-4">
                                <h4>Demographische Angaben</h4>
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-2">
                                            <strong>Legasthenie:</strong> ${formatDyslexia(userData.demographics.hasDyslexia)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Text 1 Daten -->
                            <div class="mb-4">
                                <h4>Text 1</h4>
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-2">
                                            <strong>Schriftart:</strong> ${userData.text1.font || 'Keine Angabe'}
                                        </div>
                                        <div class="mb-2">
                                            <strong>Lesezeit:</strong> ${readingTimes[0] || 0} Sekunden
                                        </div>
                                    </div>
                                    <div class="col-md-8">
                                        <div class="card mb-3">
                                            <div class="card-header">
                                                <h5 class="mb-0">Leseerfahrung</h5>
                                            </div>
                                            <div class="card-body">
                                                ${formatReadingExperience(userData.text1.readingExperience)}
                                            </div>
                                        </div>
                                        
                                        <div class="card">
                                            <div class="card-header">
                                                <h5 class="mb-0">Inhaltsfragen</h5>
                                            </div>
                                            <div class="card-body">
                                                ${formatContentQuestions(userData.text1.contentQuestions)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Text 2 Daten -->
                            <div class="mb-4">
                                <h4>Text 2</h4>
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-2">
                                            <strong>Schriftart:</strong> ${userData.text2.font || 'Keine Angabe'}
                                        </div>
                                        <div class="mb-2">
                                            <strong>Lesezeit:</strong> ${readingTimes[1] || 0} Sekunden
                                        </div>
                                    </div>
                                    <div class="col-md-8">
                                        <div class="card mb-3">
                                            <div class="card-header">
                                                <h5 class="mb-0">Leseerfahrung</h5>
                                            </div>
                                            <div class="card-body">
                                                ${formatReadingExperience(userData.text2.readingExperience)}
                                            </div>
                                        </div>
                                        
                                        <div class="card">
                                            <div class="card-header">
                                                <h5 class="mb-0">Inhaltsfragen</h5>
                                            </div>
                                            <div class="card-body">
                                                ${formatContentQuestions(userData.text2.contentQuestions)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Dankesmeldung zur Seite hinzufügen
        document.body.insertBefore(thankYouContainer, document.querySelector("footer"));
        
        // Cookie setzen, dass der Nutzer teilgenommen hat
        setCookie("umfrageAbgeschlossen", JSON.stringify(userData), 30);
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
                givenAnswer: givenAnswer || "Keine Antwort", // Explizite Behandlung von fehlenden Antworten
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
    confirmDeleteModal.classList.add("d-none");
    
    // Event-Listener für den Abbrechen-Button
    if (cancelButton) {
        cancelButton.addEventListener("click", function() {
            // Überprüfen, ob Bootstrap verfügbar ist
            if (typeof bootstrap === 'undefined') {
                console.error('Bootstrap ist nicht definiert. Das Modal kann nicht angezeigt werden.');
                alert('Es gab ein Problem beim Öffnen des Dialogs. Bitte versuchen Sie es später erneut.');
                return;
            }
            
            // Stellen Sie sicher, dass das Modal sichtbar ist und die d-none-Klasse entfernt wurde
            confirmDeleteModal.classList.remove('d-none');
            
            try {
                // Bootstrap-Modal öffnen - zuerst vorherige Instanz entfernen falls vorhanden
                let oldModal = bootstrap.Modal.getInstance(confirmDeleteModal);
                if (oldModal) {
                    oldModal.dispose();
                }
                
                // Neue Instanz erstellen und anzeigen
                const modal = new bootstrap.Modal(confirmDeleteModal, {
                    backdrop: true,
                    keyboard: true,
                    focus: true
                });
                modal.show();
                
                // Debug-Log
                console.log('Modal sollte jetzt angezeigt werden', confirmDeleteModal);
            } catch (error) {
                console.error('Fehler beim Öffnen des Modals:', error);
                
                // Fallback-Methode, wenn Bootstrap-Modal nicht funktioniert
                confirmDeleteModal.style.display = 'block';
                confirmDeleteModal.style.opacity = '1';
                document.body.classList.add('modal-open');
                
                // Manuelle Backdrop hinzufügen, wenn sie fehlt
                if (!document.querySelector('.modal-backdrop')) {
                    const backdrop = document.createElement('div');
                    backdrop.className = 'modal-backdrop fade show';
                    document.body.appendChild(backdrop);
                }
            }
        });
    }

    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener("click", function() {
            // Bootstrap-Modal schließen
            const modal = bootstrap.Modal.getInstance(confirmDeleteModal);
            if (modal) {
                modal.hide();
            }

            // Teilnehmer-ID aus userData oder aus dem Cookie holen
            const participantId = userData.participantId || getCookie('participantId');
            
            // Alle Daten aus der Datenbank löschen, wenn eine ID vorhanden ist
            if (participantId) {
                // Wir lassen deleteFromDatabase die Weiterleitung und das Löschen der Cookies übernehmen
                deleteFromDatabase(participantId);
                return; // Weitere Ausführung stoppen
            } else {
                // Keine ID gefunden, also nur lokale Daten löschen
                deleteCookie("umfrageAbgeschlossen");
                deleteCookie("participantId");
                
                // Zur Startseite zurückkehren
                window.location.href = 'index.html';
            }

            // Timer stoppen, falls er läuft
            if (timerInterval) {
                stopTimer();
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
            
            if (!demographicsForm.checkValidity()) {
                event.stopPropagation();
                demographicsForm.classList.add('was-validated');
                return;
            }

            const params = new URLSearchParams(window.location.search);
            // Formulardaten sammeln
            const formData = new FormData(demographicsForm);
            userData.demographics = {
                hasDyslexia: formData.get("dyslexia"),
                isEmployee: params.get("isEmployee") === "true" ? "yes" : "no"
            };

            // Speichern der Demografiedaten in der Datenbank
            saveDemographicsToDatabase(userData.demographics);
            
            // Zur nächsten Phase weitergehen
            proceedToNextPhase();
        });
    }
    
    // Event-Listener für das Fragen-Formular
    if (questionsForm) {
        questionsForm.addEventListener("submit", function(event) {
            event.preventDefault();
            
            // Formulardaten sammeln
            const formData = new FormData(questionsForm);
            
            // Prüfen, ob es sich um Inhaltsfragen handelt (Phase 3 und 6)
            if (currentPhase === 3 || currentPhase === 6) {
                // Sammeln der Antworten und überprüfen, ob alle beantwortet wurden
                const textNumber = currentPhase === 3 ? 1 : 2;
                const questions = contentQuestionsForText[textNumber];
                let allQuestionsAnswered = true;
                
                // Überprüfen, ob alle Fragen beantwortet wurden
                for (let i = 0; i < questions.length; i++) {
                    const answerKey = `q${textNumber}_${i}`;
                    if (!formData.has(answerKey) || !formData.get(answerKey)) {
                        allQuestionsAnswered = false;
                    }
                }
                
                // Nur fortfahren, wenn alle Fragen beantwortet wurden
                if (!allQuestionsAnswered) {
                    questionsForm.classList.add('was-validated');
                    return;
                }
                
                // Speichern der Antworten
                if (currentPhase === 3) {
                    userData.text1.contentQuestions = evaluateAnswers(1, formData);
                } else {
                    userData.text2.contentQuestions = evaluateAnswers(2, formData);
                }
                
                // Zur nächsten Phase weitergehen
                questionsForm.reset();
                proceedToNextPhase();
                return;
            }
            
            // Für Leseempfindungsfragen (Phase 4 und 7)
            if (currentPhase === 4 || currentPhase === 7) {
                // Überprüfen, ob die erforderlichen Felder ausgefüllt sind (Lesbarkeit, Aufwand, Schriftart-Bewertung)
                let readability = formData.get("readability");
                let effort = formData.get("effort");
                let fontLiking = formData.get("fontLiking");
                
                // Bei Leseempfindungsfragen die Pflichtfelder prüfen
                if (!readability || !effort || !fontLiking) {
                    // Nur die Validierung für die erforderlichen Felder anzeigen
                    questionsForm.classList.add('was-validated');
                    return;
                }



                let returnData;

                // Daten sammeln und speichern
                if (currentPhase === 4) {
                    userData.text1.readingExperience = {
                        readability: readability,
                        effort: effort,
                        fontLiking: fontLiking,
                        comments: formData.get("comments") || "" // Kommentare sind optional
                    };
                    returnData = {
                        TeilnehmerID: userData.participantId,
                        Lesedaten: {
                            Textnummer: currentPhase === 1,
                            Schriftart: userData.text1.font,
                            Lesezeit: userData.text1.readingTime,
                            Lesbarkeit: readability,
                            EmpfundeneLesegeschwindigkeit: effort,
                            Bewertung: fontLiking,
                            Kommentar: formData.get("comments") || ""
                        }
                    }
                } else {
                    userData.text1.readingExperience = {
                        readability: readability,
                        effort: effort,
                        fontLiking: fontLiking,
                        comments: formData.get("comments") || "" // Kommentare sind optional
                    };
                    returnData = {
                        TeilnehmerID: userData.participantId,
                        Lesedaten: {
                            Textnummer: currentPhase === 2,
                            Schriftart: userData.text2.font,
                            Lesezeit: userData.text2.readingTime,
                            Lesbarkeit: readability,
                            EmpfundeneLesegeschwindigkeit: effort,
                            Bewertung: fontLiking,
                            Kommentar: formData.get("comments") || ""
                        }
                    }
                }

                saveReadingDataToDatabase(returnData)
                    .then( id =>{
                        saveAnswersToDatabase(id ,userData.text1.contentQuestions.answers);
                    });


                userData.text1.contentQuestions
                
                // Zur nächsten Phase weitergehen
                questionsForm.reset();
                proceedToNextPhase();
                return;
            }
            
            // Für andere Phasen (falls vorhanden) - nutzen der Standardvalidierung
            if (!questionsForm.checkValidity()) {
                event.stopPropagation();
                questionsForm.classList.add('was-validated');
                return;
            }
            
            // Formular zurücksetzen für die nächste Phase
            questionsForm.reset();
            proceedToNextPhase();
        });
    }

    function saveAnswersToDatabase(ReadingID,Questions){
        console.log('Sende Antworten:', JSON.stringify(Questions));

        Object.entries(Questions).forEach(([key, q]) => {
            let questionData = {
                LeseID: ReadingID,
                Frage:{
                    Fragenummer: key,
                    Antwort: q.givenAnswer,
                    RichtigeAntwort: q.correctAnswer
                }
            }

            fetch('api/fragen.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(questionData)
            })
                .catch(error => {
                    console.error('Fehler beim Speichern der lesedaten:', error);
                    alert('Es gab ein Problem beim Speichern der Daten.');
                });
        })
    }

    async function saveReadingDataToDatabase(readingdata) {
        console.log('Sende Lesedaten:', JSON.stringify(readingdata));

        try {
            const ID = await fetch('api/Lesung.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(readingdata)
            })
                .then(response => response.json())
                .then(data => data.readingId);

            return ID;
        } catch (error) {
            console.error('Fehler beim Speichern der Lesedaten:', error);
            alert('Es gab ein Problem beim Speichern der Daten.');
            throw error; // Fehler weitergeben
        }
    }



    // Funktion zum Speichern der Demografiedaten in der Datenbank
    function saveDemographicsToDatabase(demographicsData) {
        console.log('Sende Demografiedaten:', JSON.stringify(demographicsData));
        
        // API-Endpunkt aufrufen
        fetch('api/teilnehmer.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(demographicsData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Teilnehmer-ID:', data.participantId || data.id);
            // Eventuell ID in einem Cookie oder localStorage speichern für spätere Verwendung
            if (data.participantId || data.id) {
                // ID im Cookie speichern
                const participantId = data.participantId || data.id;
                setCookie('participantId', participantId, 7); // Speichert ID für 7 Tage
                
                // ID auch im userData-Objekt speichern
                userData.participantId = participantId;
            }
        })
        .catch(error => {
            console.error('Fehler beim Speichern der Demografiedaten:', error);
            alert('Es gab ein Problem beim Speichern der Daten.');
        });
    }

    // Funktion zum Löschen der Daten aus der Datenbank
    function deleteFromDatabase(participantId) {
        if (!participantId) {
            console.error('Keine Teilnehmer-ID zum Löschen angegeben');
            alert('Keine Teilnehmer-ID zum Löschen angegeben');
            return;
        }

        // Variable zum Verfolgen des Löschversuchs
        let deleteAttempted = false;

        fetch('api/teilnehmer.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ participantId })
        })
        .then(response => {
            // Markieren, dass wir versucht haben zu löschen
            deleteAttempted = true;
            
            if (!response.ok) {
                if (response.status === 500) {
                    return response.json().then(data => {
                        throw new Error(`Serverfehler: ${data.error || response.statusText}`);
                    });
                }
                if (response.status === 405) {
                    throw new Error(`Methode nicht erlaubt: DELETE wird vom Server nicht unterstützt`);
                }
                throw new Error(`HTTP-Fehler: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Daten aus der Datenbank gelöscht:', data);
            if (data.success) {
                // Alle relevanten Cookies löschen
                deleteCookie("participantId");
                deleteCookie("umfrageAbgeschlossen");

                // Zur Hauptseite navigieren
                window.location.href = 'index.html';
            }
        })
        .catch(error => {
            console.error('Fehler beim Löschen der Daten aus der Datenbank:', error);

            // Für andere Fehler normale Fehlerbehandlung
            let errorMessage = error.message || 'Unbekannter Fehler';
            
            // Bei Netzwerkfehlern
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                errorMessage = 'Verbindung zum Server konnte nicht hergestellt werden. Bitte überprüfen Sie Ihre Internetverbindung und den Server-Status.';
            }
            
            alert(`Fehler beim Löschen der Daten: ${errorMessage}`);
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

    // Initialisierung beim Laden der Seite
    document.addEventListener("DOMContentLoaded", function() {
        // Prüfen, ob bereits eine Teilnehmer-ID im Cookie existiert
        const savedParticipantId = getCookie('participantId');
        if (savedParticipantId) {
            userData.participantId = savedParticipantId;
        }
    });
});

