# Quellcode (Client)

## CSS
Für jede Hauptseite der WebApp existiert jeweils eine CSS-Datei, die dafür geladen wird. Eine *Haupt-CSS*-Datei
 importiert aber optional wieder mehrere CSS-Dateien für bestimmte Bausteine.
 
 ### Dashboard CSS Struktur
 Das Dashboard wurde in verschiedene Teilbereiche untergliedert, um eine bessere Übersicht zu ermöglichen. In der
  *Hauptdatei* `dashboard.css` werden alle Style-Bausteine importiert, die benötigt werden. Dazu zählen *Colors
  , Dialoge und der Content mit den beiden Sidebars, TopBar und Canvas*
## Javascript
Für die Javascript-Implementierung haben wir uns für einen **Objektorientierten Ansatz** entschieden, um der ganzen
 App eine bessere Wartbarkeit zu ermöglichen. 
 ### Dashboard
 Das Dashboard hat seinen Einstieg in der `index.js`, die dort dann eine Instanz von `Dashboard.js` erstellt und wenn
  vorhanden einem Channel joint.
  
  Die `Dashboard.js` stellt Dreh- und Angelpunkt des Dashboards dar. Dort werden **Models**, **Views** und
   **Controller** miteinander in Verbindung gebracht. Der Übersicht halber sind deshalb die jeweiligen Module in 4
    Überkategorien unterteilt: 
    
1. **controller**: 
    * `ChannelController.js`: Klasse mit statischen Methoden, die für die *AJAX*-Kommunikation mit der *API* speziell für Channels zuständig sind
    * `MemberController.js`: Klasse mit einer statischer Methode, zuständig für das lLsen von Member-Daten
    * `SketchController.js`: Klasse mit statischen Methoden, die für die*AJAX*-Kommunikation mit der *API* speziell für Sketches zuständig sind
    * `DrawAreaController.js`: Hier werden alle **Socket.io** spezifischen aktion abgehandelt. Sowhl das emitieren als auch das empfangen von Socket-Nachrichten.
2. **models**: 
    * `ChannelModel.js`: Modell zur Abbildung eines Channels zur Laufzeit im Frontend
    * `SketchModel.js`: Modell zur Abbildung eines Sketches. Wird als `currentSketch` im Channel-Modell gespeichert.
    * `UserModel.js`: Modell zur Abbildung des Nutzers zur Laufzeit.
3. **ui/dashboard**: 
    * `AdminSettingsDialogView.js`: Repräsentiert den AdminSettingsDialog. Setzt Listener und kann diesen entsprechend der Daten anpassen. Überträgt mit Hilfe von Events auch Daten an das Dashboard.
    * `ChannelInfoDialogView.js`: Repräsentiert den ChannelInfoDialog. Setzt Listener und kann diesen entsprechend der Daten anpassen. Überträgt mit Hilfe von Events auch Daten an das Dashboard.
    * `ChannelListView.js`: Repräsentiert den ChannelListView (Auflistung von Channels an der linken Seite). Setzt Listener und kann diesen entsprechen der Daten anpassen. Überträgt mit Hilfe von Events auch Daten an das Dashboard.
    * `ChooseTemplateDialogView.js`: Repräsentiert den ChooseTemplateDialog. Setzt Listener für die Auswahl und überträgt mit Hilfe von Events die Daten an das Dashboard.
    * `CreateChannelDialogView.js`: Repräsentiert den CreateChannelDialog. Setzt Listener, überprüft die Eingaben und überträgt mit Hilfe von Events auch Daten an das Dashboard.
    * `CreateSketchDialogView.js`: Repräsentiert den CreateSketchDialog. Setzt Listener, überprüft die Eingaben und überträgt mit Hilfe von Events auch Daten an das Dashboard.
    * `DrawAreaView.js`: Repräsentiert den Canvas und ist verantwortlich für das Verarbeiten von Ereignissen, die das Zeichnen betrifft. Dort wird auch die Library `Konva.js` verwendet.
    * `JoinChannelView.js`: Repräsentiert die Seite, die erscheint, wenn Nutzer einen Invite Link verwendet.
    * `MemberListView.js`: Verwaltet das MitgliederView auf der rechten Seite des Dashboards. Kann die Mitglieder dort hinzufügen, entfernen und Online.Status per Farbe anzeigen.
    * `SaveLoadView.js`: Repräsentiert das View, in dem der Nutzer 4 Auswahlmöglichkeiten zur Interaktion mit dem Sketch hat.
    * `ToolboxView.js`: Repräsentiert die Toolbox. Dort wird auch die Library `iro.js` für den ColorPicker verwendet.
    * `TopBarView.js`: Repräsentiert die TopBar des Dashboards. Hier wird auch die SketchHistory angezeigt und kann im Modul entsprechend angepasst werden.
    * `UserProfileDialogView.js`: Repräsentiert den Dialog der angezeigt wird, wenn man über ein Mitgleid hovert.
4. **utils**
    * `Config.js`: Enthält alle Konstanten für das Frontend
    * `Observable.js`: Enthält die Logik für Erstellung/Handhabung von Events und Observable.
    * `Helper.js`: Enthält oft verwendete Methoden, die in mehr als einem Modul gebraucht werden.
 ### Public Feed
 >TODO: Fill Text
 
 ### Landing Page
 >TODO: Fill Text
 
 ## Assets
 Im `/apps/assets`-Ordner sind alle verwendeten Icons, Templates und Bilder, gespeichert, die verwendet werden.
 ### Icons
 Die Icons wurden von Google's [Material Website](https://material.io/resources/icons/?style=baseline) verwendet.
 ### Templates
 Als Templates wurden folgende 4 Bilder vorgesehen:
 * Batman & Spiderman ([Quelle](http://getdrawings.com/get-coloring-pages#cartoon-spiderman-coloring-pages-3.jpg))
 * Super Mario ([Quelle](http://getdrawings.com/get-coloring-pages#mario-brothers-characters-coloring-pages-1.jpg))
 * Fisch ([Quelle](http://clipartmag.com/download-clipart-image#drawing-for-kids-fish-12.jpg))
 * IronMan & Deadpool ([Quelle](http://getdrawings.com/get-coloring-pages#deadpool-coloring-pages-printable-1.jpg))
 ### Fonts
 Als Schriftart-Lieferant wird [FontAwesome](https://fontawesome.com/) verwendet.