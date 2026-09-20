const DAY = 86400000;
const HOUR = 3600000;
const MINUTE = 60000;
const SECOND = 1000;

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

function renderCountdown(el, parts) {
  if (!parts) {
    el.classList.add("is-live");
    el.innerHTML = '<span class="countdown-live">OUT NOW</span>';
    return;
  }

  const set = (unit, value) => {
    const node = el.querySelector(`[data-unit="${unit}"]`);
    if (node) {
      node.textContent = pad(value);
    }
  };

  set("days", parts.days);
  set("hours", parts.hours);
  set("minutes", parts.minutes);
  set("seconds", parts.seconds);
}

function initCountdowns() {
  const targets = [...document.querySelectorAll("[data-release]")].map((el) => ({
    el,
    at: warsawMidnight(el.dataset.release),
  }));

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
