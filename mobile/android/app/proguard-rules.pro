# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# ========================================
# React Native Core
# ========================================
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**
-dontwarn com.facebook.jni.**

# Hermes engine (CRITICAL for release builds)
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.modules.** { *; }
-keep class com.facebook.react.views.** { *; }
-keep class com.facebook.react.common.** { *; }
-keep class com.facebook.react.devsupport.** { *; }

# JSI (JavaScript Interface) - needed by Hermes
-keep class com.facebook.react.bridge.JavaScriptModule { *; }
-keep class com.facebook.react.bridge.JavaScriptModuleRegistry { *; }
-keep class com.facebook.react.bridge.ReactContext { *; }
-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }

# ========================================
# react-native-reanimated
# ========================================
-keep class com.swmansion.reanimated.** { *; }
-dontwarn com.swmansion.reanimated.**

# ========================================
# react-native-gesture-handler
# ========================================
-keep class com.swmansion.gesturehandler.** { *; }
-dontwarn com.swmansion.gesturehandler.**

# ========================================
# react-native-screens
# ========================================
-keep class com.swmansion.rnscreens.** { *; }
-dontwarn com.swmansion.rnscreens.**

# ========================================
# Expo Modules (Core + All Used)
# ========================================
-keep class expo.modules.** { *; }
-keep class com.expo.** { *; }
-dontwarn expo.modules.**
-dontwarn com.expo.**

# Expo specific modules used in the app
-keep class expo.modules.constants.** { *; }
-keep class expo.modules.filesystem.** { *; }
-keep class expo.modules.font.** { *; }
-keep class expo.modules.lineargradient.** { *; }
-keep class expo.modules.updates.** { *; }
-keep class expo.modules.clipboard.** { *; }
-keep class expo.modules.print.** { *; }
-keep class expo.modules.sharing.** { *; }
-keep class expo.modules.webbrowser.** { *; }
-keep class expo.modules.crypto.** { *; }
-keep class expo.modules.asset.** { *; }
-keep class expo.modules.splashscreen.** { *; }

# ========================================
# AsyncStorage
# ========================================
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-dontwarn com.reactnativecommunity.asyncstorage.**

# ========================================
# React Native WebView
# ========================================
-keep class com.reactnativecommunity.webview.** { *; }
-dontwarn com.reactnativecommunity.webview.**

# ========================================
# OkHttp & Okio (used by React Native networking)
# ========================================
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep class okio.** { *; }

# OkHttp platform adapters (CRITICAL for HTTPS)
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase
-dontwarn org.codehaus.mojo.animal_sniffer.*
-dontwarn okhttp3.internal.platform.**
-keep class okhttp3.internal.platform.** { *; }

# ========================================
# SSL/TLS & Security Providers (CRITICAL for HTTPS)
# ========================================
# Conscrypt (modern TLS provider used by Android/OkHttp)
-keep class org.conscrypt.** { *; }
-dontwarn org.conscrypt.**
-keep class com.android.org.conscrypt.** { *; }
-dontwarn com.android.org.conscrypt.**

# BouncyCastle security provider
-keep class org.bouncycastle.** { *; }
-dontwarn org.bouncycastle.**

# OpenJSSE
-keep class org.openjsse.** { *; }
-dontwarn org.openjsse.**

# Java SSL/TLS classes
-keep class javax.net.ssl.** { *; }
-keep class javax.security.** { *; }
-keep class java.security.** { *; }
-dontwarn javax.net.ssl.**
-dontwarn javax.security.**

# Keep SSL socket factory and hostname verifier
-keep class com.android.org.conscrypt.SSLParametersImpl { *; }
-keep class org.apache.harmony.xnet.provider.jsse.SSLParametersImpl { *; }

# ========================================
# Javax Annotation (used by OkHttp/networking)
# ========================================
-keep class javax.annotation.** { *; }
-dontwarn javax.annotation.**

# ========================================
# react-native-biometrics
# ========================================
-keep class com.rnbiometrics.** { *; }
-dontwarn com.rnbiometrics.**

# ========================================
# React Native Paper (Material Design)
# ========================================
-keep class com.reactnativepaper.** { *; }
-dontwarn com.reactnativepaper.**

# ========================================
# React Native Safe Area Context
# ========================================
-keep class com.th3rdwave.safeareacontext.** { *; }
-dontwarn com.th3rdwave.safeareacontext.**

# ========================================
# React Native DateTimePicker
# ========================================
-keep class com.reactcommunity.rndatetimepicker.** { *; }
-dontwarn com.reactcommunity.rndatetimepicker.**

# ========================================
# Fresco (Image loading - used by React Native)
# ========================================
-keep class com.facebook.fresco.** { *; }
-keep class com.facebook.imagepipeline.** { *; }
-keep class com.facebook.drawee.** { *; }
-dontwarn com.facebook.fresco.**
-dontwarn com.facebook.imagepipeline.**

# ========================================
# General Android / AndroidX
# ========================================
-keep class androidx.** { *; }
-dontwarn androidx.**

# ========================================
# Kotlin
# ========================================
-keep class kotlin.** { *; }
-keep class kotlinx.** { *; }
-dontwarn kotlin.**
-dontwarn kotlinx.**

# ========================================
# Keep JavaScript interface methods
# ========================================
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Parcelable implementations
-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep annotations
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes EnclosingMethod
-keepattributes InnerClasses

# Keep R classes
-keepclassmembers class **.R$* {
    public static <fields>;
}

# Suppress warnings for common third-party libraries
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
-dontwarn javax.annotation.**
-dontwarn sun.misc.**
