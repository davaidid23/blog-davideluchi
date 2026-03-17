// Aspettiamo che il documento sia completamente caricato prima di eseguire il codice
document.addEventListener("DOMContentLoaded", function() {

    // --- ESERCIZIO 1.1: Sostituzione testo automatica ---
    const elemento = document.getElementById('target');
    if (elemento) {
        elemento.textContent = "Questo testo non è stato scritto sul file .html, ma è stato inserito tramite un file JS esterno!";
        elemento.style.color = "#ff4500";
        elemento.style.fontSize = "24px";
        elemento.style.fontFamily = "sans-serif";
    }

    // --- ESERCIZIO 1.2: Programma Interattivo con Pulsanti ---
    const testoDaModificare = document.getElementById('testo-interattivo');
    const btnTesto = document.getElementById('btn-testo');
    const btnColore = document.getElementById('btn-colore');

    // Controllo che i pulsanti esistano nella pagina prima di aggiungere le funzioni
    if (btnTesto && testoDaModificare) {
        btnTesto.addEventListener('click', function() {
            testoDaModificare.textContent = "Hai cliccato il pulsante! Il testo è cambiato 🎉";
        });
    }

    if (btnColore && testoDaModificare) {
        btnColore.addEventListener('click', function() {
            const colori = ["#27ae60", "#8e44ad", "#c0392b", "#f39c12", "#2c3e50"];
            const coloreCasuale = colori[Math.floor(Math.random() * colori.length)];
            testoDaModificare.style.color = coloreCasuale;
        });
    }

});
