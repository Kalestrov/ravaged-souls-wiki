// 1. Логика переключения страниц (вкладок)
function openPage(pageId, navElement) {
   
    const pageTitles = {
        'home': 'Главная',
        'rules': 'Правила',
        'lore': 'Лор',
        'old-world': 'История старого мира',
        'cataclysm': 'Катаклизм',        
        'chronology': 'Хронология',
        'world-now': 'Мир сейчас', 
        'factions': 'Фракции',
        'LAG': 'ОАГ',
        'economy': 'Экономика',
        'arsenal': 'Арсенал',
        'civil': 'Гражданский транспорт',
        'sundry': 'Разное'
    };

    // МЕНЯЕМ ЗАГОЛОВОК ВКЛАДКИ БРАУЗЕРА
    const currentTitle = pageTitles[pageId] || 'Ravaged Souls Wiki';
    document.title = `${currentTitle} | Ravaged Souls Wiki`;
   
    // Скрываем все страницы
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    // Показываем нужную страницу
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Убираем подсветку со всех пунктов меню
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    if (navElement) {
        // Если мы кликнули по меню, подсвечиваем именно его
        navElement.classList.add('active');
    } else {
        // Если страница загрузилась по ссылке (после обновления), ищем нужный пункт меню
        const navMap = {
            'home': 0, 'rules': 1, 'lore': 2, 'factions': 3, 'economy': 4, 'sundry': 5
        };
        // Для внутренних статей подсвечиваем их родительские разделы
        let navIndex = navMap[pageId];
        if (pageId === 'old-world') navIndex = 2; // Лор
        if (pageId === 'cataclysm') navIndex = 2;
        if (pageId === 'chronology') navIndex = 2;
        if (pageId === 'world-now') navIndex = 2;
        if (pageId === 'LAG') navIndex = 3;
        if (pageId === 'arsenal') navIndex = 4; // Экономика
        if (pageId === 'civil') navIndex = 4;

        const navItems = document.querySelectorAll('.nav-item');
        if (navIndex !== undefined && navItems[navIndex]) {
            navItems[navIndex].classList.add('active');
        }
    }

    // Добавляем ID страницы в адресную строку браузера (например, #lore)
    if (window.location.hash !== '#' + pageId) {
        history.pushState(null, null, '#' + pageId);
    }

    // Закрываем мобильное меню
    if(window.innerWidth <= 900) {
        document.getElementById('sidebar').classList.remove('open');
    }
}

// 2. Функция, которая срабатывает при загрузке страницы или нажатии "Назад/Вперед"
function loadPageFromHash() {
    // Берем часть ссылки после решетки # (например, "lore")
    let hash = window.location.hash.substring(1); 
    
    // Если хэша нет, или такого ID нет на странице, грузим главную
    if (!hash || !document.getElementById(hash)) {
        hash = 'home'; 
    }
    
    // Открываем нужную страницу (передаем null, так как мы не кликали по меню)
    openPage(hash, null); 
}

// 3. Запускаем проверку при загрузке страницы
window.addEventListener('DOMContentLoaded', loadPageFromHash);

// 4. Запускаем проверку, если пользователь нажал "Назад" или "Вперед" в браузере
window.addEventListener('hashchange', loadPageFromHash);

// 5. Открытие/закрытие мобильного меню
function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('open');
}

// 6. ЛОГИКА МОДАЛЬНОГО ОКНА
function openModal(element) {
    // ИСПРАВЛЕНО: удалили неиспользуемую переменную name
    const desc = element.getAttribute('data-desc');
    const specs = element.getAttribute('data-specs');
    const imgSrc = element.getAttribute('data-img');

    document.getElementById('modalImg').src = imgSrc;
    document.getElementById('modalDesc').innerHTML = desc;
    document.getElementById('modalSpecs').innerHTML = specs;

    const modal = document.getElementById('weaponModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(event) {
    if (event.target.id === 'weaponModal' || event.target.classList.contains('close-btn')) {
        const modal = document.getElementById('weaponModal');
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}