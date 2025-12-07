const fs = require('fs');
const path = require('path');

console.log('🔧 Running EAS prebuild hook...');

// The android folder should already exist at this point since expo prebuild was run
const buildGradlePath = path.join(__dirname, 'android', 'app', 'build.gradle');

if (fs.existsSync(buildGradlePath)) {
    console.log('🔍 Patching build.gradle...');
    let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');

    // Store original content to check if changes were made
    const originalContent = buildGradleContent;

    // Remove enableBundleCompression if it exists
    buildGradleContent = buildGradleContent.replace(/\s*enableBundleCompression\s*=\s*(true|false)\s*/g, '\n');

    // Also remove it if it's in a react block
    buildGradleContent = buildGradleContent.replace(/react\s*\{\s*enableBundleCompression\s*=\s*(true|false)\s*\}/g, 'react {}');

    if (buildGradleContent !== originalContent) {
        fs.writeFileSync(buildGradlePath, buildGradleContent);
        console.log('✅ Successfully removed enableBundleCompression from build.gradle');
    } else {
        console.log('ℹ️  No enableBundleCompression found in build.gradle');
    }
} else {
    console.warn('⚠️  build.gradle not found at:', buildGradlePath);
    console.warn('The android folder may not have been generated yet.');
}

console.log('✅ Prebuild hook completed');
