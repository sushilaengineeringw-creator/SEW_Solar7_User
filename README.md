# SunFlow ERP (Sushila Engineering Works)

Build the APK with GitHub Actions (`.github/workflows/build.yml`) – same process as before.

1. Upload everything in this folder to the repository (keep `debug.keystore`, `icons`, `www`, `.github`).
2. Owner setup: install the first APK, create the admin password, copy the public key
   (Settings > License & security) into `www/pubkey.js`, rebuild → this is the **user build**.
3. Licence server (recommended): follow `server/README.md`, put the URL in `www/config.js`, rebuild.
4. Data/backup: see `MIGRATION_AND_ROLLBACK.md`. Release notes and limits: `RELEASE_NOTES.md`.
No passwords or secrets are stored in this repository (the admin secret lives in Google Script properties).
