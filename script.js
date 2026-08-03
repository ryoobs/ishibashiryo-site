const NAV = [
  { key: "home", label: "Home" },
  { key: "original", label: "Original" },
  { key: "movie", label: "Movie paint" },
  { key: "about", label: "About" },
];

let works = [];
let siteInfo = {};

async function loadData() {
  const [worksRes, siteRes] = await Promise.all([
    fetch("data/works.json"),
    fetch("data/site.json"),
  ]);
  const worksData = await worksRes.json();
  works = (worksData.items || []).map((w, i) => ({ ...w, _index: i }));
  siteInfo = await siteRes.json();
}

function categoryLabel(cat) {
  return { Work: "Work", Original: "Original", Movie: "Movie paint" }[cat] || cat;
}

function renderNav(activeKey) {
  const nav = document.getElementById("nav");
  nav.innerHTML = NAV.map(
    (n) =>
      `<button data-route="${n.key}" class="${activeKey === n.key ? "active" : ""}">${n.label}</button>`
  ).join("");
  nav.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      location.hash = `#/${btn.dataset.route}`;
    });
  });
}

function cardHtml(w) {
  const badge = w.images.length > 1 ? `<span class="badge">${w.images.length}枚</span>` : "";
  return `
    <button class="card" data-id="${w._index}">
      <img src="${w.images[0]}" alt="${w.title}" loading="lazy" />
      ${badge}
      <div class="overlay"><span>${w.title}</span></div>
    </button>`;
}

function renderGrid(items, emptyText) {
  if (items.length === 0) return `<div class="empty">${emptyText}</div>`;
  return `<div class="grid">${items.map(cardHtml).join("")}</div>`;
}

function attachCardEvents(root) {
  root.querySelectorAll(".card").forEach((el) => {
    el.addEventListener("click", () => {
      location.hash = `#/work/${el.dataset.id}`;
    });
  });
}

function renderHome() {
  renderNav("home");
  const items = works.filter((w) => w.category === "Work");
  document.getElementById("main").innerHTML = `
    <section class="hero">
      <h1 class="fd">イラストレーター<br />石橋瞭のポートフォリオ</h1>
      <p>${siteInfo.bio || ""}</p>
    </section>
    ${renderGrid(items, "仕事の絵はまだ登録されていません。")}
  `;
  attachCardEvents(document.getElementById("main"));
}

function renderCategoryPage(category, title, emptyText) {
  renderNav(category === "Original" ? "original" : "movie");
  const items = works.filter((w) => w.category === category);
  document.getElementById("main").innerHTML = `
    <section style="padding-top:56px;">
      <h2 class="fd" style="font-size:1.5rem;margin-bottom:32px;">${title}</h2>
      ${renderGrid(items, emptyText)}
    </section>
  `;
  attachCardEvents(document.getElementById("main"));
}

function renderAbout() {
  renderNav("about");
  document.getElementById("main").innerHTML = `
    <section class="about">
      <h2 class="fd">About</h2>
      <p class="bio">${siteInfo.bio || ""}</p>
      <div class="contact">
        <p>Email: ${siteInfo.email || ""}</p>
        <p>Instagram: ${siteInfo.instagram || ""}</p>
        <p>Store: ${siteInfo.store || ""}</p>
      </div>
    </section>
  `;
}

function renderDetail(id) {
  const w = works.find((x) => String(x._index) === String(id));
  if (!w) {
    location.hash = "#/home";
    return;
  }
  renderNav(w.category === "Work" ? "home" : w.category === "Original" ? "original" : "movie");
  const backRoute = w.category === "Work" ? "home" : w.category === "Original" ? "original" : "movie";
  document.getElementById("main").innerHTML = `
    <section class="detail">
      <button class="back-link" data-route="${backRoute}">← 一覧へ戻る</button>
      <h2 class="fd">${w.title}</h2>
      <p class="meta">${categoryLabel(w.category)}${w.year ? " · " + w.year : ""}</p>
      ${w.images.map((src) => `<img src="${src}" alt="${w.title}" />`).join("")}
      ${w.description ? `<p class="description">${w.description}</p>` : ""}
    </section>
  `;
  document.querySelector(".back-link").addEventListener("click", (e) => {
    location.hash = `#/${e.target.dataset.route}`;
  });
}

function route() {
  const hash = location.hash.replace(/^#\//, "") || "home";
  const [page, id] = hash.split("/");
  window.scrollTo(0, 0);
  if (page === "home") renderHome();
  else if (page === "original") renderCategoryPage("Original", "Original", "オリジナル作品はまだ登録されていません。");
  else if (page === "movie") renderCategoryPage("Movie", "Movie paint", "映画イラストはまだ登録されていません。");
  else if (page === "about") renderAbout();
  else if (page === "work" && id) renderDetail(id);
  else renderHome();
}

document.getElementById("logo").addEventListener("click", () => {
  location.hash = "#/home";
});

window.addEventListener("hashchange", route);

loadData().then(route);
