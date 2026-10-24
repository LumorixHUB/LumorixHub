export type InstallStatus =
  | "not-installed"
  | "downloading"
  | "installed";

export type LibraryGame = {
  id: string;
  name: string;
  version: string;
  status: InstallStatus;
  progress: number;
  executablePath?: string;
};

const STORAGE_KEY = "lumorix-hub-library";

const defaultGames: LibraryGame[] = [
  { id: "lumora-wilds", name: "Lumora Wilds", version: "0.1.0", status: "not-installed", progress: 0 },
  { id: "lumorix-city", name: "Lumorix City", version: "0.1.0", status: "not-installed", progress: 0 },
  { id: "bereketli-ciftlik", name: "Bereketli Çiftlik", version: "0.1.0", status: "not-installed", progress: 0 },
];

function loadGames(): LibraryGame[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultGames.map((game) => ({ ...game }));

    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return defaultGames.map((game) => ({ ...game }));
    }

    return defaultGames.map((game) => {
      const item = parsed.find(
        (entry: unknown) =>
          typeof entry === "object" &&
          entry !== null &&
          "id" in entry &&
          entry.id === game.id,
      ) as Partial<LibraryGame> | undefined;

      if (
        item &&
        (item.status === "not-installed" ||
          item.status === "downloading" ||
          item.status === "installed")
      ) {
        return {
          ...game,
          status: item.status,
          progress: Number.isFinite(item.progress)
            ? Math.max(0, Math.min(100, Number(item.progress)))
            : 0,
          executablePath: typeof item.executablePath === "string" ? item.executablePath : undefined,
        };
      }

      return { ...game };
    });
  } catch {
    return defaultGames.map((game) => ({ ...game }));
  }
}

let games = loadGames();

function saveGames(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  } catch {
    // Depolama kullanılamıyorsa uygulama çalışmaya devam eder.
  }
}

export function getLibrary(): LibraryGame[] {
  return games.map((game) => ({ ...game }));
}

export function getInstallLabel(status: InstallStatus): string {
  switch (status) {
    case "not-installed":
      return "Yüklü değil";
    case "downloading":
      return "İndiriliyor";
    case "installed":
      return "Yüklendi";
  }
}

export function getGameById(id: string): LibraryGame | undefined {
  const game = games.find((item) => item.id === id);
  return game ? { ...game } : undefined;
}

export function setInstallStatus(
  id: string,
  status: InstallStatus,
  progress = 0,
): boolean {
  const game = games.find((item) => item.id === id);
  if (!game) return false;

  game.status = status;
  game.progress = Math.max(0, Math.min(100, progress));
  saveGames();
  return true;
}


export function getExecutablePath(id: string): string | undefined {
  return games.find((game) => game.id === id)?.executablePath;
}

export function setExecutablePath(id: string, path: string): boolean {
  const game = games.find((item) => item.id === id);
  if (!game) return false;

  game.executablePath = path;
  saveGames();
  return true;
}
