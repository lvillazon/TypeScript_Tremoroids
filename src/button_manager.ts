// Vector style outlines for letters and numbers
import { Container, Graphics, type PointData } from "pixi.js";
import { Renderer } from "./renderer";

export class Button {
    public icon: Renderer;
    public bezelLayer: Container;
    public bezel: Renderer;
    public size: number;
    private onClick: () => boolean;

     public constructor(icon: Renderer, size: number, onClick: () => boolean) {
        this.size = size;
        this.onClick = onClick;
        this.icon = icon;
        this.bezelLayer = new Container();
        this.bezel = this.drawBorder();
        this.bezelLayer.addChild(this.icon.image);
        this.bezelLayer.addChild(this.bezel.image);
    }

    public destroy() {
        this.icon.image.destroy();
        this.bezel.image.destroy();
    }

    private drawBorder(): Renderer {
        const border = new Renderer();
        border.moveTo(0, 0);
        border.lineTo(this.size, 0);
        border.lineTo(this.size, this.size);
        border.lineTo(0, this.size);
        border.lineTo(0, 0);
        return border;
    }

    public setPosition(pos: PointData) {
        this.bezelLayer.position.set(pos.x, pos.y);
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
        button.setPosition(position);
        this.displayLayer.addChild(button.bezelLayer);
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
            {x: 0.0       , y: 0.2 * size},
            {x: size      , y: 0.2 * size},
            {x: 0.0       , y: 0.2 * size},
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
        icon.image.origin.set(size/1.9, size/2.2);
        icon.image.scale.set(0.4, 0.6);
        icon.image.rotation = Math.PI * 1.25;
        return icon
    }

    public static bulletIcon(size: number): Renderer {
        const icon = new Renderer();
        const points: PointData[] = [
            {x: 0.0       , y: 0.0},
            {x: 0.0       , y: 0.2 * size},
            {x: size      , y: 0.2 * size},
            {x: 0.0       , y: 0.2 * size},
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
        icon.poly(this.offsetPoints(points, {x: -45, y: 0}))
        icon.poly(this.offsetPoints(points, {x: 45, y: 0}))
        icon.image.origin.set(size/1.9, size/2.2);
        icon.image.scale.set(0.2, 0.6);
        icon.image.rotation = Math.PI * 1.25;
        return icon
    }

    private static offsetPoints(points: PointData[], offset: PointData) {
        const newPoints: PointData[] = [];
        for (const p of points) {
            newPoints.push({x: p.x + offset.x, y: p.y + offset.y});
        }
        return newPoints;
    }
}