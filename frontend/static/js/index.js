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
        
        const saveBtn = document.getElementById('save-data-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveExperiment());
        }

        const loadBtn = document.getElementById('load-experiment-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.loadExperiment());
        }

        this.fetchExperiments();
    },

    clearData() {
         localStorage.removeItem('values_history');
         Charts.resetCharts();
     },

    saveExperiment() {
        try {
            const history = JSON.parse(localStorage.getItem('values_history') || '[]');
            if (history.length === 0) {
                alert('Нет данных для сохранения');
                return;
            }

            fetch('/api/save-experiment', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(history)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Эксперимент сохранён успешно');
                    this.fetchExperiments();
                } else {
                    alert('Ошибка при сохранении: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error saving experiment:', error);
                alert('Ошибка при отправке данных');
            });
        } catch (e) {
            console.error('Failed to save experiment:', e);
            alert('Ошибка при обработке данных');
        }
     },

    fetchExperiments() {
        fetch('/api/experiments')
            .then(response => response.json())
            .then(data => {
                const select = document.getElementById('experiments-select');
                if (select && data.experiments) {
                    // Remove all options except the first (placeholder)
                    while (select.options.length > 1) {
                        select.remove(1);
                    }
                    
                    data.experiments.forEach(id => {
                        const option = document.createElement('option');
                        option.value = id;
                        option.textContent = 'Эксперимент #' + id;
                        select.appendChild(option);
                    });
                }
            })
            .catch(error => console.error('Error fetching experiments:', error));
     },

    loadExperiment() {
        try {
            const select = document.getElementById('experiments-select');
            if (!select || !select.value) {
                alert('Выберите эксперимент');
                return;
            }

            fetch('/api/experiment/' + select.value)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        alert('Ошибка: ' + data.error);
                        return;
                    }
                    localStorage.setItem('values_history', JSON.stringify(data.data));
                    this.loadFromLocalStorage();
                    Charts.loadFromLocalStorage();
                    
                    alert('Эксперимент загружен');
                })
                .catch(error => {
                    console.error('Error loading experiment:', error);
                    alert('Ошибка при загрузке');
                });
        } catch (e) {
            console.error('Failed to load experiment:', e);
            alert('Ошибка при обработке данных');
        }
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
