// 47a4f79b-9bda-4259-8170-a0f390ee7443

var result = { "title": "DJ Khaled" }
let mysteryNumber = {}
let mysterySong = {}
let choiceSong = {}
let gameMode = localStorage.getItem('gameMode') || 'infinite';
let irishSpring = false
let guessedSongs = {}
accGuessCount = {}
let albumMode = localStorage.getItem('albumMode') || 'standard';

const albumRanges = {
    standard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    classic:  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    early:    [1, 2, 3, 4, 5, 6, 7, 8],
    recent:   [9, 10, 11, 12, 13, 14, 15, 16],
    custom:   JSON.parse(localStorage.getItem('customAlbums') || '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]')
}

const albumNumberRanges = {
    1:  {min: 1,   max: 21},
    2:  {min: 22,  max: 42},
    3:  {min: 43,  max: 56},
    4:  {min: 57,  max: 68},
    5:  {min: 69,  max: 81},
    6:  {min: 112, max: 123},
    7:  {min: 82,  max: 91},
    8:  {min: 92,  max: 111},
    9:  {min: 124, max: 130},
    10: {min: 131, max: 137},
    11: {min: 138, max: 148},
    12: {min: 149, max: 175},
    13: {min: 176, max: 191},
    14: {min: 192, max: 207},
    15: {min: 208, max: 228},
    16: {min: 229, max: 246}
}

const maxGuesses = 8
const showShowButton = document.getElementById('results-button')
const guessButton = document.getElementById('guess-button');
const mysteryImg = document.getElementById('mystery-img');
const searchInput = document.getElementById('search-input');
const seedrandom = document.getElementById('seedrandom')
const resultTable = document.getElementById('result-table');
const endCard = document.getElementById('end-card');
const cardBackground = document.getElementById('card-background')
const playAgainButton = document.getElementById('play-again-button')
const shareScoreButton = document.getElementById('share-score-button')
const newSongButton = document.getElementById('new-song-button')
const helpButton = document.getElementById('help-button')
const donoButton = document.getElementById('dono-button')
const startButton = document.getElementById('start-button')
const introCardBack = document.getElementById('intro-card-back')
const donateCardBack = document.getElementById('donate-card-back')
const donateButton = document.getElementById('donate-button')
const introCard = document.getElementById('intro-card')
const clipboardPopupScreen = document.getElementById('clipboard-popup')
const showSil = document.getElementById('show-sil')
const showDivisions = document.getElementById('show-divisions-text')
const dataDiv = document.getElementById('data-div')
const dataStreak = document.getElementById('data-streak')
const dataGames = document.getElementById('data-games')

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0');
var yyyy = today.getFullYear();
today = mm + '/' + dd + '/' + yyyy;

const _MS_PER_DAY = 1000 * 60 * 60 * 24;

function dateDiffInDays(a, b) {
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

const a = new Date("2022-04-15"),
    b = new Date();
const tzAdj = a.getTimezoneOffset();
const aAdjusted = new Date(a.getTime() + tzAdj * 60000);

yeezleDay = dateDiffInDays(aAdjusted, b) + 1 - 1454;
console.log(yeezleDay)

searchInput.setAttribute('placeholder', 'Start by typing any Ye song!')
showIntro()
sideStatistics()
updateModeIcon()

if (gameMode === 'infinite') {
    resetGameState()
}

getRandomMysterySong()
loadLocalStorage()

showShowButton.onclick = showShowResult

guessButton.onclick = async function () {
    if (songTitles.includes(searchInput.value)) {
        const total = Number(window.localStorage.getItem('totalGuesses')) || 0
        await compareSong(searchInput.value)
        window.localStorage.setItem('totalGuesses', total + 1)
        sideStatistics()
    }
}

playAgainButton.onclick = playAgain

cardBackground.onclick = function (e) {
    if (e.target.id === cardBackground.id) {
        playAgain()
    }
}

shareScoreButton.onclick = function () {
    copyToClipboard(scoreText())
    clipboardPopup()
}

newSongButton.onclick = function () {
    resetGameState()
    location.reload()
}

helpButton.onclick = function () {
    introCardBack.classList.remove('hide')
}

donoButton.onclick = function () {
    donateCardBack.classList.remove('hide')
}

donateCardBack.onclick = function (e) {
    if (e.target.id === donateCardBack.id) {
        donateCardBack.classList.add('hide')
    }
}

introCardBack.onclick = function (e) {
    if (e.target.id === introCardBack.id) {
        introCardBack.classList.add('hide')
    }
}

startButton.onclick = () => {
    introCardBack.classList.add("hide")
    window.localStorage.setItem('introShown', "false")
}

document.getElementById('mode-card-back').onclick = function(e) {
    if (e.target.id === 'mode-card-back') {
        document.getElementById('mode-card-back').classList.add('hide')
    }
}

function clipboardPopup() {
    clipboardPopupScreen.classList.remove('hide')
    setTimeout(function () {
        clipboardPopupScreen.classList.add('fade-out');
    }, 2000);
    setTimeout(function () {
        clipboardPopupScreen.classList.remove('fade-out')
        clipboardPopupScreen.classList.add('hide')
    }, 4000);
}

function preserveGameState() {
    window.localStorage.setItem('guessedSongs', JSON.stringify(guessedSongs))
    const gameTable = document.getElementById('result-table')
    window.localStorage.setItem('gameTable', gameTable.innerHTML)

    if (typeof winStatus !== 'undefined') {
        if (winStatus) {
            window.localStorage.setItem('winStatus', winStatus)
        }
    }

    window.localStorage.setItem('guessCount', guessCount)
    window.localStorage.setItem('mysterySong', JSON.stringify(mysterySong))

    const sessionDate = window.localStorage.getItem('sessionDate')
    if (!sessionDate) {
        window.localStorage.setItem('sessionDate', new Date())
    }
}

function showModeCard() {
    document.getElementById('current-mode-label').innerText =
        gameMode === 'infinite' ? 'Infinite' : 'Daily';
    document.getElementById('mode-card-back').classList.remove('hide')
}

function updateModeIcon() {
    const infiniteSvg = `<svg xmlns="http://www.w3.org/2000/svg" height="60px" viewBox="0 -960 960 960" width="60px" fill="#e3e3e3"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/></svg>`;
    const dailySvg = `<svg xmlns="http://www.w3.org/2000/svg" height="60px" viewBox="0 -960 960 960" width="60px" fill="#e3e3e3"><path d="M220-260q-92 0-156-64T0-480q0-92 64-156t156-64q37 0 71 13t61 37l68 62-60 54-62-56q-16-14-36-22t-42-8q-58 0-99 41t-41 99q0 58 41 99t99 41q22 0 42-8t36-22l310-280q27-24 61-37t71-13q92 0 156 64t64 156q0 92-64 156t-156 64q-37 0-71-13t-61-37l-68-62 60-54 62 56q16 14 36 22t42 8q58 0 99-41t41-99q0-58-41-99t-99-41q-22 0-42 8t-36 22L352-310q-27 24-61 37t-71 13Z"/></svg>`;

    const btn = document.getElementById('mode-toggle-btn');
    btn.innerHTML = gameMode === 'infinite' ? infiniteSvg : dailySvg;

    document.getElementById('main-logo').src =
        gameMode === 'daily' ? 'DailyYeezle.png' : 'InfYeezle.png';

    const statLabel = document.getElementById('stat-mode-label');
    const gamesLabel = document.getElementById('games-stat-label');
    if (statLabel) statLabel.innerText = gameMode === 'daily' ? 'DAILY STATS' : 'INFINITE STATS';
    if (gamesLabel) gamesLabel.innerText = gameMode === 'daily' ? 'DAYS PLAYED' : 'GAMES PLAYED';
    const albumBtn = document.getElementById('album-mode-btn')
    if (albumBtn) albumBtn.style.display = gameMode === 'infinite' ? 'flex' : 'none'
}

function showAlbumCard() {
    updateAlbumCard()
    document.getElementById('album-card-back').classList.remove('hide')
}

document.getElementById('album-card-back').onclick = function(e) {
    if (e.target.id === 'album-card-back') {
        document.getElementById('album-card-back').classList.add('hide')
    }
}

function setAlbumMode(mode) {
    albumMode = mode
    localStorage.setItem('albumMode', mode)
    updateAlbumCard()
    resetGameState()
    location.reload()
}

function toggleCustomAlbum(albumNum) {
    let custom = JSON.parse(localStorage.getItem('customAlbums') || '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]')
    if (custom.includes(albumNum)) {
        if (custom.length === 1) return // always keep at least one
        custom = custom.filter(a => a !== albumNum)
    } else {
        custom.push(albumNum)
    }
    localStorage.setItem('customAlbums', JSON.stringify(custom))
    albumRanges.custom = custom
    updateAlbumCard()
}

function applyCustomMode() {
    albumMode = 'custom'
    localStorage.setItem('albumMode', 'custom')
    resetGameState()
    location.reload()
}

function updateAlbumCard() {
    const btns = document.querySelectorAll('.album-mode-btn')
    btns.forEach(btn => {
        btn.style.backgroundColor = btn.dataset.mode === albumMode ? '#4daa31' : 'rgb(255,252,238)'
        btn.style.color = btn.dataset.mode === albumMode ? 'white' : 'black'
    })

    const custom = JSON.parse(localStorage.getItem('customAlbums') || '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]')
    document.querySelectorAll('.custom-album-img').forEach(img => {
        const albumNum = Number(img.dataset.album)
        img.style.opacity = custom.includes(albumNum) ? '1' : '0.3'
        img.style.transform = custom.includes(albumNum) ? 'scale(1.1)' : 'scale(1)'
    })
}


function toggleGameMode() {
    // save current mode's game state under a mode-specific key before switching 
    const currentState = {
        guessCount: localStorage.getItem('guessCount'),
        gameTable: localStorage.getItem('gameTable'),
        sessionDate: localStorage.getItem('sessionDate'),
        guessedSongs: localStorage.getItem('guessedSongs'),
        winStatus: localStorage.getItem('winStatus'),
        mysterySong: localStorage.getItem('mysterySong')
    }
    localStorage.setItem('savedState_' + gameMode, JSON.stringify(currentState))

    // switch mode
    gameMode = gameMode === 'daily' ? 'infinite' : 'daily';
    localStorage.setItem('gameMode', gameMode);

    // clear current keys
    resetGameState()

    // restore the new mode's saved state if it exists
    const savedState = localStorage.getItem('savedState_' + gameMode)
    if (savedState) {
        const state = JSON.parse(savedState)
        if (state.guessCount) localStorage.setItem('guessCount', state.guessCount)
        if (state.gameTable) localStorage.setItem('gameTable', state.gameTable)
        if (state.sessionDate) localStorage.setItem('sessionDate', state.sessionDate)
        if (state.guessedSongs) localStorage.setItem('guessedSongs', state.guessedSongs)
        if (state.winStatus) localStorage.setItem('winStatus', state.winStatus)
        if (state.mysterySong) localStorage.setItem('mysterySong', state.mysterySong)
    }

    window.location.reload();
}

function loadLocalStorage() {
    const anyGuesses = window.localStorage.getItem('guessCount')
    if (anyGuesses) {
        guessCount = Number(window.localStorage.getItem('guessCount'))
        searchInput.setAttribute('placeholder', 'Guess ' + guessCount + '/' + maxGuesses)
    } else {
        console.log("No Guesses Yet!")
        guessCount = 1
    }

    mysterySong = JSON.parse(window.localStorage.getItem("mysterySong")) || mysterySong

    const storedGameTableContainer = window.localStorage.getItem('gameTable')
    if (storedGameTableContainer) {
        document.getElementById('result-table').innerHTML = storedGameTableContainer;
    }

    const winStorage = window.localStorage.getItem('winStatus')
    if (winStorage) {
        if (winStorage === "true") {
            showMysterySong(true);
        } else if (winStorage === "false") {
            showMysterySong(false);
        }
    } else { console.log("No Win Yet!") }

    const sessionDate = window.localStorage.getItem('sessionDate')
    if (sessionDate) {
        const deezNuts = new Date(sessionDate)
        const sesDateComp = deezNuts.getDate()
        const neezDuts = new Date(today)
        const curDateComp = neezDuts.getDate()
        console.log("Session key is: " + sesDateComp + ", while game key is: " + curDateComp)

        if (sesDateComp !== curDateComp) {
            console.log('We need to update')
            if (gameMode === 'daily') {
                resetGameState()
                window.location.reload();
            }
        } else {
            console.log("Game is still valid.")
        }
    } else {
        console.log("No session active")
    }
}

function resetGameState() {
    localStorage.removeItem('guessCount');
    localStorage.removeItem('gameTable');
    localStorage.removeItem('sessionDate');
    localStorage.removeItem('guessedSongs');
    localStorage.removeItem('endyCard')
    localStorage.removeItem('winStatus')
    localStorage.removeItem('mysterySong')
}

async function getRandomMysterySong() {
    if (gameMode === 'daily') {
        newMysterySong();
    } else {
        Math.seedrandom(new Date().toString() + Math.random());
        const pool = getNumberPoolForAlbumMode()
        mysteryNumber = pool[Math.floor(Math.random() * pool.length)]
    }

    await fetch('/datasheetNoSkit.json')
        .then(response => response.json())
        .then(data => {
            mysteryDouble = data.numbers[mysteryNumber].title;
        });
    doubleTrouble();
}

async function doubleTrouble() {
    await fetch('/datasheetNoSkit.json')
        .then(response => response.json())
        .then(data => {
            mysterySong = data.songs[mysteryDouble]
        })
}

function newMysterySong() {
    Math.seedrandom(today);
    mysteryNumber = Math.floor(Math.random() * 246) + 1;
    console.log(today)
}


async function compareSong(choice) {
    if (guessCount <= maxGuesses) {
        let choiceData;
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 400)

        await fetch('/datasheetNoSkit.json', { signal: controller.signal })
            .then(response => response.json())
            .then(data => {
                choiceData = data.songs[choice]
                compareFunction(choiceData, mysterySong)
            })

        addRow(choiceData, result)
        searchInput.setAttribute('placeholder', 'Guess ' + ++guessCount + '/' + maxGuesses)
        searchInput.value = ""

       if (guessCount >= 6 && gameMode === 'infinite') {
    const hintAlreadyShown = document.getElementById('hint-display').innerText !== ''
    if (!hintAlreadyShown) {
        document.getElementById('hint-button').style.display = 'inline-block'
    }
}

        if (Object.values(result).every(r => r.includes("green"))) {
            irishSpring = true
        } else {
            irishSpring = false
        }
        if (Object.values(result).every(r => r.includes("green"))) {
            mainStatisticsW()
            showMysterySong(true)
            winStatus = "true";
            accGuessCount = guessCount - 1
            searchInput.setAttribute('placeholder', 'You solved it in ' + accGuessCount + '!')
        }
    }
    
    if (guessCount > maxGuesses && irishSpring != true) {
        mainStatisticsL()
        showMysterySong(false)
        winStatus = "false";
        searchInput.setAttribute('placeholder', 'Better luck next time!')
        preserveGameState()
    }
    sideStatistics()
    preserveGameState()
}

function mainStatisticsW() {
    const prefix = gameMode === 'daily' ? 'daily_' : 'inf_';

    const gamesPlayed = Number(window.localStorage.getItem(prefix + 'gamesPlayed')) || 0
    window.localStorage.setItem(prefix + 'gamesPlayed', gamesPlayed + 1)

    const correctGuess = Number(window.localStorage.getItem(prefix + 'correctGuesses')) || 0
    window.localStorage.setItem(prefix + 'correctGuesses', correctGuess + 1)

    const winStreak = Number(window.localStorage.getItem(prefix + 'winStreak')) || 0
    window.localStorage.setItem(prefix + 'winStreak', winStreak + 1)

    dataDiv.innerText = correctGuess + 1
    dataStreak.innerText = winStreak + 1
    dataGames.innerText = gamesPlayed + 1
}

function mainStatisticsL() {
    const prefix = gameMode === 'daily' ? 'daily_' : 'inf_';

    const gamesPlayed = Number(window.localStorage.getItem(prefix + 'gamesPlayed')) || 0
    window.localStorage.setItem(prefix + 'gamesPlayed', gamesPlayed + 1)

    const correctGuess = Number(window.localStorage.getItem(prefix + 'correctGuesses')) || 0
    window.localStorage.setItem(prefix + 'winStreak', 0)

    dataDiv.innerText = correctGuess
    dataStreak.innerText = 0
    dataGames.innerText = gamesPlayed + 1
}

function showLetterHint() {
    const firstLetter = mysterySong.title[0]
    document.getElementById('hint-display').innerText = 'First Letter: ' + firstLetter
    document.getElementById('hint-button').style.display = 'none'
}

function compareFunction(choiceData, mysterySong) {
    if (choiceData.album === mysterySong.album) { result.album = "green"; }
    else if (choiceData.album - mysterySong.album >= -2 && choiceData.album - mysterySong.album <= 2 && choiceData.album - mysterySong.album < 0) { result.album = "yellow up"; }
    else if (choiceData.album - mysterySong.album >= -2 && choiceData.album - mysterySong.album <= 2 && choiceData.album - mysterySong.album > 0) { result.album = "yellow down"; }
    else if (choiceData.album - mysterySong.album < 0) { result.album = "grey up"; }
    else if (choiceData.album - mysterySong.album > 0) { result.album = "grey down"; }

    if (choiceData.title === mysterySong.title) { result.title = "green" }
    else { result.title = "grey" }

    if (choiceData.track === mysterySong.track) { result.track = "green"; }
    else if (choiceData.track - mysterySong.track >= -2 && choiceData.track - mysterySong.track <= 2 && choiceData.track - mysterySong.track < 0) { result.track = "yellow up"; }
    else if (choiceData.track - mysterySong.track >= -2 && choiceData.track - mysterySong.track <= 2 && choiceData.track - mysterySong.track > 0) { result.track = "yellow down"; }
    else if (choiceData.track - mysterySong.track < 0) { result.track = "grey up"; }
    else if (choiceData.track - mysterySong.track > 0) { result.track = "grey down"; }

    if (choiceData.length === mysterySong.length) { result.length = "green"; }
    else if (choiceData.length - mysterySong.length >= -30 && choiceData.length - mysterySong.length <= 30 && choiceData.length - mysterySong.length < 0) { result.length = "yellow up"; }
    else if (choiceData.length - mysterySong.length >= -30 && choiceData.length - mysterySong.length <= 30 && choiceData.length - mysterySong.length > 0) { result.length = "yellow down"; }
    else if (choiceData.length - mysterySong.length < 0) { result.length = "grey up"; }
    else if (choiceData.length - mysterySong.length > 0) { result.length = "grey down"; }

    const filteredArray = choiceData.features.filter(value => mysterySong.features.includes(value));
    if (areArraysEqualSets(choiceData, mysterySong) === "true") { result.features = "green" }
    else if (filteredArray != "") { result.features = "yellow" }
    else { result.features = "grey" }

    return result;
}

function areArraysEqualSets(choiceData, mysterySong) {
    const superSet = {};
    for (const i of choiceData.features) {
        const e = i + typeof i;
        superSet[e] = 1;
    }
    for (const i of mysterySong.features) {
        const e = i + typeof i;
        if (!superSet[e]) { return "false"; }
        superSet[e] = 2;
    }
    for (let e in superSet) {
        if (superSet[e] === 1) { return "false"; }
    }
    return "true";
}

function addRow(choiceData, result) {
    const newRow = resultTable.insertRow(-1)

    const songCell = document.createElement('td')
    songCell.classList.add('song-cell')
    songCell.className += " " + result["title"]
    const songTitle = document.createElement('p')
    songTitle.className = 'song-title'
    songTitle.innerText = choiceData.title
    songCell.appendChild(songTitle)

    const albumCell = document.createElement('td')
    albumCell.classList.add('album-cell')
    albumCell.className += " " + result["album"]
    const albumCellInner = document.createElement('div')
    albumCellInner.className = 'album-cell-inner'
    const albumLogo = new Image()
    albumLogo.src = "images/128_" + choiceData.album + ".jpg"
    albumLogo.className = 'album-logo'
    albumCellInner.appendChild(albumLogo)
    albumCell.appendChild(albumCellInner)

    const trackCell = document.createElement('td')
    trackCell.classList.add('track-cell')
    trackCell.innerText = choiceData.track
    trackCell.className += " " + result["track"]

    const lengthCell = document.createElement('td')
    lengthCell.classList.add('length-cell')
    lengthCell.innerText = secondsToMin(choiceData.length)
    lengthCell.className += " " + result["length"]

    const featuresCell = document.createElement('td')
    featuresCell.classList.add('features-cell')
    featuresCell.innerText = haveFeatures(choiceData)
    featuresCell.className += " " + result["features"]

    newRow.appendChild(songCell)
    newRow.appendChild(albumCell)
    newRow.appendChild(trackCell)
    newRow.appendChild(lengthCell)
    newRow.appendChild(featuresCell)
}

function secondsToMin(seconds) {
    let min = Math.floor(seconds / 60)
    let secondsRemaining = seconds % 60
    if (secondsRemaining > 9) { return min + ":" + secondsRemaining }
    else { return min + ":0" + secondsRemaining }
}

function haveFeatures(choiceData) {
    if (choiceData.features[0] === "") { return "No features" }
    else { return choiceData.features }
}

function showMysterySong(correct) {
    cardBackground.querySelector("#end-card-title").innerText = correct ? "Correct! " : "Game Over!"
    cardBackground.querySelector('#mystery-song-title').innerText = mysterySong.title + " "
    if (mysterySong.features[0] !== "") {
        cardBackground.querySelector('#mystery-song-feature').innerText = "ft. [" + mysterySong.features + "]"
    }
    cardBackground.querySelector('#mystery-song-img').src = mysterySong.cover
    cardBackground.classList.remove('hide')
    searchInput.classList.add('greyed')
    playAgainButton.focus()
}

function showShowResult() {
    cardBackground.classList.remove('hide')
}

function playAgain() {
    guessButton.classList.add('disable')
    cardBackground.classList.add('hide')
    showShowButton.classList.remove('disable')
}

function sideStatistics() {
    const prefix = gameMode === 'daily' ? 'daily_' : 'inf_';
    const correctGuess = Number(window.localStorage.getItem(prefix + 'correctGuesses')) || 0
    const winStreak = window.localStorage.getItem(prefix + 'winStreak') || 0
    const gamesPlayed = Number(window.localStorage.getItem(prefix + 'gamesPlayed')) || 0

    if (gamesPlayed < correctGuess) {
        window.localStorage.setItem(prefix + 'gamesPlayed', correctGuess)
    }

    dataDiv.innerText = correctGuess
    dataStreak.innerText = winStreak
    dataGames.innerText = gamesPlayed
}

function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)]
}

function copyToClipboard(text) {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    textArea.remove()
}

function scoreText() {
    let resultsArray = []
    for (e of document.querySelector("tbody").children) {
        let subArray = []
        if (e != document.querySelector("tbody").children[0]) {
            for (d of e.children) {
                if (d.classList.contains('green')) { subArray.push("🟢 ") }
                else if (d.classList.contains('yellow')) { subArray.push("🟡 ") }
                else if (d.classList.contains('red')) { subArray.push("🟥 ") }
                else { subArray.push("⚪️ ") }
            }
            resultsArray.push(subArray)
        }
    }
    return formatScoreText(resultsArray)
}

function formatScoreText(resultsArray) {
    const prefix = gameMode === 'daily' ? 'daily_' : 'inf_';
    const gamesPlayed = Number(window.localStorage.getItem(prefix + 'gamesPlayed')) || 0
    const modeLabel = gameMode === 'daily' ? 'DAILYYEEZLE' : 'INFYEEZLE'

    let formattedScoreText = modeLabel + " #" + gamesPlayed + ": " + (Number(guessCount) - 1) + "/" + maxGuesses + "\n"
    for (e of resultsArray) {
        formattedScoreText += "\n" + e.join("")
    }
    formattedScoreText += "\n\n🌐 infiniteyeezle.netlify.app 🌐"
    return formattedScoreText
}

function showIntro() {
    const introShown = window.localStorage.getItem('introShown')
    if (introShown !== "false") {
        introCardBack.classList.remove('hide')
    }
}

function jerseyElement(primary, secondary, number, color) {
    return `<svg viewBox="0,0,42,52" class="jersey">
    <rect fill="${primary}" height="52" width="42" y="0" x="0"></rect>
    <ellipse fill="${color}" stroke-width="2" stroke="${secondary}" ry="18" rx="7" cy="5" cx="0"></ellipse>
    <ellipse fill="${color}" stroke-width="2" stroke="${secondary}" ry="18" rx="7" cy="5" cx="42"></ellipse>
    <ellipse fill="${color}" stroke-width="2" stroke="${secondary}" ry="7" rx="7" cy="0" cx="21"></ellipse>
    <text x="22" y="30" fill="#ffffff">${number}</text>
    </svg>`
}

function openInNewTab(url) {
    window.open(url, '_blank').focus();
}
