import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Ionic Plugins
import { IonicStorageModule } from '@ionic/storage';

// Other Plugins
import { ToastrModule } from 'ngx-toastr';
import { HotkeyModule } from 'angular2-hotkeys';
// Components
import { ComponentsModule } from './components/components.module';

// Services
import { FhemService } from './services/fhem.service';
import { SettingsService } from './services/settings.service';
import { StorageService } from './services/storage.service';
import { StructureService } from './services/structure.service';
import { TaskService } from './services/task.service';
import { ToastService } from './services/toast.service';
import { VersionService } from './services/version.service';
import { UndoRedoService } from './services/undo-redo.service';
import { BackButtonService } from './services/back-button.service';
import { HotKeyService } from './services/hotkey.service';
import { TimeService } from './services/time.service';
import { ElectronService } from './services/electron.service';
import { FileManagerService } from './services/file-manager.service';
import { NativeFunctionsService } from './services/native-functions.service';

// Logger
import { LoggerModule } from './services/logger/logger.module';

// Plugins
import { File } from '@ionic-native/file/ngx';
import { Chooser } from '@ionic-native/chooser/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@NgModule({
  	declarations: [AppComponent],
  	imports: [
      	BrowserModule,
      	BrowserAnimationsModule,
      	ToastrModule.forRoot(),
      	IonicModule.forRoot(),
      	IonicStorageModule.forRoot(),
      	HotkeyModule.forRoot(),
      	AppRoutingModule,
      	ComponentsModule,
      	// FhemNative Logger
		LoggerModule
  	],
  	providers: [
    	StatusBar,
    	SplashScreen,
    	{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    	// FhemNative Services
    	FhemService,
    	SettingsService,
    	StorageService,
    	StructureService,
    	TaskService,
    	ToastService,
    	VersionService,
    	UndoRedoService,
    	BackButtonService,
    	HotKeyService,
    	TimeService,
      ElectronService,
      FileManagerService,
      NativeFunctionsService,
    	// Plugins
    	File,
      Chooser,
    	Vibration,
    	NativeAudio,
    	SocialSharing
  	],
  	bootstrap: [AppComponent]
})
export class AppModule {}
