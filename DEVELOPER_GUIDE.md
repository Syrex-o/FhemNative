# FhemNative Developer Guide

Developing own components for FhemNative is quite easy and there are only three rules:
* Please ensure that you provide styling for both [App Themes][1] (dark, bright)
* Please don´t include other libraries
* Enrich the FhemNative component landscape

## Getting Started

#### Installation
* [Install Ionic](https://ionicframework.com/docs/installation/cli)
* Clone the Files from the [Development Folder](https://github.com/Syrex-o/FHEMNative/tree/master/Development)
* ionic serve and go

## component structure
Every component has to inclide some basic functionality, so that FhemNative can deal with your component.
1. Imports
Simple components just need 2 Imports

| Import               | Description          |
|----------------------|----------------------|
|import { Component, Input } from '@angular/core'; |Angular Definition of Components|
|import { SettingsService } from '../../services/settings.service'; |The settings service for styling and component manipulation|


2. HTML Structure
Every Component is wrapped in a seperate box defined by the selector
```javascript
@Component({
	selector: 'fhem-your-component-name',
```
The template then defines the component structure, where some attributes are needed.
The Basic Structure:
```javascript
<div 
			[ngClass]="settings.appTheme" 
			class="your-component-name" 
			double-click 
			[editingEnabled]="settings.editMode" 
			(onDoubleClick)="settings.loadContextMenu($event)" 
			resize
			minimumWidth="60" 
			minimumHeight="60" 
			id="{{ID}}"
			[inPopup]="inPopup"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}">
</div>
```
Description:

| Attribute            | Description          |
|----------------------|----------------------|
|[ngClass]="settings.appTheme" |Defines the current Style of the App|
|class="your-component-name"|The name you choose for your component|
|double-click |Enables the double click functionality for edit mode|
|[editingEnabled]="settings.editMode" |Defines if user is currently in editing mode|
|(onDoubleClick)="settings.loadContextMenu($event)"  |Redirects to the options from the component|
|resize|enables the resize functionality in edit mode|
|minimumWidth="60" |minimal width of your component. cant be resized smaller|
|minimumHeight="60" |minimal height of your component. cant be resized smaller|
|id="{{ID}}"|the given ID from the component creator|
|[inPopup]="inPopup"|will be assigned automatically (relevant for component in popups)|
|[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}"|the given styling from user edits|


3. Inputs:

| Input Param          | Description          |
|----------------------|----------------------|
|@Input() ID:number;|Every component needs an ID, that FhemNative will create when a component is created|
|@Input() width:string;|Defining the Width of your component (will be assigned on creation)|
|@Input() height:string;|Defining the height of your component (will be assigned on creation)|
|@Input() top:string;|Defining the top offset of your component (will be assigned on creation)|
|@Input() left:string;|Defining the left offset of your component (will be assigned on creation)|
|@Input() zIndex:number;|Defining the z-index of your component (will be assigned on creation)|

#### Style Components

To build a style component, there is nothing more needed that two 
