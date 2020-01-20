import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Plugins
import { ToastrModule } from 'ngx-toastr';
import { File } from '@ionic-native/file/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Chooser } from '@ionic-native/chooser/ngx';

// Directives
import { DirectivesModule } from './directives/directives.module';
import { DragDropModule } from '@angular/cdk/drag-drop';

// Components
import { ComponentsModule } from './components/components.module';

// Ionic and Electron Storage
import { IonicStorageModule } from '@ionic/storage';

// Services
import { FhemService } from './services/fhem.service';
import { StructureService } from './services/structure.service';
import { StorageService } from './services/storage.service';
import { SettingsService } from './services/settings.service';
import { ToastService } from './services/toast.service';
import { BackButtonService } from './services/backButton.service';
import { TimeService } from './services/time.service';
import { UndoRedoService } from './services/undo-redo.service';
import { TasksService } from './services/tasks.service';
import { NativeFunctionsService } from './services/native-functions.service';
// Logger
import { LoggerModule } from './services/logger/logger.module';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		ComponentsModule,
		BrowserAnimationsModule,
		ToastrModule.forRoot(),
		IonicModule.forRoot(),
		IonicStorageModule.forRoot(),
		AppRoutingModule,
		// Directives
		DirectivesModule,
		DragDropModule,
		// Logger
		LoggerModule
	],
	providers: [
		StatusBar,
		SplashScreen,
		FhemService,
		StructureService,
		StorageService,
		SettingsService,
		ToastService,
		BackButtonService,
		TimeService,
		UndoRedoService,
		File,
		Vibration,
		NativeAudio,
		ImagePicker,
		WebView,
		SocialSharing,
		Chooser,
		TasksService,
		NativeFunctionsService,
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
	],
	bootstrap: [AppComponent]
})
export class AppModule {}
