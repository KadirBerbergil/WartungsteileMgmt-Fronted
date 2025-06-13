# Wartungsteile Management System - Frontend

## Übersicht

Das Wartungsteile Frontend ist eine moderne React-Anwendung zur Verwaltung von Industriemaschinen und deren Wartungsteilen. Die Benutzeroberfläche bietet eine intuitive Verwaltung von FMB Turbo-Magazinen und deren Wartungskomponenten.

## Features

- **Dashboard**: Übersicht über Systemstatistiken und wichtige Kennzahlen
- **Maschinenverwaltung**: 
  - Anlegen, Bearbeiten und Löschen von Maschinen
  - Detaillierte Magazin-Eigenschaften (über 40 Felder)
  - Wartungshistorie und Betriebsstunden-Tracking
- **Wartungsteileverwaltung**:
  - CRUD-Operationen für Wartungsteile
  - Lagerbestandsverwaltung mit visuellen Indikatoren
  - Kompatibilitätsprüfung
- **Wartungs-Workflow**: Geführter Prozess für Maschinenwartungen

## Technologie-Stack

- **React 18** mit TypeScript
- **Vite** als Build-Tool
- **Tailwind CSS** für Styling
- **React Query (TanStack Query)** für Server State Management
- **React Router** für Navigation
- **Axios** für API-Kommunikation
- **Heroicons** für Icons
- **React Hook Form** für Formulare

## Projektstruktur

```
wartungsteile-frontend/
├── src/
│   ├── components/         # Wiederverwendbare UI-Komponenten
│   │   ├── common/        # Allgemeine Komponenten
│   │   ├── domain/        # Domain-spezifische Komponenten
│   │   └── layout/        # Layout-Komponenten
│   ├── pages/             # Seiten-Komponenten
│   │   ├── dashboard/     # Dashboard
│   │   ├── machines/      # Maschinen-Verwaltung
│   │   └── parts/         # Wartungsteile-Verwaltung
│   ├── services/          # API-Service Layer
│   ├── hooks/             # Custom React Hooks
│   ├── types/             # TypeScript Type Definitionen
│   └── config/            # Konfigurationsdateien
├── public/                # Statische Assets
└── package.json          # NPM Dependencies
```

## Erste Schritte

### Voraussetzungen

- Node.js 18+ und npm/yarn
- Laufendes Backend (WartungsteileMgmt API)

### Installation

1. Repository klonen:
```bash
git clone [repository-url]
cd WartungsteileMgmt-Fronted/wartungsteile-frontend
```

2. Dependencies installieren:
```bash
npm install
# oder
yarn install
```

3. Umgebungsvariablen konfigurieren (optional):
```bash
# .env.local erstellen für lokale Überschreibungen
VITE_API_URL=https://localhost:7024
```

4. Entwicklungsserver starten:
```bash
npm run dev
# oder
yarn dev
```

Die Anwendung läuft standardmäßig auf `http://localhost:3000`

## Entwicklung

### Verfügbare Scripts

- `npm run dev` - Startet den Entwicklungsserver
- `npm run build` - Erstellt die Produktions-Build
- `npm run preview` - Vorschau der Produktions-Build
- `npm run lint` - Führt ESLint aus
- `npm run type-check` - TypeScript Type-Checking

### API-Konfiguration

Die API-URL wird über Vite-Proxy konfiguriert (`vite.config.ts`):
```typescript
proxy: {
  '/api': {
    target: 'https://localhost:7024',
    changeOrigin: true,
    secure: false
  }
}
```

### Komponenten-Entwicklung

1. **Neue Komponente erstellen**:
   - Funktionale Komponenten mit TypeScript verwenden
   - Props mit Interfaces definieren
   - Tailwind CSS für Styling

2. **State Management**:
   - React Query für Server-State
   - React Hooks für lokalen State
   - Context API für globalen UI-State

3. **Formular-Handling**:
   - React Hook Form für komplexe Formulare
   - Validierung auf Client- und Server-Seite

### Code-Stil

- **TypeScript**: Strikte Type-Checking aktiviert
- **Komponenten**: Funktionale Komponenten mit Hooks
- **Styling**: Tailwind CSS Utility-First Approach
- **Imports**: Absolute Imports wo möglich
- **Naming**: PascalCase für Komponenten, camelCase für Funktionen

## Features im Detail

### Dashboard
- Anzahl der Maschinen
- Wartungsteile-Bestand
- Anstehende Wartungen
- Lagerbestands-Warnungen

### Maschinenverwaltung
- **Liste**: Übersicht aller Maschinen mit Status
- **Detail**: Vollständige Maschineninformationen
- **Editor**: Bearbeitung der Magazin-Eigenschaften
- **Wartung**: Durchführung von Wartungen mit Teile-Austausch

### Wartungsteile
- **Katalog**: Alle verfügbaren Teile
- **Lagerbestand**: Visuelle Anzeige des Bestands
- **Kompatibilität**: Welche Teile passen zu welchen Maschinen

## Deployment

### Produktions-Build
```bash
npm run build
# Output in dist/ Ordner
```

### Docker
```dockerfile
# Multi-stage Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### Umgebungsvariablen
- `VITE_API_URL` - Backend API URL
- `VITE_APP_TITLE` - Anwendungstitel

## Performance-Optimierung

- **Code Splitting**: Automatisch durch Vite
- **Lazy Loading**: Für Routen implementiert
- **React Query**: Caching und Background Refetch
- **Memoization**: Für teure Berechnungen

## Browser-Unterstützung

- Chrome/Edge (neueste 2 Versionen)
- Firefox (neueste 2 Versionen)
- Safari 14+

## Troubleshooting

### Häufige Probleme

1. **API-Verbindung fehlgeschlagen**:
   - Backend läuft auf `https://localhost:7024`?
   - CORS-Einstellungen im Backend prüfen

2. **Build-Fehler**:
   - Node-Version prüfen (18+)
   - `node_modules` löschen und neu installieren

3. **TypeScript-Fehler**:
   - `npm run type-check` für Details
   - VSCode: TypeScript-Version prüfen

## Lizenz

[Ihre Lizenz hier]

## Kontakt

[Ihre Kontaktinformationen]