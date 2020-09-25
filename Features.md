# Features für Sketching With Friends

| Feature | Beschreibung | Priorität | Geschätzter Aufwand | Betroffene Schichten |
|---------|--------------|-----------|--------------------|---------------------|
| **Benutzerregistrierung/ -verwaltung** | Benutzer sollen sich registrieren und anmelden können. Nur wenn ein Nutzer angemeldet ist, kann dieser auf seine Räume zugreifen. Der Public Feed soll öffentlich sein auch ohne Anmeldung. Up- und Downvotes sind nur mit Login möglich. Angemeldete Nutzer können über die Benutzerverwaltung grundlegende Benutzerdaten einsehen. | hoch | 4 Tage | UI, Database, Authentication |
| **Public Feed** | Fertige Sketches können in diesem Feed gepostet werden und öffentlich eingesehen werde. Diese Sketches können dann bewertet werden per Up- und Downvote | mittel | 3 Tage | UI, Database, Authentication |
| **Dashboard** | Startseite der Anwendung. Beinhaltet die Zeichenräume, deren aktuelle Zeichenfläche und die Toolbox. Von dem Dashboard aus kann auf die Benutzerwerwaltung und das Public Feed zugegriffen werden. | mittel | 4 Tage | UI, Database |
| **Channels/Räume** | Es gibt feste *Zeichenräume* die von Nutzern erstellt werden können. Über Invitelinks/-codes können andere Nutzer diesem Raum joinen. Die einzelnen Features im Raum werden in den Features unten beschrieben. | hoch | 5 Tage | UI, Database |
| **Import/Export Funktion** | In einem *Zeichenraum* können Bilder/Sketches importiert und in gängige Formate exportiert werden. Außerdem können gespeicherte Bilder auch im Public Feed geteilt werden. | mittel | 2 Tage | UI, Database |
| **Rollen** | Der *Admin* eines Raumes kann Nutzer in Rollen einteilen, die verschiedene Rechte haben (Zeichnen-Recht, Export/Import Recht, Speicherrecht, Post-Recht, View-Recht). Es gibt drei Rollen, mit farblicher Zuordnung: *Admin* (besitzt alle Rechte), *CoLlaborator* (kann zeichnen) und *Observer* (kann zuschauen).| mittel | 3 Tage | UI, Database, Authentication |
| **Zeichenfläche** | Fläche auf der gezeichnet werden kann. Dort werden auch die verschieden Layer zusammengefügt | hoch | 4 Tage | UI, Database |
| **Zeichentools** | Größe, Farbe, Deckkraft, Pattern, Rückgängig, Radierer, Stiftart. Eine Toolbox in der alle Tools aufgelistet sind und ausgewählt werden können. | hoch | 9 Tage | UI, Database |
| **Ebenensystem** | Standart nur eine Ebene für einen Sketch. Admin kann aber zusätzlich eine Ebene eröffnen, in denen dann alle Collaborater Zeichnen können. Der Admin besitzt dann sozusagen die Überebene | mittel | 6 Tage | UI, Database |
| **Vorlagen** | Vorlagen zum Ausmalen oder weiterzeichnen, die schon von uns gehostet werden | niedrig | 1 Tage | UI, Database |
| **Score-/Levelsystem** | Punktesystem / Bewertungen einer Zeichnung / Levelsystem wenn Benutzer bestimmte Anzahl Sketches erstellt oder Upvotes hat | nice to have | 4 Tage | Database |

## Umsetzung

### Reihenfolge der Implementierung Grundfeatures

1. Implementierung der Zeichenfläche mit Fokus auf dem kollaborativen Zeichnen mit WebSocket.
2. Erstellung der Toolbox (also der Zeichentools)
3. Ebenensystem implementieren
4. Import-/Export einbauen
5. Implementierung Channelsystem (evtl. erst Punkt 6)
6. Authentifizierung Implementieren. Also Registrierung und Login (evtl vor Punkt 5)
7. Rollenzuteilung implementieren
8. Public Feed mit Up-/Downvotes implementieren
9. Vorlagen
10. Score- /Levelsystem im Public Feed implementieren
