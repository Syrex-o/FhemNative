import { Injectable } from "@angular/core";

@Injectable({providedIn: "root"})
export class CssVariableService {

    /**
     * get value from css variables
     * @param cssVariable Css Variable Name
     * @returns variable value
     */
    public getVariableValue(cssVariable: string): string{
        return getComputedStyle(document.documentElement).getPropertyValue(cssVariable);
    }

    /**
     * change value in css variables
     * @param cssVariable Css Variable Name
     * @param toValue new value for variable
     */
    public changeVariableValue(cssVariable: string, toValue: string): void{
        document.documentElement.style.setProperty(cssVariable, toValue);
    }
}