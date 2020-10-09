# Quellcode (Node.js)

Diese Anwendung basiert auf dem Konzept des ME(V)N-Stacks, d.h. die Komponenten MongoDB, Express, (Vanilla Javascript) und Node.js werden miteinander kombiniert.

## Architektur

### Express

#### Routes

Die Routes die die App bereitstellt sind in zwei Übergruppen unterteilt:

##### Markup

Diese Routen werden verwendet, um dynamisch erzeugtes HTML an den Benutzer auszuliefern.
Dabei werden Parameter an die View Engine übergeben, um den Content darzustellen. Die Routen werden durch die `markupWrapper`-Klasse eingebunden. Folgende Routen stehen zur Verfügung:

* / (GET) - Startseite der App
* /login (GET/POST) - Anmeldung im System
* /register (GET/POST) - Registrierung eines neuen Benutzers
* /logout (GET) - Abmeldung der Benutzersitzung
* /dashboard (GET) - Kapselt User, Channel und Sketch Funktionalitäten
* /@me (GET) - Anzeige des eigenen Benutzerprofils
    * /update (POST) - Anpassung der Benutzerdaten
    * /upload (POST) - Hochladen eines Avatars
* /join (GET) - Join Channel View
* /public-feed (GET) - Sammlung aller veröffentlichten Zeichnungen mit Up-/Downvote Funktion
* /imprint (GET) - Impressum
* /* (GET) - Wildcard-Route; dem Benutzer wird eine 404-Seite angezeigt


##### API

Diese Routen bieten eine Schnittstelle zur Abfrage von Serverdaten. Die jeweiligen Serverantworten werden im JSON-Format, durch die `ApiResponse`-Klasse dargestellt, ausgeliefert und je nach Erfolg der Anfrage mit dem passenden HTTP-Status-Code versehen. Die API wird von der Anwendung auch intern genutzt, um Benutzeroberflächen in Echtzeit per AJAX nachzuladen und dieses so aktuell zu halten, ohne den Benutzer zu zwingen sein Browserfenster zu aktualisieren. Die Routen werden durch die `apiWrapper`-Klasse eingebunden. Folgende Routen stehen unter /api zur Verfügung:

* /user/:id (GET) - Abfrage eines Benutzerprofils
* /channel 
    * /:id (GET) - Abfragen eines Channelprofils
    * /new (POST) - Erstellen eines neuen Channels
    * /join/:id (POST) - Beitreten eines bestehenden Channels
    * /leave/:id (POST) - Verlassen eines Channels
    * /kick/:id (POST) - Entfernt User aus einem Channel
    * /delete/:id (POST) - Löscht den Channel
    * /update/:id (PATCH) - Überschreibt die Channel-Attribute
    * /:id/upload (POST) - Hochladen eines Channel Icons
    * /roles/:id (PATH) - Überschreibt die Rollen-Einstellungen
* /sketch
    * /:sketchId (GET) - Abfragen eines Sketches
    * /all/:channelId (GET) - Abfragen aller Sketches eines Channels
    * /all-finalized/:channelId (GET) - Abfragen aller abgeschlossenen Sketches eines Channels
    * /all-published (GET) - Abfragen aller veröffentlichten Sketches
    * /current/:channelId (GET) - Abfragen des aktuellen Sketches eines Channels
    * /new/:channelId (POST) - Erstellen eines neuen Sketches in einem Channel
    * /save/:channelId (POST) - Speichern eines Sketches in einem Channel
    * /upvote/:sketchId (POST) - Upvote eins Sketches
    * /downvote/:sketchId (POST) - Downvote eines Sketches
    * /finalize-create/:channelId (POST) - Abschließen eines Sketches und Erstellung eines neuen Sketches in einem Channel
    * /publish/:sketchId (POST) - Veröffentlichen eines Sketches im Public Feed

### Authentifizierung

Zur Authentifizierung mit dem System wird das Node-Modul `passport.js` verwendet. Dafür werden eine SignIn- und eine SignUp-Strategie definiert und über die `authWrapper`-Klasse im Server eingebunden. Die Benutzer werden in einer externen Datenbank gespeichert, wobei die Passwörter als 10-stellige Hashes hinterlegt werden. Die Zugriffsberechtigungen werden bei sämtlichen Routen, mit Ausnahme der Startseite, Public-Feed und Fehleranzeigen, durch eine Middleware geprüft, bevor entsprechende Inhalte ausgeliefert werden.

### Datenbank

Als Datenbank-Lösung wird eine MongoDB verwendet. Die Datenbank wird in Form eines Clustern beim Anbieter MongoDB Atlas gehostet.
Sie wird über die `Mongoose.js` Library angesprochen. Dafür werden Schemata für die zu persistierenden Daten - User, Channel, Sketch - erstellt. Diese Modelle werden durch jeweilige Repositories und eine zusammenfassende `DatabaseWrapper`-Klasse vom Rest der App abstrahiert. 

### View Engine

Zur dynamischen Erstellung des Contents wird die View Engine EJS verwendet. Diese erhält Übergabeparameter, wie Benutzerdaten, beim Renderaufruf der jeweiligen Route.

### Storage

Um den Upload von benutzereigenen Daten zu ermöglichen, wird die `StorageWorker`-Klasse verwendet. Diese dient als Middleware und stellt das `Multer`-Package zur Verfügung. Die hochgeladenen Bilder werden im öffentlichen App-Directory der Anwendung abgelegt und in den MongoDB-Dokumenten referenziert.

### Socket.IO

Die `Socket.IO` Library wird als Websocket eingesetzt, um das kollaborative Zeichnen in Echtzeit zu ermöglichen. Um zwischen verschiedenen Channels zu unterscheiden, werden zwischen Clients Events mit dynamisch generierten Identifiern emited. Als Events wurde folgende Tags festgelegt:
* UNSUBSCRIBE, SUBSCRIBE, LINE_DRAWN, LINE_UNDO, CLEAR_CANVAS, CHANNEL_LINE_HISTORY, DELETE_CHANNEL, NEW_SKETCH, TEMPLATE, ADMIN_SETTINGS, ACTIVE_USER, ERROR

Da auch hier Fehler auftreten können, werden alle Operation im `socketWrapper.js` per try/catch abgesichert und falls ein Fehler auftritt, wird durch den *error*-Tag das dem Client mitgeteilt.

## Dependencies

Zur Umsetzung der Anwendung werden eine Reihe von Fremdlibraries verwendet:

    * bcryptjs - Erzeugung und Vergleich von Passworthashes
    * body-parser - Verarbeitung von Daten über POST-Requests
    * concat-stream - Auslesen von Daten aus Dateiuploads
    * connect-flash - Anzeige von Fehler Feedback im Frontend
    * crypto - Erzeugung von zufälligen Zeichenfolgen für Dateinamen
    * ejs - View Engine
    * express - Nodejs Framework
    * express-session - Speichern von Sitzunginformationen
    * fs - Speichern von Dateien im Filesystem
    * jimp - Anpassung von hochgeladenen Bilddateien
    * lodash - Allgemeine JS-Utility Funktionen
    * mkdirp - Rekursives Erstellen von Verzeichnissen beim Fileupload
    * mongodb - Modul für Datenbanklösung
    * mongoose - Umgang mit MongoDB in Nodejs
    * multer - Middleware für FileUpload
    * passport - Authentifizierungslösung
    * passport-local - Kombination mit Passport
    * path - Umgang mit Verzeichnissen und Pfaden in Nodejs
    * socket.io - Websocket für Echtzeitkommunikation
    * streamifier - Umgang mit FileUpload
