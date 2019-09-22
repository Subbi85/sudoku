"use strict";

//erste runde
var xPos = 0;
var yPos = 0;
var start = true;//fuer aenderung layout vorgaenger in erster runde

//varieren je nach schwiergkeitsgrad
var myGesetzteWerte = 0;

//welches td ist aktiv?
var aktId;

// tabellen
var userErgebnis = [];
var visibleWerte = []; //true = visible

//timer
var myTimer;
var myTotalSeconds;
var myTime;

//default werte buttons
var gameId = "middleGameId";
var myLabel;

//mehrere games
var jsonDoc;
var jsonObject;
var games;
var myLoesung;
var gameNumber = 0; // automatische nummer aus jsondoc
var gameNr; //nr in json ausgeschrieben
var gameName;
var visibleWerteMittel = [];
var visibleWerteSchwer = [];
var visibleWerteLeicht = [];
var visibleWerteTest = [];
//schwierigkeitsleven zwischenspeichern
var myModus;


// JSON /////////////////////////////////////////
loadJsonDoc();
function loadJsonDoc() {
  var xhttp = new XMLHttpRequest();
  xhttp.onload = function() {
	jsonDoc = xhttp.responseText;
	jsonObject = JSON.parse(jsonDoc);
	games = jsonObject.games;
    myLoesung = games[0].myLoesung;	
    initPage();
 };
  xhttp.open("GET", "games.json", true);
  xhttp.setRequestHeader("Accept", "application/json");
  xhttp.send();
}

// seite laden
function initPage(){
	//dropdown menue
	for (var k = 0; k < games.length; k++) {
		var node = document.createElement("option");
		node.setAttribute("value",games[k].gameNr);
		node.setAttribute("id",games[k].gameNr);
		var myText = document.createTextNode(games[k].gameName);
		node.appendChild(myText);
		document.getElementById("selectGameNumber").appendChild(node);
	}
	gameNumber = 0;
	myModus = visibleWerteMittel;
	
	initGame(gameNumber, games[gameNumber].visibleWerteMittel);
}

// spiel initialisieren (nummer , schwierigkeit)/////////////////////////////////////
function initGame(gameNumber, visibleWerteInit){

	//alle values zuruecksetzen
	xPos = 0;
	yPos = 0;
	myGesetzteWerte = 0;
	aktId = false;
	userErgebnis = [];
	//tabelle zuerst leeren
	document.getElementById("tabelle").innerHTML = "";
	// overlay gewinnmeldung ausblenden
	document.getElementById("messageDiv").setAttribute("class","hidden");
	// overlay = startknopf einblenden
	document.getElementById("startDiv").removeAttribute("class");
	//timer nullen
	clearInterval(myTimer);
	document.getElementById("timer").innerHTML = "00:00";
	myTime = "";

	// das UserErgebnis wird initialisiert mit (bzw kopiert von) visible Wert (true/false),
	// false wird durch user eingaben ersetzt und spaeter ueberprueft
	// schoener machen?
	for (var i = 0; i < visibleWerteInit.length; i++){
		userErgebnis.push([]);
		for (var j = 0; j < visibleWerteInit[i].length; j++){
			if (visibleWerteInit[i][j] == true){
				userErgebnis[i][j]  = true;
				myGesetzteWerte++;
			}else{
				userErgebnis[i][j]  = false;
			}
		}
	}
	visibleWerte = visibleWerteInit; // init wird uebergeben, deswegen var fuer "drausen" belegen

	// tabelle erzeugen
	var tabelle = document.createElement("table");
	for(var i=0; i<myLoesung.length; i++){
		var zeile = document.createElement("tr");
		for(var j=0; j<myLoesung[i].length; j++){
			var zelle = document.createElement("td");
			//vorgegebene werte einblenden
			if (visibleWerteInit[i][j] == true){
				var text = document.createTextNode(games[gameNumber].myLoesung[i][j]);
				zelle.appendChild(text);
				zelle.setAttribute("class", "vorgabewerte");
				zelle.appendChild(text);
			}
			//leere felder = input felder
			else{
				zelle.setAttribute("id", i+"_"+j);
				zelle.setAttribute("onclick", "changeFeld("+i+","+j+")");
				//input
				var myInput = document.createElement("input");
				myInput.setAttribute("type", "text");
				myInput.setAttribute("name","newWert"+i+"_"+j);
				myInput.setAttribute("size","1");
				myInput.setAttribute("maxlength","1");
				myInput.setAttribute("oninput", "setNewValue()");
				zelle.appendChild(myInput);
			}
			zeile.appendChild(zelle);
		}
		tabelle.appendChild(zeile);
	}
	document.querySelector("#tabelle").appendChild(tabelle);
	//document.getElementById("errorMessage").innerHTML = "Spiel vom "+games[gameNumber].gameName+", Spielnummer: "+games[gameNumber].gameNr;
}

// user -> klick wir ueber usernavigation  ///////////////////////////////
function gameMode (modusGame){
	//buttons toggle alten inaktiv setzen, ist in erster runde "middle"
	myLabel = document.getElementById(gameId).parentElement;
	myLabel.classList.toggle("active");

	gameId = modusGame+"Id";
	console.log(gameId+"__"+gameNumber);

	myLabel = document.getElementById(gameId).parentElement;
	myLabel.classList.toggle("active");

	switch(modusGame) {
		case "easyGame":
			initGame(gameNumber,games[gameNumber].visibleWerteLeicht);
			myModus = visibleWerteLeicht;
			break;
		case "hardGame":
			initGame(gameNumber, games[gameNumber].visibleWerteSchwer);
			myModus = visibleWerteSchwer;
			break;
		case "testGame":
			initGame(gameNumber, games[gameNumber].visibleWerteTest);
			myModus = visibleWerteTest;
			break;
		default:
			initGame(gameNumber, games[gameNumber].visibleWerteMittel);
			myModus = visibleWerteMittel;
	}
}

// user aktion -> onchange (nach datum)
function  loadGameNumber(){
	console.log("hello GameNumber");
	console.log(games[gameNumber].myModus);
	var myForm = document.forms.myGameNumberForm;
	gameNumber = myForm.myGameNumberSelect.value;
	console.log(gameNumber);
	console.log(visibleWerte);
	visibleWerte = games[gameNumber].visibleWerteMittel;//hier sollte myModus uebergeben erden
	initGame(gameNumber, visibleWerte);
}

//spiel starten //////////////////////////////////////////
function startGame(){
	//zuruecksetzen
	start = true;
	//timer
	myTimer = 0;
	myTotalSeconds = 0;

	myTimer = setInterval(timer, 1000);
	document.getElementById("startDiv").setAttribute("class", "hidden");
}

// klick ins td -> farbe //////////////////////////////////
function changeFeld(myNewYPos, myNewXPos){
	aktId = myNewYPos+"_"+myNewXPos;
	//in der ersten runde wird vorgaenger nicht zurueckgesetzt
	if (start != true){
		document.getElementById(yPos+"_"+xPos).removeAttribute("class");
	}else{
		start = false;
	}
	//neues aktiv setzen
	document.getElementById(aktId).setAttribute("class", "aktivInput");
	// bestehenden wert loeschen
	myForm["newWert"+aktId].value = "";

	//neue werte werden alte werte
	xPos = myNewXPos;
	yPos = myNewYPos;
}

// wert setzen in td + ergebnis array ///////////////////////////////////////
function setNewValue(){
	var myNewWert = myForm["newWert"+aktId].value;

	//fehlerhafte eingabe abfangen
	if ((myNewWert == 0) || (isNaN(myNewWert))){
		myForm["newWert"+aktId].value = "";
	//korrekte eingabe, wert wird gesetzt
	} else {
		//pruefung ob feld vorher leer, dann zaehler hoch
		if (userErgebnis[yPos][xPos] == false){
			myGesetzteWerte++;
		}
		//array befuellen
		userErgebnis[yPos][xPos] = Number(myNewWert);
		//ausgabe befuellen
		myForm["newWert"+aktId].value = myNewWert;
		// alle felder voll ->
		if (myGesetzteWerte == 81){
			verifyErgebnis();
		}
	}
}

//validierung ///////////////////////////////
function verifyErgebnis(){
	//timer stop
	clearInterval(myTimer);

	var endErgebnis = true;	//loesung korrekt bis eins falsch
	for (var i = 0; i < 9; i++){
		for (var j = 0; j < 9; j++){
			//nur pruefen wenn feld zu beginn leer war
			if (visibleWerte[i][j] != true){
				if (userErgebnis[i][j] == games[gameNumber].myLoesung[i][j]){
					document.getElementById(i+"_"+j).style.backgroundColor = "#ccff66";//gruen
					document.getElementById(i+"_"+j).innerHTML = userErgebnis[i][j];
				} else {
					document.getElementById(i+"_"+j).style.backgroundColor = "#ff5050";//rot
					endErgebnis = false;
				}
			 }
		}
	}
	//layover einblenden
	document.getElementById("messageDiv").removeAttribute("class");
	if (endErgebnis == true){
		document.getElementById("messageDiv").innerHTML = "Gewonnen! Zeit: "+myTime;
	} else {
		document.getElementById("messageDiv").innerHTML = "Das Ergebnis ist nicht korrekt :-(.";
	}
}

//timer /////////////////////////////////////////////
function timer() {
	myTotalSeconds++;
	var myHour = Math.floor(myTotalSeconds /3600);
	var myMinute = Math.floor((myTotalSeconds - myHour*3600)/60);
	var mySeconds = myTotalSeconds - (myHour*3600 + myMinute*60);
	if (myMinute < 10){
		myMinute = '0' + myMinute;
	}
	if (mySeconds < 10){
		mySeconds = '0' + mySeconds;
	}
	myTime = myMinute + ":" + mySeconds
	document.getElementById("timer").innerHTML = myTime;
}
