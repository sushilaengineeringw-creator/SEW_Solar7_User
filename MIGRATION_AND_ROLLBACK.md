# Upgrade, data migration and rollback (v6 → v7)

* Install the new APK **over** the old one (same package id and `debug.keystore`). Data stays.
* **Before upgrading: Settings (or Summary) > Backup > include documents.** Keep the file.
* v7 only *adds* data keys: `banks`, `fb`, `set.print`, `set.dec`, `set.numfmt`, `set.tz`, `set.dueDays`,
  `set.rnd`, extra `co.*` profile fields, `plans[].t`. They are created with safe defaults on first start
  (`sdef()`); nothing is deleted or re-calculated. Existing customers, purchase bills, business invoices,
  PM Surya Ghar applications, documents, numbering and attachments are untouched.
* Your existing bank details become the first (default) bank account automatically.
* Saved quotations/invoices keep their stored numbers and values. Only newly generated PDFs use the new layout.
* **Rollback:** install the previous APK (built from the previous repository state, same keystore) and, if the
  app does not start, uninstall it, install the old APK and use **Restore** with the backup taken before the
  upgrade. A v7 backup restores into v6 (extra keys are ignored).
* The online licence server is optional. With `SEW_SERVER=''` the app behaves like v6 (offline codes).
