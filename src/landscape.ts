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

    update(width: number, height: number) {
        this.surfaceLine.clear();
        //this.surfaceLine.moveTo(0, height-this.groundHeight);  // left edge
        for (let i=0; i<this.outline.length; i++) {
            this.surfaceLine.lineTo(this.outline[i].x, this.outline[i].y);
        }
        this.surfaceLine.lineTo(width, this.groundHeight);  // right edge

        this.surfaceLine.stroke({
            width:3,
            color: 0xffffff,
        });
    }

    height(): number {
        return this.groundHeight;
    }

    private heightAt(x: number): number {
        if (this.outline.length < 2) {  // landscape is just a flat line
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

    impact(impactor: Rock, impactPoint: PointData) {
        // make a dent in the landscape due to this rock
        let craterRadius = impactor.radius;
        let craterDepth = impactor.radius / 3;

        TODO
        // Draw a circle centred slightly above the ground. 
        // Where it is below ground level, add that point to the landscape
        
        const points = 50;
        for (let i=0; i<points; i++) {
            let theta = 2 * Math.PI * i / points;
            let x = craterRadius * Math.cos(theta);
            let y = craterRadius * Math.sin(theta);
            min_x = Math.min(x, min_x);
            max_x = Math.max(x, max_x);
            min_y = Math.min(y, min_y);
            max_y = Math.max(y, max_y);
            let p: PointData = {x, y};
            points.push(p);
        }

        const x: number = impactPoint.x;
        const y: number = impactPoint.y + craterDepth;// - impactor.position.y
        this.outline.push({x: x, y: y});

        // deprecated attempt to use the outline of the rock to define the crater
        // produces weird up spikes, and I'm not sure it's the best approach anyway
        // const impactorOutline = impactor.debugGetBottomOutline();
        // for (let i=0; i<impactorOutline.points.length; i+=2) {
        //     const x: number = impactorOutline.points[i];
        //     const y: number = this.heightAt(x) + impactorOutline.points[i+1] - impactor.position.y
        //     this.outline.push({
        //         x: x,
        //         y: y
        //     });
        // }
        
        // add a point either side to define the crater edges
        // const leftX = impactor.position.x - craterRadius;
        // const rightX = impactor.position.x + craterRadius;
        // this.outline.push({x: leftX, y: this.heightAt(leftX)});
        // this.outline.push({x: rightX, y: this.heightAt(rightX)});
        
//         // now see if there are any landscape points within the impact zone
//         // and lower them proportional to their distance from the epicentre
//         let pointFound = false;    
//         for (let i=0; i<this.outline.length; i++) {
//             const distanceFromImpact = Math.abs(this.outline[i].x - impactor.position.x);
//             if (distanceFromImpact < craterRadius) {
//                     this.outline[i].y = Math.max(
//                         this.outline[i].y - craterDepth / distanceFromImpact,
//                         this.minimumHeight);
//                     pointFound = true;
//                 }
//         }

//         // make sure there is at least one point to define the floor of the crater
//         if (pointFound == false) {
//             this.outline.push({
//                 x: impactor.position.x,
//                 y: this.heightAt(impactor.position.x) - craterDepth,
// //                y: Math.max(this.heightAt(impactor.position.x) - craterDepth, this.minimumHeight),
//             });
//         }
        
        this.sortGroundPoints();  // put the outline back in x-order
    }

    private sortGroundPoints() {
        // reorder the ground array so that the points are left to right
        this.outline.sort(
            function(p1: PointData, p2: PointData){return p1.x - p2.x});
    }
}