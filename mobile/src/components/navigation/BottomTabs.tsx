import React, { useMemo, useRef, useEffect, useState } from 'react';
import { View, Pressable, Text, StyleSheet, Animated, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

type Tab = { key: string; label: string; icon?: string };

type Props = {
  tabs: Tab[];
  activeIndex: number;
  onChange: (index: number) => void;
};

export default function BottomTabs({ tabs, activeIndex, onChange }: Props) {
  const indicator = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const widthPerTab = useMemo(() => (containerWidth > 0 ? containerWidth / (tabs.length || 1) : 0), [containerWidth, tabs.length]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.spring(indicator, { toValue: activeIndex, useNativeDriver: true, stiffness: 120, damping: 12, mass: 0.8 }).start();
  }, [activeIndex]);

  const translateX = indicator.interpolate({ inputRange: tabs.map((_, i) => i), outputRange: tabs.map((_, i) => i * widthPerTab) });
  const onLayout = (e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width);

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]} onLayout={onLayout}>
      <View style={styles.track}>
        <Animated.View style={[styles.indicator, { width: widthPerTab, transform: [{ translateX }] }]} />
      </View>
      <View style={styles.row}>
        {tabs.map((t, i) => (
          <Pressable key={t.key} style={styles.tab} android_ripple={{ color: '#EAF4FF' }} onPress={() => onChange(i)}>
            {t.icon ? <Feather name={t.icon as any} size={20} color={i === activeIndex ? '#0F172A' : '#64748B'} /> : null}
            <Text style={[styles.label, i === activeIndex && styles.labelActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E3EEF9', elevation: 12, shadowColor: '#000000', shadowOpacity: 0.08, shadowRadius: 12 },
  row: { flexDirection: 'row', paddingVertical: 8 },
  tab: { flex: 1, height: 64, alignItems: 'center', justifyContent: 'center', gap: 4 },
  label: { color: '#5A6B85', fontWeight: '600' },
  labelActive: { color: '#0F172A' },
  track: { height: 4, backgroundColor: '#EAF4FF' },
  indicator: { height: 4, backgroundColor: '#3BB1FF', borderRadius: 2 },
});

