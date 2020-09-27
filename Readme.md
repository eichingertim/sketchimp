# Projekt

Die Anwendung soll eine Plattform für kollaboratives Zeichnen mit mehreren Benutzern bieten. Der Fokus liegt dabei auf dem Zusammenschluss in Gruppen (Channels), die eine Zeichenfläche zur Verfügung gestellt bekommen, mit der sie gemeinsam an einem Sketch arbeiten können. Die so erstellten Zeichnungen können abgeschlossen und wenn gewünscht veröffentlicht werden. Im "Public Feed" werden diese dann, zusammen mit Bildern anderer Kanäle, allen angemeldeten und anonymen Besuchern angezeigt und können von ersteren mit "Gefällt mir" oder "Gefällt mir nicht" ausgezeichnet werden.

## Team

1. Tim Eichinger - tim1.eichinger@stud.uni-regensburg.de
  * Komponenten: 
    * Socketio 
    * Zeichenkomponente+Toolbox
    * Dashboard Frontend
    * Sketch-History
2. Tobias Dollhofer - tobias.dollhofer@stud.uni-regensburg.de
  * Komponenten: 
    * Sketchfunktionalität (Datenbankmodel, Upload) 
    * Publicfeed Kartendesign 
    * Web- und Datenbankhosting
    * Logo-Design
3. Lukas Schauhuber - lukas.schauhuber@stud.uni-regensburg.de
  * Komponenten: 
    * Backendrouting und Konfiguration
    * Datenbank, Modelle User und Channel
    * Authentifizierung
    * Channelsystem
    * Frontend Landing- und PublicFeed
    * View Engine
    * Dateiupload
    * Public .me Domain registriert
4. Timon Lorenz
5. Jonas Ernst

## Setup und Ausführen der Anwendung

Die App wird vom Projektteam unter der Domain http angeboten.
Zusätzlich besteht die Möglichkeit, das Projekt direkt auf einem eigenen Webserver auszuführen.
Allerdings ist zu beachten, dass, ohne Anpassung der Datenbank-Verbindung, die Bild-Referenzen nicht geladen werden können, da die Quelldateien nur auf dem gehosteten Webserver vorliegen. Die reguläre Datenbank-URL liegt unter `/lib/config/Constants.js` als Konstante vor.

Um die Anwendung lokal zu installieren und zu starten sind keine besonderen Schritte notwendig. 
Es reichen folgende Kommandos:

```npm install```

```npm start```

## Beschreibung

* Registrieren von Usern
  * -- Screenshot Signup Maske --
* Anmeldung im System
  * -- Screenshot Login Maske --
* Erstellen von Channels Beitreten von Channels
  * -- Screenshot Channel Create Maske --
* Zeichnen auf eigenem peristentem Canvas pro Channel
  * -- Screenshot Canvas --
* Festlegen von Benutzerrollen mit verschiedenen Rechten pro Channel
  * -- Screenshot Channel Admin Panel --
* Verwendung eines Ebenensystems
  * -- Screenshot Layer Auswahl --
* Wechseln von Stiftgrößen, Farben; Radieren, Rückgängig machen, Löschen
  * -- Screenshot Toolbox --
* Ändern von Usereinstellungen, Hochladen eines Avatars
  * -- Screenshot User Profile --
* Hochladen eines Channel Avatars
  * -- Screenshot Channel Info --
* Abschließen von Zeichnungen
  * -- Screenshot Save Sketch Maske --
* Veröffentlichen von Zeichnungen
  * -- Screenshot Finalize and Publish Sketch --
* Anzeigen einer Zeichenhistorie im Channel
  * -- Screenshot Sketch History --
* Exportieren von Zeichnungen
  * -- Screenshot Export Sketch --
* Auflistung aller veröffentlichten Zeichnungen im Public Feed
  * -- Screenshot Public Feed --
* Upvote und Downvote von Sketches
  * -- Screenshot Card Hover --
* Scoresystem bei Benutzern
  * -- Screenshot User Hover --
* Dynamisches Reloading des Frontends über AJAX
  * -- Gif AJAX Reloading --
* Eigen erstellte Server-API zur Abfrage von Channels/Usern/Sketches
  * -- Screenshot Lookup API --
