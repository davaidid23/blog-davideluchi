document.addEventListener("DOMContentLoaded", function() {
    
    // Variabili per conservare le istanze dei grafici
    let abmChart = null;
    let gbmChart = null;

    // Riferimenti agli elementi della UI
    const btnGenera = document.getElementById('btn-genera');
    const inputS0 = document.getElementById('input-s0');
    const inputMu = document.getElementById('input-mu');
    const inputSigma = document.getElementById('input-sigma');
    const inputT = document.getElementById('input-t');
    const inputN = document.getElementById('input-n');
    
    // Funzione principale che genera le traiettorie
    function generaTraiettorie(S0, mu, sigma, T, n) {
        const times = [0]; 
        const abmValues = [S0]; // ABM parte da S0
        const gbmValues = [S0]; // GBM parte da S0

        let W_t = 0; // Moto Browniano standard accumulato
        const dt = T / n;
        const sqrtDt = Math.sqrt(dt);

        for (let k = 1; k <= n; k++) {
            // Generiamo l'incremento del Moto Browniano con Rademacher
            // dW = Rademacher * sqrt(dt)
            let X_k = Math.random() < 0.5 ? -1 : 1;
            let dW = X_k * sqrtDt;
            
            // Accumuliamo per avere W(t)
            W_t += dW;
            
            let t_k = k * dt;

            // Calcolo ABM: X_t = X_0 + mu*t + sigma*W_t
            let abm_t = S0 + (mu * t_k) + (sigma * W_t);

            // Calcolo GBM: S_t = S_0 * exp((mu - 0.5*sigma^2)*t + sigma*W_t)
            let driftTerm = (mu - 0.5 * Math.pow(sigma, 2)) * t_k;
            let diffusionTerm = sigma * W_t;
            let gbm_t = S0 * Math.exp(driftTerm + diffusionTerm);

            times.push(t_k.toFixed(3));
            abmValues.push(abm_t);
            gbmValues.push(gbm_t);
        }

        return { labels: times, abm: abmValues, gbm: gbmValues };
    }

    // Funzione generica per disegnare un grafico
    function disegnaGrafico(canvasId, chartInstance, labels, data, chartLabel, colorHex) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return chartInstance;
        
        const ctx = canvas.getContext('2d');
        
        if (chartInstance) {
            chartInstance.destroy();
        }

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: chartLabel,
                    data: data,
                    borderColor: colorHex,
                    backgroundColor: colorHex + '20', // Aggiunge trasparenza (hex opacity)
                    borderWidth: 1.5,
                    pointRadius: 0, 
                    pointHoverRadius: 4,
                    fill: true,
                    tension: 0 
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 400 },
                plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Tempo (t)' },
                        ticks: { maxTicksLimit: 10 }
                    },
                    y: {
                        title: { display: true, text: 'Valore Processo' }
                    }
                }
            }
        });
    }

    // Event listener per il bottone
    if (btnGenera) {
        btnGenera.addEventListener('click', () => {
            // Lettura valori input
            let S0 = parseFloat(inputS0.value);
            let mu = parseFloat(inputMu.value);
            let sigma = parseFloat(inputSigma.value);
            let T = parseFloat(inputT.value);
            let n = parseInt(inputN.value);

            // Controlli base e default di sicurezza
            if (isNaN(S0)) S0 = 100;
            if (isNaN(mu)) mu = 0.05;
            if (isNaN(sigma) || sigma <= 0) sigma = 0.2;
            if (isNaN(T) || T <= 0) T = 1;
            if (isNaN(n) || n < 10) n = 1000;
            if (n > 50000) n = 50000; // Limite di performance
            
            // Generazione dati
            const { labels, abm, gbm } = generaTraiettorie(S0, mu, sigma, T, n);
            
            // Disegno grafici
            // ABM: Tonalità Arancione
            abmChart = disegnaGrafico('chart-abm', abmChart, labels, abm, 'ABM', '#d35400');
            // GBM: Tonalità Blu (per abbinarsi al tema)
            gbmChart = disegnaGrafico('chart-gbm', gbmChart, labels, gbm, 'GBM', '#2980b9');
        });

        // Autogenera all'avvio
        btnGenera.click();
    }
});
