# Sistema Responsive - Stappa App

## 🎯 Configurazione Orientamento

L'app è configurata per funzionare **solo in modalità portrait** su smartphone:

- **iOS**: Bloccato a portrait (con supporto upside-down su iPad)
- **Android**: `screenOrientation: "portrait"`
- **Configurazione**: `app.json` → `orientation: "portrait"`

## 📱 Hook e Utility Responsive

### 1. `useResponsive()` Hook

```tsx
import { useResponsive } from '@/hooks/useResponsive';

const MyComponent = () => {
  const { 
    width,           // Larghezza schermo
    height,          // Altezza schermo
    screenSize,      // 'small' | 'medium' | 'large' | 'xlarge'
    isSmallDevice,   // iPhone SE, piccoli
    isMediumDevice,  // iPhone standard
    isLargeDevice,   // iPhone Plus/Max
    isPortrait,      // true se portrait
    scale,           // Pixel ratio
    fontScale        // Font scale sistema
  } = useResponsive();

  return (
    <View style={{ padding: isSmallDevice ? 12 : 20 }}>
      <Text style={{ fontSize: isSmallDevice ? 14 : 16 }}>
        Responsive Text
      </Text>
    </View>
  );
};
```

### 2. `useResponsiveValue()` Hook

```tsx
import { useResponsiveValue } from '@/hooks/useResponsive';

const MyComponent = () => {
  const padding = useResponsiveValue({
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
    default: 16
  });

  const fontSize = useResponsiveValue({
    small: 14,
    medium: 16,
    large: 18,
    default: 16
  });

  return (
    <View style={{ padding }}>
      <Text style={{ fontSize }}>Adaptive Content</Text>
    </View>
  );
};
```

### 3. Utility Functions (`utils/responsive.ts`)

```tsx
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  scaleSpacing,
  getResponsivePadding,
  getResponsiveFontSizes,
  isSmallDevice,
  isLargeDevice
} from '@/utils/responsive';

const styles = StyleSheet.create({
  container: {
    padding: scaleSpacing(20),
    marginTop: scaleHeight(50),
  },
  title: {
    fontSize: scaleFontSize(24),
    marginBottom: scaleSpacing(16),
  },
  button: {
    width: scaleWidth(200),
    height: scaleHeight(50),
  }
});
```

## 📐 Breakpoints

```typescript
{
  xs: 320,  // iPhone SE (1a gen)
  sm: 375,  // iPhone SE, iPhone 13 mini
  md: 414,  // iPhone 11 Pro Max, iPhone 14 Plus
  lg: 768,  // iPad mini
  xl: 1024  // iPad
}
```

## ✅ Best Practices

### 1. **Usa FlexBox sempre**
```tsx
<View style={{ flex: 1, flexDirection: 'column' }}>
  <View style={{ flex: 2 }}>Header</View>
  <View style={{ flex: 8 }}>Content</View>
</View>
```

### 2. **Evita dimensioni fisse**
❌ **NO:**
```tsx
width: 300,
height: 200,
```

✅ **SI:**
```tsx
width: '90%',
maxWidth: 400,
minHeight: 200,
```

### 3. **Usa percentuali e maxWidth**
```tsx
<View style={{ 
  width: '100%',
  maxWidth: 600,
  paddingHorizontal: '5%'
}}>
```

### 4. **Responsive Fonts**
```tsx
import { scaleFontSize } from '@/utils/responsive';

const styles = StyleSheet.create({
  title: {
    fontSize: scaleFontSize(24), // Auto-scale su diversi device
  }
});
```

### 5. **SafeAreaView per notch/status bar**
```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={{ flex: 1 }}>
  <View>{/* Content */}</View>
</SafeAreaView>
```

### 6. **KeyboardAvoidingView**
```tsx
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  {/* Form content */}
</KeyboardAvoidingView>
```

## 🎨 Esempi Pratici

### Login Responsive
```tsx
import { useResponsive } from '@/hooks/useResponsive';
import { scaleFontSize, scaleSpacing } from '@/utils/responsive';

const LoginScreen = () => {
  const { isSmallDevice } = useResponsive();

  return (
    <ScrollView 
      contentContainerStyle={{
        padding: scaleSpacing(isSmallDevice ? 16 : 24),
        justifyContent: 'center',
        minHeight: '100%'
      }}
    >
      <Text style={{ 
        fontSize: scaleFontSize(isSmallDevice ? 36 : 48),
        textAlign: 'center' 
      }}>
        Stappa
      </Text>
    </ScrollView>
  );
};
```

### Card Responsive
```tsx
const Card = ({ children }) => {
  const { width, isSmallDevice } = useResponsive();
  
  return (
    <View style={{
      width: isSmallDevice ? width - 32 : width * 0.9,
      maxWidth: 500,
      padding: isSmallDevice ? 12 : 20,
      borderRadius: 12,
      backgroundColor: '#fff'
    }}>
      {children}
    </View>
  );
};
```

## 📱 Dimensioni Comuni Smartphone

| Device | Width | Height | Categoria |
|--------|-------|--------|-----------|
| iPhone SE (2022) | 375 | 667 | small |
| iPhone 13 mini | 375 | 812 | small |
| iPhone 13/14 | 390 | 844 | medium |
| iPhone 13/14 Pro | 393 | 852 | medium |
| iPhone 14 Plus | 428 | 926 | large |
| iPhone 14 Pro Max | 430 | 932 | large |
| Samsung Galaxy S21 | 360 | 800 | small |
| Samsung Galaxy S23 | 384 | 854 | medium |
| Pixel 7 | 412 | 915 | large |

## 🔧 Testing Responsive

1. **Expo DevTools**: Premi `Shift + M` → Device Settings
2. **Android Studio**: AVD Manager → Vari dispositivi
3. **Xcode Simulator**: Device menu → iPhone SE, 13, 14 Pro Max
4. **Chrome DevTools**: F12 → Toggle device toolbar

## 🚀 Checklist Deploy

- [ ] Testato su iPhone SE (piccolo)
- [ ] Testato su iPhone 13 (medio)
- [ ] Testato su iPhone 14 Pro Max (grande)
- [ ] Testato su Android piccolo (360dp)
- [ ] Testato su Android grande (420dp)
- [ ] Tastiera non copre input
- [ ] SafeArea gestita correttamente
- [ ] Orientamento bloccato a portrait
- [ ] Testo leggibile su tutti i device
- [ ] Bottoni raggiungibili con pollice
