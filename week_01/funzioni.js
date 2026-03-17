const elemento = document.getElementById('target');
if(elemento) {
    elemento.textContent = "Questo testo non è stato scritto sul file .html, ma è stato inserito tramite un file JS esterno!";
    elemento.style.color = "#ff4500";
    elemento.style.fontSize = "24px";
    elemento.style.fontFamily = "sans-serif";
}


// Seleziono il testo e i due pulsanti tramite i loro ID
const testoDaModificare = document.getElementById('testo-interattivo');
const btnTesto = document.getElementById('btn-testo');
const btnColore = document.getElementById('btn-colore');

// Funzione per cambiare il testo
btnTesto.addEventListener('click', function() {
    testoDaModificare.textContent = "Hai cliccato il pulsante! Il testo è cambiato 🎉";
});

// Funzione per cambiare il colore in modo casuale
btnColore.addEventListener('click', function() {
    // Genero un colore casuale
    const colori = ["#27ae60", "#8e44ad", "#c0392b", "#f39c12", "#2c3e50"];
    const coloreCasuale = colori[Math.floor(Math.random() * colori.length)];
    
    testoDaModificare.style.color = coloreCasuale;
});
