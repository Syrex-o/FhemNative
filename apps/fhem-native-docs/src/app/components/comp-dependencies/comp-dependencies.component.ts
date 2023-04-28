import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { ThemeService } from '@fhem-native/services';
import { ResizeManagerModule } from '@fhem-native/directives';
import { ComponentDependency } from '@fhem-native/types/components';

import * as d3 from 'd3';
import { SimulationNodeDatum } from 'd3';

interface Node extends SimulationNodeDatum {
    id: number,
    name: string,
    depth: number,
    depthIndex: number,
    dependsOn: number[]
}

interface Link {
    source: number,
    target: number
}

@Component({
    standalone: true,
	selector: 'fhem-native-docs-comp-dependencies',
	template: `
        <div class="dependency-wrapper" #WRAPPER fhemNativeResizeManager (resized)="resized()">
            <svg></svg>
        </div>
    `,
    styleUrls: ['./comp-dependencies.component.scss'],
    imports: [ ResizeManagerModule ]
})
export class ComponentDependencyComponent implements AfterViewInit, OnChanges{
    @ViewChild('WRAPPER', {static: false, read: ElementRef}) dependencyWrapper: ElementRef|undefined;

    @Input() componentName: string|undefined;
    @Input() dependencies: Record<string, ComponentDependency>|undefined;

    tree: {nodes: Node[], links: Link[]} = { nodes: [], links: [] };

    private width = 857;
    private height = 600;

    private textColor = this.theme.getThemeColor('--text-a');
    private linkColor = '#3dbbed';

    constructor(private theme: ThemeService, private translate: TranslateService){}

    ngAfterViewInit(): void {
        this.getTreeData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if('dependencies' in changes && this.dependencyWrapper) this.getTreeData();
    }

    resized(): void{
        this.getTreeData();
    }

    private getTreeData(): void{
        if(!this.dependencies) return;

        this.tree.nodes = [];
        this.tree.links = [];

        const wrapper: DOMRect|undefined = this.dependencyWrapper?.nativeElement.getBoundingClientRect();
        if(wrapper) this.width = wrapper.width;

        let index0 = 0, index1 = 0, index2 = 0;
        for(const [key, value] of Object.entries(this.dependencies)){
            this.tree.nodes.push({
                id: this.tree.nodes.length,
                name: key,
                depth: 0,
                depthIndex: index0,
                dependsOn: []
            });
            index0 += 1;

            for(let i = 0; i < value.dependOn.length; i++){
                const dependOnVar = value.dependOn[i];
                const dependOnValue = value.value[i].toString();

                // dependOn node
                const dependOnNode = this.tree.nodes.find(x=> x.name === dependOnVar);
                if(!dependOnNode){
                    this.tree.nodes.push({
                        id: this.tree.nodes.length,
                        name: dependOnVar,
                        depth: 1,
                        depthIndex: index1,
                        dependsOn: [ this.tree.nodes.findIndex(x=> x.name === key) ]
                    });

                    index1 += 1;
                }else{
                    const i = this.tree.nodes.findIndex(x=> x.name === key && x.depth === 0);
                    if(!dependOnNode.dependsOn.includes(i)) dependOnNode.dependsOn.push(i);
                }

                // dependOn value node
                const dependOnValueNode = this.tree.nodes.find(x=> x.name === dependOnValue);
                if(!dependOnValueNode){
                    this.tree.nodes.push({
                        id: this.tree.nodes.length,
                        name: dependOnValue,
                        depth: 2,
                        depthIndex: index2,
                        dependsOn: [ this.tree.nodes.findIndex(x=> x.name === dependOnVar) ]
                    });

                    index2 += 1;
                }else{
                    const i = this.tree.nodes.findIndex(x=> x.name === dependOnVar);
                    if(!dependOnValueNode.dependsOn.includes(i)) dependOnValueNode.dependsOn.push(i)
                }
            }
        }
        this.tree.nodes.sort((a: any, b: any) => a.depth - b.depth);
        this.tree.nodes.forEach((node)=>{
            if(!node.dependsOn) return;

            node.dependsOn.forEach(index => {
                this.tree.links.push({ source: index, target: node.id });
            });
        });

        this.createTree();
    }

    private createTree(): void{
        const simulation = d3.forceSimulation(this.tree.nodes)
            .force(
                "link", d3.forceLink()
                .id(d => (d as Node).id)
                .links(this.tree.links)
                .distance(100)
                .strength(0.9)
            )
            .force("charge", d3.forceManyBody())
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force("x", d3.forceX(this.width / 2))
            .force("y", d3.forceY().y(node => this._calcPath(node as Node) * 200).strength(() => 2))
            .force("collide", d3.forceCollide(50));

        d3.select(".dependency-wrapper").selectAll("*").remove();

        function handleZoom(e: any) {
            svg.attr("transform", `translate(${e.transform.x},${e.transform.y}) scale(${e.transform.k})`);
        }
        
        const svgElem = d3.select(".dependency-wrapper")
            .append('svg')
            .attr("width", this.width)
            .attr("height", this.height)
            .attr('viewBox', [0, 0, this.width, this.height])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
            .call(d3.zoom().on("zoom", handleZoom) as any);
        
        const svg = svgElem.append('g');
    
        svgElem.append("defs")
            .append("marker")
                .attr("id", 'arrow')
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 20)
                .attr("refY", -1)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto")
            .append("path")
                .attr("fill", this.linkColor)
                .attr("d", "M0,-5L10,0L0,5");

        const link = svg.append("g")
            .attr("fill", "none")
            .attr("stroke-width", 1.5)
            .selectAll("path")
            .data(this.tree.links)
            .join("path")
            .attr("stroke", this.linkColor)
            .attr("marker-end", () => `url(#arrow)`);

        function handleDragStart(e: any){
            simulation.alphaTarget(0.1).restart();
            e.subject.fx = e.fx;
            e.subject.fy = e.fy;
        }

        function handleDrag(e: any){
            e.subject.fx = e.x;
            e.subject.fy = e.y;
            ticked();
        };

        function handleDragEnd(e: any){
            simulation.alphaTarget(0)
            e.subject.fx = null;
            e.subject.fy = null;
        }

        const drag = d3.drag()
            .on('start', handleDragStart)
            .on('drag', handleDrag)
            .on('end', handleDragEnd);

        const node = svg.selectAll(".nodes")
            .data(this.tree.nodes)
            .join('g')
            .attr("class", "nodes")
            .style('cursor', 'grab')
            .call(drag as any);
            
        node.append("circle")
            .attr("r", 10)
            .style("fill", d=> {
                if(d.depth === 0) return '#CBFFAE';
                if(d.depth === 1) return '#FFE6B0';
                return '#2f85ff';
            });

        node.append("text")
            .text(d => this.nameMapper(d.name))
            .style("font-size", "14px")
            .style("fill", this.textColor)
            .attr('x', 12)
            .attr("y", 12);

        const ticked = ()=>{
            link.attr("d", this.linkArc);
            node.attr("transform", d => `translate(${d.x}, ${d.y})`);
        }

        simulation.on('tick', ticked).alpha(0.3);
    }

    private linkArc(d: any) {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        return `
            M${d.source.x},${d.source.y}
            A${dr},${dr} 0 0,1 
            ${d.target.x},${d.target.y}
        `;
    }

    private nameMapper(name: string): string{
        const nameParts = name.split('.');

        // just value
        if(nameParts.length === 1) return nameParts[0];
        return this.translate.instant(`COMPONENTS.${this.componentName}.INPUTS.${nameParts[0]}.${nameParts[1]}.name`);
    }

    private _calcPath(node: Node|undefined, length = 1): number {
        // end case
        if (!node || !node.dependsOn || node.dependsOn.length < 1) return length;
    
        return Math.max(
            ...node.dependsOn.map(id =>
                this._calcPath(this.tree.nodes.find(n => n.id === id), length + 1)
            )
        );
    }
}