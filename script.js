document.addEventListener("DOMContentLoaded", function() {
    // Aggiorna l'anno nel footer
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    console.log("Blog pronto e navigabile!");
});
