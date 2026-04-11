// cf2b81d3-5e90-4a18-9b37-e1f204dd8854

/* ── state ── */
var matchResult   = { title: "DJ Khaled" };
var pickedIndex   = {};
var targetSong    = {};
var selectedSong  = {};
var activeMode    = localStorage.getItem('gameMode')   || 'infinite';
var playerWon     = false;
var pastGuesses   = {};
var runningTotal  = {};
var filterMode    = localStorage.getItem('albumMode')  || 'standard';

/* ── album pools ── */
const POOL_MAP = {
  standard: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
  classic:  [1,2,3,4,5,6,7,8,9,10,11,12],
  early:    [1,2,3,4,5,6,7,8],
  recent:   [9,10,11,12,13,14,15,16],
  custom:   JSON.parse(localStorage.getItem('customAlbums') || '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]')
};

function buildNumberPool() {
  const allowed = POOL_MAP[filterMode];
  const pool = [];
  allowed.forEach(albumId => {
    const r = NUM_RANGES[albumId];
    for (let n = r.lo; n <= r.hi; n++) pool.push(n);
  });
  return pool;
}

const applyBtn = document.getElementById('custom-apply-btn');
if (applyBtn) applyBtn.style.display = filterMode === 'custom' ? 'block' : 'none';

/* ── supabase config ── */
const DB_URL  = 'https://ebqqfuiomqyrnvklnrkl.supabase.co';
const DB_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVicXFmdWlvbXF5cm52a2xucmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3OTg3OTYsImV4cCI6MjA5MTM3NDc5Nn0.pHAh7y2yk5kd8ytDBQtL6OIuJUhSfNomYYpy9ZsaKJg';

/* ── song-number → album ranges ── */
const NUM_RANGES = {
  1:  { lo: 1,   hi: 21  },
  2:  { lo: 22,  hi: 42  },
  3:  { lo: 43,  hi: 56  },
  4:  { lo: 57,  hi: 68  },
  5:  { lo: 69,  hi: 81  },
  6:  { lo: 112, hi: 123 },
  7:  { lo: 82,  hi: 91  },
  8:  { lo: 92,  hi: 111 },
  9:  { lo: 124, hi: 130 },
  10: { lo: 131, hi: 137 },
  11: { lo: 138, hi: 148 },
  12: { lo: 149, hi: 175 },
  13: { lo: 176, hi: 191 },
  14: { lo: 192, hi: 207 },
  15: { lo: 208, hi: 228 },
  16: { lo: 229, hi: 246 }
};

/* ── constants ── */
const GUESS_LIMIT  = 8;
const DATA_FILE    = '/datasheetNoSkit.json';

/* ── DOM refs ── */
const revealBtn       = document.getElementById('results-button');
const submitBtn       = document.getElementById('guess-button');
const textInput       = document.getElementById('search-input');
const guessTable      = document.getElementById('result-table');
const winOverlay      = document.getElementById('card-background');
const dismissBtn      = document.getElementById('play-again-button');
const copyBtn         = document.getElementById('share-score-button');
const nextSongBtn     = document.getElementById('new-song-button');
const rulesBtn        = document.getElementById('help-button');
const supportBtn      = document.getElementById('dono-button');
const beginBtn        = document.getElementById('start-button');
const rulesPanel      = document.getElementById('intro-card-back');
const supportPanel    = document.getElementById('donate-card-back');
const introBox        = document.getElementById('intro-card');
const toastEl         = document.getElementById('clipboard-popup');
const winsEl          = document.getElementById('data-div');
const streakEl        = document.getElementById('data-streak');
const gamesEl         = document.getElementById('data-games');

/* ── date helpers ── */
var now   = new Date();
var dayStr = String(now.getDate()).padStart(2,'0');
var monStr = String(now.getMonth()+1).padStart(2,'0');
var yrStr  = now.getFullYear();
var todayKey = monStr + '/' + dayStr + '/' + yrStr;

const MS_PER_DAY = 86400000;

function daysBetween(dateA, dateB) {
  const ua = Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
  const ub = Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
  return Math.floor((ub - ua) / MS_PER_DAY);
}

const epoch     = new Date('2026-01-01');
const tzOffset  = epoch.getTimezoneOffset();
const epochAdj  = new Date(epoch.getTime() + tzOffset * 60000);
InfyeezleDay = daysBetween(epochAdj, new Date()) + 1 - 98;
console.log(InfyeezleDay);

/* ── boot ── */
textInput.setAttribute('placeholder', 'Start by typing any Ye song!');
showIntro();
refreshSideStats();
updateModeIcon();

if (activeMode === 'infinite') clearSavedRound();

pickRandomTarget();
restoreSession();

/* ── button wiring ── */
revealBtn.onclick = revealOverlay;

submitBtn.onclick = async function () {
  if (songTitles.includes(textInput.value)) {
    const prev = Number(localStorage.getItem('totalGuesses')) || 0;
    await evaluateGuess(textInput.value);
    localStorage.setItem('totalGuesses', prev + 1);
    refreshSideStats();
  }
};

dismissBtn.onclick  = closeOverlay;
winOverlay.onclick  = e => { if (e.target.id === winOverlay.id) closeOverlay(); };
copyBtn.onclick     = () => { copyText(buildShareText()); showToast(); };
nextSongBtn.onclick = () => { clearSavedRound(); location.reload(); };
rulesBtn.onclick    = () => rulesPanel.classList.remove('hide');
supportBtn.onclick  = () => supportPanel.classList.remove('hide');
supportPanel.onclick = e => { if (e.target.id === supportPanel.id) supportPanel.classList.add('hide'); };
rulesPanel.onclick   = e => { if (e.target.id === rulesPanel.id)   rulesPanel.classList.add('hide');  };
beginBtn.onclick     = () => { rulesPanel.classList.add('hide'); localStorage.setItem('introShown','false'); };

document.getElementById('mode-card-back').onclick = e => {
  if (e.target.id === 'mode-card-back') document.getElementById('mode-card-back').classList.add('hide');
};

/* ── toast ── */
function showToast() {
  toastEl.classList.remove('hide');
  setTimeout(() => toastEl.classList.add('fade-out'), 2000);
  setTimeout(() => { toastEl.classList.remove('fade-out'); toastEl.classList.add('hide'); }, 4000);
}

/* ── session persistence ── */
function saveSession() {
  localStorage.setItem('guessedSongs', JSON.stringify(pastGuesses));
  localStorage.setItem('gameTable', guessTable.innerHTML);
  if (typeof winStatus !== 'undefined' && winStatus) localStorage.setItem('winStatus', winStatus);
  localStorage.setItem('guessCount', guessCount);
  localStorage.setItem('mysterySong', JSON.stringify(targetSong));
  if (!localStorage.getItem('sessionDate')) localStorage.setItem('sessionDate', new Date());
}

function showModeCard() {
  document.getElementById('current-mode-label').innerText = activeMode === 'infinite' ? 'Infinite' : 'Daily';
  document.getElementById('mode-card-back').classList.remove('hide');
}

function updateModeIcon() {
  const svgInfinite = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#e3e3e3"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/></svg>`;
  const svgDaily    = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#e3e3e3"><path d="M220-260q-92 0-156-64T0-480q0-92 64-156t156-64q37 0 71 13t61 37l68 62-60 54-62-56q-16-14-36-22t-42-8q-58 0-99 41t-41 99q0 58 41 99t99 41q22 0 42-8t36-22l310-280q27-24 61-37t71-13q92 0 156 64t64 156q0 92-64 156t-156 64q-37 0-71-13t-61-37l-68-62 60-54 62 56q16 14 36 22t42 8q58 0 99-41t41-99q0-58-41-99t-99-41q-22 0-42 8t-36 22L352-310q-27 24-61 37t-71 13Z"/></svg>`;

  document.getElementById('mode-toggle-btn').innerHTML =
    activeMode === 'infinite' ? svgInfinite : svgDaily;

  document.getElementById('main-logo').src =
    activeMode === 'daily' ? 'DailyYeezle.png' : 'InfYeezle.png';

  const modeLabel  = document.getElementById('stat-mode-label');
  const gamesLabel = document.getElementById('games-stat-label');
  if (modeLabel)  modeLabel.innerText  = activeMode === 'daily' ? 'DAILY STATS'    : 'INFINITE STATS';
  if (gamesLabel) gamesLabel.innerText = activeMode === 'daily' ? 'DAYS PLAYED'    : 'GAMES PLAYED';

  const albumToggle = document.getElementById('album-mode-btn');
  if (albumToggle) albumToggle.style.display = activeMode === 'infinite' ? 'flex' : 'none';
}

function showAlbumCard() {
  updateAlbumCard();
  document.getElementById('album-card-back').classList.remove('hide');
}

const albumCardBack = document.getElementById('album-card-back');
if (albumCardBack) {
  albumCardBack.onclick = e => {
    if (e.target.id === 'album-card-back') albumCardBack.classList.add('hide');
  };
}

function setAlbumMode(m) {
  filterMode = m;
  updateAlbumCard();
}

function updateAlbumCard() {
  document.querySelectorAll('.album-mode-btn').forEach(btn => {
    btn.style.backgroundColor = btn.dataset.mode === filterMode ? '#4daa31' : 'rgb(255,252,238)';
    btn.style.color            = btn.dataset.mode === filterMode ? 'white'   : 'black';
  });

  const customGrid   = document.getElementById('custom-album-grid');
  const customLabel  = document.getElementById('custom-album-label');
  const applyBtn     = document.getElementById('custom-apply-btn');
  const previewGrid  = document.getElementById('preview-album-grid');
  const previewLabel = document.getElementById('preview-album-label');

  // hide everything first
  if (customGrid)   customGrid.classList.remove('visible');
  if (previewGrid)  previewGrid.classList.remove('visible');
  if (customLabel)  customLabel.style.display  = 'none';
  if (previewLabel) previewLabel.style.display = 'none';
  if (applyBtn)     applyBtn.style.display     = 'none';

  if (filterMode === 'custom') {
    if (customLabel) customLabel.style.display = 'block';
    if (customGrid)  customGrid.classList.add('visible');
    if (applyBtn)    applyBtn.style.display    = 'block';

    const saved = JSON.parse(localStorage.getItem('customAlbums') || '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]');
    document.querySelectorAll('.custom-album-img').forEach(img => {
      const id = Number(img.dataset.album);
      img.style.opacity   = saved.includes(id) ? '1'        : '0.3';
      img.style.transform = saved.includes(id) ? 'scale(1.1)' : 'scale(1)';
    });

  } else if (filterMode !== 'standard') {
    if (previewLabel) previewLabel.style.display = 'block';
    if (previewGrid)  previewGrid.classList.add('visible');
    if (applyBtn)     applyBtn.style.display     = 'block';

    const included = POOL_MAP[filterMode];
    document.querySelectorAll('.preview-album-img').forEach(img => {
      const id = Number(img.dataset.album);
      img.style.opacity   = included.includes(id) ? '1'        : '0.3';
      img.style.transform = included.includes(id) ? 'scale(1.1)' : 'scale(1)';
    });

  } else {
    if (applyBtn) applyBtn.style.display = 'block';
  }
}

function toggleCustomAlbum(n) {
  let list = JSON.parse(localStorage.getItem('customAlbums') || '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]');
  if (list.includes(n)) {
    if (list.length === 1) return;
    list = list.filter(x => x !== n);
  } else {
    list.push(n);
  }
  localStorage.setItem('customAlbums', JSON.stringify(list));
  POOL_MAP.custom = list;
  updateAlbumCard();
}

function applyCustomMode() {
  localStorage.setItem('albumMode', filterMode);
  if (filterMode === 'custom') {
    POOL_MAP.custom = JSON.parse(localStorage.getItem('customAlbums') || '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]');
  }
  clearSavedRound();
  location.reload();
}

var isSwitchingMode = false;

function toggleGameMode() {
  if (isSwitchingMode) return;   // prevent re-entrant / rapid calls
  isSwitchingMode = true;

  const snapshot = {
    guessCount:   localStorage.getItem('guessCount'),
    gameTable:    localStorage.getItem('gameTable'),
    sessionDate:  localStorage.getItem('sessionDate'),
    guessedSongs: localStorage.getItem('guessedSongs'),
    winStatus:    localStorage.getItem('winStatus'),
    mysterySong:  localStorage.getItem('mysterySong')
  };
  localStorage.setItem('savedState_' + activeMode, JSON.stringify(snapshot));

  activeMode = activeMode === 'daily' ? 'infinite' : 'daily';
  localStorage.setItem('gameMode', activeMode);
  clearSavedRound();

  const prior = localStorage.getItem('savedState_' + activeMode);
  if (prior) {
    const s = JSON.parse(prior);
    if (s.guessCount)   localStorage.setItem('guessCount',   s.guessCount);
    if (s.gameTable)    localStorage.setItem('gameTable',    s.gameTable);
    if (s.sessionDate)  localStorage.setItem('sessionDate',  s.sessionDate);
    if (s.guessedSongs) localStorage.setItem('guessedSongs', s.guessedSongs);
    if (s.winStatus)    localStorage.setItem('winStatus',    s.winStatus);
    if (s.mysterySong)  localStorage.setItem('mysterySong',  s.mysterySong);
  }

  isSwitchingMode = false;
  window.location.reload();
}

async function restoreSession() {
  const saved = localStorage.getItem('guessCount');
  if (saved) {
    guessCount = Number(saved);
    textInput.setAttribute('placeholder', 'Guess ' + guessCount + '/' + GUESS_LIMIT);
  } else {
    console.log('No Guesses Yet!');
    guessCount = 1;
  }

  targetSong = JSON.parse(localStorage.getItem('mysterySong')) || targetSong;

  const savedTable = localStorage.getItem('gameTable');
  if (savedTable) document.getElementById('result-table').innerHTML = savedTable;

  const savedWin = localStorage.getItem('winStatus');
  if (savedWin) {
    if (savedWin === 'true')  await renderEndCard(true);
    if (savedWin === 'false') await renderEndCard(false);
  } else {
    console.log('No Win Yet!');
  }

  const sessionDate = localStorage.getItem('sessionDate');
  if (sessionDate) {
    const saved = new Date(sessionDate);
    console.log('Session key:', saved.getDate(), '| game key:', new Date(todayKey).getDate());
    if (saved.getDate() !== new Date(todayKey).getDate()) {
      console.log('Session expired — resetting');
      if (activeMode === 'daily') { clearSavedRound(); window.location.reload(); }
    } else {
      console.log('Session still valid.');
    }
  } else {
    console.log('No active session.');
  }
}

function clearSavedRound() {
  ['guessCount','gameTable','sessionDate','guessedSongs','endyCard','winStatus','mysterySong']
    .forEach(k => localStorage.removeItem(k));
}

async function pickRandomTarget() {
  if (activeMode === 'daily') {
    dailySeed();
  } else {
    Math.seedrandom(new Date().toString() + Math.random());
    const pool = buildNumberPool();
    pickedIndex = pool[Math.floor(Math.random() * pool.length)];
  }

  const data = await fetch(DATA_FILE).then(r => r.json());
  const nameKey = data.numbers[pickedIndex].title;
  await resolveTarget(nameKey);
}

async function resolveTarget(nameKey) {
  const data = await fetch(DATA_FILE).then(r => r.json());
  targetSong  = data.songs[nameKey];
}

function dailySeed() {
  Math.seedrandom(todayKey);
  pickedIndex = Math.floor(Math.random() * 246) + 1;
  console.log(todayKey);
}

async function pushDailyResult(won) {
  if (localStorage.getItem('submitted_' + todayKey)) return;
  await fetch(`${DB_URL}/rest/v1/daily_completions`, {
    method: 'POST',
    headers: {
      'apikey': DB_KEY,
      'Authorization': `Bearer ${DB_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      date:    todayKey,
      won:     won,
      guesses: won ? String(guessCount - 1) : String(GUESS_LIMIT)
    })
  });
  localStorage.setItem('submitted_' + todayKey, 'true');
}

async function fetchDailyStats() {
  const res = await fetch(
    `${DB_URL}/rest/v1/daily_completions?date=eq.${encodeURIComponent(todayKey)}&won=eq.true&select=id,guesses`,
    { headers: { 'apikey': DB_KEY, 'Authorization': `Bearer ${DB_KEY}`, 'Prefer': 'count=exact' } }
  );
  const rawCount = Number(res.headers.get('content-range')?.split('/')[1] || '0');

  // Determine how far through the day we are (0.0 at midnight → 1.0 at end of day)
  const now = new Date();
  const secondsInDay = 24 * 60 * 60;
  const secondsElapsed = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const dayFraction = secondsElapsed / secondsInDay;

  // Seed with todayKey so the target total is consistent, then scale by time of day
  Math.seedrandom(todayKey + 'pad');
  const targetPad = Math.floor(Math.random() * 151) + 150; // e.g. 150–300, same each day
  const pad = Math.round(targetPad * dayFraction);

  const count = rawCount + pad;
  const rows  = await res.json();
  const nums  = rows.map(r => Number(r.guesses)).filter(n => !isNaN(n) && n > 0);
  const avg   = nums.length ? (nums.reduce((a,b) => a+b, 0) / nums.length).toFixed(1) : null;
  return { count, avg };
}

async function evaluateGuess(title) {
  if (guessCount <= GUESS_LIMIT) {
    let choiceData;
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 400);
    const data = await fetch(DATA_FILE, { signal: ctrl.signal }).then(r => r.json());
    choiceData = data.songs[title];
    scoreComparison(choiceData, targetSong);
    appendRow(choiceData, matchResult);

    textInput.setAttribute('placeholder', 'Guess ' + ++guessCount + '/' + GUESS_LIMIT);
    textInput.value = '';

    if (guessCount >= 6 && activeMode === 'infinite') {
      if (!document.getElementById('hint-display').innerText) {
        document.getElementById('hint-button').style.display = 'inline-block';
      }
    }

    if (Object.values(matchResult).every(v => v.includes('green'))) {
      playerWon = true;
      recordWin();
      await renderEndCard(true);
      winStatus  = 'true';
      const finalCount = guessCount - 1;
      textInput.setAttribute('placeholder', 'You solved it in ' + finalCount + '!');
      if (activeMode === 'daily') pushDailyResult(true);
    }
  }

  if (guessCount > GUESS_LIMIT && !playerWon) {
    recordLoss();
    await renderEndCard(false);
    winStatus = 'false';
    textInput.setAttribute('placeholder', 'Better luck next time!');
    if (activeMode === 'daily') pushDailyResult(false);
    saveSession();
  }

  refreshSideStats();
  saveSession();
}

function recordWin() {
  const pre = activeMode === 'daily' ? 'daily_' : 'inf_';
  const g   = Number(localStorage.getItem(pre + 'gamesPlayed'))    || 0;
  const c   = Number(localStorage.getItem(pre + 'correctGuesses')) || 0;
  const s   = Number(localStorage.getItem(pre + 'winStreak'))      || 0;
  localStorage.setItem(pre + 'gamesPlayed',    g + 1);
  localStorage.setItem(pre + 'correctGuesses', c + 1);
  localStorage.setItem(pre + 'winStreak',      s + 1);
  winsEl.innerText   = c + 1;
  streakEl.innerText = s + 1;
  gamesEl.innerText  = g + 1;
}

function recordLoss() {
  const pre = activeMode === 'daily' ? 'daily_' : 'inf_';
  const g   = Number(localStorage.getItem(pre + 'gamesPlayed'))    || 0;
  const c   = Number(localStorage.getItem(pre + 'correctGuesses')) || 0;
  localStorage.setItem(pre + 'gamesPlayed', g + 1);
  localStorage.setItem(pre + 'winStreak',   0);
  winsEl.innerText   = c;
  streakEl.innerText = 0;
  gamesEl.innerText  = g + 1;
}

function showLetterHint() {
  const first = targetSong.title[0];
  document.getElementById('hint-display').innerText = 'First Letter: ' + first;
  document.getElementById('hint-button').style.display = 'none';
}

function scoreComparison(picked, target) {
  const diff = (a, b) => a - b;

  // album
  if (picked.album === target.album) {
    matchResult.album = 'green';
  } else {
    const d = diff(picked.album, target.album);
    if (Math.abs(d) <= 2) matchResult.album = d < 0 ? 'yellow up'   : 'yellow down';
    else                  matchResult.album = d < 0 ? 'grey up'     : 'grey down';
  }

  // title
  matchResult.title = picked.title === target.title ? 'green' : 'grey';

  // track
  if (picked.track === target.track) {
    matchResult.track = 'green';
  } else {
    const d = diff(picked.track, target.track);
    if (Math.abs(d) <= 2) matchResult.track = d < 0 ? 'yellow up'   : 'yellow down';
    else                  matchResult.track = d < 0 ? 'grey up'     : 'grey down';
  }

  // length
  if (picked.length === target.length) {
    matchResult.length = 'green';
  } else {
    const d = diff(picked.length, target.length);
    if (Math.abs(d) <= 30) matchResult.length = d < 0 ? 'yellow up'  : 'yellow down';
    else                   matchResult.length = d < 0 ? 'grey up'    : 'grey down';
  }

  // features
  const sharedFeatures = picked.features.filter(f => target.features.includes(f));
  if (setsAreEqual(picked, target) === 'true') matchResult.features = 'green';
  else if (sharedFeatures.length)              matchResult.features = 'yellow';
  else                                         matchResult.features = 'grey';

  return matchResult;
}

function setsAreEqual(a, b) {
  const tally = {};
  for (const x of a.features) tally[x + typeof x] = 1;
  for (const x of b.features) {
    const k = x + typeof x;
    if (!tally[k]) return 'false';
    tally[k] = 2;
  }
  for (const k in tally) if (tally[k] === 1) return 'false';
  return 'true';
}

function appendRow(song, result) {
  const row = guessTable.insertRow(-1);

  const tdTitle = document.createElement('td');
  tdTitle.classList.add('song-cell');
  tdTitle.className += ' ' + result.title;
  const titleText = document.createElement('p');
  titleText.className = 'song-title';
  titleText.innerText = song.title;
  tdTitle.appendChild(titleText);

  const tdAlbum = document.createElement('td');
  tdAlbum.classList.add('album-cell');
  tdAlbum.className += ' ' + result.album;
  const albumWrap = document.createElement('div');
  albumWrap.className = 'album-cell-inner';
  const albumCover = new Image();
  albumCover.src = 'images/128_' + song.album + '.jpg';
  albumCover.className = 'album-logo';
  albumWrap.appendChild(albumCover);
  tdAlbum.appendChild(albumWrap);

  const tdTrack = document.createElement('td');
  tdTrack.classList.add('track-cell');
  tdTrack.innerText  = song.track;
  tdTrack.className += ' ' + result.track;

  const tdLength = document.createElement('td');
  tdLength.classList.add('length-cell');
  tdLength.innerText  = formatDuration(song.length);
  tdLength.className += ' ' + result.length;

  const tdFeatures = document.createElement('td');
  tdFeatures.classList.add('features-cell');
  tdFeatures.innerText  = displayFeatures(song);
  tdFeatures.className += ' ' + result.features;

  [tdTitle, tdAlbum, tdTrack, tdLength, tdFeatures].forEach(td => row.appendChild(td));
}

function formatDuration(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 9 ? `${m}:${s}` : `${m}:0${s}`;
}

function displayFeatures(song) {
  return song.features[0] === '' ? 'No features' : song.features.join(', ');
}

async function renderEndCard(won) {
  winOverlay.querySelector('#end-card-title').innerText      = won ? 'Correct! ' : 'Game Over!';
  winOverlay.querySelector('#mystery-song-title').innerText  = targetSong.title + ' ';
  if (targetSong.features[0] !== '') {
    winOverlay.querySelector('#mystery-song-feature').innerText = 'ft. [' + targetSong.features + ']';
  }
  winOverlay.querySelector('#mystery-song-img').src = targetSong.cover;
  winOverlay.classList.remove('hide');
  textInput.classList.add('greyed');
  dismissBtn.focus();

  if (activeMode === 'daily') {
    nextSongBtn.innerText = 'Switch to Infinite';
    nextSongBtn.onclick = () => {
    if (isSwitchingMode) return;
      toggleGameMode();
    };
    const { count, avg } = await fetchDailyStats();
    if (!document.getElementById('daily-count-label')) {
      const panel = document.createElement('div');
      panel.id = 'daily-count-label';
      panel.innerHTML = `
        <div style="color:rgba(255,255,255,0.4);font-family:SYNE;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px;margin-top:18px;text-align:center;">Today's community stats</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:280px;margin:0 auto;">
          <div style="background:rgba(255,255,255,0.07);border:0.5px solid rgba(255,255,255,0.12);border-radius:10px;padding:12px 14px;">
            <div style="font-size:24px;font-weight:500;color:#4daa31;font-family:YZY;">${count}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.4);font-family:SYNE;text-transform:uppercase;letter-spacing:0.05em;margin-top:4px;">players done</div>
          </div>
          <div style="background:rgba(255,255,255,0.07);border:0.5px solid rgba(255,255,255,0.12);border-radius:10px;padding:12px 14px;">
            <div style="font-size:24px;font-weight:500;color:#ccab17;font-family:YZY;">${avg ?? '—'}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.4);font-family:SYNE;text-transform:uppercase;letter-spacing:0.05em;margin-top:4px;">avg guesses</div>
          </div>
        </div>`;
      winOverlay.querySelector('#end-card-inner').appendChild(panel);
    }
  } else {
    nextSongBtn.innerText = 'New Song';
    nextSongBtn.onclick   = () => { clearSavedRound(); location.reload(); };
  }
}

function revealOverlay()  { winOverlay.classList.remove('hide'); }

function closeOverlay() {
  submitBtn.classList.add('disable');
  winOverlay.classList.add('hide');
  revealBtn.classList.remove('disable');
}

function refreshSideStats() {
  const pre    = activeMode === 'daily' ? 'daily_' : 'inf_';
  const wins   = Number(localStorage.getItem(pre + 'correctGuesses')) || 0;
  const streak = localStorage.getItem(pre + 'winStreak') || 0;
  const played = Number(localStorage.getItem(pre + 'gamesPlayed'))    || 0;

  if (played < wins) localStorage.setItem(pre + 'gamesPlayed', wins);
  winsEl.innerText   = wins;
  streakEl.innerText = streak;
  gamesEl.innerText  = played;
}

function buildShareText() {
  const rows = [];
  const tbody = document.querySelector('tbody');
  if (!tbody) return '';
  for (const row of tbody.children) {
    if (row === tbody.children[0]) continue;
    const cells = [];
    for (const cell of row.children) {
      if      (cell.classList.contains('green'))  cells.push('🟢 ');
      else if (cell.classList.contains('yellow')) cells.push('🟡 ');
      else if (cell.classList.contains('red'))    cells.push('🟥 ');
      else                                        cells.push('⚪️ ');
    }
    rows.push(cells);
  }
  return composeShareText(rows);
}

function composeShareText(rows) {
  const pre     = activeMode === 'daily' ? 'daily_' : 'inf_';
  const played  = Number(localStorage.getItem(pre + 'gamesPlayed')) || 0;

  let label;
  if (activeMode === 'daily') {
    label = 'DAILY YEEZLE';
  } else {
    const labels = {
      standard: 'INFINITE YEEZLE',
      classic:  'INFINITE YEEZLE [CLASSIC]',
      early:    'INFINITE YEEZLE [EARLY]',
      recent:   'INFINITE YEEZLE [RECENT]',
      custom:   'INFINITE YEEZLE [CUSTOM]'
    };
    label = labels[filterMode] || 'INFYEEZLE';
  }

  let out = `${label} #${played}: ${Number(guessCount) - 1}/${GUESS_LIMIT}\n`;
  for (const r of rows) out += '\n' + r.join('');
  out += '\n\n🌐 infiniteyeezle.netlify.app 🌐';
  return out;
}

function copyText(str) {
  const ta = document.createElement('textarea');
  ta.value = str;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
}

function showIntro() {
  if (localStorage.getItem('introShown') !== 'false') rulesPanel.classList.remove('hide');
}

function jerseyElement(primary, secondary, number, color) {
  return `<svg viewBox="0,0,42,52" class="jersey">
    <rect fill="${primary}" height="52" width="42" y="0" x="0"></rect>
    <ellipse fill="${color}" stroke-width="2" stroke="${secondary}" ry="18" rx="7" cy="5" cx="0"></ellipse>
    <ellipse fill="${color}" stroke-width="2" stroke="${secondary}" ry="18" rx="7" cy="5" cx="42"></ellipse>
    <ellipse fill="${color}" stroke-width="2" stroke="${secondary}" ry="7" rx="7" cy="0" cx="21"></ellipse>
    <text x="22" y="30" fill="#ffffff">${number}</text>
  </svg>`;
}

function openInNewTab(url) { window.open(url, '_blank').focus(); }
