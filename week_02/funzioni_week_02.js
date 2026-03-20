document.addEventListener("DOMContentLoaded", function() {

    let ultimoArrayGenerato = []; 

    function generaNumeri(N, offset, scala) {
        const dati = [];
        for (let i = 0; i < N; i++) {
            dati.push(offset + (Math.random() * scala));
        }
        ultimoArrayGenerato = dati; 
        return dati;
    }

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

    const btnNormale = document.getElementById('btn-test-normale');
    const btnDifficile = document.getElementById('btn-test-difficile');
    const btnScaricaCSV = document.getElementById('btn-scarica-csv'); // Nuovo tasto
    const displayOutput = document.getElementById('output-algoritmi');
    const numeroCampioni = 100000;

    function eseguiTest(tipo) {
        let dati;
        if (tipo === 'normale') {
            dati = generaNumeri(numeroCampioni, 0, 100);
            displayOutput.style.color = "#00ff00";
        } else {
            dati = generaNumeri(numeroCampioni, 1e9, 10);
        }

        const naive = calcolaNaive(dati);
        const welford = calcolaWelford(dati);

        let risultato = `--- TEST: ${tipo.toUpperCase()} ---\n\n`;
        risultato += `NAIVE   -> Media: ${naive.media.toFixed(6)} | Var: ${naive.varianza.toFixed(6)}\n`;
        risultato += `WELFORD -> Media: ${welford.media.toFixed(6)} | Var: ${welford.varianza.toFixed(6)}\n\n`;
        risultato += `Differenza Assoluta: ${Math.abs(naive.varianza - welford.varianza).toExponential(4)}\n`;

        if (tipo === 'difficile' && (naive.varianza < 0 || Math.abs(naive.varianza - welford.varianza) > 0.1)) {
            risultato += "\n🚨 ERRORE RILEVATO: L'algoritmo Naive ha fallito.\nScarica il CSV per vedere l'entità dei numeri.";
            displayOutput.style.color = "#ff4d4d";
        }
        displayOutput.textContent = risultato;
    }

    if(btnNormale) btnNormale.addEventListener('click', () => eseguiTest('normale'));
    if(btnDifficile) btnDifficile.addEventListener('click', () => eseguiTest('difficile'));

    // Funzione per il download del CSV
    if(btnScaricaCSV) {
        btnScaricaCSV.addEventListener('click', function() {
            if (ultimoArrayGenerato.length === 0) {
                alert("Esegui prima un test per generare i dati!");
                return;
            }

            // Creazione contenuto CSV (una colonna con intestazione)
            let contenutoCSV = "Indice;Valore\n";
            for (let i = 0; i < ultimoArrayGenerato.length; i++) {
                // Usiamo il punto come decimale e il punto e virgola come separatore per Excel
                contenutoCSV += `${i};${ultimoArrayGenerato[i]}\n`;
            }

            // Creazione del file virtuale (Blob)
            const blob = new Blob([contenutoCSV], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            // Creazione link temporaneo per il download
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "dati_varianza.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
});
