// Vector style outlines for letters and numbers
import { Container, type PointData } from "pixi.js";
import { VectorChar } from "./vector_chars";
import { Debugger } from "./debug";

export class Label {
    public text: String;
    public position: PointData;
    public height: number;
    private kerning: number;
    private renderedChars: VectorChar[] = [];
    public textContainer: Container;

    public constructor(text: String, position: PointData, height: number) {
        this.text = text;
        this.position = {x: position.x, y: position.y};
        this.height = height;
        this.kerning = this.height /5;
        this.textContainer = new Container();
        this.setText(text);
    }

    public getWidth(): number {
        return (this.text.length * (this.height/2 + this.kerning));
    }

    public setText(newText: String) {
        // delete any existing characters
        for (const char of this.renderedChars) {
            char.destroy();
        }
        this.textContainer.removeChildren();
        this.renderedChars = [];
        for (let i=0; i<newText.length; i++) {
            const char = new VectorChar(newText.charAt(i), this.height);
            this.textContainer.addChild(char.rendered.image);
            this.renderedChars.push(char);
        }
        this.setPosition(this.position.x, this.position.y);
        this.text = newText;
    }

    public resize(newHeight: number) {
        for (const char of this.renderedChars) {
            char.resize(newHeight);
        }
        this.height = newHeight;
    }

    public setPosition(x: number, y: number) {
        let charX = x;
        for (const char of this.renderedChars) {
            char.rendered.image.position.set(charX, y);
            charX += char.width + this.kerning;
        }
    }

    public destroy() {
        for (const char of this.renderedChars) {
            char.destroy()
        }
    }
}

export class TextManager {
//    public rendered: Renderer;
    private labels: Label[] = [];
    private displayLayer: Container;
    
    public constructor(layer: Container) {
        // this.rendered = new Renderer();
        this.displayLayer = layer;
    }

    public addLabel(text: String, position: PointData, height: number) {
        const label = new Label(text, position, height);
        this.displayLayer.addChild(label.textContainer);
        this.labels.push(label);
        return label;
    }

    public destroy() {
        for (const label of this.labels) {
            label.destroy();
        }
    }

}