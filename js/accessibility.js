// Barrierefreiheits-Funktionen für KJSH Lernen Umfrage

document.addEventListener("DOMContentLoaded", function() {
    // Buttons für Barrierefreiheit
    const highContrastToggleButton = document.getElementById('high-contrast-toggle');
    const dyslexiaFriendlyToggleButton = document.getElementById('dyslexia-friendly-toggle');
    const fontSizeSmaller = document.getElementById('font-size-smaller');
    const fontSizeReset = document.getElementById('font-size-reset');
    const fontSizeLarger = document.getElementById('font-size-larger');
    
    // Standardwerte
    let currentFontSizeLevel = parseInt(localStorage.getItem('fontSizeLevel') || 0); // 0 = normal, 1 = größer, 2 = noch größer, -1 = kleiner
    let highContrastEnabled = localStorage.getItem('highContrast') === 'true';
    let dyslexiaFriendlyEnabled = localStorage.getItem('dyslexiaFriendly') === 'true';
    
    // Initialisierung der Barrierefreiheits-Einstellungen
    initAccessibilitySettings();
    
    // Event-Listener für Buttons
    if (fontSizeLarger) {
        fontSizeLarger.addEventListener('click', increaseFontSize);
    }
    
    if (fontSizeSmaller) {
        fontSizeSmaller.addEventListener('click', decreaseFontSize);
    }
    
    if (fontSizeReset) {
        fontSizeReset.addEventListener('click', resetFontSize);
    }
    
    if (highContrastToggleButton) {
        highContrastToggleButton.addEventListener('click', toggleHighContrast);
    }
    
    if (dyslexiaFriendlyToggleButton) {
        dyslexiaFriendlyToggleButton.addEventListener('click', toggleDyslexiaFriendly);
    }
    
    // Funktion zum Zurücksetzen der Schriftgröße
    function resetFontSize() {
        currentFontSizeLevel = 0;
        applyFontSize();
        saveFontSizePreference();
        notifyUser("Schriftgröße zurückgesetzt");
    }
    
    // Funktion zum Initialisieren der Barrierefreiheits-Einstellungen
    function initAccessibilitySettings() {
        // Schriftgröße anwenden
        applyFontSize();
        
        // Kontrast anwenden
        if (highContrastEnabled) {
            document.body.classList.add('high-contrast');
            if (highContrastToggleButton) {
                highContrastToggleButton.classList.add('active');
                highContrastToggleButton.setAttribute('aria-pressed', 'true');
            }
        }
        
        // Dyslexie-Modus anwenden
        if (dyslexiaFriendlyEnabled) {
            document.body.classList.add('dyslexia-friendly');
            if (dyslexiaFriendlyToggleButton) {
                dyslexiaFriendlyToggleButton.classList.add('active');
                dyslexiaFriendlyToggleButton.setAttribute('aria-pressed', 'true');
            }
        }
    }
    
    // Funktion zum Vergrößern der Schriftgröße
    function increaseFontSize() {
        if (currentFontSizeLevel < 2) {
            currentFontSizeLevel++;
            applyFontSize();
            saveFontSizePreference();
            
            // Visuelle Rückmeldung zur Aktion
            notifyUser("Schriftgröße erhöht");
        } else {
            notifyUser("Maximale Schriftgröße erreicht");
        }
    }
    
    // Funktion zum Verkleinern der Schriftgröße
    function decreaseFontSize() {
        if (currentFontSizeLevel > -1) {
            currentFontSizeLevel--;
            applyFontSize();
            saveFontSizePreference();
            
            // Visuelle Rückmeldung zur Aktion
            notifyUser("Schriftgröße verringert");
        } else {
            notifyUser("Minimale Schriftgröße erreicht");
        }
    }
    
    // Funktion zum Anwenden der Schriftgröße
    function applyFontSize() {
        // CSS-Klassen für Schriftgrößen entfernen
        document.body.classList.remove('font-size-smaller', 'font-size-larger', 'font-size-largest');
        
        // Aktive Schaltflächen-Klassen entfernen
        if (fontSizeLarger) fontSizeLarger.classList.remove('active');
        if (fontSizeSmaller) fontSizeSmaller.classList.remove('active');
        if (fontSizeReset) fontSizeReset.classList.remove('active');
        
        // Neue Schriftgröße anwenden
        switch (currentFontSizeLevel) {
            case -1:
                document.body.classList.add('font-size-smaller');
                if (fontSizeSmaller) fontSizeSmaller.classList.add('active');
                break;
            case 0:
                if (fontSizeReset) fontSizeReset.classList.add('active');
                break;
            case 1:
                document.body.classList.add('font-size-larger');
                if (fontSizeLarger) fontSizeLarger.classList.add('active');
                break;
            case 2:
                document.body.classList.add('font-size-largest');
                if (fontSizeLarger) fontSizeLarger.classList.add('active');
                break;
        }
    }
    
    // Funktion zum Speichern der Schriftgröße in localStorage
    function saveFontSizePreference() {
        localStorage.setItem('fontSizeLevel', currentFontSizeLevel);
    }
    
    // Funktion zum Umschalten des hohen Kontrasts
    function toggleHighContrast() {
        highContrastEnabled = !highContrastEnabled;
        
        if (highContrastEnabled) {
            document.body.classList.add('high-contrast');
            if (highContrastToggleButton) {
                highContrastToggleButton.classList.add('active');
                highContrastToggleButton.setAttribute('aria-pressed', 'true');
            }
            notifyUser("Hoher Kontrast aktiviert");
        } else {
            document.body.classList.remove('high-contrast');
            if (highContrastToggleButton) {
                highContrastToggleButton.classList.remove('active');
                highContrastToggleButton.setAttribute('aria-pressed', 'false');
            }
            notifyUser("Hoher Kontrast deaktiviert");
        }
        
        // Präferenz speichern
        localStorage.setItem('highContrast', highContrastEnabled);
    }
    
    // Funktion zum Umschalten des Dyslexie-freundlichen Modus
    function toggleDyslexiaFriendly() {
        dyslexiaFriendlyEnabled = !dyslexiaFriendlyEnabled;
        
        if (dyslexiaFriendlyEnabled) {
            document.body.classList.add('dyslexia-friendly');
            if (dyslexiaFriendlyToggleButton) {
                dyslexiaFriendlyToggleButton.classList.add('active');
                dyslexiaFriendlyToggleButton.setAttribute('aria-pressed', 'true');
            }
            notifyUser("Lesehilfe aktiviert");
        } else {
            document.body.classList.remove('dyslexia-friendly');
            if (dyslexiaFriendlyToggleButton) {
                dyslexiaFriendlyToggleButton.classList.remove('active');
                dyslexiaFriendlyToggleButton.setAttribute('aria-pressed', 'false');
            }
            notifyUser("Lesehilfe deaktiviert");
        }
        
        // Präferenz speichern
        localStorage.setItem('dyslexiaFriendly', dyslexiaFriendlyEnabled);
    }
    
    // Funktion zur Benachrichtigung über Barrierefreiheitsänderungen
    function notifyUser(message) {
        // Prüfen, ob bereits eine Benachrichtigung vorhanden ist
        let existingNotification = document.querySelector('.accessibility-notification');
        if (existingNotification) {
            // Existierende Benachrichtigung entfernen
            existingNotification.remove();
        }
        
        // Neue Benachrichtigung erstellen
        const notification = document.createElement('div');
        notification.className = 'accessibility-notification';
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        notification.textContent = message;
        
        // Benachrichtigung zum Body hinzufügen
        document.body.appendChild(notification);
        
        // Benachrichtigung nach kurzer Zeit ausblenden
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 2000);
    }
    
    // Verbesserungen für die Formularvalidierung
    const forms = document.querySelectorAll('.needs-validation');
    
    // Bootstrap-Validierungslogik anwenden
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                
                // Finde das erste ungültige Element und scrolle dorthin
                const firstInvalid = form.querySelector(':invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                    firstInvalid.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }
            
            form.classList.add('was-validated');
        }, false);
    });
    
    // Verbessere die Tastaturnavigation für Radio-Buttons
    const radioGroups = document.querySelectorAll('input[type="radio"]');
    
    radioGroups.forEach(radio => {
        radio.addEventListener('keydown', function(event) {
            // Bei Drücken der Tasten Pfeil rechts/links zwischen Radio-Buttons navigieren
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault();
                
                const name = this.getAttribute('name');
                const radios = document.querySelectorAll(`input[name="${name}"]`);
                const currentIndex = Array.from(radios).indexOf(this);
                
                let newIndex;
                if (event.key === 'ArrowRight') {
                    newIndex = (currentIndex + 1) % radios.length;
                } else {
                    newIndex = (currentIndex - 1 + radios.length) % radios.length;
                }
                
                radios[newIndex].focus();
                radios[newIndex].checked = true;
            }
        });
    });
    
    // Skip-Link zum besseren Fokus-Handling
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            
            if (target) {
                target.setAttribute('tabindex', '-1');
                target.focus();
                
                // tabindex wieder entfernen, nachdem der Fokus gesetzt wurde
                setTimeout(() => {
                    target.removeAttribute('tabindex');
                }, 1000);
            }
        });
    }
}); 