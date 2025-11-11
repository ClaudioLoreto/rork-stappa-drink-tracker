# ✅ Checklist Responsive - Stappa App

## 📱 Configurazione Completata

### 1. Orientamento Display
- ✅ **app.json**: Orientamento bloccato a `portrait`
- ✅ **iOS**: `requireFullScreen: true` + `UISupportedInterfaceOrientations`
- ✅ **Android**: `screenOrientation: "portrait"`

### 2. Hook e Utility
- ✅ `hooks/useResponsive.ts` - Hook per dimensioni e breakpoint
- ✅ `hooks/useResponsiveValue.ts` - Hook per valori condizionali
- ✅ `utils/responsive.ts` - Funzioni di scaling

### 3. Sistema di Scaling
- ✅ `scaleFontSize()` - Scala font in base allo schermo
- ✅ `scaleSpacing()` - Scala padding/margin
- ✅ `scaleWidth()` / `scaleHeight()` - Scala dimensioni
- ✅ Breakpoints definiti (xs, sm, md, lg, xl)

### 4. Componenti Aggiornati
- ✅ `Button.tsx` - Ora responsive con scaling automatico
- ✅ SafeArea configurata nel layout principale
- ✅ KeyboardAvoidingView per form

---

## 🎯 Regole da Seguire per Ogni Schermata

### ✅ Layout Flexbox
```tsx
// SEMPRE usare flex per i container principali
<View style={{ flex: 1 }}>
  <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    {/* Content */}
  </ScrollView>
</View>
```

### ✅ Dimensioni Responsive
```tsx
// ❌ MAI valori fissi
width: 300,
height: 200,

// ✅ Usare percentuali e scaling
width: '90%',
maxWidth: scaleWidth(400),
minHeight: scaleHeight(200),
```

### ✅ Font Responsive
```tsx
import { scaleFontSize } from '@/utils/responsive';

// ❌ Font fissi
fontSize: 24,

// ✅ Font scalati
fontSize: scaleFontSize(24),
```

### ✅ Spacing Responsive
```tsx
import { scaleSpacing } from '@/utils/responsive';

// ❌ Spacing fissi
padding: 20,
margin: 16,

// ✅ Spacing scalati
padding: scaleSpacing(20),
margin: scaleSpacing(16),
```

### ✅ SafeArea per Notch
```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={{ flex: 1 }}>
  {/* Content automatically avoids notch/home indicator */}
</SafeAreaView>
```

### ✅ Keyboard Handling
```tsx
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  <ScrollView keyboardShouldPersistTaps="handled">
    {/* Form */}
  </ScrollView>
</KeyboardAvoidingView>
```

---

## 🧪 Testing Obbligatorio

Prima di considerare una schermata "completa", testare su:

### iPhone (iOS)
- [ ] **iPhone SE (2022)** - 375x667 (small)
- [ ] **iPhone 13** - 390x844 (medium)
- [ ] **iPhone 14 Pro Max** - 430x932 (large)

### Android
- [ ] **Small Device** - 360x640
- [ ] **Medium Device** - 390x844
- [ ] **Large Device** - 412x915

### Verifiche
- [ ] Testo leggibile (non troppo piccolo)
- [ ] Bottoni raggiungibili con pollice
- [ ] Nessun overflow orizzontale
- [ ] Tastiera non copre input
- [ ] SafeArea rispettata (notch/home indicator)
- [ ] Orientamento bloccato a portrait

---

## 🚀 Quick Start per Nuove Schermate

### Template Base
```tsx
import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive } from '@/hooks/useResponsive';
import { scaleFontSize, scaleSpacing } from '@/utils/responsive';
import Button from '@/components/Button';

export default function NewScreen() {
  const { isSmallDevice, width } = useResponsive();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Titolo
        </Text>
        
        <View style={styles.content}>
          {/* Your content */}
        </View>

        <Button 
          title="Azione"
          onPress={() => {}}
          size={isSmallDevice ? 'medium' : 'large'}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: scaleSpacing(24),
  },
  title: {
    fontSize: scaleFontSize(28),
    fontWeight: 'bold',
    marginBottom: scaleSpacing(16),
  },
  content: {
    flex: 1,
    marginBottom: scaleSpacing(20),
  },
});
```

---

## 📊 Breakpoint Reference

| Categoria | Width | Devices Esempi |
|-----------|-------|----------------|
| **xs** | < 375px | iPhone SE 1st gen |
| **sm** | 375-413px | iPhone SE, 13 mini, Galaxy S21 |
| **md** | 414-767px | iPhone 14, 14 Pro, Pixel 7 |
| **lg** | 768-1023px | iPad mini |
| **xl** | ≥ 1024px | iPad Pro |

---

## 🛠️ Comandi Utili

### Test su Emulatore iOS
```bash
# iPhone SE
npx expo run:ios --device "iPhone SE (3rd generation)"

# iPhone 14 Pro Max
npx expo run:ios --device "iPhone 14 Pro Max"
```

### Test su Emulatore Android
```bash
# Lista device disponibili
emulator -list-avds

# Avvia emulatore specifico
emulator -avd Pixel_7_API_33
```

### Reload App
```bash
# Durante sviluppo
Press 'r' in terminal
# or
Shake device → Reload
```

---

## 🎨 Design Guidelines

### Touch Targets (Apple HIG)
- Minimo: **44x44 pt** (scaleSpacing(44))
- Consigliato: **48x48 pt** o più

### Text Sizes
```tsx
const textSizes = {
  xs: scaleFontSize(10),   // Caption
  sm: scaleFontSize(12),   // Small text
  base: scaleFontSize(14), // Body text
  md: scaleFontSize(16),   // Default
  lg: scaleFontSize(18),   // Subtitle
  xl: scaleFontSize(20),   // Title
  '2xl': scaleFontSize(24), // Large title
  '3xl': scaleFontSize(30), // Display
  '4xl': scaleFontSize(36), // Hero
};
```

### Spacing Scale
```tsx
const spacing = {
  xs: scaleSpacing(4),
  sm: scaleSpacing(8),
  md: scaleSpacing(12),
  lg: scaleSpacing(16),
  xl: scaleSpacing(20),
  '2xl': scaleSpacing(24),
  '3xl': scaleSpacing(32),
  '4xl': scaleSpacing(40),
};
```

---

## ⚠️ Common Pitfalls da Evitare

### ❌ NON FARE
```tsx
// Dimensioni fisse
width: 300,
fontSize: 16,
padding: 20,

// ScrollView senza contentContainerStyle
<ScrollView>
  <View style={{ flex: 1 }}> {/* ❌ flex non funziona */}

// Position absolute senza calcoli
position: 'absolute',
top: 50, // ❌ Non considera safe area
```

### ✅ FARE
```tsx
// Dimensioni responsive
width: '90%',
maxWidth: scaleWidth(400),
fontSize: scaleFontSize(16),
padding: scaleSpacing(20),

// ScrollView corretto
<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
  <View style={{ flex: 1 }}> {/* ✅ Funziona */}

// Position con safe area
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const insets = useSafeAreaInsets();
position: 'absolute',
top: insets.top + scaleSpacing(20),
```

---

## 📝 Review Checklist Prima del Commit

- [ ] Importato `useResponsive` o utility da `@/utils/responsive`
- [ ] Font scalati con `scaleFontSize()`
- [ ] Spacing scalato con `scaleSpacing()`
- [ ] Usato `SafeAreaView` o `useSafeAreaInsets()`
- [ ] `KeyboardAvoidingView` per schermate con input
- [ ] Nessuna dimensione fissa (width/height in px)
- [ ] Testato su almeno 2 dimensioni diverse
- [ ] ScrollView con `contentContainerStyle={{ flexGrow: 1 }}`
- [ ] Touch target minimo 44pt
- [ ] Testo leggibile su small device

---

## 🎓 Risorse Utili

- [React Native Layout Docs](https://reactnative.dev/docs/flexbox)
- [Apple HIG - Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Material Design - Layout](https://m3.material.io/foundations/layout/understanding-layout/overview)
- [Expo Screen Sizes](https://docs.expo.dev/workflow/configuration/#orientation)

