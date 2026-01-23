import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Animated,
    TouchableOpacity,
    Dimensions,
    Image,
    StatusBar,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface SlideItem {
    id: string;
    image: any;
    title: string;
    description: string;
}

const slides: SlideItem[] = [
    {
        id: '1',
        image: require('../../assets/onboarding/onboarding-1.png'),
        title: 'Temukan Potensi Dirimu',
        description: 'Kenali dirimu lebih dalam melalui berbagai tes psikologi yang akurat dan terpercaya',
    },
    {
        id: '2',
        image: require('../../assets/onboarding/onboarding-2.png'),
        title: 'Tes Kepribadian Lengkap',
        description: 'Akses tes DISC, potensi diri, minat & bakat untuk pengembangan karier yang lebih baik',
    },
    {
        id: '3',
        image: require('../../assets/onboarding/onboarding-3.png'),
        title: 'Mulai Perjalananmu',
        description: 'Dapatkan hasil tes instan dan rekomendasi personal untuk masa depan yang lebih cerah',
    },
];

const OnboardingScreen = ({ navigation }: any) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<FlatList<SlideItem>>(null);

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
    );

    const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            navigation.replace('Auth');
        } catch (error) {
            console.error('Error saving onboarding status:', error);
            navigation.replace('Auth');
        }
    };

    const handleSkip = () => {
        completeOnboarding();
    };

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            completeOnboarding();
        }
    };

    const renderSlide = ({ item, index }: { item: SlideItem; index: number }) => {
        const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
        ];

        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1, 0.8],
            extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
        });

        return (
            <View style={styles.slide}>
                <Animated.View
                    style={[
                        styles.imageContainer,
                        {
                            transform: [{ scale }],
                            opacity,
                        }
                    ]}
                >
                    <LinearGradient
                        colors={['#F8F7FF', '#EEF2FF', '#E8EAFF']}
                        style={styles.imageWrapper}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.imageInnerGlow}>
                            <Image source={item.image} style={styles.image} resizeMode="contain" />
                        </View>
                    </LinearGradient>
                </Animated.View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
            </View>
        );
    };

    const renderDots = () => {
        return (
            <View style={styles.dotsContainer}>
                {slides.map((_, index) => {
                    const inputRange = [
                        (index - 1) * width,
                        index * width,
                        (index + 1) * width,
                    ];

                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [8, 32, 8],
                        extrapolate: 'clamp',
                    });

                    const dotHeight = scrollX.interpolate({
                        inputRange,
                        outputRange: [8, 8, 8],
                        extrapolate: 'clamp',
                    });

                    const backgroundColor = scrollX.interpolate({
                        inputRange,
                        outputRange: ['#C7D2FE', '#6366F1', '#C7D2FE'],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    width: dotWidth,
                                    height: dotHeight,
                                    backgroundColor,
                                },
                            ]}
                        />
                    );
                })}
            </View>
        );
    };

    return (
        <LinearGradient
            colors={['#FFFFFF', '#FAFAFF', '#F5F3FF']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Header with Skip Button */}
            <View style={styles.header}>
                <View style={styles.headerSpacer} />
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                    activeOpacity={0.7}
                >
                    <Text style={styles.skipText}>Lewati</Text>
                </TouchableOpacity>
            </View>

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                scrollEventThrottle={16}
                bounces={false}
                contentContainerStyle={styles.flatListContent}
            />

            {/* Bottom Section */}
            <View style={styles.bottomContainer}>
                {renderDots()}

                {/* Next/Get Started Button */}
                <TouchableOpacity
                    onPress={handleNext}
                    activeOpacity={0.85}
                    style={styles.buttonWrapper}
                >
                    <LinearGradient
                        colors={['#7C3AED', '#6366F1', '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.nextButton}
                    >
                        <Text style={styles.nextButtonText}>
                            {currentIndex === slides.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}
                        </Text>
                        {currentIndex < slides.length - 1 && (
                            <View style={styles.arrowContainer}>
                                <Text style={styles.arrowIcon}>→</Text>
                            </View>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Progress indicator */}
                <Text style={styles.progressText}>
                    {currentIndex + 1} / {slides.length}
                </Text>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 56,
        paddingBottom: 8,
    },
    headerSpacer: {
        width: 80,
    },
    skipButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.15)',
    },
    skipText: {
        fontSize: 15,
        color: '#6366F1',
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    flatListContent: {
        alignItems: 'center',
    },
    slide: {
        width,
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: 20,
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    imageWrapper: {
        width: width * 0.88,
        height: width * 0.75,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: {
            width: 0,
            height: 16,
        },
        shadowOpacity: 0.12,
        shadowRadius: 32,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    imageInnerGlow: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    image: {
        width: '85%',
        height: '85%',
    },
    textContainer: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#1E1B4B',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.8,
        lineHeight: 38,
    },
    description: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 16,
        fontWeight: '400',
    },
    bottomContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        alignItems: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 28,
    },
    dot: {
        borderRadius: 4,
        marginHorizontal: 4,
    },
    buttonWrapper: {
        shadowColor: '#6366F1',
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 12,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 56,
        borderRadius: 28,
        minWidth: 220,
    },
    nextButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    arrowContainer: {
        marginLeft: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    arrowIcon: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    progressText: {
        marginTop: 20,
        fontSize: 13,
        color: '#A5B4FC',
        fontWeight: '600',
        letterSpacing: 1,
    },
});

export default OnboardingScreen;
