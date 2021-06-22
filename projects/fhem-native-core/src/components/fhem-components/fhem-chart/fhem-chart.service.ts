import { Injectable, ElementRef } from '@angular/core';

import { ComponentLoaderService } from '../../../services/component-loader.service';

import * as d3 from 'd3';

@Injectable({ providedIn: 'any' })
export class ChartService {
	// content paddings
	private paddings: {[key: string]: number} = {
		top: 20, right: 30, bottom: 30, left: 40
	};

	// main chart ref
	private chart: any;
	// content dimensions
	private contentDims: {w: number, h: number} = {w: 0, h: 0};
	// unique ID for clip path
	private chartID: string = '_' + Math.random().toString(36).substr(2, 9);
	// chart data
	private data: any;
	private dates: any;

	private forAxis: string[] = ['left'];
	private timeFormat: string = '%Y-%m-%d';
	private chartColors: string[] = [];
	private aggregation: string[] = [];

	// references during creation
	private leftMinY: number = 0;
	private leftMaxY: number = 0;
	private rightMinY: number = 0;
	private rightMaxY: number = 0;

	private leftExtension: string = '';
	private rightExtension: string = '';
	private labelExtension: string[] = [''];

	private displayLabels: boolean[] = [];

	private x: any;
	private xScale: any;
	private xAxis: any;
	private xBand: any

	private leftY: any;
	private leftYScale: any;
	private leftYAxis: any;

	private rightY: any;
	private rightYScale: any;
	private rightYAxis: any;

	private zoomSelectors: string = '';

	constructor(private componentLoader: ComponentLoaderService){}

	// init chart values
	public init(timeFormat: string, forAxis: string[], displayLabels: boolean[], leftMinY: number, leftMaxY: number, rightMinY: number, 
		rightMaxY: number, leftExtension: string, rightExtension: string, labelExtension: string[], colors: string[], aggregation: string[]): void{
		this.timeFormat = timeFormat;
		this.forAxis = forAxis;
		this.displayLabels = displayLabels;

		this.leftMinY = leftMinY;
		this.leftMaxY = leftMaxY;

		this.rightMinY = rightMinY;
		this.rightMaxY = rightMaxY;

		this.leftExtension = leftExtension;
		this.rightExtension = rightExtension;
		this.labelExtension = labelExtension;

		this.chartColors = colors;
		this.aggregation = aggregation;
	}

	// create chart
	public createCharts(ref: HTMLElement, types: string[], dims: {w: number, h: number}, data: any, dates: any): void{
		this.data = data;
		this.dates = dates;
		// remove existing svg
		let svg = d3.select(ref).select('svg').remove();
		// create fresh svg
		this.chart = d3.select(ref).append('svg').attr('width', dims.w).attr('height', dims.h);
		// create chart content dimensions
		this.buildContentDimensions(dims);
		// create content of svg chart
		this.buildChartContent(types);
		// build Charts
		types.forEach((type: string, index: number)=>{
			this.createSingleChart(types, type, index);
		});
		// build zoom selectors
		this.zoomSelectors = [...new Set(types.map(x=> '.' + x))].join(',');
	}

	private buildContentDimensions(dims: {w: number, h: number}): void{
		this.contentDims.w = dims.w - this.paddings.left - this.paddings.right;
		this.contentDims.h = dims.h - this.paddings.top - this.paddings.bottom;
	}

	// relevant chart content
	private buildChartContent(types: string[]): void{
		if(types.join('').match(/(bar|line|area)/)){
			// create clip path
			this.chart.append('defs').append('clipPath')
				.attr('id', this.chartID)
				.append('rect')
				.attr('width', this.contentDims.w)
				.attr('height', this.contentDims.h);

			// create focus area
			this.buildFocus();
			// build axis
			this.buildAxis();
		}
	}

	// focus for movements
	private buildFocus(): void{
		this.chart.append('g').attr('class', 'focus').attr('transform', 'translate(' + this.paddings.left + ',' + this.paddings.top + ')');

		this.chart.select('.focus').append('g').attr('clip-path', 'url(#' + this.chartID + ')').attr('class', 'chart');
	}

	// chart axis
	private buildAxis(): void{
		// X Axis
		this.x = d3.scaleTime().rangeRound([0, this.contentDims.w])
			.domain([ d3.min(this.dates) as unknown as number, d3.max(this.dates) as unknown as number ])

		// x axis ticks
		const xTicks: number = Math.min(this.data[[0][0]].length, Math.floor(this.contentDims.w / 100));

		// draw x axis
		this.xScale = d3.axisBottom(this.x)
			.tickFormat((d: any) => d3.timeFormat(this.timeFormat)(d) )
			.tickSizeOuter(0)
			.ticks(xTicks);

		this.xAxis = this.chart.selectAll('.focus').append('g').attr('class', 'x axis')
			.attr('transform', 'translate(' + [0, this.contentDims.h] + ')')
			.call(this.xScale);

		// get bandWidth
		this.xBand = d3.scaleBand().domain( d3.range(-1, this.dates.length) as any )
			.paddingInner(0.1)
			.paddingOuter(0.2)
			.align(0.5)
			.round(true)
			.range([0, this.contentDims.w]);

		// get the readings for left and right y axis
		let leftYMinData: number[] = [];
		let leftYMaxData: number[] = [];

		let rightYMinData: number[] = [];
		let rightYMaxData: number[] = [];

		this.forAxis.forEach((axis: string, i: number)=>{
			if(axis === 'left'){
				let min = d3.min(this.data[i].map((x: any)=> x.value));
				let max = d3.max(this.data[i].map((x: any)=> x.value));

				leftYMinData.push(min as unknown as number);
				leftYMaxData.push(max as unknown as number);
			}else{
				let min = d3.min(this.data[i].map((x: any)=> x.value));
				let max = d3.max(this.data[i].map((x: any)=> x.value));

				rightYMinData.push(min as unknown as number);
				rightYMaxData.push(max as unknown as number);
			}
		});
		// check axis
		if(leftYMinData.length > 0){
			// draw left axis
			this.leftY = d3.scaleLinear().range([this.contentDims.h, 0])
				.domain([
					this.leftMinY !== 0 ? this.leftMinY : d3.min(leftYMinData) as number,
					this.leftMaxY !== 0 ? this.leftMaxY : d3.max(leftYMaxData) as number
				]);

			this.leftYScale = d3.axisLeft(this.leftY).tickFormat(d=> d + this.leftExtension);

			this.leftYAxis = this.chart.selectAll('.focus').append('g').attr('class', 'y axis left').call(this.leftYScale);
		}

		if(rightYMinData.length > 0){
			// draw right axis
			this.rightY = d3.scaleLinear().range([this.contentDims.h, 0]).domain([
				this.rightMinY !== 0 ? this.rightMinY : d3.min(rightYMinData) as number,
				this.rightMaxY !== 0 ? this.rightMaxY : d3.max(rightYMaxData) as number
			]);

			this.rightYScale = d3.axisRight(this.rightY).tickFormat(d=> d + this.rightExtension);

			this.rightYAxis = this.chart.selectAll('.focus').append('g').attr('class', 'y axis right')
				.attr('transform', 'translate(' + [this.contentDims.w, 0] + ')')
				.call(this.rightYScale);
		}

		// create zoom content
		this.createZoomContent()
	}

	private createZoomContent(): void{
		const zoom = d3.zoom()
			.extent([[0, this.paddings.top], [this.contentDims.w, this.contentDims.h]])
			.scaleExtent([0.9, 10])
			.translateExtent([[0, this.paddings.top], [this.contentDims.w, this.contentDims.h]])
			.on('zoom', (event: any)=>{
				this.zoomed(event)
			});

		this.chart.append('rect').attr('class', 'zoom')
			.attr('width', this.contentDims.w)
			.attr('height', this.contentDims.h)
			.attr('fill', 'transparent')
			.attr('transform', 'translate(' + [this.paddings.left, this.paddings.top] + ')')
			.call(zoom);
	}

	// zoom behaviour
	private zoomed(event: any): void{
		// rescale axis
		const newXscale = event.transform.rescaleX(this.x);
		this.xAxis.call(this.xScale.scale(newXscale));

		// chart zoom
		if(this.zoomSelectors.match(/(bar|line|area)/)){
			this.chart.select('.focus').selectAll(this.zoomSelectors)
				.attr('transform', 'translate(' + [event.transform.x, 0] + ') scale(' + [event.transform.k, 1] + ')');

			// move labels
			this.chart.selectAll('.label').attr('x', (d: any)=>{
				return newXscale(d.date) - (this.xBand.bandwidth() / 2)
			});
		}
	}

	// aggregate single dataset
	// aggregations:
		// sum
		// mean
		// median
		// min
		// max
		// variance
		// deviation
	public aggregateDataset(data: any, aggregation: string): any{
		return (d3 as any)[aggregation](data, (d: any)=>{return d.value}) as any;
	}

	// color getter
	private getColor(index: number): string|string[]{
		let colors: string|string[] = this.chartColors[index];
		let res: string|string[];
		if(Array.isArray(colors)){
			// UID for svg gradient
			const UID: string = '_' + Math.random().toString(36).substr(2, 9);

			let gradient = this.chart.select('defs')
				.append('svg:linearGradient')
				.attr("id", UID)
				.attr("x1", "0%")
				.attr("y1", "0%")
				.attr("x2", "0%")
				.attr("y2", "100%")
				.attr("spreadMethod", "pad");

			const p: number = 100 / colors.length;

			colors.forEach((color: string, index: number)=>{
				const offset: string = (index === colors.length -1) ? '100%' : (index * p) + '%';
				gradient.append("svg:stop")
					.attr("offset", offset)
					.attr("stop-color", color)
					.attr("stop-opacity", 1);
			});
			res = 'url(#'+UID+')';
		}else{
			res = colors;
		}
		return res;
	}


	private createSingleChart(types: string[], type: string, index: number){
		// dynamic import of chart type
		const chart: string = type.toUpperCase();
		// create the chart
		(this as any)['create' + chart + 'chart'](types, index);
		// create labels if needed
		if(type.match(/(bar|line|area)/) && this.displayLabels[index]){
			this.createLabels(index);
		}
	}

	// create labels for specific chart type
	private createLabels(index: number): void{
		const axis: string = this.forAxis[index];
		this.chart.select('.chart').selectAll('.g')
			.data(this.data[index]).enter()
			.append("text")
			.attr("class","label")
			.attr("fill", '#ddd')
			.attr("font-size", '14px')
			.attr('x', (d: any) => this.x(d.date) - this.xBand.bandwidth())
			.attr('y',  (d: any) => (axis === 'left' ? this.leftY(d.value) : this.rightY(d.value)) + this.paddings.top / 2)
			.text((d: any)=> Math.round(d.value) + this.labelExtension[index]);   
	}

	// CHART TYPES
	// bar chart
	private createBARchart(allTyles: string[], index: number): void {
		const axis: string = this.forAxis[index];
		const totalBarcharts: number = allTyles.filter(x=> x === 'bar').length;
		const color: string|string[] = this.getColor(index);

		this.chart.select('.chart').selectAll('.g')
			.data(this.data[index]).enter()
			.append('rect')
			.attr('class', 'bar')
			.style('opacity', totalBarcharts > 1 ? 0.7 : 1.0)
			.style('fill', color)
			.attr('x', (d: any) => this.x(d.date) )
			.attr('width', this.xBand.bandwidth() )
				// animate
				.attr('y', () => this.contentDims.h)
				.attr('height', 0)
				.transition()
				.duration(600)
			.attr('y',  (d: any) => axis === 'left' ? this.leftY(d.value) : this.rightY(d.value))
			.attr('height', (d: any) => this.contentDims.h - (axis === 'left' ? this.leftY(d.value) : this.rightY(d.value)) );
	}

	// line chart
	private createLINEchart(allTyles: string[], index: number): void {
		const axis: string = this.forAxis[index];
		const color: string|string[] = this.getColor(index);

		const line = d3.line()
			.x((d:any) => this.x(d.date))
			.y((d:any) => axis === 'left' ? this.leftY(d.value) : this.rightY(d.value))

		const line0 = d3.line()
			.x((d:any) => this.x(d.date))
			.y(axis === 'left' ? this.leftY(d3.min(this.data[index].map((x: any)=> x.value))) : this.rightY(d3.min(this.data[index].map((x: any)=> x.value))))

		this.chart.select('.chart')
			.append('path')
			.datum(this.data[index])
			.attr('class', 'line')
			.attr('fill', 'none')
			.attr('stroke', color)
			.attr('stroke-linejoin', 'round')
			.attr('stroke-linecap', 'round')
			.attr('stroke-width', 1.5)
				.attr('d', line0)
				.transition()
				.duration(600)
			.attr('d', line);
	}

	// area chart
	private createAREAchart(allTyles: string[], index: number): void {
		const axis: string = this.forAxis[index];
		const color: string|string[] = this.getColor(index);

		this.chart.select('.chart')
			.append('path')
			.datum(this.data[index])
			.attr('class', 'area')
			.attr('fill', color)
			.attr('fill-opacity', '0.7')
			.attr('stroke', color)
			.attr('stroke-width', 1.5)
				.attr('d', d3.area()
					.x((d:any) => this.x(d.date))
					.y0( axis === 'left' ? this.leftY(0) : this.rightY(0) )
					.y1(d => axis === 'left' ? this.leftY(d3.min(this.data[index].map((x: any)=> x.value))) : this.rightY(d3.min(this.data[index].map((x: any)=> x.value))))
				)
				.transition()
				.duration(600)
			.attr('d', d3.area()
				.x((d:any) => this.x(d.date))
				.y0(axis === 'left' ? this.leftY(0) : this.rightY(0))
				.y1((d:any) => axis === 'left' ? this.leftY(d.value) : this.rightY(d.value))
			);
	}

	// Gauge Chart
	private createGAUGEchart(allTyles: string[], index: number): void {
		// get relevant values
		const value: any = this.aggregateDataset(this.data[index], this.aggregation[index]);
		const minValue: number = d3.min(this.data[index].map((d: any)=> d.value)) as unknown as number;
		const maxValue: number = d3.max(this.data[index].map((d: any)=> d.value)) as unknown as number;

		const radius: number = Math.min(this.contentDims.w, this.contentDims.h) / 2;
		const locationX: number = (this.contentDims.w + this.paddings.left + this.paddings.right) / 2;
		const locationY: number = (this.contentDims.h + this.paddings.top + this.paddings.bottom) / 2;
		const textPixels: number = (radius / 2);

		const textRounder = (value: number): number => Math.round(value);

		const group = this.chart.append('g').attr('transform', 'translate(' + locationX + ',' + locationY + ')');

		const arc = d3.arc().innerRadius(radius - 10).outerRadius(radius).startAngle(0);
		const ring1 = d3.arc().innerRadius(radius + 18).outerRadius(radius + 20).startAngle(0);
		const ring2 = d3.arc().innerRadius(radius - 1).outerRadius(radius + 11).startAngle(0);

		group.append('path').datum({endAngle: 2 * Math.PI}).style('fill', '#ffffff').attr('fill-opacity', 0.3).attr('d', arc);
		group.append('path').datum({endAngle: 2 * Math.PI}) .style('stroke-opacity', 0.1).style('opacity', 0.1).style('fill', '#ffffff').attr('d', ring2);
		group.append('path').datum({endAngle: 2 * Math.PI}).style('stroke-opacity', 0.3).style('opacity', 0.3).style('fill', '#ffffff').attr('d', ring1);

		const foreground = group.append('path').datum({endAngle: 0 }).style('fill', '#A4DBf8').attr('d', arc);

		if(!isNaN(value)){
			const toPercent: number = 1 - ( (value - minValue) / (maxValue - minValue) );

			const arcTween = (newAngle: number) => {
				return (d: any) => {
					const i = d3.interpolate(d.endAngle, newAngle);
					return (t: any) => { 
						d.endAngle = i(t);
						const path = arc(d);
						return path;
					};
				};
			};

			foreground.transition().duration(1000).attrTween('d', arcTween( toPercent * (2 * Math.PI)));

			// text
			const text1 = group.append('text')
				.attr('text-anchor', 'middle')
				.attr('font-size', textPixels + 'px')
				.style('fill', '#A4DBf8')
				.attr('transform', 'translate(' + 0 + ',' + textPixels / 4 + ')');

			const transition = (from: number, to: number) => {
				const textTween = () => {
					const i  = d3.interpolate(from, to);
					return (t: any) => {
						text1.text(textRounder(i(t)) + this.labelExtension[index]);
					};
				};
				text1.transition()
					.duration(1000)
					.tween('text', textTween);
			};
			transition(0, value);
		}
	}

	// Gauge Chart
	private createLIQUIDGAUGEchart(allTyles: string[], index: number): void {
		// get relevant values
		const value: any = this.aggregateDataset(this.data[index], this.aggregation[index]);
		const minValue: number = d3.min(this.data[index].map((d: any)=> d.value)) as unknown as number;
		const maxValue: number = d3.max(this.data[index].map((d: any)=> d.value)) as unknown as number;

		// Styles
		const circleThicknessConfig: number = 0.05;
		const circleFillGapConfig: number = 0.05;
		const circleColor: string = '#014469';
		const backgroundColor: string = 'gray'
		const waveColor: string = '#014469';

		// Waves
		const waveHeightConfig: number = 0.09;
		const waveCount: number = 3;
		const waveOffset: number = 0;

		// Animations
		const waveRiseTime: number = 1000;
		const waveAnimateTime: number = 5000;

		// Text
		const textVertPosition: number = 0.5;
		const textSize: number = 1;
		const waveTextColor: string = '#A4DBf8';

		const radius: number = Math.min(this.contentDims.w, this.contentDims.h) / 2;
		const locationX: number = (this.contentDims.w + this.paddings.left + this.paddings.right) / 2 - radius;
		const locationY: number = (this.contentDims.h + this.paddings.top + this.paddings.bottom) / 2 - radius;

		const fillPercent: number = 1 - ( (value - minValue) / (maxValue - minValue) );
		const waveHeightScale = d3.scaleLinear().range([waveHeightConfig, waveHeightConfig]).domain([0, 100]);
		const textPixels: number = (textSize * radius / 2);
		const textFinalValue: number = Math.round(value);
		const circleThickness: number = circleThicknessConfig * radius;
		const circleFillGap: number = circleFillGapConfig * radius;
		const fillCircleMargin: number = circleThickness + circleFillGap;
		const fillCircleRadius: number = radius - fillCircleMargin;
		const waveHeight: number = fillCircleRadius * waveHeightScale(fillPercent);

		const waveLength: number = fillCircleRadius * 2 / waveCount;
		const waveClipCount: number = 1 + waveCount;
		const waveClipWidth: number = waveLength * waveClipCount;
		const textRounder = (value: number) => Math.round(value);

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
		const gaugeGroup = this.chart.append('g').attr('transform', 'translate(' + locationX + ',' + locationY + ')');

		// Background Circle
		gaugeGroup.append('circle').attr('r', radius).attr('class', 'gauge-outer-circle').attr('transform', 'translate(' + radius + ', ' + radius + ')');
		const gaugeCircleArc = d3.arc().startAngle(gaugeCircleX(0)).endAngle(gaugeCircleX(1)).outerRadius(gaugeCircleY(radius)).innerRadius(gaugeCircleY(radius - circleThickness));
		gaugeGroup.append('path').attr('d', gaugeCircleArc).style('fill', circleColor).attr('transform', 'translate(' + radius + ', ' + radius + ')');

		// Text where the wave does not overlap.
		const text1 = gaugeGroup.append('text')
			.attr('class', 'liquidFillGaugeText')
			.attr('text-anchor', 'middle')
			.attr('font-size', textPixels + 'px')
			.style('fill', this.chartColors[index])
			.attr('transform', 'translate(' + radius + ',' + textRiseScaleY(textVertPosition) + ')');

		if(!isNaN(value)){
			const clipArea = d3.area().x((d:any) => waveScaleX(d.x) )
				.y0((d:any) => waveScaleY(Math.sin(Math.PI * 2 * waveOffset * -1 + Math.PI * 2 * (1 - waveCount) + d.y * 2 * Math.PI)) )
				.y1(() => (fillCircleRadius * 2 + waveHeight) );

			const gaugeGroupDefs = gaugeGroup.append('defs');
			const waveGroup = gaugeGroupDefs.append('clipPath').attr('id', this.chartID);
			const wave = waveGroup.append('path').datum(data).attr('d', clipArea);
			const fillCircleGroup = gaugeGroup.append('g').attr('clip-path', 'url(#' + this.chartID + ')');
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
			const transition = (from: number, to: number) => {
				const textTween = () => {
					const i  = d3.interpolate(from, to);
					return (t: any) => {
						text1.text(textRounder(i(t)) + this.labelExtension[index]);
						text2.text(textRounder(i(t)) + this.labelExtension[index]);
					};
				};
				text1.transition()
					.duration(waveRiseTime)
					.tween('text', textTween);
				text2.transition()
					.duration(waveRiseTime)
					.tween('text', textTween);

				waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(0) + ')')
					.transition().duration(waveRiseTime)
					.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')');
			};
			transition(0, textFinalValue);
		}
	}
}







