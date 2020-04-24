import { Directive, Input, OnChanges, SimpleChanges, ElementRef, Renderer2 } from '@angular/core';

// Services
import { SettingsService } from '../services/settings.service';

@Directive({ selector: '[colorizer]' })
export class ColorizerDirective implements OnChanges {
	// color as input to receive changes
	@Input() theme: string;
	// Input what should be assigned
	// Array of 'background or color' and primary, secondary, text, des
	// Exp: ['background', 'primary']
	@Input() style: string[];
	// Assign same style to childs
	@Input() forChild: boolean = false;

	constructor(
		private settings: SettingsService,
		private ref: ElementRef,
		private renderer: Renderer2) {
		
	}

	// detect input change
	ngOnChanges(changes: SimpleChanges){
		if(changes.theme){
			const current: string = changes.theme.currentValue;
			if(current){
				this.attrChanger(current);
			}
		}
	}

	private attrChanger(theme: string){
		if(this.settings.app.customTheme || theme !== 'custom'){
			this.classHandler(theme, this.ref.nativeElement);
			// apply same classes to childs, to reduce directive calls
			if(this.forChild){
				if(this.ref.nativeElement.childNodes){
					this.ref.nativeElement.childNodes.forEach((elem: ChildNode)=>{
						this.classHandler(theme, elem);
					});
				}
			}
		}else{
			setTimeout(()=>{
				this.attrChanger(theme);
			}, 10);
		}
	}

	// Apply classes for ref elem
	private classHandler(currentTheme: string, elem){
		['bright', 'dark', 'dark-alternative', 'custom'].forEach((c: string, i: number)=>{
			this.renderer.removeClass(elem, c);
			[currentTheme, this.style[0], this.style[1]].forEach((style: string)=>{
				this.renderer.addClass(elem, style);
				// custom style colors
				if(currentTheme === 'custom'){
					// background 
					if(this.style[0] === 'background'){
						if(this.style[1] === 'primary'){
							elem.style.background = this.settings.app.customTheme.primary;
						}
						if(this.style[1] === 'secondary'){
							elem.style.background = this.settings.app.customTheme.secondary;
						}
					}
					// color
					if(this.style[0] === 'color'){
						if(this.style[1] === 'text'){
							elem.style.color = this.settings.app.customTheme.text;
						}
						if(this.style[1] === 'des'){
							elem.style.color = this.settings.app.customTheme.des;
						}
					}
				}
			});
		});
	}
}