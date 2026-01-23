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
        image: require('../../assets/onboarding/onboarding-1.jpeg'),
        title: 'Temukan Potensi Dirimu',
        description: 'Kenali dirimu lebih dalam melalui berbagai tes psikologi yang akurat dan terpercaya',
    },
    {
        id: '2',
        image: require('../../assets/onboarding/onboarding-2.jpeg'),
        title: 'Tes Kepribadian Lengkap',
        description: 'Akses tes DISC, potensi diri, minat & bakat untuk pengembangan karier yang lebih baik',
    },
    {
        id: '3',
        image: require('../../assets/onboarding/onboarding-3.jpeg'),
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

    const renderSlide = ({ item }: { item: SlideItem }) => {
        return (
            <View style={styles.slide}>
                <View style={styles.imageContainer}>
                    <View style={styles.imageWrapper}>
                        <Image source={item.image} style={styles.image} resizeMode="contain" />
                    </View>
                </View>
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
                        outputRange: [10, 28, 10],
                        extrapolate: 'clamp',
                    });

                    const backgroundColor = scrollX.interpolate({
                        inputRange,
                        outputRange: ['#E0E7FF', '#6366F1', '#E0E7FF'],
                        extrapolate: 'clamp',
                    });

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.5, 1, 0.5],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    width: dotWidth,
                                    backgroundColor,
                                    opacity,
                                },
                            ]}
                        />
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Skip Button */}
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

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
            />

            {/* Bottom Section */}
            <View style={styles.bottomContainer}>
                {renderDots()}

                {/* Next/Get Started Button */}
                <TouchableOpacity onPress={handleNext} activeOpacity={0.8}>
                    <LinearGradient
                        colors={['#6366F1', '#8B5CF6', '#A855F7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.nextButton}
                    >
                        <Text style={styles.nextButtonText}>
                            {currentIndex === slides.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}
                        </Text>
                        {currentIndex < slides.length - 1 && (
                            <Text style={styles.arrowIcon}>→</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    skipButton: {
        position: 'absolute',
        top: 50,
        right: 24,
        zIndex: 10,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    skipText: {
        fontSize: 16,
        color: '#6366F1',
        fontWeight: '600',
    },
    slide: {
        width,
        flex: 1,
        paddingTop: 100,
    },
    imageContainer: {
        flex: 0.55,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    imageWrapper: {
        width: width * 0.85,
        height: width * 0.85,
        borderRadius: 30,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden',
    },
    image: {
        width: '90%',
        height: '90%',
    },
    textContainer: {
        flex: 0.35,
        paddingHorizontal: 40,
        paddingTop: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E1B4B',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 10,
    },
    bottomContainer: {
        paddingHorizontal: 24,
        paddingBottom: 50,
        alignItems: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    dot: {
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 30,
        minWidth: 200,
        shadowColor: '#6366F1',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    nextButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    arrowIcon: {
        fontSize: 20,
        color: '#FFFFFF',
        marginLeft: 10,
        fontWeight: '700',
    },
});

export default OnboardingScreen;
