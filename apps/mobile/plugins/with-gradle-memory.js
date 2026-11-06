const { withGradleProperties } = require("expo/config-plugins");

// A cloud build (EAS) has no step that gives Gradle more memory, as the release workflow does on its
// runner (.github/workflows/release-android.yml). The generated gradle.properties gives the daemon
// 512 MB of Metaspace, and release lint runs out of it; parallel CMake builds of Skia, Reanimated and
// Worklets can use all the memory of the machine. So every build gets the release workflow's values.
const PROPERTIES = {
  "org.gradle.jvmargs": "-Xmx6g -XX:MaxMetaspaceSize=2g -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8",
  "org.gradle.workers.max": "2",
};

/** @type {import('expo/config-plugins').ConfigPlugin} */
module.exports = (config) =>
  withGradleProperties(config, (config) => {
    for (const [key, value] of Object.entries(PROPERTIES)) {
      config.modResults = config.modResults.filter((item) => !(item.type === "property" && item.key === key));
      config.modResults.push({ type: "property", key, value });
    }
    return config;
  });
