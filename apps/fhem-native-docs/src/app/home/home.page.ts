import { AfterContentChecked, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, ViewEncapsulation } from "@angular/core";

import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";

import SwiperCore, { Parallax, Pagination, Swiper, Autoplay } from 'swiper';
import { SwiperComponent, SwiperModule } from 'swiper/angular';

SwiperCore.use([Parallax, Autoplay, Pagination]);

import * as d3 from 'd3';

@Component({
	standalone: true,
	selector: 'fhem-native-website-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
	imports: [ IonicModule, TranslateModule, SwiperModule ],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent implements AfterContentChecked, OnDestroy{
	@ViewChild('SwiperA', {read: SwiperComponent}) swiperA!: SwiperComponent;
	@ViewChild('SwiperB', {read: SwiperComponent}) swiperB!: SwiperComponent;

    @ViewChild('CANVAS', {static: false, read: ElementRef}) canvas: ElementRef|undefined;
	@ViewChild('CANVAS_CONTAINER', {static: false, read: ElementRef}) canvasContainer: ElementRef|undefined;
	private animationData = this.getAnimationData();

	private simulation: d3.Simulation<any, undefined>|undefined;
	private initialized = false;
	width = 800; height = 600;

	scrollToElem(el: HTMLElement) {
		el.scrollIntoView({behavior: 'smooth'});
	}

	ngAfterContentChecked(): void {
		if(this.swiperA) this.swiperA.swiperRef.autoplay.start();
		if(this.canvasContainer?.nativeElement.clientWidth > 0 && !this.initialized) this.createGraph();
	}

	onSlideChangeA(e: Swiper[]): void{
		const currentIndex = e[0].activeIndex;
		
		if(this.swiperA && this.swiperA.swiperRef) this.swiperB.swiperRef.slideTo(currentIndex);
	}

	onSlideChangeB(e: Swiper[]): void{
		const currentIndex = e[0].activeIndex;
		if(this.swiperB && this.swiperB.swiperRef) this.swiperA.swiperRef.slideTo(currentIndex);
	}

	private createGraph(): void{
		if(!this.canvasContainer || !this.canvas) return;
		this.initialized = true;

		this.width = this.height = Math.max(this.canvasContainer.nativeElement.offsetWidth, this.canvasContainer.nativeElement.offsetHeight);

		const links = this.animationData.links.map(d => Object.create(d));
  		const nodes = this.animationData.nodes.map(d => Object.create(d));

		this.canvas.nativeElement.width = this.width;
		this.canvas.nativeElement.height = this.height;
		const context = this.canvas.nativeElement.getContext("2d");
		
		const ticked = ()=> {
			context.clearRect(0, 0, this.width, this.height);
			context.save();
			context.translate(this.width / 2, this.height / 2);
			context.beginPath();
			for (const d of links) {
			  	context.moveTo(d.source.x, d.source.y);
			  	context.lineTo(d.target.x, d.target.y);
			}
			context.strokeStyle = "#21294f";
			context.stroke();
			context.beginPath();
			for (const d of nodes) {
			  	context.moveTo(d.x + 3, d.y);
			  	context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
			}
			context.fill();
			context.strokeStyle = "#dbf5f2";
			context.stroke();
			context.restore();
		}

		const drag = (simulation: d3.Simulation<any, undefined>) =>{
			function dragstarted(event: any) {
				if (!event.active) simulation.alphaTarget(0.3).restart();
				event.subject.fx = event.subject.x;
				event.subject.fy = event.subject.y;
			}

			function dragged(event: any) {
				event.subject.fx = event.x;
				event.subject.fy = event.y;
			}

			function dragended(event: any) {
				if (!event.active) simulation.alphaTarget(0);
				event.subject.fx = null;
				event.subject.fy = null;
			}

			return d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended);
		}

		this.simulation = d3.forceSimulation(nodes)
			.force("charge", d3.forceManyBody().strength(-10))
			.force("link", d3.forceLink(links).strength(.5).distance(20).iterations(1))
			.on("tick", ticked);

		this.simulation.alphaDecay(0.001);

		d3.select(context.canvas)
			.call(
				drag(this.simulation).subject(({x, y}) => this.simulation?.find(x - this.width / 2, y - this.height / 2))
			)
			.node()
	}

	private getAnimationData(){
		const n = 20;
		const nodes = Array.from({length: n * n}, (_, i) => ({index: i}));
		const links = [];
		for (let y = 0; y < n; ++y) {
			for (let x = 0; x < n; ++x) {
				if (y > 0) links.push({source: (y - 1) * n + x, target: y * n + x});
				if (x > 0) links.push({source: y * n + (x - 1), target: y * n + x});
			}
		}
		return {nodes, links};
	}

	openPlayStore(): void{
		window.open('https://play.google.com/store/apps/details?id=de.slapapps.fhemnative', '_system');
	}

	openAppStore(): void{
		window.open('https://apps.apple.com/us/app/fhemnative/id6458731220', '_system');
	}

	openDesktop(): void{
		window.open('https://github.com/Syrex-o/FhemNative/releases', '_blank');
	}

	ngOnDestroy(): void {
		this.simulation?.stop();
	}
}