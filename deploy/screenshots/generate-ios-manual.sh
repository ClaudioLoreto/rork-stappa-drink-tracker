#!/bin/bash

# Script per generare screenshot per App Store Connect
# Richiede: Xcode, Simulatori iOS installati

set -e

SCREENSHOT_DIR="./screenshots"
mkdir -p "$SCREENSHOT_DIR"

echo "📱 Generazione screenshot per App Store Connect..."

# Dispositivi richiesti da Apple
declare -A DEVICES=(
    ["iPhone 15 Pro Max"]="6.7"  # 1290 × 2796
    ["iPhone 11 Pro Max"]="6.5"  # 1242 × 2688
    ["iPhone 8 Plus"]="5.5"      # 1242 × 2208
)

# Funzione per avviare simulatore e catturare screenshot
capture_screenshots() {
    local device_name=$1
    local size=$2
    
    echo "🔄 Preparazione $device_name ($size inch)..."
    
    # Trova UUID del simulatore
    DEVICE_UUID=$(xcrun simctl list devices | grep "$device_name" | grep -v "unavailable" | head -1 | grep -oE '\([A-F0-9\-]+\)' | tr -d '()')
    
    if [ -z "$DEVICE_UUID" ]; then
        echo "❌ Simulatore $device_name non trovato"
        return 1
    fi
    
    echo "✅ Trovato simulatore: $DEVICE_UUID"
    
    # Avvia il simulatore
    echo "🚀 Avvio simulatore..."
    xcrun simctl boot "$DEVICE_UUID" 2>/dev/null || echo "Simulatore già avviato"
    open -a Simulator
    sleep 3
    
    # Crea cartella per questo dispositivo
    DEVICE_DIR="$SCREENSHOT_DIR/$size-inch"
    mkdir -p "$DEVICE_DIR"
    
    echo "📸 Cattura screenshot in corso..."
    echo ""
    echo "⚠️  ATTENZIONE: Naviga manualmente nelle schermate principali dell'app"
    echo "   Premi INVIO dopo ogni schermata per catturare lo screenshot"
    echo ""
    
    SCREENS=("home" "select-bar" "user" "merchant" "social")
    
    for screen in "${SCREENS[@]}"; do
        echo -n "📱 Pronto per screenshot: $screen (premi INVIO quando sei sulla schermata)..."
        read
        
        # Cattura screenshot
        xcrun simctl io "$DEVICE_UUID" screenshot "$DEVICE_DIR/${screen}.png"
        echo "✅ Screenshot salvato: $DEVICE_DIR/${screen}.png"
    done
    
    echo "✅ Screenshot completati per $device_name"
    echo ""
}

# Avvia l'app sul primo simulatore
echo "🚀 Avvio app Expo..."
echo "Esegui in un altro terminale: npx expo start --ios"
echo "Premi INVIO quando l'app è caricata nel simulatore..."
read

# Cattura screenshot per ogni dispositivo
for device in "${!DEVICES[@]}"; do
    capture_screenshots "$device" "${DEVICES[$device]}"
    echo "---"
done

echo ""
echo "✅ Tutti gli screenshot sono stati salvati in: $SCREENSHOT_DIR"
echo ""
echo "📋 Struttura cartelle:"
tree "$SCREENSHOT_DIR" 2>/dev/null || find "$SCREENSHOT_DIR" -type f

echo ""
echo "🎉 Completato! Ora carica gli screenshot su App Store Connect"
