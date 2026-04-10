document.addEventListener("DOMContentLoaded", function() {
    
    // Variabile per conservare l'istanza del grafico
    let abmChart = null;

    // Riferimenti agli elementi della UI
    const btnGenera = document.getElementById('btn-genera-abm');
    const inputT = document.getElementById('input-t');
    const inputN = document.getElementById('input-n');
    
    // Funzione per generare la Random Walk scalata (convergenza ad ABM)
    function generaMotoBrowniano(T, n) {
        let currentSum = 0;
        const times = [0]; // Asse temporale (t = 0)
        const values = [0]; // Valore iniziale (W(0) = 0)

        // Fattore di scalatura: 1 / sqrt(n)
        const scaleFactor = 1 / Math.sqrt(n);
        // Passo temporale: T / n
        const dt = T / n;

        for (let k = 1; k <= n; k++) {
            // Variabile di Rademacher: -1 o +1 con p=0.5
            let X_k = Math.random() < 0.5 ? -1 : 1;
            
            // Somma cumulativa delle variabili
            currentSum += X_k;
            
            // Valore riscalato W_n(t_k)
            let W_k = currentSum * scaleFactor;
            
            // Tempo corrente t_k
            let t_k = k * dt;

            times.push(t_k.toFixed(4)); // Arrotondamento per pulizia label
            values.push(W_k);
        }

        return { labels: times, data: values };
    }

    // Funzione per disegnare il grafico tramite Chart.js
    function disegnaGraficoABM(labels, data) {
        const canvas = document.getElementById('chart-abm');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (abmChart) {
            abmChart.destroy();
        }

        // Determina il colore a seconda della chiusura (positivo/negativo rispetto allo 0)
        const isPositive = data[data.length - 1] >= 0;
        const lineColor = isPositive ? 'rgba(142, 68, 173, 1)' : 'rgba(230, 126, 34, 1)'; // Viola o Arancione
        const fillColor = isPositive ? 'rgba(142, 68, 173, 0.1)' : 'rgba(230, 126, 34, 0.1)';

        abmChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'W_n(t)',
                    data: data,
                    borderColor: lineColor,
                    backgroundColor: fillColor,
                    borderWidth: 1.5,
                    pointRadius: 0, // Nessun pallino, evidenzia la traiettoria
                    pointHoverRadius: 3,
                    fill: true,
                    tension: 0 // Tension 0 garantisce la visualizzazione della "spezzata" senza smoothing artificiale
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 300 },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Tempo (t)' },
                        ticks: { maxTicksLimit: 10 }
                    },
                    y: {
                        title: { display: true, text: 'Valore Scalato' }
                    }
                }
            }
        });
    }

    // Event listener per il bottone
    if (btnGenera) {
        btnGenera.addEventListener('click', () => {
            let T = parseFloat(inputT.value);
            let n = parseInt(inputN.value);

            // Controlli base
            if (isNaN(T) || T <= 0) T = 1;
            if (isNaN(n) || n < 10) n = 1000;
            if (n > 100000) n = 100000; // Limite di sicurezza per il browser
            
            const { labels, data } = generaMotoBrowniano(T, n);
            disegnaGraficoABM(labels, data);
        });

        // Autogenera all'avvio
        btnGenera.click();
    }
});
