#!/bin/bash

echo "========================================="
echo "  BUILD SCRIPT - Projetos Dinâmicos"
echo "========================================="

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
RELEASES_DIR="$PROJECT_DIR/releases"

mkdir -p "$RELEASES_DIR"

echo ""
echo "1️⃣  Limpando builds anteriores..."
rm -rf "$RELEASES_DIR"/*
rm -rf dist/
rm -rf src-tauri/target/release/bundle/

echo ""
echo "2️⃣  Build Frontend (Vite)..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build do frontend"
    exit 1
fi

echo ""
echo "3️⃣  Build Desktop (Tauri)..."
echo "   Plataformas disponíveis: nsis, msi, deb, rpm, dmg, app"
echo "   (Alguns requieren ferramentas específicas)"

cd src-tauri
cargo build --release 2>/dev/null || echo "   ⚠️ Rust não instalado - pulando desktop"

if [ -d "target/release/bundle" ]; then
    echo ""
    echo "   📦 Copiando bundles desktop..."
    cp -r target/release/bundle/nsis/*.exe "$RELEASES_DIR/" 2>/dev/null
    cp -r target/release/bundle/msi/*.msi "$RELEASES_DIR/" 2>/dev/null
    cp -r target/release/bundle/deb/*.deb "$RELEASES_DIR/" 2>/dev/null
    cp -r target/release/bundle/rpm/*.rpm "$RELEASES_DIR/" 2>/dev/null
    cp -r target/release/bundle/dmg/*.dmg "$RELEASES_DIR/" 2>/dev/null
fi

cd ..

echo ""
echo "4️⃣  Build Android (Capacitor)..."
npx cap sync android 2>/dev/null || echo "   ⚠️ Android SDK não configurado"

if [ -d "android/app/build/outputs/apk" ]; then
    cp android/app/build/outputs/apk/debug/*.apk "$RELEASES_DIR/" 2>/dev/null
fi

echo ""
echo "5️⃣  Criando código fonte..."
zip -r "$RELEASES_DIR/source.zip" . -x "node_modules/*" -x "src-tauri/target/*" -x "android/*" -x ".git/*"

echo ""
echo "========================================="
echo "  ✅ Build concluído!"
echo "========================================="
echo ""
echo "📁 Arquivos em: $RELEASES_DIR"
ls -lh "$RELEASES_DIR/"
echo ""
echo "⚠️  Para macOS .dmg/.app: requer Xcode no macOS"
echo "⚠️  Para Android APK: requer Android Studio/SDK"