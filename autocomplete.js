/* ── Song catalogue ─────────────────────────────────────────── */
const songTitles = [
  // The College Dropout
  "Intro","We Don't Care","Graduation Day","All Falls Down","I'll Fly Away",
  "Spaceship","Jesus Walks","Never Let Me Down","Get Em High","Workout Plan",
  "The New Workout Plan","Slow Jamz","Breathe In Breathe Out","School Spirit Skit 1",
  "School Spirit","School Spirit Skit 2","Lil Jimmy Skit","Two Words",
  "Through The Wire","Family Business","Last Call",

  // Late Registration
  "Wake Up Mr West","Heard Em' Say","Touch The Sky","Gold Digger","Skit 1",
  "Drive Slow","My Way Home","Crack Music","Roses","Bring Me Down","Addiction",
  "Skit 2","Diamonds From Sierra Leone - Remix","We Major","Skit 3","Hey Mama",
  "Celebration","Skit 4","Gone","Diamonds From Sierra Leone - Bonus Track","Late",

  // Graduation
  "Good Morning","Champion","Stronger","I Wonder","Good Life",
  "Can't Tell Me Nothing","Barry Bonds","Drunk and Hot Girls","Flashing Lights",
  "Everything I Am","The Glory","Homecoming","Big Brother","Good Night",

  // 808s & Heartbreak
  "Say You Will","Welcome To Heartbreak","Heartless","Amazing","Love Lockdown",
  "Paranoid","RoboCop","Street Lights","Bad News","See You In My Nightmares",
  "Coldest Winter","Pinocchio Story",

  // My Beautiful Dark Twisted Fantasy
  "Dark Fantasy","Gorgeous","POWER","All Of The Lights (Interlude)",
  "All Of The Lights","Monster","So Appalled","Devil In A New Dress","Runaway",
  "Hell Of A Life","Blame Game","Lost In The World","Who Will Survive In America",

  // Yeezus
  "On Sight","Black Skinhead","I Am A God","New Slaves","Hold My Liquor",
  "I'm In It","Blood On The Leaves","Guilt Trip","Send It Up","Bound 2",

  // The Life of Pablo
  "Ultralight Beam","Father Stretch My Hands Pt 1","Pt 2","Famous","Feedback",
  "Low Lights","Highlights","Freestyle 4","I Love Kanye","Waves","FML",
  "Real Friends","Wolves","Frank's Track","Siiiiiiiiilver Surffffeeeeer Intermission",
  "30 Hours","No More Parties In LA","Facts (Charlie Heat Version)","Fade","Saint Pablo",

  // Watch the Throne
  "No Church In The Wild","Lift Off","Ni**as In Paris","Otis","Gotta Have It",
  "New Day","That's My Bitch","Welcome To The Jungle","Who Gon Stop Me",
  "Murder To Excellence","Made In America","Why I Love You",

  // ye
  "I Thought About Killing You","Yikes","All Mine","Wouldn't Leave",
  "No Mistakes","Ghost Town","Violent Crimes",

  // KIDS SEE GHOSTS
  "Feel The Love","Fire","4th Dimension","Freee (Ghost Town Pt 2)","Reborn",
  "Kids See Ghosts","Cudi Montage",

  // Jesus Is King
  "Every Hour","Selah","Follow God","Closed On Sunday","On God",
  "Everything We Need","Water","God Is","Hands On","Use This Gospel","Jesus Is Lord",

  // Donda
  "Donda Chant","Jail","God Breathed","Off The Grid","Hurricane","Praise God",
  "Jonah","Ok Ok","Junya","Believe What I Say","24","Remote Control","Moon",
  "Heaven and Hell","Donda","Keep My Spirit Alive","Jesus Lord","New Again",
  "Tell The Vision","Lord I Need You","Pure Souls","Come To Life",
  "No Child Left Behind","Jail pt 2","Ok Ok pt 2","Junya pt 2","Jesus Lord pt 2",

  // Vultures 1
  "STARS","KEYS TO MY LIFE","PAID","TALKING","BACK TO ME","HOODRAT","DO IT",
  "PAPERWORK","BURN","FUK SUMN","VULTURES","CARNIVAL","BEG FORGIVENESS",
  "GOOD (DON'T DIE)","PROBLEMATIC","KING (VULTURES 1)",

  // Vultures 2
  "SLIDE","TIME MOVING SLOW","FIELD TRIP","FRIED","ISABELLA","PROMOTION",
  "530 (VULTURES 2)","DEAD","FOREVER ROLLING","BOMB","RIVER","FOREVER",
  "HUSBAND","LIFESTYLE","SKY CITY","MY SOUL",

  // Donda 2
  "TRUE LOVE","BROKEN ROAD","GET LOST","KEEP THE FLOWERS","JESSE","TOO EASY",
  "PABLO","MR MIYAGI","HAPPY","SECURITY","CITY OF GOD","530 (DONDA 2)",
  "CITY OF CHI","SCIFI","SUZY","BURN EVERYTHING","LOUIE BAGS","WE DID IT",
  "MAINTENANCE","LORD LIFT ME UP","FIRST TIME IN A LONG TIME",

  // Bully
  "KING (BULLY)","THIS A MUST","FATHER","ALL THE LOVE","PUNCH DRUNK",
  "WHATEVER WORKS","MAMA'S FAVORITE","SISTERS AND BROTHERS","BULLY",
  "HIGHS AND LOWS","I CAN'T WAIT","WHITE LINES","CIRCLES","PREACHER MAN",
  "BEAUTY AND THE BEAST","DAMN","LAST BREATH","THIS ONE HERE"
];

/* ── Autocomplete widget ─────────────────────────────────────── */
function autocomplete(inputEl, catalogue) {
  let highlightIndex = -1;

  /* rebuild dropdown on every keystroke */
  inputEl.addEventListener('input', function () {
    const query = this.value;
    dismissDropdowns();
    if (!query) return;

    highlightIndex = -1;

    const dropdown = document.createElement('DIV');
    dropdown.id        = this.id + 'autocomplete-list';
    dropdown.className = 'autocomplete-items';
    this.parentNode.appendChild(dropdown);

    let shown = 0;
    for (let i = 0; i < catalogue.length; i++) {
      if (shown >= 5) break;                                    // cap at 5 results
      if (!catalogue[i].toUpperCase().includes(query.toUpperCase())) continue;

      const item = document.createElement('DIV');
      item.innerHTML  = catalogue[i];
      item.innerHTML += `<input type="hidden" value="${catalogue[i]}">`;

      item.addEventListener('click', function () {
        inputEl.value = this.querySelector('input').value;
        dismissDropdowns();
      });

      dropdown.appendChild(item);
      shown++;
    }
  });

  /* keyboard navigation */
  inputEl.addEventListener('keydown', function (e) {
    const list = document.getElementById(this.id + 'autocomplete-list');
    const items = list ? list.querySelectorAll('div') : null;

    if (e.keyCode === 40) {                       // ↓ arrow
      highlightIndex++;
      applyHighlight(items);
    } else if (e.keyCode === 38) {                // ↑ arrow
      highlightIndex--;
      applyHighlight(items);
    } else if (e.keyCode === 13) {                // Enter
      e.preventDefault();
      if (highlightIndex > -1 && items) {
        items[highlightIndex].click();
        document.getElementById('guess-button').click();
      }
    }

    document.getElementById('guess-button').disabled = !catalogue.includes(inputEl.value);
  });

  function applyHighlight(items) {
    if (!items) return;
    clearHighlight(items);
    if (highlightIndex >= items.length) highlightIndex = 0;
    if (highlightIndex < 0)             highlightIndex = items.length - 1;
    items[highlightIndex].classList.add('autocomplete-active');
  }

  function clearHighlight(items) {
    for (const item of items) item.classList.remove('autocomplete-active');
  }

  function dismissDropdowns(except) {
    const open = document.getElementsByClassName('autocomplete-items');
    for (const el of open) {
      if (el !== except && el !== inputEl) el.parentNode.removeChild(el);
    }
  }

  /* close on outside click */
  document.addEventListener('click', function (e) {
    dismissDropdowns(e.target);
    document.getElementById('guess-button').disabled = !catalogue.includes(inputEl.value);
  });
}

/* ── Build filtered title list for current album mode ────────── */
async function buildActiveTitleList() {
  if (activeMode === 'daily') return songTitles;

  const pool     = buildNumberPool();
  const data     = await fetch('/datasheetNoSkit.json').then(r => r.json());
  const allowed  = new Set(pool.map(n => data.numbers[n].title));
  return songTitles.filter(t => allowed.has(t));
}

/* ── Boot autocomplete ──────────────────────────────────────── */
buildActiveTitleList().then(list => {
  autocomplete(document.getElementById('search-input'), list);
});
