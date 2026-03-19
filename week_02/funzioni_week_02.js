document.addEventListener("DOMContentLoaded", function() {

    // Funzione per generare array di numeri casuali
    function generaNumeri(N, offset, scala) {
        const dati = [];
        for (let i = 0; i < N; i++) {
            dati.push(offset + (Math.random() * scala));
        }
        return dati;
    }

    // Algoritmo Naive
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
        const varianza = (sommaQuadrati - (somma * somma) / n) / (n - 1);
        return { media: media, varianza: varianza };
    }

    // Algoritmo Welford
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

    // Collegamento all'interfaccia HTML
    const btnNormale = document.getElementById('btn-test-normale');
    const btnDifficile = document.getElementById('btn-test-difficile');
    const displayOutput = document.getElementById('output-algoritmi');
    const numeroCampioni = 100000;

    if(btnNormale) {
        btnNormale.addEventListener('click', function() {
            displayOutput.textContent = "Calcolo in corso sui numeri normali...\n";
            
            const datiNormali = generaNumeri(numeroCampioni, 0, 100);
            const naive = calcolaNaive(datiNormali);
            const welford = calcolaWelford(datiNormali);
            
            let risultato = "--- TEST 1: Numeri da 0 a 100 ---\n\n";
            risultato += "NAIVE   -> Media: " + naive.media.toFixed(4) + " | Varianza: " + naive.varianza.toFixed(4) + "\n";
            risultato += "WELFORD -> Media: " + welford.media.toFixed(4) + " | Varianza: " + welford.varianza.toFixed(4) + "\n\n";
            risultato += "Differenza varianza: " + Math.abs(naive.varianza - welford.varianza) + "\n";
            risultato += "\nRisultato: Entrambi gli algoritmi funzionano perfettamente con numeri piccoli.";
            
            displayOutput.textContent = risultato;
            displayOutput.style.color = "#00ff00"; // Verde
        });
    }

    if(btnDifficile) {
        btnDifficile.addEventListener('click', function() {
            displayOutput.textContent = "Calcolo in corso sui numeri difficili...\n";
            
            const datiDifficili = generaNumeri(numeroCampioni, 1e9, 10);
            const naive = calcolaNaive(datiDifficili);
            const welford = calcolaWelford(datiDifficili);
            
            let risultato = "--- TEST 2: 1 Miliardo + Variazione (0-10) ---\n\n";
            risultato += "NAIVE   -> Media: " + naive.media.toFixed(4) + " | Varianza: " + naive.varianza.toFixed(4) + "\n";
            risultato += "WELFORD -> Media: " + welford.media.toFixed(4) + " | Varianza: " + welford.varianza.toFixed(4) + "\n\n";
            risultato += "Differenza varianza: " + Math.abs(naive.varianza - welford.varianza) + "\n";
            
            if (naive.varianza < 0 || Math.abs(naive.varianza - welford.varianza) > 1) {
                risultato += "\n🚨 ATTENZIONE: L'algoritmo Naive ha fallito miseramente a causa della 'cancellazione catastrofica'.\nWelford ha mantenuto la precisione.";
                displayOutput.style.color = "#ff4d4d"; // Rosso
            } else {
                displayOutput.style.color = "#00ff00";
            }
            
            displayOutput.textContent = risultato;
        });
    }
});
