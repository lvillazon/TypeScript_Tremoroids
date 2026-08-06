// stars and the ground outline
import { Rock } from "./rocks";
import { Graphics, Container, type PointData } from "pixi.js";

export class Landscape {
    private displayLayer: Container;
    public outline: PointData[] = [];
    private groundHeight: number;
    private minimumHeight: number;
    private windowHeight: number;
    private surfaceLine = new Graphics();
    
    constructor(layer: Container, groundHeight: number, windowHeight: number) {
        this.displayLayer = layer;
        this.displayLayer.addChild(this.surfaceLine);
        this.groundHeight = groundHeight;
        this.windowHeight = windowHeight;
        this.minimumHeight = 40;
        this.outline.push({x: 0, y: groundHeight})
        // DEBUG ZIGZAG
        // let wobble = 20;
        // for (let x=10; x<1000; x+=10) {
        //     this.outline.push({x: x, y: groundHeight + wobble});
        //     wobble *= -1;
        // }

        // DEBUG SPIKE
        // this.outline.push({x: 100, y: groundHeight});
        // this.outline.push({x: 150, y: groundHeight-50});
        // this.outline.push({x: 200, y: groundHeight+250});
        // this.outline.push({x: 250, y: groundHeight+50});
        // this.outline.push({x: 300, y: groundHeight});
        // this.outline.push({x: 1000, y: groundHeight});
    }

    update(width: number, height: number, interval: number) {
        this.surfaceLine.clear();
        //this.surfaceLine.moveTo(0, height-this.groundHeight);  // left edge
        for (let i=0; i<this.outline.length; i++) {
            this.surfaceLine.lineTo(this.outline[i].x, height - this.outline[i].y);
        }
        this.surfaceLine.lineTo(width, height-this.groundHeight);  // right edge

        this.surfaceLine.stroke({
            width:3,
            color: 0xffffff,
        });
    }

    height(): number {
        return this.groundHeight;
    }

    heightAt(x: number): number {
        if (this.outline.length < 2) {  // landscape is just a flat line
            return this.windowHeight - this.groundHeight;
        }

        // interpolate the height of the ground at this x-coord
        let i = 0;
        while ((i < this.outline.length-1) && (this.outline[i].x < x)) {
            i++;
        }
        
        const p1 = (i==0) ? this.outline[0] : this.outline[i-1];
        const p2 = this.outline[i];
        const slope = (p2.y - p1.y) / (p2.x - p1.x);
        return this.windowHeight - (p1.y + (slope * (x - p1.x)));  // y = mx + x
    }

    impact(impactor: Rock) {
        // make a dent in the landscape due to this rock
        let craterRadius = impactor.radius;
        let craterDepth = impactor.radius / 3;
        
        // add a point either side to define the crater edges
        const leftX = impactor.position.x - craterRadius;
        const rightX = impactor.position.x + craterRadius;
        this.outline.push({x: leftX, y: this.groundHeight}); //this.heightAt(leftX)});
        this.outline.push({x: rightX, y: this.groundHeight}); //this.heightAt(rightX)});
        
        // now see if there are any landscape points within the impact zone
        // and lower them proportional to their distance from the epicentre
        let pointFound = false;    
        for (let i=0; i<this.outline.length; i++) {
            const distanceFromImpact = Math.abs(this.outline[i].x - impactor.position.x);
            if (distanceFromImpact < craterRadius) {
                    this.outline[i].y = Math.max(
                        this.outline[i].y - craterDepth / distanceFromImpact,
                        this.minimumHeight);
                    pointFound = true;
                }
        }

        // make sure there is at least one point to define the floor of the crater
        if (pointFound == false) {
            console.log("ADDING IMPACT POINT At x="+impactor.position.x);
            this.outline.push({
                x: impactor.position.x,
                y: Math.max(this.heightAt(impactor.position.x) - craterDepth, this.minimumHeight),
            });
        }
        else {
            console.log("No POINT FOUND: impactor x="+ impactor.position.x);
        }
        
        this.sortGroundPoints();  // put the outline back in x-order
    }

    private sortGroundPoints() {
        // reorder the ground array so that the points are left to right
        this.outline.sort(
            function(p1: PointData, p2: PointData){return p1.x - p2.x});
    }
}