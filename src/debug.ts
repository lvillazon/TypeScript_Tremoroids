import { Container, Graphics, type PointData } from "pixi.js";

const DEBUG_COLOR = 0xff0000;
const MAX_DEBUG_POINTS = 5000;

export class Debugger {
    private displayLayer: Container;
    private display: Graphics = new Graphics();
    private deferredPoints: {point: PointData; color: number}[] = [];
    private deferredLines: {p1: PointData; p2: PointData; color: number}[] = [];
    private deferredPolys: {points: PointData[]; color: number}[] = [];

    constructor(displayLayer: Container) {
        this.displayLayer = displayLayer;
        this.displayLayer.addChild(this.display);
    }

    update(width: number, height: number) {
        this.display.clear();
        // red outline around window, just so we know debug info is enabled
        // don't ask me why we need a 17px margin - allowing for scrollbars?
        this.display.rect(1, 1, width-17, height-17).stroke({  
            width:2,
            color: DEBUG_COLOR,
        });

        // draw any points that have been added from other modules
        for (let i=0; i<this.deferredPoints.length; i++) {
            this.display
                .circle(this.deferredPoints[i].point.x, this.deferredPoints[i].point.y, 3)
                .fill(this.deferredPoints[i].color);
        }

        // draw any polygons that have been added from other modules
        for (let i=0; i<this.deferredPolys.length; i++) {
            this.display.poly(this.deferredPolys[i].points)
                .stroke({width: 2, color: this.deferredPolys[i].color});
        }

        // draw any lines that have been added from other modules
        for (let i=0; i<this.deferredLines.length; i++) {
            this.display.moveTo(this.deferredLines[i].p1.x, this.deferredLines[i].p1.y)
            this.display.lineTo(this.deferredLines[i].p2.x, this.deferredLines[i].p2.y)
                .stroke({width: 2, color: this.deferredLines[i].color});
        }
        
        // reset the queues - otherwise the same items will be redrawn on each frame
        // this can be useful, if you want to see trails of historical info
        this.deferredLines = [];
        this.deferredPoints = [];
        this.deferredPolys = [];
    }

    drawPoint(p: PointData, color?: number) {
        if (!color) {
            color = DEBUG_COLOR;
        }
        // add a point to the list to be drawn on the next update
        while (this.deferredPoints.length >= MAX_DEBUG_POINTS) {
            this.deferredPoints.shift();
        }
        this.deferredPoints.push({point: p, color: color});
    }

    drawLine(p1: PointData, p2: PointData, color: number) {
        // add a line to the list to be drawn on the next update
        this.deferredLines.push({p1: p1, p2: p2, color: color});
    }

    drawPoly(points: PointData[], color: number) {
        // add a polygon to the list to be drawn on the next update
        while (this.deferredPolys.length >= MAX_DEBUG_POINTS) {
            this.deferredPolys.shift();
        }
        this.deferredPolys.push({points: points, color: color});
    }

    public destroy() {
        this.display.destroy();
    }
}