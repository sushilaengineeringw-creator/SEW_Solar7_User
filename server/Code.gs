/**
 * SunFlow ERP – licence server (Google Apps Script + Google Sheet).
 * The Sheet is the licence database. Set the script property ADMIN_SECRET (Project Settings > Script properties).
 * Deploy: Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone.
 */
var COLS = {
  lic: ['id', 'name', 'mobile', 'type', 'plan', 'days', 'mods', 'status', 'act', 'exp', 'created', 'lastSeen', 'dev'],
  log: ['time', 'id', 'event', 'detail'],
  fb: ['time', 'stars', 'text', 'who']
};
var DAY = 86400000;

function sheet_(n) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), s = ss.getSheetByName(n);
  if (!s) { s = ss.insertSheet(n); s.appendRow(COLS[n]); }
  return s;
}
function rows_(n) {
  var v = sheet_(n).getDataRange().getValues(), h = v[0];
  return v.slice(1).map(function (r, i) { var o = { _r: i + 2 }; h.forEach(function (k, j) { o[k] = r[j]; }); return o; });
}
function put_(n, o) { // update row (o._r) in place
  var h = COLS[n], row = h.map(function (k) { return o[k] === undefined ? '' : o[k]; });
  sheet_(n).getRange(o._r, 1, 1, h.length).setValues([row]);
}
function log_(id, ev, detail) { sheet_('log').appendRow([Date.now(), String(id), ev, detail || '']); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function find_(id) { var r = rows_('lic'); for (var i = 0; i < r.length; i++) if (String(r[i].id) === String(id)) return r[i]; return null; }
function eq_(a, b) { a = String(a || ''); b = String(b || ''); if (a.length !== b.length) return false; var d = 0; for (var i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }

function status_(r, now) {
  if (r.status === 'revoked') return 'revoked';
  if (r.status === 'suspended') return 'suspended';
  if (!r.act) return 'pending';
  if (now > Number(r.exp)) return 'expired';
  return r.type === 'demo' ? 'demo' : 'active';
}
function view_(r, now) {
  return { ok: true, st: status_(r, now), now: now, act: Number(r.act) || 0, exp: Number(r.exp) || 0, plan: r.plan, type: r.type,
    days: Number(r.days), name: r.name, mods: r.mods ? String(r.mods).split(',') : [] };
}

function doGet() { return out_({ ok: true, service: 'SunFlow ERP licence server' }); }

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var q = JSON.parse(e.postData.contents), now = Date.now();
    if (q.a === 'check' || q.a === 'activate') return out_(client_(q, now));
    if (q.a === 'feedback') {
      sheet_('fb').appendRow([now, Math.max(1, Math.min(5, Number(q.stars) || 0)), String(q.text || '').slice(0, 1000), String(q.who || '').slice(0, 80)]);
      return out_({ ok: true });
    }
    if (q.a === 'admin') return out_(admin_(q, now));
    return out_({ ok: false, err: 'bad request' });
  } catch (err) {
    return out_({ ok: false, err: 'bad request' });
  } finally { lock.releaseLock(); }
}

function client_(q, now) {
  var r = find_(q.id);
  if (!r) return { ok: true, st: 'revoked', now: now, exp: 0, act: 0, mods: [] }; // unknown licence = no access
  if (q.dev) {
    if (!r.dev) { r.dev = String(q.dev); log_(r.id, 'device bound', String(q.dev).slice(0, 6)); }
    else if (String(r.dev) !== String(q.dev)) { var v = view_(r, now); v.st = 'device'; return v; }
  }
  if (q.a === 'activate' && !r.act && r.status !== 'revoked' && r.status !== 'suspended') {
    r.act = now; r.exp = now + Number(r.days) * DAY; log_(r.id, 'activated', 'expires ' + new Date(r.exp).toISOString());
  }
  r.lastSeen = now; put_('lic', r);
  return view_(r, now);
}

function admin_(q, now) {
  var sec = PropertiesService.getScriptProperties().getProperty('ADMIN_SECRET');
  if (!sec || !eq_(q.secret, sec)) { Utilities.sleep(1500); return { ok: false, err: 'denied' }; }
  var op = q.op, r;
  if (op === 'list') {
    var logs = rows_('log').slice(-400), by = {};
    logs.forEach(function (l) { (by[l.id] = by[l.id] || []).push({ t: l.time, e: l.event, d: l.detail }); });
    return { ok: true, now: now, users: rows_('lic').map(function (x) { var v = view_(x, now); v.id = String(x.id); v.mobile = String(x.mobile); v.created = x.created; v.lastSeen = Number(x.lastSeen) || 0; v.dev = x.dev ? String(x.dev).slice(0, 6) : ''; v.log = (by[x.id] || []).slice(-12); return v; }) };
  }
  if (op === 'create') {
    if (!q.id || !q.name || !q.mobile || !(Number(q.days) > 0)) return { ok: false, err: 'missing fields' };
    if (find_(q.id)) return { ok: false, err: 'exists' };
    sheet_('lic').appendRow([String(q.id), String(q.name).slice(0, 80), String(q.mobile).slice(0, 20), q.type === 'demo' ? 'demo' : 'paid', String(q.plan || '').slice(0, 60), Number(q.days), (q.mods || []).join(','), '', '', '', now, '', '']);
    log_(q.id, 'created', q.type + ' ' + q.days + ' days');
    return { ok: true };
  }
  r = find_(q.id);
  if (!r) return { ok: false, err: 'unknown user' };
  if (op === 'suspend') { r.status = 'suspended'; log_(r.id, 'suspended', ''); }
  else if (op === 'reactivate') { r.status = ''; log_(r.id, 'reactivated', ''); }
  else if (op === 'revoke') { r.status = 'revoked'; log_(r.id, 'revoked', ''); }
  else if (op === 'extend') {
    var d = Number(q.days); if (!isFinite(d) || d === 0) return { ok: false, err: "days" };
    r.days = Number(r.days) + d; if (r.act) r.exp = Number(r.exp) + d * DAY; log_(r.id, 'extended', d + ' days');
  }
  else if (op === 'mods') { r.mods = (q.mods || []).join(','); log_(r.id, 'modules changed', r.mods); }
  else if (op === 'resetdev') { r.dev = ''; log_(r.id, 'device reset', ''); }
  else if (op === 'delete') { sheet_('lic').deleteRow(r._r); log_(r.id, 'deleted', ''); return { ok: true }; }
  else return { ok: false, err: 'bad op' };
  put_('lic', r);
  return { ok: true };
}
