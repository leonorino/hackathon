const Charts = {
    etaChart: null,
    eudChart: null,
    anodeChart: null,

    init() {
         this.initializeCharts();
         this.loadFromLocalStorage();
     },

    loadFromLocalStorage() {
        try {
            const history = JSON.parse(localStorage.getItem('values_history') || '[]');
            if (history.length > 0) {
                const etas = history.map(h => h.eta);
                const euds = history.map(h => h.E_ud);
                const anodes = history.map(h => h.anode_consumption);

                this.etaChart.data.labels = etas.map((_, i) => `${i + 1}`);
                this.etaChart.data.datasets[0].data = etas;

                this.eudChart.data.labels = euds.map((_, i) => `${i + 1}`);
                this.eudChart.data.datasets[0].data = euds;

                this.anodeChart.data.labels = anodes.map((_, i) => `${i + 1}`);
                this.anodeChart.data.datasets[0].data = anodes;

                this.etaChart.update();
                this.eudChart.update();
                this.anodeChart.update();
            }
        } catch (e) {
            console.error('Failed to load charts from localStorage:', e);
        }
    },

    resetCharts() {
        this.etaChart.data.labels = ['Текущее'];
        this.etaChart.data.datasets[0].data = [state.eta];
        this.etaChart.update();

        this.eudChart.data.labels = ['Текущее'];
        this.eudChart.data.datasets[0].data = [state.E_ud];
        this.eudChart.update();

        this.anodeChart.data.labels = ['Текущее'];
        this.anodeChart.data.datasets[0].data = [state.anode_consumption];
        this.anodeChart.update();
    },

    initializeCharts() {
        const etaCtx = document.getElementById('etaChart').getContext('2d');
        const eudCtx = document.getElementById('eudChart').getContext('2d');
        const anodeCtx = document.getElementById('anodeChart').getContext('2d');

        this.etaChart = new Chart(etaCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Выход по току',
                    data: [],
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 0,
                        max: 100
                    }
                }
            }
        });

        this.eudChart = new Chart(eudCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Уд. расход энергии',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 10000
                    }
                }
            }
        });

        this.anodeChart = new Chart(anodeCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Расход анодного материала',
                    data: [],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 300
                    }
                }
            }
        });

        this.updateCharts();
    },

    updateCharts() {
        if (state.eta !== null && this.etaChart) {
            const etaPercentage = state.eta;
            document.getElementById('eta-chart-title').innerHTML = `Выход по току: <span style="color: #4f46e5;">${etaPercentage}%</span>`;

            this.etaChart.data.datasets[0].data.push(etaPercentage);
            this.etaChart.data.labels.push(`${this.etaChart.data.labels.length + 1}`);
            this.etaChart.update();
        }

        if (state.E_ud !== null && this.eudChart) {
            document.getElementById('eud-chart-title').innerHTML = `Удельный расход энергии: <span style="color: #10b981;">${state.E_ud}</span> кВт·ч/т Al`;
            this.eudChart.data.datasets[0].data.push(state.E_ud);
            this.eudChart.data.labels.push(`${this.eudChart.data.labels.length + 1}`);
            this.eudChart.update();
        }

        if (state.anode_consumption !== null && this.anodeChart) {
            document.getElementById('anode-chart-title').innerHTML = `Расход анодного материала: <span style="color: #f59e0b;">${state.anode_consumption}</span> кг/т Al`;
            this.anodeChart.data.datasets[0].data.push(state.anode_consumption);
            this.anodeChart.data.labels.push(`${this.anodeChart.data.labels.length + 1}`);
            this.anodeChart.update();
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    Charts.init();
});
