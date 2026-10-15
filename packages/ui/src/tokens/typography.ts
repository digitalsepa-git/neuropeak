/**
 * Inter ailesi. İsimler @expo-google-fonts/inter'in yüklediği anahtarlarla birebir
 * aynıdır; web tarafında `--font-inter` değişkeni kullanılır.
 */
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export type FontWeightToken = keyof typeof fontFamily;

export type TextStyleToken = {
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly weight: FontWeightToken;
  readonly letterSpacing: number;
  readonly uppercase?: boolean;
};

/**
 * Tipografi skalası. Her metin bu varyantlardan birini kullanır;
 * serbest fontSize verilmez.
 */
const rawTextStyles = {
  /** Skor sayacı, kutlama ekranları. */
  display: { fontSize: 40, lineHeight: 46, weight: 'bold', letterSpacing: -1 },
  /** Ekran başlığı. */
  title: { fontSize: 28, lineHeight: 34, weight: 'bold', letterSpacing: -0.5 },
  /** Bölüm başlığı. */
  heading: { fontSize: 22, lineHeight: 28, weight: 'bold', letterSpacing: -0.3 },
  /** Kart başlığı. */
  subheading: { fontSize: 17, lineHeight: 24, weight: 'semibold', letterSpacing: -0.1 },
  /** Gövde metni. */
  body: { fontSize: 16, lineHeight: 24, weight: 'regular', letterSpacing: 0 },
  /** Vurgulu gövde, buton etiketi. */
  bodyStrong: { fontSize: 16, lineHeight: 24, weight: 'semibold', letterSpacing: 0 },
  /** İkincil açıklama. */
  bodySmall: { fontSize: 14, lineHeight: 20, weight: 'regular', letterSpacing: 0 },
  /** Etiket, rozet, alt bilgi. */
  caption: { fontSize: 13, lineHeight: 18, weight: 'medium', letterSpacing: 0 },
  /** Bölüm üstü küçük başlık — büyük harf. */
  overline: {
    fontSize: 11,
    lineHeight: 14,
    weight: 'semibold',
    letterSpacing: 0.8,
    uppercase: true,
  },
} as const satisfies Record<string, TextStyleToken>;

export type TextVariant = keyof typeof rawTextStyles;

/**
 * Anahtarlar sabit kalır, değerler `TextStyleToken` olarak genişler —
 * böylece `uppercase` her varyantta okunabilir (tanımlı olmadığında undefined).
 */
export const textStyles: Readonly<Record<TextVariant, TextStyleToken>> = rawTextStyles;
