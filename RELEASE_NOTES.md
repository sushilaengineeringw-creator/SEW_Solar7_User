# SunFlow ERP v7.0 – release notes

## Architecture (audited)
Capacitor Android shell + single-page web app (`www/index.html`), data in the phone (localStorage for records,
IndexedDB for attachments), PDF via jsPDF, Excel via SheetJS, offline signed licences (ECDSA P-256).
There was **no backend**, so "suspend" only worked when the user applied a code – the root cause of the bug.

## Priority 1 – licence (fixed with an authoritative server)
* New `server/Code.gs` (Google Apps Script + Sheet): statuses Pending, Demo, Active, Suspended, Expired, Revoked;
  server timestamps; device binding; history log; admin actions (create, suspend, reactivate, extend, modules,
  reset device, revoke, delete). Admin secret lives only in Script properties.
* App re-validates at login/launch, <=30 s between actions, every 5 min, on resume and when back online;
  suspended/revoked/expired/other-device ⇒ locked screen; network loss ⇒ 72 h grace; phone-date changes detected.
* User sees **DEMO VERSION** banner (start date, expiry date, days/hours left) and renewal warnings;
  admin sees name, mobile, type, activation, expiry, remaining, last validation, device, history.
* Expired: blocked, data kept, "Export my data" still offered. Suspended/revoked: nothing allowed.

## Priority 2 – documents, profile, reports
* Quotation/Invoice/PO/Challan PDF re-laid out: terms no longer force a half-empty page; summary, bank/signature
  and terms flow page by page; table header repeats; page numbers; discount, tax-inclusive prices, HSN/SAC, bank per document.
* Business Profile: legal name, type, address, city/PIN, 2 phones, email, website, GSTIN, PAN, registration,
  contact person, signatory, UPI, payment terms, logo, signature, preview card, completeness bar, validation,
  Save/Cancel and unsaved-changes warning.
* Reports (19): sales register, customer-wise, item-wise, outstanding, monthly, GST rate summary, quotations;
  purchase register, vendor-wise, GST, monthly, POs; party statement, all parties, receivable ageing; project
  profit & expenses; GST monthly summary, GSTR-1 style list. Date range, search, sort, paging, totals, print, PDF, Excel.

## Priority 3/4
Settings rebuilt (Business profile, Bank accounts, Transaction, Invoice print, Taxes & GST, General, Backup,
Attachments, Modules, License, Users, Application & feedback), Menu page, rating & feedback, new SunFlow ERP
branding/logo/icons, new palette, dashboard (alerts, recent invoices/bills, monthly sales).

## Known limitations / not done (not faked)
* Paper A5 and landscape printing not supported (A4 portrait only).
* Not available because the app does not record the data: expense register, cash/bank book, day book,
  payment & receipt register, profit & loss, balance sheet, stock/inventory. Invoices store a single "received" amount.
* Data is on each phone; the server locks access but cannot read/delete phone data; a rebuilt APK can bypass the lock.
* Rating is stored in the app (and sent to the licence server if configured); there is no Play Store integration.
* GST name/address lookup needs your own GST API (Settings > Taxes & GST); otherwise format/check-digit/state only.
* Live deployment of `Code.gs` and testing on a real phone are still to be done by you (tested here against a mock).

## Tests (`cd tests && npm install && npm test`) – last run: 77 passed, 0 failed
Real app + real `Code.gs` in jsdom/vm with a mock Google Sheet: GST/round-off/discount maths vs your sample
estimates & invoices, PDF pagination (1-page and 60-item), print settings, profile/bank validation, report
reconciliation, v6→v7 data preservation, licence flows (activate, suspend while logged in, restart, reactivate,
expiry, midnight/hours countdown, grace, clock change, second device, forged code, wrong admin secret).
