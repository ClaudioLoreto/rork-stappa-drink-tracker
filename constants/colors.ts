export type ThemeColors = {
  cream: string;
  yellow: string;
  amber: string;
  orange: string;
  text: {
    primary: string;
    secondary: string;
    light: string;
  };
  background: {
    primary: string;
    card: string;
  };
  border: string;
  error: string;
  success: string;
};

const lightTheme: ThemeColors = {
  cream: '#FEF3E2',
  yellow: '#F3C623',
  amber: '#FFB22C',
  orange: '#FA812F',
  
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    light: '#999999',
  },
  
  background: {
    primary: '#FEF3E2',
    card: '#FFFFFF',
  },
  
  border: '#E5E5E5',
  error: '#DC2626',
  success: '#16A34A',
};

const darkTheme: ThemeColors = {
  cream: '#1A1A1A',
  yellow: '#F3C623',
  amber: '#FFB22C',
  orange: '#FA812F',
  
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    light: '#808080',
  },
  
  background: {
    primary: '#121212',
    card: '#1E1E1E',
  },
  
  border: '#333333',
  error: '#EF4444',
  success: '#22C55E',
};

// Export default for backward compatibility
export default lightTheme;

export { lightTheme, darkTheme };
