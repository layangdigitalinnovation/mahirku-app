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
        image: require('../../assets/onboarding/onboarding1.png'),
        title: 'Temukan Potensi Dirimu',
        description: 'Kenali dirimu lebih dalam melalui berbagai tes psikologi yang akurat dan terpercaya',
    },
    {
        id: '2',
        image: require('../../assets/onboarding/onboarding2.png'),
        title: 'Tes Kepribadian Lengkap',
        description: 'Akses tes DISC, potensi diri, minat & bakat untuk pengembangan karier yang lebih baik',
    },
    {
        id: '3',
        image: require('../../assets/onboarding/onboarding3.png'),
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
            outputRange: [0.85, 1, 0.85],
            extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp',
        });

        return (
            <View style={styles.slide}>
                {/* Purple Gradient Background with Image */}
                <LinearGradient
                    colors={['#8B7CB3', '#6B5B95', '#574B7A']}
                    style={styles.gradientBackground}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                >
                    {/* Skip Button in Header */}
                    <TouchableOpacity
                        style={styles.skipHeaderButton}
                        onPress={handleSkip}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.skipHeaderText}>SKIP</Text>
                    </TouchableOpacity>

                    {/* Decorative Elements */}
                    <View style={styles.decorativeContainer}>
                        <View style={[styles.decorativeDot, styles.dotTopLeft]} />
                        <View style={[styles.decorativeDot, styles.dotTopRight]} />
                        <View style={[styles.decorativeDot, styles.dotBottomLeft]} />
                        <View style={[styles.decorativeStar, styles.starTop]} />
                        <View style={[styles.decorativeStar, styles.starBottom]} />
                    </View>

                    {/* Image Container */}
                    <Animated.View
                        style={[
                            styles.imageContainer,
                            {
                                transform: [{ scale }],
                                opacity,
                            }
                        ]}
                    >
                        <View style={styles.imageWrapper}>
                            <Image source={item.image} style={styles.image} resizeMode="contain" />
                        </View>
                    </Animated.View>
                </LinearGradient>

                {/* White Card Bottom Section */}
                <View style={styles.whiteCard}>
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

                    const dotScale = scrollX.interpolate({
                        inputRange,
                        outputRange: [1, 1.3, 1],
                        extrapolate: 'clamp',
                    });

                    const dotOpacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.4, 1, 0.4],
                        extrapolate: 'clamp',
                    });

                    const backgroundColor = scrollX.interpolate({
                        inputRange,
                        outputRange: ['#C4C4C4', '#7B68B3', '#C4C4C4'],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    transform: [{ scale: dotScale }],
                                    opacity: dotOpacity,
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
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

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

            {/* Fixed Bottom Section */}
            <View style={styles.bottomContainer}>
                {renderDots()}

                {/* Next Button */}
                <TouchableOpacity
                    onPress={handleNext}
                    activeOpacity={0.85}
                    style={styles.buttonWrapper}
                >
                    <LinearGradient
                        colors={['#5CBAD3', '#4FA8C2', '#3D96B0']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.nextButton}
                    >
                        <Text style={styles.nextButtonText}>
                            {currentIndex === slides.length - 1 ? 'MULAI' : 'NEXT'}
                        </Text>
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
    slide: {
        width,
        flex: 1,
    },
    gradientBackground: {
        flex: 0.65,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        position: 'relative',
        overflow: 'hidden',
    },
    skipHeaderButton: {
        position: 'absolute',
        top: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 50,
        right: 24,
        zIndex: 10,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    skipHeaderText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.85)',
        fontWeight: '600',
        letterSpacing: 1,
    },
    decorativeContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    decorativeDot: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    dotTopLeft: {
        top: '20%',
        left: '10%',
    },
    dotTopRight: {
        top: '15%',
        right: '15%',
    },
    dotBottomLeft: {
        bottom: '25%',
        left: '8%',
    },
    decorativeStar: {
        position: 'absolute',
        width: 12,
        height: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        transform: [{ rotate: '45deg' }],
    },
    starTop: {
        top: '25%',
        right: '20%',
    },
    starBottom: {
        bottom: '30%',
        right: '12%',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 24,
    },
    imageWrapper: {
        width: width * 0.75,
        height: width * 0.75,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    whiteCard: {
        flex: 0.35,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 32,
        paddingTop: 32,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#2D2D3A',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.3,
    },
    description: {
        fontSize: 15,
        color: '#6B6B7B',
        textAlign: 'center',
        lineHeight: 23,
        paddingHorizontal: 8,
        fontWeight: '400',
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 32,
        paddingBottom: 40,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 5,
    },
    buttonWrapper: {
        width: '100%',
        shadowColor: '#5CBAD3',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    nextButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        width: '100%',
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    skipButtonBottom: {
        marginTop: 16,
        paddingVertical: 8,
        paddingHorizontal: 24,
    },
    skipTextBottom: {
        fontSize: 14,
        color: '#9B9BA8',
        fontWeight: '600',
        letterSpacing: 1,
    },
});

export default OnboardingScreen;
