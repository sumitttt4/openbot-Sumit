/**
 * The name the app shows to people. Change it here to rename the app: every interface text on
 * desktop, web and mobile says this name where the catalogs say "OpenBot". The catalogs, protocol
 * headers, file and folder names, and the data folder keep "OpenBot", so a rename keeps the data
 * and works with OpenBot servers.
 */
export const APP_NAME: string = "Sumit";

/** The product name written in the catalogs. */
export const CATALOG_APP_NAME = "OpenBot";

/** A catalog text with the app name of this build. */
export function withAppName(text: string): string {
  return APP_NAME === CATALOG_APP_NAME ? text : text.replaceAll(CATALOG_APP_NAME, APP_NAME);
}
