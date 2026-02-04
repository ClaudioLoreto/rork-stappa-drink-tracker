#!/bin/sh

# Xcode Cloud post-clone script
# Installa le dipendenze necessarie per la build iOS

set -e

echo "📦 Installing Node.js dependencies..."
cd "$CI_PRIMARY_REPOSITORY_PATH"
npm install

echo "📱 Installing CocoaPods dependencies..."
cd "$CI_PRIMARY_REPOSITORY_PATH/ios"

# Installa CocoaPods se non presente
if ! command -v pod &> /dev/null; then
    echo "Installing CocoaPods..."
    gem install cocoapods
fi

# Installa i Pods
pod install --repo-update

echo "✅ Dependencies installed successfully!"
