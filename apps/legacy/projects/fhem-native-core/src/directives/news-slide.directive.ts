import { Directive, ElementRef, Renderer2, AfterViewInit, NgModule } from '@angular/core';
import { AnimationPlayer, AnimationBuilder, AnimationMetadata, AnimationFactory, animate, style, keyframes } from '@angular/animations';

@Directive({ selector: '[newsSlide]' })
export class NewsSlideDirective implements AfterViewInit {
	private parent!: HTMLElement;
	private newsDelta: number = 0;
	private newsTimer: number = 0;
	private newsState: boolean = true;

	// animation player
	player!: AnimationPlayer;

	constructor(
		private ref: ElementRef, 
		private renderer: Renderer2, 
		private builder: AnimationBuilder){
	}

	ngAfterViewInit(){
		setTimeout(()=>{
			const parent: HTMLElement|null  = this.ref.nativeElement.parentElement;
			if(parent){
				this.newsDelta = this.ref.nativeElement.clientWidth - parent.clientWidth;
				// compare sizes
				if(this.newsDelta > 0){
					this.newsTimer = Math.round( (this.newsDelta / parent.clientWidth) + 5 );
					// assign shadow
					this.renderer.addClass(parent, 'newsSlide-shadow');
					// add animation
					this.assignAnimation();
				}
			}
		}, 1000);
	}

	private assignAnimation(): void{
		if(this.player){
			this.player.destroy();
		}
		const metadata: AnimationMetadata[] = this.newsState ? this.animateLeft() : this.animateRight();
		// build animation
		const factory: AnimationFactory = this.builder.build(metadata);
		const player: AnimationPlayer = factory.create(this.ref.nativeElement);

		player.play();

		// callback
		player.onDone(()=>{
			this.newsState = !this.newsState;
			this.assignAnimation();
		});
	}

	// animations
	private animateLeft(): AnimationMetadata[]{
		return [
			style({ transform: 'translate(0px, -50%)' }),
			animate(this.newsTimer + 's ease-in-out', keyframes([
				style({ transform: 'translate(0px, -50%)', offset: 0 }),
				style({ transform: `translate(${-(this.newsDelta + 20)}px, -50%)`, offset: 1 }),
			]))
		];
	}

	private animateRight(): AnimationMetadata[]{
		return [
			style({ transform: 'translate(0px, -50%)' }),
			animate(this.newsTimer + 's ease-in-out', keyframes([
				style({ transform: `translate(${-(this.newsDelta + 20)}px, -50%)`, offset: 0 }),
				style({ transform: 'translate(0px, -50%)', offset: 1 }),
			]))
		];
	}
}
@NgModule({
	declarations: [ NewsSlideDirective ],
	exports: [ NewsSlideDirective ]
})
export class NewsSlideModule {}