import { AfterViewInit, Directive, ElementRef, HostListener, Input, Renderer2} from "@angular/core";
import { DomController } from "@ionic/angular";

@Directive({
	selector: "[fhemNativeScrollHeader]"
})
export class ScrollHeaderDirective implements AfterViewInit{
    @Input() header: ElementRef<HTMLElement>|undefined;
    @Input() offset = 200;

    private _header: ChildNode|null|undefined;

    constructor(private renderer: Renderer2, private domCtrl: DomController) {}

    ngAfterViewInit(): void {
        this._header = this.header?.nativeElement;
        this.domCtrl.write(()=> this.renderer.setStyle(this._header, 'transform', 'translateY(100px)') );
    }

    @HostListener('ionScroll', ['$event']) onContentScroll(event: any) {
        const threshold = this.offset + event.detail.scrollTop * -1;
        this.domCtrl.write(() => this.renderer.setStyle(this._header, 'transform', `translateY(${ (threshold >= 0 ? threshold : 0) }px)`) );
    }
}