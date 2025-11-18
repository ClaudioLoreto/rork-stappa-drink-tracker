#!/bin/bash

# 📸 Script Automatico per Screenshot Android Play Store
# Genera screenshot per Google Play Console

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SCREENSHOT_DIR="$SCRIPT_DIR/android"

echo "🤖 Screenshot Generator per Google Play Store"
echo "=============================================="
echo ""

# Crea directory output
mkdir -p "$SCREENSHOT_DIR"/{phone,tablet-7,tablet-10}

# Dispositivi target
declare -A DEVICES=(
    ["Pixel 7 Pro"]="phone:1440x3120"
    ["Pixel Tablet"]="tablet-7:1600x2560"
    ["Pixel C"]="tablet-10:2560x1800"
)

# Schermate da catturare (stesse di iOS per consistenza)
SCREENS=(
    "01-login:Login/Home"
    "02-select-bar:Selezione Bar"
    "03-user-dashboard:Dashboard Utente"
    "04-qr-scan:Scansione QR"
    "05-social:Feed Social"
    "06-merchant:Dashboard Merchant"
    "07-promo:Sistema Promo"
)

echo "✨ Questo script ti guiderà nella cattura degli screenshot"
echo ""
echo "📋 Schermate da catturare:"
for screen in "${SCREENS[@]}"; do
    name="${screen#*:}"
    echo "   - $name"
done
echo ""

# Funzione per catturare screenshot
capture_for_device() {
    local device_name=$1
    local size_info=${DEVICES[$device_name]}
    local size_folder="${size_info%%:*}"
    local dimensions="${size_info##*:}"
    
    echo ""
    echo "📱 Dispositivo: $device_name ($dimensions)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Lista emulatori disponibili
    EMULATOR_NAME=$(emulator -list-avds | grep -i "$device_name" | head -1)
    
    if [ -z "$EMULATOR_NAME" ]; then
        echo "❌ Emulatore $device_name non trovato"
        echo "   Crea l'emulatore da Android Studio > Device Manager"
        return 1
    fi
    
    echo "✅ Trovato emulatore: $EMULATOR_NAME"
    
    # Avvia emulatore
    echo "🚀 Avvio emulatore..."
    emulator -avd "$EMULATOR_NAME" &
    EMULATOR_PID=$!
    
    # Attendi avvio
    echo "⏳ Attendo avvio emulatore (può richiedere 1-2 minuti)..."
    adb wait-for-device
    sleep 10
    
    # Attendi unlock
    while ! adb shell dumpsys window | grep -q "mAwake=true"; do
        echo "   Attendo sblocco schermo..."
        sleep 2
    done
    
    echo "✅ Emulatore pronto"
    
    # Attendi che l'app sia pronta
    if [ "$size_folder" == "phone" ]; then
        echo ""
        echo "⚠️  IMPORTANTE:"
        echo "   1. Assicurati che l'app sia in esecuzione sull'emulatore"
        echo "   2. Modalità light theme per consistenza"
        echo "   3. Premi INVIO quando pronto..."
        read
    fi
    
    # Cattura ogni schermata
    for screen in "${SCREENS[@]}"; do
        local file_prefix="${screen%%:*}"
        local screen_name="${screen##*:}"
        local temp_file="/sdcard/screenshot.png"
        local output_file="$SCREENSHOT_DIR/$size_folder/${file_prefix}.png"
        
        echo ""
        echo "📸 Schermata: $screen_name"
        echo "   Naviga alla schermata e premi INVIO per catturare..."
        read
        
        # Cattura screenshot
        adb shell screencap -p "$temp_file"
        adb pull "$temp_file" "$output_file"
        adb shell rm "$temp_file"
        
        if [ -f "$output_file" ]; then
            # Verifica dimensioni
            actual_size=$(sips -g pixelWidth -g pixelHeight "$output_file" 2>/dev/null | grep -E "pixel(Width|Height)" | awk '{print $2}' | tr '\n' 'x' | sed 's/x$//')
            echo "   ✅ Screenshot salvato: $output_file ($actual_size)"
        else
            echo "   ❌ Errore nel salvare lo screenshot"
        fi
    done
    
    # Chiudi emulatore
    kill $EMULATOR_PID 2>/dev/null || true
    
    echo ""
    echo "✅ Completato $device_name"
}

# Verifica Android SDK
if ! command -v adb &> /dev/null; then
    echo "❌ Android SDK non trovato"
    echo "   Installa Android Studio e configura il PATH"
    echo "   export PATH=\"\$PATH:\$HOME/Library/Android/sdk/platform-tools\""
    exit 1
fi

if ! command -v emulator &> /dev/null; then
    echo "❌ Android Emulator non trovato"
    echo "   Installa da Android Studio > SDK Manager > SDK Tools"
    exit 1
fi

# Controlla se l'app è buildabile
echo "🔍 Verifica prerequisiti..."
echo ""
echo "⚠️  PRIMA DI CONTINUARE:"
echo "   1. Avvia l'app: npx expo start --android"
echo "   2. Seleziona l'emulatore quando richiesto"
echo "   3. Attendi che l'app sia completamente caricata"
echo ""
echo "Premi INVIO per continuare..."
read

# Cattura screenshot per dispositivi phone (obbligatorio)
capture_for_device "Pixel 7 Pro"

echo ""
echo "📱 Screenshot tablet sono opzionali"
echo "   Vuoi catturare screenshot per tablet? (y/N)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    capture_for_device "Pixel Tablet"
    capture_for_device "Pixel C"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ COMPLETATO!"
echo ""
echo "📁 Screenshot salvati in:"
echo "   $SCREENSHOT_DIR/"
echo ""
echo "📊 Riepilogo:"
for size_dir in phone tablet-7 tablet-10; do
    if [ -d "$SCREENSHOT_DIR/$size_dir" ]; then
        count=$(find "$SCREENSHOT_DIR/$size_dir" -name "*.png" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$count" -gt 0 ]; then
            echo "   $size_dir: $count screenshot"
        fi
    fi
done
echo ""
echo "📤 Prossimi passi:"
echo "   1. Verifica che le screenshot siano corrette"
echo "   2. Vai su Google Play Console"
echo "   3. Carica le screenshot nella sezione 'Store listing > Graphics'"
echo ""
echo "💡 Requisiti Google Play:"
echo "   - Minimo 2 screenshot per phone"
echo "   - Formato: JPEG o PNG 24-bit"
echo "   - Dimensioni: min 320px, max 3840px su ogni lato"
