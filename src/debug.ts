import { Container, Graphics, type PointData } from "pixi.js";
import type { RockManager } from "./rock_manager";

const DEBUG_COLOR = 0xff0000;

export class Debugger {
    private rockManager: RockManager;
    private displayLayer: Container;
    private display: Graphics = new Graphics();
    private deferredPoints: {point: PointData; color: number}[] = [];

    constructor(displayLayer: Container, rockManager: RockManager) {
        this.rockManager = rockManager;
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

        // draw the absolute positions of each rock vertex on the impacting side
        for (let i=0; i<this.rockManager.debugGetRockCount(); i++) {
            const r = this.rockManager.debugGetRock(i)
            const rockOutline = r.getBottomOutline();
            this.display.circle(r.position.x, r.position.y, 3).fill(DEBUG_COLOR);
            for (let j=0; j<rockOutline.length; j++) {
                let pointX = rockOutline[j].x;
                let pointY = rockOutline[j].y;
                this.display.circle(pointX, pointY, 3).fill(DEBUG_COLOR);
            }
        }

        // draw the absolute position of the ground
        // by getting the height of the landscape at every single x value
        // this is very slow, so just for debugging, ok?
        // for (let x=0; x<width; x++) {
        //     this.display.circle(x, this.landscape.absoluteHeightAt(x), 2).fill(DEBUG_COLOR);
        // }

        // draw any points that have been added from other modules
        for (let i=0; i<this.deferredPoints.length; i++) {
            this.display
                .circle(this.deferredPoints[i].point.x, this.deferredPoints[i].point.y, 3)
                .fill(this.deferredPoints[i].color);
        }

    }

    drawPoint(p: PointData, color: number) {
        // add a point to the list to be drawn on the next update
        const MAX_DEBUG_POINTS = 3;
        while (this.deferredPoints.length >= MAX_DEBUG_POINTS) {
            this.deferredPoints.shift();
        }
        this.deferredPoints.push({point: p, color: color});
    }
}