// Questo script inserisce l'anno corrente nel footer automaticamente
document.addEventListener("DOMContentLoaded", function() {
    const yearSpan = document.getElementById("year");
    const currentYear = new Date().getFullYear();
    yearSpan.textContent = currentYear;
    
    console.log("Blog caricato con successo!");
});