import { Component, ChangeDetectionStrategy, forwardRef, ViewEncapsulation, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { SelectComponent } from '../select.component';
import { CssVariableService, ThemeService } from '@fhem-native/services';
import { ResizedEvent } from '@fhem-native/directives';

@Component({
	selector: 'fhem-native-select-gradient',
	templateUrl: './select-gradient.component.html',
	styleUrls: ['./select-gradient.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(()=> SelectGradientComponent),
		multi: true
	}],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class SelectGradientComponent extends SelectComponent implements AfterViewInit{
    @ViewChild('Gradient', {read: ElementRef}) canvas!: ElementRef;

    private innerValue: any;

    constructor(public override cssVariable: CssVariableService, public override theme: ThemeService){
        super(cssVariable, theme);
    }

    ngModelChangeCallback(e: any){
        this.innerValue = e;
        this.onChange(e);
        if(this.innerValue) this.drawGradient();
    }

    ngAfterViewInit(): void {
        setTimeout(()=> this.drawGradient(), 100 );
    }

    onResize(e: ResizedEvent){
        if(!e.isFirst) this.drawGradient();
    }

    private drawGradient(){
        const canvas = this.canvas.nativeElement;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.rect(0, 0, canvas.width, canvas.height);
        const grd = ctx.createLinearGradient(0, 0, canvas.width, 0);
            
        // create color stops
        if(this.innerValue && this.innerValue.length > 0){
            grd.addColorStop(0, this.innerValue[0]);
            const colorStops = Math.round( ((1 / this.innerValue.length) + Number.EPSILON) * 100 ) / 100;
            for(let i = 1; i <= this.innerValue.length -2; i++){
                grd.addColorStop( i * colorStops , this.innerValue[i]);
            }
            grd.addColorStop(1, this.innerValue[this.innerValue.length-1]);
        }

        ctx.fillStyle = grd;
        ctx.fill();
    }
}