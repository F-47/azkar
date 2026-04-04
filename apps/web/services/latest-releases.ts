export async function getLatestRelease() {
  const res = await fetch(
    "https://api.github.com/repos/F-47/azkar/releases/latest",
  );

  if (!res.ok) throw new Error("Failed to fetch release");

  const data = await res.json();

  const assets = data.assets;

  const windows = assets.find(
    (a: any) => a.name.endsWith(".exe") || a.name.endsWith(".msi"),
  );

  const linux = {
    appImage: assets.find((a: any) => a.name.endsWith(".AppImage")),
    deb: assets.find((a: any) => a.name.endsWith(".deb")),
    rpm: assets.find((a: any) => a.name.endsWith(".rpm")),
  };

  return {
    version: data.tag_name,
    windows: windows?.browser_download_url || null,
    linux,
  };
}
