import React from 'react';
import { FlatList, View, Text, StyleSheet, ListRenderItem, RefreshControl } from 'react-native';

type Props<T> = {
  data: T[];
  keyExtractor?: (item: T, index: number) => string;
  renderItem: ListRenderItem<T>;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListEmptyText?: string;
  contentContainerStyle?: any;
  ItemSeparatorHeight?: number;
  scrollEnabled?: boolean;
};

export default function FlatItemList<T>({ data, keyExtractor, renderItem, refreshing, onRefresh, ListEmptyText = 'Data kosong', contentContainerStyle, ItemSeparatorHeight = 12, scrollEnabled }: Props<T>) {
  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor ?? ((_, i) => String(i))}
      renderItem={renderItem}
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}
      ItemSeparatorComponent={() => <View style={{ height: ItemSeparatorHeight }} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{ListEmptyText}</Text>
        </View>
      }
      contentContainerStyle={[styles.container, contentContainerStyle]}
      scrollEnabled={scrollEnabled}
    />
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 12 },
  empty: { padding: 24, alignItems: 'center' },
  emptyText: { color: '#5A6B85' },
});
