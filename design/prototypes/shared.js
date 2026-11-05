// Shared by the three Little Days prototypes. Design review only: no network requests, and
// every place, time and weather value below is sample data.
const params = new URLSearchParams(location.search);
const LANG = params.get("lang") === "zh" ? "zh" : "en";
document.documentElement.lang = LANG === "zh" ? "zh-CN" : "en";

const ZH = {
  "Prototype": "原型", "Sample data": "示例数据", "Sample places, not real results": "示例地点，并非真实结果",
  "Little adventures, close to home.": "发现身边的小小冒险",
  "Start typing an address": "开始输入地址", "Clear": "清除", "Back": "返回", "Address or place": "地址或地点",
  "Use my location": "使用我的位置", "Try an example address": "试试示例地址", "Try an example": "试试示例",
  "Explore nearby": "探索附近", "Searching…": "搜索中…", "Filters": "筛选", "Close": "关闭", "Reset": "重置",
  "Explore": "探索", "Weather": "天气", "My Places": "我的地点", "My week": "我的一周",
  "All": "全部", "Nature": "自然", "Everyday Life": "日常生活", "Community Helpers": "社区帮手",
  "Art & Culture": "艺术与文化", "Animals & Wildlife": "动物与野生动物", "Movement": "运动",
  "Family": "家庭", "Classroom": "班级", "Ages": "年龄", "Mixed 2–6": "2–6 岁混龄", "Under 2": "2 岁以下", "2–3": "2–3 岁", "4–6": "4–6 岁",
  "Who's exploring": "谁来探索", "Walking time (minutes)": "步行时间（分钟）", "What would you like to explore?": "想探索什么？",
  "Which day are you planning for?": "你想安排哪一天？", "Setting": "环境", "Indoors": "室内", "Outdoors": "户外",
  "Explored": "已探索", "Not explored yet": "尚未探索", "Temperature": "温度",
  "Today": "今天", "Fri": "周五", "Sat": "周六", "Sun": "周日", "Mon": "周一", "Tue": "周二", "Wed": "周三",
  "Nice for exploring": "适合外出探索", "More weather": "更多天气", "Example address": "示例地址",
  "View details": "查看详情", "Save": "保存", "Saved": "已保存", "Add to my week": "加入我的一周", "Open in Google Maps": "在 Google 地图中打开",
  "Little Days idea:": "Little Days 小点子：", "Little Days ideas": "Little Days 的建议",
  "What children might notice": "孩子可能会注意到", "An activity to try": "可以试试的活动", "RootMap activity": "RootMap 活动",
  "walking times from Google, ideas from Little Days": "步行时间来自 Google，建议来自 Little Days",
  "A Google walking route isn't a check that the way suits young children. Before you go, look for busy road crossings, water, construction, closed or restricted areas, and the weather, and plan enough adults to supervise.": "Google 的步行路线并不代表这条路适合幼儿。出发前请留意繁忙路口、水边、施工、封闭或限制区域以及天气，并安排足够的成人看护。",
  "Google walking estimates may not reflect the time needed when accompanying young children. Check crossings and the route before visiting.": "Google 的步行时间估算可能无法反映带着幼儿同行所需的时间。出发前请检查路口和路线。",
  "Access not verified. Contact before a classroom visit.": "开放情况未经核实。班级到访前请先联系。",
  "All searches six kinds of places, so it takes a little longer.": "“全部”会搜索六类地点，所以需要稍长一点时间。",
  "This view isn't part of the prototype": "此页面不在原型范围内",
  "Prototype only: nothing was saved": "仅为原型：没有保存任何内容",
  "Prototype only: no link is opened": "仅为原型：不会打开链接",
  "Prototype only: the browser would ask for your location here": "仅为原型：此处浏览器会请求你的位置",
  "Google's own screen on phones, shown here with sample suggestions.": "这是 Google 在手机上的自带页面，此处显示示例建议。",
  "Google logo stays here": "此处保留 Google 标志", "Sample drawing, not a Google map": "示例绘图，并非 Google 地图",
  "Sample map · Google logo stays here": "示例地图 · 此处保留 Google 标志", "Places to explore with children": "寻找适合带孩子探索的地方", "Start": "起点", "min": "分钟", "min walk": "分钟步行", "No places match these filters.": "没有符合这些筛选条件的地点。", "Clear filters": "清除筛选",
};
const t = (text) => (LANG === "zh" && ZH[text]) || text;
const walkLabel = (n) => (LANG === "zh" ? `步行 ${n} 分钟` : `${n} min walk`);
const placesLabel = (n) => (LANG === "zh" ? `${n} 个地点` : `${n} ${n === 1 ? "place" : "places"}`);
const showLabel = (n) => (LANG === "zh" ? `查看 ${n} 个地点` : `Show ${n} ${n === 1 ? "place" : "places"}`);
const roundTrip = (n) => (LANG === "zh" ? `往返约 ${n * 2} 分钟` : `About ${n * 2} min round trip`);
const pick = (pair) => pair[LANG === "zh" ? 1 : 0];

const CATEGORIES = [
  { key: "nature", label: "Nature", photo: "bark-rubbing" },
  { key: "everyday", label: "Everyday Life", photo: "i-spy-a-color" },
  { key: "helpers", label: "Community Helpers", photo: "whats-that-sound" },
  { key: "art", label: "Art & Culture", photo: "paper-collage" },
  { key: "animals", label: "Animals & Wildlife", photo: "duck-walk" },
  { key: "movement", label: "Movement", photo: "rolling-in-the-leaves" },
];
const categoryLabel = (key) => t(CATEGORIES.find((c) => c.key === key).label);
const photoSrc = (id) => `../../images/activities/${id}-480.webp`;

const EXAMPLE = "221 Washington Street, Newton, MA 02458";
const SUGGESTIONS = [
  ["221 Washington Street", "Newton, MA 02458, USA"],
  ["Newton Centre", "Newton, MA, USA"],
  ["Newton Free Library", "Homer Street, Newton, MA, USA"],
];

// Sample data for review. x and y are positions on the drawn map.
const PLACES = [
  { id: 1, name: "Washington Street Bakery", category: "everyday", walk: 6, miles: 0.3, setting: "indoors", x: 470, y: 392, address: "Washington Street, Newton, MA",
    idea: ["Smell the bread, and watch how a neighborhood shop starts its day.", "闻一闻面包香，看看社区小店的一天如何开始。"],
    notice: [["Warm smells drifting out", "飘出来的温暖香味"], ["Round, long and braided shapes", "圆的、长的、编起来的形状"], ["People waiting for a turn", "排队等候的人们"]],
    photo: "spreading-toast", activity: ["Spreading on Toast", "在吐司上涂抹"] },
  { id: 2, name: "Farlow Park", category: "nature", walk: 8, miles: 0.4, setting: "outdoors", x: 318, y: 352, address: "Park Street, Newton, MA",
    idea: ["Feel rough and smooth bark, then make a rubbing to bring back.", "摸一摸粗糙和光滑的树皮，再拓印一张带回去。"],
    notice: [["Leaves of different shapes and colors", "形状和颜色各异的叶子"], ["Rough and smooth bark", "粗糙和光滑的树皮"], ["Birdsong, wind and footsteps", "鸟鸣、风声和脚步声"]],
    photo: "bark-rubbing", activity: ["Bark Rubbing", "树皮拓印"] },
  { id: 3, name: "Fire Station 3", category: "helpers", walk: 11, miles: 0.5, setting: "outdoors", x: 505, y: 498, address: "Washington Street, Newton, MA",
    idea: ["From the sidewalk, listen for the sounds of people at work.", "站在人行道上，听一听人们工作的声音。"],
    notice: [["Big doors and bright colors", "大门和鲜艳的颜色"], ["Signs and uniforms", "标志和制服"], ["Sounds that mean \"help is coming\"", "代表“帮助来了”的声音"]],
    photo: "whats-that-sound", activity: ["What's That Sound?", "那是什么声音？"] },
  { id: 4, name: "Hyde Playground", category: "movement", walk: 12, miles: 0.6, setting: "outdoors", x: 420, y: 312, address: "Hyde Street, Newton, MA",
    idea: ["Notice what spins, slides and swings, and how bodies feel after running.", "看看什么会转、会滑、会荡，跑完后身体有什么感觉。"],
    notice: [["High and low places", "高处和低处"], ["Things that spin, slide or swing", "会转、会滑、会荡的东西"], ["Waiting for a turn", "等待轮到自己"]],
    photo: "statue-game", activity: ["Statue Game", "木头人"] },
  { id: 5, name: "Newton Free Library", category: "art", walk: 14, miles: 0.7, setting: "indoors", x: 300, y: 505, address: "Homer Street, Newton, MA",
    idea: ["Find a quiet corner, and listen for the small sounds of a library.", "找一个安静的角落，听听图书馆里细小的声音。"],
    notice: [["Quiet voices and turning pages", "轻声细语和翻书声"], ["Tall shelves and low ones", "高书架和矮书架"], ["Pictures on covers", "封面上的图画"]],
    photo: "paper-collage", activity: ["Paper Collage", "纸张拼贴"] },
  { id: 6, name: "Feather & Fin Pet Shop", category: "animals", walk: 15, miles: 0.7, setting: "indoors", x: 372, y: 538, address: "Centre Street, Newton, MA",
    idea: ["Watch quietly: how do different animals move, eat and rest?", "安静地观察：不同的动物怎样活动、进食和休息？"],
    notice: [["Fur, feathers and scales", "皮毛、羽毛和鳞片"], ["How animals move", "动物怎样活动"], ["Small sounds", "细小的声音"]],
    photo: "duck-walk", activity: ["Duck Walk", "鸭子走路"] },
];
const DAYS = [["Today", "☀️", 61], ["Fri", "⛅", 58], ["Sat", "🌧️", 52], ["Sun", "☀️", 55], ["Mon", "☀️", 57], ["Tue", "⛅", 54], ["Wed", "☀️", 56]];

const state = {
  location: null, searched: false, interest: "all", mode: params.get("mode") === "classroom" ? "classroom" : "family",
  ages: "Mixed 2–6", minutes: 15, setting: "all", explored: "all", unit: "F", day: 0, saved: new Set(), selected: null,
};
const DEFAULTS = { interest: "all", mode: "family", ages: "Mixed 2–6", minutes: 15, setting: "all", explored: "all" };
let onChange = () => {};
const setRender = (render) => { onChange = render; };

function visiblePlaces() {
  return PLACES.filter((p) => (state.interest === "all" || p.category === state.interest)
    && p.walk <= state.minutes && (state.setting === "all" || p.setting === state.setting)
    && state.explored !== "explored");
}
const degrees = (f) => (state.unit === "C" ? Math.round((f - 32) * 5 / 9) : f);
const weatherLine = () => `☀️ ${degrees(DAYS[state.day][2])}° · ${t("Nice for exploring")}`;
const filterCount = () => Object.keys(DEFAULTS).filter((k) => state[k] !== DEFAULTS[k]).length;
function askSummary() {
  return [t(state.mode === "family" ? "Family" : "Classroom"), t(state.ages), walkLabel(state.minutes)].join(" · ");
}

// --- Icons ---
const ICONS = {
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15 9-2 4-4 2 2-4z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5a5.5 5.5 0 0 0 1-8.9z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  locate: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  filters: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  chevron: '<path d="m6 15 6-6 6 6"/>',
  back: '<path d="M20 12H5M11 6l-6 6 6 6"/>',
  pin: '<path d="M12 21S5 13.4 5 9a7 7 0 1 1 14 0c0 4.4-7 12-7 12Z"/><circle cx="12" cy="9" r="2.3"/>',
  walk: '<circle cx="13" cy="4.5" r="1.8"/><path d="m9 21 2.5-6-2-3 1-4.5 3 1.5 2 3h2.5M6.5 12l2-4.5 2.5-.5M13.5 15l1.5 6"/>',
};
const icon = (name, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;
const SEARCH_PATH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"/></svg>';
const CLEAR_PATH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm3.6-12L12 10.6 8.4 8 8 8.4 10.6 12 8 15.6l.4.4 3.6-2.6 3.6 2.6.4-.4-2.6-3.6L16 8.4z"/></svg>';
const brand = `<a class="brand" href="#" aria-label="Little Days"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="leaf" d="M12 13C7.6 13 4.5 9.7 4.5 5.1 9.3 5.1 12 8.5 12 13Z"/><path class="leaf" d="M12 13c4.4 0 7.5-3.3 7.5-7.9-4.8 0-7.5 3.4-7.5 7.9Z"/><path class="stem" d="M12 21v-8.2"/></svg><span>Little Days</span></a>`;
const langButton = () => `<button class="lang" data-lang type="button">${LANG === "zh" ? "EN" : "中文"}</button>`;
const protoTag = () => `<span class="tag-proto">${t("Prototype")}</span>`;
const TAB_ROWS = [["Explore", "compass"], ["Weather", "sun"], ["My Places", "heart"], ["My week", "calendar"]];
const tabButtons = () => TAB_ROWS.map(([label, name], i) => `<button type="button" data-tab ${i ? "" : 'aria-current="page"'}>${icon(name)}<span>${t(label)}</span></button>`).join("");
const topTabs = () => `<nav class="top-tabs" aria-label="Sections">${TAB_ROWS.map(([label], i) => `<button type="button" data-tab ${i ? "" : 'aria-current="page"'}>${t(label)}</button>`).join("")}</nav>`;
function mountTabs() {
  const nav = document.createElement("nav");
  nav.className = "tabs";
  nav.setAttribute("aria-label", "Sections");
  nav.innerHTML = tabButtons();
  document.body.append(nav);
}

function toast(text) {
  document.querySelector(".toast")?.remove();
  const box = document.createElement("p");
  box.className = "toast";
  box.setAttribute("role", "status");
  box.textContent = text;
  document.body.append(box);
  setTimeout(() => box.remove(), 2600);
}

// --- The stand-in for Google's address field ---
function suggestionRows() {
  return SUGGESTIONS.map(([main, rest], i) => `<button class="gf-row" type="button" data-suggest="${i}"><b>${main}</b><span>${rest}</span></button>`).join("");
}
function mountField(host) {
  host.innerHTML = `<div class="gf" role="search">
    <span class="gf-icon">${SEARCH_PATH}</span>
    <input type="text" autocomplete="off" aria-label="${t("Address or place")}" placeholder="${t("Start typing an address")}">
    <button class="gf-clear" type="button" aria-label="${t("Clear")}" hidden>${CLEAR_PATH}</button>
    <div class="gf-list" hidden></div></div>`;
  const input = host.querySelector("input");
  const clear = host.querySelector(".gf-clear");
  const list = host.querySelector(".gf-list");
  const choose = (i) => {
    closeFull();
    list.hidden = true;
    const [main, rest] = SUGGESTIONS[i];
    setAddress(i === 0 ? EXAMPLE : `${main}, ${rest}`, false);
  };
  list.addEventListener("click", (event) => {
    const row = event.target.closest("[data-suggest]");
    if (row) choose(+row.dataset.suggest);
  });
  input.addEventListener("input", () => {
    clear.hidden = !input.value;
    if (!input.value) { list.hidden = true; return; }
    if (matchMedia("(max-width: 450px)").matches) { openFull(input, choose); return; }
    list.innerHTML = `${suggestionRows()}<p class="gf-attr" translate="no">Google</p>`;
    list.hidden = false;
  });
  clear.addEventListener("click", () => {
    input.value = "";
    clear.hidden = true;
    input.focus();
  });
  input.value = state.location?.address || "";
  clear.hidden = !input.value;
}
function closeFull() { document.querySelector(".gf-full")?.remove(); }
function openFull(source, choose) {
  closeFull();
  const box = document.createElement("div");
  box.className = "gf-full";
  box.innerHTML = `<div class="gf-full-bar"><button class="gf-back" type="button" aria-label="${t("Back")}">${icon("back")}</button>
    <input type="text" autocomplete="off" aria-label="${t("Address or place")}" value="${source.value}">
    <button class="gf-clear" type="button" aria-label="${t("Clear")}">${CLEAR_PATH}</button></div>
    <div>${suggestionRows()}</div><p class="gf-attr" translate="no">Google</p>
    <p class="gf-note">${t("Google's own screen on phones, shown here with sample suggestions.")}</p>`;
  document.body.append(box);
  const input = box.querySelector("input");
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
  box.querySelector(".gf-back").addEventListener("click", () => { source.value = input.value; closeFull(); });
  box.querySelector(".gf-clear").addEventListener("click", () => { input.value = ""; input.focus(); });
  box.addEventListener("click", (event) => {
    const row = event.target.closest("[data-suggest]");
    if (row) choose(+row.dataset.suggest);
  });
}
function setAddress(address, example) {
  state.location = { address, example };
  document.querySelectorAll(".gf input").forEach((input) => { input.value = address; });
  document.querySelectorAll(".gf .gf-clear").forEach((button) => { button.hidden = false; });
  onChange("location");
}

// --- The drawn map ---
function mapWorld() {
  let roads = "";
  for (let x = -900; x <= 1700; x += 94) roads += `<path d="M${x} -900V1700"/>`;
  for (let y = -900; y <= 1700; y += 78) roads += `<path d="M-900 ${y}H1700"/>`;
  return `<rect x="-1200" y="-1200" width="3200" height="3200" fill="#EFEBDF"/>
    <g transform="rotate(-13 400 430)" stroke="#FBF9F3" stroke-width="5" fill="none">${roads}</g>
    <path d="M-900 150C-300 40 40 230 240 100S620-120 820-200 1500-260 1800-200V-900H-900Z" fill="#C9DDE3"/>
    <g fill="#D3E1BA">
      <path d="M262 318c38-22 86-18 106 8s8 70-26 84-84 8-100-20-10-54 20-72Z"/>
      <rect x="392" y="270" width="72" height="62" rx="14" transform="rotate(-13 428 300)"/>
      <path d="M620 560c70-30 150-16 176 30s-6 110-80 122-136-14-148-62 6-70 52-90Z"/>
      <path d="M-40 620c60-34 150-30 190 10s30 120-40 150-180 20-210-40 10-96 60-120Z"/>
      <path d="M900 120c70-30 170-16 200 40s-10 120-90 130-150-20-160-80 10-70 50-90Z"/>
      <path d="M-420 260c80-40 170-20 200 40s-20 130-100 140-160-30-170-90 20-70 70-90Z"/>
    </g>
    <path d="M300 346c12-8 28-6 34 4s0 22-12 26-26 0-30-10 0-14 8-20Z" fill="#C9DDE3"/>
    <path d="M-900 640C-300 560 120 500 400 430S1100 240 1700 120" fill="none" stroke="#E4DDC9" stroke-width="16"/>
    <path d="M-900 640C-300 560 120 500 400 430S1100 240 1700 120" fill="none" stroke="#FFFDF8" stroke-width="12"/>
    <path d="M330 -900C340 -300 300 200 340 620S420 1200 400 1700" fill="none" stroke="#FFFDF8" stroke-width="8"/>
    <g font-family="Nunito, system-ui, sans-serif" font-size="12" font-weight="600" fill="#8C897B">
      <text transform="translate(560 362) rotate(-13)">Washington St</text>
      <text transform="translate(120 498) rotate(-13)">Washington St</text>
      <text transform="translate(330 610) rotate(84)">Centre St</text>
      <text x="274" y="330" fill="#6E8450">Farlow Park</text>
    </g>`;
}
function pinMarkup(place, number, scale) {
  const on = state.selected === place.id;
  const r = (on ? 18 : 14) / scale;
  return `<g data-pin="${place.id}" role="button" tabindex="0" aria-label="${number}. ${place.name}">
    <circle cx="${place.x}" cy="${place.y}" r="${r + 8 / scale}" fill="transparent" stroke="none"/>
    <circle cx="${place.x}" cy="${place.y}" r="${r}" fill="${on ? "#26251F" : "#4B6B2E"}" stroke="#fff" stroke-width="${2.5 / scale}"/>
    <text x="${place.x}" y="${place.y}" dy=".35em" text-anchor="middle" fill="#fff" font-family="Nunito, sans-serif" font-weight="700" font-size="${(on ? 16 : 13) / scale}">${number}</text></g>`;
}
function drawMap(el, { zoom = 1, cx = 400, cy = 430, showPlaces = true, showStart = true, route = null, mark = true } = {}) {
  const w = el.clientWidth / zoom;
  const h = el.clientHeight / zoom;
  const list = showPlaces ? visiblePlaces() : [];
  const pins = list.map((place, i) => pinMarkup(place, i + 1, zoom)).join("");
  const line = route ? `<path d="M400 430L${route.x} 430 ${route.x} ${route.y}" fill="none" stroke="#4B6B2E" stroke-width="${5 / zoom}" stroke-linecap="round" stroke-linejoin="round"/>` : "";
  const start = showStart ? `<circle cx="400" cy="430" r="${9 / zoom}" fill="#26251F" stroke="#fff" stroke-width="${3 / zoom}"/>` : "";
  el.classList.add("draw-map");
  el.innerHTML = `<svg viewBox="${cx - w / 2} ${cy - h / 2} ${w} ${h}" role="img" aria-label="${t("Sample drawing, not a Google map")}">${mapWorld()}${line}${start}${route ? pinMarkup(route, "", zoom) : pins}</svg>
    ${mark ? `<span class="map-mark">${t("Sample drawing, not a Google map")}</span>` : ""}`;
}
function pinClicks(el, handler) {
  el.addEventListener("click", (event) => {
    const pin = event.target.closest("[data-pin]");
    if (pin) handler(+pin.dataset.pin);
  });
  el.addEventListener("keydown", (event) => {
    const pin = event.target.closest("[data-pin]");
    if (pin && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); handler(+pin.dataset.pin); }
  });
}

// --- Filters: the one place every secondary setting lives ---
function segment(name, options, value) {
  return `<div class="seg">${options.map(([v, label]) => `<label><input type="radio" name="${name}" value="${v}" ${String(v) === String(value) ? "checked" : ""}><span>${label}</span></label>`).join("")}</div>`;
}
function openFilters() {
  const dialog = sheet();
  const paint = () => {
    const count = visiblePlaces().length;
    dialog.innerHTML = `<div class="sheet-head"><h2 tabindex="-1" autofocus>${t("Filters")}</h2><button class="close" type="button" data-close aria-label="${t("Close")}">${icon("close")}</button></div>
    <form class="sheet-body">
      <fieldset class="f-group"><legend>${t("Who's exploring")}</legend>${segment("mode", [["family", t("Family")], ["classroom", t("Classroom")]], state.mode)}</fieldset>
      <fieldset class="f-group"><legend>${t("Ages")}</legend>${segment("ages", ["Mixed 2–6", "Under 2", "2–3", "4–6"].map((a) => [a, t(a)]), state.ages)}</fieldset>
      <fieldset class="f-group"><legend>${t("Walking time (minutes)")}</legend>${segment("minutes", [5, 10, 15, 20, 30].map((m) => [m, m]), state.minutes)}
        ${state.mode === "classroom" ? `<p class="f-note">${t("Google walking estimates may not reflect the time needed when accompanying young children. Check crossings and the route before visiting.")}</p>` : ""}</fieldset>
      <fieldset class="f-group"><legend>${t("What would you like to explore?")}</legend><div class="wrap-chips">${interestRadios()}</div>
        ${state.interest === "all" ? `<p class="f-note">${t("All searches six kinds of places, so it takes a little longer.")}</p>` : ""}</fieldset>
      ${state.location ? `<fieldset class="f-group"><legend>${t("Which day are you planning for?")}</legend><div class="scroll-x">${DAYS.map(([d, e, high], i) => `<label class="chip num"><input type="radio" name="day" value="${i}" ${i === state.day ? "checked" : ""}>${t(d)} ${e} ${degrees(high)}°</label>`).join("")}</div></fieldset>` : ""}
      <fieldset class="f-group"><legend>${t("Setting")}</legend>${segment("setting", [["all", t("All")], ["indoors", t("Indoors")], ["outdoors", t("Outdoors")]], state.setting)}</fieldset>
      <fieldset class="f-group"><legend>${t("Explored")}</legend>${segment("explored", [["all", t("All")], ["new", t("Not explored yet")], ["explored", t("Explored")]], state.explored)}</fieldset>
      <fieldset class="f-group"><legend>${t("Temperature")}</legend>${segment("unit", [["F", "°F"], ["C", "°C"]], state.unit)}</fieldset>
    </form>
    <div class="sheet-foot"><button class="btn-text" type="button" data-reset>${t("Reset")}</button><button class="btn btn-primary" type="button" data-close>${state.searched ? showLabel(count) : t("Close")}</button></div>`;
  };
  paint();
  dialog.addEventListener("change", (event) => {
    const { name, value } = event.target;
    state[name] = ["minutes", "day"].includes(name) ? +value : value;
    const top = dialog.querySelector(".sheet-body").scrollTop;
    paint();
    dialog.querySelector(".sheet-body").scrollTop = top;
    onChange("filters");
  });
  dialog.addEventListener("click", (event) => {
    if (!event.target.closest("[data-reset]")) return;
    Object.assign(state, DEFAULTS);
    paint();
    onChange("filters");
  });
  dialog.showModal();
}
function interestRadios() {
  const rows = [["all", "All"], ...CATEGORIES.map((c) => [c.key, c.label])];
  return rows.map(([key, label]) => `<label class="chip"><input type="radio" name="interest" value="${key}" ${state.interest === key ? "checked" : ""}>${t(label)}</label>`).join("");
}
function sheet() {
  document.querySelector("dialog.sheet-d")?.remove();
  const dialog = document.createElement("dialog");
  dialog.className = "sheet-d";
  document.body.append(dialog);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog || event.target.closest("[data-close]")) dialog.close();
  });
  dialog.addEventListener("close", () => dialog.remove());
  return dialog;
}

// --- Place details ---
function openPlace(id) {
  const place = PLACES.find((p) => p.id === id);
  const dialog = sheet();
  dialog.innerHTML = `<div class="sheet-head"><span class="meta" tabindex="-1" autofocus>${categoryLabel(place.category)} · ${t(place.setting === "indoors" ? "Indoors" : "Outdoors")}</span><button class="close" type="button" data-close aria-label="${t("Close")}">${icon("close")}</button></div>
  <div class="sheet-body">
    <h2 class="d-title">${place.name}</h2>
    <p class="meta d-sub">${place.address}</p>
    <div class="d-map" id="d-map"></div>
    <p class="meta"><b>${walkLabel(place.walk)}</b> · ${place.miles} mi${state.mode === "classroom" ? ` · ${roundTrip(place.walk)}` : ""}</p>
    <p class="d-remind">${t("A Google walking route isn't a check that the way suits young children. Before you go, look for busy road crossings, water, construction, closed or restricted areas, and the weather, and plan enough adults to supervise.")}</p>
    ${state.mode === "classroom" ? `<p class="class-note">${t("Access not verified. Contact before a classroom visit.")}</p>` : ""}
    <section class="d-section"><h3>${t("What children might notice")}</h3><ul>${place.notice.map((n) => `<li>${pick(n)}</li>`).join("")}</ul><p class="d-label">${t("Little Days ideas")}</p></section>
    <section class="d-section"><h3>${t("An activity to try")}</h3><div class="d-act"><img src="${photoSrc(place.photo)}" alt=""><p>${pick(place.activity)}<br><span class="d-label">${t("RootMap activity")}</span></p></div></section>
  </div>
  <div class="sheet-foot"><button class="btn-text" type="button" data-maps>${t("Open in Google Maps")}</button><button class="btn btn-primary" type="button" data-week>${t("Add to my week")}</button></div>`;
  dialog.addEventListener("click", (event) => {
    if (event.target.closest("[data-maps]")) toast(t("Prototype only: no link is opened"));
    if (event.target.closest("[data-week]")) toast(t("Prototype only: nothing was saved"));
  });
  dialog.showModal();
  drawMap(dialog.querySelector("#d-map"), { zoom: 0.8, cx: (400 + place.x) / 2, cy: (430 + place.y) / 2, route: place });
}

// Everything that behaves the same in all three prototypes.
document.addEventListener("click", (event) => {
  if (event.target.closest("[data-lang]")) {
    const next = new URLSearchParams(location.search);
    next.set("lang", LANG === "zh" ? "en" : "zh");
    if (state.searched) next.set("state", "results");
    else if (state.location) next.set("state", "location");
    location.search = next.toString();
  }
  if (event.target.closest("[data-tab]") && !event.target.closest("[aria-current]")) toast(t("This view isn't part of the prototype"));
  if (event.target.closest("[data-example]")) setAddress(EXAMPLE, true);
  if (event.target.closest("[data-locate]")) { toast(t("Prototype only: the browser would ask for your location here")); setAddress(EXAMPLE, true); }
  if (event.target.closest("[data-filters]")) openFilters();
  const details = event.target.closest("[data-open]");
  if (details) openPlace(+details.dataset.open);
  const save = event.target.closest("[data-save]");
  if (save) {
    const id = +save.dataset.save;
    if (state.saved.has(id)) state.saved.delete(id); else state.saved.add(id);
    onChange("save");
  }
});

const saveButton = (place) => `<button class="save" type="button" data-save="${place.id}" aria-pressed="${state.saved.has(place.id)}" aria-label="${t(state.saved.has(place.id) ? "Saved" : "Save")}: ${place.name}">${icon("heart")}</button>`;
const classLine = (place) => (state.mode === "classroom" ? `<p class="class-note">${roundTrip(place.walk)} · ${t("Access not verified. Contact before a classroom visit.")}</p>` : "");

// ?state=location|results and ?open=filters|place put a prototype straight into a state.
function startFromParams() {
  const wanted = params.get("state");
  if (wanted === "location" || wanted === "results") state.location = { address: EXAMPLE, example: true };
  if (wanted === "results") state.searched = true;
}
function openFromParams() {
  if (params.get("open") === "filters") openFilters();
  if (params.get("open") === "place") openPlace(2);
}
