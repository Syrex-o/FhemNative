import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';

import * as d3 from 'd3';

import { FhemService } from '../../services/fhem.service';
import { SettingsService } from '../../services/settings.service';

@Component({
	selector: 'fhem-chart',
	template: `
		<div
			[ngClass]="settings.app.theme"
			class="chart" double-click
			[editingEnabled]="settings.modes.roomEdit"
			resize
			minimumWidth="100"
			minimumHeight="100"
			id="{{ID}}"
			(onResize)="resize($event)"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}" >
			<fhem-container [specs]="{'device': data_device, 'reading': null, 'available': true}">
				<div class="chart-container">
					<p *ngIf="noData" class="no-data">
						{{ 'COMPONENTS.Chart.TRANSLATOR.NO_DATA' | translate }}
						{{ 'GENERAL.ERRORS.NOT_FOUND.COMPONENT_HELPER' | translate }}
					</p>
				</div>
			</fhem-container>
		</div>
	`,
	styles: [`
		.chart{
			position: absolute;
			width: 200px;
			height: 200px;
		}
		.chart-container{
			position: absolute;
			width: 100%;
			height: 100%;
		}
		.no-data{
			position: absolute;
			margin: 0;
			left: 50%;
			top: 50%;
			transform: translate(-50%,-50%);
			font-weight: 500;
			font-size: 1.1em;
		}
		.dark .no-data{
			color: var(--dark-p);
		}
	`]
})

export class ChartComponent implements OnInit {

	constructor(
		private fhem: FhemService,
		public settings: SettingsService,
		private ref: ElementRef) {
	}
	// Component ID
	@Input() ID: number;

	// position information
	@Input() width: any;
	@Input() height: any;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;

	public fhemDevice: any;
	public noData = true;

	// FHEM Definition
	@Input() data_device: string;
	@Input() data_logFile: string;
	@Input() data_reading: string;
	@Input() data_reading2: string;
	@Input() data_maxY: string;
	@Input() data_labelExtension: string;
	// Charts
	@Input() arr_data_chartType: string|string[];
	@Input() arr_data_chartType2: string|string[];

	@Input() arr_data_timeFormat: string|string[];
	@Input() arr_data_colorSet: string|string[];

	@Input() bool_data_getCurrent: boolean;
	@Input() bool_data_zoomBothAxis: boolean;

	private formatTime: any;

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

    private svg: any;

    private rawData: string;
    private data: any = {};

    private x: any;
    private y: any;
    private xScale: any;
    private yScale: any;
    private xAxis: any;
    private yAxis: any;

    private colorSet: any;

    // unique ID for clip path
    private UID = '_' + Math.random().toString(36).substr(2, 9);

  	private dim: any = {
  		padding: {top: 20, right: 30, bottom: 30, left: 40},
  		svg: {width: 0, height: 0},
  		content: {width: 0, height: 0}
  	};

	static getSettings() {
		return {
			name: 'Chart',
			component: 'ChartComponent',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_logFile', default: ''},
				{variable: 'data_reading', default: ''},
				{variable: 'data_reading2', default: ''},
				{variable: 'data_maxY', default: ''},
				{variable: 'data_labelExtension', default: ''},
				{variable: 'bool_data_getCurrent', default: true},
				{variable: 'bool_data_zoomBothAxis', default: false},
				{variable: 'arr_data_chartType', default: 'bar,line,area,gauge,liquidGauge'},
				{variable: 'arr_data_chartType2', default: 'bar,line,area'},
				{variable: 'arr_data_timeFormat', default: '%Y-%m-%d,%d-%b-%y,%Y-%m'},
				{variable: 'arr_data_colorSet', default: '1,2,3'}
			],
			dimensions: {minX: 200, minY: 200}
		};
	}

	ngOnInit() {
		this.formatTime = d3.timeFormat(this.arr_data_timeFormat[0]);
		this.colorSet = this.getColors();
		d3.timeFormatDefaultLocale(this.DateFormats);
		this.fhem.getDevice(this.data_device, false).then((device) => {
			this.fhemDevice = device;
			if (device) {
				this.initChart().then(() => {
					this.draw(false);
				}).catch(() => {

				});
			}
		});
	}

	private getColors() {
		const colorset = {
			1: ['#0e54a6', '#034af9', '#04f391', '#0ca296', '#046e09', '#0eb255', '#0d0b1c', '#01a44a', '#0c0f2c', '#0e3f9f', '#0978e6', '#0a9f59', '#048e81', '#0d30d0', '#018515', '#022e97', '#04e650', '#0401f4', '#037898', '#01550f'],
			2: ['#04bea6', '#0c2083', '#061690', '#06ab4a', '#029100', '#0cbb59', '#0c7315', '#0eda25', '#0f2438', '#00d030', '#00d200', '#080126', '#0155b5', '#06fa91', '#0950a8', '#0a3f5b', '#01d8c3', '#0a9437', '#00a4d3', '#0558bd'],
			3: ['#0ba170', '#08895f', '#0948ad', '#092992', '#0e527c', '#0ea534', '#0deab5', '#04d274', '#066b4a', '#01feff', '#0a800a', '#0ddb5e', '#07ec7e', '#0034a1', '#0522bb', '#0de44d', '#023040', '#062f0e', '#08ceb0', '#03a500']
		};
		return colorset[this.arr_data_colorSet[0]];
	}

	public resize(size) {
		if (this.fhemDevice) { this.draw(size); }
	}

	private initChart() {
		return new Promise((resolve, reject) => {
			this.data = {read1: [], read2: []};
			this.getData().then(() => {
				resolve();
				this.noData = false;
			});
		});
	}

	private getData() {
		return new Promise((resolve, reject) => {
			const sub = this.fhem.deviceGetSub.subscribe((event) => {
				if (event.payload.device === this.data_device) {
					sub.unsubscribe();
					if (event.payload.value) {
						this.arrangeData(event.payload.value);
					} else {
						this.noData = true;
					}
					resolve();
				}
			});
			this.fhem.get(this.data_device, this.getLog());
		});
	}

	private getLog() {
		const d = new Date();
		const result = [
			// log:
			'',
			// minDate:
			'2000-01-01',
			// maxDate:
			[
				d.getFullYear(),
				(d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1),
				d.getDate() + 1
			].join('-')
		];
		if (this.bool_data_getCurrent) {
			const test = new RegExp('.*(?=' + this.data_device + ')', 'g');
			result[0] = this.fhemDevice.internals.currentlogfile.replace(test, '') + ' -';
		} else {
			result[0] = this.data_logFile + ' -';
		}
		return result.join(' ');
	}

	private arrangeData(raw) {
		const splitText = raw.split(/\r\n|\r|\n/).length;
		for (let i = 0; i < splitText; i++) {
  			if (raw.split(/\r\n|\r|\n/)[i] !== '') {
  				// let name = raw.split(/\r\n|\r|\n/)[i].match(/([A-Z|a-z])\w+/)[0];
  				const test = new RegExp(
  					this.data_reading2 !== '' ? [this.data_reading, this.data_reading2].join('|') : this.data_reading, 'g'
  				);
  				if(raw.split(/\r\n|\r|\n/)[i].match(test)){
  					const name = raw.split(/\r\n|\r|\n/)[i].match(test)[0];
	  				for (let j = 1; j <= 2; j++) {
	  					if (name === (j === 1 ? this.data_reading : this.data_reading2)) {
	  						this.data['read' + j].push({
	  							date: d3.timeParse('%Y-%m-%d_%H:%M:%S')(raw.split(/\r\n|\r|\n/)[i].match(/(.*?\s)/)[0].replace(' ', '')),
		  						value: parseInt(raw.split(/\r\n|\r|\n/)[i].match(/[-+]?[0-9]*\.?[0-9]+$/)[0])
	  						});
	  					}
	  				}
  				}
  			}
  		}
	}

	private draw(size) {
		// getting size
		this.dim.svg = (!size ? this.getSize('.chart-container') : size);
		this.dim.content.width = this.dim.svg.width - this.dim.padding.left - this.dim.padding.right;
		this.dim.content.height = this.dim.svg.height - this.dim.padding.top - this.dim.padding.bottom;

		// delete and create svg
		d3.select(this.ref.nativeElement).select('svg').remove();
		this.svg = d3.select(this.ref.nativeElement.querySelector('.chart-container')).append('svg').attr('width', this.dim.svg.width).attr('height', this.dim.svg.height);
		// build content
		this.buildContent();
		// build axis
		this.buildAxis();
		// build Charts
 		this.drawCharts();
	}

	private drawCharts() {
		const chart = this.arr_data_chartType[0].toUpperCase();
  		const chart2 = this.arr_data_chartType2[0].toUpperCase();
		if (this.data_reading) {
			this['create' + chart + 'chart']('read1', 0);
		}
		if (this.data_reading2) {
			this['create' + chart2 + 'chart']('read2', 1);
		}
	}

	private buildContent() {
		if ( [this.arr_data_chartType[0], (this.data_reading2 !== '' ? this.arr_data_chartType2[0] : '')].join('').match(/(bar|line|area)/) ) {
			// clip path
			this.svg.append('defs').append('clipPath')
				.attr('id', this.UID)
			  	.append('rect')
			    .attr('width', this.dim.content.width)
			    .attr('height', this.dim.content.height);
			// focus
			this.buildFocus();
		}
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
		if ( [this.arr_data_chartType[0], (this.data_reading2 !== '' ? this.arr_data_chartType2[0] : '')].join('').match(/(bar|line|area)/) ) {
			this.x = d3.scaleTime()
				.rangeRound([0, this.dim.content.width])
				.domain([
					d3.min([
						d3.min(this.data.read1.map(d => d.date)),
						( this.data.read2.length > 0 ? d3.min(this.data.read2.map((d) => d.date)): d3.min(this.data.read1.map((d) => d.date)))
					]) as unknown as number,
					d3.max([
					 	d3.max(this.data.read1.map((d) => d.date)),
					 	( this.data.read2.length > 0 ? d3.max(this.data.read2.map((d) => d.date)) : d3.max(this.data.read1.map((d) => d.date)))
					]) as unknown as number
				]);

			this.y = d3.scaleLinear()
				.range([this.dim.content.height, 0])
				.domain([
					0,
					(this.data_maxY !== '' ? parseInt(this.data_maxY) : d3.max(
						[
							d3.max(this.data.read1.map((d) => d.value)) as unknown as number,
							( this.data.read2.length > 0 ? d3.max(this.data.read2.map((d) => d.value)) as unknown as number : 0)
						]
					) )
				]);

			this.xScale = d3.axisBottom(this.x)
				.tickSizeOuter(0)
				.tickFormat(d3.timeFormat(this.arr_data_timeFormat[0]));

			// format label ticks
			if (this.dim.content.width <= 520) {
				this.xScale.ticks(5);
			}
			if (this.dim.content.width <= 250) {
				this.xScale.ticks(2);
			}
			if (this.dim.content.width > 520) {
				this.xScale.ticks(10);
			}

			this.yScale = d3.axisLeft(this.y)
				.tickFormat((d) => d + this.data_labelExtension);

			this.xAxis = this.svg.selectAll('.focus').append('g').attr('class', 'x axis')
				.attr('transform', 'translate(' + [0, this.dim.content.height] + ')')
				.call(this.xScale);

			this.yAxis = this.svg.selectAll('.focus').append('g').attr('class', 'y axis')
	      		.call(this.yScale);

	  const zoom = d3.zoom()
			    .on('zoom', this.zoomed.bind(this));

	      	// zoom content
	  this.svg.append('rect')
	      		.attr('class', 'zoom')
	      		.attr('width', this.dim.content.width)
	      		.attr('height', this.dim.content.height)
	      		.attr('fill', 'transparent')
	      		.attr('transform', 'translate(' + [this.dim.padding.left, this.dim.padding.top] + ')')
	      		.call(zoom);

			this.colorAxis();
		}
  	}

  	private colorAxis() {
  		// coloring
      	const color = (this.settings.app.theme === 'dark') ? '#fff' : '#000';
      	this.svg.selectAll('.axis path').style('stroke', color);
      	this.svg.selectAll('.axis line').style('stroke', color);
      	this.svg.selectAll('.axis text').style('fill', color);
  	}

  	private zoomed() {
  		// rescale axis
		this.xAxis.call(this.xScale.scale(d3.event.transform.rescaleX(this.x)));
		if (this.bool_data_zoomBothAxis) {
			this.yAxis.call(this.yScale.scale(d3.event.transform.rescaleY(this.y)));
		}

		const selector = [
				'.' + this.arr_data_chartType[0],
				(this.data_reading2 !== '' ? '.' + this.arr_data_chartType2[0] : null)
			].filter((el) => el != null).join(',');

		if ( selector.match(/(bar|line|area)/) ) {
			this.svg.select('.focus').selectAll(selector)
				.attr('transform', 'translate(' + [d3.event.transform.x, (this.bool_data_zoomBothAxis ? d3.event.transform.y : 0)] + ') scale(' + [d3.event.transform.k, (this.bool_data_zoomBothAxis ? d3.event.transform.k : 1)] + ')');

			// extra for line dots
			if (selector.indexOf('line') !== -1) {
				this.svg.select('.focus').selectAll('.dot')
				.attr('transform', 'translate(' + [d3.event.transform.x, (this.bool_data_zoomBothAxis ? d3.event.transform.y : 0)] + ') scale(' + [d3.event.transform.k, (this.bool_data_zoomBothAxis ? d3.event.transform.k : 1)] + ')');
			}
		}
		this.colorAxis();
	}

  	private getSize(el) {
    	const elem = this.ref.nativeElement.querySelector(el);
    	return {
    	  	width: (this.width) ? parseInt(this.width) : elem.clientWidth,
    	  	height: (this.height) ? parseInt(this.height) : elem.clientHeight
    	};
  	}

	private createBARchart(read, index) {
  		this.svg.select('.chart').selectAll('.bar')
  			.data(this.data[read]).enter().append('rect')
  			.attr('class', 'bar')
			.style('fill', this.colorSet[index])
			.attr('x', d => this.x(d.date))
			.attr('width', this.dim.content.width / this.data[read].length )
			// animate
				.attr('y',  d => this.dim.content.height)
				.attr('height', 0)
				.transition()
	        	.duration(600)
			.attr('y',  d => this.y(d.value))
			.attr('height', d => this.dim.content.height - this.y(d.value));
	}

	private createLINEchart(read, index) {
		const line = d3.line()
      		.x((d:any) => this.x(d.date))
      		.y((d:any) => this.y(d.value))
      		.curve(d3.curveMonotoneX);

  const line0 = d3.line()
      		.x((d:any) => this.x(d.date))
      		.y((d) => this.y(0))
      		.curve(d3.curveMonotoneX);

  this.svg.select('.chart')
      		.append('path').datum(this.data[read])
      		.attr('class', 'line')
      		.attr('fill', 'none')
      		.attr('stroke', this.colorSet[index])
      		.attr('stroke-linejoin', 'round')
      		.attr('stroke-linecap', 'round')
      		.attr('stroke-width', 1.5)
        		.attr('d', line0)
        		.transition()
        		.duration(600)
      		.attr('d', line);

  this.svg.select('.chart')
      		.selectAll('.dot')
      		.data(this.data[read]).enter().append('circle')
      		.attr('class', 'dot')
      		.attr('fill', this.colorSet[index])
      		.attr('r', 4)
      		.attr('cx', d => this.x(d.date))
        		.attr('cy', d => this.y(0))
        		.transition()
        		.duration(600)
      		.attr('cy', d => this.y(d.value));
	}

	private createAREAchart(read, index) {
		this.svg.select('.chart').append('path')
			.datum(this.data[read])
			.attr('class', 'area')
			.attr('fill', this.colorSet[index])
			.attr('fill-opacity', '0.7')
			.attr('stroke', this.colorSet[index + 1])
			.attr('stroke-width', 1.5)
				.attr('d', d3.area()
					.x((d:any) => this.x(d.date))
					.y0(this.y(0))
					.y1(d => this.y(0))
				)
				.transition()
        		.duration(600)
			.attr('d', d3.area()
				.x((d:any) => this.x(d.date))
				.y0(this.y(0))
				.y1((d:any) => this.y(d.value))
			);
	}

	private createGAUGEchart(read, index) {
		const value = d3.mean(this.data[read], (d:any) => d.value);
		const minValue = 0;
	  	const maxValue:any = (this.data_maxY !== '' ? parseInt(this.data_maxY) : d3.max(this.data[read].map((d) => d.value)));

	  	const radius = Math.min(this.dim.svg.width - 40, this.dim.svg.height - 40) / 2;
	  	const locationX = this.dim.svg.width / 2;
	  	const locationY = this.dim.svg.height / 2;
	  	const textPixels = (radius / 2);
	  	const textRounder = (value) => Math.round(value);
	  	const animateTime = 1000;

	  	const fill = Math.max(minValue, Math.min(maxValue, value)) / maxValue;

	  	const group = this.svg.append('g').attr('transform', 'translate(' + locationX + ',' + locationY + ')');
	  	const arc = d3.arc().innerRadius(radius - 10).outerRadius(radius).startAngle(0);
	  	const ring1 = d3.arc().innerRadius(radius + 18).outerRadius(radius + 20).startAngle(0);
	 	const ring2 = d3.arc().innerRadius(radius - 1).outerRadius(radius + 11).startAngle(0);

	 	group.append('path').datum({endAngle: 2 * Math.PI}).style('fill', '#ffffff').attr('fill-opacity', 0.3).attr('d', arc);
	 	group.append('path').datum({endAngle: 2 * Math.PI}) .style('stroke-opacity', 0.1).style('opacity', 0.1).style('fill', '#ffffff').attr('d', ring2);
	 	group.append('path').datum({endAngle: 2 * Math.PI}).style('stroke-opacity', 0.3).style('opacity', 0.3).style('fill', '#ffffff').attr('d', ring1);

	 	const foreground = group.append('path').datum({endAngle: 0 }).style('fill', '#A4DBf8').attr('d', arc);

	 	if (value) {
	   		const toPercent = 1 - (Math.max(minValue, Math.min(maxValue, 100 - value)) / maxValue);
		   	const arcTween = (newAngle) => {
	      		return (d) => {
	      			const i = d3.interpolate(d.endAngle, newAngle);
	      			return (t) => {
	      				d.endAngle = i(t);
	      				const path = arc(d);
	          return path;
	      			};
	      		};
	      	};

		   	foreground.transition()
		   	.duration(1000)
	      	.attrTween('d', arcTween( toPercent * (2 * Math.PI)));

		   	// text
		   	const text1 = group.append('text')
	            .attr('text-anchor', 'middle')
	            .attr('font-size', textPixels + 'px')
	            .style('fill', '#A4DBf8')
	            .attr('transform', 'translate(' + 0 + ',' + textPixels / 4 + ')');

		   	const transition = (from, to, riseWave, animateText) => {
		        if (animateText) {
		            const textTween = () => {
		                const i  = d3.interpolate(from, to);
		                return (t) => {
		                    text1.text(textRounder(i(t)) + this.data_labelExtension);
		                };
		            };
		            text1.transition()
		                .duration(animateTime)
		                .tween('text', textTween);
		        }
		    };
		    transition(0, value, true && true, true && true);
	   	}
	}

	private createLIQUIDGAUGEchart(read, index) {
		const value = d3.mean(this.data[read], (d:any) => d.value),
		minValue = 0, // The gauge minimum value.
        maxValue:any = (this.data_maxY !== '' ? parseInt(this.data_maxY) : d3.max(this.data[read].map((d) => d.value))), // The gauge maximum value.

        // Styles
        circleThicknessConfig = 0.05, // The outer circle thickness as a percentage of it's radius.
        circleFillGapConfig = 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
        circleColor = '#014469', // The color of the outer circle.
        backgroundColor = 'gray', // The color of the background
        waveColor = '#014469', // The color of the fill wave.

        // Waves
        waveHeightConfig = 0.09, // The wave height as a percentage of the radius of the wave circle.
        waveCount = 3, // The number of full waves per width of the wave circle.
        waveOffset = 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.

        // Animations
        waveRiseTime = 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
        waveAnimateTime = 5000, // The amount of time in milliseconds for a full wave to enter the wave circle.

        // Text
        textVertPosition = 0.5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
        textSize = 1, // The relative height of the text to display in the wave circle. 1 = 50%
        displayPercent = true, // If true, a % symbol is displayed after the value.
        textColor = '#045681', // The color of the value text when the wave does not overlap it.
        waveTextColor = '#A4DBf8'; // The color of the value text when the wave overlaps it.

  const gauge = this.svg;
  const radius = Math.min(this.dim.svg.width, this.dim.svg.height) / 2;
  const locationX = this.dim.svg.width / 2 - radius;
  const locationY = this.dim.svg.height / 2 - radius;
  const fillPercent = Math.max(minValue, Math.min(maxValue, value)) / maxValue;
  const waveHeightScale = d3.scaleLinear().range([waveHeightConfig, waveHeightConfig]).domain([0, 100]);
  const textPixels = (textSize * radius / 2);
  const textFinalValue = Math.round(value);
  const circleThickness = circleThicknessConfig * radius;
  const circleFillGap = circleFillGapConfig * radius;
  const fillCircleMargin = circleThickness + circleFillGap;
  const fillCircleRadius = radius - fillCircleMargin;
  const waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);
  const waveLength = fillCircleRadius * 2 / waveCount;
  const waveClipCount = 1 + waveCount;
  const waveClipWidth = waveLength * waveClipCount;
  const textRounder = (value) => Math.round(value);
  const data = [];
  for (let i = 0; i <= 40 * waveClipCount; i++) {data.push({x: i / (40 * waveClipCount), y: (i / (40))}); }
        // Scales for drawing the outer circle.
  const gaugeCircleX = d3.scaleLinear().range([0, 2 * Math.PI]).domain([0, 1]);
  const gaugeCircleY = d3.scaleLinear().range([0, radius]).domain([0, radius]);
        // Scales for controlling the size of the clipping path.
  const waveScaleX = d3.scaleLinear().range([0, waveClipWidth]).domain([0, 1]);
  const waveScaleY = d3.scaleLinear().range([0, waveHeight]).domain([0, 1]);
        // Scales for controlling the position of the clipping path.
  const waveRiseScale = d3.scaleLinear().range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)]).domain([0, 1]);
  const waveAnimateScale = d3.scaleLinear().range([0, waveClipWidth - fillCircleRadius * 2]).domain([0, 1]);
        // Scale for controlling the position of the text within the gauge.
  const textRiseScaleY = d3.scaleLinear().range([fillCircleMargin + fillCircleRadius * 2, (fillCircleMargin + textPixels * 0.7)]).domain([0, 1]);
  const gaugeGroup = gauge.append('g').attr('transform', 'translate(' + locationX + ',' + locationY + ')');
        // Background Circle
  gaugeGroup.append('circle').attr('r', radius).attr('class', 'gauge-outer-circle').attr('transform', 'translate(' + radius + ', ' + radius + ')');
  const gaugeCircleArc = d3.arc().startAngle(gaugeCircleX(0)).endAngle(gaugeCircleX(1)).outerRadius(gaugeCircleY(radius)).innerRadius(gaugeCircleY(radius - circleThickness));
  gaugeGroup.append('path').attr('d', gaugeCircleArc).style('fill', circleColor).attr('transform', 'translate(' + radius + ', ' + radius + ')');
        // Text where the wave does not overlap.
  const text1 = gaugeGroup.append('text')
            .attr('class', 'liquidFillGaugeText')
            .attr('text-anchor', 'middle')
            .attr('font-size', textPixels + 'px')
            .style('fill', textColor)
            .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(textVertPosition) + ')');
  if (value) {
        	const clipArea = d3.area()
	            .x((d:any) => waveScaleX(d.x) )
	            .y0((d:any) => waveScaleY(Math.sin(Math.PI * 2 * waveOffset * -1 + Math.PI * 2 * (1 - waveCount) + d.y * 2 * Math.PI)) )
	            .y1((d) => (fillCircleRadius * 2 + waveHeight) );
	        const gaugeGroupDefs = gaugeGroup.append('defs');
	        const waveGroup = gaugeGroupDefs.append('clipPath').attr('id', this.UID);
        	const wave = waveGroup.append('path').datum(data).attr('d', clipArea);
        	const fillCircleGroup = gaugeGroup.append('g').attr('clip-path', 'url(#' + this.UID + ')');
        	fillCircleGroup.append('circle').attr('cx', radius).attr('cy', radius).attr('r', fillCircleRadius).style('fill', waveColor);
	        const text2 = fillCircleGroup.append('text')
	            .attr('class', 'liquidFillGaugeText')
	            .attr('text-anchor', 'middle')
	            .attr('font-size', textPixels + 'px')
	            .style('fill', waveTextColor)
	            .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(textVertPosition) + ')');
	        const waveGroupXPosition = fillCircleMargin + fillCircleRadius * 2 - waveClipWidth;
	        const animateWave = () => {
	            wave.transition()
	            .duration(waveAnimateTime)
	            .ease(d3.easeLinear)
	            .attr('transform', 'translate(' + waveAnimateScale(1) + ',0)')
	            .on('end', () => {
	                wave.attr('transform', 'translate(' + waveAnimateScale(0) + ',0)');
	                animateWave();
	            });
	        };
	        animateWave();
	        const transition = (from, to, riseWave, animateText) => {
	            if (animateText) {
	                const textTween = () => {
	                    const i  = d3.interpolate(from, to);
	                    return (t) => {
	                        text1.text(textRounder(i(t)) + this.data_labelExtension);
	                        text2.text(textRounder(i(t)) + this.data_labelExtension);
	                    };
	                };
	                text1.transition()
	                    .duration(waveRiseTime)
	                    .tween('text', textTween);
	                text2.transition()
	                    .duration(waveRiseTime)
	                    .tween('text', textTween);
	            }
	            const toPercent = Math.max(minValue, Math.min(maxValue, 100 - to)) / maxValue;
	            const fromPercent = Math.max(minValue, Math.min(maxValue, from)) / maxValue;
	            if (riseWave) {
	                waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fromPercent) + ')')
	                    .transition().duration(waveRiseTime)
	                    .attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(toPercent) + ')');
	            }
	        };
	        transition(0, textFinalValue, true, true );
        }
	}
}
