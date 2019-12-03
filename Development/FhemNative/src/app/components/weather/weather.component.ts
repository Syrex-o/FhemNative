import { Component, Input, ElementRef, AfterViewInit } from '@angular/core';

import * as d3 from 'd3';

import { SettingsService } from '../../services/settings.service';
import { FhemService } from '../../services/fhem.service';
import { TimeService } from '../../services/time.service';

@Component({
	selector: 'fhem-weather',
	template: `
		<div
			[ngClass]="settings.app.theme"
			class="weather"
			double-click
			[editingEnabled]="settings.modes.roomEdit"
			resize
			minimumWidth="150"
			minimumHeight="80"
			id="{{ID}}"
			(onResize)="resize($event)"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}">
			<fhem-container [specs]="{'device': data_device, 'reading': null, 'available': true}">
				<div class="chart-container"></div>
			</fhem-container>
		</div>
	`,
	styles: [`
		.weather{
			position: absolute;
			width: 150px;
			height: 80px;
		}
		.chart-container{
			position: absolute;
			width: 100%;
			height: 100%;
		}
	`]
})
export class WeatherComponent implements AfterViewInit {
	constructor(
		private fhem: FhemService,
		public settings: SettingsService,
		private time: TimeService,
		private ref: ElementRef) {

	}
	// Component ID
	@Input() ID: number;

	@Input() data_device: string;
	@Input() arr_data_fhemModule: Array<any>;
	@Input() bool_data_showCurrentDayDetails: boolean = false;

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;

	public fhemDevice: any;

    // d3 relevant
    // unique ID for clip path
    private UID = '_' + Math.random().toString(36).substr(2, 9);
    private svg: any;
    private defs: any;
    private dim: any = {
  		padding: {top: 20, right: 30, bottom: 30, left: 40},
  		svg: {width: 0, height: 0},
  		content: {width: 0, height: 0}
  	};

  	private DateFormats: any = {
        decimal: ',',
        thousands: '.',
        grouping: [3],
        currency: ['€', ''],
        dateTime: '%a %b %e %X %Y',
        date: '%d.%m.%Y',
        time: '%H:%M:%S',
        periods: ['AM', 'PM'],
        days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
        shortDays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
        shortMonths: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
    };

  	private data: any;

  	private currentDay: any = {};

  	private x: any;
    private y: any;
    private xScale: any;
    private yScale: any;
    private xAxis: any;
    private yAxis: any;

    private icons = {
    	sun: "M277.3 32h-42.7v64h42.7V32zm129.1 43.7L368 114.1l29.9 29.9 38.4-38.4-29.9-29.9zm-300.8 0l-29.9 29.9 38.4 38.4 29.9-29.9-38.4-38.4zM256 128c-70.4 0-128 57.6-128 128s57.6 128 128 128 128-57.6 128-128-57.6-128-128-128zm224 106.7h-64v42.7h64v-42.7zm-384 0H32v42.7h64v-42.7zM397.9 368L368 397.9l38.4 38.4 29.9-29.9-38.4-38.4zm-283.8 0l-38.4 38.4 29.9 29.9 38.4-38.4-29.9-29.9zm163.2 48h-42.7v64h42.7v-64z",
    	moon: "M195 125c0-26.3 5.3-51.3 14.9-74.1C118.7 73 51 155.1 51 253c0 114.8 93.2 208 208 208 97.9 0 180-67.7 202.1-158.9-22.8 9.6-47.9 14.9-74.1 14.9-106 0-192-86-192-192z",
    	partSun: "M248.03 116.81l24.679-24.678 19.233 19.234-24.678 24.677zM176 125.7c-45.3 0-82.3 37-82.3 82.3 0 17.5 5.5 33.7 14.9 47 15.3-13 33.9-22.6 54.7-27.6l13.2-16.6c13.6-17.1 30.7-30.2 50.8-38.9 6.1-2.6 12.4-4.8 19-6.6-14.5-23.7-40.6-39.6-70.3-39.6zM162 64h28v41h-28zM32 194h41v28H32zM81.6 276.8l-.8-.8-24.7 24.7 19.2 19.2 24.7-24.7zM79.289 92.13l24.678 24.678-19.233 19.233-24.678-24.678zM405.6 288.6C394.7 233.4 346.2 192 288 192c-34 0-65.1 11.9-86.5 38.8 29.4 2.2 56.7 13 77.8 33.9 15.6 15.6 26.6 34.6 32.1 55.3h-28.7c-13.1-37.3-48-64-90.6-64-5.1 0-12.3.6-17.7 1.7C128.6 267.1 96 305 96 352c0 53 43 96 96 96h208c44.2 0 80-35.8 80-80 0-42.2-32.8-76.5-74.4-79.4z",
    	partMoon: "M123.4 183c.4-.1.8-.1 1.2-.2-.5.1-.8.2-1.2.2ZM341.5 303.4C330.7 247.7 282.2 206 224 206c-34 0-65.1 12-86.5 39.1 29.4 2.2 56.7 13.1 77.7 34.2 15.6 15.7 26.6 34.9 32.1 55.8h-28.7c-13.1-37.6-48-64.5-90.6-64.5-5.1 0-12.3.6-17.7 1.7-45.7 9.4-78.3 47.6-78.3 95 0 53.4 43 96.8 96 96.8h208c44.1 0 80-36.1 80-80.6-.1-42.7-32.9-77.2-74.5-80.1ZM112.5 225.4c13.6-17.3 30.7-30.5 50.8-39.2 18.4-8 38.8-12 60.7-12 6.1 0 12.2.4 18.2 1.1-6.1-18.1-9.4-37.6-9.4-57.8 0-24.6 4.9-48.1 13.8-69.4C161.9 68.7 99 145.7 99 237.3c0 1.6 0 3.2.1 4.8.1 0 .2-.1.3-.1l13.1-16.6zM417.6 306.8c13.3 14.2 22.6 31.5 27.1 50.1 16.5-21.4 28.7-46.4 35.3-73.5-21.2 9-44.5 13.9-68.9 13.9h-3.6c3.5 2.9 6.9 6.1 10.1 9.5z",
    	cloudy: "M393.2 219.2C380.5 154.6 323.9 106 256 106c-39.7 0-76 14-100.9 45.4 34.3 2.6 66.1 15.2 90.7 39.8 18.2 18.2 31 40.5 37.4 64.8h-33.5c-15.3-43.7-56-75-105.7-75-6 0-14.3.7-20.6 2C70 194 32 238.4 32 293.5 32 355.6 82.2 406 144 406h242.7c51.5 0 93.3-42 93.3-93.8 0-49.4-38.3-89.6-86.8-93z",
    	rain: "M167 510s-23 25.3-23 40.7c0 12.8 10.3 23.3 23 23.3s23-10.5 23-23.3c0-15.4-23-40.7-23-40.7ZM245 478s-23 25.3-23 40.7c0 12.8 10.4 23.3 23 23.3 12.7 0 23-10.5 23-23.3 0-15.4-23-40.7-23-40.7ZM323 510s-23 25.3-23 40.7c0 12.8 10.3 23.3 23 23.3 12.6 0 23-10.5 23-23.3 0-15.4-23-40.7-23-40.7Z"
    };

	static getSettings() {
		return {
			name: 'Weather',
			component: 'WeatherComponent',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'arr_data_fhemModule', default: 'Proplanta'},
				{variable: 'bool_data_showCurrentDayDetails', default: false}
			],
			dimensions: {minX: 150, minY: 80}
		};
	}


	ngAfterViewInit() {
		d3.timeFormatDefaultLocale(this.DateFormats);
		this.fhem.getDevice(this.data_device, null).then((device) => {
			this.fhemDevice = device;
			if(device){
				this.getData();
				this.draw(false);
			}
		});
	}

	private getData(){
		// reset data arr
		this.data = {temp: [],rain: [], rainChance: [], cloud: []};

		if(this.arr_data_fhemModule[0] === 'Proplanta'){
			for (const [key, value] of Object.entries(this.fhemDevice.readings)) {
				// search for day readings
				if(key.match(/fc\d/)){
					let date:any = new Date(this.time.addDay(this.time.local().dateRaw, parseInt(key.match(/\d/)[0])));
					date.setMinutes(0);
					date.setSeconds(0);
					// get value
					let val:any = value;
					val = val.Value !== undefined ? val.Value : val
					// check for temp
					if(key.match(/temp\d/)){
						const hour = parseInt(key.match(/temp\d+/)[0].replace('temp', ''));
						date.setHours(hour);

						this.data.temp.push({
							date: date,
							value: val
						});
					}
					// check for rain
					if(key.match(/rain\d/)){
						const hour = parseInt(key.match(/rain\d+/)[0].replace('rain', ''));
						date.setHours(hour);

						this.data.rain.push({
							date: date,
							value: val
						});
					}
					// check for rain chance
					if(key.match(/chOfRain\d/)){
						const hour = parseInt(key.match(/chOfRain\d+/)[0].replace('chOfRain', ''));
						date.setHours(hour);

						this.data.rainChance.push({
							date: date,
							value: val
						});
					}
					// check for cloud
					if(key.match(/cloud\d/)){
						const hour = parseInt(key.match(/cloud\d+/)[0].replace('cloud', ''));
						date.setHours(hour);

						this.data.cloud.push({
							date: date,
							value: val
						});
					}
				}
			}
			if(this.bool_data_showCurrentDayDetails){
				this.currentDay = {
			  		tempMin: this.fhemDevice.readings.fc0_tempMin.Value,
			  		tempMax: this.fhemDevice.readings.fc0_tempMax.Value,
			  		tempCurrent: this.fhemDevice.readings.temperature.Value
				}
			}
		}

		// sort values
		for (const [key, value] of Object.entries(this.data)) {
			this.data[key].sort((a, b)=> b.date - a.date);
		}
	}

	public resize(size) {
		if (this.fhemDevice) { this.draw(size); }
	}

	private draw(size: boolean){
		setTimeout(()=>{
			// getting size
			this.dim.svg = (!size ? this.getSize('.chart-container') : size);
			// content size
			this.dim.content.width = this.dim.svg.width - this.dim.padding.left - this.dim.padding.right;
			this.dim.content.height = this.dim.svg.height - this.dim.padding.top - this.dim.padding.bottom;
			// delete and create svg
			d3.select(this.ref.nativeElement).select('svg').remove();
			this.svg = d3.select(this.ref.nativeElement.querySelector('.chart-container')).append('svg').attr('width', this.dim.svg.width).attr('height', this.dim.svg.height);

			// build content
			this.buildContent();
			// build axis
			this.buildAxis();
			// draw chart
			this.drawAreaChart(this.data.temp);
		}, 0);
	}

	private drawAreaChart(data){
		// build gradient
		const gradient = this.defs.append("linearGradient")
			.attr("id", "svgGradient")
			.attr("x1", "0%")
			.attr("x2", "0%")
			.attr("y1", "0%")
			.attr("y2", "100%");


		gradient.append("stop")
	   		.attr('class', 'start')
	   		.attr("offset", "0%")
	   		.attr("stop-color", "#14a9d5")
	   		.attr("stop-opacity", 1);

	   	gradient.append("stop")
		   	.attr('class', 'end')
		   	.attr("offset", "100%")
		   	.attr("stop-color", "#005e79")
		   	.attr("stop-opacity", 0.5);

		// create area chart
		this.svg.select('.chart').append('path')
			.attr('class', 'area')
			.datum(data)
			.attr('fill', 'url(#svgGradient)')
				.attr('d', d3.area()
					.x((d:any) => this.x(d.date))
					.y0(this.y( d3.min(this.data.temp.map(d => d.value - 5)) ))
					.y1(d => this.y( d3.min(this.data.temp.map(d => d.value - 5)) ))
					.curve(d3.curveNatural)
				)
			.transition()
        	.duration(600)
	   			.attr('d', d3.area()
					.x((d:any) => this.x(d.date))
					.y0(this.y( d3.min(this.data.temp.map(d => d.value - 5)) ))
					.y1((d:any) => this.y(d.value))
					.curve(d3.curveNatural)
				)

		// create labels
		this.svg.select('.chart').selectAll('.text')
			.data(data)
			.enter()
			.append('text')
			.attr("class", "label")
			.attr("x", (d=>this.x(d.date)))
			.attr("y", (d)=> {
				if(d.value >= 0){
					return this.y(d.value) - 15;
				}else{
					return this.y(d.value) + 10;
				}
			})
			.attr("dy", ".75em")
			.attr('font-size', '10px')
  			.text((d)=> { return d.value + '\xB0'; });

	    // daily values display
	    if(this.bool_data_showCurrentDayDetails){
	    	this.svg.select('.chart')
	    		.append('g')
	    		.attr("class", "overall")
	    		.attr('transform', 'translate(' + 0 + ',' + this.dim.padding.top + ')');

	    	// date
	    	this.svg.select('.overall').append('text')
	    		.attr("class", "date")
	    		.attr('font-size', '12px')
	    		.text(d3.timeFormat("%d. %B %H:%m")(new Date));
	    	// min max
	    	this.svg.select('.overall').append('text')
	    		.attr("class", "min")
	    		.attr('font-size', '12px')
	    		.text('Min: '+this.currentDay.tempMin+ '\xB0'+ ' - Max: '+this.currentDay.tempMax+ '\xB0')
	    		.attr('transform', 'translate(' + 0 + ',' + 15 + ')')
	    	// current
	    	this.svg.select('.overall').append('text')
	    		.attr("class", "current")
	    		.attr('font-size', '20px')
	    		.text(this.currentDay.tempCurrent+ '\xB0C')
	    		.attr('transform', 'translate(' + 0 + ',' + 35 + ')')
	    }

	    this.breakLine();
  		this.addIcons();
	    this.colorAxis();
	}

	private buildContent() {
		// clip path
		this.defs = this.svg.append('defs');

		this.defs.append('clipPath')
			.attr('id', this.UID)
		  	.append('rect')
		    .attr('width', this.dim.content.width)
		    .attr('height', this.dim.content.height);
		// focus
		this.buildFocus();
	}

	private buildFocus() {
		this.svg.append('g')
    		.attr('class', 'focus')
    		.attr('transform', 'translate(' + this.dim.padding.left + ',' + this.dim.padding.top + ')');

  		this.svg.select('.focus').append('g')
    		.attr('clip-path', 'url(#' + this.UID + ')')
    		.attr('class', 'chart');
	}

	private buildAxis() {
		this.x = d3.scaleTime()
			.range([0, this.dim.content.width])
			.domain([
				d3.min(this.data.temp.map(d => d.date)) as unknown as number,
				d3.max(this.data.temp.map(d => d.date)) as unknown as number
			]);

		this.y = d3.scaleLinear()
			.rangeRound([this.dim.content.height, 0])
			.domain([
				d3.min(this.data.temp.map(d => d.value - 5)) as unknown as number,
				d3.max(this.data.temp.map(d => d.value + 5)) as unknown as number
			]);

		this.xScale = d3.axisBottom(this.x)
			.tickSizeOuter(0)
			.tickFormat(d3.timeFormat('%Y-%m-%d %H:%M'))
			.ticks(this.getTicks());

		this.yScale = d3.axisLeft(this.y).tickFormat((d:any) => d);

		this.xAxis = this.svg.selectAll('.focus').append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(' + [0, this.dim.content.height] + ')')
			.call(this.xScale);

	 	const zoom = d3.zoom()
	 		.extent([[0, this.dim.padding.top], [this.dim.svg.width-(this.dim.padding.left + this.dim.padding.right), this.dim.svg.width-this.dim.padding.top]])
	 		.scaleExtent([0.9, 10])
	 		.translateExtent([[0, this.dim.padding.top], [this.dim.svg.width-(this.dim.padding.left + this.dim.padding.right), this.dim.svg.width-this.dim.padding.top]])
	 		.on('zoom', this.zoomed.bind(this));

	 	// zoom content
	  	this.svg.append('rect')
	      	.attr('class', 'zoom')
	      	.attr('width', this.dim.content.width)
	      	.attr('height', this.dim.content.height)
	      	.attr('fill', 'transparent')
	      	.attr('transform', 'translate(' + [this.dim.padding.left, this.dim.padding.top] + ')')
	      	.call(zoom);
	}

	private getTicks(){
		const ticks = Math.min(this.data.temp.length, Math.floor(this.dim.content.width / 80))
		return ticks;
	}

	private addIcons(){
		this.svg.selectAll('.x .tick')
			.call((t)=>{
				const Ythis = this;
				t.each(function(d, i){
					const self = d3.select(this);
					self.select('.chart-icon').remove();
					
					// find date index
					const index = Ythis.data.cloud.findIndex(x=> x.date.toString() === d.toString());

					if(index > -1){
						self.append('g')
							.attr("class", "chart-icon")
							.append('path')
							.attr('d', ()=>{
								let icon;
				  				// detect full cloudy
				  				if(Ythis.data.cloud[index].value === 100){
				  					icon = Ythis.icons.cloudy;
				  				}else{
				  					if(d.getHours() <= 3 || d.getHours() >= 21){
				  					// night
					  				if(Ythis.data.cloud[index].value >= 25){
					  						icon = Ythis.icons.partMoon;
					  					}else{
					  						icon = Ythis.icons.moon;
					  					}
					  				}else{
					  					// day
					  					if(Ythis.data.cloud[index].value >= 25){
					  						icon = Ythis.icons.partSun;
					  					}else{
					  						icon = Ythis.icons.sun;
					  					}
					  				}
				  				}
				  				// detect rain
				  				if(Ythis.data.rain[index].value > 0){
				  					icon = icon + ' ' + Ythis.icons.rain;
				  				}
				  				return icon;
				  			})
				  			.attr('transform', "translate(-10,-25) scale(0.04)")

				  		if(Ythis.data.rain[index].value > 0){
				  			self.select('.chart-icon')
				  				.append('text')
				  				.text(Ythis.data.rainChance[index].value + '%')
				  				.attr('transform', "translate(10,-30)")
				  		}
					}
				})
			});
	}

	private breakLine(){
		this.svg.selectAll('.x .tick text')
			.call((t)=>{
				t.each(function(d){
					let self = d3.select(this);
					let s = self.text().split(' ');
					self.text('');
					self.append("tspan")
						.attr("x", 0)
		                .attr("dy",".8em")
		                .text(s[0]);
		            self.append("tspan")
		                .attr("x", 0)
		                .attr("dy",".8em")
		                .text(s[1]);
				})
			});
	}

	private zoomed() {
		this.xAxis.call(this.xScale.scale(d3.event.transform.rescaleX(this.x)));

		const newXscale = d3.event.transform.rescaleX(this.x);

		this.svg.select('.focus').selectAll('.area').attr('transform', 'translate(' + [d3.event.transform.x, 1] + ') scale(' + [d3.event.transform.k, 1] + ')');

		// rescale labels
		this.svg.selectAll('.label')
			.attr('x', (d)=>{
				return newXscale(d.date);
			});

		// rescale icons
		this.svg.selectAll('.icon')
			.attr('transform', (d)=>{
  				return 'translate('+ [ newXscale(d.date) - 9, this.dim.content.height - 30 ]  +') scale(0.04)'
  			});


		this.breakLine();
		this.addIcons();
		this.colorAxis();
	}

	private colorAxis() {
  		// coloring
      	const color = (this.settings.app.theme === 'dark') ? '#fff' : '#000';
      	this.svg.selectAll('.axis path').style('stroke', color);
      	this.svg.selectAll('.axis line').style('stroke', color);
      	this.svg.selectAll('.axis text').style('fill', color);
      	this.svg.selectAll('.label').style('fill', color);
      	this.svg.selectAll('.chart-icon').style('fill', color);
      	this.svg.selectAll('.overall').style('fill', color);
  	}

	// get svg size
	private getSize(el) {
    	const elem = this.ref.nativeElement.querySelector(el);
    	return {
    	  	width: (this.width) ? parseInt(this.width) : elem.clientWidth,
    	  	height: (this.height) ? parseInt(this.height) : elem.clientHeight
    	};
  	}
}
