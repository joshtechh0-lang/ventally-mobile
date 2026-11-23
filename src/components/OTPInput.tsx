import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import { hp, wp } from '../utils/size';
import { fontFamilies } from '../utils/fontFamilies';
import { useTheme } from '../theme';

interface OTPInputProps {
  value?: string;
  onChange?: (value: string) => void;
  cellCount?: number;
  onComplete?: (code: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ 
  value: controlledValue, 
  onChange, 
  cellCount = 4,
  onComplete 
}) => {
  const hasCompleted = React.useRef(false);
  const { theme } = useTheme();
  const [internalValue, setInternalValue] = useState('');
  
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = onChange || setInternalValue;
  
  const ref = useBlurOnFulfill({ value, cellCount });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  useEffect(() => {
    if (value.length === cellCount && onComplete && !hasCompleted.current) {
      hasCompleted.current = true;
      onComplete(value);
    }
    if (value.length < cellCount) {
      hasCompleted.current = false;
    }
  }, [value, cellCount, onComplete]);

  const styles = StyleSheet.create({
    codeFieldRoot: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '70%',
      alignSelf: 'center',
    },
    cell: {
      width: hp(5),
      height: hp(6),
      borderRadius: hp(1),
      backgroundColor: theme.black + '10',
      borderWidth: 1,
      borderColor: theme.white + '30',
      justifyContent: 'center',
      alignItems: 'center',
      // Add subtle shadow for better visual depth
      
    },
    cellText: {
      fontSize: hp(2.2),
      fontFamily: fontFamilies.medium,
      color: theme.white,
      textAlign: 'center',
    },
    focusCell: {
      borderColor: theme.white + '80',
      backgroundColor: theme.white + '20',
      borderWidth: 2,
     
    },
  });

  return (
    <View>
      <CodeField
        ref={ref}
        {...props}
        value={value}
        onChangeText={setValue}
        cellCount={cellCount}
        rootStyle={styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoFocus={true}
        renderCell={({ index, symbol, isFocused }) => (
          <View
            key={index}
            style={[styles.cell, isFocused && styles.focusCell]}
            onLayout={getCellOnLayoutHandler(index)}
          >
            <Text style={styles.cellText}>
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default OTPInput;