import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { Clipboard } from '@angular/cdk/clipboard';

import { ToastService } from '@fhem-native/services';

@Component({
	standalone: true,
	selector: 'fhem-native-doc-item-code',
	template: `
        <div class="code-block">
            <table>
                <tbody>
                    <tr *ngFor="let codeLine of codeContent; let i = index; let odd = odd">
                        <td class="font-b line-num size-f color-b">{{ (i + 1) }}</td>
                        <td class="font-b line-code size-f color-a">
                            {{ codeLine }}
                            <ion-icon class="copy-icon" name="clipboard-outline" (click)="copyToClipboard(codeLine)"></ion-icon>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
	styleUrls: ['./doc-code.component.scss'],
	imports: [
		IonicModule,
		CommonModule
	]
})
export class DocItemCodeComponent{
    @Input() codeContent!: string[];

	constructor(private toast: ToastService, private clipboard: Clipboard){}

	copyToClipboard(text: string): void{
		this.clipboard.copy(text);
		this.toast.addToast('Code copied', 'Code line copied to clipboard!', 'info', 2000);
	}
}