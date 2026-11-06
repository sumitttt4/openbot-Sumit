const { withGradleProperties } = require("expo/config-plugins");

// A cloud build (EAS) has no step that gives Gradle more memory, as the release workflow does on its
// runner (.github/workflows/release-android.yml). The generated gradle.properties gives the daemon
// 512 MB of Metaspace, and release lint runs out of it. The free EAS machine has less memory than that
// runner and no swap: with a 6 GB heap, a Kotlin daemon beside it and parallel CMake builds of Skia,
// Reanimated and Worklets, the kernel killed the Gradle daemon. So the heap fits the machine, Kotlin
// compiles inside the Gradle daemon, and two workers run at a time.
const PROPERTIES = {
  "org.gradle.jvmargs": "-Xmx4g -XX:MaxMetaspaceSize=1g -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8",
  "org.gradle.workers.max": "2",
  "kotlin.compiler.execution.strategy": "in-process",
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
