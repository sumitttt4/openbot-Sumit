const { withAppBuildGradle, withGradleProperties } = require("expo/config-plugins");

// A cloud build (EAS) has no step that gives Gradle more memory, as the release workflow does on its
// runner (.github/workflows/release-android.yml). The generated gradle.properties gives the daemon
// 512 MB of Metaspace, and release lint runs out of it. The free EAS machine has less memory than that
// runner and no swap: with a 6 GB heap, a Kotlin daemon beside it and parallel CMake builds of Skia,
// Reanimated and Worklets, the kernel killed the Gradle daemon. So the heap fits the machine, Kotlin
// compiles inside the Gradle daemon, and few workers run at a time.
//
// `lean` is for a build that a person installs from a link (the preview profile): one worker, and no
// release lint, the step that runs out of Metaspace. app.config.js turns it on.
const MARKER = "// with-gradle-memory: no release lint";

/** @type {import('expo/config-plugins').ConfigPlugin<{ lean?: boolean } | undefined>} */
module.exports = (config, options) => {
  const lean = options?.lean === true;
  const properties = {
    "org.gradle.jvmargs": "-Xmx4g -XX:MaxMetaspaceSize=1g -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8",
    "org.gradle.workers.max": lean ? "1" : "2",
    "kotlin.compiler.execution.strategy": "in-process",
  };
  config = withGradleProperties(config, (config) => {
    for (const [key, value] of Object.entries(properties)) {
      config.modResults = config.modResults.filter((item) => !(item.type === "property" && item.key === key));
      config.modResults.push({ type: "property", key, value });
    }
    return config;
  });
  if (!lean) return config;
  return withAppBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes(MARKER)) {
      config.modResults.contents += `\n${MARKER}\nandroid {\n    lint {\n        checkReleaseBuilds = false\n        abortOnError = false\n    }\n}\n`;
    }
    return config;
  });
};
