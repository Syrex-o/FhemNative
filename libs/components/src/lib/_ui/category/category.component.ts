import { Component } from '@angular/core';

@Component({
    standalone: true,
	selector: 'fhem-native-ui-category',
    template: `
        <div class="category-container pad-tb_0-25">
            <div class="category-header">
                <ng-content select="[name]"></ng-content>
            </div>
            <div class="category-content">
                <ng-content select="[content]"></ng-content>
            </div>
        </div>
    `,
    styleUrls: ['./category.component.scss']
})

export class UI_CategoryComponent {

}