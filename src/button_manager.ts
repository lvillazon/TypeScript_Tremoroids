// Vector style outlines for letters and numbers
import { Container, type PointData } from "pixi.js";
import { Renderer } from "./renderer";

export class Button {
    public icon: Renderer;
    public size: number;
    private onClick: () => boolean;

     public constructor(icon: Renderer, size: number, onClick: () => boolean) {
        this.size = size;
        this.onClick = onClick;
        this.icon = this.drawBorder(icon);

    }

    public destroy() {
        this.icon.image.destroy();
    }

    private drawBorder(icon: Renderer): Renderer {
        icon.moveTo(0, 0);
        icon.lineTo(this.size, 0);
        icon.lineTo(this.size, this.size);
        icon.lineTo(0, this.size);
        icon.lineTo(0, 0);
        return icon;
    }
}

export class ButtonManager {
    private buttons: Button[] = [];
    private displayLayer: Container;
    
    public constructor(layer: Container) {
        this.displayLayer = layer;
    }

    public addButton(icon: Renderer, position: PointData, size: number, onClick: () => boolean) {
        const button = new Button(icon, size, onClick);
        button.icon.image.position.set(position.x, position.y);
        this.displayLayer.addChild(button.icon.image);
        this.buttons.push(button);
        return button;
    }

    public destroy() {
        for (const button of this.buttons) {
            button.destroy();
        }
    }

    public static cannonIcon(size: number): Renderer {
        const icon = new Renderer();
        const points: PointData[] = [
            {x: 0.0       , y: 0.0},
            {x: 0.0       , y: 0.6 * size},
            {x: 0.1 * size, y: 0.75 * size},
            {x: 0.3 * size, y: 0.9 * size},
            {x: 0.5 * size, y: size},
            {x: 0.7 * size, y: 0.9 * size,},
            {x: 0.9 * size, y: 0.75 * size},
            {x: size      , y: 0.6 * size},
            {x: size      , y: 0.0}
        ];
        icon.poly(points);
        icon.image.origin.set(size/2, size/2);
        icon.image.scale.set(0.8);
        icon.image.rotation = Math.PI;
        
        return icon
    }

}