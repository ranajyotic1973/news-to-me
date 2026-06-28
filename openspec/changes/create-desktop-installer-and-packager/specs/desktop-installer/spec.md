## ADDED Requirements

### Requirement: Windows installer creation
The system SHALL generate a Windows installer (.exe) that packages the complete News To Me application and all dependencies, installable via a standard Windows installation wizard.

#### Scenario: Installer is created during build
- **WHEN** the build process completes
- **THEN** a .exe file is generated in the dist/ directory ready for distribution

#### Scenario: Installer workflow
- **WHEN** user double-clicks the installer
- **THEN** Windows installer wizard appears with application name and installation options

#### Scenario: Default installation path
- **WHEN** user proceeds with installation
- **THEN** application is installed to the default Program Files directory (Windows standard location)

#### Scenario: Start Menu entry created
- **WHEN** installation completes
- **THEN** application appears in Windows Start Menu under the application name

#### Scenario: Installer size is reasonable
- **WHEN** the installer is built
- **THEN** the .exe file size is under 200MB (monitoring metric for bundled backend and assets)

### Requirement: Installer configuration via electron-builder
The system SHALL use electron-builder with appropriate configuration for creating Windows installers without requiring manual build steps.

#### Scenario: electron-builder.json defines Windows target
- **WHEN** electron-builder runs
- **THEN** electron-builder.json includes nsis configuration for Windows installer generation

#### Scenario: Build script creates installer
- **WHEN** npm run build is executed
- **THEN** installer is created automatically as part of the build process

### Requirement: Clean uninstall
The system SHALL allow users to completely remove the application via Windows Add/Remove Programs, cleaning up all installed files and registry entries.

#### Scenario: Uninstall removes application files
- **WHEN** user uninstalls via Windows Add/Remove Programs
- **THEN** all application files are removed from the installation directory

#### Scenario: Registry cleanup
- **WHEN** uninstall completes
- **THEN** no registry entries related to the application remain (Windows standard)
