// stars and the ground outline
import { Rock } from "./rocks";
import { Graphics, Container, type PointData } from "pixi.js";
import { Debugger } from "./debug";

export class Landscape {
    private displayLayer: Container;
    public outline: PointData[] = [];
    private groundHeight: number;
    private minimumHeight: number;
    private windowHeight: number;
    private surfaceLine = new Graphics();
    
    constructor(layer: Container, groundHeight: number, 
        windowHeight: number, windowWidth: number) {
        this.displayLayer = layer;
        this.displayLayer.addChild(this.surfaceLine);
        this.groundHeight = groundHeight;
        this.windowHeight = windowHeight;
        this.minimumHeight = 40;
        this.outline.push({x: -windowWidth, y: groundHeight});
        this.outline.push({x: windowWidth, y: groundHeight});
    }

    update(width: number, height: number) {
        this.surfaceLine.clear();
        //this.surfaceLine.moveTo(0, height-this.groundHeight);  // left edge
        for (let i=0; i<this.outline.length; i++) {
            this.surfaceLine.lineTo(this.outline[i].x, this.outline[i].y);
        }
        this.surfaceLine.lineTo(width, 400); //this.heightAt(width));  // right edge

        this.surfaceLine.stroke({
            width:3,
            color: 0xffffff,
        });
    }

    height(): number {
        return this.groundHeight;
    }

    private heightAt(x: number): number {
        if (this.outline.length <= 2) {  // landscape is just a flat line
            return this.groundHeight;
        }

        // interpolate the height of the ground at this x-coord
        let i = 0;
        while ((i < this.outline.length-1) && (this.outline[i].x < x)) {
            i++;
        }
        
        const p1 = (i==0) ? this.outline[0] : this.outline[i-1];
        const p2 = this.outline[i];
        const slope = (p2.y - p1.y) / (p2.x - p1.x);
        return p1.y + (slope * (x - p1.x));  // y = mx + x
    }

    public absoluteHeightAt(x: number): number {
        return this.heightAt(x);
    }

    impact(impactor: Rock, impactPoint: PointData, debugHook: Debugger) {
        // make a dent in the landscape due to this rock
        let craterRadius = impactor.radius;
        let craterDepth = impactor.radius;

        // Create a semi-circle of points, centred on the impact point      
        const points = craterRadius / 10;
        const craterPoints: PointData[] = [];
        // let i = 0
        // let x = 0;
        // let y = 0;
        // let angle_increment = Math.PI / points; 
        // let theta = 0;
        // debugHook.drawPoint({
        //     x: impactPoint.x + craterRadius * Math.cos(theta),
        //     y: impactPoint.y + craterDepth * Math.sin(theta),
        //     }, 0x0000FF);
        // while (i<points) {
        //     x = impactPoint.x + craterRadius * Math.cos(theta);
        //     y = Math.max(
        //         impactPoint.y + craterDepth * Math.sin(theta),
        //         this.heightAt(x));
        //     let p: PointData = {x, y};
        //     craterPoints.push(p);
        //     i++;
        //     theta += angle_increment;            
        // }
        //TODO - this adds points clockwise, so x values are from right to left

        const halfOutline = impactor.debugGetBottomOutline();
        for (let i=0; i<halfOutline.points.length; i+=2) {
            craterPoints.push({x: halfOutline.points[i], y: halfOutline.points[i+1]});
        }

        // add a point either side to define the crater edges
        const leftX = impactor.position.x - 2* craterRadius;
        const rightX = impactor.position.x + 2 * craterRadius;
        const leftPoint: PointData = {x: leftX, y: this.heightAt(leftX)};
        const rightPoint: PointData = {x: rightX, y: this.heightAt(rightX)};
        this.outline.push(leftPoint);
        this.outline.push(rightPoint);
        debugHook.drawPoint(leftPoint, 0xff0000);
        debugHook.drawPoint(rightPoint, 0x00ff00);

        // and then re-sort
        this.sortGroundPoints();  // put the outline back in x-order

        // now adjust the crater to merge the existing landscape outline with the crater outline
        // by averaging the y-values
        const adjustedCraterPoints: PointData[] = [];
        for (let i=0; i<craterPoints.length; i++) {
            const x = craterPoints[i].x;
            adjustedCraterPoints.push({
                x: x,
                y: (craterPoints[i].y + craterDepth + this.heightAt(x)) / 2
            });
        }

        // remove any existing landscape points that fall within the crater zone
        let i=1;  // musn't remove left hand edge or we create a hole in the ground
        let craterLeftside = impactPoint.x - craterRadius;
        let craterRightside = impactPoint.x + craterRadius;
        while ((i < this.outline.length) && (this.outline[i].x <= craterLeftside)) {
            i++;
        }
        while ((i < this.outline.length) && 
               (this.outline[i].x > craterLeftside) && 
               (this.outline[i].x < craterRightside)) {
            this.outline[i] = this.outline[this.outline.length-1]; // swap & pop method of deletion
            this.outline.pop();
            i++;
        }

        // add the points from the new crater
        for (i=0; i<adjustedCraterPoints.length; i++) {
            this.outline.push(adjustedCraterPoints[i]);
        }

        // and then re-sort
        this.sortGroundPoints();  // put the outline back in x-order

    }

    private sortGroundPoints() {
        // reorder the ground array so that the points are left to right
        this.outline.sort(
            function(p1: PointData, p2: PointData){return p1.x - p2.x});
    }
}