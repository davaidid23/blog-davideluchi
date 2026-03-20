document.addEventListener("DOMContentLoaded", function() {

    let ultimoArrayGenerato = []; 
    const numeroCampioni = 100000;

    // Elementi DOM
    const btnNormale = document.getElementById('btn-test-normale');
    const btnDifficile = document.getElementById('btn-test-difficile');
    const btnScaricaCSV = document.getElementById('btn-scarica-csv');
    const displayOutput = document.getElementById('output-algoritmi');

    // 1. Funzione Generazione
    function generaNumeri(N, offset, scala) {
        const dati = [];
        for (let i = 0; i < N; i++) {
            dati.push(offset + (Math.random() * scala));
        }
        ultimoArrayGenerato = dati; 
        return dati;
    }

    // 2. Algoritmo Naive
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

    // 3. Algoritmo Welford
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

    // 4. Gestione Test
    function eseguiTest(tipo) {
        displayOutput.textContent = "Calcolo in corso...";
        
        const dati = (tipo === 'normale') 
            ? generaNumeri(numeroCampioni, 0, 100) 
            : generaNumeri(numeroCampioni, 1e9, 10);

        const naive = calcolaNaive(dati);
        const welford = calcolaWelford(dati);

        let risultato = `--- TEST: ${tipo.toUpperCase()} ---\n\n`;
        risultato += `NAIVE   -> Media: ${naive.media.toFixed(6)} | Var: ${naive.varianza.toFixed(6)}\n`;
        risultato += `WELFORD -> Media: ${welford.media.toFixed(6)} | Var: ${welford.varianza.toFixed(6)}\n\n`;
        risultato += `Differenza: ${Math.abs(naive.varianza - welford.varianza).toExponential(4)}\n`;

        if (tipo === 'difficile' && (naive.varianza < 0 || Math.abs(naive.varianza - welford.varianza) > 0.1)) {
            risultato += "\n🚨 NOTA: L'algoritmo Naive ha fallito (cancellazione catastrofica).";
            displayOutput.style.color = "#ff4d4d";
        } else {
            displayOutput.style.color = "#00ff00";
        }
        displayOutput.textContent = risultato;
    }

    // 5. LOGICA DOWNLOAD CSV (Controlla che questo pezzo ci sia!)
    if(btnScaricaCSV) {
        btnScaricaCSV.addEventListener('click', function() {
            if (ultimoArrayGenerato.length === 0) {
                alert("Per favore, esegui prima un test (Normale o Difficile)!");
                return;
            }

            // Prepariamo il contenuto del file
            let csvContent = "Indice;Valore\n";
            ultimoArrayGenerato.forEach((val, index) => {
                csvContent += `${index};${val}\n`;
            });

            // Creiamo il file (Blob)
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            // Creiamo un link invisibile e lo clicchiamo via codice
            const link = document.createElement("a");
            link.href = url;
            link.download = "dati_varianza_2026.csv";
            document.body.appendChild(link);
            link.click();
            
            // Pulizia
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    }

    // Event Listeners per i test
    if(btnNormale) btnNormale.addEventListener('click', () => eseguiTest('normale'));
    if(btnDifficile) btnDifficile.addEventListener('click', () => eseguiTest('difficile'));
});
