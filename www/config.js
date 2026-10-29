// Licence server settings. Leave SEW_SERVER empty to use offline licence codes only.
// After deploying server/Code.gs (see server/README.md) paste its Web app URL here and rebuild.
const SEW_SERVER='';
const SEW_CHECK_MIN=5;   // re-check the licence every N minutes while the app is open
const SEW_GRACE_H=72;    // hours the app may stay offline after the last successful check
