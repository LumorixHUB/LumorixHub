import { invoke } from "@tauri-apps/api/core";


import "./styles.css";
import { open } from "@tauri-apps/plugin-dialog";
import { getLibrary, getInstallLabel, getExecutablePath, setExecutablePath } from "./library";

type Game = {
  name: string;
  category: string;
  icon: string;
  description: string;
  color: string;
  status: string;
};

const games: Game[] = [
  {
    name: "Lumora Wilds",
    category: "Safari · Açık Dünya",
    icon: "🐾",
    description: "6 kişilik ekibinle vahşi doğayı keşfet.",
    color: "safari",
    status: "Geliştiriliyor",
  },
  {
    name: "Lumorix City",
    category: "Şehir · Simülasyon",
    icon: "🏙️",
    description: "Kendi şehrini kur, geliştir ve yönet.",
    color: "city",
    status: "Yakında",
  },
  {
    name: "Bereketli Çiftlik",
    category: "Tarım · Hayvancılık",
    icon: "🌾",
    description: "Çiftliğini büyüt, kendi dünyanı oluştur.",
    color: "farm",
    status: "Yakında",
  },
];

const news = [
  { icon: "🌄", title: "Lumora Wilds geliştiriliyor", date: "Geliştirici günlüğü" },
  { icon: "🦌", title: "Yeni canlılar ve bölgeler", date: "Oyun dünyası" },
  { icon: "🏕️", title: "Kamp sistemi üzerinde çalışılıyor", date: "Gelecek özellikler" },
];

let activePage = "Ana Sayfa";
let selectedGame = "Lumora Wilds";
let searchTerm = "";


const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("#app elementi bulunamadı. index.html dosyasını kontrol et.");
}

function getLibraryId(gameName: string): string {
  const ids: Record<string, string> = {
    "Lumora Wilds": "lumora-wilds",
    "Lumorix City": "lumorix-city",
    "Bereketli Çiftlik": "bereketli-ciftlik",
  };
  return ids[gameName] ?? "";
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });
}

function render(): void {

  const visibleGames = games.filter((game) =>
    `${game.name} ${game.category}`.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  app!.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <button class="brand" data-page="Ana Sayfa" aria-label="LUMORIX HUB ana sayfa">
          <span class="brand-mark">L</span>
          <span class="brand-copy">
            <strong>LUMORIX <em>HUB</em></strong>
            <small>OYUNLARIN MERKEZİ</small>
          </span>
        </button>

        <nav class="topnav">
          ${["Ana Sayfa", "Oyunlar", "Mağaza", "Topluluk", "Destek"].map((page, index) => `
            <button class="nav-item ${activePage === page ? "active" : ""}" data-page="${page}">
              <span>${["⌂", "🎮", "▣", "♧", "?"][index]}</span>
              ${page}
            </button>
          `).join("")}
        </nav>

        <div class="user-area">
          <span class="online-dot"></span>
          <div class="avatar">P</div>
          <div class="user-copy"><strong>Oyuncu</strong><small>LUMORIX üyesi</small></div>
        </div>
      </header>

      <div class="layout">
        <aside class="sidebar">
          <div class="side-heading">OYUN KÜTÜPHANESİ <span>✦</span></div>
          <button class="side-link ${activePage === "Ana Sayfa" ? "selected" : ""}" data-page="Ana Sayfa">
            <span class="side-symbol">⌂</span> Ana Sayfa
          </button>
          <button class="side-link ${activePage === "Oyunlar" ? "selected" : ""}" data-page="Oyunlar">
            <span class="side-symbol">🎮</span> Tüm Oyunlar
          </button>

          <div class="side-heading second-heading">OYUNLARIM</div>
          ${games.slice(0, 3).map((game) => {
            const libraryGame = getLibrary().find((item) => item.name === game.name);
            const installLabel = libraryGame
              ? getInstallLabel(libraryGame.status)
              : "Yüklü değil";
            return `
              <button class="library-item ${selectedGame === game.name ? "library-active" : ""}" data-game="${game.name}">
                <span class="game-icon ${game.color}">${game.icon}</span>
                <span class="library-copy"><strong>${game.name}</strong><small>${installLabel}</small></span>
              </button>
            `;
          }).join("")}

          <div class="sidebar-bottom">
            <div class="mini-brand">LUMORIX <span>STUDIO</span></div>
            <p>Hayal et. Keşfet. Oyna.</p>
            <button class="side-link" data-page="Ayarlar">⚙️ &nbsp; Ayarlar</button>
          </div>
        </aside>

        <main class="main-content">
          ${activePage === "Ana Sayfa" ? `
            <section class="hero">
              <div class="hero-backdrop"></div>
              <div class="hero-content">
                <div class="eyebrow"><span></span> LUMORIX GAMER STUDIO SUNAR</div>
                <div class="hero-logo"><span>✦</span> LUMORA<br /><b>WILDS</b></div>
                <p class="hero-description">VAHŞİ DOĞA · 6 KİŞİLİK EKİP · SINIRSIZ KEŞİF</p>
                <div class="hero-tags">
                  <span>♧ Açık Dünya</span><span>⌁ Kamp Kurma</span><span>♧ Hayvan Keşfi</span>
                </div>
                <div class="hero-actions">
                  <button class="primary-button" data-action="play">▶ &nbsp; OYUNU İNCELE</button>
                  <button class="outline-button" data-action="details">OYUN DETAYLARI ↗</button>
                </div>
              </div>
              <div class="hero-caption">YENİ BİR DÜNYA SENİ BEKLİYOR</div>
            </section>

            <section class="section-block">
              <div class="section-title"><div><span class="section-kicker">LUMORIX EVRENİ</span><h2>Oyunlarını keşfet</h2></div><button class="text-button" data-page="Oyunlar">Tüm oyunlar →</button></div>
              <div class="game-grid">
                ${games.slice(0, 3).map((game) => gameCard(game)).join("")}
              </div>
            </section>

            <section class="section-block news-section">
              <div class="section-title"><div><span class="section-kicker">GÜNCELLEMELER</span><h2>Merkezden haberler</h2></div></div>
              <div class="news-list">
                ${news.map((item) => `
                  <article class="news-item">
                    <div class="news-icon">${item.icon}</div>
                    <div><strong>${item.title}</strong><small>${item.date}</small></div>
                    <span class="news-arrow">↗</span>
                  </article>
                `).join("")}
              </div>
            </section>
          ` : activePage === "Oyunlar" ? `
            <section class="page-heading">
              <span class="section-kicker">LUMORIX GAME LIBRARY</span>
              <h1>Tüm oyunlar</h1>
              <p>LUMORIX evrenindeki oyunları keşfet.</p>
              <p class="library-summary">Toplam ${games.length} oyun · ${getLibrary().filter((item) => item.status === "installed").length} yüklü · ${getLibrary().filter((item) => item.status === "not-installed").length} yüklenmemiş</p>
              <input id="game-search" class="search-input" placeholder="Oyun ara..." value="${escapeHtml(searchTerm)}" />
            </section>
            <div class="game-grid all-games">
              ${visibleGames.map((game) => gameCard(game)).join("") || `<p>Aramana uygun oyun bulunamadı.</p>`}
            </div>
          ` : activePage === "Mağaza" ? `
            <section class="page-heading"><span class="section-kicker">LUMORIX STORE</span><h1>Mağaza</h1><p>Oyun içerikleri ve dijital ürünler için mağazamız hazırlanıyor.</p></section>
            <div class="placeholder-panel"><span>✧</span><h2>Çok yakında</h2><p>Mağaza açıldığında yeni içerikler burada yer alacak.</p></div>
          ` : activePage === "Topluluk" ? `
            <section class="page-heading"><span class="section-kicker">BİRLİKTE DAHA GÜÇLÜ</span><h1>Topluluk</h1><p>LUMORIX oyuncu topluluğunun merkezi.</p></section>
            <div class="placeholder-panel"><span>♧</span><h2>Topluluk özellikleri hazırlanıyor</h2><p>Arkadaşlar, sohbet ve topluluk etkinlikleri sonraki aşamalarda eklenecek.</p></div>
          ` : activePage === "Ayarlar" ? `
            <section class="page-heading"><span class="section-kicker">TERCİHLERİN</span><h1>Ayarlar</h1><p>LUMORIX HUB deneyimini kişiselleştir.</p></section>
            <div class="placeholder-panel"><span>⚙</span><h2>Uygulama ayarları</h2><p>Bildirimler, indirme tercihleri ve hesap ayarları ilerleyen sürümlerde eklenecek.</p></div>
          ` : `
            <section class="page-heading"><span class="section-kicker">LUMORIX DESTEK</span><h1>Destek</h1><p>Yardım merkezi ve sık sorulan sorular.</p></section>
            <div class="placeholder-panel"><span>?</span><h2>Destek merkezi hazırlanıyor</h2><p>Bu bölüm sonraki sürümlerde açılacak.</p></div>
          `}
          <footer class="footer"><span>✦ LUMORIX <b>HUB</b></span><span>OYUNLARIN MERKEZİ</span><span>ÖN SÜRÜM · 0.1.0</span></footer>
        </main>

        <aside class="rightbar">
          <section class="right-panel">
            <div class="right-title">SON HABERLER <span>● CANLI ÖNİZLEME</span></div>
            ${news.map((item) => `
              <article class="compact-news"><span>${item.icon}</span><div><strong>${item.title}</strong><small>${item.date}</small></div></article>
            `).join("")}
          </section>
          <section class="right-panel quick-panel">
            <div class="right-title">HIZLI ERİŞİM</div>
            <div class="quick-grid">
              <button data-action="library"><span>▤</span> Kütüphane</button>
              <button data-page="Topluluk"><span>♧</span> Topluluk</button>
              <button data-page="Destek"><span>◈</span> Destek</button>
              <button data-page="Ayarlar"><span>⚙</span> Ayarlar</button>
            </div>
          </section>
          <section class="status-panel"><span class="status-pulse"></span><div><strong>LUMORIX HUB</strong><small>Arayüz ön sürümü çalışıyor</small></div><span class="version">v0.1</span></section>
        </aside>
      </div>
    </div>

    <div class="modal-backdrop" id="modal" hidden>
      <div class="modal">
        <button class="modal-close" data-action="close" aria-label="Kapat">×</button>
        <div class="modal-icon" id="modal-icon">🎮</div>
        <span class="section-kicker">LUMORIX GAME LIBRARY</span>
        <h2 id="modal-title">Lumora Wilds</h2>
        <p id="modal-text">Oyun bilgileri.</p>
        <div class="modal-note">Oyun dosyasını seçebilirsin. Dosya seçmek oyunu çalıştırmaz; indirme ve başlatma altyapısı ayrıca kurulmalıdır.</div>
        <div class="executable-picker">
          <button class="outline-button modal-button" data-action="select-executable">DOSYA SEÇ (.EXE)</button>
          <p id="executable-path" class="executable-path">Seçilen dosya: henüz yok</p>
        </div>
        <button class="primary-button modal-button" data-action="close">KAPAT</button>
      </div>
    </div>
  `;

  bindEvents();
}

function gameCard(game: Game): string {
  const libraryGame = getLibrary().find((item) => item.name === game.name);
  const installLabel = libraryGame
    ? getInstallLabel(libraryGame.status)
    : "Yüklü değil";

  return `
    <article class="game-card">
      <button class="game-art ${game.color}" data-game="${game.name}" aria-label="${game.name} detayları">
        <span class="art-orbit"></span><span class="art-icon">${game.icon}</span>
        <span class="art-brand">LUMORIX <b>GAMES</b></span>
        <span class="art-title">${game.name}</span>
      </button>
      <div class="game-card-info">
        <div><strong>${game.name}</strong><small>${game.category}</small></div>
        <span class="game-status">${installLabel}</span>
      </div>
      <button class="card-details" data-game="${game.name}">Detayları görüntüle <span>↗</span></button>
    </article>
  `;
}

function openGame(gameName: string, mode = "details"): void {
  const game = games.find((item) => item.name === gameName);
  if (!game) return;

  const modal = document.querySelector<HTMLDivElement>("#modal");
  const title = document.querySelector<HTMLElement>("#modal-title");
  const text = document.querySelector<HTMLElement>("#modal-text");
  const icon = document.querySelector<HTMLElement>("#modal-icon");

  if (!modal || !title || !text || !icon) return;

  title.textContent = game.name;
  icon.textContent = game.icon;
  const libraryGame = getLibrary().find((item) => item.name === game.name);
  const installLabel = libraryGame
    ? getInstallLabel(libraryGame.status)
    : "Yüklü değil";

  text.textContent = mode === "play"
    ? `${game.name} — ${installLabel}. Dosya seçimi yapılabilir; oyun henüz bu pencereden başlatılmıyor.`
    : `${game.description} Tür: ${game.category}. Geliştirme durumu: ${game.status}. Kütüphane: ${installLabel}.`;

  const pathLabel = document.querySelector<HTMLElement>("#executable-path");
  if (pathLabel) {
    pathLabel.textContent = getExecutablePath(getLibraryId(game.name))
      ? `Seçilen dosya: ${getExecutablePath(getLibraryId(game.name))}`
      : "Seçilen dosya: henüz yok";
  }

  const selectButton = document.querySelector<HTMLButtonElement>('[data-action="select-executable"]');
  if (selectButton) selectButton.dataset.game = game.name;

  modal.hidden = false;
}

function bindEvents(): void {
  document.querySelectorAll<HTMLElement>("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      activePage = button.dataset.page ?? "Ana Sayfa";
      render();
    });
  });

  document.querySelectorAll<HTMLElement>("[data-game]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedGame = button.dataset.game ?? "Lumora Wilds";
      openGame(selectedGame);
    });
  });

  document.querySelectorAll<HTMLElement>("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "close") {
        const modal = document.querySelector<HTMLDivElement>("#modal");
        if (modal) modal.hidden = true;
      } else if (action === "play" || action === "details") {
        openGame(selectedGame, action);
      } else if (action === "select-executable") {
        void (async () => {
          try {
            const file = await open({
              multiple: false,
              directory: false,
              filters: [{ name: "Windows uygulaması", extensions: ["exe"] }]
            });

            if (!file || Array.isArray(file)) return;

            const gameName = button.dataset.game ?? selectedGame;
            const game = games.find((item) => item.name === gameName);
            if (!game) return;

            await invoke<string>("validate_game_executable", { path: file });

            if (!setExecutablePath(getLibraryId(game.name), file)) return;

            const pathLabel = document.querySelector<HTMLElement>("#executable-path");
            if (pathLabel) pathLabel.textContent = `Seçilen dosya: ${file}`;
          } catch (error) {
            console.error("Oyun dosyası seçilemedi:", error);
            window.alert("Dosya seçilemedi. Lütfen uygulamayı Tauri masaüstü sürümünde açtığını kontrol et.");
          }
        })();
      } else if (action === "library") {
        activePage = "Oyunlar";
        render();
      }
    });
  });

  document.querySelector<HTMLInputElement>("#game-search")?.addEventListener("input", (event) => {
    searchTerm = (event.target as HTMLInputElement).value;
    const cursorPosition = (event.target as HTMLInputElement).selectionStart;
    render();
    const input = document.querySelector<HTMLInputElement>("#game-search");
    input?.focus();
    if (cursorPosition !== null) input?.setSelectionRange(cursorPosition, cursorPosition);
  });

  document.querySelector<HTMLDivElement>("#modal")?.addEventListener("click", (event) => {
    if (event.target === event.currentTarget) {
      (event.currentTarget as HTMLDivElement).hidden = true;
    }
  });
}

render();
