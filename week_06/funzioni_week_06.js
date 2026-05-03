document.addEventListener("DOMContentLoaded", function() {
    
    // Variabili per conservare le istanze dei grafici
    let priceChart = null;
    let pnlChart = null;
    let ddChart = null;

    // Riferimenti agli elementi della UI
    const btnGenera = document.getElementById('btn-genera');
    const inputS0 = document.getElementById('input-s0');
    const inputMu = document.getElementById('input-mu');
    const inputSigma = document.getElementById('input-sigma');
    const inputT = document.getElementById('input-t');
    const inputN = document.getElementById('input-n');
    const inputSma = document.getElementById('input-sma');
    
    const valPnl = document.getElementById('val-pnl');
    const valDd = document.getElementById('val-dd');

    // Funzione principale che genera le traiettorie e calcola la strategia
    function generaSimulazione(S0, mu, sigma, T, n, smaWindow) {
        const times = [0]; 
        const gbmValues = [S0];
        const smaValues = [S0];
        const pnlValues = [0];
        const ddValues = [0];

        let W_t = 0; 
        const dt = T / n;
        const sqrtDt = Math.sqrt(dt);

        let currentPnL = 0;
        let peakPnL = 0;
        let maxDD = 0;
        
        // Segnale iniziale (0 = flat, 1 = long, -1 = short)
        let currentSignal = 0; 

        for (let k = 1; k <= n; k++) {
            // Moto Browniano
            let X_k = Math.random() < 0.5 ? -1 : 1;
            let dW = X_k * sqrtDt;
            W_t += dW;
            let t_k = k * dt;

            // Calcolo GBM: S_t = S_0 * exp((mu - 0.5*sigma^2)*t + sigma*W_t)
            let driftTerm = (mu - 0.5 * Math.pow(sigma, 2)) * t_k;
            let diffusionTerm = sigma * W_t;
            let gbm_t = S0 * Math.exp(driftTerm + diffusionTerm);

            // Calcolo Media Mobile Semplice (SMA)
            let sum = 0;
            let count = 0;
            // Prendo i valori precedenti fino alla finestra stabilita
            let startIdx = Math.max(0, k - smaWindow);
            for (let i = startIdx; i < k; i++) {
                sum += gbmValues[i];
                count++;
            }
            sum += gbm_t; // includo il prezzo attuale
            count++;
            let sma_t = sum / count;

            // Calcolo PnL basato sul segnale del periodo PRECEDENTE
            // Profitto = Segnale * (Prezzo_attuale - Prezzo_precedente)
            let deltaS = gbm_t - gbmValues[k - 1];
            let dailyProfit = currentSignal * deltaS;
            currentPnL += dailyProfit;

            // Aggiornamento Peak e Drawdown
            if (currentPnL > peakPnL) {
                peakPnL = currentPnL;
            }
            let currentDD = currentPnL - peakPnL; // Valore sempre <= 0
            if (currentDD < maxDD) {
                maxDD = currentDD;
            }

            // Generazione del segnale per il PROSSIMO step
            // Strategia: Long (1) se Prezzo > SMA, Short (-1) se Prezzo < SMA
            currentSignal = gbm_t > sma_t ? 1 : -1;

            // Salvataggio dati per i grafici
            times.push(t_k.toFixed(3));
            gbmValues.push(gbm_t);
            smaValues.push(sma_t);
            pnlValues.push(currentPnL);
            ddValues.push(currentDD);
        }

        return { 
            labels: times, 
            price: gbmValues, 
            sma: smaValues, 
            pnl: pnlValues, 
            dd: ddValues,
            finalPnL: currentPnL,
            maxDD: maxDD
        };
    }

    // Funzione per disegnare il grafico dei prezzi (con 2 linee)
    function disegnaGraficoPrezzo(canvasId, chartInstance, labels, priceData, smaData) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return chartInstance;
        const ctx = canvas.getContext('2d');
        if (chartInstance) chartInstance.destroy();

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Prezzo GBM',
                        data: priceData,
                        borderColor: '#2c3e50',
                        borderWidth: 1.5,
                        pointRadius: 0, 
                        fill: false,
                        tension: 0
                    },
                    {
                        label: 'SMA',
                        data: smaData,
                        borderColor: '#f39c12',
                        borderWidth: 1.5,
                        pointRadius: 0, 
                        fill: false,
                        tension: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 400 },
                plugins: {
                    legend: { display: true },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: { ticks: { maxTicksLimit: 10 } }
                }
            }
        });
    }

    // Funzione per disegnare PnL o Drawdown (1 linea, area riempita)
    function disegnaAreaGrafico(canvasId, chartInstance, labels, data, chartLabel, colorHex) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return chartInstance;
        const ctx = canvas.getContext('2d');
        if (chartInstance) chartInstance.destroy();

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: chartLabel,
                    data: data,
                    borderColor: colorHex,
                    backgroundColor: colorHex + '30', // trasparenza
                    borderWidth: 1.5,
                    pointRadius: 0, 
                    fill: true,
                    tension: 0 
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 400 },
                plugins: {
                    legend: { display: true },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: { ticks: { maxTicksLimit: 10 } }
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
            let smaWindow = parseInt(inputSma.value);

            // Controlli base e default di sicurezza
            if (isNaN(S0)) S0 = 100;
            if (isNaN(mu)) mu = 0.05;
            if (isNaN(sigma) || sigma <= 0) sigma = 0.2;
            if (isNaN(T) || T <= 0) T = 1;
            if (isNaN(n) || n < 10) n = 1000;
            if (n > 50000) n = 50000;
            if (isNaN(smaWindow) || smaWindow < 1) smaWindow = 50;
            
            // Generazione dati
            const result = generaSimulazione(S0, mu, sigma, T, n, smaWindow);
            
            // Aggiornamento Dashboard Testuale
            valPnl.textContent = result.finalPnL.toFixed(2);
            valPnl.style.color = result.finalPnL >= 0 ? '#27ae60' : '#e74c3c';
            
            valDd.textContent = result.maxDD.toFixed(2);
            valDd.style.color = '#e74c3c';

            // Disegno grafici
            priceChart = disegnaGraficoPrezzo('chart-price', priceChart, result.labels, result.price, result.sma);
            pnlChart = disegnaAreaGrafico('chart-pnl', pnlChart, result.labels, result.pnl, 'PnL Cumulato', '#16a085');
            ddChart = disegnaAreaGrafico('chart-dd', ddChart, result.labels, result.dd, 'Drawdown', '#e74c3c');
        });

        // Autogenera all'avvio
        btnGenera.click();
    }
});
