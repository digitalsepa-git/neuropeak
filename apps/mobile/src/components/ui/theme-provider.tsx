import { themes, type Theme, type ThemeName } from '@neuropeak/ui';
import { createContext, use, useMemo, type ReactNode } from 'react';

const ThemeContext = createContext<Theme>(themes.light);

type ThemeProviderProps = {
  children: ReactNode;
  /**
   * Uygulama cihazın açık/koyu tercihini takip etmez: menü, test ve profil
   * ekranları her zaman açık, oyun ekranları her zaman koyu temadadır.
   * Oyun ekranları kendilerini `name="dark"` ile sarar.
   */
  name?: ThemeName;
};

export function ThemeProvider({ children, name = 'light' }: ThemeProviderProps) {
  const theme = useMemo(() => themes[name], [name]);

  return <ThemeContext value={theme}>{children}</ThemeContext>;
}

export function useTheme(): Theme {
  return use(ThemeContext);
}
