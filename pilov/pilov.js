// pilov/pilov.js

class Pilovnik {
    constructor() {
        // Данные: диаметр -> { volume, count }
        this.data = new Map();
        
        // DOM элементы
        this.tableBody = document.getElementById('pilovTableBody');
        this.totalCountEl = document.getElementById('pilovTotalCount');
        this.totalVolumeEl = document.getElementById('pilovTotalVolume');
        this.footerCountEl = document.getElementById('pilovFooterCount');
        this.footerVolumeEl = document.getElementById('pilovFooterVolume');
        
        // Метаданные
        this.nameInput = document.getElementById('pilovName');
        this.carInput = document.getElementById('pilovCarNumber');
        this.dateInput = document.getElementById('pilovDate');
        
        // Кнопки
        this.resetBtn = document.getElementById('pilovReset');
        this.saveBtn = document.getElementById('pilovSave');

        // Инициализация
        this.initData();
        this.setDefaultDate();
        this.initEvents();
        this.loadFromStorage();
        this.render();
    }

    // ============================================================
    // ИНИЦИАЛИЗАЦИЯ ДАННЫХ
    // ============================================================
    initData() {
        const volumes = {
            13: 0.108, 14: 0.123, 15: 0.139, 16: 0.157, 17: 0.176,
            18: 0.197, 19: 0.219, 20: 0.243, 21: 0.267, 22: 0.293,
            23: 0.319, 24: 0.347, 25: 0.376, 26: 0.406, 27: 0.437,
            28: 0.470, 29: 0.503, 30: 0.538, 31: 0.573, 32: 0.610,
            33: 0.648, 34: 0.687, 35: 0.727, 36: 0.769, 37: 0.811,
            38: 0.855, 39: 0.900, 40: 0.946, 41: 0.993, 42: 1.042,
            43: 1.092, 44: 1.143, 45: 1.195, 46: 1.248, 47: 1.303,
            48: 1.359, 49: 1.416, 50: 1.474, 51: 1.534, 52: 1.595,
            53: 1.657, 54: 1.720
        };

        for (let d = 13; d <= 54; d++) {
            this.data.set(d, {
                volume: volumes[d] || 0,
                count: 0
            });
        }
    }

    // ============================================================
    // ДАТА ПО УМОЛЧАНИЮ
    // ============================================================
    setDefaultDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        this.dateInput.value = `${year}-${month}-${day}`;
    }

    // ============================================================
    // СОБЫТИЯ
    // ============================================================
    initEvents() {
        // Сохранение при изменении метаданных
        this.nameInput.addEventListener('change', () => this.saveToStorage());
        this.carInput.addEventListener('change', () => this.saveToStorage());
        this.dateInput.addEventListener('change', () => this.saveToStorage());

        // Сброс
        this.resetBtn.addEventListener('click', () => this.resetAll());

        // Сохранение PDF (печать)
        this.saveBtn.addEventListener('click', () => this.printPDF());
    }

    // ============================================================
    // РЕНДЕРИНГ
    // ============================================================
    render() {
        let html = '';
        let totalCount = 0;
        let totalVolume = 0;

        for (const [diameter, item] of this.data) {
            const total = item.volume * item.count;
            totalCount += item.count;
            totalVolume += total;

            const isEmpty = item.count === 0;
            const rowClass = isEmpty ? 'pilov-row-empty' : '';

            html += `
                <tr data-diameter="${diameter}" class="${rowClass}">
                    <td class="pilov-diameter">${diameter}</td>
                    <td class="pilov-volume">${item.volume.toFixed(3)}</td>
                    <td>
                        <div class="pilov-count-cell">
                            <button class="pilov-count-btn" data-action="minus" data-diam="${diameter}">−</button>
                            <input type="number" class="pilov-count-input" 
                                value="${item.count}" min="0" 
                                data-diam="${diameter}">
                            <button class="pilov-count-btn" data-action="plus" data-diam="${diameter}">+</button>
                        </div>
                    </td>
                    <td class="pilov-total-cell">${total.toFixed(3)}</td>
                    <td>
                        <button class="pilov-delete-btn" data-diam="${diameter}">✕</button>
                    </td>
                </tr>
            `;
        }

        this.tableBody.innerHTML = html;

        // Обновляем итоги
        this.totalCount = totalCount;
        this.totalVolume = totalVolume;
        this.updateTotals();

        // Добавляем события
        this.addTableEvents();
    }

    // ============================================================
    // ОБНОВЛЕНИЕ ИТОГОВ
    // ============================================================
    updateTotals() {
        this.totalCountEl.textContent = this.totalCount;
        this.totalVolumeEl.textContent = this.totalVolume.toFixed(3);
        this.footerCountEl.textContent = this.totalCount;
        this.footerVolumeEl.textContent = this.totalVolume.toFixed(3);
    }

    // ============================================================
    // СОБЫТИЯ ТАБЛИЦЫ
    // ============================================================
    addTableEvents() {
        // Кнопки +/-
        document.querySelectorAll('.pilov-count-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const diam = parseInt(btn.dataset.diam);
                const action = btn.dataset.action;
                const current = this.data.get(diam);
                if (!current) return;

                if (action === 'plus') {
                    current.count += 1;
                } else if (action === 'minus' && current.count > 0) {
                    current.count -= 1;
                }

                this.saveToStorage();
                this.render();
            });
        });

        // Инпуты
        document.querySelectorAll('.pilov-count-input').forEach(input => {
            input.addEventListener('change', () => {
                const diam = parseInt(input.dataset.diam);
                const current = this.data.get(diam);
                if (!current) return;

                let val = parseInt(input.value) || 0;
                if (val < 0) val = 0;
                current.count = val;

                this.saveToStorage();
                this.render();
            });

            input.addEventListener('focus', () => {
                input.select();
            });
        });

        // Кнопки удаления
        document.querySelectorAll('.pilov-delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const diam = parseInt(btn.dataset.diam);
                const current = this.data.get(diam);
                if (current) {
                    current.count = 0;
                    this.saveToStorage();
                    this.render();
                }
            });
        });
    }

    // ============================================================
    // СБРОС
    // ============================================================
    resetAll() {
        if (!confirm('Сбросить все данные?')) return;

        for (const [diam, item] of this.data) {
            item.count = 0;
        }

        this.nameInput.value = '';
        this.carInput.value = '';
        this.setDefaultDate();

        this.saveToStorage();
        this.render();
    }

    // ============================================================
    // ПЕЧАТЬ / PDF
    // ============================================================
    printPDF() {
        window.print();
    }

    // ============================================================
    // СОХРАНЕНИЕ В LOCALSTORAGE
    // ============================================================
    saveToStorage() {
        const data = {
            metadata: {
                name: this.nameInput.value || '',
                carNumber: this.carInput.value || '',
                date: this.dateInput.value || ''
            },
            data: Array.from(this.data.entries()).map(([diam, item]) => ({
                diameter: diam,
                count: item.count
            }))
        };
        localStorage.setItem('pilovnik_data', JSON.stringify(data));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('pilovnik_data');
        if (!saved) return;

        try {
            const data = JSON.parse(saved);
            
            if (data.metadata) {
                this.nameInput.value = data.metadata.name || '';
                this.carInput.value = data.metadata.carNumber || '';
                this.dateInput.value = data.metadata.date || '';
            }

            if (data.data && Array.isArray(data.data)) {
                data.data.forEach(item => {
                    const diam = item.diameter;
                    if (this.data.has(diam)) {
                        this.data.get(diam).count = item.count || 0;
                    }
                });
            }

            this.render();
        } catch (err) {
            console.warn('Ошибка загрузки:', err);
        }
    }
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================
let pilovnik;

function initPilovnik() {
    if (!pilovnik) {
        pilovnik = new Pilovnik();
    }
    return pilovnik;
}

export { Pilovnik, initPilovnik };