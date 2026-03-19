document.addEventListener("DOMContentLoaded", function() {
    console.log("--- INIZIO CONFRONTO ALGORITMI ---");

    // Funzione per generare un array di numeri casuali
    // 'offset' serve per spostare i numeri su valori enormi, 'scala' è la grandezza della variazione
    function generaNumeri(N, offset, scala) {
        const dati = [];
        for (let i = 0; i < N; i++) {
            dati.push(offset + (Math.random() * scala));
        }
        return dati;
    }

    // --- ALGORITMO 1: NAIVE (Formula scolastica standard) ---
    function calcolaNaive(array) {
        const n = array.length;
        if (n < 2) return { media: 0, varianza: 0 };
        
        let somma = 0;
        let sommaQuadrati = 0;

        for (let x of array) {
            somma += x;
            sommaQuadrati += x * x;
        }

        const media = somma / n;
        // Varianza = (Somma(x^2) - (Somma(x)^2)/n) / (n-1)
        const varianza = (sommaQuadrati - (somma * somma) / n) / (n - 1);
        
        return { media: media, varianza: varianza };
    }

    // --- ALGORITMO 2: WELFORD (Formula Ricorsiva) ---
    function calcolaWelford(array) {
        let n = 0;
        let media = 0;
        let M2 = 0;

        for (let x of array) {
            n++;
            let delta = x - media;
            media += delta / n;
            let delta2 = x - media;
            M2 += delta * delta2;
        }

        const varianza = n > 1 ? M2 / (n - 1) : 0;
        return { media: media, varianza: varianza };
    }

    // Numero di campioni da generare (100.000 per rendere evidente il problema)
    const numeroCampioni = 100000;

    // ==========================================
    // TEST 1: NUMERI "NORMALI" (es. tra 0 e 100)
    // ==========================================
    console.log("TEST 1: Numeri Normali (es. da 0 a 100)");
    const datiNormali = generaNumeri(numeroCampioni, 0, 100);
    
    const naiveNormale = calcolaNaive(datiNormali);
    const welfordNormale = calcolaWelford(datiNormali);
    
    console.log("Naive   -> Media: " + naiveNormale.media.toFixed(4) + " | Varianza: " + naiveNormale.varianza.toFixed(4));
    console.log("Welford -> Media: " + welfordNormale.media.toFixed(4) + " | Varianza: " + welfordNormale.varianza.toFixed(4));
    console.log("Differenza Varianza: " + Math.abs(naiveNormale.varianza - welfordNormale.varianza));
    console.log("--------------------------------------");

    // ==========================================
    // TEST 2: NUMERI "DIFFICILI" (1 miliardo + piccola variazione)
    // ==========================================
    console.log("TEST 2: Numeri Difficili (es. 1 miliardo + variazione da 0 a 10)");
    const datiDifficili = generaNumeri(numeroCampioni, 1000000000, 10);
    
    const naiveDifficile = calcolaNaive(datiDifficili);
    const welfordDifficile = calcolaWelford(datiDifficili);
    
    console.log("Naive   -> Media: " + naiveDifficile.media.toFixed(4) + " | Varianza: " + naiveDifficile.varianza.toFixed(4));
    console.log("Welford -> Media: " + welfordDifficile.media.toFixed(4) + " | Varianza: " + welfordDifficile.varianza.toFixed(4));
    console.log("Differenza Varianza: " + Math.abs(naiveDifficile.varianza - welfordDifficile.varianza));
    
    if (naiveDifficile.varianza < 0 || Math.abs(naiveDifficile.varianza - welfordDifficile.varianza) > 1) {
        console.log("🚨 ATTENZIONE: L'algoritmo Naive ha fallito! Ha perso precisione numerica a causa di valori troppo grandi (cancellazione catastrofica). Welford invece ha retto perfettamente.");
    }
    console.log("--------------------------------------");
});
