"use client";

import { useEffect, useState } from "react";

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

interface LatestRelease {
  version: string;
  windowsUrl: string | null;
  linuxUrl: string | null;
  allAssetsUrl: string;
}

export const useLatestRelease = () => {
  const [data, setData] = useState<LatestRelease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestRelease = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/repos/F-47/azkar/releases/latest",
        );
        if (!response.ok) throw new Error("Failed to fetch release");

        const json = await response.json();
        const assets: ReleaseAsset[] = json.assets || [];

        const windowsAsset =
          assets.find((a) => a.name.endsWith(".msi")) ||
          assets.find((a) => a.name.endsWith(".exe"));

        const linuxAsset =
          assets.find((a) => a.name.endsWith(".deb")) ||
          assets.find((a) => a.name.endsWith(".AppImage")) ||
          assets.find((a) => a.name.endsWith(".rpm"));

        setData({
          version: json.tag_name,
          windowsUrl: windowsAsset?.browser_download_url || null,
          linuxUrl: linuxAsset?.browser_download_url || null,
          allAssetsUrl: json.html_url,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestRelease();
  }, []);

  return { data, loading, error };
};
