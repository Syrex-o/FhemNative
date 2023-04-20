import { Injectable } from '@angular/core';

import { ComponentColors } from '@fhem-native/app-config';
import { StorageService } from './storage.service';
import { isValidHex } from '@fhem-native/utils';

@Injectable({providedIn: 'root'})
export class ColorService {
	// app colors
	private customColors: string[] = [];
	public componentColors: string[] = ComponentColors;

    constructor(private storage: StorageService){
        this.loadColors();
    }

    // load user colors to base colors
    private async loadColors(): Promise<void>{
        this.customColors = await this.storage.setAndGetSetting({ name: 'customColors', default:  JSON.stringify([])});
        
        // combine colors to single array
        this.componentColors = this.componentColors.concat(this.customColors);
    }

    /**
     * Add new color to existing list
     * @param colorVal 
     * @returns 
     */
    public addColor(colorVal: string): void{
        if(!isValidHex(colorVal)) return;

        if(this.customColors.includes(colorVal)) return;
        if(this.componentColors.includes(colorVal)) return;

        this.customColors.push(colorVal);
        this.componentColors.push(colorVal);

        this.storage.changeSetting({name: 'customColors', change: JSON.stringify(this.customColors)});
    }
}