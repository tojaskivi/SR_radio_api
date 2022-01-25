// Denna fil ska innehålla er lösning till projektuppgiften.

"use strict";

/*  Delar till ej obligatorisk funktionalitet, som kan ge poäng för högre betyg
 *   Radera rader för funktioner du vill visa på webbsidan. */
// document.getElementById("player").style.display = "none";      // Radera denna rad för att visa musikspelare
// document.getElementById("shownumrows").style.display = "none"; // Radera denna rad för att visa antal träffar

/* Här under börjar du skriva din JavaScript-kod */

// globala variabler
const APIALLCHANNELS = "https://api.sr.se/api/v2/channels?pagination=false&format=json";
let user;
let allChannels;

// hämtar element/ID som kommer användas i koden
let mainNavListEl = document.getElementById("mainnavlist");
let infoEl = document.getElementById("info");
let playChannelEl = document.getElementById("playchannel");
let playButtonEl = document.getElementById("playbutton");
let numrowsEl = document.getElementById("numrows");
let logoEl = document.getElementById("logo");
let radioPlayerEl = document.getElementById("radioplayer");
let actualPlayerEl;

// eventlyssnare
numrowsEl.addEventListener("change", changeNumrows);
logoEl.addEventListener("click", loadFront);
playButtonEl.addEventListener("click", playNow);



// eventlyssnare som aktiveras när sidan laddas in
window.addEventListener("load", init);

function init() {

  // definierar user så att det blir ett objekt av klassen Settings
  user = new Settings();

  // ställer in hur många kanaler som läses in i kanallistan till vänster
  numrowsEl.value = user.getNumberOfRows();

  // funktionsanrop
  getChannels();
  printFavorites();
  printTopStories();
  showClearButton();

  // skriver ut ett välkomstmeddelande
  infoEl.innerHTML = `<h2>Välkommen till denna radiotjänst!</h2><p>Till vänster hittar du alla kanalers tablå, och i menyn ovan finns en lista med alla kanaler.</p><p>Du har även möjlighet att spara dina favoritkanaler som du når direkt till vänster.</p>`;

}

function showClearButton() {


  // hämtar elementet med id't favorite-container
  let referenceNode = document.querySelector("#favorite-container");

  // skapar en ny div
  let newElement = document.createElement("div");

  // ger nya diven ett id
  newElement.id = "clearStorageDiv";

  // ger nya diven innehåll
  newElement.innerHTML = "<h3>Inställningar</h3>"

  // stoppar in nya diven efter referenceNode, definierad högre upp
  referenceNode.after(newElement);

  // samma som ovan fast en ny div
  let clearButton = document.createElement("div");

  // ger nya elementet en id, klass, style och innehåll
  clearButton.id = 'clear-storage-div';
  clearButton.classList.add("btn")
  clearButton.style = "background:red";
  clearButton.innerHTML = "Rensa inställningar";

  // lägger till knapp-diven till nya diven
  newElement.appendChild(clearButton);

  // ger knappen en eventlyssnare
  document.getElementById("clear-storage-div").addEventListener("click", clearStorage);
}

// funktion som anropas om numrowsEl's eventlyssnare aktiveras
function changeNumrows(e) {

  // kallar på funktionen getChannels
  getChannels();

  // sparar antalet kanaler som ska visas i localStorage
  user.setNumRows(numrowsEl.value);
}

function loadFront(e) {
  location.reload();
}

// hämtar "höjdpunkter"
function printTopStories() {

  // definierar en tillfällig variabel som kommer användas lite hursomhelst
  let tempEl;

  // hämtar det första elementet med klassen .left (vilket i mitt fall är det enda)
  tempEl = document.querySelector(".left");

  // skapar ett nytt element som är en div
  let newElement = document.createElement("div");

  // ger ovannämnda div id't 'top-stories'
  newElement.setAttribute("id", "top-stories");

  // sätter in nya div-elementet före det första child-elementet för .left-elementet. Alltså hamnar det först.
  tempEl.insertBefore(newElement, tempEl.firstChild);

  // hämtar det nyskapade elementet med ID't 'top-stories'
  tempEl = document.getElementById("top-stories");

  // skriver ut Höjdpunkter med h3.
  tempEl.innerHTML += "<h3>Höjdpunkter</h3>";

  // skapar en array med tre stycken program id.
  // 5380 = Nyheter från Ekot
  // 4428 = Musik mot midnatt
  // 488  = P4 Live
  let topStoryId = [5380, 4428, 488];

  // anropar funktionen getTopStory med parametern topStoryId
  getTopStory(topStoryId)
}

function getTopStory(topStoryArr) {

  // loopar igenom topStoryArr
  for (let i = 0; i < topStoryArr.length; i++) {

    // länk till APIt
    let link = `https://api.sr.se/api/v2/episodes/index?programid=${topStoryArr[i]}&size=1&format=json`

    // skapar ett nytt XMLHttpRequest.
    let xhttp = new XMLHttpRequest();

    // eventlyssnare som lyssnar efter förändringar i HTTP-requesten
    xhttp.onreadystatechange = function () {

      // om readyState är 4 (DONE) och status är 200 (OK) så har anropet lyckats och är klart
      if (this.readyState == 4 && this.status == 200) {
        // anropa printTopStory och skicka med svaret på anropet
        printTopStory(this.responseText)
      }
    };

    // öppna och skicka HTTP-requesten
    xhttp.open("GET", link, true);
    xhttp.send();
  }
}

// funktion som skriver ut en höjdpunkt
function printTopStory(json) {

  // gör om JSON till JavaScript
  let parsedJson = JSON.parse(json);

  // skapar ett nytt element. I detta fall en bild.
  let newImg = document.createElement("img");

  // ger det nyskapade elementet attribut
  newImg.setAttribute("style", "width:30%; max-width:100px; margin:2px; cursor: pointer;");
  newImg.setAttribute("title", parsedJson.episodes[0].description);
  newImg.setAttribute("class", parsedJson.episodes[0].id);
  newImg.setAttribute("src", parsedJson.episodes[0].imageurl);
  newImg.setAttribute("alt", `Logotyp för programmet ${parsedJson.episodes[0].program.name}`)

  // lägger till det nya elementet i elementet med id't 'top-stories'
  document.getElementById("top-stories").appendChild(newImg);

  // ger det nya elmentet en eventlyssnare
  newImg.addEventListener("click", function (e) {
    // parametern är en URL till programmet
    playPast(parsedJson.episodes[0].broadcast.broadcastfiles[0].url);
  });
}

// funktion som spelar program som redan har sänts
function playPast(episode) {

  // skriver ut en ljudspelare med variabeln episode som ljudkälla
  radioPlayerEl.innerHTML = `<audio id="actualplayer" controls="" autoplay=""><source src="${episode}" type="audio/mpeg"></audio>`;

  // hämtar ljudspelaren
  actualPlayerEl = document.getElementById("actualplayer");

  // sätter volymen till användarens sparade volym
  actualPlayerEl.volume = user.getVolume();

  // get ljudspelaren en eventlyssnare som lyssnar efter volymändring
  actualPlayerEl.addEventListener("volumechange", function () {

    // sparar volymen i användarens inställningar
    user.setVolume();
  });
}

// skriver ut favoritkanaler
function printFavorites() {


  let tempEl;

  // om 'favorite-container' inte finns, så skapas den
  if (!document.getElementById("favorite-container")) {

    // denna kod är väldigt lik koden på rad 76 och framåt
    tempEl = document.querySelector(".left");
    let newElement = document.createElement("div");
    newElement.setAttribute("id", "favorite-container");
    tempEl.insertBefore(newElement, tempEl.firstChild);
  }

  // hämtar 'favorite-container'-elementet
  tempEl = document.getElementById("favorite-container");

  // om inga favoriter finns...
  if (!user.getFavorite()) {
    // ...skriv ut följande
    tempEl.innerHTML = "<h3>Favoriter</h3>Här hamnar dina favoriter";
  } else {
    // ...annars spara favoriterna i en array
    let favoriteArr = user.getFavorite();

    tempEl.innerHTML = "<h3>Favoriter</h3>";

    // loopa igenom favoritkanalerna
    for (let i = 0; i < favoriteArr.length; i++) {

      // väldigt lik kod som på rad 138
      let newImg = document.createElement("img");

      newImg.setAttribute("style", "width:30%; max-width:100px; margin:2px; cursor: pointer;");
      newImg.setAttribute("alt", `Logotyp för ${allChannels.channels[favoriteArr[i]].name}`);
      newImg.setAttribute("class", allChannels.channels[favoriteArr[i]].id);
      newImg.setAttribute("src", allChannels.channels[favoriteArr[i]].image);

      tempEl.appendChild(newImg);

      newImg.addEventListener("click", function (e) {
        let id = parseInt(e.target.getAttribute("class"));
        playNow(0, id);
      });
    }
  }
}

// funktion som används för att testa eventlyssnare under produktions-stadiet
/*
function iWork(e) {
  console.log("I work!", e.target);
}*/

// funktion som rensar sparade inställningar
function clearStorage() {

  // confirm gör så att en ruta kommer fram där användaren får klicka ok/avbryt
  // om användaren klickar ok, så är if-satsen sann.
  if (confirm("Rensa inställningar.\n\nDetta kommer radera alla dina sparade inställningar (ljudvolym, favoriter, antal kanaler) och ladda om sidan.\nEventuell uppspelning av radio kommer att stoppas.\n\nDetta val kan inte ångras.\n\nVill du fortsätta?")) {
    localStorage.clear();
    location.reload();
  }
}

// hämtar kanalerna. Väldigt likt koden som finns på rad 113
function getChannels() {
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      saveChannels(this.responseText);
      printChannels();
    }
  };
  xhttp.open("GET", APIALLCHANNELS, false);
  xhttp.send();

}

// sparar kanalerna
function saveChannels(json) {

  // gör om JSON till JavaScript och sparar i allChannels
  let parsedJson = JSON.parse(json);
  allChannels = parsedJson;
}

// skriv ut alla kanaler
function printChannels() {

  let nodeListChannels = allChannels.channels;

  // fyller dropdown-listan uppe till höger
  fillList(nodeListChannels);

  // tömmer mainNavListEl
  mainNavListEl.innerHTML = "";

  // loopar igenom alla kanaler
  for (let i = 0; i < nodeListChannels.length; i++) {

    // detta stoppar loopen om antal varv är
    // större eller likamed värdet av numrowsEl
    if (i >= numrowsEl.value) {
      break;
    }

    // följande kod är väldigt lik koden på rad 138 och framåt, fast med li- istället för img-element

    let newLi = document.createElement("li");

    newLi.setAttribute("id", nodeListChannels[i].id);
    newLi.setAttribute("class", i);
    newLi.setAttribute("title", nodeListChannels[i].tagline);
    newLi.appendChild(document.createTextNode(nodeListChannels[i].name));
    mainNavListEl.appendChild(newLi);
    newLi.addEventListener("click", getSchedule);

  }
}

// funktion som fyller dropdown-listan
function fillList(nodeListChannels) {

  // loopar igenom alla kanaler
  for (let i = 0; i < nodeListChannels.length; i++) {

    // följande kod är väldigt lik koden på rad 138 och framåt, fast med option- istället för img-element
    let newOption = document.createElement("option");
    newOption.setAttribute("value", nodeListChannels[i].id);
    newOption.appendChild(document.createTextNode(nodeListChannels[i].name));
    playChannelEl.appendChild(newOption);
  }
}

// funktion som spelar upp radio live
// e är med trots att det inte används för att eventlyssnare skickar med eventet automatiskt
function playNow(e, channelId) {

  // hämtar värdet från playChannelEl
  let chosenChannel = playChannelEl.value;

  // man kan starta spelare genom en knapp i tablån, då skickas channelId med. Om den inte är null så sparas alltså den istället
  if (channelId) {
    chosenChannel = channelId;
  }

  // länk till liveradio
  let link = `https://sverigesradio.se/topsy/direkt/srapi/${chosenChannel}.mp3`;

  // skriver ut en ljudspelare med ovanstående länk som källa
  radioPlayerEl.innerHTML = `<audio id="actualplayer" controls="" autoplay=""><source id="audio-src" src="${link}" type="audio/mpeg"></audio>`;

  // nedanstående kod finns beskriven på rad 166
  actualPlayerEl = document.getElementById("actualplayer");
  actualPlayerEl.volume = user.getVolume();
  actualPlayerEl.addEventListener("volumechange", function () {
    user.setVolume();
  });
}

// funktion som hämtar tablån för en specifik kanal
function getSchedule(e) {

  // hämtar id't från eventet/elementet man klickat på
  let channelId = e.target.getAttribute("id");

  // pagination=false gör alla program hamnar på samma sida
  let APIschedule = `https://api.sr.se/api/v2/scheduledepisodes?channelid=${channelId}&format=json&pagination=false`;

  // nedastående kod finns kommenterad på rad 113
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      printSchedule(this.responseText, e.target);
    }
  };
  xhttp.open("GET", APIschedule);
  xhttp.send();
}

// skriver ut tablån
function printSchedule(json, channel) {

  // gör om JSON till JavaScript.
  let nodeListPrograms = JSON.parse(json).schedule;

  // hämtar class-attributet från parametern channel
  const channelIndex = channel.getAttribute("class");

  let channelName = channel.innerHTML;

  // skapar två variabler som hämtar kanalens färg och bild 
  let channelColor = allChannels.channels[channelIndex].color;
  let channelLogo = allChannels.channels[channelIndex].image;

  // hämtar kanalens id
  let channelId = channel.getAttribute("id");

  // skapar två variabler som används senare
  let isFavorite;
  let favColor;

  // kollar om en kanal är sparad som favorit eller inte
  if (user.isFavorite(channel.getAttribute("class"))) {
    isFavorite = "Ta bort";
    favColor = "darkred"

  } else {
    isFavorite = "Favorit";
    favColor = "#DDAD00"
  }

  // kollar om tablån är tom eller inte
  if (nodeListPrograms.length < 1) {
    // skapar en div, en h2, två knappar och ger dem lite styling och annat gott
    infoEl.innerHTML = `<div style="display:flex;justify-content:space-between;"><div><h2 style="color:#${channelColor}">${channelName} - Tablå</h2><button id="playbutton2" value="${channelId}" style="background-color:#${channelColor}" class="btn btn-primary">Spela</button><button id="addToFav" value="${channelIndex}" style="background-color:${favColor}; margin-left:1em;" class="btn btn-primary">${isFavorite}</button></div><img src="${channelLogo}" style="height:100px" alt="Logotyp för ${channelName}"></div><br><h2>${channelName} har sändningsuppehåll.</h2>`;
    return;
  } else {
    infoEl.innerHTML = `<div style="display:flex;justify-content:space-between;"><div><h2 style="color:#${channelColor}">${channelName} - Tablå</h2><button id="playbutton2" value="${channelId}" style="background-color:#${channelColor}" class="btn btn-primary">Spela</button><button id="addToFav" value="${channelIndex}" style="background-color:${favColor}; margin-left:1em;" class="btn btn-primary">${isFavorite}</button></div><img src="${channelLogo}" style="height:100px" alt="Logotyp för ${channelName}"></div>`;

    // eventlyssnare på nya spelknappen
    // med den kan man spela upp en kanal direkt från tablån
    let playButton2El = document.getElementById("playbutton2");

    // eventlyssnare
    playButton2El.addEventListener("click", function (e) {

      // gör om en eventuell string till ett integer
      let id = parseInt(playButton2El.value);
      playNow(0, id);
    });

    // eventlyssnare på favorit-knappen
    let addToFavEl = document.getElementById("addToFav");
    addToFavEl.addEventListener("click", function (e) {

      // om kanalen finns bland favoriter eller inte, så ska texten och färgen ändras
      if (user.handleFavorite(e.target.value)) {
        addToFavEl.innerHTML = "Favorit";
        addToFavEl.style.backgroundColor = "#DDAD00"
      } else {
        addToFavEl.innerHTML = "Ta bort";
        addToFavEl.style.backgroundColor = "darkred";
      }

      // skriver ut favoritkanalerna
      printFavorites();



    });
  }



  // loopar igenom alla program
  for (let i = 0; i < nodeListPrograms.length; i++) {
    let newElement;

    // sparar nuvarande tid i millisekunder sedan epoch (1 januari 1970)
    let currentTime = new Date().getTime();

    // gör om start-/sluttid från API't. convertDate returnerar antingen en array med användbar tid eller false
    let timesArr = convertDate(
      nodeListPrograms[i].starttimeutc,
      nodeListPrograms[i].endtimeutc,
      currentTime
    );

    // om timesArr inte är false
    if (timesArr) {

      // nedanstående kod är väldigt lik koden på rad 138 och framåt
      let newArticle = document.createElement("article");

      newElement = document.createElement("h3");
      newElement.innerHTML = nodeListPrograms[i].title;
      newArticle.appendChild(newElement);

      newElement = document.createElement("h4");

      // om nodeListPrograms[i].subtitle inte är tom
      if (nodeListPrograms[i].subtitle) {
        newElement.innerHTML = nodeListPrograms[i].subtitle;
      } else {
        newElement.innerHTML = "";
      }
      newArticle.appendChild(newElement);

      newElement = document.createElement("h5");
      newElement.innerHTML = `${timesArr[0]} - ${timesArr[1]}`;
      newArticle.appendChild(newElement);

      newElement = document.createElement("p");
      newElement.innerHTML = nodeListPrograms[i].description;
      newArticle.appendChild(newElement);

      infoEl.appendChild(newArticle);
    }

  }
}

// funktion som gör om datum till användbart format
function convertDate(start, stop, current) {

  // plockar ut alla nummer med hjälp av regex från start-/sluttiden man får från APIt
  let startTime = new Date(parseInt(start.match(/\d+/g)));
  let stopTime = new Date(parseInt(stop.match(/\d+/g)));

  // om sluttiden är mindre än nuvarande tid returneras false
  if (stopTime < current) {
    return false;
  }

  // hh:mm
  let options = { hour: "numeric", minute: "numeric" };

  // skapar en array med start- och sluttid
  let times = [
    new Intl.DateTimeFormat("de-DE", options).format(startTime),
    new Intl.DateTimeFormat("de-DE", options).format(stopTime),
  ];
  return times;
}

// definierar en klass som heter Settings
class Settings {

  constructor() {
    // läser in från localStorage
    // namnet 9571settings är för att inte krocka med några andra localStorage objekt som råkar heta "settings"
    let settings = JSON.parse(localStorage.getItem("9571settings"));

    // om localStorage existerar, använd befintliga inställningar
    if (settings) {
      this.volume = settings[0];
      this.numRows = settings[1];
      this.favorites = settings[2];
    } else {
      this.volume = 0.5;
      this.numRows = 10;
      this.favorites = [];
    }

  }

  // sparar inställningar till localStorage
  saveSettings() {

    // spara klassens variabler i en array
    let settings = [this.volume, this.numRows, this.favorites];

    // rensa localStorage för säkerhetsskull
    localStorage.clear();

    // spara till localStorage
    localStorage.setItem("9571settings", JSON.stringify(settings));
  }

  // hämta volym
  getVolume() {
    return this.volume;
  }

  // hämta antalet kanaler
  getNumberOfRows() {
    return this.numRows;
  }

  // hämta favoriter
  getFavorite() {
    if (!this.favorites) return;
    if (this.favorites.length > 0) return this.favorites;
  }

  // ta bort/lägg till favorit
  handleFavorite(channelIndex) {
    let tempArr = [];
    let removed = true;
    if (this.favorites.includes(parseInt(channelIndex))) {

      for (let i = 0; i < this.favorites.length; i++) {

        //console.log(channelIndex);
        //console.log(this.favorites[i])
        if (channelIndex != this.favorites[i]) {
          tempArr.push(this.favorites[i]);

        }
      } this.favorites = tempArr;
    } else {
      this.favorites.push(parseInt(channelIndex));
      removed = false;
    }
    this.saveSettings();
    return removed;
  }

  // se om kanal är favorit
  isFavorite(channelIndex) {
    if (this.favorites.includes(parseInt(channelIndex))) {
      return true;
    } return false;
  }

  // spara antalet kanaler som ska visas
  setNumRows() {
    this.numRows = parseInt(numrowsEl.value);
    this.saveSettings();
  }

  // spara volymen
  setVolume() {
    this.volume = parseFloat(actualPlayerEl.volume);
    this.saveSettings();
  }
}
