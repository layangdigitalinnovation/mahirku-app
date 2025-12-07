const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Running EAS prebuild hook...');

// Run expo prebuild to generate the android folder
// Note: In EAS Build, we don't need --platform flag as it's already determined
console.log('📦 Running expo prebuild...');
try {
    execSync('npx expo prebuild', { stdio: 'inherit' });
    console.log('✅ Expo prebuild completed');
} catch (error) {
    console.error('❌ Expo prebuild failed:', error.message);
    process.exit(1);
}

// Now patch the build.gradle file
const buildGradlePath = path.join(__dirname, 'android', 'app', 'build.gradle');

if (fs.existsSync(buildGradlePath)) {
    console.log('🔍 Patching build.gradle...');
    let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');

    // Remove enableBundleCompression if it exists
    const originalContent = buildGradleContent;
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
    console.log('⚠️  build.gradle not found at:', buildGradlePath);
    console.log('This is expected - EAS will run expo prebuild automatically.');
}

console.log('✅ Prebuild hook completed successfully');
