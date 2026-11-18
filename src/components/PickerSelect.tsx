import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Menu, TextInput } from 'react-native-paper';
import { C, FONTS } from '../config/tokens';

interface Option {
  value: string;
  label: string;
}

interface PickerSelectProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  style?: any;
}

export default function PickerSelect({
  label,
  value,
  options,
  onChange,
  style,
}: PickerSelectProps) {
  const [visible, setVisible] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label || '';

  return (
    <View style={style}>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <Pressable onPress={() => setVisible(true)}>
            <TextInput
              label={label}
              value={selectedLabel}
              mode="outlined"
              dense
              editable={false}
              right={<TextInput.Icon icon="chevron-down" onPress={() => setVisible(true)} />}
              style={styles.input}
            />
          </Pressable>
        }
        contentStyle={styles.menuContent}
      >
        {options.map((option) => (
          <Menu.Item
            key={option.value}
            onPress={() => {
              onChange(option.value);
              setVisible(false);
            }}
            title={option.label}
            titleStyle={
              option.value === value ? styles.selectedItem : undefined
            }
          />
        ))}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: C.surface,
  },
  menuContent: {
    backgroundColor: C.successSoft,
    maxHeight: 300,
  },
  selectedItem: {
    fontFamily: FONTS.textBold,
    color: C.primary,
  },
});
