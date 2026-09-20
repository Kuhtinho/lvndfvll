const DAY = 86400000;
const HOUR = 3600000;
const MINUTE = 60000;
const SECOND = 1000;

const UNITS = [
  ["days", "DAYS"],
  ["hours", "HRS"],
  ["minutes", "MIN"],
  ["seconds", "SEC"],
];

function pad(value) {
  return String(value).padStart(2, "0");
}

function warsawMidnight(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const utc = Date.UTC(year, month - 1, day, 0, 0, 0);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(utc));
  const get = (type) => Number(parts.find((part) => part.type === type).value);
  const asUTC = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );
  return utc - (asUTC - utc);
}

function remainingParts(target, now) {
  let diff = target - now;
  if (diff <= 0) {
    return null;
  }

  const days = Math.floor(diff / DAY);
  diff %= DAY;
  const hours = Math.floor(diff / HOUR);
  diff %= HOUR;
  const minutes = Math.floor(diff / MINUTE);
  diff %= MINUTE;
  const seconds = Math.floor(diff / SECOND);
  return { days, hours, minutes, seconds };
}

function buildCountdown(el) {
  if (el.querySelector("[data-unit]")) {
    return;
  }

  const featured = el.classList.contains("countdown-featured");
  el.innerHTML = UNITS.map(([unit, label]) => {
    const pulse = featured && unit === "seconds" ? " countdown-seconds" : "";
    return `<div class="countdown-unit${pulse}">
      <span class="countdown-value" data-unit="${unit}">00</span>
      <span class="countdown-label">${label}</span>
    </div>`;
  }).join("");
}

function renderCountdown(el, parts) {
  if (!parts) {
    el.classList.add("is-live");
    el.innerHTML = '<span class="countdown-live">OUT NOW</span>';
    return;
  }

  UNITS.forEach(([unit]) => {
    const node = el.querySelector(`[data-unit="${unit}"]`);
    if (node) {
      node.textContent = pad(parts[unit]);
    }
  });
}

function initCountdowns() {
  const targets = [...document.querySelectorAll("[data-release]")].map((el) => {
    buildCountdown(el);
    return {
      el,
      at: warsawMidnight(el.dataset.release),
    };
  });

  const tick = () => {
    const now = Date.now();
    targets.forEach((item) => {
      if (!item.el.classList.contains("is-live")) {
        renderCountdown(item.el, remainingParts(item.at, now));
      }
    });
  };

  tick();
  setInterval(tick, 1000);
}

initCountdowns();
