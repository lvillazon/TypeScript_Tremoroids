// Vector style outlines for letters and numbers
import { Container, Polygon, type PointData } from "pixi.js";
import { Renderer } from "./renderer";
import { VectorChar } from "./vector_chars";
import { Debugger } from "./debug";

export class TextManager {
    public rendered: Renderer;
    private labels: VectorChar[][] = [];
    private displayLayer: Container;
    
    public constructor(layer: Container) {
        this.rendered = new Renderer();
        this.displayLayer = layer;
    }

    public addLabel(text: String, position: PointData, size: number) {
        const label: VectorChar[] = [];

        const char = new VectorChar("0", size);
        this.displayLayer.addChild(char.rendered.image);
        char.rendered.image.position.set(position.x, position.y);
        label.push(char);
        this.labels.push(label);
    }

    public update() {

    }

}