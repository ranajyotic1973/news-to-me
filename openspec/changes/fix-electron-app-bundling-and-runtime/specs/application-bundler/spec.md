## MODIFIED Requirements

### Requirement: electron-builder includes all necessary files

The electron-builder configuration SHALL include all required files (frontend build, backend executable, node_modules) in the packaged application.

#### Scenario: dist-backend directory is included
- **WHEN** electron-builder packages the application
- **THEN** dist-backend directory containing the bundled backend executable is included in the final package

#### Scenario: All platform binaries are included
- **WHEN** building the macOS app
- **THEN** both arm64 and x64 backend binaries are included in the universal app bundle

#### Scenario: Frontend assets are included
- **WHEN** user runs the installed application
- **THEN** all Vite-built frontend files (index.html, .js bundles, styles) are present in the app directory

### Requirement: pkg bundler configuration optimization

The pkg bundler configuration in package.json SHALL explicitly specify assets, scripts, and compression settings to ensure complete bundling.

#### Scenario: pkg compresses output
- **WHEN** building backend executable
- **THEN** output file is compressed with Brotli, reducing size while maintaining functionality

#### Scenario: pkg includes asset files
- **WHEN** backend executable runs
- **THEN** all referenced asset files (templates, configs) are accessible from within the bundle

#### Scenario: pkg targets correct Node versions
- **WHEN** creating backend executable
- **THEN** targets are node18-{platform}-{arch} matching the Electron/system requirements

### Requirement: Installer creation for all platforms

Installers for Windows (NSIS), macOS (DMG), and Linux (AppImage, DEB) SHALL be created with all bundled components included.

#### Scenario: Windows installer is complete
- **WHEN** user runs News To Me Setup.exe
- **THEN** both frontend and backend executables are installed with no additional downloads

#### Scenario: macOS installer is universal
- **WHEN** user opens News To Me.dmg on any Mac
- **THEN** the app works correctly on both Intel and Apple Silicon without requiring Rosetta translation

#### Scenario: Linux packages include backend
- **WHEN** user installs from .AppImage or .deb
- **THEN** bundled backend executable is available and executable

### Requirement: No external Node.js requirement

Installers SHALL NOT require users to install Node.js separately or have it in their system PATH.

#### Scenario: User without Node.js can install
- **WHEN** user without Node.js downloads and runs installer
- **THEN** installation completes successfully

#### Scenario: Application runs without Node.js
- **WHEN** user launches the application on system without Node.js
- **THEN** application starts successfully and is fully functional
