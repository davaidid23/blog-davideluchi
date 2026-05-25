document.addEventListener("DOMContentLoaded", function() {
    let chartInstance = null;
    const container = document.getElementById('options-container');
    const btnAdd = document.getElementById('btn-add');
    const btnCalc = document.getElementById('btn-calc');

    // Funzione per creare una nuova card opzione nell'interfaccia
    function addOptionCard(type = 'call', position = '1', strike = 100, premium = 5, quantity = 1) {
        const cardId = 'card_' + Date.now() + Math.random().toString(36).substr(2, 5);
        
        const card = document.createElement('div');
        card.className = 'option-card';
        card.id = cardId;
        
        card.innerHTML = `
            <div class="card-header">
                <h5>Opzione</h5>
                <button type="button" class="remove-btn" title="Rimuovi questa opzione">&times;</button>
            </div>
            <div class="input-group">
                <label>Tipo</label>
                <select class="opt-type">
                    <option value="call" ${type === 'call' ? 'selected' : ''}>Call</option>
                    <option value="put" ${type === 'put' ? 'selected' : ''}>Put</option>
                </select>
            </div>
            <div class="input-group">
                <label>Posizione</label>
                <select class="opt-pos">
                    <option value="1" ${position === '1' ? 'selected' : ''}>Long (Acquisto)</option>
                    <option value="-1" ${position === '-1' ? 'selected' : ''}>Short (Vendita)</option>
                </select>
            </div>
            <div class="input-group">
                <label>Strike ($K$)</label>
                <input type="number" class="opt-strike" value="${strike}" min="1">
            </div>
            <div class="input-group">
                <label>Premio ($P$)</label>
                <input type="number" class="opt-premium" value="${premium}" min="0" step="0.5">
            </div>
            <div class="input-group">
                <label>Quantità ($Q$)</label>
                <input type="number" class="opt-qty" value="${quantity}" min="1">
            </div>
        `;
        
        // Evento di rimozione della singola opzione
        card.querySelector('.remove-btn').addEventListener('click', function() {
            card.remove();
            updateChart();
        });

        container.appendChild(card);
    }

    // Calcola il payoff per un singolo elemento su tutto il range del sottostante S
    function calculateSinglePayoff(type, position, strike, premium, qty, sRange) {
        return sRange.map(S => {
            let intrinsicValue = 0;
            if (type === 'call') {
                intrinsicValue = Math.max(0, S - strike);
            } else if (type === 'put') {
                intrinsicValue = Math.max(0, strike - S);
            }
            // Formula Generale: Q * Posizione * (Valore Intrinseco - Premio)
            return qty * position * (intrinsicValue - premium);
        });
    }

    // Funzione principale di aggiornamento e generazione del grafico
    function updateChart() {
        const cards = container.querySelectorAll('.option-card');
        
        // Se non ci sono opzioni, ripulisci il grafico se esiste
        if (cards.length === 0) {
            if (chartInstance) chartInstance.destroy();
            chartInstance = null;
            return;
        }

        // Raccogli i dati di input delle opzioni inserite
        const optionsData = [];
        let allStrikes = [];

        cards.forEach(card => {
            const type = card.querySelector('.opt-type').value;
            const position = parseFloat(card.querySelector('.opt-pos').value);
            const strike = parseFloat(card.querySelector('.opt-strike').value) || 0;
            const premium = parseFloat(card.querySelector('.opt-premium').value) || 0;
            const qty = parseFloat(card.querySelector('.opt-qty').value) || 0;

            optionsData.push({ type, position, strike, premium, qty });
            allStrikes.push(strike);
        });

        // Adatta dinamicamente l'asse X del grafico in base agli strike inseriti
        const minStrike = Math.min(...allStrikes);
        const maxStrike = Math.max(...allStrikes);
        
        const sMin = Math.max(0, minStrike - 50);
        const sMax = maxStrike + 50;
        const steps = 150;
        const sRange = [];
        
        for (let i = 0; i <= steps; i++) {
            sRange.push(sMin + (sMax - sMin) * (i / steps));
        }

        // Inizializza l'array del payoff combinato con degli zeri
        const globalPayoff = new Array(sRange.length).fill(0);

        // Somma i contributi di tutte le opzioni (Linearità del Portafoglio)
        optionsData.forEach(opt => {
            const singlePayoff = calculateSinglePayoff(opt.type, opt.position, opt.strike, opt.premium, opt.qty, sRange);
            for (let i = 0; i < sRange.length; i++) {
                globalPayoff[i] += singlePayoff[i];
            }
        });

        // Rendering grafico con Chart.js
        const ctx = document.getElementById('payoffChart').getContext('2d');
        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sRange.map(s => s.toFixed(1)),
                datasets: [
                    {
                        label: 'Payoff Globale di Portafoglio',
                        data: globalPayoff,
                        borderColor: '#2e4053',
                        backgroundColor: 'rgba(46, 64, 83, 0.08)',
                        borderWidth: 3.5,
                        fill: true,
                        pointRadius: 0,
                        tension: 0.05
                    },
                    {
                        label: 'Linea di Break-Even (Zero)',
                        data: new Array(sRange.length).fill(0),
                        borderColor: '#e74c3c',
                        borderWidth: 1.2,
                        borderDash: [6, 4],
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
                    x: { 
                        title: { display: true, text: 'Prezzo Sottostante a Scadenza (S_T)' },
                        grid: { color: '#eaeded' }
                    },
                    y: { 
                        title: { display: true, text: 'Profitto / Perdita Netto ($)' },
                        grid: { color: '#eaeded' }
                    }
                }
            }
        });
    }

    // Eventi di controllo
    btnAdd.addEventListener('click', () => {
        // Aggiunge una Call standard di default all'attivazione
        addOptionCard('call', '1', 100, 5, 1);
    });
    
    btnCalc.addEventListener('click', updateChart);

    // Inizializzazione: Crea una strategia di esempio (Bull Call Spread)
    addOptionCard('call', '1', 100, 6, 1);  // Long Call 100
    addOptionCard('call', '-1', 110, 2, 1); // Short Call 110
    
    updateChart(); // Rendering iniziale
});
