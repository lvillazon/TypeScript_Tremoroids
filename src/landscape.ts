// stars and the ground outline
import { Rock } from "./rocks";
import { Graphics, Container, type PointData } from "pixi.js";

export class Landscape {
    private displayLayer: Container;
    private outline: PointData[] = [];
    private groundLevel: number;
    private surfaceLine = new Graphics();
    
    constructor(layer: Container, groundLevel: number) {
        this.displayLayer = layer;
        this.displayLayer.addChild(this.surfaceLine);
        this.groundLevel = groundLevel;
    }

    update(width: number, height: number, interval: number) {
        this.surfaceLine.clear();
        this.surfaceLine.moveTo(0, height-this.groundLevel);  // left edge
        for (let i=0; i<this.outline.length; i++) {
            this.surfaceLine.lineTo(this.outline[i].x, this.outline[i].y);
        }
        this.surfaceLine.lineTo(width, height-this.groundLevel);  // right edge

        this.surfaceLine.stroke({
            width:3,
            color: 0xffffff,
        });
    }
}