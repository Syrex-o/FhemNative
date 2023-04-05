import { NgModule } from '@angular/core';

// Http Requests
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader, MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';

// json loader
export function createTranslateLoader(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/app/', '.json');
}
// missing loader --> translate: {default: some val}
export class DefaultMissingTransLationHandler  implements MissingTranslationHandler {
	handle(params: MissingTranslationHandlerParams) {
		if (params.interpolateParams) {
			return (params.interpolateParams as any)["default"] || params.key;
		}
		return params.key;
	}
}

@NgModule({
	imports: [
		HttpClientModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: (createTranslateLoader),
				deps: [HttpClient]
			},
			missingTranslationHandler: {
				provide: MissingTranslationHandler,
				useClass: DefaultMissingTransLationHandler
			}
		}),
	]
})
export class TranslatorModule {}