document.addEventListener("DOMContentLoaded", function() {

    // ==========================================
    // ESERCIZIO 1: Naive vs Welford
    // ==========================================
    let ultimoArrayGenerato = []; 
    const numeroCampioniEsercizio1 = 100000; // Fisso per il test di stabilità

    const btnNormale = document.getElementById('btn-test-normale');
    const btnDifficile = document.getElementById('btn-test-difficile');
    const btnScaricaCSV = document.getElementById('btn-scarica-csv');
    const displayOutput = document.getElementById('output-algoritmi');

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
        let somma = 0, sommaQuadrati = 0;
        for (let x of array) {
            somma += x;
            sommaQuadrati += x * x;
        }
        const media = somma / n;
        const varianza = (sommaQuadrati - (somma * somma) / n) / (n - 1);
        return { media: media, varianza: varianza };
    }

    function calcolaWelford(array) {
        let n = 0, media = 0, M2 = 0;
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

    function eseguiTest(tipo) {
        if(!displayOutput) return;
        displayOutput.textContent = "Calcolo in corso...";
        
        const dati = (tipo === 'normale') 
            ? generaNumeri(numeroCampioniEsercizio1, 0, 100) 
            : generaNumeri(numeroCampioniEsercizio1, 1e9, 10);

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

    // Eventi Esercizio 1
    if(btnNormale) btnNormale.addEventListener('click', () => eseguiTest('normale'));
    if(btnDifficile) btnDifficile.addEventListener('click', () => eseguiTest('difficile'));
    
    if(btnScaricaCSV) {
        btnScaricaCSV.addEventListener('click', function() {
            if (ultimoArrayGenerato.length === 0) {
                alert("Per favore, esegui prima un test!");
                return;
            }
            let csvContent = "Indice;Valore\n";
            ultimoArrayGenerato.forEach((val, index) => { csvContent += `${index};${val}\n`; });
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "dati_varianza_2026.csv";
            link.click();
        });
    }

    // ==========================================
    // ESERCIZIO 2: Distribuzioni e Grafici
    // ==========================================
    let chartUniforme = null;
    let chartOutput = null;

    // Definiamo i generatori matematici
    const GeneratoriStocastici = {
        normale: () => {
            let u1 = Math.random(), u2 = Math.random();
            return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        },
        esponenziale: (lambda = 1) => -Math.log(1.0 - Math.random()) / lambda,
        cauchy: () => Math.tan(Math.PI * (Math.random() - 0.5)),
        pareto: (xm = 1, alpha = 3) => xm / Math.pow(Math.random(), 1.0 / alpha),
        triangolare: () => Math.random() + Math.random(),
        poisson: (lambda = 5) => {
            let L = Math.exp(-lambda), p = 1.0, k = 0;
            do { k++; p *= Math.random(); } while (p > L);
            return k - 1;
        },
        binomiale: (n = 20, p = 0.5) => {
            let k = 0;
            for(let i=0; i<n; i++) if(Math.random() < p) k++;
            return k;
        },
        chi_quadro: (k = 4) => {
            let sum = 0;
            for(let i=0; i<k; i++) {
                let u1 = Math.random(), u2 = Math.random();
                let z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
                sum += z * z;
            }
            return sum;
        }
    };

    // Funzione per creare i dati dell'istogramma
    function raggruppaInBin(dati, nBins = 40) {
        if (dati.length === 0) return { etichette: [], conteggi: [] };
        
        let sorted = [...dati].sort((a,b) => a - b);
        // Tagliamo gli outlier per una visualizzazione migliore
        let min = sorted[Math.floor(sorted.length * 0.01)];
        let max = sorted[Math.floor(sorted.length * 0.99)];
        
        if (min === max) { max = min + 1; min = min - 1; } // Evita divisione per zero

        let ampiezza = (max - min) / nBins;
        let conteggi = new Array(nBins).fill(0);
        let etichette = [];

        for(let i=0; i<nBins; i++) {
            etichette.push((min + i*ampiezza).toFixed(2));
        }

        for(let x of dati) {
            if(x >= min && x <= max) {
                let index = Math.floor((x - min) / ampiezza);
                if(index >= nBins) index = nBins - 1;
                conteggi[index]++;
            }
        }
        return { etichette, conteggi };
    }

    // Funzione helper per Chart.js
    function disegnaGrafico(canvasId, chartInstance, etichette, dati, titolo, colore) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        const ctx = canvas.getContext('2d');
        
        if (chartInstance) chartInstance.destroy();

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: etichette,
                datasets: [{ 
                    label: titolo, 
                    data: dati, 
                    backgroundColor: colore,
                    borderWidth: 0,
                    barPercentage: 1.0,
                    categoryPercentage: 1.0
                }]
            },
            options: { 
                responsive: true,
                maintainAspectRatio: false,
                scales: { 
                    x: { display: false }, 
                    y: { beginAtZero: true } 
                }, 
                animation: { duration: 400 } 
            }
        });
    }

    // Gestione del click per l'Esercizio 2
    const btnGeneraDist = document.getElementById('btn-genera-dist');
    const inputCampioni = document.getElementById('input-campioni');

    if (btnGeneraDist) {
        btnGeneraDist.addEventListener('click', () => {
            const select = document.getElementById('select-distribuzione');
            const tipoSelezionato = select.value;
            
            // Lettura dinamica di N
            let N = inputCampioni ? parseInt(inputCampioni.value) : 10000;
            if (isNaN(N) || N <= 0) N = 10000;
            if (N > 1000000) N = 1000000; // Limite sicurezza
            
            let datiUniformi = [];
            let datiTrasformati = [];

            // Generazione
            for(let i=0; i<N; i++) {
                datiUniformi.push(Math.random());
                datiTrasformati.push(GeneratoriStocastici[tipoSelezionato]());
            }

            // Binning
            const hU = raggruppaInBin(datiUniformi, 30);
            const hO = raggruppaInBin(datiTrasformati, 40);

            // Rendering Grafici
            chartUniforme = disegnaGrafico('chart-uniforme', chartUniforme, hU.etichette, hU.conteggi, `Input U(0,1) [N=${N}]`, 'rgba(41, 128, 185, 0.6)');
            
            const nomeDist = select.options[select.selectedIndex].text;
            document.getElementById('titolo-output').innerText = `Output: ${nomeDist}`;
            chartOutput = disegnaGrafico('chart-output', chartOutput, hO.etichette, hO.conteggi, `${nomeDist} [N=${N}]`, 'rgba(142, 68, 173, 0.6)');
        });
    }
});
