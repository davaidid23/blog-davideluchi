document.addEventListener("DOMContentLoaded", function() {
    let chartInstance = null;

    function calculatePayoff(type, position, strike, premium, sRange) {
        return sRange.map(S => {
            let payoff = 0;
            if (type === 'call') {
                payoff = Math.max(0, S - strike);
            } else if (type === 'put') {
                payoff = Math.max(0, strike - S);
            } else {
                return 0;
            }
            return (payoff - premium) * position;
        });
    }

    function updateChart() {
        const sMin = 50;
        const sMax = 150;
        const steps = 100;
        const sRange = [];
        for (let i = 0; i <= steps; i++) {
            sRange.push(sMin + (sMax - sMin) * (i / steps));
        }

        // Dati Opzione A
        const typeA = document.getElementById('type-a').value;
        const posA = parseFloat(document.getElementById('pos-a').value);
        const strikeA = parseFloat(document.getElementById('strike-a').value);
        const premiumA = parseFloat(document.getElementById('premium-a').value);

        // Dati Opzione B
        const typeB = document.getElementById('type-b').value;
        const posB = parseFloat(document.getElementById('pos-b').value);
        const strikeB = parseFloat(document.getElementById('strike-b').value);
        const premiumB = parseFloat(document.getElementById('premium-b').value);

        const payoffA = calculatePayoff(typeA, posA, strikeA, premiumA, sRange);
        const payoffB = (typeB === 'none') ? new Array(sRange.length).fill(0) : calculatePayoff(typeB, posB, strikeB, premiumB, sRange);
        
        const combinedPayoff = payoffA.map((val, i) => val + payoffB[i]);

        const ctx = document.getElementById('payoffChart').getContext('2d');

        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sRange.map(s => s.toFixed(0)),
                datasets: [
                    {
                        label: 'Payoff Combinato',
                        data: combinedPayoff,
                        borderColor: '#2980b9',
                        backgroundColor: 'rgba(41, 128, 185, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        pointRadius: 0
                    },
                    {
                        label: 'Zero Line',
                        data: new Array(sRange.length).fill(0),
                        borderColor: '#333',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: { title: { display: true, text: 'Prezzo Sottostante (S)' } },
                    y: { title: { display: true, text: 'Profitto / Perdita' } }
                }
            }
        });
    }

    document.getElementById('btn-calc').addEventListener('click', updateChart);
    updateChart(); // Init
});
