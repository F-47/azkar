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
