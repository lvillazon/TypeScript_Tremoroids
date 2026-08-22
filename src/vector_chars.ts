// Vector style outlines for letters and numbers
import { type PointData } from "pixi.js";
import { Renderer } from "./renderer";
import { Debugger } from "./debug";

export class VectorChar {
    public rendered: Renderer;
    public position: PointData;
    
    public constructor(char: String, size: number) {
        this.rendered = new Renderer();
        this.position = {x: 100, y: 100};

        // 0
        const outline: PointData[] = [
            {x: 0.5, y: 0},
            {x: 1.0, y: 0.25},
            {x: 1.0, y: 0.75},
            {x: 0.5, y: 1.0},
            {x: 0.0, y: 0.75},
            {x: 0.0, y: 0.25},
            {x: 0.5, y: 0}
        ];
        // scale to the correct size
        for (let i=0; i<outline.length; i++) {
            outline[i].x *= size;
            outline[i].y *= size;
        }
        this.rendered.poly(outline);        
    }

}