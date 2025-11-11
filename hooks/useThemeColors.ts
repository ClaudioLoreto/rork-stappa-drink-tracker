import { useTheme } from '@/contexts/ThemeContext';
import { lightTheme, darkTheme, ThemeColors } from '@/constants/colors';

export const useThemeColors = (): ThemeColors => {
  const { isDarkMode } = useTheme();
  return isDarkMode ? darkTheme : lightTheme;
};
