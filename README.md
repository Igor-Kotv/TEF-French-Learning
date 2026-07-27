# TEF Écriture

Lightweight French writing trainer for TEF practice. It shares one React app across Electron desktop and an iPhone-ready Capacitor target.

## Commands

- `corepack pnpm install` installs dependencies.
- `corepack pnpm dev` starts the Electron app.
- `corepack pnpm web:dev` starts the mobile-friendly web app.
- `corepack pnpm web:build` builds the GitHub Pages website version into `dist/`.
- `corepack pnpm web:preview` previews the built website locally.
- `corepack pnpm web:publish` pushes `main` to trigger the GitHub Pages deployment workflow.
- `corepack pnpm build` builds the Electron app.
- `corepack pnpm package:mac` creates an unpacked macOS `.app` in `release/mac-arm64/`.
- `corepack pnpm dist:mac` creates distributable macOS artifacts in `release/`.
- `corepack pnpm ios:sync` builds and syncs the React app into iOS.
- `corepack pnpm ios:open` opens the iOS project in Xcode.

## Website

The website build uses the same React app as Electron and iOS, but it is built with a GitHub Pages base path:

```sh
corepack pnpm web:build
```

Pushing `main` publishes the website through `.github/workflows/deploy-pages.yml`. You can use the publish command after committing changes:

```sh
corepack pnpm web:publish
```

If the workflow fails at "Configure GitHub Pages" with a Pages "Not Found" error, enable Pages once in GitHub under Settings -> Pages -> Source -> GitHub Actions. GitHub's default `GITHUB_TOKEN` cannot enable Pages for a repository that does not already have Pages configured.

## TEF Focus

- Section A: 25 minutes, 80-word minimum, article continuation prompts.
- Section B: 35 minutes, 200-word minimum, opinion argument prompts.
- Grammar checking is local and optional, designed for quick practice feedback.
- Task screenshots can be imported as images. OCR runs only when importing, then the extracted text can be reviewed and added as a custom TEF exercise.
- French OCR language data is packaged with the app. Tesseract's worker/core are loaded lazily on first image import to keep the normal app bundle small.
