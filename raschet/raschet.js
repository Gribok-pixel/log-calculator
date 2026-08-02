// raschet/raschet.js

class Raschet {
    constructor() {
        // Данные: ключ "длина_ширина_толщина" -> { length, width, thickness, count, volume }
        this.data = new Map();
        
        // Структура досок по группам
        this.boardStructure = {
            '2м': [
                { w: 25, t: 100 },
                { w: 25, t: 120 },
                { w: 25, t: 150 }
            ],
            '3м': [
                { w: 25, t: 100 },
                { w: 25, t: 120 },
                { w: 25, t: 150 }
            ],
            '4м': [
                { w: 25, t: 100 },
                { w: 25, t: 120 },
                { w: 25, t: 150 }
            ],
            '6м': [
                { w: 25, t: 100 },
                { w: 25, t: 120 },
                { w: 25, t: 150 },
                { w: 25, t: 200 },
                { w: 32, t: 150 },
                { w: 40, t: 150 },
                { w: 50, t: 100 },
                { w: 50, t: 120 },
                { w: 50, t: 150 },
                { w: 50, t: 180 },
                { w: 50, t: 200 },
                { w: 100, t: 100 },
                { w: 100, t: 150 },
                { w: 100, t: 200 },
                { w: 150, t: 150 },
                { w: 150, t: 200 },
                { w: 200, t: 200 }
            ]
        };
        
        // DOM элементы
        this.listWrapper = document.getElementById('raschetListWrapper');
        this.totalItemsEl = document.getElementById('raschetTotalItems');
        this.totalCountEl = document.getElementById('raschetTotalCount');
        this.totalVolumeEl = document.getElementById('raschetTotalVolume');
        
        // Метаданные
        this.clientInput = document.getElementById('raschetClient');
        this.dateInput = document.getElementById('raschetDate');
        
        // Кнопки
        this.clearAllBtn = document.getElementById('raschetClearAll');
        this.savePDFBtn = document.getElementById('raschetSavePDF');

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
        // Очищаем данные
        this.data.clear();
        
        // Заполняем структуру
        for (const [lengthGroup, boards] of Object.entries(this.boardStructure)) {
            const length = parseInt(lengthGroup);
            for (const board of boards) {
                const key = `${length}_${board.w}_${board.t}`;
                const volume = this.calculateVolume(length, board.w, board.t);
                this.data.set(key, {
                    length: length,
                    width: board.w,
                    thickness: board.t,
                    count: 0,
                    volume: volume
                });
            }
        }
    }

    // ============================================================
    // РАСЧЕТ ОБЪЕМА ДОСКИ (в м³)
    // ============================================================
    calculateVolume(length, width, thickness) {
        // Длина в метрах, ширина и толщина в мм
        return (length * width * thickness) / 1_000_000;
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
        this.clientInput.addEventListener('change', () => this.saveToStorage());
        this.dateInput.addEventListener('change', () => this.saveToStorage());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
        this.savePDFBtn.addEventListener('click', () => this.printPDF());
    }

    // ============================================================
    // РЕНДЕРИНГ
    // ============================================================
    render() {
        let html = '';
        let totalItems = 0;
        let totalCount = 0;
        let totalVolume = 0;

        // Группируем по длине
        const groups = this.groupByLength();

        for (const [length, items] of groups) {
            let groupTotalCount = 0;
            let groupTotalVolume = 0;
            
            html += `<div class="raschet-group">`;
            html += `<div class="raschet-group-header">`;
            html += `<span class="length">📏 ${length}м</span>`;
            
            // Считаем итоги по группе
            for (const item of items) {
                groupTotalCount += item.count;
                groupTotalVolume += item.count * item.volume;
            }
            
            html += `<span class="group-total">${groupTotalCount} шт | ${groupTotalVolume.toFixed(3)} м³</span>`;
            html += `</div>`;

            // Рендерим каждый элемент в группе
            for (const item of items) {
                const total = item.count * item.volume;
                totalItems += item.count > 0 ? 1 : 0;
                totalCount += item.count;
                totalVolume += total;

                const isEmpty = item.count === 0;
                const rowClass = isEmpty ? 'row-empty' : '';

                html += `
                    <div class="raschet-item ${rowClass}" data-key="${item.key}">
                        <span class="size-label">${item.width}×${item.thickness}</span>
                        <span class="volume-label">${item.volume.toFixed(3)} м³</span>
                        <div class="count-cell">
                            <button class="count-btn" data-action="minus" data-key="${item.key}">−</button>
                            <input type="number" class="count-input" 
                                   value="${item.count}" min="0" 
                                   data-key="${item.key}">
                            <button class="count-btn" data-action="plus" data-key="${item.key}">+</button>
                        </div>
                        <span class="total-cell">${total.toFixed(3)}</span>
                        <button class="delete-btn" data-key="${item.key}">✕</button>
                    </div>
                `;
            }

            html += `</div>`;
        }

        this.listWrapper.innerHTML = html;

        // Обновляем итоги
        this.totalItems = totalItems;
        this.totalCount = totalCount;
        this.totalVolume = totalVolume;
        this.updateTotals();

        // Добавляем события
        this.addItemEvents();
    }

    // ============================================================
    // ГРУППИРОВКА ПО ДЛИНЕ
    // ============================================================
    groupByLength() {
        const groups = new Map();
        
        for (const [key, item] of this.data) {
            const length = item.length;
            if (!groups.has(length)) {
                groups.set(length, []);
            }
            groups.get(length).push({
                key: key,
                ...item
            });
        }
        
        // Сортируем длины по возрастанию
        return new Map([...groups.entries()].sort((a, b) => a[0] - b[0]));
    }

    // ============================================================
    // ОБНОВЛЕНИЕ ИТОГОВ
    // ============================================================
    updateTotals() {
        this.totalItemsEl.textContent = this.totalItems;
        this.totalCountEl.textContent = this.totalCount;
        this.totalVolumeEl.textContent = this.totalVolume.toFixed(3);
    }

    // ============================================================
    // СОБЫТИЯ ЭЛЕМЕНТОВ
    // ============================================================
    addItemEvents() {
        // Кнопки +/-
        document.querySelectorAll('.raschet-item .count-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const key = btn.dataset.key;
                const action = btn.dataset.action;
                const item = this.data.get(key);
                if (!item) return;

                if (action === 'plus') {
                    item.count += 1;
                } else if (action === 'minus' && item.count > 0) {
                    item.count -= 1;
                }

                this.saveToStorage();
                this.render();
            });
        });

        // Инпуты
        document.querySelectorAll('.raschet-item .count-input').forEach(input => {
            input.addEventListener('change', () => {
                const key = input.dataset.key;
                const item = this.data.get(key);
                if (!item) return;

                let val = parseInt(input.value) || 0;
                if (val < 0) val = 0;
                item.count = val;

                this.saveToStorage();
                this.render();
            });

            input.addEventListener('focus', () => {
                input.select();
            });
        });

        // Кнопки удаления
        document.querySelectorAll('.raschet-item .delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.key;
                const item = this.data.get(key);
                if (item) {
                    item.count = 0;
                    this.saveToStorage();
                    this.render();
                }
            });
        });
    }

    // ============================================================
    // ОЧИСТИТЬ ВСЕ
    // ============================================================
    clearAll() {
        if (!confirm('Очистить все данные?')) return;

        for (const [key, item] of this.data) {
            item.count = 0;
        }

        this.clientInput.value = '';
        this.setDefaultDate();

        this.saveToStorage();
        this.render();
    }

    // ============================================================
    // ПЕЧАТЬ / PDF
    // ============================================================
    printPDF() {
        // Добавляем класс для печати
        const container = document.querySelector('.raschet-container');
        container.classList.add('printing');
        
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                container.classList.remove('printing');
            }, 500);
        }, 300);
    }

    // ============================================================
    // СОХРАНЕНИЕ В LOCALSTORAGE
    // ============================================================
    saveToStorage() {
        const data = {
            metadata: {
                client: this.clientInput.value || '',
                date: this.dateInput.value || ''
            },
            data: Array.from(this.data.entries()).map(([key, item]) => ({
                key: key,
                count: item.count
            }))
        };
        localStorage.setItem('raschet_data', JSON.stringify(data));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('raschet_data');
        if (!saved) return;

        try {
            const data = JSON.parse(saved);
            
            if (data.metadata) {
                this.clientInput.value = data.metadata.client || '';
                this.dateInput.value = data.metadata.date || '';
            }

            if (data.data && Array.isArray(data.data)) {
                data.data.forEach(item => {
                    if (this.data.has(item.key)) {
                        this.data.get(item.key).count = item.count || 0;
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
let raschet;

function initRaschet() {
    if (!raschet) {
        raschet = new Raschet();
    }
    return raschet;
}

export { Raschet, initRaschet };