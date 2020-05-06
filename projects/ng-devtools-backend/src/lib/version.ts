const versionElement = document.querySelector('[ng-version]');
const versionRe = /(\d+\.\d+\.\d+)/;

const defaultVersion = '0.0.0';
let version = defaultVersion;
if (versionElement) {
  version = versionElement.getAttribute('ng-version') ?? defaultVersion;
  version = (version.match(versionRe) ?? [''])[0] ?? defaultVersion;
}

export const VERSION = version;