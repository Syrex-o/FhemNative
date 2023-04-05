import { AfterViewInit, Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { map, share, tap } from 'rxjs';

import { SwiperComponent, SwiperModule } from 'swiper/angular';
import SwiperCore, { Pagination, SwiperOptions } from 'swiper';

import { FhemComponentModule } from '../_fhem-component/fhem-component.module';
import { ComponentLoaderModule, EditButtonComponent } from '@fhem-native/components';

import { EditorService, StructureService } from '@fhem-native/services';
import { getFontStyleFromSelection, getFontWeightFromSelection, TextStyle } from '@fhem-native/utils';

import { ComponentPosition, FhemComponentSettings, FhemComponentContainerSettings, EditMode } from '@fhem-native/types/components';

SwiperCore.use([Pagination]);
@Component({
	standalone: true,
	selector: 'fhem-native-component-swiper',
	templateUrl: './fhem-swiper.component.html',
	styleUrls: ['./fhem-swiper.component.scss'],
	imports: [
        IonicModule,
        SwiperModule,
        EditButtonComponent,
		FhemComponentModule,
        ComponentLoaderModule
	],
    encapsulation: ViewEncapsulation.None
})
export class FhemSwiperComponent implements AfterViewInit{
    @ViewChild('Swiper', { static: false }) swiper?: SwiperComponent;

    swiperConfig: SwiperOptions = {
        spaceBetween: 0,
        pagination: {
            enabled: true
        },
        direction: 'horizontal'
    };

	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;
	
	// Data
	@Input() headline!: string;
	@Input() borderRadius!: number;
    @Input() containerPages!: number;

	// Selections
    @Input() headerStyle!: TextStyle;
	@Input() headerPosition!: string;
	@Input() orientation!: string;

	// Styling
	@Input() headerColor!: string;
	@Input() backgroundColor!: string;
    @Input() pagerOnColor!: string;
    @Input() pagerOffColor!: string;

	// Bool
    @Input() showPager!: boolean;
    @Input() showHeader!: boolean;

	// header style
	headerFontWeight = 400;
	headerFontStyle = 'normal';

    // component reference
	component: FhemComponentSettings|undefined;
    editFrom$ = this.editor.core.getMode().pipe( 
        tap((x)=> this.checkSwiper(x)), 
        map(x=> {
            if( !this.component || this.component.components === undefined ) return null;
            return x.edit ? x.editFrom : null;
        }),
        share()
    );

    constructor(private editor: EditorService, private structure: StructureService){}

	onInitComponent(): void{
        this.initSwiperStyles();
        this.headerFontStyle = getFontStyleFromSelection(this.headerStyle);
		this.headerFontWeight = getFontWeightFromSelection(this.headerStyle);

        // get component for container creation
		const component = this.structure.getComponent(this.UID);
		if(component && component.components) this.component = (component as FhemComponentSettings);
	}

    ngAfterViewInit(): void {
        this.applyPagerStyle();
    }

    onSlideChange(): void{  this.applyPagerStyle(); }

    checkSwiper(mode: EditMode): void{
        if(mode.editComponents) return this.swiper?.swiperRef.disable();
        this.swiper?.swiperRef.enable();
    }

    private initSwiperStyles(): void{
        // options
        this.swiperConfig.pagination = {
            enabled: true
        };
        this.swiperConfig.direction = (this.orientation as "horizontal" | "vertical");
    }

    private applyPagerStyle(): void{
        this.swiper?.swiperRef.pagination.bullets.forEach((el)=> {
            (el as HTMLElement).style.background = el.classList.contains('swiper-pagination-bullet-active') ? this.pagerOnColor : this.pagerOffColor;
        });
    }

    switchToEditMode(compContainer: FhemComponentContainerSettings): void{
        this.editor.core.enterEditMode(compContainer.containerUID);
    }
}