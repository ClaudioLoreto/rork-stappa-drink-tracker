#!/bin/bash

# 📸 Script Automatico per Screenshot iOS App Store
# Genera screenshot nelle dimensioni richieste da Apple

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SCREENSHOT_DIR="$SCRIPT_DIR/ios"

echo "📱 Screenshot Generator per iOS App Store"
echo "=========================================="
echo ""

# Crea directory output
mkdir -p "$SCREENSHOT_DIR"/{6.7-inch,6.5-inch,5.5-inch}

# Dispositivi target
declare -A DEVICES=(
    ["iPhone 15 Pro Max"]="6.7-inch:1290x2796"
    ["iPhone 11 Pro Max"]="6.5-inch:1242x2688"
    ["iPhone 8 Plus"]="5.5-inch:1242x2208"
)

# Schermate da catturare
SCREENS=(
    "01-login:Login/Home"
    "02-select-bar:Selezione Bar"
    "03-user-dashboard:Dashboard Utente"
    "04-qr-scan:Scansione QR"
    "05-social:Feed Social"
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
    
    # Trova UUID simulatore
    DEVICE_UUID=$(xcrun simctl list devices | grep "$device_name" | grep -v "unavailable" | head -1 | grep -oE '\([A-F0-9\-]+\)' | tr -d '()')
    
    if [ -z "$DEVICE_UUID" ]; then
        echo "❌ Simulatore $device_name non trovato"
        echo "   Installa il simulatore da Xcode > Settings > Platforms"
        return 1
    fi
    
    # Boot simulatore
    echo "🚀 Avvio simulatore..."
    xcrun simctl boot "$DEVICE_UUID" 2>/dev/null || true
    open -a Simulator
    sleep 2
    
    # Attendi che l'app sia pronta
    if [ "$size_folder" == "6.7-inch" ]; then
        echo ""
        echo "⚠️  IMPORTANTE:"
        echo "   1. Apri l'app nel simulatore"
        echo "   2. Assicurati che l'app sia in modalità light (per consistenza)"
        echo "   3. Premi INVIO quando pronto..."
        read
    fi
    
    # Cattura ogni schermata
    for screen in "${SCREENS[@]}"; do
        local file_prefix="${screen%%:*}"
        local screen_name="${screen##*:}"
        local output_file="$SCREENSHOT_DIR/$size_folder/${file_prefix}.png"
        
        echo ""
        echo "📸 Schermata: $screen_name"
        echo "   Naviga alla schermata e premi INVIO per catturare..."
        read
        
        # Cattura screenshot
        xcrun simctl io "$DEVICE_UUID" screenshot "$output_file"
        
        if [ -f "$output_file" ]; then
            # Verifica dimensioni
            actual_size=$(sips -g pixelWidth -g pixelHeight "$output_file" | grep -E "pixel(Width|Height)" | awk '{print $2}' | tr '\n' 'x' | sed 's/x$//')
            expected="${dimensions}"
            
            if [ "$actual_size" == "$expected" ]; then
                echo "   ✅ Screenshot salvato: $output_file ($actual_size)"
            else
                echo "   ⚠️  Screenshot salvato ma dimensioni diverse"
                echo "      Atteso: $expected"
                echo "      Ottenuto: $actual_size"
            fi
        else
            echo "   ❌ Errore nel salvare lo screenshot"
        fi
    done
    
    echo ""
    echo "✅ Completato $device_name"
}

# Verifica Xcode
if ! command -v xcrun &> /dev/null; then
    echo "❌ Xcode Command Line Tools non trovati"
    echo "   Installa con: xcode-select --install"
    exit 1
fi

# Controlla se l'app è in esecuzione
echo "🔍 Verifica prerequisiti..."
echo ""
echo "⚠️  PRIMA DI CONTINUARE:"
echo "   1. Avvia l'app: npx expo start --ios"
echo "   2. Seleziona 'iPhone 15 Pro Max' come simulatore"
echo "   3. Attendi che l'app sia completamente caricata"
echo ""
echo "Premi INVIO per continuare..."
read

# Cattura screenshot per ogni dispositivo
for device in "iPhone 15 Pro Max" "iPhone 11 Pro Max" "iPhone 8 Plus"; do
    capture_for_device "$device"
    
    if [ "$device" != "iPhone 8 Plus" ]; then
        echo ""
        echo "📱 Cambio dispositivo..."
        echo "   Chiudi il simulatore corrente"
        echo "   Premi INVIO quando pronto per il prossimo dispositivo..."
        read
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ COMPLETATO!"
echo ""
echo "📁 Screenshot salvati in:"
echo "   $SCREENSHOT_DIR/"
echo ""
echo "📊 Riepilogo:"
for size_dir in 6.7-inch 6.5-inch 5.5-inch; do
    count=$(find "$SCREENSHOT_DIR/$size_dir" -name "*.png" 2>/dev/null | wc -l | tr -d ' ')
    echo "   $size_dir: $count screenshot"
done
echo ""
echo "📤 Prossimi passi:"
echo "   1. Verifica che le screenshot siano corrette"
echo "   2. Vai su App Store Connect"
echo "   3. Carica le screenshot nella sezione appropriata"
echo ""
echo "💡 Tip: Puoi usare 'Preview' per visualizzare tutte insieme:"
echo "   open $SCREENSHOT_DIR/6.7-inch/*.png"
