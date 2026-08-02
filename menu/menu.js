// menu/menu.js

class Menu {
    constructor() {
        this.isOpen = false;
        this.currentPage = 'rasp';
        this.init();
    }

    init() {
        // Создаем HTML меню
        this.createMenuHTML();
        
        // Получаем элементы
        this.menuToggle = document.getElementById('menuToggle');
        this.menuOverlay = document.getElementById('menuOverlay');
        this.sideMenu = document.getElementById('sideMenu');
        this.menuClose = document.getElementById('menuClose');
        this.menuLinks = document.querySelectorAll('.menu-link');

        // Добавляем события
        this.addEvents();
    }

    createMenuHTML() {
        // Проверяем, есть ли уже меню
        if (document.getElementById('menuToggle')) return;

        // Создаем контейнер для меню
        const menuContainer = document.createElement('div');
        menuContainer.id = 'menuContainer';
        
        // Загружаем HTML из шаблона (или вставляем напрямую)
        menuContainer.innerHTML = `
            <div class="menu-toggle" id="menuToggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div class="menu-overlay" id="menuOverlay"></div>
            <nav class="side-menu" id="sideMenu">
                <div class="menu-header">
                    <h2>📐 Меню</h2>
                    <button class="menu-close" id="menuClose">✕</button>
                </div>
                <ul class="menu-list">
                    <li>
                        <a href="#" class="menu-link active" data-page="rasp">
                            <span class="menu-icon">📏</span>
                            <span class="menu-text">Раскрой</span>
                            <span class="menu-badge">активно</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" class="menu-link" data-page="pilov">
                            <span class="menu-icon">🪵</span>
                            <span class="menu-text">Пиловочник</span>
                            <span class="menu-badge">скоро</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" class="menu-link" data-page="raschet">
                            <span class="menu-icon">📊</span>
                            <span class="menu-text">Расчет доски</span>
                            <span class="menu-badge">скоро</span>
                        </a>
                    </li>
                </ul>
                <div class="menu-footer">
                    <div class="menu-version">v2.0.0</div>
                    <div class="menu-info">Log Calculator</div>
                </div>
            </nav>
        `;

        // Добавляем в body
        document.body.appendChild(menuContainer);

        // Добавляем стили если их нет
        this.loadStyles();
    }

    loadStyles() {
        // Проверяем, загружены ли стили
        if (document.getElementById('menuStyles')) return;

        const link = document.createElement('link');
        link.id = 'menuStyles';
        link.rel = 'stylesheet';
        link.href = './menu/menu.css';
        document.head.appendChild(link);
    }

    addEvents() {
        // Открытие/закрытие по кнопке бургера
        this.menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        // Закрытие по кнопке "крестик"
        this.menuClose.addEventListener('click', () => {
            this.close();
        });

        // Закрытие по overlay
        this.menuOverlay.addEventListener('click', () => {
            this.close();
        });

        // Закрытие по клавише ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Обработка кликов по ссылкам меню
        this.menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateTo(page);
            });
        });

        // Закрытие при клике вне меню
        document.addEventListener('click', (e) => {
            if (this.isOpen) {
                const target = e.target;
                if (!this.sideMenu.contains(target) && 
                    !this.menuToggle.contains(target)) {
                    this.close();
                }
            }
        });

        // Блокировка скролла при открытом меню
        document.addEventListener('touchmove', (e) => {
            if (this.isOpen) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    open() {
        this.isOpen = true;
        this.menuToggle.classList.add('active');
        this.menuOverlay.classList.add('active');
        this.sideMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.isOpen = false;
        this.menuToggle.classList.remove('active');
        this.menuOverlay.classList.remove('active');
        this.sideMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    navigateTo(page) {
        // Обновляем активную ссылку
        this.menuLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
                // Обновляем бейдж
                const badge = link.querySelector('.menu-badge');
                if (badge) {
                    badge.textContent = 'активно';
                }
            } else {
                const badge = link.querySelector('.menu-badge');
                if (badge && link.dataset.page !== 'rasp') {
                    badge.textContent = 'скоро';
                }
            }
        });

        this.currentPage = page;

        // Здесь логика переключения страниц
        this.handlePageChange(page);

        // Закрываем меню после навигации
        setTimeout(() => {
            this.close();
        }, 300);
    }

    handlePageChange(page) {
        // Скрываем все страницы
        const pages = document.querySelectorAll('.page-content');
        pages.forEach(p => {
            p.style.display = 'none'
            p.classList.remove('active')
        });

        // Показываем нужную страницу
        const targetPage = document.getElementById(`page-${page}`);
        if (targetPage) {
            targetPage.style.display = 'flex';
            targetPage.classList.add('active');

            // Инициализируем пиловочник при переходе на страницу
            if (page === 'pilov' && typeof window.initPilovnik === 'function') {
                setTimeout(() => initPilovnik(), 100);
            }

            if (page === 'raschet' && typeof window.initRaschet === 'function') {
                setTimeout(() => window.initRaschet(), 50);
            }
        }

        // Вызываем колбэк если есть
        if (this.onPageChange) {
            this.onPageChange(page);
        }

        console.log(`Переход на страницу: ${page}`);
    }

    // Метод для регистрации колбэка при смене страницы
    setOnPageChange(callback) {
        this.onPageChange = callback;
    }
}

// Создаем экземпляр меню
const menu = new Menu();

// Экспортируем для использования в других файлах
export default menu;