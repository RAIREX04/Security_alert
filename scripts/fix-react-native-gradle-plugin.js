const fs = require('fs');
const path = require('path');

const settingsPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-native',
  'gradle-plugin',
  'settings.gradle.kts',
);

if (!fs.existsSync(settingsPath)) {
  process.exit(0);
}

const source = fs.readFileSync(settingsPath, 'utf8');
const updated = source.replace(
  'org.gradle.toolchains.foojay-resolver-convention").version("0.5.0',
  'org.gradle.toolchains.foojay-resolver-convention").version("1.0.0',
);

if (source !== updated) {
  fs.writeFileSync(settingsPath, updated);
  console.log('Updated React Native Gradle toolchain resolver for Gradle 9.');
}
