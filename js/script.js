/* =====================================================================
   Ravaged Souls Wiki: script.js
   Что изменено по сравнению со старой версией:
   1. Кнопка «Назад» больше не зацикливается (replaceState при первой загрузке).
   2. Хеш, который указывает не на страницу (#sidebar, #weaponModal), открывает главную.
   3. Хеш не зависит от регистра: #corniosius и #Corniosius открывают одну страницу.
   4. При переходе страница прокручивается наверх.
   5. Подсветка раздела меню берётся из карты sectionOf, а не из цепочки if и индексов.
   6. Поиск по вики (см. блок «ПОИСК» ниже). HTML менять не нужно.
   7. Клавиатура: Enter/Пробел на карточках и пунктах меню, Esc закрывает окно оружия.
   ===================================================================== */


/* ---------------------------------------------------------------------
   ДАННЫЕ
   --------------------------------------------------------------------- */

// Заголовки страниц (для вкладки браузера и результатов поиска)
const pageTitles = {
    'home': 'Главная',
    'rules': 'Правила',
    'lore': 'Лор',
    'old-world': 'История старого мира',
    'cataclysm': 'Катаклизм',
    'chronology': 'Хронология',
    'world-now': 'Мир сейчас',
    'Examination': 'Экзаменатство',
    'Corniosius': 'Дети Корнеозия',
    'heathenism': 'Язычество',
    'worshipper': 'Смертопоклонство',
    'crow': 'Дом Ворона',
    'factions': 'Фракции',
    'LAG': 'ОАГ',
    'Brelon': 'Брелонская Республика',
    'lands': 'Южный Эллардан',
    'lords': 'Топливные Лорды',
    'loin': 'Княжество Лойн',
    'Gitan': 'Гитане',
    'alkia': 'Новая Алкия',
    'idolater': 'Смертопоклонники',
    'Highlander': 'Актары',
    'virtue': 'Добродетели',
    'economy': 'Экономика',
    'arsenal': 'Арсенал',
    'civil': 'Гражданский транспорт',
    'sundry': 'Разное'
};

// К какому разделу меню относится страница.
// Новую страницу достаточно добавить сюда и в pageTitles.
const sectionOf = {
    'old-world': 'lore', 'cataclysm': 'lore', 'chronology': 'lore', 'world-now': 'lore',
    'Examination': 'lore', 'Corniosius': 'lore', 'heathenism': 'lore', 'worshipper': 'lore', 'crow': 'lore',
    'LAG': 'factions', 'Brelon': 'factions', 'lands': 'factions', 'lords': 'factions', 'loin': 'factions',
    'alkia': 'factions', 'Gitan': 'factions', 'idolater': 'factions', 'Highlander': 'factions', 'virtue': 'factions',
    'arsenal': 'economy', 'civil': 'economy'
};

const sectionLabels = {
    'home': 'Главная', 'rules': 'Правила', 'lore': 'Лор',
    'factions': 'Фракции', 'economy': 'Экономика', 'sundry': 'Разное'
};

// Новые страницы подхватываются автоматически: раздел и название берутся из карточки
// на странице-хабе (Лор, Фракции, Экономика...). Достаточно добавить в HTML сам блок
// страницы и карточку на хабе. Словари выше имеют приоритет и нужны только для исключений.
const HUB_PAGES = ['lore', 'factions', 'economy', 'rules', 'sundry'];
const autoMeta = {};

(function collectAutoMeta() {
    HUB_PAGES.forEach(hub => {
        document.querySelectorAll(`#${hub} .lore-card`).forEach(card => {
            let id = null;
            const href = card.getAttribute('href');
            if (href && href.startsWith('#')) {
                id = href.slice(1);
            } else {
                const m = (card.getAttribute('onclick') || '').match(/openPage\('([^']+)'/);
                if (m) id = m[1];
            }
            if (!id) return;
            try { id = decodeURIComponent(id); } catch (e) { /* оставляем как есть */ }
            const heading = card.querySelector('h3');
            autoMeta[id] = { section: hub, title: heading ? heading.textContent.trim() : '' };
        });
    });
})();

function getSection(pageId) {
    return sectionOf[pageId] || (autoMeta[pageId] && autoMeta[pageId].section) || pageId;
}

function getTitle(pageId) {
    return pageTitles[pageId] || (autoMeta[pageId] && autoMeta[pageId].title) || '';
}


/* ---------------------------------------------------------------------
   1. ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ
   --------------------------------------------------------------------- */

function openPage(pageId, navElement, opts = {}) {
    const targetPage = document.getElementById(pageId);
    // Защита: открываем только настоящие страницы
    if (!targetPage || !targetPage.classList.contains('page')) return;

    // Заголовок вкладки браузера
    const currentTitle = getTitle(pageId) || 'Ravaged Souls Wiki';
    document.title = `${currentTitle} | Ravaged Souls Wiki`;

    // Показываем нужную страницу, остальные скрываем
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    targetPage.classList.add('active');

    // Подсветка пункта меню: либо тот, по которому кликнули, либо родительский раздел
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const navItem = navElement || document.querySelector(`.nav-item[onclick*="'${getSection(pageId)}'"]`);
    if (navItem) navItem.classList.add('active');

    // Адресная строка. При первой загрузке и при исправлении хеша
    // используем replaceState, чтобы не засорять историю и не ломать «Назад».
    if (window.location.hash !== '#' + pageId) {
        history[opts.replace ? 'replaceState' : 'pushState'](null, '', '#' + pageId);
    }

    window.scrollTo(0, 0);

    // Закрываем мобильное меню
    if (window.innerWidth <= 900) {
        document.getElementById('sidebar').classList.remove('open');
    }
}

// Срабатывает при загрузке страницы и при «Назад/Вперёд»
function loadPageFromHash() {
    let raw = window.location.hash.substring(1);
    try { raw = decodeURIComponent(raw); } catch (e) { /* битый хеш: откроем главную */ }

    // Ищем страницу без учёта регистра
    const match = Array.from(document.querySelectorAll('.page'))
        .find(page => page.id.toLowerCase() === raw.toLowerCase());

    openPage(match ? match.id : 'home', null, { replace: true });
}

loadPageFromHash();
window.addEventListener('hashchange', loadPageFromHash);


/* ---------------------------------------------------------------------
   2. МОБИЛЬНОЕ МЕНЮ
   --------------------------------------------------------------------- */

function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('open');
}


/* ---------------------------------------------------------------------
   3. МОДАЛЬНОЕ ОКНО (ОРУЖИЕ, ТРАНСПОРТ)
   --------------------------------------------------------------------- */

let lastModalOpener = null;

function openModal(element) {
    const desc = element.getAttribute('data-desc');
    const specs = element.getAttribute('data-specs');
    const imgSrc = element.getAttribute('data-img');

    document.getElementById('modalImg').src = imgSrc;
    document.getElementById('modalDesc').innerHTML = desc;
    document.getElementById('modalSpecs').innerHTML = specs;

    lastModalOpener = element;
    document.getElementById('weaponModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    const modal = document.getElementById('weaponModal');
    if (!modal || !modal.classList.contains('show')) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
    if (lastModalOpener) lastModalOpener.focus();
}

// Вызывается из HTML: onclick="closeModal(event)"
function closeModal(event) {
    if (event.target.id === 'weaponModal' || event.target.classList.contains('close-btn')) {
        hideModal();
    }
}

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') hideModal();
});


/* ---------------------------------------------------------------------
   4. КЛАВИАТУРА И ДОСТУПНОСТЬ
   Карточки и пункты меню сделаны на div/li с onclick. Здесь им добавляется
   фокус и активация по Enter/Пробел. Править HTML не нужно.
   --------------------------------------------------------------------- */

function initA11y() {
    const toggle = document.querySelector('.mobile-toggle');
    if (toggle) toggle.setAttribute('aria-label', 'Открыть меню');

    const modal = document.getElementById('weaponModal');
    if (modal) {
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
    }

    document.querySelectorAll('li[onclick], div[onclick]:not(.modal-overlay)').forEach(el => {
        el.tabIndex = 0;
        el.setAttribute('role', 'button');
        el.addEventListener('keydown', event => {
            if (event.target !== el) return;
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                el.click();
            }
        });
    });
}

initA11y();


/* ---------------------------------------------------------------------
   5. ПОИСК
   Индекс строится из текста страниц при первом обращении: по одной записи
   на каждый подраздел (заголовок h2). Ищет по началу слов, учитывает
   окончания и разные написания одного и того же слова.
   --------------------------------------------------------------------- */

// Страницы-меню (только карточки-ссылки): в поиске от них нет пользы
const SEARCH_SKIP = new Set(['home', 'lore', 'factions', 'economy']);
// Заготовки страниц («текст — текст», «ЗАГЛУШКА») в поиске не нужны
const SEARCH_PLACEHOLDER = /^(?:[\s●—:.,\-]|текст|заглушка)+$/i;
const SEARCH_MAX_RESULTS = 10;
const SEARCH_MAX_PER_PAGE = 2;

// Слова, которые в вики пишутся по-разному. Приводим к одному виду,
// чтобы поиск находил любой вариант. Если закрепите одно написание в тексте,
// можно удалить строку отсюда.
const SEARCH_ALIASES = [
    [/(?<!\p{L})корниоз/gu, 'корнеоз'],            // Корниозий / Корнеозий
    [/(?<!\p{L})экзаменатств/gu, 'экзаменаторств'], // Экзаменатство / Экзаменаторство
    [/(?<!\p{L})сугрухнд/gu, 'сугхрунд'],          // Сугрухнд / Сугхрунд
    [/(?<!\p{L})араг/gu, 'агар']                    // Араг / Агар
];

// Нижний регистр, ё как е, единые написания, только буквы и цифры через пробел
function normalize(str) {
    let s = str.toLowerCase().replace(/ё/g, 'е');
    for (const [from, to] of SEARCH_ALIASES) s = s.replace(from, to);
    return s.replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

// Грубое отсечение окончаний: «смертопоклонников» и «смертопоклонники» дают одну основу
function stem(word) {
    if (word.length >= 7) return word.slice(0, -2);
    if (word.length >= 5) return word.slice(0, -1);
    return word;
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countOccurrences(haystack, needle) {
    let count = 0;
    let pos = haystack.indexOf(needle);
    while (pos !== -1) {
        count++;
        pos = haystack.indexOf(needle, pos + needle.length);
    }
    return count;
}

// Текст из HTML, который лежит в data-атрибутах карточек оружия (без загрузки картинок)
function htmlToText(html) {
    return new DOMParser().parseFromString(html || '', 'text/html').body.textContent || '';
}

function textOf(node) {
    let text = node.textContent;
    node.querySelectorAll('[data-desc], [data-specs]').forEach(card => {
        text += ' ' + htmlToText(card.getAttribute('data-desc')) + ' ' + htmlToText(card.getAttribute('data-specs'));
    });
    return text.replace(/\s+/g, ' ').trim();
}

let searchIndex = null;

function buildSearchIndex() {
    const entries = [];

    document.querySelectorAll('.page').forEach(page => {
        if (SEARCH_SKIP.has(page.id)) return;

        const pageTitle = getTitle(page.id) || page.id;
        const sectionLabel = sectionLabels[getSection(page.id)] || '';
        let current = { heading: 'Основное', el: null, parts: [] };

        const flush = () => {
            const text = current.parts.join(' ').replace(/\s+/g, ' ').trim();
            if (!text || SEARCH_PLACEHOLDER.test(text)) return; // пустые разделы и «текст — текст» не индексируем
            entries.push({
                pageId: page.id,
                pageTitle,
                sectionLabel,
                heading: current.heading,
                el: current.el,
                text,
                normPage: ' ' + normalize(pageTitle) + ' ',
                normHeading: ' ' + normalize(current.heading) + ' ',
                norm: ' ' + normalize(text) + ' '
            });
        };

        Array.from(page.children).forEach(child => {
            if (child.matches('.breadcrumbs, .article-hero')) return;
            if (child.matches('h2')) {
                flush();
                current = { heading: child.textContent.trim(), el: child, parts: [] };
            } else {
                current.parts.push(textOf(child));
            }
        });
        flush();
    });

    return entries;
}

function getSearchIndex() {
    if (!searchIndex) searchIndex = buildSearchIndex();
    return searchIndex;
}

// Возвращает null, если запрос слишком короткий
function runSearch(query) {
    const tokens = normalize(query).split(' ').filter(Boolean);
    if (!tokens.length || tokens.join('').length < 2) return null;

    const stems = tokens.map(stem);
    const scored = [];

    getSearchIndex().forEach(entry => {
        let score = 0;
        for (const st of stems) {
            const needle = ' ' + st;
            const inPage = entry.normPage.includes(needle);
            const inHeading = entry.normHeading.includes(needle);
            const hits = countOccurrences(entry.norm, needle);
            if (!inPage && !inHeading && !hits) return; // каждое слово запроса должно найтись
            score += (inPage ? 20 : 0) + (inHeading ? 15 : 0) + Math.min(hits, 6) * 2;
        }
        scored.push({ entry, score });
    });

    scored.sort((a, b) => b.score - a.score); // сортировка стабильная: при равенстве порядок страницы

    const perPage = {};
    const shown = [];
    for (const item of scored) {
        perPage[item.entry.pageId] = (perPage[item.entry.pageId] || 0) + 1;
        if (perPage[item.entry.pageId] > SEARCH_MAX_PER_PAGE) continue;
        shown.push(item);
        if (shown.length >= SEARCH_MAX_RESULTS) break;
    }

    // Шаблон для подсветки: основы из запроса «как напечатано» и после унификации написаний
    const lightStems = query.toLowerCase().replace(/ё/g, 'е')
        .split(/[^\p{L}\p{N}]+/u).filter(Boolean).map(stem);
    const patterns = Array.from(new Set([...lightStems, ...stems]))
        .filter(s => s.length > 1)
        .map(s => escapeRegExp(s).replace(/е/g, '[её]'));
    const highlightRe = new RegExp('(?<!\\p{L})(?:' + patterns.join('|') + ')\\p{L}*', 'giu');

    return {
        total: scored.length,
        items: shown.map(item => ({ entry: item.entry, snippet: buildSnippet(item.entry.text, highlightRe) }))
    };
}

function highlight(str, re) {
    let out = '';
    let last = 0;
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(str)) !== null) {
        out += escapeHtml(str.slice(last, m.index)) + '<mark>' + escapeHtml(m[0]) + '</mark>';
        last = m.index + m[0].length;
        if (m[0].length === 0) re.lastIndex++;
    }
    return out + escapeHtml(str.slice(last));
}

function buildSnippet(text, re) {
    re.lastIndex = 0;
    const m = re.exec(text);
    const idx = m ? m.index : 0;

    const start = Math.max(0, idx - 50);
    const end = Math.min(text.length, start + 170);
    let piece = text.slice(start, end);

    // Не начинаем фрагмент с обрезанного слова
    if (start > 0) {
        const space = piece.indexOf(' ');
        if (space > -1 && space < 20) piece = piece.slice(space + 1);
    }

    return (start > 0 ? '…' : '') + highlight(piece, re) + (end < text.length ? '…' : '');
}

function initSearch() {
    const input = document.querySelector('.search-box input');
    if (!input) return;

    const box = input.closest('.search-box');
    const list = document.createElement('div');
    list.className = 'search-results';
    list.id = 'searchResults';
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    box.appendChild(list);

    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-label', 'Поиск по вики');
    input.setAttribute('aria-controls', 'searchResults');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('autocomplete', 'off');
    input.title = 'Поиск: клавиша / или Ctrl+K';

    let results = [];
    let active = -1;
    let timer = null;

    function setOpen(open) {
        list.hidden = !open;
        input.setAttribute('aria-expanded', String(open));
        if (!open) {
            active = -1;
            input.removeAttribute('aria-activedescendant');
        }
    }

    function setActive(index) {
        const options = list.querySelectorAll('.search-result');
        options.forEach(o => o.classList.remove('active'));
        active = index;
        if (index >= 0 && options[index]) {
            options[index].classList.add('active');
            options[index].scrollIntoView({ block: 'nearest' });
            input.setAttribute('aria-activedescendant', options[index].id);
        } else {
            input.removeAttribute('aria-activedescendant');
        }
    }

    function render(query, data) {
        if (!data) { setOpen(false); return; }
        results = data.items;

        if (!results.length) {
            list.innerHTML = `<div class="search-empty">По запросу «${escapeHtml(query.trim())}» ничего не найдено. Попробуйте другое слово или его начало.</div>`;
            setOpen(true);
            return;
        }

        list.innerHTML = results.map((r, i) => {
            const e = r.entry;
            const sub = e.heading && e.heading !== 'Основное'
                ? `<div class="search-result-sub">${escapeHtml(e.heading)}</div>` : '';
            return `<a class="search-result" role="option" id="search-option-${i}" data-i="${i}" href="#${encodeURIComponent(e.pageId)}">
                <div class="search-result-head">
                    <span class="search-result-title">${escapeHtml(e.pageTitle)}</span>
                    <span class="search-result-tag">${escapeHtml(e.sectionLabel)}</span>
                </div>
                ${sub}
                <div class="search-result-snippet">${r.snippet}</div>
            </a>`;
        }).join('') + (data.total > results.length
            ? `<div class="search-more">Показаны ${results.length} из ${data.total} совпадений. Уточните запрос.</div>` : '');

        setOpen(true);
        setActive(-1);
    }

    function goTo(entry) {
        openPage(entry.pageId, null);
        input.value = '';
        results = [];
        setOpen(false);
        input.blur();

        // Переход к подразделу и короткая подсветка его заголовка
        if (entry.el && entry.heading !== 'Основное') {
            requestAnimationFrame(() => {
                entry.el.scrollIntoView({ block: 'start' });
                entry.el.classList.remove('search-hit');
                void entry.el.offsetWidth; // перезапуск анимации
                entry.el.classList.add('search-hit');
                setTimeout(() => entry.el.classList.remove('search-hit'), 2200);
            });
        }
    }

    input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => render(input.value, runSearch(input.value)), 120);
    });

    input.addEventListener('focus', () => {
        if (input.value.trim() && results.length) setOpen(true);
    });

    input.addEventListener('keydown', event => {
        const count = results.length;
        if (event.key === 'ArrowDown' && count) {
            event.preventDefault();
            if (list.hidden) setOpen(true);
            setActive((active + 1) % count);
        } else if (event.key === 'ArrowUp' && count) {
            event.preventDefault();
            setActive(active <= 0 ? count - 1 : active - 1);
        } else if (event.key === 'Enter') {
            // Если запрос ещё не обработан (дебаунс), обрабатываем сейчас
            if (timer) { clearTimeout(timer); timer = null; render(input.value, runSearch(input.value)); }
            if (results.length) {
                event.preventDefault();
                goTo(results[active >= 0 ? active : 0].entry);
            }
        } else if (event.key === 'Escape') {
            if (!list.hidden) {
                setOpen(false);
            } else {
                input.value = '';
                results = [];
                input.blur();
            }
        }
    });

    list.addEventListener('click', event => {
        const link = event.target.closest('.search-result');
        if (!link) return;
        event.preventDefault();
        goTo(results[Number(link.dataset.i)].entry);
    });

    document.addEventListener('click', event => {
        if (!box.contains(event.target)) setOpen(false);
    });

    // Горячие клавиши: «/» или Ctrl/Cmd+K
    document.addEventListener('keydown', event => {
        const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable;
        const slash = event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey;
        const ctrlK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
        if (!slash && !ctrlK) return;
        event.preventDefault();
        if (window.innerWidth <= 900) document.getElementById('sidebar').classList.add('open');
        input.focus();
        input.select();
    });
}

initSearch();
