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
};

const games: LibraryGame[] = [
  { id: "lumora-wilds", name: "Lumora Wilds", version: "0.1.0", status: "not-installed", progress: 0 },
  { id: "lumorix-city", name: "Lumorix City", version: "0.1.0", status: "not-installed", progress: 0 },
  { id: "bereketli-ciftlik", name: "Bereketli Çiftlik", version: "0.1.0", status: "not-installed", progress: 0 },
  { id: "dark-realms", name: "Dark Realms", version: "0.1.0", status: "not-installed", progress: 0 },
  { id: "speed-rally", name: "Speed Rally", version: "0.1.0", status: "not-installed", progress: 0 },
];

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
  return games.find((game) => game.id === id);
}
