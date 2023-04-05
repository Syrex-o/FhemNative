import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { ToastService } from '@fhem-native/services';
import { IonicModule } from '@ionic/angular';

@Component({
	standalone: true,
	selector: 'fhem-native-doc-item-code-raw',
	template: `
        <div class="code-block">
            <pre class="font-b color-a no-margin size-f">
                {{codeContent}}
            </pre>
            <div class="copy-container" (click)="copyToClipboard()">
                <ion-icon class="copy-icon color-a" name="clipboard-outline"></ion-icon>
            </div>
        </div>
    `,
	styleUrls: ['../doc-code/doc-code.component.scss', './doc-code-raw.component.scss'],
	imports: [
        IonicModule,
		CommonModule
	]
})
export class DocItemCodeRawComponent{
    @Input() codeContent!: string;

    constructor(private toast: ToastService, private clipboard: Clipboard){}

    copyToClipboard(): void{
		this.clipboard.copy(this.codeContent);
		this.toast.addToast('Code copied', 'Code block copied to clipboard!', 'info', 2000);
	}
}