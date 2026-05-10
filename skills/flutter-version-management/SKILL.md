---
name: flutter-version-management
description: Pins and manages per-project Flutter SDK versions with FVM (Flutter Version Management). Use when the project has or needs a .fvmrc or .fvm/ directory, when contributors need a reproducible Flutter SDK, when installing FVM, pinning or switching the Flutter version, wiring FVM into VS Code or Android Studio, configuring CI to honor .fvmrc, or troubleshooting "wrong Flutter version" symptoms.
author: chalk
version: "1.1.0"
metadata-version: "3"
---

# Flutter Version Management (FVM)

## Overview

[FVM](https://fvm.app) pins a Flutter project to a specific SDK version so every contributor and CI runner builds against the same toolchain. This skill installs FVM, pins a project to a version, runs Flutter/Dart through FVM, configures IDEs, and wires up CI.

If the project has no `pubspec.yaml`, this is not a Flutter project — stop and ask the user before proceeding.

## Workflow

### 1. Discover current state

Run these in parallel and use the results to decide which steps below apply:

```bash
fvm --version 2>/dev/null || echo "fvm-not-installed"
test -f .fvmrc && cat .fvmrc || echo "no-.fvmrc"
test -d .fvm && ls .fvm || echo "no-.fvm-dir"
test -f pubspec.yaml && grep -E "^\s*sdk:|^\s*flutter:" pubspec.yaml || echo "no-pubspec"
grep -E "(^|/)\.fvm(/|$)" .gitignore 2>/dev/null || echo ".fvm-not-in-gitignore"
```

Branch on results:
- **No FVM installed** → Step 2 (Install FVM).
- **No `.fvmrc`** → Step 3 (Pin a version).
- **`.fvmrc` exists but `.fvm/flutter_sdk` missing** → run `fvm install` (Step 4).
- **All present, user wants to change version** → Step 5 (Switch version).
- **CI / IDE setup requested** → Steps 6 / 7.

### 2. Install FVM

Pick one method based on platform and existing tooling. Confirm with the user before installing.

| Platform | Recommended | Command |
|---|---|---|
| macOS (Homebrew user) | brew | `brew tap leoafarias/fvm && brew install fvm` |
| Any Unix | install script | `curl -fsSL https://fvm.app/install.sh \| bash` |
| Windows | Chocolatey | `choco install fvm` |
| Has Dart already | pub | `dart pub global activate fvm` |

After install, verify: `fvm --version` and `fvm doctor`.

### 3. Pin a version (new project or first-time pin)

1. Decide which version. Default to the channel/version already in use; otherwise the latest stable. List options with `fvm releases | tail -20` or use `stable`.
2. Run `fvm use <version>` from the project root. This:
   - Downloads the SDK if missing (cached globally in `~/fvm/versions/`).
   - Creates `.fvmrc` with `{"flutter": "<version>"}`.
   - Creates `.fvm/flutter_sdk` as a symlink to the cached SDK.
   - Runs `flutter pub get` (skip with `--skip-pub-get` for monorepos with custom bootstrap).
3. Add `.fvm/` to `.gitignore` (keep `.fvmrc` tracked):
   ```
   .fvm/
   !.fvmrc
   ```
4. Commit `.fvmrc` and the updated `.gitignore`. Do **not** commit `.fvm/flutter_sdk` — it is a machine-local symlink to a cached SDK.

### 4. Install the version a project already pins

```bash
fvm install        # reads .fvmrc
fvm doctor         # confirms symlinks resolve and SDK is healthy
fvm flutter --version
```

### 5. Switch versions

- **Same project, new version**: `fvm use <version>` (updates `.fvmrc`).
- **Force when contributing to a fork or a non-standard channel**: `fvm use <version> --force`.
- **Pin to an exact release rather than the channel head**: `fvm use <version> --pin`.
- **System-wide default for ad-hoc work outside any project**: `fvm global <version>`. Then add the global symlink to PATH: `export PATH="$HOME/fvm/default/bin:$PATH"` (zsh/bash rc).

### 6. IDE setup

**VS Code** — write/merge `.vscode/settings.json`:
```json
{
  "dart.flutterSdkPath": ".fvm/flutter_sdk",
  "search.exclude": { "**/.fvm": true },
  "files.watcherExclude": { "**/.fvm": true }
}
```

**Android Studio / IntelliJ** — point Flutter SDK path to `<project>/.fvm/flutter_sdk` in *Preferences → Languages & Frameworks → Flutter*. Restart the IDE after switching versions in `.fvmrc`.

After IDE setup, confirm Dart Analyzer picked up the change (Command Palette → *Dart: Restart Analysis Server*).

### 7. CI configuration

For GitHub Actions with `subosito/flutter-action`, read the version from `.fvmrc` so CI never drifts from local:

```yaml
- name: Read Flutter version
  id: fvm
  run: echo "version=$(jq -r .flutter .fvmrc)" >> "$GITHUB_OUTPUT"

- uses: subosito/flutter-action@v2
  with:
    flutter-version: ${{ steps.fvm.outputs.version }}
    channel: stable
```

Avoid installing FVM itself on CI runners — it adds startup time for no benefit. The `.fvmrc` is the source of truth; the action consumes it directly.

### 8. Run Flutter / Dart through FVM

Once pinned, all Flutter and Dart commands must go through FVM in this project, otherwise contributors will silently use their global SDK:

```bash
fvm flutter pub get
fvm flutter run
fvm flutter test
fvm dart run build_runner build
fvm dart format .
```

Encourage a shell alias only at the **user level** (`alias flu="fvm flutter"`), never as a project-level script that masks the explicit `fvm` prefix.

### 9. Test against multiple versions

For library/package authors validating compatibility:

```bash
fvm spawn 3.19.0 test
fvm spawn 3.22.0 test
fvm spawn beta test
```

`spawn` runs the command against a specific version without changing the project's pinned version.

### 10. Maintenance

- `fvm list` — show installed versions and which one each project uses.
- `fvm releases` — list available Flutter releases.
- `fvm remove <version>` — free disk space (each cached SDK is ~1–2 GB).
- `fvm doctor` — diagnose broken symlinks, PATH, or cache corruption.
- `fvm destroy` — nuclear option; removes the entire FVM cache. **Confirm with the user before running** — it deletes all cached SDKs across all projects.

## Output

Report back to the user with:
- Current Flutter version (from `fvm flutter --version`).
- Files created or modified (`.fvmrc`, `.gitignore`, `.vscode/settings.json`, CI workflow).
- Any commands the user must run themselves (e.g., shell PATH updates, IDE restart).
- Verification commands they can run to confirm setup.

## Anti-patterns

- **Mixing `fvm flutter` and bare `flutter` in the same project.** The whole point of FVM is reproducibility; calling the global Flutter even once defeats it. Audit `Makefile`, `package.json` scripts, shell scripts, and CI for unprefixed `flutter`/`dart` calls.
- **Committing `.fvm/flutter_sdk`.** It is a symlink to a machine-local cache — useless on another machine and bloats the repo if the symlink resolves on commit. Only `.fvmrc` belongs in version control.
- **Pinning to a channel name (`stable`, `beta`) on a serious project.** Channels move. Two contributors running `fvm install` a week apart end up on different SDKs. Use a concrete version (`3.22.0`) for shipped projects; reserve channels for exploratory work.
- **Installing FVM on CI just to read `.fvmrc`.** A one-line `jq` against `.fvmrc` plus `subosito/flutter-action` is faster and has fewer moving parts than installing FVM on every run.
- **Editing `.fvm/flutter_sdk/` directly to patch an SDK bug.** The symlink target is shared across projects; edits leak everywhere and disappear on `fvm install`. Use `fvm use <fork>/<branch>` to point at a fork instead.
- **Running `fvm destroy` to "clean up".** It wipes every cached SDK on the machine, forcing every project to re-download gigabytes. Use `fvm remove <version>` for targeted cleanup.
