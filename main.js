import {GUESTS} from './constants.js';

// --------- Smooth scroll buttons ----------
const toInvitation = document.getElementById('toInvitation');
const toNext = document.getElementById('toNext');
const invitation = document.getElementById('invitation');

function scrollToEl(el) {
    el?.scrollIntoView({behavior: 'smooth', block: 'start'});
}

toInvitation?.addEventListener('click', () => scrollToEl(invitation));
toNext?.addEventListener('click', () => scrollToEl(invitation));

// --------- Parallax hero background ----------
const heroBg = document.getElementById('heroBg');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function onScrollParallax() {
    if (!heroBg || prefersReduced) return;
    const y = window.scrollY || 0;
    // subtle, smooth
    heroBg.style.transform = `translate3d(0, ${y * 0.18}px, 0) scale(1.06)`;
}

window.addEventListener('scroll', onScrollParallax, {passive: true});
onScrollParallax();

// --------- Fade-in on scroll ----------
const observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
        if (e.isIntersecting) e.target.classList.add('is-visible');
    }
}, {threshold: 0.12});

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// --------- Countdown ----------
const weddingDate = new Date('2026-06-05T14:00:00');
const cdTitle = document.getElementById('cdTitle');
const cdD = document.getElementById('cdD');
const cdH = document.getElementById('cdH');
const cdM = document.getElementById('cdM');
const cdS = document.getElementById('cdS');

function pad(n) {
    return String(n).padStart(2, '0');
}

function tick() {
    const now = new Date();
    const diff = weddingDate - now;

    if (diff <= 0) {
        cdTitle.textContent = 'До нашого весілля залишилось';
        cdD.textContent = '00';
        cdH.textContent = '00';
        cdM.textContent = '00';
        cdS.textContent = '00';
        cdTitle.textContent = 'Сьогодні наш день!';
        return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    cdD.textContent = pad(days);
    cdH.textContent = pad(hours);
    cdM.textContent = pad(minutes);
    cdS.textContent = pad(seconds);
}

tick();
setInterval(tick, 1000);

// --------- RSVP form (chips by id + Google Form) ----------
const form = document.getElementById('rsvpForm');
const toast = document.getElementById('toast');
const guestChips = document.getElementById('guestChips');
const guestError = document.getElementById('guestError');
const noSelectedInfo = document.getElementById('noSelectedInfo');
const submitBtn = document.getElementById('submitBtn');
const drinksChips = document.getElementById('drinksChips');
const dietEl = document.getElementById('diet');

// Drinks chips options
const DRINK_NONE = 'Не вживаю алкоголь';
const DRINK_OPTIONS = [
    'Вино (червоне)',
    'Вино (біле)',
    'Просекко / ігристе',
    'Пиво',
    'Віскі',
    'Горілка',
    'Джин / тонік',
    DRINK_NONE,
];
const selectedDrinks = new Set();

function showToast(msg, ok = true) {
    toast.textContent = msg;
    toast.style.borderColor = ok ? 'rgba(0,128,128,.25)' : 'rgba(180,40,40,.25)';
    toast.style.background = ok ? 'rgba(0,128,128,.10)' : 'rgba(180,40,40,.10)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 5200);
}

const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSeTVcdPcaqnSALkWBBJJHgOvf5zSC30QC7ByTay62opTXcGSA/formResponse';

// Google Form entries mapping
const ENTRY_ATTENDING = 'entry.282958504'; // обрані
const ENTRY_NOT_ATTENDING = 'entry.438929284'; // не обрані
const ENTRY_DRINKS = "entry.1651672071";
const ENTRY_DIET = "entry.415427113";

// Get id and guests list
const id = new URLSearchParams(location.search).get('id');
const allGuests = id ? GUESTS[id] : undefined;
const selected = new Set(Array.isArray(allGuests) ? allGuests : []);

function updateZeroInfo() {
    if (!noSelectedInfo) return;
    const cnt = selected.size;
    noSelectedInfo.style.display = cnt === 0 ? 'block' : 'none';
}

function renderChips() {
    if (!guestChips) return;
    guestChips.innerHTML = '';
    if (!Array.isArray(allGuests)) return;
    for (const name of allGuests) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chip';
        btn.textContent = name;
        btn.setAttribute('aria-pressed', selected.has(name) ? 'true' : 'false');
        btn.dataset.name = name;
        btn.addEventListener('click', () => {
            if (selected.has(name)) selected.delete(name); else selected.add(name);
            btn.setAttribute('aria-pressed', selected.has(name) ? 'true' : 'false');
            updateZeroInfo();
        });
        guestChips.appendChild(btn);
    }
}

function disableSubmit(disabled) {
    if (!submitBtn) return;
    submitBtn.disabled = !!disabled;
    submitBtn.classList.toggle('secondary', !!disabled);
}

// ----- Drinks chips rendering & logic -----
function renderDrinkChips() {
    if (!drinksChips) return;
    drinksChips.innerHTML = '';
    for (const opt of DRINK_OPTIONS) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chip';
        btn.textContent = opt;
        btn.setAttribute('aria-pressed', selectedDrinks.has(opt) ? 'true' : 'false');
        btn.addEventListener('click', () => {
            if (opt === DRINK_NONE) {
                // Toggle NONE; when turning on, clear other selections
                if (selectedDrinks.has(DRINK_NONE)) {
                    selectedDrinks.delete(DRINK_NONE);
                } else {
                    selectedDrinks.clear();
                    selectedDrinks.add(DRINK_NONE);
                }
            } else {
                if (selectedDrinks.has(opt)) {
                    selectedDrinks.delete(opt);
                } else {
                    selectedDrinks.add(opt);
                    // Ensure NONE is off
                    selectedDrinks.delete(DRINK_NONE);
                }
            }
            // Re-render to update states consistently
            renderDrinkChips();
        });
        drinksChips.appendChild(btn);
    }
}

// Init state
if (!id || !Array.isArray(allGuests)) {
    if (guestError) guestError.style.display = 'block';
    disableSubmit(true);
} else {
    renderChips();
    updateZeroInfo();
}
// Init drink chips regardless of id (it's independent and optional)
renderDrinkChips();

async function sendToGoogleForm({attendingStr, notAttendingStr, drinks, diet}) {
    const data = new URLSearchParams();
    data.append(ENTRY_ATTENDING, attendingStr);
    data.append(ENTRY_NOT_ATTENDING, notAttendingStr);
    data.append(ENTRY_DRINKS, drinks || "");
    data.append(ENTRY_DIET, diet || "");

    await fetch(GOOGLE_FORM_ACTION, {
        method: 'POST',
        mode: 'no-cors',
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
        body: data.toString(),
    });
}

form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!id || !Array.isArray(allGuests)) {
        showToast('Ми не змогли визначити список гостей. Будь ласка, відкрийте форму за посиланням із запрошення.', false);
        return;
    }

    const attending = allGuests.filter(n => selected.has(n));
    const notAttending = allGuests.filter(n => !selected.has(n));
    const attendingStr = attending.join(', ');
    const notAttendingStr = notAttending.join(', ');
    let drinks = '';
    if (selectedDrinks.size > 0) {
        drinks = selectedDrinks.has(DRINK_NONE)
            ? DRINK_NONE
            : Array.from(selectedDrinks).join(', ');
    }
    const diet = (dietEl?.value || '').trim();

    try {
        await sendToGoogleForm({ attendingStr, notAttendingStr, drinks, diet });
        showToast('Дякуємо! Ми отримали вашу відповідь 🤍');
        if (dietEl) dietEl.value = '';
    } catch (err) {
        showToast('Не вдалося надіслати. Спробуйте ще раз.', false);
    }
});