# FhemNative
<img src="/images/icon.jpg" width="300" height="380" />

FhemNative is an open-source mobile App to communicate with FHEM (Home Automation Server) without any programming.

FhemNative is based on [Angular](https://angular.io/) Components inside the [Ionic Framework](https://ionicframework.com/).

> [German README](https://github.com/Syrex-o/FHEMNative/blob/master/README_DE.md)

> [Developer Guide](https://github.com/Syrex-o/FHEMNative/blob/master/DEVELOPER_GUIDE.md)

> [Buy me a Beer](https://www.paypal.com/pools/c/8gwg2amXDT)

## App Functions
* FhemNative is build as a "Room-Structured" environment
* Rooms can be created manually/automatic, changed, reordered or deleted
* Rooms can be filled with different [components][100]
* Global settings define the styling and behaviour of the App
* Created rooms will be stored locally on the device
* All created rooms including their components can be exported/imported to handle different devices
* You can choise from different types of connections to FHEM

<img src="/images/room_menu.jpg" width="300" height="580" />    <img src="/images/settings.jpg" width="300" height="580" />

[100]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#components
## Components

#### Fhem Components
* communicate directly with FHEM
* act on the behaviour of defined devices in FHEM
* can manipulate devices in FHEM

#### Style Components
* used to manage room components in a structured way
* some of them can display/response to FHEM values
* cannot manipulate devices in FHEM


| Feature          | Description                                                  | Docs         | Type |
|------------------|--------------------------------------------------------|--------------|--|
| Box     | A simple box with a header to structure components in rooms.       |   [Docs][1] | Style |
| Button            | A simple button to switch between two states in FHEM.       |   [Docs][2] | Fhem |
| Chart     | A chart to taxe max. 2 instances from a log and visualize them in different ways. |   [Docs][3] | Fhem |
| Circle Menu           | A butten-menu, to combine multiple commands in one interface. |   [Docs][4]  | Fhem |
| Circle Slider           | A circular slider with min and max values. |   [Docs][5]  | Fhem |
| Color Picker           | A color-menu with favourites and brightness slider. |   [Docs][6]  | Fhem |
| IFrame           | A frame to display other web content. |   [Docs][7]  | Fhem |
| Icon  | An icon to disply or to change on different FHEM states. |[Docs][8]  | Style |
| Image           | An image to select from an url or the own device. |   [Docs][9]  | Style |
| Kodi Remote           |Work in Progress|   [Docs][10]  | Fhem |
| Label           |A label to display text. |   [Docs][11]  | Style |
| Line           |A line to draw horizontal or vertical, to seperate content.|   [Docs][12]  | Style |
| Pinpad           | A pinpad to toggle an alarm system.|   [Docs][13]  | Fhem |
| Popup| A box to include other components and/or response to FHEM values.|[Docs][14]  | Fhem |
| Select           |A menu to select from FHEM values or an own list.|   [Docs][15]  | Fhem |
| Slider           |A horizontal or vertical range slider.|   [Docs][16]  | Fhem |
| Sprinkler           |Sprinkler module (description follows in other repo)|   [Docs][17]  | Fhem |
| Switch           | A switch to toggle two different states in FHEM.|   [Docs][18]  | Fhem |
| Thermostat           |A temperature display with coloured animations.|   [Docs][19]  | Fhem |
| Time Picker           |A time setter in format: 00:00.|   [Docs][20]  | Fhem |

## Installation
#### External Websocket installation
1. sudo cpan App::cpanminus
2. sudo cpanm Protocol::WebSocket
3. sudo cpanm JSON
4. copy content from websocket folder to opt/fhem/FHEM
5. define wsPort websocket 8080 global
6. define wsPort_json websocket_json

#### Included FHEMWEB Websocket
1. set attr longpull to websocket in FHEM Device WEB (from App Version >= 0.9.5)

## Usage Examples
| Create Room            | Edit Room                   |
|------------------------|-----------------------------|
|<img src="/images/create_room.gif" width="300" height="580" />| <img src="/images/change_room.gif" width="300" height="580" />|
| Reorder Rooms          | Copy/Paste Components     |
|<img src="/images/reorder_rooms.gif" width="300" height="580" />| <img src="/images/copy_paste.gif" width="300" height="400" />|

# Component details

[1]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#box
## Box
<img src="/images/box.jpg" width="300" height="300" />

> A simple Box, to structure components in rooms.

| Setting          | Description                                                  | Default-Value         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|headline| Label to show in the header of the box| '' | data |
|borderRadius| Round borders of the box | 5 | data |
|showHeader| Activate/Deactivate box headers | true | data |
|showShadow| Activate/Deactivate box shadow | true | data |
|headerColor| Background color of the box header |![#434E5D](https://placehold.it/15/434E5D/000000?text=+) `#434E5D`| style |
|backgroundColor| Background color of the box content |![#58677C](https://placehold.it/15/58677C/000000?text=+) `#58677C`| style |

[2]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#button
## Button
<img src="/images/button1.jpg" width="200" height="100" />
<img src="/images/button2.jpg" width="100" height="100" />

> A button to toggle 2 different states in FHEM.

> Can also be used to send a single command dirrectly to FHEM.

| Setting          | Description                                                  | Default-Value         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name of the FHEM device, that should be triggered | '' | data |
|reading| Name of the reading, that should be evaluated | state | data |
|setReading| Name of the set command, that should be used (if needed) | '' | data |
|getOn| ON value, that should be evaluated | on | data |
|getOff| OFF value, that should be evaluated | off | data |
|setOn| ON value, that should be sended | on | data |
|setOff| OFF value, that should be sended | off | data |
|label| Button label (see Exp. 1) | '' | data |
|sendCommand| A single command, that will be send to FHEM | '' | data |
|borderRadius| Round borders of the box | 5 | data |
|iconSize| Icon size of the button icon | 20 | data |
|iconOnly| Activate/Deactivate label, to fill the button with the selected icons | false | data |
|iconOn| Desired Icon for ON State | add-circle | icon |
|iconOff| Desired Icon for OFF State | add-circle | icon |
|IconColorOn| Color of the Icon in ON State |![#86d993](https://placehold.it/15/86d993/000000?text=+) `#86d993`| style |
|IconColorOff| Color of the Icon in OFF State |![#86d993](https://placehold.it/15/86d993/000000?text=+) `#86d993`| style |
|buttonColor| Background color of the button |![#86d993](https://placehold.it/15/86d993/000000?text=+) `#86d993`| style |
|labelColor| Color of the label in the button |![#fff](https://placehold.it/15/fff/000000?text=+) `#fff`| style |

[3]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#chart
## Chart

> Chart component, to read values from a log and display them in graphs.

> Bar, Line und Area Charts can be combined into one chart. 

> Gauge und LiquidGauge Charts are special visualisations, that don´t draw axis, and can´t be combined.

| Setting          | Description                                                  | Default-Value         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name of the FHEM Log device | '' | data |
|logFile| Name of a specific log file to choose (if needed) | '' | data |
|reading| Name of the log reading | '' | data |
|reading2| Name of the second log reading (if needed) | '' | data |
|maxY| max. Y-Axis value, to fix the axis (default: max value of the given data will be used) | '' | data |
|labelExtension| Ending for the Y-Axis label (Exp. %) | '' | data |
|getCurrent| Read the current Log file from the device (otherwise a log file has to be defined) | true | data |
|zoomBothAxis| Enable/Disable zooming in both axis of the chart | false | data |
|chartType| Style of the chart for the first reading | bar | select(bar, line, area, gauge, liquidGauge) |
|chartType2| Style of the chart for the second reading | bar | select(bar, line, area) |
|timeFormat| Time format of the X-Axis | %Y-%m-%d |select(%Y-%m-%d, %d-%b-%y, %Y-%m) |
|colorSet| Color sheme of the charts | 1 | select(1, 2, 3) |

[4]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#circle-menu
## Circle-Menu
<img src="/images/circle-menu1.jpg" width="50" height="150" />
<img src="/images/circle-menu2.jpg" width="150" height="50" />
<img src="/images/circle-menu3.jpg" width="120" height="120" />

> A multi menu, to choose from different commands, that can be send to FHEM (max 6 values possible).

| Setting          | Description                                                  | Default-Value         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name of the FHEM device, that should be triggered | '' | data |
|reading| Name of the reading, that should be evaluated | state | data |
|setReading| Name of the set command, that should be used (if needed) | '' | data |
|value1| 1. value ofg the multi menu | '' | data |
|value2| 2. value ofg the multi menu (optional) | '' | data |
|value3| 3. value ofg the multi menu (optional) | '' | data |
|value4| 4. value ofg the multi menu (optional) | '' | data |
|value5| 5. value ofg the multi menu (optional) | '' | data |
|value6| 6. value ofg the multi menu (optional) | '' | data |
|expandStyle| Direction where the menu should unfold | top | select(top, left, bottom, right, circle) |
|icon| Desired icon of the menu | add-circle | icon |

[5]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#circle-slider
## Circle-Slider

> Ein circular slider, to send nummeric values to FHEM.

| Setting          | Description                                                  | Default-Value         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name of the FHEM device, that should be triggered | '' | data |
|reading| Name of the reading, that should be evaluated | state | data |
|setReading| Name of the set command, that should be used (if needed) | '' | data |
|threshold| Event reduction. Only send every n command to FHEM (in combination with updateOnMove) | 20 | data |
|textSize| Size of the value label in the slider | 40 | data |
|label| Subline label in the slider | Name des Fhem Devices | data |
|labelExtension| Ending of the value label (Exp. %) | '' | data |
|bottomAngle| Angle of the circle opening on the bottom of the slider | 90 | data |
|arcThickness| Width of the slider arc | 18 | data |
|thumbRadius| Radius of the slider thumb | 16 | data |
|thumbBorder| Width of the border of the thumb | 3 | data |
|step| Steps for the slider to move and set values | 0.1 | data |
|min| Min. value of the slider | 0 | data |
|max| Max. value of the slider | 100 | data |
|updateOnMove| Activate/Deactivate sending of values continiously on move | false | data |
|backgroundColor| Background color of the inner circle |![#272727](https://placehold.it/15/272727/000000?text=+) `#272727`| style |
|thumbColor| Background color of the slider thumb |![#fbfbfb](https://placehold.it/15/fbfbfb/000000?text=+) `#fbfbfb`| style |
|fillColors| Background color of the slider arc (multi selection will draw a gradient) |![#2ec6ff](https://placehold.it/15/2ec6ff/000000?text=+) `#2ec6ff`, ![#272727](https://placehold.it/15/272727/000000?text=+) `#272727`| arr style |

[6]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#color-picker
## Color-Picker
<img src="/images/color-picker.jpg" width="200" height="400" />

> A color menu, that opens as a popup.

> Favourite colors can be saved and selected.

| Setting          | Description                                                  | Default-Value         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name of the FHEM device, that should be triggered | '' | data |
|reading| Name of the reading, that should be evaluated | state | data |
|setReading| Name of the set command, that should be used (if needed) | '' | data |
|sliderReading| Name of the slider reading in the same device (if needed) | '' | data |
|setSliderReading| name des Set Befehls vom sliderReading (if needed) | '' | data |
|headline| Headline of the popup | Name of the FHEM device | data |
|threshold| Event reduction. Only send every n command to FHEM (in combination with updateOnMove) | 10 | data |
|showSlider| Show/Hide slider (sliderReading needed) | false | data |
|updateOnMove| Activate/Deactivate sending of values continiously on move | false | data |
|colorInput| Definition of the color input | hex | select(hex, #hex, rgb) |
|colorOutput| Definition of the color output | hex | select(hex, #hex, rgb) |

[7]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#iframe
## IFrame

> Display other web content.

> ! Be aware of CORS.

| Setting          | Description                                                  | Default-Value         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name of the FHEM device, that should be triggered | '' | data |
|reading| Name of the reading, that should be evaluated (URL) | state | data |
|url| External URL (otherwise IFrame tries to find the URL in the reading) | '' | data |

[8]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#icon
## Icon

> Display of a simple icon.

> Display icons based on FHEM values.

| Setting          | Description                                                  | Default-Value         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name of the FHEM device, that should be triggered (if needed) | '' | data |
|reading| Name of the reading, that should be evaluated (if needed) | state | data |
|getOn| ON value, that should be evaluated | on | data |
|getOff| OFF value, that should be evaluated | off | data |
|iconOn| Icon for ON State | add-circle | icon |
|iconOff| Icon for OFF State | add-circle | icon |
|IconColorOn| Color of the icon for ON State |![#86d993](https://placehold.it/15/86d993/000000?text=+) `#86d993`| style |
|IconColorOff| Color of the icon for OFF State |![#86d993](https://placehold.it/15/86d993/000000?text=+) `#86d993`| style |

[9]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#image
## Image

> Display of images.

> Sources: Reading of a FHEM device / an image from the device storage / external URL.

| Setting          | Description                                                  | Default-Value         | Type |
|------------------|--------------------------------------------------------|--------------|--|
|device| Name of the FHEM device, that should be triggered | '' | data |
|reading| Name of the reading, that should be evaluated (URL) | state | data |
|url| External URL (otherwise IFrame tries to find the URL in the reading) (if no url and reading is selected, button for device image selection will be created) | '' | data |

[10]: https://github.com/Syrex-o/FHEMNative/blob/master/README.md#kodi-remote
## Kodi-Remote

> Websocket connection to a kodi device.

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
