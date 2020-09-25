# Projekt

Die Anwendung soll eine Plattform für kollaboratives Zeichnen mit mehreren Benutzern bieten. Der Fokus liegt dabei auf dem Zusammenschluss in Gruppen (Channels), die eine gemeinsame Zeichenfläche zur Verfügung gestellt bekommen, mit der sie an einem Sketch arbeiten können. Die so erstellten Zeichnungen können abgeschlossen und wenn gewünscht veröffentlicht werden. Im "Public Feed" können diese dann, zusammen mit Bildern anderer Kanäle, eingesehen und up- oder downgevotet werden.

## Team

1. Tim Eichinger - tim1.eichinger@stud.uni-regensburg.de
  * Komponenten: 
    * Socketio 
    * Zeichenkomponente+Toolbox
    * Dashboard Frontend
2. Tobias Dollhofer - tobias.dollhofer@stud.uni-regensburg.de
  * Komponenten: 
    * Sketchfunktionalität (Datenbankmodel, Upload) 
    * Publicfeed Kartendesign 
    * Web- und Datenbankhosting
3. Lukas Schauhuber - lukas.schauhuber@stud.uni-regensburg.de
  * Komponenten: 
    * Backendrouting und Konfiguration
    * Datenbank, Modelle User und Channel
    * Authentifizierung
    * Channelsystem
    * Frontend Landing- und PublicFeed
    * View Engine
    * Dateiupload
4. Timon Lorenz
5. Jonas Ernst

## Setup und Testing

Im Starterpaket ist ein einfacher Webserver vorgegeben, mit dem Sie die Inhalte des Ordners `/app` statisch ausliefern können. Benutzen Sie diesen, um Ihre Anwendung zu entwickeln und zu testen. Sollten Sie zu Realisierung Ihrer Anwendung eine komplexere Serverkomponente benötigen, können Sie die vorhandenen Dateien (`index.js` und `lib/AppServer.js`) als Ausgangslage für eigene Erweiterungen nutzten. Speichern Sie alle weiteren, serverseitig verwendeten Dateien im Verzeichnis `/lib` ab.

So nutzen Sie den vorgegebenen Server:

1. Führen Sie **einmalig** den Befehl `npm install` aus, um die notwendigen Abhängigkeiten (`express`) zu installieren.

2. Führen Sie den Befehl `npm start` aus um die Anwendung zu starten. Der Inhalt des `/app`-Verzeichnis ist anschließend über die die Adresse `http://localhost:8000/app` erreichbar.

### Automatisches Bauen der Anwendung

Es sind keine besonderen Schritte notwendig um die Anwendung zu starten

npm install 
npm start

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
