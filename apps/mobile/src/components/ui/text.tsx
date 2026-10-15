import { fontFamily, textStyles, type TextVariant, type ThemeColors } from '@neuropeak/ui';
import { StyleSheet, Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from './theme-provider';

type TextProps = RNTextProps & {
  variant?: TextVariant;
  /** Tema renk anahtarı. Serbest hex verilmez. */
  color?: keyof ThemeColors;
  align?: 'left' | 'center' | 'right';
};

export function Text({
  variant = 'body',
  color = 'textPrimary',
  align,
  style,
  children,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const token = textStyles[variant];

  return (
    <RNText
      style={[
        {
          fontFamily: fontFamily[token.weight],
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          letterSpacing: token.letterSpacing,
          color: theme.colors[color],
          textAlign: align,
        },
        token.uppercase === true && styles.uppercase,
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  uppercase: {
    textTransform: 'uppercase',
  },
});
