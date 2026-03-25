document.addEventListener("DOMContentLoaded", function() {

    // ==========================================
    // ESERCIZIO 1: Naive vs Welford
    // ==========================================
    let ultimoArrayGenerato = []; 
    const numeroCampioni = 100000;

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
            link.download = "dati_varianza.csv";
            link.click();
        });
    }

    if(btnNormale) btnNormale.addEventListener('click', () => eseguiTest('normale'));
    if(btnDifficile) btnDifficile.addEventListener('click', () => eseguiTest('difficile'));

    // ==========================================
    // ESERCIZIO 2: Grafici
    // ==========================================
    let chartUniforme = null;
    let chartOutput = null;

    const GeneratoriStocastici = {
        normale: () => {
            let u1 = Math.random(), u2 = Math.random();
            return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        },
        esponenziale: () => -Math.log(1.0 - Math.random()),
        cauchy: () => Math.tan(Math.PI * (Math.random() - 0.5)),
        pareto: () => 1.0 / Math.pow(Math.random(), 1.0 / 3.0),
        triangolare: () => Math.random() + Math.random(),
        poisson: () => {
            let L = Math.exp(-5), p = 1.0, k = 0;
            do { k++; p *= Math.random(); } while (p > L);
            return k - 1;
        },
        binomiale: () => {
            let k = 0;
            for(let i=0; i<20; i++) if(Math.random() < 0.5) k++;
            return k;
        },
        chi_quadro: () => {
            let sum = 0;
            for(let i=0; i<4; i++) {
                let z = Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
                sum += z * z;
            }
            return sum;
        }
    };

    function raggruppaInBin(dati, nBins = 40) {
        let sorted = [...dati].sort((a,b) => a - b);
        let min = sorted[Math.floor(sorted.length * 0.01)];
        let max = sorted[Math.floor(sorted.length * 0.99)];
        let ampiezza = (max - min) / nBins;
        let conteggi = new Array(nBins).fill(0);
        let etichette = [];
        for(let i=0; i<nBins; i++) etichette.push((min + i*ampiezza).toFixed(2));
        for(let x of dati) {
            if(x >= min && x <= max) {
                let index = Math.floor((x - min) / ampiezza);
                if(index >= nBins) index = nBins - 1;
                conteggi[index]++;
            }
        }
        return { etichette, conteggi };
    }

    function disegnaGrafico(canvasId, chartInstance, etichette, dati, titolo, colore) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        if (chartInstance) chartInstance.destroy();
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: etichette,
                datasets: [{ label: titolo, data: dati, backgroundColor: colore }]
            },
            options: { scales: { x: { display: false }, y: { beginAtZero: true } }, animation: false }
        });
    }

    const btnGeneraDist = document.getElementById('btn-genera-dist');
    if (btnGeneraDist) {
        btnGeneraDist.addEventListener('click', () => {
            const tipo = document.getElementById('select-distribuzione').value;
            let dU = [], dO = [];
            for(let i=0; i<10000; i++) {
                dU.push(Math.random());
                dO.push(GeneratoriStocastici[tipo]());
            }
            const hU = raggruppaInBin(dU, 30);
            const hO = raggruppaInBin(dO, 40);
            chartUniforme = disegnaGrafico('chart-uniforme', chartUniforme, hU.etichette, hU.conteggi, 'U(0,1)', 'rgba(41, 128, 185, 0.6)');
            chartOutput = disegnaGrafico('chart-output', chartOutput, hO.etichette, hO.conteggi, tipo, 'rgba(142, 68, 173, 0.6)');
        });
    }
});
