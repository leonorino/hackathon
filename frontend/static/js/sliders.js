const Sliders = {
    init() {
        this.setupSliderEventListeners();
    },

    setupSliderEventListeners() {
        const currentSlider = document.getElementById('current-slider');
        const voltageSlider = document.getElementById('voltage-slider');
        const temperatureSlider = document.getElementById('temperature-slider');
        const concentrationSlider = document.getElementById('concentration-slider');

        if (currentSlider) {
            currentSlider.addEventListener('input', (e) => {
                state.current = parseFloat(e.target.value);
                App.updateState(state);
            });
        }

        if (voltageSlider) {
            voltageSlider.addEventListener('input', (e) => {
                state.voltage = parseFloat(e.target.value);
                App.updateState(state);
            });
        }

        if (temperatureSlider) {
            temperatureSlider.addEventListener('input', (e) => {
                state.temperature = parseFloat(e.target.value);
                App.updateState(state);
            });
        }

        if (concentrationSlider) {
            concentrationSlider.addEventListener('input', (e) => {
                state.concentration = parseFloat(e.target.value);
                App.updateState(state);
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    Sliders.init();
});
