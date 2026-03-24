# WhisperKey

**A free, open source, and extensible speech-to-text application that works completely offline.**

WhisperKey is a cross-platform desktop application that provides simple, privacy-focused speech transcription. Press a shortcut, speak, and have your words appear in any text field. This happens on your own computer without sending any information to the cloud.

Based on [Handy](https://github.com/cjpais/Handy) by CJ Pais.

## Why WhisperKey?

- **Free**: Accessibility tooling belongs in everyone's hands, not behind a paywall
- **Open Source**: Together we can build further
- **Private**: Your voice stays on your computer. Get transcriptions without sending audio to the cloud
- **Simple**: One tool, one job. Transcribe what you say and put it into a text box

## How It Works

1. **Press** a configurable keyboard shortcut to start/stop recording (or use push-to-talk mode)
2. **Speak** your words while the shortcut is active
3. **Release** and WhisperKey processes your speech locally
4. **Get** your transcribed text pasted directly into whatever app you're using

The process is entirely local:

- Silence is filtered using VAD (Voice Activity Detection) with Silero
- Transcription uses your choice of 6 engine types and 12 models:
  - **Whisper** (Small, Medium, Turbo, Large) — GPU-accelerated when available
  - **Whisper Breeze ASR** — fine-tuned for Mandarin + code-switching
  - **Parakeet** (V2, V3) — CPU-optimized with automatic language detection
  - **Moonshine** (Base, V2 Tiny, V2 Small, V2 Medium) — lightweight and fast
  - **SenseVoice** — multilingual speech understanding
  - **GigaAM v3** — Russian-optimized recognition
- Works on Windows, macOS, and Linux

## Quick Start

### Installation

1. Download the latest release from the [releases page](https://github.com/levelup-app-factory/whisperkey/releases) or the [website](https://whisperkey.org)
2. Install the application
3. Launch WhisperKey and grant necessary system permissions (microphone, accessibility)
4. Configure your preferred keyboard shortcuts in Settings
5. Start transcribing!

### Development Setup

For detailed build instructions including platform-specific requirements, see [BUILD.md](BUILD.md).

## Architecture

WhisperKey is built as a Tauri application combining:

- **Frontend**: React + TypeScript with Tailwind CSS for the settings UI
- **Backend**: Rust for system integration, audio processing, and ML inference
- **Core Libraries**:
  - `transcribe-rs` (v0.2.8): Unified speech recognition crate (features: whisper, parakeet, moonshine, sense_voice, gigaam)
  - `handy-keys` (v0.2.4): Keyboard shortcut handling
  - `ferrous-opencc` (v0.2.3): Chinese text conversion (Traditional/Simplified)
  - `clap` (v4): Command-line argument parsing
  - `cpal`: Cross-platform audio I/O
  - `vad-rs`: Voice Activity Detection
  - `rdev`: Global keyboard shortcuts and system events
  - `rubato`: Audio resampling

### Debug Mode

WhisperKey includes an advanced debug mode for development and troubleshooting. Access it by pressing:

- **macOS**: `Cmd+Shift+D`
- **Windows/Linux**: `Ctrl+Shift+D`

### CLI Parameters

WhisperKey supports command-line flags for controlling a running instance and customizing startup behavior. These work on all platforms (macOS, Windows, Linux).

**Remote control flags** (sent to an already-running instance via the single-instance plugin):

```bash
whisperkey --toggle-transcription    # Toggle recording on/off
whisperkey --toggle-post-process     # Toggle recording with post-processing on/off
whisperkey --cancel                  # Cancel the current operation
```

**Startup flags:**

```bash
whisperkey --start-hidden            # Start without showing the main window
whisperkey --no-tray                 # Start without the system tray icon
whisperkey --debug                   # Enable debug mode with verbose logging
whisperkey --help                    # Show all available flags
```

Flags can be combined for autostart scenarios:

```bash
whisperkey --start-hidden --no-tray
```

> **macOS tip:** When WhisperKey is installed as an app bundle, invoke the binary directly:
>
> ```bash
> /Applications/WhisperKey.app/Contents/MacOS/WhisperKey --toggle-transcription
> ```

## Known Issues & Current Limitations

This project is actively being developed and has some [known issues](https://github.com/levelup-app-factory/whisperkey/issues).

### Major Issues (Help Wanted)

**Whisper Model Crashes:**

- Whisper models crash on certain system configurations (Windows and Linux)
- Does not affect all systems - issue is configuration-dependent

**Wayland Support (Linux):**

- Limited support for Wayland display server
- Requires [`wtype`](https://github.com/atx/wtype) or [`dotool`](https://sr.ht/~geb/dotool/) for text input to work correctly (see [Linux Notes](#linux-notes) below for installation)

### Linux Notes

**Text Input Tools:**

For reliable text input on Linux, install the appropriate tool for your display server:

| Display Server | Recommended Tool | Install Command                                    |
| -------------- | ---------------- | -------------------------------------------------- |
| X11            | `xdotool`        | `sudo apt install xdotool`                         |
| Wayland        | `wtype`          | `sudo apt install wtype`                           |
| Both           | `dotool`         | `sudo apt install dotool` (requires `input` group) |

- **X11**: Install `xdotool` for both direct typing and clipboard paste shortcuts
- **Wayland**: Install `wtype` (preferred) or `dotool` for text input to work correctly
- **dotool setup**: Requires adding your user to the `input` group: `sudo usermod -aG input $USER` (then log out and back in)

Without these tools, WhisperKey falls back to enigo which may have limited compatibility, especially on Wayland.

**Other Notes:**

- **Runtime library dependency (`libgtk-layer-shell.so.0`)**:
  - WhisperKey links `gtk-layer-shell` on Linux. If startup fails with `error while loading shared libraries: libgtk-layer-shell.so.0`, install the runtime package for your distro:

    | Distro        | Package to install    | Example command                        |
    | ------------- | --------------------- | -------------------------------------- |
    | Ubuntu/Debian | `libgtk-layer-shell0` | `sudo apt install libgtk-layer-shell0` |
    | Fedora/RHEL   | `gtk-layer-shell`     | `sudo dnf install gtk-layer-shell`     |
    | Arch Linux    | `gtk-layer-shell`     | `sudo pacman -S gtk-layer-shell`       |

  - For building from source on Ubuntu/Debian, you may also need `libgtk-layer-shell-dev`.

- The recording overlay is disabled by default on Linux (`Overlay Position: None`) because certain compositors treat it as the active window. When the overlay is visible it can steal focus, which prevents WhisperKey from pasting back into the application that triggered transcription. If you enable the overlay anyway, be aware that clipboard-based pasting might fail or end up in the wrong window.
- If you are having trouble with the app, running with the environment variable `WEBKIT_DISABLE_DMABUF_RENDERER=1` may help
- **Global keyboard shortcuts (Wayland):** On Wayland, system-level shortcuts must be configured through your desktop environment or window manager. Use the [CLI flags](#cli-parameters) as the command for your custom shortcut.

  **GNOME:**
  1. Open **Settings > Keyboard > Keyboard Shortcuts > Custom Shortcuts**
  2. Click the **+** button to add a new shortcut
  3. Set the **Name** to `Toggle WhisperKey Transcription`
  4. Set the **Command** to `whisperkey --toggle-transcription`
  5. Click **Set Shortcut** and press your desired key combination (e.g., `Super+O`)

  **KDE Plasma:**
  1. Open **System Settings > Shortcuts > Custom Shortcuts**
  2. Click **Edit > New > Global Shortcut > Command/URL**
  3. Name it `Toggle WhisperKey Transcription`
  4. In the **Trigger** tab, set your desired key combination
  5. In the **Action** tab, set the command to `whisperkey --toggle-transcription`

  **Sway / i3:**

  Add to your config file (`~/.config/sway/config` or `~/.config/i3/config`):

  ```ini
  bindsym $mod+o exec whisperkey --toggle-transcription
  ```

  **Hyprland:**

  Add to your config file (`~/.config/hypr/hyprland.conf`):

  ```ini
  bind = $mainMod, O, exec, whisperkey --toggle-transcription
  ```

- You can also manage global shortcuts outside of WhisperKey via Unix signals, which lets Wayland window managers or other hotkey daemons keep ownership of keybindings:

  | Signal    | Action                                    | Example                     |
  | --------- | ----------------------------------------- | --------------------------- |
  | `SIGUSR2` | Toggle transcription                      | `pkill -USR2 -n whisperkey` |
  | `SIGUSR1` | Toggle transcription with post-processing | `pkill -USR1 -n whisperkey` |

  Example Sway config:

  ```ini
  bindsym $mod+o exec pkill -USR2 -n whisperkey
  bindsym $mod+p exec pkill -USR1 -n whisperkey
  ```

  `pkill` here simply delivers the signal—it does not terminate the process.

### Platform Support

- **macOS (both Intel and Apple Silicon)**
- **x64 Windows**
- **x64 Linux**

### System Requirements/Recommendations

The following are recommendations for running WhisperKey on your own machine.

**For Whisper Models:**

- **macOS**: M series Mac, Intel Mac
- **Windows**: Intel, AMD, or NVIDIA GPU
- **Linux**: Intel, AMD, or NVIDIA GPU
  - Ubuntu 22.04, 24.04

**For CPU-based Models (Parakeet, Moonshine, SenseVoice, GigaAM):**

- **CPU-only operation** - runs on a wide variety of hardware
- **Minimum**: Intel Skylake (6th gen) or equivalent AMD processors
- **Moonshine models** are the lightest (31-192 MB) and run well on low-end hardware
- **Parakeet V3** has automatic language detection - no manual language selection required

## Troubleshooting

### Manual Model Installation (For Proxy Users or Network Restrictions)

If you're behind a proxy, firewall, or in a restricted network environment where WhisperKey cannot download models automatically, you can manually download and install them.

#### Step 1: Find Your App Data Directory

1. Open WhisperKey settings
2. Navigate to the **About** section
3. Copy the "App Data Directory" path shown there

The typical paths are:

- **macOS**: `~/Library/Application Support/com.levelupbasket.whisperkey/`
- **Windows**: `C:\Users\{username}\AppData\Roaming\com.levelupbasket.whisperkey\`
- **Linux**: `~/.config/com.levelupbasket.whisperkey/`

#### Step 2: Create Models Directory

Inside your app data directory, create a `models` folder if it doesn't already exist:

```bash
# macOS/Linux
mkdir -p ~/Library/Application\ Support/com.levelupbasket.whisperkey/models

# Windows (PowerShell)
New-Item -ItemType Directory -Force -Path "$env:APPDATA\com.levelupbasket.whisperkey\models"
```

#### Step 3: Download Model Files

Download the models you want from below

**Whisper Models (single .bin files):**

- Small (487 MB): `https://blob.handy.computer/ggml-small.bin`
- Medium (492 MB): `https://blob.handy.computer/whisper-medium-q4_1.bin`
- Turbo (1600 MB): `https://blob.handy.computer/ggml-large-v3-turbo.bin`
- Large (1100 MB): `https://blob.handy.computer/ggml-large-v3-q5_0.bin`
- Breeze ASR (1080 MB): `https://blob.handy.computer/breeze-asr-q5_k.bin`

**Parakeet Models (compressed archives):**

- V2 (473 MB): `https://blob.handy.computer/parakeet-v2-int8.tar.gz`
- V3 (478 MB): `https://blob.handy.computer/parakeet-v3-int8.tar.gz`

**Moonshine Models (compressed archives):**

- Base (58 MB): `https://blob.handy.computer/moonshine-base.tar.gz`
- V2 Tiny (31 MB): `https://blob.handy.computer/moonshine-tiny-streaming-en.tar.gz`
- V2 Small (100 MB): `https://blob.handy.computer/moonshine-small-streaming-en.tar.gz`
- V2 Medium (192 MB): `https://blob.handy.computer/moonshine-medium-streaming-en.tar.gz`

**SenseVoice Model (compressed archive):**

- SenseVoice (160 MB): `https://blob.handy.computer/sense-voice-int8.tar.gz`

**GigaAM Model (single .onnx file):**

- GigaAM v3 (225 MB): `https://blob.handy.computer/giga-am-v3.int8.onnx`

#### Step 4: Install Models

**For Whisper Models (.bin files):**

Simply place the `.bin` file directly into the `models` directory:

```
{app_data_dir}/models/
├── ggml-small.bin
├── whisper-medium-q4_1.bin
├── ggml-large-v3-turbo.bin
├── ggml-large-v3-q5_0.bin
└── breeze-asr-q5_k.bin
```

**For Parakeet Models (.tar.gz archives):**

1. Extract the `.tar.gz` file
2. Place the **extracted directory** into the `models` folder
3. The directory must be named exactly as follows:
   - **Parakeet V2**: `parakeet-tdt-0.6b-v2-int8`
   - **Parakeet V3**: `parakeet-tdt-0.6b-v3-int8`

**For Moonshine Models (.tar.gz archives):**

1. Extract the `.tar.gz` file
2. Place the **extracted directory** into the `models` folder
3. The directory must be named exactly as follows:
   - **Base**: `moonshine-base`
   - **V2 Tiny**: `moonshine-tiny-streaming-en`
   - **V2 Small**: `moonshine-small-streaming-en`
   - **V2 Medium**: `moonshine-medium-streaming-en`

**For SenseVoice (.tar.gz archive):**

1. Extract the `.tar.gz` file
2. Place the **extracted directory** named `sense-voice-int8` into the `models` folder

**For GigaAM (.onnx file):**

Simply place the `.onnx` file directly into the `models` directory:

```
{app_data_dir}/models/
└── giga-am-v3.int8.onnx
```

**Important Notes:**

- For directory-based models (Parakeet, Moonshine, SenseVoice), the extracted directory name **must** match exactly as shown above
- Do not rename the `.bin` or `.onnx` files for single-file models -- use the exact filenames from the download URLs
- After placing the files, restart WhisperKey to detect the new models

#### Step 5: Verify Installation

1. Restart WhisperKey
2. Open Settings > Models
3. Your manually installed models should now appear as "Downloaded"
4. Select the model you want to use and test transcription

### Custom Whisper Models

WhisperKey can auto-discover custom Whisper GGML models placed in the `models` directory. This is useful for users who want to use fine-tuned or community models not included in the default model list.

**How to use:**

1. Obtain a Whisper model in GGML `.bin` format (e.g., from [Hugging Face](https://huggingface.co/models?search=whisper%20ggml))
2. Place the `.bin` file in your `models` directory (see paths above)
3. Restart WhisperKey to discover the new model
4. The model will appear in the "Custom Models" section of the Models settings page

**Important:**

- Community models are user-provided and may not receive troubleshooting assistance
- The model must be a valid Whisper GGML format (`.bin` file)
- Model name is derived from the filename (e.g., `my-custom-model.bin` → "My Custom Model")

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- **[Handy](https://github.com/cjpais/Handy)** by CJ Pais — the original open source project this is forked from
- **Whisper** by OpenAI for the speech recognition model
- **whisper.cpp and ggml** for amazing cross-platform whisper inference/acceleration
- **Silero** for great lightweight VAD
- **Tauri** team for the excellent Rust-based app framework
