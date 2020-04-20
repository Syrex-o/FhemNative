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
<img src="https://doc-04-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/qeediln1rdbk4159fcatjhn3b6bolmn9/1587388050000/11249763612494125977/11249763612494125977/1VDSQXe8nbIhoYdInSYSUi7FqZVVHoScF?e=view&authuser=0&nonce=s3vm1ua9n0age&user=11249763612494125977&hash=latjbkenkr6jglqsfqiqcuclhkk4hssp" width="400" height="300" />

> Eine Box um weitere Komponenten auf der Oberfläche zu Ordnen.

[10]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#button
## Button
<img src="https://doc-00-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/i4s14a05t87vvfg5pcpncipk618n04rt/1587388125000/11249763612494125977/11249763612494125977/1QEh9eHHEQRin9iFwPn9OrbZx43_X_Okc?e=view&authuser=0" width="300" height="100" />

> Eine Button um zwischen 2 Zuständen in FHEM zu wechseln.

[15]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#button
## Button Multistate
<img src="https://doc-00-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/i4s14a05t87vvfg5pcpncipk618n04rt/1587388125000/11249763612494125977/11249763612494125977/1QEh9eHHEQRin9iFwPn9OrbZx43_X_Okc?e=view&authuser=0" width="300" height="100" />

> Eine Button um zwischen mehreren Zuständen in FHEM zu wechseln.

[20]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#chart
## Chart
<img src="https://doc-0c-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/qei39njiavf2g13rc66ko5rd829tnakg/1587388500000/11249763612494125977/11249763612494125977/1kFQYkJusYhwZbbima1tkY1q9nCXC9Rd0?e=view&authuser=0&nonce=p74e5bmf225lk&user=11249763612494125977&hash=1qok8o7s94tbm9if6hk53bg5ig4tkqd6" width="500" height="300" />

> Chart Komponente, um Werte aus einem Log in verschiedenen Formen grafisch darzustellen.

> Bar, Line und Area Charts können in einem Chart kombiniert werden. 

> Gauge und LiquidGauge Charts sind einzelne Darstellungen, die keine Achsen zeichnen.

[25]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#circle-menu
## Circle-Menu
<img src="https://doc-0k-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/k02dpbg05mo2cj7gl70fbhehm3co0arf/1587388575000/11249763612494125977/11249763612494125977/1s-GlVER2I24WdXU4PQj5iESyqIBlqGAL?e=view&authuser=0" width="400" height="70" />

<img src="https://doc-10-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/aaoa809b9lr6n5ipfd2hqdbj6fuiohhk/1587388650000/11249763612494125977/11249763612494125977/15CGtQSx-R0qVAvfJYUw7lgSiQFGgbgrD?e=view&authuser=0" width="200" height="200" />

> Ein Multi-Menü, um mehrere Werte Selektieren zu können, die an FHEM gesendet werden sollen (Maximal 6 Werte möglich).

[30]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#circle-slider
## Circle-Slider
<img src="https://doc-14-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/r37ahdirnj63d0ehe0bhh4lt1dp38gns/1587388725000/11249763612494125977/11249763612494125977/12eVqenm5cs53_-R1BM7V8D6dujFiQZ_W?e=view&authuser=0" width="200" height="200" />

> Ein Kreisförmiger Slider, um numerische Werte an FHEM zu senden.

[35]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#color-picker
## Color-Picker
<img src="https://doc-04-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/mo8qla1vcp9cbt19ble9mmf99dia9cs7/1587388800000/11249763612494125977/11249763612494125977/14MKaNjuajBh3UqTtSqa-09CocXy7idMO?e=view&authuser=0&nonce=70bgv0tjp6dre&user=11249763612494125977&hash=vo8bocb74hrfs7bur3048emmkrclo67f" width="230" height="200" />

> Ein Farbauswahl-Menü, dass sich als Popup öffnet.

> Favorisierte Farben können gespeichert/abgerufen und gesendet werden.

[40]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#iframe
## IFrame
<img src="https://doc-0o-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/hcqhi43uomf47t392mlk18nrsc1en81h/1587388875000/11249763612494125977/11249763612494125977/11nQMggXIwGmu5eqIZYLUmlTYpIUdr9C3?e=view&authuser=0" width="420" height="200" />

> Darstellung von anderen Webinhalten in der App.

> ! Cors beachten.

[45]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#icon
## Icon
<img src="https://doc-08-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/1qnckbckpup0rrmbabfl7tp5st7dto6b/1587388875000/11249763612494125977/11249763612494125977/1P5Xxox_LHaJLpMsfO7VCQyqXOZ2c-pXM?e=view&authuser=0" width="200" height="100" />

> Darstellung eines einfachen Icons.

> Darstellung eines Icons in Abhängigkeit von FHEM-Werten.

[50]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#image
## Image
<img src="https://doc-04-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/sqn54v360kee35113f9kk9kjt5eif6i4/1587388950000/11249763612494125977/11249763612494125977/1lCuNZTTT4T0-o1W6dF7J4SbxDCiUW-wV?e=view&authuser=0" width="200" height="100" />

> Darstellung von Bildern.

> Quellen: Reading eines FHEM Geräts / ein Bild auf dem eigenen Gerät / Externe URL.


[55]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#kodi-remote
## Kodi-Remote

> Websocket Verbindung zu einem KODI Gerät.

> !Diabled right now.

[60]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#label
## Label
<img src="https://doc-08-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/o53ed6ullabsaj9rshsc4m28vu9kaq99/1587389025000/11249763612494125977/11249763612494125977/1sgREKAbgkUSMDcGkr2ZAcj7zWGI5TBL3?e=view&authuser=0" width="200" height="100" />

> Darstellung eines Labels, um Komponenten beschriften zu können und eine übersichtliche Struktur zu kreieren.

[65]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#line
## Line
<img src="https://doc-04-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/sg50e2111eeforqi17bsiie80s13t2nb/1587389025000/11249763612494125977/11249763612494125977/1wgcoVDk0HUoArAJvXAymzXRkLA_d-96H?e=view&authuser=0" width="300" height="150" />

> Darstellung einer Linie, um Komponenten visuell optisch trennen zu können.

[66]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#Media-List
## Media.List
<img src="https://doc-0k-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/kuj0p5v57d2fli9s9s6d83i0bv28nknp/1587389625000/11249763612494125977/11249763612494125977/1LPcXnEKr3731JkHoADDJgdS70JnJVJA4?e=view&authuser=0&nonce=mupi5bmf7hrdg&user=11249763612494125977&hash=gus6g1f7iuh9dombj8mqh4vb8e1u7es3" width="300" height="180" />

> Darstellung einer MediaList aus FHEM.

[67]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#Picker
## Picker
<img src="https://doc-0c-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/p0jugo7v55kimdho0rqocrf26a8pcvel/1587389775000/11249763612494125977/11249763612494125977/11dO2P4zhOSnsOQBPlLrg1TXL7Vac8qIL?e=view&authuser=0" width="350" height="300" />

> Ein Picker, der Komponenten enthalten kann.

> Ein Picker kann auf Statusänderungen von FHEM Reagieren und/oder nur als Kontainer fungieren.

[70]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#pinpad
## Pinpad
<img src="https://doc-00-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/39p2bmutag5o9a54mq3rm4ifal7d7bj8/1587389100000/11249763612494125977/11249763612494125977/199v_G19kEcbFcTsACpXLUogqQV2Vc-XF?e=view&authuser=0" width="300" height="450" />

> Darstellung eines Pinpads, um einen Pin von FHEM zu lesen.

> Das Pinpad kann nach korrekter Eingabe einen Befehl ausführen

[75]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#popup
## Popup
<img src="https://doc-0c-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/r2db0cllgaal963sjhkki1dfpq19o7d7/1587389175000/11249763612494125977/11249763612494125977/16diKaIXbPgFMdL9LQ8kEfguMgoV03uKy?e=view&authuser=0" width="350" height="400" />

> Ein Popup, dass Komponenten enthalten kann.

> Das Popup kann auf Statusänderungen von FHEM Reagieren und/oder nur als Kontainer fungieren.

[80]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#select
## Select
<img src="https://doc-0o-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/q9ffc9j82u0hocrujq1dril0abdbud7a/1587389175000/11249763612494125977/11249763612494125977/1CrJK4bqometiMF_VC3w1vfUjg2Mza3LJ?e=view&authuser=0" width="270" height="120" />

> Ein Auswahlmenü um Werte aus FHEM als Selektionsmenü darzustellen.

> Eigene Werte sowie Alias-Werte können ebenfalls definiert werden.

[85]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#slider
## Slider
<img src="https://doc-00-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/0kghbi2hge8jv3hlp10povr3o0qtjpr5/1587389250000/11249763612494125977/11249763612494125977/1CBap2SC9bMiYKke-PuUWQ2C946iXFQnP?e=view&authuser=0" width="500" height="300" />

> Ein Slider um numerische Werte zu übertragen.

> Der Slider kann ebenfalls verwendet werden um Zeiten einzustellen (minimal und maximal Werte notwendig - Zahlenformat: 00:00)

[90]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#sprinkler
## Sprinkler
<img src="https://doc-0c-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/5fvl2ism7le1nfb5qp8o9mks7to376s0/1587389325000/11249763612494125977/11249763612494125977/1wkt1zrQfhHMvl14wd4uzhqIU5qRatgKr?e=view&authuser=0&nonce=l6jotfdfersra&user=11249763612494125977&hash=m61r73ml1s5uq2pp9i0nckma9v9hlnsc" width="300" height="300" />

> Sprinkler Modul zur Steuerung von Bewässerungsanlagen

> Das Modul hat ein extra GitHub Repo: https://github.com/Syrex-o/lib_nrf24, sowie einen eigenen FHEM Eintrag: folgt noch

[91]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#Swiper
## Swiper
<img src="https://doc-04-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/uu86qto37hnc07iuqe0h76v21brfijpo/1587389925000/11249763612494125977/11249763612494125977/1iZJfYkQvs5lCzeEg9Xz_Vf_oyOeINRTH?e=view&authuser=0&nonce=bda4pm31sii5s&user=11249763612494125977&hash=93p1fqp9pmqndafa4ljhh8pqa52h7uh2" width="300" height="200" />

> Ein Swiper, der als Komponenten Container fungiert.

[92]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#switch
## Switch
<img src="https://doc-0o-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/eo7hrie0fhehqo83406bbbg01mp38ie5/1587389400000/11249763612494125977/11249763612494125977/13V9DkU468i6ws5EFYAEAmgRP0pGQGgi_?e=view&authuser=0" width="250" height="100" />

> Schalten von zwei Zuständen in Form eines Switches

[93]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#table
## Table
<img src="https://doc-0s-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/h1qe7jvrgbvsi4qpg45r0r4d5grc1uja/1587390000000/11249763612494125977/11249763612494125977/1nt4L74SIAiAfHRMxG8CrzECqa6nVu4k5?e=view&authuser=0" width="350" height="400" />

> Eine Tabelle, um Werte aus FHEM anzeigen zu können

[94]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#tabs
## Tabs
<img src="https://doc-0s-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/iho8ssuurcc554nv84tedt5t9afbd22r/1587390000000/11249763612494125977/11249763612494125977/1sitQKtEuB8GHnSWFJWlDnTTp9SCB5P0v?e=view&authuser=0" width="350" height="300" />

> Eine Tab Komponente, die als Komponenten Kontainer fungiert

[95]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#thermostat
## Thermostat
<img src="https://doc-00-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/h3d9uo44p7jjt22i04c2e354delh8opu/1587389400000/11249763612494125977/11249763612494125977/1JAoOz2EVkxlwkl9v5gmzeyTtq7saJUtt?e=view&authuser=0" width="270" height="200" />

> Darstellung eines Thermostats mit Animationen

[96]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#time-picker
## Time-Picker
<img src="https://doc-0c-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/vfihq8r3ar9psella4a9j9suk7lob2r3/1587389475000/11249763612494125977/11249763612494125977/1iFfAmkmnvjnpkx5rEZ4PJk3aOKS3WJbA?e=view&authuser=0" width="250" height="200" />

> Komponente zum einstellen von Tageszeiten im Format: 00:00

[97]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#Wetter
## Wetter
<img src="https://doc-0o-bo-docs.googleusercontent.com/docs/securesc/nm8arq9si0s87jo2mb0jj1ika0dsfims/06d8ul7g6vse4kag8s4493qmumig3c12/1587390150000/11249763612494125977/11249763612494125977/1-rrdOyHy_sluvvGQ66rpTvCmoVp08c_C?e=view&authuser=0" width="450" height="240" />

> Eine Wetter Komponente, die Wetterdaten aus FHEM Modulen grafisch darstellt
