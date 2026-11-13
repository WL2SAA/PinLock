# PinLock

A [Revenge](https://github.com/revenge-mod) / Vendetta plugin that locks Discord behind a PIN.

## Features

- 4-6 digit PIN with a numeric keypad lock screen
- Lock on app launch
- Relock after leaving the app: immediately, 30s, 1m, or 5m
- Lock instantly from settings
- Brute-force protection: 5 wrong attempts triggers a 30 second lockout
- PIN is stored as a salted hash, never in plain text

## Install

1. Host the plugin folder (GitHub Pages, or any static host).
2. In Revenge: **Settings → Plugins → Install**, then paste the plugin URL.
3. Enable **PinLock** and open its settings to set a PIN.

## Structure

```
pinlock/
├── manifest.json
├── index.tsx        # patches root component, app-state relock
├── state.ts         # lock state, PIN hashing
├── LockScreen.tsx   # keypad overlay
└── Settings.tsx     # PIN + behavior settings
```

## Usage

| Setting | Description |
| --- | --- |
| Set / Change PIN | 4-6 digits, entered twice |
| Remove PIN | Disables the lock |
| Lock on app launch | Lock every cold start |
| Relock timeout | How long Discord can stay in the background before relocking |
| Lock now | Locks immediately |

## Forgot your PIN?

The PIN lives in the plugin's storage, so disable or uninstall the plugin from Revenge's plugin list (use safe mode if the lock screen blocks access), then reinstall.

## Limitations

- This is a UI-level privacy gate, not encryption. Someone with device access, file access, or the ability to disable plugins can bypass it.
- The hash is a fast non-cryptographic one, which is fine for a local gate but not for protecting against offline attacks.
- The lock hooks into one of several root components (`AppContainer`, `RootNavigator`, `MainTabsNavigator`). If a Discord update renames them, update `ROOT_CANDIDATES` in `index.tsx`.
- Notifications may still show message previews while locked. Disable previews in system settings for full privacy.

## Development

```bash
pnpm install
pnpm build
```

## License

MIT
