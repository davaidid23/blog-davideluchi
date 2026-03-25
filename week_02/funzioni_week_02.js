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
                alert("Per favore, esegui prima un test (Normale o Difficile)!");
                return;
            }
            let csvContent = "Indice;Valore\n";
            ultimoArrayGenerato.forEach((val, index) => {
                csvContent += `${index};${val}\n`;
            });
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "dati_varianza_2026.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    }

    if(btnNormale) btnNormale.addEventListener('click', () => eseguiTest('normale'));
    if(btnDifficile) btnDifficile.addEventListener('click', () => eseguiTest('difficile'));


    // ==========================================
    // ESERCIZIO 2: Generazione e Visualizzazione
    // ==========================================

    let chartUniforme = null;
    let chartOutput = null;

    // Oggetto che contiene tutti gli algoritmi matematici
    const GeneratoriStocastici = {
        // Genera la normale standard Z ~ N(0,1) con Box-Muller
        normale: function() {
            let u1 = Math.random();
            let u2 = Math.random();
            return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        },
        // Inversa della CDF Esponenziale: x = -ln(U)/lambda
        esponenziale: function(lambda = 1) {
            return -Math.log(1.0 - Math.random()) / lambda;
        },
        // Inversa della CDF Cauchy: x = tan(pi * (U - 0.5))
        cauchy: function() {
            return Math.tan(Math.PI * (Math.random() - 0.5));
        },
        // Inversa CDF Pareto: x = xm / U^(1/alpha)
        pareto: function(xm = 1, alpha = 3) {
            return xm / Math.pow(Math.random(), 1.0 / alpha);
        },
        // Composizione: Somma di due uniformi
        triangolare: function() {
            return Math.random() + Math.random();
        },
        // Algoritmo di Knuth per Poisson (Discreta)
        poisson: function(lambda = 5) {
            let L = Math.exp(-lambda);
            let p = 1.0;
            let k = 0;
            do {
                k++;
                p *= Math.random();
            } while (p > L);
            return k - 1;
        },
        // Composizione (Somma di N Bernoulli)
        binomiale: function(n = 20, p = 0.5) {
            let k = 0;
            for(let i=0; i<n; i++) {
                if(Math.random() < p) k++;
            }
            return k;
        },
        // Somma dei quadrati di K Normali Standard
        chi_quadro: function(k = 4) {
            let sum = 0;
            for(let i=0; i<k; i++) {
                let z = GeneratoriStocastici.normale();
                sum += z * z;
            }
            return sum;
        }
    };

    // Funzione utility per convertire i dati in bins (istogramma)
    function raggruppaInBin(dati, nBins = 40) {
        // Tagliamo i percentili estremi (1% e 99%) per non distorcere il grafico
        // specialmente utile per distribuzioni a coda lunga (Cauchy, Pareto)
        let sorted = [...dati].sort((a,b) => a - b);
        let min = sorted[Math.floor(sorted.length * 0.01)];
        let max = sorted[Math.floor(sorted.length * 0.99)];
        
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

    // Funzione che disegna il grafico con Chart.js
    function disegnaGrafico(canvasId, chartInstance, etichette, dati, titolo, colore) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        if (chartInstance) {
            chartInstance.destroy();
        }

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: etichette,
                datasets: [{
                    label: titolo,
                    data: dati,
                    backgroundColor: colore,
                    borderColor: colore.replace('0.6', '1'),
                    borderWidth: 1,
                    barPercentage: 1.0,
                    categoryPercentage: 1.0
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { display: false }, // Nascondo le etichette per pulizia visiva
                    y: { beginAtZero: true }
                },
                animation: { duration: 500 }
            }
        });
    }

    // Gestione del click su "Genera e Grafica"
    const btnGeneraDist = document.getElementById('btn-genera-dist');
    if (btnGeneraDist) {
        btnGeneraDist.addEventListener('click', () => {
            const select = document.getElementById('select-distribuzione');
            const tipoSelezionato = select.value;
            const N = 10000;
            
            let datiUniformi = [];
            let datiTrasformati = [];

            // Generiamo i campioni
            for(let i=0; i<N; i++) {
                datiUniformi.push(Math.random());
                datiTrasformati.push(GeneratoriStocastici[tipoSelezionato]());
            }

            // Elaborazione istogrammi
            const histUniforme = raggruppaInBin(datiUniformi, 30);
            const histOutput = raggruppaInBin(datiTrasformati, 40);

            // Disegno i due grafici
            chartUniforme = disegnaGrafico('chart-uniforme', chartUniforme, histUniforme.etichette, histUniforme.conteggi, 'Frequenza Uniforme', 'rgba(41, 128, 185, 0.6)');
            
            // Impostiamo il titolo dinamicamente
            document.getElementById('titolo-output').innerText = `Output: ${select.options[select.selectedIndex].text}`;
            chartOutput = disegnaGrafico('chart-output', chartOutput, histOutput.etichette, histOutput.conteggi, 'Frequenza Output', 'rgba(142, 68, 173, 0.6)');
        });
    }
});
