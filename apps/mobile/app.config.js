const { existsSync } = require("node:fs");
const { join } = require("node:path");

// Android notifications come through Firebase Cloud Messaging, which needs the Firebase file of the
// app. The file is optional, so the app builds before the Firebase project exists, and such a build
// gets no notifications on Android. The file has public identifiers only; the account service has the
// key that sends.
const GOOGLE_SERVICES_FILE = "./google-services.json";

/**
 * A build that a person installs from a link (EAS profile `preview`) skips the steps that only make a
 * store build smaller or stricter: R8 minify, resource shrinking and release lint. They need the most
 * memory, and the free EAS machine runs out of it.
 */
const LEAN_ANDROID = process.env.EAS_BUILD_PROFILE === "preview";

/** @param {import('expo/config').ExpoConfig["plugins"]} plugins */
function leanPlugins(plugins = []) {
  return plugins.map((plugin) => {
    const [name, options] = Array.isArray(plugin) ? plugin : [plugin, undefined];
    if (name === "./plugins/with-gradle-memory") return [name, { lean: true }];
    if (name === "expo-build-properties") {
      return [
        name,
        {
          ...options,
          android: {
            ...options?.android,
            enableMinifyInReleaseBuilds: false,
            enableShrinkResourcesInReleaseBuilds: false,
          },
        },
      ];
    }
    return plugin;
  });
}

/** @param {{ config: import('expo/config').ExpoConfig }} context */
module.exports = ({ config }) => {
  const base = LEAN_ANDROID ? { ...config, plugins: leanPlugins(config.plugins) } : config;
  return existsSync(join(__dirname, GOOGLE_SERVICES_FILE))
    ? { ...base, android: { ...base.android, googleServicesFile: GOOGLE_SERVICES_FILE } }
    : base;
};
