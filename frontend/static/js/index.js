const state = {
    current: 300,
    voltage: 4.0,
    temperature: 975,
    concentration: 4,
    eta: null,
    E_ud: null,
    anode_consumption: null,
    temperature_warning: null,
    voltage_warning: null
};

const App = {
    init() {
         this.loadFromLocalStorage();
         this.updateValues();

         this.setupUpdateTimeout();
         this.setupButtonListeners();
     },

    setupButtonListeners() {
        const clearBtn = document.getElementById('clear-data-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearData());
        }
    },

    clearData() {
        localStorage.removeItem('values_history');
        Charts.resetCharts();
    },

    loadFromLocalStorage() {
        const stored = localStorage.getItem('values_history');
        if (stored) {
            try {
                const history = JSON.parse(stored);
                if (history.length > 0) {
                    const latest = history[history.length - 1];
                    Object.assign(state, {
                        eta: latest.eta,
                        E_ud: latest.E_ud,
                        anode_consumption: latest.anode_consumption
                    });
                }
            } catch (e) {
                console.error('Failed to load from localStorage:', e);
            }
        }
    },

    saveToLocalStorage(eta, E_ud, anode_consumption) {
        try {
            const history = JSON.parse(localStorage.getItem('values_history') || '[]');
            history.push({
                eta,
                E_ud,
                anode_consumption,
            });
            localStorage.setItem('values_history', JSON.stringify(history));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    },

    setupUpdateTimeout() {
        let updateTimeout = null;

        window.addEventListener('stateChange', (e) => {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                this.updateValues();
            }, 1000);
        });
    },

    updateState(newState) {
        Object.assign(state, newState);
        const event = new CustomEvent('stateChange', { detail: state });
        this.updateSlidersDisplay();
        window.dispatchEvent(event);
    },

    updateValues() {
        fetch('/api/update-values', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                current: state.current,
                voltage: state.voltage,
                temperature: state.temperature,
                concentration: state.concentration
            })
        })
        .then(response => response.json())
        .then(data => {
             Object.assign(state, {
                 eta: data.eta,
                 E_ud: data.E_ud,
                 anode_consumption: data.anode_consumption,
                 temperature_warning: data.temperature_warning,
                 voltage_warning: data.voltage_warning
             });

             this.saveToLocalStorage(data.eta, data.E_ud, data.anode_consumption);
             Charts.updateCharts();
             Visualization.updateVisualization();
         });
    },

    updateSlidersDisplay() {
        document.querySelectorAll('[data-display="current"]').forEach(el => {
            el.textContent = state.current + ' A';
        });

        document.querySelectorAll('[data-display="voltage"]').forEach(el => {
            el.textContent = state.voltage + ' В';
        });

        document.querySelectorAll('[data-display="temperature"]').forEach(el => {
            el.textContent = state.temperature + ' °C';
        });

        document.querySelectorAll('[data-display="concentration"]').forEach(el => {
            el.textContent = state.concentration + ' %';
        });
    },
};

document.addEventListener('DOMContentLoaded', function() {
    App.init();
});
