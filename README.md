# 🎬 ¡Aventura Retro 1930!

Juego infantil 2D independiente para Android (APK con Capacitor en modo horizontal inmersivo `1340x800`) diseñado para **Carlos, Mateo y Ariel**, con estética de **Caricatura Clásica de los años 1930** (Rubber Hose a color tipo *Silly Symphonies / Cuphead* a 12 fps y fondos en acuarela vintage).

## ✨ Características Principales
- **Estilo Caricatura 1930 (Rubber Hose)**: Extremidades flexibles curvas, guantes blancos de 3 rayitas, ojos *pie-cut*, rebote rítmico animado a 12 fps y fondos en acuarela vintage con textura de papel.
- **Soporte listo para Sprite Sheets PNG 512x512**: Si deseas reemplazar los personajes o jefes con arte dibujado en PNG (`512x512`, cuadrícula `4x4` de `128x128` px), solo coloca los archivos en `www/assets/sprites/` siguiendo `www/assets/sprites/manifest.json`.
- **3 Personajes Jugables**:
  - **Carlos** (*Explorador Valiente*): +15% fuerza con Espada y Hacha.
  - **Mateo** (*Inventor Veloz*): +15% velocidad y recolección rápida.
  - **Ariel** (*Estrella Mágica*): +20% poder mágico con Varita Estelar y +1 corazón extra.
- **4 Mundos Explorables con Cofres Secretos y Jefes Cómicos**:
  1. 🌲 **Bosque Encantado** — Jefe: *Don Tronco Gruñón*
  2. 🏜️ **Desierto Dorado** — Jefe: *Rey Tut-Tón*
  3. 🏴‍☠️ **Mares Piratas** — Jefe: *Capitán Pulpo Bigotes*
  4. 🏔️ **Montaña Nevada** — Jefe: *Yeti Helado Señor Brrr*
- **Recolección y Mesa de Crafteo Visual**: Recoge **Madera 🪵**, **Piedra 🪨** y **Cristales 💎** para fabricar y equipar **Hacha Retro**, **Espada Clásica**, **Pico de Cristal**, **Varita Estelar** (a distancia), **Escudo Dorado** y **Pociones Burbujeantes**.
- **Controles Táctiles Grandes + Audio + Voz Latina**: Joystick virtual y botones ergonómicos para tablet Android, música ragtime/efectos Web Audio y plugin nativo `RetroTts` para voz latina natural de Android TTS.
- **GitHub Actions + Releases + Auto-Actualización In-App**: Cada push a `main` o tag `v*` compila automáticamente el APK firmado y publica un Release en GitHub; la app detecta nuevas versiones desde el botón ⬇️ y descarga/instala el APK directamente en Android.

## 🛠️ Desarrollo Local
```bash
npm install
npm run check
npm run dev
```

## 📱 Sincronizar y Compilar Android
```bash
npx cap sync android
cd android && ./gradlew assembleRelease
```
