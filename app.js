/* Keep static download links usable when GitHub's API is unreachable. */
const repo = 'Nahur1/DanaFox-Downloads';
const patterns = {
  apk: /^DanaFox-[\d.]+\.apk$/,
  ipa: /^DanaFox-[\d.]+\.ipa$/,
  setup: /^DanaFox-Setup-[\d.]+\.exe$/,
  portable: /^DanaFox-Portable-[\d.]+\.exe$/,
  dmg: /^DanaFox-[\d.]+-mac\.dmg$/,
  maczip: /^DanaFox-[\d.]+-mac-universal\.zip$/,
  appimage: /^DanaFox-[\d.]+-linux-x86_64\.AppImage$/,
  deb: /^DanaFox-[\d.]+-linux-amd64\.deb$/,
};

async function refreshRelease() {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return;
    const release = await response.json();
    if (!/^v\d+\.\d+\.\d+$/.test(release.tag_name) || !Array.isArray(release.assets)) return;

    const base = `https://github.com/${repo}/releases/download/${release.tag_name}/`;
    const links = [...document.querySelectorAll('a[data-asset]')];
    const files = links.map(link => release.assets.find(asset => {
      const pattern = patterns[link.dataset.asset];
      return pattern && pattern.test(asset.name) && asset.browser_download_url === base + asset.name;
    }));
    if (files.some(file => !file)) return;

    links.forEach((link, index) => { link.href = files[index].browser_download_url; });
    document.querySelector('[data-version]').textContent = release.tag_name;
  } catch {
    // The HTML already contains the last verified release.
  }
}

refreshRelease();
