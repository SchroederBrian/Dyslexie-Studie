// Barrierefreiheits-Funktionen für KJSH Lernen Umfrage

document.addEventListener("DOMContentLoaded", function() {
    // Buttons für Barrierefreiheit
    const fontSizeIncreaseButton = document.querySelector('.font-size-increase');
    const fontSizeDecreaseButton = document.querySelector('.font-size-decrease');
    const contrastToggleButton = document.querySelector('.contrast-toggle');
    const dyslexiaFriendlyButton = document.querySelector('.dyslexia-friendly-toggle');
    
    // Standardwerte
    let currentFontSizeLevel = parseInt(localStorage.getItem('fontSizeLevel') || 0); // 0 = normal, 1 = größer, 2 = noch größer, -1 = kleiner
    let highContrastEnabled = localStorage.getItem('highContrast') === 'true';
    let dyslexiaFriendlyEnabled = localStorage.getItem('dyslexiaFriendly') === 'true';
    
    // Initialisierung der Barrierefreiheits-Einstellungen
    initAccessibilitySettings();
    
    // Event-Listener für Buttons
    if (fontSizeIncreaseButton) {
        fontSizeIncreaseButton.addEventListener('click', increaseFontSize);
    }
    
    if (fontSizeDecreaseButton) {
        fontSizeDecreaseButton.addEventListener('click', decreaseFontSize);
    }
    
    if (contrastToggleButton) {
        contrastToggleButton.addEventListener('click', toggleHighContrast);
    }
    
    if (dyslexiaFriendlyButton) {
        dyslexiaFriendlyButton.addEventListener('click', toggleDyslexiaFriendly);
    }
    
    // Funktion zum Initialisieren der Barrierefreiheits-Einstellungen
    function initAccessibilitySettings() {
        // Schriftgröße anwenden
        applyFontSize();
        
        // Kontrast anwenden
        if (highContrastEnabled) {
            document.body.classList.add('high-contrast');
            if (contrastToggleButton) contrastToggleButton.classList.add('active');
        }
        
        // Dyslexie-Modus anwenden
        if (dyslexiaFriendlyEnabled) {
            document.body.classList.add('dyslexia-friendly');
            if (dyslexiaFriendlyButton) dyslexiaFriendlyButton.classList.add('active');
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
        if (fontSizeIncreaseButton) fontSizeIncreaseButton.classList.remove('active');
        if (fontSizeDecreaseButton) fontSizeDecreaseButton.classList.remove('active');
        
        // Neue Schriftgröße anwenden
        switch (currentFontSizeLevel) {
            case -1:
                document.body.classList.add('font-size-smaller');
                if (fontSizeDecreaseButton) fontSizeDecreaseButton.classList.add('active');
                break;
            case 1:
                document.body.classList.add('font-size-larger');
                if (fontSizeIncreaseButton) fontSizeIncreaseButton.classList.add('active');
                break;
            case 2:
                document.body.classList.add('font-size-largest');
                if (fontSizeIncreaseButton) fontSizeIncreaseButton.classList.add('active');
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
            contrastToggleButton.classList.add('active');
            notifyUser("Hoher Kontrast aktiviert");
        } else {
            document.body.classList.remove('high-contrast');
            contrastToggleButton.classList.remove('active');
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
            dyslexiaFriendlyButton.classList.add('active');
            notifyUser("Lesehilfe aktiviert");
        } else {
            document.body.classList.remove('dyslexia-friendly');
            dyslexiaFriendlyButton.classList.remove('active');
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