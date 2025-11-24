import React from 'react';
import { SectionList, View, Text, StyleSheet, ListRenderItem } from 'react-native';

type Section<T> = { title: string; data: T[] };

type Props<T> = {
  sections: Section<T>[];
  renderItem: ListRenderItem<T>;
  renderSectionHeader?: (title: string) => React.ReactElement | null;
  keyExtractor?: (item: T, index: number) => string;
  contentContainerStyle?: any;
};

export default function SectionedList<T>({ sections, renderItem, renderSectionHeader, keyExtractor, contentContainerStyle }: Props<T>) {
  return (
    <SectionList
      sections={sections}
      keyExtractor={keyExtractor ?? ((_, i) => String(i))}
      renderItem={renderItem}
      renderSectionHeader={({ section }) => {
        if (renderSectionHeader) {
          const el = renderSectionHeader(section.title);
          return el ?? null;
        }
        return (
          <View style={styles.header}>
            <Text style={styles.headerText}>{section.title}</Text>
          </View>
        );
      }}
      contentContainerStyle={[styles.container, contentContainerStyle]}
    />
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  header: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F5FAFF' },
  headerText: { color: '#0F172A', fontWeight: '700' },
});
