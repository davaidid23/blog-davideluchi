document.addEventListener("DOMContentLoaded", function() {
    
    // Variabile per conservare l'istanza del grafico (necessario per distruggerla prima di ridisegnare)
    let rwChart = null;

    // Riferimenti agli elementi della UI
    const btnGeneraWalk = document.getElementById('btn-genera-walk');
    const inputStart = document.getElementById('input-start');
    const inputSteps = document.getElementById('input-steps');
    
    // Funzione principale per generare la Random Walk
    function generaRandomWalk(startValue, numSteps) {
        let currentVal = startValue;
        const prices = [currentVal];
        const labels = [0]; // Asse dei tempi (step 0)

        for (let i = 1; i <= numSteps; i++) {
            // Genera il salto: se random < 0.5 è -1, altrimenti è +1
            let salto = Math.random() < 0.5 ? -1 : 1;
            
            currentVal += salto;
            prices.push(currentVal);
            labels.push(i);
        }

        return { labels, prices };
    }

    // Funzione per disegnare il grafico tramite Chart.js
    function disegnaGraficoWalk(labels, data) {
        const canvas = document.getElementById('chart-random-walk');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Se esiste già un grafico, distruggilo prima di disegnarne uno nuovo
        if (rwChart) {
            rwChart.destroy();
        }

        // Determina il colore della linea: verde se chiude in positivo, rosso se in negativo
        const isPositive = data[data.length - 1] >= data[0];
        const lineColor = isPositive ? 'rgba(39, 174, 96, 1)' : 'rgba(192, 57, 43, 1)';
        const fillColor = isPositive ? 'rgba(39, 174, 96, 0.1)' : 'rgba(192, 57, 43, 0.1)';

        rwChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Prezzo Simulata',
                    data: data,
                    borderColor: lineColor,
                    backgroundColor: fillColor,
                    borderWidth: 2,
                    pointRadius: 0, // Nascondi i pallini per fluidità
                    pointHoverRadius: 4,
                    fill: true,
                    tension: 0.1 // Leggera curva
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 500 },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Tempo (Step)' },
                        ticks: { maxTicksLimit: 10 }
                    },
                    y: {
                        title: { display: true, text: 'Valore $x_i$' }
                    }
                }
            }
        });
    }

    // Event listener per il bottone di generazione
    if (btnGeneraWalk) {
        btnGeneraWalk.addEventListener('click', () => {
            // Lettura valori in input
            let startVal = parseFloat(inputStart.value);
            let steps = parseInt(inputSteps.value);

            // Controlli di sicurezza base
            if (isNaN(startVal)) startVal = 1000;
            if (isNaN(steps) || steps < 1) steps = 500;
            if (steps > 50000) steps = 50000; // Limite browser
            
            // Genera e plotta
            const { labels, prices } = generaRandomWalk(startVal, steps);
            disegnaGraficoWalk(labels, prices);
        });

        // Genera automaticamente un grafico al caricamento della pagina
        btnGeneraWalk.click();
    }
});
