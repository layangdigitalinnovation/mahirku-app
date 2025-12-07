const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Expo config plugin to remove the deprecated enableBundleCompression property
 * from android/app/build.gradle
 */
const withRemoveBundleCompression = (config) => {
    return withAppBuildGradle(config, (config) => {
        if (config.modResults.contents) {
            // Remove enableBundleCompression property
            config.modResults.contents = config.modResults.contents
                .replace(/\s*enableBundleCompression\s*=\s*(true|false)\s*/g, '\n')
                .replace(/react\s*\{\s*enableBundleCompression\s*=\s*(true|false)\s*\}/g, 'react {}');
        }
        return config;
    });
};

module.exports = withRemoveBundleCompression;
