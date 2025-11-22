const Visualization = {
    regions: [
        { x_start: 32, y_start: 42, x_end: 62, y_end: 58, text: 'Аноды' },
        { x_start: 30, y_start: 77, x_end: 83, y_end: 83, text: 'Катод' },
        { x_start: 29, y_start: 65, x_end: 65, y_end: 70, text: 'Алюминий' },
        { x_start: 26, y_start: 55, x_end: 32, y_end: 57, text: 'Глинозём' },
        { x_start: 62, y_start: 55, x_end: 67, y_end: 57, text: 'Глинозём' },
        { x_start: 28, y_start: 58, x_end: 65, y_end: 65, text: 'Электролит' },
    ],
    
    aluminiumLine: { x_start: 30, y_start: 69, x_end: 63, y_end: 69 },
    oxygenLine: { x_start: 30, y_start: 69, x_end: 63, y_end: 69 },
    powerPoint: { x: 85, y: 50 },
    streamPoints: [{ x: 31, y: 53 }, { x: 63, y: 53 }],
    flashPoints: [{ x: 36, y: 61 }, { x: 47, y: 61 }, { x: 58, y: 61 }],
    freezeBox: { x_start: 28, y_start: 58, x_end: 65, y_end: 65 },
    activeTooltip: '',
    tooltipX: 0,
    tooltipY: 0,
    particles: [],
    oxygenParticles: [],
    streamParticles: [],
    particleImage: null,
    oxygenImage: null,
    voltageImage: null,
    flashImage: null,
    voltageImageAspectRatio: 1,
    lastFlashTime: 0,
    flashDuration: 500,
    animationRunning: false,
    canvas: null,
    ctx: null,
    svgElement: null,
    
    init() {
        fetch('/static/assets/schema.svg')
        .then(r => r.text())
        .then(svg => {
            document.getElementById('schemasvg').innerHTML = svg;
            this.svgElement = document.querySelector("#schemasvg svg");
            
            this.canvas = document.getElementById("effectsCanvas");
            this.ctx = this.canvas.getContext('2d');
            this.updateCanvasSize();

            this.particleImage = new Image();
            this.particleImage.src = '/static/assets/al.svg';
            this.particleImage.onload = () => {
                this.startParticles();
            };

            this.oxygenImage = new Image();
            this.oxygenImage.src = '/static/assets/o.svg';
            this.oxygenImage.onload = () => {
                this.startOxygenParticles();
                this.startStreamParticles();
            };

            this.voltageImage = new Image();
            this.voltageImage.src = '/static/assets/voltage.svg';
            this.voltageImage.onload = () => {
                this.voltageImageAspectRatio = this.voltageImage.naturalWidth / this.voltageImage.naturalHeight;
            };

            this.flashImage = new Image();
            this.flashImage.src = '/static/assets/flash.svg';

            this.setupEvents();
            
            const resizeObserver = new ResizeObserver(() => this.updateCanvasSize());
            resizeObserver.observe(this.svgElement);
        });
    },
    
    updateCanvasSize() {
        if (this.svgElement && this.canvas) {
            this.canvas.width = this.svgElement.clientWidth;
            this.canvas.height = this.svgElement.clientHeight;
        }
    },

    getCanvasScale() {
        return this.canvas.width / (this.canvas.offsetWidth || this.canvas.width);
    },
    
    setupEvents() {
        if (this.canvas) {
            this.canvas.addEventListener('mousemove', (e) => this.trackMouse(e));
            this.canvas.addEventListener('click', (e) => this.logCoords(e));
        }
    },
    
    trackMouse(e) {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xPercent = (x / this.canvas.width) * 100;
        const yPercent = (y / this.canvas.height) * 100;
        
        const region = this.regions.find(r =>
            xPercent >= r.x_start && xPercent <= r.x_end &&
            yPercent >= r.y_start && yPercent <= r.y_end
        );
        
        if (region) {
            this.activeTooltip = region.text;
            this.tooltipX = xPercent;
            this.tooltipY = yPercent - 5;
            this.showTooltip();
        } else {
            this.activeTooltip = '';
            this.hideTooltip();
        }
    },
    
    showTooltip() {
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.style.left = `${this.tooltipX}%`;
            tooltip.style.top = `${this.tooltipY}%`;
            document.getElementById('tooltipText').textContent = this.activeTooltip;
            tooltip.style.opacity = '1';
        }
    },
    
    hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
        }
    },
    
    logCoords(e) {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xPercent = ((x / this.canvas.width) * 100).toFixed(2);
        const yPercent = ((y / this.canvas.height) * 100).toFixed(2);
        
        console.log(`Mouse: ${xPercent}%, ${yPercent}%`);
    },
    
    startParticles() {
        if (!this.canvas || this.animationRunning) return;
        this.animationRunning = true;
        
        const scale = this.getCanvasScale();
        
        setInterval(() => {
            if (!this.canvas.width || !this.canvas.height) return;
            if (state?.temperature_warning || state?.voltage_warning) return;
            
            const xPercent = this.aluminiumLine.x_start + Math.random() * (this.aluminiumLine.x_end - this.aluminiumLine.x_start);
            const yPercent = this.aluminiumLine.y_start;
            
            const x = (xPercent / 100) * this.canvas.width;
            const y = (yPercent / 100) * this.canvas.height;
            
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 0.3 * scale,
                vy: (0.4 + Math.random() * 0.5) * scale
            });
        }, 1000);
        
        const animate = () => {
            if (!this.ctx) return;
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            if (!(state?.temperature_warning || state?.voltage_warning)) {
                this.particles = this.particles.filter(p => p.y < this.canvas.height - this.canvas.height * 0.2);
                this.oxygenParticles = this.oxygenParticles.filter(p => p.y > this.canvas.height * 0.55);
                this.streamParticles = this.streamParticles.filter(p => p.y > this.canvas.height * 0.4);
                
                this.particles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    
                    if (this.particleImage) {
                        const scaledSize = 32 * scale;
                        this.ctx.drawImage(this.particleImage, p.x - scaledSize/2, p.y - scaledSize/2, scaledSize, scaledSize);
                    }
                });

                this.oxygenParticles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    
                    if (this.oxygenImage) {
                        const scaledSize = 32 * scale;
                        this.ctx.drawImage(this.oxygenImage, p.x - scaledSize/2, p.y - scaledSize/2, scaledSize, scaledSize);
                    }
                });

                this.streamParticles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    
                    this.ctx.fillStyle = '#000000';
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                });
            }

            if (state?.voltage_warning && this.voltageImage) {
                const x = (this.powerPoint.x / 100) * this.canvas.width;
                const y = (this.powerPoint.y / 100) * this.canvas.height;
                const baseSize = 50 * scale;
                const width = baseSize * this.voltageImageAspectRatio;
                const height = baseSize;
                
                this.ctx.drawImage(this.voltageImage, x - width/2, y - height/2, width, height);
            }

            if (state?.temperature_warning && state.temperature_warning.includes('Эффект') && this.flashImage) {
                const currentTime = Date.now();
                const timeSinceFlash = currentTime - this.lastFlashTime;
                
                if (timeSinceFlash > this.flashDuration * 2) {
                    this.lastFlashTime = currentTime;
                }
                
                const opacity = (timeSinceFlash % (this.flashDuration * 2)) < this.flashDuration ? 1 : 0;
                if (opacity > 0) {
                    this.ctx.globalAlpha = opacity;
                    this.flashPoints.forEach(point => {
                        const x = (point.x / 100) * this.canvas.width;
                        const y = (point.y / 100) * this.canvas.height;
                        const flashSize = 20 * scale;
                        this.ctx.drawImage(this.flashImage, x - flashSize/2, y - flashSize/2, flashSize, flashSize);
                    });
                    this.ctx.globalAlpha = 1;
                }
            }

            if (state?.temperature_warning && state.temperature_warning.includes('Опасность')) {
                const x = (this.freezeBox.x_start / 100) * this.canvas.width;
                const y = (this.freezeBox.y_start / 100) * this.canvas.height;
                const width = ((this.freezeBox.x_end - this.freezeBox.x_start) / 100) * this.canvas.width;
                const height = ((this.freezeBox.y_end - this.freezeBox.y_start) / 100) * this.canvas.height;
                
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillRect(x, y, width, height);
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    },

    startOxygenParticles() {
        const scale = this.getCanvasScale();
        
        setInterval(() => {
            if (!this.canvas.width || !this.canvas.height) return;
            if (state?.error || state?.temperature_warning || state?.voltage_warning) return;
            
            const xPercent = this.oxygenLine.x_start + Math.random() * (this.oxygenLine.x_end - this.oxygenLine.x_start);
            const yPercent = this.oxygenLine.y_start;
            
            const x = (xPercent / 100) * this.canvas.width;
            const y = (yPercent / 100) * this.canvas.height;
            
            this.oxygenParticles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 0.3 * scale,
                vy: -(0.4 + Math.random() * 0.5) * scale
            });
        }, 1000);
    },

    startStreamParticles() {
        const scale = this.getCanvasScale();
        
        setInterval(() => {
            if (!this.canvas.width || !this.canvas.height) return;
            if (state?.error || state?.temperature_warning || state?.voltage_warning) return;
            
            this.streamPoints.forEach(point => {
                const x = (point.x / 100) * this.canvas.width;
                const y = (point.y / 100) * this.canvas.height;
                
                this.streamParticles.push({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 0.5 * scale,
                    vy: -(1.0 + Math.random() * 0.5) * scale
                });
            });
        }, 100);
    },

    updateVisualization() {
         const warningContainer = document.getElementById('warningContainer');
         warningContainer.innerHTML = '';
         
         const warnings = [];
         if (state?.temperature_warning) {
             warnings.push(state.temperature_warning);
         }
         if (state?.voltage_warning) {
             warnings.push(state.voltage_warning);
         }
         
         if (warnings.length > 0) {
             warnings.forEach(warning => {
                 const warningEl = document.createElement('div');
                 warningEl.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-2 rounded-lg';
                 warningEl.textContent = warning;
                 warningContainer.appendChild(warningEl);
             });
         }

         const schemaContainer = document.getElementById('schemaContainer');
         if (schemaContainer) {
             if (state?.temperature_warning || state?.voltage_warning) {
                 schemaContainer.classList.remove('shadow-green-300');
                 schemaContainer.classList.add('shadow-lg', 'shadow-red-300');
             } else {
                 schemaContainer.classList.remove('shadow-red-300');
                 schemaContainer.classList.add('shadow-lg', 'shadow-green-300');
             }
         }
     }
};

document.addEventListener('DOMContentLoaded', function() {
    Visualization.init();
});
