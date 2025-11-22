const State = {
  selectedElements: [],
  currentAlloy: null,
  notFound: false,
  loading: true,
  searchQuery: '',
  alloys: [],
  allElements: ['Mg', 'Mn', 'Cu', 'Si', 'Fe', 'Zn', 'Li', 'C'],

  getFormulaInput() {
    return this.selectedElements.length === 0 
      ? 'Al' 
      : `Al-${this.selectedElements.join('-')}`;
  },

  getAvailableElements() {
    return this.allElements.filter(el => !this.selectedElements.includes(el));
  }
};

const Api = {
  async loadAlloys() {
    try {
      const res = await fetch('/api/alloys');
      State.alloys = await res.json();
      State.currentAlloy = State.alloys.find(a => a.id === 'Al') || null;
    } catch (e) {
      console.error('Ошибка загрузки сплавов:', e);
      State.currentAlloy = { 
        name: 'Технический алюминий', 
        id: 'Al',
        density_gcm3: 2.70,
        tensile_strength_MPa: 90,
        conductivity_ww: 58,
        elongation_pct: 35,
        Al: 99.0,
        notes: 'Стандартный технический алюминий (марка АД0). Высокая коррозионная стойкость, хорошая свариваемость.'
      };
    } finally {
      State.loading = false;
    }
  }
};

const Actions = {
  addElement(element) {
    if (!State.selectedElements.includes(element) && State.selectedElements.length < 7) {
      State.selectedElements.push(element);
      State.selectedElements.sort();
      UI.render();
    }
  },

  addNextElement() {
    const next = State.getAvailableElements()[0];
    if (next) this.addElement(next);
  },

  removeLast() {
    if (State.selectedElements.length > 0) {
      State.selectedElements.pop();
      this.search();
    }
  },

  search() {
    State.notFound = false;
    State.searchQuery = State.selectedElements.length === 0 
      ? 'Al' 
      : 'Al-' + State.selectedElements.join('-');
    
    const found = State.alloys.find(a => a.id === State.searchQuery);
    State.currentAlloy = found || null;
    State.notFound = !found;
    UI.render();
  }
};

const UI = {
  render() {
    this.updateFormula();
    this.updateButtons();
    this.updateDisplay();
  },

  updateFormula() {
    document.getElementById('formulaInput').value = State.getFormulaInput();
  },

  updateButtons() {
    document.querySelectorAll('.element-btn').forEach(btn => {
      const element = btn.dataset.element;
      const isSelected = State.selectedElements.includes(element);
      btn.disabled = isSelected;
      btn.classList.toggle('bg-blue-200', isSelected);
      btn.classList.toggle('border-blue-400', isSelected);
    });

    document.getElementById('clearBtn').disabled = State.selectedElements.length === 0;
  },

  updateDisplay() {
    const loadingEl = document.getElementById('loadingState');
    const resultEl = document.getElementById('resultState');
    const notFoundEl = document.getElementById('notFoundState');
    const defaultEl = document.getElementById('defaultState');

    loadingEl.style.display = 'none';
    resultEl.style.display = 'none';
    notFoundEl.style.display = 'none';
    defaultEl.style.display = 'none';

    if (State.loading) {
      loadingEl.style.display = 'block';
    } else if (State.notFound) {
      notFoundEl.style.display = 'block';
      document.getElementById('searchQuery').textContent = State.searchQuery;
    } else if (State.currentAlloy) {
      resultEl.style.display = 'block';
      this.renderAlloyDetails();
    } else {
      defaultEl.style.display = 'block';
    }
  },

  renderAlloyDetails() {
    document.getElementById('alloyName').textContent = State.currentAlloy.name;
    document.getElementById('alloyId').textContent = State.currentAlloy.id;
    document.getElementById('alloyNotes').textContent = State.currentAlloy.notes || '';

    const compositionEl = document.getElementById('alloyComposition');
    compositionEl.innerHTML = '';
    const elements = ['Al', 'Mg', 'Si', 'Cu', 'Fe', 'Mn', 'Zn', 'Li', 'C'];
    elements.forEach(key => {
      const val = State.currentAlloy[key];
      if (val > 0) {
        const span = document.createElement('span');
        span.className = 'px-1.5 py-0.5 bg-white text-xs border rounded';
        span.textContent = `${key}: ${Number(val).toFixed(1)}%`;
        compositionEl.appendChild(span);
      }
    });

    document.getElementById('density').textContent = State.currentAlloy.density_gcm3 + ' г/см³';
    document.getElementById('strength').textContent = State.currentAlloy.tensile_strength_MPa + ' МПа';
    document.getElementById('conductivity').textContent = State.currentAlloy.conductivity_ww + ' % IACS';
    document.getElementById('elongation').textContent = State.currentAlloy.elongation_pct + ' %';
  }
};

const Events = {
  attach() {
    document.querySelectorAll('.element-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        Actions.addElement(e.target.dataset.element);
        Actions.search();
      });
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
      Actions.removeLast();
    });
  }
};

async function init() {
  Events.attach();
  await Api.loadAlloys();
  UI.render();
}

document.addEventListener('DOMContentLoaded', init);
