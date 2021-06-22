import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';

@Directive({ selector: '[ngIfOnce]' })
export class NgIfOnceDirective implements OnInit {
	@Input('ngIfOnce') condition!: boolean;

	constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) {}

	ngOnInit(){
		if (this.condition) {
			this.viewContainer.createEmbeddedView(this.templateRef);
		} else {
			this.viewContainer.clear();
		}
	}
}