import pkg from "../../../src-tauri/tauri.conf.json";

export const TauriConfig = {
  Version: pkg.version,
  Issuer: pkg.identifier,
  Name: pkg.productName,
};
