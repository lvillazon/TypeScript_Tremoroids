// stars and the ground outline
import { Rock } from "./rocks";
import { Container, type PointData } from "pixi.js";
import { Renderer } from "./renderer";
import { Debugger } from "./debug";

export class Landscape {
    private displayLayer: Container;
    public outline: PointData[] = [];
    private groundHeight: number;
    private surfaceLine = new Renderer();
    
    constructor(layer: Container, groundHeight: number, windowWidth: number) {
        this.displayLayer = layer;
        this.displayLayer.addChild(this.surfaceLine.image);
        this.groundHeight = groundHeight;
        this.outline.push({x: 0, y: groundHeight});
        this.outline.push({x: windowWidth, y: groundHeight});
    }

    update(width: number, scroll: number) {
        // scroll the landscape
        let i = 0;
        for (i=0; i<this.outline.length; i++) {
            this.outline[i].x = this.outline[i].x - scroll;
        }
        // remove any points that no longer affect the visible terrain
        // ie points whose righthand neighbour is also offscreen
        i=0
        let pointsToRemove = 0;
        while (i<this.outline.length-1 && this.outline[i+1].x < 0) {
            pointsToRemove++;
            i++;
        }
        for (i=0; i<pointsToRemove; i++) {
            this.outline.shift();
        }

        if (this.outline[this.outline.length-1].x < width) {
            // add a new point to make sure the landscape always reaches to the end of the screen
            this.outline.push({
                x: Math.floor(width / 10)*11, 
                y: this.groundHeight + Math.random() * 10
            }); 
        }

        // redraw the ground surface
        this.surfaceLine.clear();
        this.surfaceLine.moveTo(0, this.outline[0].y);
        for (let i=0; i<this.outline.length; i++) {
            this.surfaceLine.lineTo(this.outline[i].x, this.outline[i].y);
        }
    }

    // fixed terrain to test tank movement
    testUpdate(width: number, scroll: number) {
        // scroll the landscape
        let i = 0;
        for (i=0; i<this.outline.length; i++) {
            this.outline[i].x = this.outline[i].x - scroll;
        }
        // remove any points that no longer affect the visible terrain
        // ie points whose righthand neighbour is also offscreen
        i=0
        let pointsToRemove = 0;
        while (i<this.outline.length-1 && this.outline[i+1].x < 0) {
            pointsToRemove++;
            i++;
        }
        for (i=0; i<pointsToRemove; i++) {
            this.outline.shift();
        }

        if (this.outline[this.outline.length-1].x < width) {
            // add a new point to make sure the landscape always reaches to the end of the screen
            if (this.heightAt(width - 100) == this.groundHeight) {
                this.outline.push({
                    x: width, 
                    y: this.groundHeight
                });
                this.outline.push({
                    x: width + 100, 
                    y: this.groundHeight -100
                });
                this.outline.push({
                    x: width + 150, 
                    y: this.groundHeight -100
                });
                this.outline.push({
                    x: width + 250, 
                    y: this.groundHeight
                });
            }
        }

        // redraw the ground surface
        this.surfaceLine.clear();
        this.surfaceLine.moveTo(0, this.outline[0].y);
        for (let i=0; i<this.outline.length; i++) {
            this.surfaceLine.lineTo(this.outline[i].x, this.outline[i].y);
        }
    }

    height(): number {
        return this.groundHeight;
    }

    public heightAt(x: number): number {
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

    impact(impactor: Rock, impactPoint: PointData, debugHook: Debugger) {
        // make a dent in the landscape due to this rock
        let craterRadius = impactor.radius;
        let craterDepth = impactor.radius;

        // the shape of the rock facing the ground provides the starting point for the crater
        const craterPoints = impactor.getBottomOutline();
        
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