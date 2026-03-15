// Seleziono l'elemento target che voglio cambiare, e lo faccio tramite il suo ID
const elemento = document.getElementById('target');

// Cambio il contenuto del testo target, inserendo la frase sottostante:
elemento.textContent = "Questo testo non è stato scritto sul file .html, ma è stato inserito tramite un file JS esterno!";

// Imposto colore e stile del testo
elemento.style.color = "#ff4500";
elemento.style.fontSize = "24px";
elemento.style.fontFamily = "sans-serif";