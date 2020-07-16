# Features für Sketching With Friends

| Feature | Beschreibung | Priorität | Geschätzter Aufwand | Betroffene Schichten |
|---------|--------------|-----------|--------------------|---------------------|
| **Benutzerregistrierung/ -verwaltung** | Benutzer sollen sich registrieren und anmelden können. Nur wenn ein Nutzer angemeldet ist, kann dieser auf seine Räume zugreifen. Der Public Feed soll öffentlich sein auch ohne Anmeldung. Up- und Downvotes sind nur mit Login möglich | hoch | 3 Tage | UI, Database, Authentication |
| **Public Feed** | Fertige Sketches können in diesem Feed gepostet werden und öffentlich eingesehen werde. Diese Sketches können dann bewertet werden per Up- und Downvote | mittel | 3 Tage | UI, Database, Authentication |
| **Channels/Räume** | Es gibt feste *Zeichenräume* die von Nutzern erstellt werden können. Über Invitelinks/-codes können andere Nutzer diesem Raum joinen. Die einzelnen Features im Raum werden in den Features unten beschrieben. | hoch | 5 Tage | UI, Database |
| **Import/Export Funktion** | In einem *Zeichenraum* können Bilder/Sketches importiert und in gängige Formate exportiert werden. Außerdem können gespeicherte Bilder auch im Public Feed geteilt werden| mittel | 2 Tage | UI, Database |
| **Rollen** | Der *Admin* eines Raumes kann Nutzer in Rollen einteilen, die verschiedene Rechte haben (Zeichnen-Recht, Export/Import Recht, Speicherrecht, Post-REcht)| mittel | 3 Tage | UI, Database, Authentication |
| **Zeichenfläche** | Fläche auf der gezeichnet werden kann. Dort werden auch die verschieden Layer zusammengefügt und eventuell mit alpha-Werten versehen| hoch | 4 Tage | UI, Database |
| **Zeichentools** | Größe, Farbe, Deckkraft, Pattern, Ausschneiden, Radierer, Stiftart. Eine Toolbox in der alle Tools aufgelistet sind und ausgewählt werden können. | hoch | 9 Tage | UI, Database |
| **Stiftzuteilung** | Jedem Stift eines Nutzers wird realtime ein Tag (evtl. Farbe) zugeordnet, um den Stift identifizieren zu können | nice to have | x Tage | UI, Database, Authentication |
| **Ebenensystem** | Nutzer bekommen jeweils eine eigene Ebene. (Und können auch andere erstellen) -> siehe *Zeichenfläche* | mittel | 6 Tage | UI, Database |
| **Vorlagen** | Vorlagen zum Ausmalen oder weiterzeichnen, die schon von uns gehostet werden | nice to have | 1 Tage | UI, Database |
| **Score-/Levelsystem** | Evtl. Punktesystem / Bewertungen einer Zeichnung / Levelsystem wenn Benutzer bestimmte Anzahl Sketches erstellt oder Upvotes hat, dann evtl. Perks | nice to have | 4 Tage | Database |
| **Montagsmaler** | Zeichen- und Ratesystem mit vorgegebenen / eigens importierten Begriffen | nice to have | 5 Tage | UI, Database |

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

### Reihenfolge der Implementierung Zusatzfeatures

1. Stiftzuteilung
2. Vorlagen
3. Score- /Levelsystem im Public Feed implementieren
