# FhemNative
<img src="/images/icon.jpg" width="300" height="380" />

FhemNative ist eine open-source App für Smartphones und Tablets um FHEM (Hausautomations-Server) zu steuern ohne eigene Programmierung.

FehmNative basiert auf [Angular](https://angular.io/) Komponenten innerhalb des [Ionic Framework](https://ionicframework.com/).

> [Englisches README](https://github.com/Syrex-o/FHEMNative/blob/master/README.md)

> [Developer Guide](https://github.com/Syrex-o/FHEMNative/blob/master/DEVELOPER_GUIDE.md)

> [FhemNative unterstützen](https://www.paypal.com/pools/c/8gwg2amXDT)

## App Funktionen
* FhemNative ist eine "Raum-basierte" Umgebung
* Räume können erstellt manuell/automatisch, editiert, neu angeordnet oder gelöscht werden
* Räume können mit verschiedenen [Komponenten][100] befüllt werden
* Globale Einstellungen verändern den Style und das Verhalten der App
* Erstellte Räume werden lokal auf dem Gerät gespeichert
* Alle erstellten Räume inklusive ihrer Komponenten können exportier/importiert werden
* Es kann zwischen mehreren Möglichkeiten gewählt werden, um sich mit FHEM zu verbinden

<img src="/images/room_menu.jpg" width="300" height="580" />    <img src="/images/settings.jpg" width="300" height="580" />

[100]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#Komponenten
## Komponenten

#### Fhem Components
* kommunizieren direkt mit FHEM
* reagieren auf Zustände von FHEM Geräten
* können Zustände in FHEM verändern

#### Style Components
* werden verwendet um Räume besser zu strukturieren
* einige können auf Werte aus FHEM reagieren
* können keine Werte in FHEM verändern


| Komponente          | Kurzbeschreibung                                                  | Docs         | Type |
|------------------|--------------------------------------------------------|--------------|--|
| Box     | Eine einfache Box, um Räume besser zu strukturieren.       |   [Docs][5] | Style |
| Button            | Ein Button um Zwischen 2 Zuständen in FHEM zu schalten oder einen Befehl an FHEM zu senden. |   [Docs][10] | Fhem |
| Button Multistate           | Ein Button um Zwischen mehreren Zuständen in FHEM zu schalten oder verschiedene Befehle an FHEM zu senden. |   [Docs][15] | Fhem |
| Chart     | Ein Chart mit maximal 2 Inputs, um log Files grafisch darzustellen. |   [Docs][20] | Fhem |
| Circle Menu           | Ein Menü, um mehrere Befehle in einer Komponente zu vereinen. |   [Docs][25]  | Fhem |
| Circle Slider           | Ein Kreis-SLider mit min. und max. Werten. |   [Docs][30]  | Fhem |
| Color Picker           | Ein Farbmenü mit Favoritenliste und Helligkeitsslider. |   [Docs][35]  | Fhem |
| IFrame           | Ein IFrame, um andere Webinhalte zu inkludieren. |   [Docs][40]  | Fhem |
| Icon  | Ein Icon, um verschiedene Zustände aus FHEM darzustellen. |[Docs][45]  | Style |
| Image           | Ein Bild von einer Url oder vom eigenen Gerät. |   [Docs][50]  | Style |
| Kodi Remote           |Work in Progress|   [Docs][55]  | Fhem |
| Label           |Ein Lable um Text anzuzeigen. |   [Docs][60]  | Style |
| Line           |Eine Linie, die horizontal oder vertikal gezogen werden kann, um Komponenten voneinander abzutrennen.|   [Docs][65]  | Style |
| Media List           |Eine Komponente zum lesen von Medialist aus FHEM|   [Docs][66]  | Style |
| Picker| Ein Picker, um weitere Komponenten zu verpacken.|[Docs][67]  | Fhem |
| Pinpad           | Ein Pinpad um ein Alarm-System zu steuern.|   [Docs][70]  | Fhem |
| Popup| Ein Popup, um weitere Komponenten zu verpacken.|[Docs][75]  | Fhem |
| Select           |Ein Auswahlmenü aus FHEM Werten/eigenen Werten.|   [Docs][80]  | Fhem |
| Slider           |Ein horizontaler or vertikaler slider.|   [Docs][85]  | Fhem |
| Sprinkler           |Sprinkler module (description follows in other repo)|   [Docs][90]  | Fhem |
| Swiper           | Ein Swiper, der mit Komponenten gefüllt werden kann|   [Docs][91]  | Style |
| Switch           | Ein Switch zum schalten von 2 FHEM Zuständen|   [Docs][92]  | Fhem |
| Table           | Eine Tabelle, um Werte aus FHEM anzuzeigen|   [Docs][93]  | Fhem |
| Table           | Eine Tab-Komponente, die mit Komponenten gefüllt werden kann|   [Docs][93]  | Fhem |
| Thermostat           |Ein Termostat mit Animationen|   [Docs][94]  | Fhem |
| Time Picker           |Ein Zeitmenü im Format: 00:00.|   [Docs][95]  | Fhem |
| Wetter           |Ein Wetter-Chart, dass aus FHEM Modulen gezeichnet wird|   [Docs][95]  | Fhem |

## Installation
#### Externe Websocket installation
1. sudo cpan App::cpanminus
2. sudo cpanm Protocol::WebSocket
3. sudo cpanm JSON
4. copy content from websocket folder to opt/fhem/FHEM
5. define wsPort websocket 8080 global
6. define wsPort_json websocket_json

#### FHEMWEB Websocket
1. set attr longpull to websocket in FHEM Device WEB (from App Version >= 0.9.5)

## App Benutzung
| Räume erstellen            | Räume bearbeiten                  |
|------------------------|-----------------------------|
|<img src="/images/create_room.gif" width="300" height="580" />| <img src="/images/change_room.gif" width="300" height="580" />|
| Räume anordnen          | Kopieren/einfügen     |
|<img src="/images/reorder_rooms.gif" width="300" height="580" />| <img src="/images/copy_paste.gif" width="300" height="400" />|

# Komponenten Details

[5]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#box
## Box
<img src="https://drive.google.com/uc?export=view&id=1VDSQXe8nbIhoYdInSYSUi7FqZVVHoScF" width="300" height="300" />

> Eine Box um weitere Komponenten auf der Oberfläche zu Ordnen.

| Einstellung          | Beschreibung                                                  | Default-Wert         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|headline| Anzeigelabel des Headers der Box| '' | data |
|borderRadius| Rundung von Ecken der Box | 5 | data |
|showHeader| Aktivieren/Deaktivieren des Box-Headers | true | data |
|showShadow| Aktivieren/Deaktivieren des Box-Shattens | true | data |
|headerColor| Auswahl der Hintergrundfarbe des Headers |![#434E5D](https://placehold.it/15/434E5D/000000?text=+) `#434E5D`| style |
|backgroundColor| Auswahl der Hintergrundfarbe der Box |![#58677C](https://placehold.it/15/58677C/000000?text=+) `#58677C`| style |

[2]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#button
## Button
<img src="/images/button1.jpg" width="200" height="100" />
<img src="/images/button2.jpg" width="100" height="100" />

> Eine Button um zwischen 2 Zuständen in FHEM zu wechseln.

| Einstellung          | Beschreibung                                                  | Default-Wert         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name des FHEM Geräts, dass gestuert werden soll | '' | data |
|reading| Name des Readings, dass gelesen werden soll | state | data |
|setReading| Name des set Befehls, der ausgelöst werden soll (falls notwendig) | '' | data |
|getOn| ON Wert, der ausgelesen werden soll | on | data |
|getOff| OFF Wert, der ausgelesen werden soll | off | data |
|setOn| ON Wert, der gesendet werden soll | on | data |
|setOff| OFF Wert, der gesendet werden soll | off | data |
|label| Button Label (siehe Bsp. 1) | '' | data |
|sendCommand| Einzelner Befehl der beim Klicken an FHEM gesendet werden soll | '' | data |
|borderRadius| Rundung von Ecken der Box | 5 | data |
|iconSize| Größe des Icons im Button | 20 | data |
|iconOnly| Label aktivieren/deaktivieren úm den Button mit dem Icon zu füllen | false | data |
|iconOn| Anzuzeigendes Icon bei ON State | add-circle | icon |
|iconOff| Anzuzeigendes Icon bei OFF State | add-circle | icon |
|IconColorOn| Farbe des Icons bei ON State |![#86d993](https://placehold.it/15/86d993/000000?text=+) `#86d993`| style |
|IconColorOff| Farbe des Icons bei OFF State |![#86d993](https://placehold.it/15/86d993/000000?text=+) `#86d993`| style |
|buttonColor| Hintergrundfarbe des Buttons |![#86d993](https://placehold.it/15/86d993/000000?text=+) `#86d993`| style |
|labelColor| Schriftfarbe des Labels |![#fff](https://placehold.it/15/fff/000000?text=+) `#fff`| style |

[3]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#chart
## Chart

> Chart Komponente, um Werte aus einem Log in verschiedenen Formen grafisch darzustellen.

> Bar, Line und Area Charts können in einem Chart kombiniert werden. 

> Gauge und LiquidGauge Charts sind einzelne Darstellungen, die keine Achsen zeichnen.

| Einstellung          | Beschreibung                                                  | Default-Wert         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name des FHEM Log Devices | '' | data |
|logFile| Name eines spezifischen Log-Files des Geräts (falls notwendig) | '' | data |
|reading| Name des Log Readings | '' | data |
|reading2| Name des 2. Log Readings (falls benötigt) | '' | data |
|maxY| maximaler Y-Axen Wert, um die Achse zu fixieren (default: Maximal gelesener Wert bestimmt die Höhe der Y-Achse) | '' | data |
|labelExtension| Endung des Y-Achsen Werts, der mit angezeigt werden soll (Bsp. %) | '' | data |
|getCurrent| Aktuelles Log beziehen (Anderenfalls muss ein logFile angegeben werden) | true | data |
|zoomBothAxis| Zoomen des Charts in beide Achen aktivieren/deaktivieren | false | data |
|chartType| Art des Charts für den ersten Reading-Wert | bar | select(bar, line, area, gauge, liquidGauge) |
|chartType2| Art des Charts für den zweiten Reading-Wert | bar | select(bar, line, area) |
|timeFormat| Zeitformat der X-Achse | %Y-%m-%d |select(%Y-%m-%d, %d-%b-%y, %Y-%m) |
|colorSet| Farbschema der Charts | 1 | select(1, 2, 3) |

[4]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#circle-menu
## Circle-Menu
<img src="/images/circle-menu1.jpg" width="50" height="150" />
<img src="/images/circle-menu2.jpg" width="150" height="50" />
<img src="/images/circle-menu3.jpg" width="120" height="120" />

> Ein Multi-Menü, um mehrere Werte Selektieren zu können, die an FHEM gesendet werden sollen (Maximal 6 Werte möglich).

| Einstellung          | Beschreibung                                                  | Default-Wert         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name des FHEM Geräts, dass gestuert werden soll | '' | data |
|reading| Name des Readings, dass gelesen werden soll | state | data |
|setReading| Name des set Befehls, der ausgelöst werden soll (falls notwendig) | '' | data |
|value1| 1. Wert des Auswahlmenüs | '' | data |
|value2| 2. Wert des Auswahlmenüs (optional) | '' | data |
|value3| 3. Wert des Auswahlmenüs (optional) | '' | data |
|value4| 4. Wert des Auswahlmenüs (optional) | '' | data |
|value5| 5. Wert des Auswahlmenüs (optional) | '' | data |
|value6| 6. Wert des Auswahlmenüs (optional) | '' | data |
|expandStyle| Die Richtung, in die das Menü ausgeklappt werden soll | top | select(top, left, bottom, right, circle) |
|icon| Anzuzeigendes Icon des Menüs | add-circle | icon |

[5]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#circle-slider
## Circle-Slider

> Ein Kreisförmiger Slider, um numerische Werte an FHEM zu senden.

| Einstellung          | Beschreibung                                                  | Default-Wert         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name des FHEM Geräts, dass gestuert werden soll | '' | data |
|reading| Name des Readings, dass gelesen werden soll | state | data |
|setReading| Name des set Befehls, der ausgelöst werden soll (falls notwendig) | '' | data |
|threshold| Event-Reduktion. Senden jedes ...ten Befehls wird nur ausgeführt (in Kombination mit updateOnMove) | 20 | data |
|textSize| Größe des TextLabels in der Mitte des Sliders | 40 | data |
|label| Anzeigelabel in der Mitte des Sliders | Name des Fhem Devices | data |
|labelExtension| Endung des Labels, das mit angezeigt werden soll (Bsp. %) | '' | data |
|bottomAngle| Winkel der Kreisöffnung an der unteren Seite des Sliders | 90 | data |
|arcThickness| Breite des Kreisbogens vom Slider | 18 | data |
|thumbRadius| Radius des Knopfes auf dem Slider | 16 | data |
|thumbBorder| Breite com Rand des Knopfes auf dem Slider | 3 | data |
|step| Schritte in denen sich der Thumb auf dem Slider bewegen soll | 0.1 | data |
|min| Minimal-Wert des Sliders | 0 | data |
|max| Maximal-Wert des Sliders | 100 | data |
|updateOnMove| Werte kontinuierlich bei Aktion an FHEM senden/nur am Ende der Aktion senden | false | data |
|backgroundColor| Hintergrundfarbe des Inneren Kreises |![#272727](https://placehold.it/15/272727/000000?text=+) `#272727`| style |
|thumbColor| Hintergrundfarbe des Thumbs auf dem Slider |![#fbfbfb](https://placehold.it/15/fbfbfb/000000?text=+) `#fbfbfb`| style |
|fillColors| Hintergrundfarbe des Kreis Bogens (bei mehrfacher Auswahl wird ein Gradient gezeichnet) |![#2ec6ff](https://placehold.it/15/2ec6ff/000000?text=+) `#2ec6ff`, ![#272727](https://placehold.it/15/272727/000000?text=+) `#272727`| arr style |

[6]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#color-picker
## Color-Picker
<img src="/images/color-picker.jpg" width="200" height="400" />

> Ein Farbauswahl-Menü, dass sich als Popup öffnet.

> Favorisierte Farben können gespeichert/abgerufen und gesendet werden.

| Einstellung          | Beschreibung                                                  | Default-Wert         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name des FHEM Geräts, dass gestuert werden soll | '' | data |
|reading| Name des Readings, dass gelesen werden soll | '' | data |
|setReading| Name des set Befehls, der ausgelöst werden soll (falls notwendig) | '' | data |
|sliderReading| Name des Slider Readings im selben device (falls notwendig) | '' | data |
|setSliderReading| name des Set Befehls vom sliderReading (falls notwendig) | '' | data |
|headline| Headline des Popups | Name des Fhem Devices | data |
|threshold| Event-Reduktion. Senden jedes ...ten Befehls wird nur ausgeführt (in Kombination mit updateOnMove) | 10 | data |
|showSlider| Slider anzeigen/nicht anzeigen (sliderReading notwendig) | false | data |
|updateOnMove| Werte kontinuierlich bei Aktion an FHEM senden/nur am Ende der Aktion senden | false | data |
|colorInput| Definition des Farbwertes der ausgelesen werden soll | hex | select(hex, #hex, rgb) |
|colorOutput| Definition des Farbwertes der gesendet werden soll | hex | select(hex, #hex, rgb) |

[7]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#iframe
## IFrame

> Darstellung von anderen Webinhalten in der App.

> ! Cors beachten.

| Einstellung          | Beschreibung                                                  | Default-Wert         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name des FHEM Geräts, dass gestuert werden soll | '' | data |
|reading| Name des Readings, dass gelesen werden soll (URL) | state | data |
|url| Entfernte URL (anderenfalls wird versucht eine URL aus dem reading zu erhalten) | '' | data |

[8]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#icon
## Icon

> Darstellung eines einfachen Icons.

> Darstellung eines Icons in Abhängigkeit von FHEM-Werten.

| Einstellung          | Beschreibung                                                  | Default-Wert         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name des FHEM Geräts, dass gestuert werden soll | '' | data |
|reading| Name des Readings, dass gelesen werden soll | state | data |
|getOn| ON Wert, der ausgelesen werden soll | on | data |
|getOff| OFF Wert, der ausgelesen werden soll | off | data |
|iconOn| Anzuzeigendes Icon bei ON State | add-circle | icon |
|iconOff| Anzuzeigendes Icon bei OFF State | add-circle | icon |
|IconColorOn| Farbe des Icons bei ON State |![#86d993](https://placehold.it/15/86d993/000000?text=+) `#86d993`| style |
|IconColorOff| Farbe des Icons bei OFF State |![#86d993](https://placehold.it/15/86d993/000000?text=+) `#86d993`| style |

[9]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#image
## Image

> Darstellung von Bildern.

> Quellen: Reading eines FHEM Geräts / ein Bild auf dem eigenen Gerät / Externe URL.

| Einstellung          | Beschreibung                                                  | Default-Wert         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name des FHEM Geräts, dass gestuert werden soll | '' | data |
|reading| Name des Readings, dass gelesen werden soll (URL) | state | data |
|url| Entfernte URL (anderenfalls wird versucht eine URL aus dem reading zu erhalten). Sollten beide Werte leer sein, so wird ein Button erzeugt, um Bilder vom eigenen Gerät selektieren zu können. | '' | data |

[10]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#kodi-remote
## Kodi-Remote

> Websocket Verbindung zu einem KODI Gerät.

> !Diabled right now.

[11]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#label
## Label

> Darstellung eines Labels, um Komponenten beschriften zu können und eine übersichtliche Struktur zu kreieren.

| Einstellung          | Beschreibung                                                  | Default-Wert         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name des FHEM Geräts, dass gestuert werden soll (falls benötigt) | '' | data |
|reading| Name des Readings, dass gelesen werden soll  | '' | data |
|label| Anzeigelabel | '' | data |
|size| Größe des anzuzeigenden Labels | 16 | data |
|fontWeight| Gewicht des Labels (css style) | 300 | data |
|color| Text-Farbe anzuzeigenden Labels | ![#86d993](https://placehold.it/15/86d993/000000?text=+) `#86d993` | style |

[12]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#line
## Line

> Darstellung einer Linie, um Komponenten visuell optisch trennen zu können.

| Einstellung          | Beschreibung                                                  | Default-Wert         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|height| Höhe/Breite der Linie, abhängig von der Ausrichtung | 2 | data |
|orientation| Ausrichtung der Linie | vertical | select(horizontal, vertical) |
|color| Farbe der Linie | ![#86d993](https://placehold.it/15/86d993/000000?text=+) `#86d993` | style |

[13]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#pinpad
## Pinpad

> Darstellung eines Pinpads, um einen Pin von FHEM zu lesen.

> Das Pinpad kann nach korrekter Eingabe einen Befehl ausführen

| Einstellung          | Beschreibung                                                  | Default-Wert         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name des FHEM Geräts, dass gestuert werden soll | '' | data |
|reading| Name des Readings, dass gelesen werden soll | state | data |
|setReading| Name des set Befehls, der ausgelöst werden soll (falls notwendig) | '' | data |
|pin| Name des Readings, dass den Pin enthält | pin | data |
|getOn| ON Wert, der ausgelesen werden soll | on | data |
|getOff| OFF Wert, der ausgelesen werden soll | off | data |
|setOn| ON Wert, der gesendet werden soll (Befehl beim Einschalten) | on | data |
|setOff| OFF Wert, der gesendet werden soll (Befehl beim Ausschalten) | off | data |
|labelOnText| Alarm Text im ON Status | Alarm ist aktiv | data |
|labelOffText| Alarm Text im ON Status | Alarm ist inaktiv | data |
|tries| Anzahl der Fehlversuche die möglich sind, bis das Pinpad die Eingabe verweigert | 5 | data |

[14]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#popup
## Popup
<img src="/images/popup.jpg" width="200" height="400" />

> Ein Popup, dass Komponenten enthalten kann.

> Das Popup kann auf Statusänderungen von FHEM Reagieren und/oder nur als Kontainer fungieren.

| Einstellung          | Beschreibung                                                  | Default-Wert         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name des FHEM Geräts, dass gestuert werden soll | '' | data |
|reading| Name des Readings, dass gelesen werden soll | state | data |
|getOn| ON Wert, der ausgelesen werden soll | on | data |
|getOff| OFF Wert, der ausgelesen werden soll | off | data |
|headline| Überschrift des Popups, die beim Öffnen angezeigt wird | Popup | data |
|openOnReading| Öffnen/Schließen des Popups bei Übereinstimmung von ON/OFF Werten | false | data |
|iconOn| Anzuzeigendes Icon bei ON State | add-circle | icon |
|iconOff| Anzuzeigendes Icon bei OFF State | add-circle | icon |
|IconColorOn| Farbe des Icons bei ON State |![#86d993](https://placehold.it/15/86d993/000000?text=+) `#86d993`| style |
|IconColorOff| Farbe des Icons bei OFF State |![#86d993](https://placehold.it/15/86d993/000000?text=+) `#86d993`| style |

[15]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#select
## Select
<img src="/images/select1.jpg" width="150" height="50" />
<img src="/images/select2.jpg" width="120" height="120" />

> Ein Auswahlmenü um Werte aus FHEM als Selektionsmenü darzustellen.

> Eigene Werte sowie Alias-Werte können ebenfalls definiert werden.

| Einstellung          | Beschreibung                                                  | Default-Wert         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name des FHEM Geräts, dass gestuert werden soll | '' | data |
|reading| Name des Readings, dass gelesen werden soll | state | data |
|setReading| Name des set Befehls, der ausgelöst werden soll (falls notwendig) | '' | data |
|currentState| Name des Readings, dass den aktuellen Status enthält (falls vorhanden) | '' | data |
|seperator| Trennzeichen der Liste, die übergeben wird | , | data |
|items| Manuelle Liste von Werten die angezeigt werden soll | '' | data |
|alias| Alias Liste von Werten die angezeigt werden soll | '' | data |
|placeholder| Platzhalter der angezeigt werden soll, falls kein aktueller Wert vorhanden ist | '' | data |

[16]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#slider
## Slider
<img src="/images/slider1.jpg" width="240" height="80" />
<img src="/images/slider2.jpg" width="80" height="240" />

> Ein Slider um numerische Werte zu übertragen.

> Der Slider kann ebenfalls verwendet werden um Zeiten einzustellen (minimal und maximal Werte notwendig - Zahlenformat: 00:00)

| Einstellung          | Beschreibung                                                  | Default-Wert         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name des FHEM Geräts, dass gestuert werden soll | '' | data |
|reading| Name des Readings, dass gelesen werden soll | state | data |
|setReading| Name des set Befehls, der ausgelöst werden soll (falls notwendig) | '' | data |
|threshold| Event-Reduktion. Senden jedes ...ten Befehls wird nur ausgeführt (in Kombination mit updateOnMove) | 20 | data |
|labelExtension| Endung des Labels, das mit angezeigt werden soll (Bsp. %) | '' | data |
|ticks| Anzahl von Ticks am SLider (in Kombination mit showTicks) | 10 | data |
|min| Minimal-Wert des Sliders (Zeitformat ebenfalls möglich) | 0 | data |
|max| Maximal-Wert des Sliders (Zeitformat ebenfalls möglich) | 100 | data |
|sliderHeight| Höhe/Breite des Sliders (je nach Ausrichtung) | 5 | data |
|thumbWidth| Größe des Thumbs auf dem Slider | 25 | data |
|steps| Schritte in denen sich der Thumb auf dem Slider bewegen soll | 5 | data |
|showPin| Einen Pin mit dem aktuellen Wert bei Aktionen anzeigen/nicht anzeigen | true | data |
|showTicks| Ticks am Slider anzeigen/nicht anzeigen | true | data |
|updateOnMove| Werte kontinuierlich bei Aktion an FHEM senden/nur am Ende der Aktion senden | false | data |
|style| Art des Sliders | slider | select(slider, box) |
|orientation| Ausrichtung der Linie | horizontal | select(horizontal, vertical) |
|thumbColor| Hintergrundfarbe des Thumbs auf dem Slider |![#ddd](https://placehold.it/15/ddd/000000?text=+) `#ddd`| style |
|fillColor| Füllfarbe des Sliders |![#14a9d5](https://placehold.it/15/14a9d5/000000?text=+) `#14a9d5` | arr style |
|tickColor| Farbe der Ticks |![#ddd](https://placehold.it/15/ddd/000000?text=+) `#ddd`| style |

[17]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#sprinkler
## Sprinkler

> Sprinkler Modul zur Steuerung von Bewässerungsanlagen

> Das Modul hat ein extra GitHub Repo: https://github.com/Syrex-o/lib_nrf24, sowie einen eigenen FHEM Eintrag: folgt noch

| Einstellung          | Beschreibung                                                  | Default-Wert         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Liste der FHEM Geräte, die zum Sprinkler Modul gehören | Sprinkler1, Sprinkler2, Sprinkler3, Sprinkler4, Sprinkler5, Sprinkler6 | data |
|weather| Name des Wetter Devices, dass die notwendigen Informationen enthält | WetterInfo | data |
|smartSprinkler| Name des Smart-Sprinkler Devices, dass die notwendigen Informationen enthält | SmartSprinkler | data |
|settingsStyle| Style der Einstellungen (list sollte nur notwendig sein, falls sich der slider nicht bewegen lässt - alte Geräte) | slider | select(slider, list) |

[18]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#switch
## Switch
<img src="/images/switch1.jpg" width="240" height="60" />
<img src="/images/switch2.jpg" width="240" height="60" />

> Schalten von zwei Zuständen in Form eines Switches

| Einstellung          | Beschreibung                                                  | Default-Wert         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name des FHEM Geräts, dass gestuert werden soll | '' | data |
|reading| Name des Readings, dass gelesen werden soll | state | data |
|setReading| Name des set Befehls, der ausgelöst werden soll (falls notwendig) | '' | data |
|getOn| ON Wert, der ausgelesen werden soll | on | data |
|getOff| OFF Wert, der ausgelesen werden soll | off | data |
|setOn| ON Wert, der gesendet werden soll | on | data |
|setOff| OFF Wert, der gesendet werden soll | off | data |
|label| Anzeigelabel des Switches | Fhem Device Name | data |
|showBorder| Abtrennungslinie anzeigen/nicht anzeigen | true | data |
|buttonStyle| Style des Switches in 2 verschiedenen Variationen (siehe Bsp.) | toggle | select(toggle, toggle-outline) |
|colorOn| Hintergrundfarbe des Switches im ON State |![#2994b3](https://placehold.it/15/2994b3/000000?text=+) `#2994b3`| style |
|colorOff| Hintergrundfarbe des Switches im OFF State |![#a2a4ab](https://placehold.it/15/a2a4ab/000000?text=+) `#a2a4ab`| style |
|thumbColorOn| Hintergrundfarbe des Thumbs im ON State |![#14a9d5](https://placehold.it/15/14a9d5/000000?text=+) `#14a9d5`| style |
|thumbColorOff| Hintergrundfarbe des Thumbs im OFF State |![#fff](https://placehold.it/15/fff/000000?text=+) `#fff`| style |

[19]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#thermostat
## Thermostat
<img src="/images/thermostat.jpg" width="100" height="200" />

> Darstellung eines Thermostats mit Animationen

| Einstellung          | Beschreibung                                                  | Default-Wert         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name des FHEM Geräts, dass gestuert werden soll | '' | data |
|reading| Name des Readings, dass gelesen werden soll | state | data |
|setReading| Name des set Befehls, der ausgelöst werden soll (falls notwendig) | '' | data |
|min| Minimal-Wert des Thermostats | 0 | data |
|max| Maximal-Wert des Thermostats | 100 | data |
|threshold| Event-Reduktion. Senden jedes ...ten Befehls wird nur ausgeführt (in Kombination mit updateOnMove) | 10 | data |
|updateOnMove| Werte kontinuierlich bei Aktion an FHEM senden/nur am Ende der Aktion senden | false | data |
|gradientColor1| Farbe des 1. Teilstücks vom Gradient |![#FF0909](https://placehold.it/15/FF0909/000000?text=+) `#FF0909`| style |
|gradientColor2| Farbe des 2. Teilstücks vom Gradient |![#F3481A](https://placehold.it/15/F3481A/000000?text=+) `#F3481A`| style |
|gradientColor3| Farbe des 3. Teilstücks vom Gradient |![#FABA2C](https://placehold.it/15/FABA2C/000000?text=+) `#FABA2C`| style |
|gradientColor4| Farbe des 4. Teilstücks vom Gradient |![#00BCF2](https://placehold.it/15/00BCF2/000000?text=+) `#00BCF2`| style |

[20]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#time-picker
## Time-Picker

> Komponente zum einstellen von Tageszeiten im Format: 00:00

| Einstellung          | Beschreibung                                                  | Default-Wert         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name des FHEM Geräts, dass gestuert werden soll | '' | data |
|reading| Name des Readings, dass gelesen werden soll | state | data |
|setReading| Name des set Befehls, der ausgelöst werden soll (falls notwendig) | '' | data |
|label| Anzeigelabel des Timepickers | Fhem Device Name | data |
|confirmBtn| Bestätigungs-Taste des Timepickers | Bestätigen | data |
|cancelmBtn| Cancel-Taste des Timepickers | Abbrechen | data |
|maxHours| Maximalwert der Stunden Anzeige | 24 | data |
|maxMinutes| Maximalwert der Minuten Anzeige | 60 | data |
|showBorder| Abtrennungslinie anzeigen/nicht anzeigen | true | data |
|format| Anzeige-Format des Timepickers (bei HH u. mm werden nur die jeweiligen Werte an FHEM übergeben) | HH:mmm | select(HH:mmm HH, mm) |
