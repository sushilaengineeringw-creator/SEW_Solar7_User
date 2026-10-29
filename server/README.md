# SunFlow ERP licence server (free, Google Sheet + Apps Script)

Why: a licence stored only inside the phone can never be cancelled remotely. This small server keeps the
authoritative licence status (active / demo / suspended / expired / revoked) and server time. The app asks it
on login, after every ~30 seconds of use and every 5 minutes while open.

## Set up (once, ~10 minutes, no coding)
1. Sign in to Google, create a new **Google Sheet** called `SunFlow Licences`.
2. Menu **Extensions > Apps Script**. Delete the sample code, paste the whole of `server/Code.gs`, click Save.
3. Left side **Project Settings (gear) > Script properties > Add**: name `ADMIN_SECRET`, value = a long password
   only you know (20+ characters). Do not share it and never put it in GitHub.
4. **Deploy > New deployment > type: Web app**. Execute as: **Me**. Who has access: **Anyone**. Deploy and
   allow the permissions. Copy the **Web app URL** (ends with `/exec`).
5. In GitHub open `www/config.js`, set `const SEW_SERVER='<your URL>';` and commit. Rebuild **both** the admin
   and the user APK (they must use the same URL).
6. In the admin app: Settings > Users & subscription. The first time you create or manage a user the app asks
   for the ADMIN_SECRET (kept in memory only, never saved on the phone).

The Sheet has three tabs created automatically: `lic` (licences), `log` (history), `fb` (feedback).

## What it enforces
* Suspended / revoked / expired licences: the user's app locks at the next check (<= 30 s between actions,
  <= 5 min when idle) and cannot log in again until you reactivate.
* Trial/subscription dates use **server time**; changing the phone date does nothing.
* One device per licence (admin can reset the device). Unknown licence ids get no access.
* If the phone is offline the app works for `SEW_GRACE_H` hours (default 72) after the last successful check,
  then asks the user to connect.

## Honest limits
* Business data lives on each phone (offline-first). The server can lock the app but cannot read or delete
  that data, and a determined person who rebuilds/modifies the APK can remove the lock screen. For hard
  server-side enforcement of every operation the data itself would have to move to a server (a larger rewrite).
* Anyone with the Web app URL can call `check`; only the ADMIN_SECRET can create/suspend/extend.
