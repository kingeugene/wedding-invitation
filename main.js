    // --------- Smooth scroll buttons ----------
    const toInvitation = document.getElementById("toInvitation");
    const toNext = document.getElementById("toNext");
    const invitation = document.getElementById("invitation");

    function scrollToEl(el){
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
}
    toInvitation?.addEventListener("click", () => scrollToEl(invitation));
    toNext?.addEventListener("click", () => scrollToEl(invitation));

    // --------- Parallax hero background ----------
    const heroBg = document.getElementById("heroBg");
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function onScrollParallax(){
    if (!heroBg || prefersReduced) return;
    const y = window.scrollY || 0;
    // subtle, smooth
    heroBg.style.transform = `translate3d(0, ${y * 0.18}px, 0) scale(1.06)`;
}
    window.addEventListener("scroll", onScrollParallax, { passive: true });
    onScrollParallax();

    // --------- Fade-in on scroll ----------
    const observer = new IntersectionObserver((entries) => {
    for (const e of entries){
    if (e.isIntersecting) e.target.classList.add("is-visible");
}
}, { threshold: 0.12 });

    document.querySelectorAll(".fade-in").forEach(el => observer.observe(el));

    // --------- Countdown ----------
    // Wedding date: 15 June 2025 (local time)
    const weddingDate = new Date("2026-06-05T14:00:00");
    const cdTitle = document.getElementById("cdTitle");
    const cdD = document.getElementById("cdD");
    const cdH = document.getElementById("cdH");
    const cdM = document.getElementById("cdM");
    const cdS = document.getElementById("cdS");

    function pad(n){ return String(n).padStart(2, "0"); }

    function tick(){
    const now = new Date();
    const diff = weddingDate - now;

    if (diff <= 0){
    cdTitle.textContent = "До нашого весілля залишилось";
    cdD.textContent = "00";
    cdH.textContent = "00";
    cdM.textContent = "00";
    cdS.textContent = "00";
    cdTitle.textContent = "Сьогодні наш день!";
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

    // --------- RSVP form (localStorage demo + optional send) ----------
    const form = document.getElementById("rsvpForm");
    const toast = document.getElementById("toast");

    function showToast(msg, ok=true){
    toast.textContent = msg;
    toast.style.borderColor = ok ? "rgba(0,128,128,.25)" : "rgba(180,40,40,.25)";
    toast.style.background = ok ? "rgba(0,128,128,.10)" : "rgba(180,40,40,.10)";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 5200);
}

    const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSeTVcdPcaqnSALkWBBJJHgOvf5zSC30QC7ByTay62opTXcGSA/formResponse";

    // 2) встав сюди entry IDs з твоєї форми
    const ENTRY_NAME = "entry.282958504";
    const ENTRY_ATTEND = "entry.1493540590";
    const ENTRY_DRINKS = "entry.1651672071";
    const ENTRY_DIET = "entry.415427113";

    async function sendToGoogleForm({ name, attend, drinks, diet }) {
    const data = new URLSearchParams();
    data.append(ENTRY_NAME, name);
    data.append(ENTRY_ATTEND, attend === "yes" ? "Так" : "Ні");
    data.append(ENTRY_DRINKS, drinks || "");
    data.append(ENTRY_DIET, diet || "");

    await fetch(GOOGLE_FORM_ACTION, {
    method: "POST",
    mode: "no-cors",
    headers: {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
},
    body: data.toString(),
});
}


    form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const name = (fd.get("name") || "").toString().trim();
    const attend = (fd.get("attend") || "").toString();
    const drinks = (fd.get("drinks") || "").toString().trim();
    const diet = (fd.get("diet") || "").toString().trim();

    if (!name) return showToast("Будь ласка, введіть ім’я.", false);
    if (!attend) return showToast("Оберіть відповідь щодо присутності.", false);

    try {
    await sendToGoogleForm({ name, attend, drinks, diet });
    showToast("Дякуємо! Відповідь надіслано 🤍");
    form.reset();
} catch (err) {
    showToast("Не вдалося надіслати. Спробуйте ще раз.", false);
}
});