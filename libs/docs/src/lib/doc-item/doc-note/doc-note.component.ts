import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
    standalone: true,
	selector: 'fhem-native-doc-item-note',
    template: `
        <div class="note-block">
            <div class="note-header color-a">
                <ion-icon class="size-d" name="information-circle-outline"></ion-icon>
                <p class="no-margin size-f bold">Note</p>
            </div>
            <div class="note-content">
                <p class="no-margin color-a size-f">
                    <ng-container *ngFor="let noteLine of noteContent">
                        <ng-container *ngFor="let noteLineDict of noteLine | keyvalue">
                            <ng-container [ngSwitch]="noteLineDict.key">
                                <!-- text -->
                                <span *ngSwitchCase="'text'">{{noteLineDict.value}} </span>

                                 <!-- text bold -->
                                 <span *ngSwitchCase="'text-bold'" class="bold">{{noteLineDict.value}} </span>
                            
                                <!-- line break -->
                                <span *ngSwitchCase="'line-break'"> <br> </span>

                                <p *ngSwitchDefault class="color-a">No Doc Item for: {{noteLineDict.key}}</p>
                            </ng-container>
                        </ng-container>
                    </ng-container>
                </p>
            </div>
        </div>
    `,
	styleUrls: ['./doc-note.component.scss'],
    imports: [ IonicModule, CommonModule ]
})
export class DocItemNoteComponent implements OnInit{
    @Input() noteContent!: Array<Record<string, string>>;

    ngOnInit(){
        console.log(this.noteContent)
    }
}