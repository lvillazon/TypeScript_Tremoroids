// The player tank
import { Container, type PointData } from "pixi.js";
import { Renderer } from "./renderer";
import { Debugger } from "./debug";

const DEBUG = false;

export class CrossHairs {
    private displayLayer: Container;
    private size: number;
    private rendered: Renderer;
    
    public constructor(layer: Container, size: number) {
        this.displayLayer = layer;
        this.size = size;
        this.rendered = new Renderer();
        this.rendered.circle(0, 0, this.size);
        for (let i=0; i<8; i++) {
            let r = 1.0;
            if (i % 2 == 0) {
                r = 1.5;
            }
            this.rendered.moveTo(
                this.size * 0.5 * Math.cos(Math.PI/4 * i),
                this.size * 0.5 * Math.sin(Math.PI/4 * i)
            );
            this.rendered.lineTo(
                this.size * r * Math.cos(Math.PI/4 * i),
                this.size * r * Math.sin(Math.PI/4 * i)
            );
        }
        this.displayLayer.addChild(this.rendered.image);      
    }

    public update(point: PointData, debugHook: Debugger) {
        // crosshairs always follow the mouse
        this.rendered.image.position = point;
        if (DEBUG) {
            debugHook.drawPoint(point);
        }
    }

    public position(): PointData {
        return {
            x: this.rendered.image.position.x + this.size/2,
            y: this.rendered.image.position.y + this.size/2
        }
    }

    public destroy() {
        this.rendered.image.destroy();
    }

}
