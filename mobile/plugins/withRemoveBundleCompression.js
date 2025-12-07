const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Expo config plugin to remove the deprecated enableBundleCompression property
 * from android/app/build.gradle
 */
const withRemoveBundleCompression = (config) => {
    return withAppBuildGradle(config, (config) => {
        console.log('🔧 Running withRemoveBundleCompression plugin...');

        if (config.modResults.contents) {
            const before = config.modResults.contents;

            // Remove enableBundleCompression property in various formats
            config.modResults.contents = config.modResults.contents
                // Remove standalone enableBundleCompression = true/false
                .replace(/^\s*enableBundleCompression\s*=\s*(true|false)\s*$/gm, '')
                // Remove from react block
                .replace(/react\s*\{\s*enableBundleCompression\s*=\s*(true|false)\s*\}/g, 'react {}')
                // Remove if it's the only line in react block with newlines
                .replace(/react\s*\{\s*\n\s*enableBundleCompression\s*=\s*(true|false)\s*\n\s*\}/g, 'react {}');

            if (before !== config.modResults.contents) {
                console.log('✅ Removed enableBundleCompression from build.gradle');
            } else {
                console.log('ℹ️  No enableBundleCompression found (this is good!)');
            }
        }

        return config;
    });
};

module.exports = withRemoveBundleCompression;
