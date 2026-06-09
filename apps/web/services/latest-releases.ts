export interface LatestReleaseData {
  version: string;
  allAssetsUrl: string;
  windows: {
    msi: string | null;
    exe: string | null;
  };
  linux: {
    appImage: string | null;
    deb: string | null;
    rpm: string | null;
  };
}

interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
  download_count: number;
}

interface GitHubReleaseResponse {
  tag_name: string;
  html_url: string;
  assets?: GitHubReleaseAsset[];
}

export async function getLatestRelease(): Promise<LatestReleaseData> {
  const res = await fetch(
    "https://api.github.com/repos/F-47/azkar/releases/latest",
  );

  if (!res.ok) throw new Error("Failed to fetch release");

  const data = (await res.json()) as GitHubReleaseResponse;
  const assets = data.assets || [];

  return {
    version: data.tag_name,
    allAssetsUrl: data.html_url,
    windows: {
      msi:
        assets.find((a) => a.name.endsWith(".msi"))
          ?.browser_download_url || null,
      exe:
        assets.find((a) => a.name.endsWith(".exe"))
          ?.browser_download_url || null,
    },
    linux: {
      appImage:
        assets.find((a) => a.name.endsWith(".AppImage"))
          ?.browser_download_url || null,
      deb:
        assets.find((a) => a.name.endsWith(".deb"))
          ?.browser_download_url || null,
      rpm:
        assets.find((a) => a.name.endsWith(".rpm"))
          ?.browser_download_url || null,
    },
  };
}

export async function getTotalDownloads(): Promise<number> {
  const res = await fetch(
    "https://api.github.com/repos/F-47/azkar/releases?per_page=100",
  );

  if (!res.ok) return 0;

  const releases = (await res.json()) as Array<{
    assets: Array<{ download_count: number }>;
  }>;

  return releases.reduce(
    (total, release) =>
      total +
      release.assets.reduce((sum, asset) => sum + asset.download_count, 0),
    0,
  );
}
