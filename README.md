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
| Tabs           | Eine Tab-Komponente, die mit Komponenten gefüllt werden kann|   [Docs][94]  | Fhem |
| Thermostat           |Ein Termostat mit Animationen|   [Docs][95]  | Fhem |
| Time Picker           |Ein Zeitmenü im Format: 00:00.|   [Docs][96]  | Fhem |
| Wetter           |Ein Wetter-Chart, dass aus FHEM Modulen gezeichnet wird|   [Docs][97]  | Fhem |

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
<img src="/images/FhemNative_Box.png" width="400" height="300" />

> Eine Box um weitere Komponenten auf der Oberfläche zu Ordnen.

[10]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#button
## Button
<img src="/images/FhemNative_Button.png" width="300" height="100" />

> Eine Button um zwischen 2 Zuständen in FHEM zu wechseln.

[15]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#button
## Button Multistate
<img src="/images/FhemNative_ButtonMultistate.png" width="300" height="100" />

> Eine Button um zwischen mehreren Zuständen in FHEM zu wechseln.

[20]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#chart
## Chart
<img src="/images/FhemNative_Chart.png" width="500" height="300" />

> Chart Komponente, um Werte aus einem Log in verschiedenen Formen grafisch darzustellen.

> Bar, Line und Area Charts können in einem Chart kombiniert werden. 

> Gauge und LiquidGauge Charts sind einzelne Darstellungen, die keine Achsen zeichnen.

[25]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#circle-menu
## Circle-Menu
<img src="/images/FhemNative_CircleMenu_1.png" width="400" height="70" />

<img src="/images/FhemNative_CircleMenu_2.png" width="200" height="200" />

> Ein Multi-Menü, um mehrere Werte Selektieren zu können, die an FHEM gesendet werden sollen (Maximal 6 Werte möglich).

[30]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#circle-slider
## Circle-Slider
<img src="/images/FhemNative_CircleSlider.png" width="200" height="200" />

> Ein Kreisförmiger Slider, um numerische Werte an FHEM zu senden.

[35]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#color-picker
## Color-Picker
<img src="/images/FhemNative_ColorPicker.png" width="230" height="200" />

> Ein Farbauswahl-Menü, dass sich als Popup öffnet.

> Favorisierte Farben können gespeichert/abgerufen und gesendet werden.

[40]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#iframe
## IFrame
<img src="/images/FhemNative_Iframe.png" width="420" height="200" />

> Darstellung von anderen Webinhalten in der App.

> ! Cors beachten.

[45]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#icon
## Icon
<img src="/images/FhemNative_Icon.png" width="200" height="100" />

> Darstellung eines einfachen Icons.

> Darstellung eines Icons in Abhängigkeit von FHEM-Werten.

[50]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#image
## Image
<img src="/images/FhemNative_Image.png" width="200" height="100" />

> Darstellung von Bildern.

> Quellen: Reading eines FHEM Geräts / ein Bild auf dem eigenen Gerät / Externe URL.


[55]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#kodi-remote
## Kodi-Remote

> Websocket Verbindung zu einem KODI Gerät.

> !Diabled right now.

[60]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#label
## Label
<img src="/images/FhemNative_Label.png" width="200" height="100" />

> Darstellung eines Labels, um Komponenten beschriften zu können und eine übersichtliche Struktur zu kreieren.

[65]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#line
## Line
<img src="/images/FhemNative_Line.png" width="300" height="150" />

> Darstellung einer Linie, um Komponenten visuell optisch trennen zu können.

[66]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#Media-List
## Media.List
<img src="/images/FhemNative_Medialist.png" width="300" height="180" />

> Darstellung einer MediaList aus FHEM.

[67]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#Picker
## Picker
<img src="/images/FhemNative_Picker.png" width="350" height="300" />

> Ein Picker, der Komponenten enthalten kann.

> Ein Picker kann auf Statusänderungen von FHEM Reagieren und/oder nur als Kontainer fungieren.

[70]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#pinpad
## Pinpad
<img src="/images/FhemNative_Pinpad.png" width="300" height="450" />

> Darstellung eines Pinpads, um einen Pin von FHEM zu lesen.

> Das Pinpad kann nach korrekter Eingabe einen Befehl ausführen

[75]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#popup
## Popup
<img src="/images/FhemNative_Popup.png" width="350" height="400" />

> Ein Popup, dass Komponenten enthalten kann.

> Das Popup kann auf Statusänderungen von FHEM Reagieren und/oder nur als Kontainer fungieren.

[80]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#Select
## Select
<img src="/images/FhemNative_Select.png" width="270" height="120" />

> Ein Auswahlmenü um Werte aus FHEM als Selektionsmenü darzustellen.

> Eigene Werte sowie Alias-Werte können ebenfalls definiert werden.

[85]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#Slider
## Slider
<img src="/images/FhemNative_Slider.png" width="500" height="300" />

> Ein Slider um numerische Werte zu übertragen.

> Der Slider kann ebenfalls verwendet werden um Zeiten einzustellen (minimal und maximal Werte notwendig - Zahlenformat: 00:00)

[90]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#sprinkler
## Sprinkler
<img src="/images/FhemNative_Sprinkler.png" width="300" height="300" />

> Sprinkler Modul zur Steuerung von Bewässerungsanlagen

> Das Modul hat ein extra GitHub Repo: https://github.com/Syrex-o/lib_nrf24, sowie einen eigenen FHEM Eintrag: folgt noch

[91]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#Swiper
## Swiper
<img src="/images/FhemNative_Swiper.png" width="300" height="200" />

> Ein Swiper, der als Komponenten Container fungiert.

[92]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#switch
## Switch
<img src="/images/FhemNative_Switch.png" width="250" height="100" />

> Schalten von zwei Zuständen in Form eines Switches

[93]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#table
## Table
<img src="/images/FhemNative_Table.png" width="350" height="400" />

> Eine Tabelle, um Werte aus FHEM anzeigen zu können

[94]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#tabs
## Tabs
<img src="/images/FhemNative_Tabs.png" width="350" height="300" />

> Eine Tab Komponente, die als Komponenten Kontainer fungiert

[95]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#thermostat
## Thermostat
<img src="/images/FhemNative_Thermostat.png" width="270" height="200" />

> Darstellung eines Thermostats mit Animationen

[96]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#time-picker
## Time-Picker
<img src="/images/FhemNative_Timepicker.png" width="250" height="200" />

> Komponente zum einstellen von Tageszeiten im Format: 00:00

[97]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#Wetter
## Wetter
<img src="/images/FhemNative_Weather.png" width="450" height="240" />

> Eine Wetter Komponente, die Wetterdaten aus FHEM Modulen grafisch darstellt
