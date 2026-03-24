# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Prerequisites:** [Rust](https://rustup.rs/) (latest stable), [Bun](https://bun.sh/)

```bash
# Install dependencies
bun install

# Run in development mode
bun run tauri dev
# If cmake error on macOS:
CMAKE_POLICY_VERSION_MINIMUM=3.5 bun run tauri dev

# Build for production
bun run tauri build

# Linting and formatting (run before committing)
bun run lint              # ESLint for frontend
bun run lint:fix          # ESLint with auto-fix
bun run format            # Prettier + cargo fmt
bun run format:check      # Check formatting without changes
```

**Model Setup (Required for Development):**

```bash
mkdir -p src-tauri/resources/models
curl -o src-tauri/resources/models/silero_vad_v4.onnx https://blob.handy.computer/silero_vad_v4.onnx
```

## Architecture Overview

WhisperKey is a cross-platform desktop speech-to-text app built with Tauri 2.x (Rust backend + React/TypeScript frontend).

### Backend Structure (src-tauri/src/)

- `lib.rs` - Main entry point, Tauri setup, manager initialization
- `managers/` - Core business logic:
  - `audio.rs` - Audio recording and device management
  - `model.rs` - Model downloading and management
  - `transcription.rs` - Speech-to-text processing pipeline
  - `history.rs` - Transcription history storage
- `audio_toolkit/` - Low-level audio processing:
  - `audio/` - Device enumeration, recording, resampling
  - `vad/` - Voice Activity Detection (Silero VAD)
- `commands/` - Tauri command handlers for frontend communication
- `shortcut/` - Global keyboard shortcut handling:
  - `mod.rs` - Module exports
  - `handler.rs` - Shortcut event handler
  - `handy_keys.rs` - Key mapping via handy-keys crate
  - `tauri_impl.rs` - Tauri integration
- `settings.rs` - Application settings management
- `actions.rs` - User action definitions
- `clipboard.rs` - Clipboard access
- `overlay.rs` - Recording overlay window
- `tray.rs` - System tray management
- `tray_i18n.rs` - Tray menu translations
- `transcription_coordinator.rs` - Orchestrates transcription pipeline
- `input.rs` - Text input/paste methods
- `llm_client.rs` - LLM post-processing client
- `apple_intelligence.rs` - Apple Intelligence integration (macOS)
- `audio_feedback.rs` - Audio feedback sounds
- `portable.rs` - Portable mode support
- `utils.rs` - Shared utility functions
- `helpers/` - Helper modules:
  - `mod.rs` - Module exports
  - `clamshell.rs` - Clamshell (lid closed) detection
- `managers/transcription_mock.rs` - Mock transcription for testing

### Frontend Structure (src/)

- `App.tsx` - Main component with onboarding flow
- `components/settings/` - Settings UI (57 files)
- `components/model-selector/` - Model management interface
- `components/onboarding/` - First-run experience
- `components/footer/` - App footer
- `components/icons/` - Custom icon components (6 icons + index)
- `components/shared/` - Shared components (ProgressBar)
- `components/ui/` - UI primitives (17 components: Alert, Button, Input, Select, Slider, ToggleSwitch, Tooltip, etc.)
- `components/update-checker/` - Auto-update checker
- `hooks/useSettings.ts`, `useOsType.ts` - State management hooks
- `stores/settingsStore.ts`, `modelStore.ts` - Zustand stores
- `lib/` - Shared utilities:
  - `constants/` - App constants (languages)
  - `types/` - TypeScript type definitions (events)
  - `utils/` - Utility functions (format, keyboard, modelTranslation, rtl)
- `bindings.ts` - Auto-generated Tauri type bindings (via tauri-specta)
- `overlay/` - Recording overlay window code

### Key Patterns

**Manager Pattern:** Core functionality organized into managers (Audio, Model, Transcription) initialized at startup and managed via Tauri state.

**Command-Event Architecture:** Frontend → Backend via Tauri commands; Backend → Frontend via events.

**Pipeline Processing:** Audio → VAD → Engine (Whisper/Parakeet/Moonshine/SenseVoice/GigaAM) → Text output → Clipboard/Paste

**State Flow:** Zustand → Tauri Command → Rust State → Persistence (tauri-plugin-store)

## Internationalization (i18n)

All user-facing strings must use i18next translations. ESLint enforces this (no hardcoded strings in JSX).

**Adding new text:**

1. Add key to `src/i18n/locales/en/translation.json`
2. Use in component: `const { t } = useTranslation(); t('key.path')`

**File structure:**

```
src/i18n/
├── index.ts           # i18n setup
├── languages.ts       # Language metadata
└── locales/           # 17 locales
    ├── ar/translation.json  # Arabic
    ├── cs/translation.json  # Czech
    ├── de/translation.json  # German
    ├── en/translation.json  # English (source)
    ├── es/translation.json  # Spanish
    ├── fr/translation.json  # French
    ├── it/translation.json  # Italian
    ├── ja/translation.json  # Japanese
    ├── ko/translation.json  # Korean
    ├── pl/translation.json  # Polish
    ├── pt/translation.json  # Portuguese
    ├── ru/translation.json  # Russian
    ├── tr/translation.json  # Turkish
    ├── uk/translation.json  # Ukrainian
    ├── vi/translation.json  # Vietnamese
    ├── zh/translation.json  # Chinese (Simplified)
    └── zh-TW/translation.json  # Chinese (Traditional)
```

## Code Style

**Rust:**

- Run `cargo fmt` and `cargo clippy` before committing
- Handle errors explicitly (avoid unwrap in production)
- Use descriptive names, add doc comments for public APIs

**TypeScript/React:**

- Strict TypeScript, avoid `any` types
- Functional components with hooks
- Tailwind CSS for styling
- Path aliases: `@/` → `./src/`

## Commit Guidelines

Use conventional commits:

- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation
- `refactor:` code refactoring
- `chore:` maintenance

## CLI Parameters

WhisperKey supports command-line parameters on all platforms for integration with scripts, window managers, and autostart configurations.

**Implementation files:**

- `src-tauri/src/cli.rs` - CLI argument definitions (clap derive)
- `src-tauri/src/main.rs` - Argument parsing before Tauri launch
- `src-tauri/src/lib.rs` - Applying CLI overrides (setup closure + single-instance callback)
- `src-tauri/src/signal_handle.rs` - `send_transcription_input()` reusable function

**Available flags:**

| Flag                     | Description                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `--toggle-transcription` | Toggle recording on/off on a running instance (via `tauri_plugin_single_instance`) |
| `--toggle-post-process`  | Toggle recording with post-processing on/off on a running instance                 |
| `--cancel`               | Cancel the current operation on a running instance                                 |
| `--start-hidden`         | Launch without showing the main window (tray icon still visible)                   |
| `--no-tray`              | Launch without the system tray icon (closing window quits the app)                 |
| `--debug`                | Enable debug mode with verbose (Trace) logging                                     |

**Key design decisions:**

- CLI flags are runtime-only overrides — they do NOT modify persisted settings
- Remote control flags (`--toggle-transcription`, `--toggle-post-process`, `--cancel`) work by launching a second instance that sends its args to the running instance via `tauri_plugin_single_instance`, then exits
- `send_transcription_input()` in `signal_handle.rs` is shared between signal handlers and CLI to avoid code duplication
- `CliArgs` is stored in Tauri managed state (`.manage()`) so it's accessible in `on_window_event` and other handlers

## Debug Mode

Access debug features: `Cmd+Shift+D` (macOS) or `Ctrl+Shift+D` (Windows/Linux)

## Platform Notes

- **macOS**: Metal acceleration, accessibility permissions required
- **Windows**: Vulkan acceleration, code signing
- **Linux**: OpenBLAS + Vulkan, limited Wayland support, overlay disabled by default
