// Vector style outlines for letters and numbers
import { Bounds, Container, ColorMatrixFilter, type PointData } from "pixi.js";
import { Renderer } from "./renderer";

export class Button {
    public icon: Renderer;
    public bezelLayer: Container;
    public bezel: Renderer;
    public size: number;
    public onClick: () => boolean;

     public constructor(icon: Renderer, size: number, onClick: () => boolean) {
        this.size = size;
        this.onClick = onClick;
        this.icon = icon;
        this.bezelLayer = new Container();
        this.bezel = this.drawBorder(false);
        this.bezelLayer.addChild(this.icon.image);
        this.bezelLayer.addChild(this.bezel.image);
    }

    public destroy() {
        this.icon.image.destroy();
        this.bezel.image.destroy();
    }

    public select() {
        this.bezelLayer.removeChild(this.bezel.image);
        this.bezel = this.drawBorder(true);
        this.bezelLayer.addChild(this.bezel.image);
    }

    public deselect() {
        this.bezelLayer.removeChild(this.bezel.image);
        this.bezel = this.drawBorder(false);
        this.bezelLayer.addChild(this.bezel.image);
    }

    private drawBorder(selected: boolean): Renderer {
        const border = new Renderer();
        border.moveTo(0, 0);
        border.lineTo(this.size, 0);
        border.lineTo(this.size, this.size);
        border.lineTo(0, this.size);
        border.lineTo(0, 0);

        if (selected) {
            const width = this.size/10;
            border.moveTo(-width, -width);
            border.lineTo(this.size+width, -width);
            border.lineTo(this.size+width, this.size+width);
            border.lineTo(-width, this.size+width);
            border.lineTo(-width, -width);
        }
        return border;
    }

    public setPosition(pos: PointData) {
        this.bezelLayer.position.set(pos.x, pos.y);
    }

    public hitBox(): Bounds {
        return this.bezel.image.getBounds();
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

    public checkButtons(mousePosition: PointData): boolean {
        // trigger the callback function if the click coords fall within any of the buttons
        for (const b of this.buttons) {
            if (b.hitBox().containsPoint(mousePosition.x, mousePosition.y)) {
                b.onClick();
                this.select(b);
                return true;
            }
        }
        return false;
    }

    private select(selectedButton: Button) {
        for (const b of this.buttons) {
            if (b === selectedButton) {
                b.select();
            } else {
                b.deselect();
            }
        }
    }

    public selectButton(i: number) {
        if (i>=0 && i<this.buttons.length) {
            this.select(this.buttons[i]);
        }
    }

    public static cannonIcon(size: number): Renderer {
        const icon = new Renderer();
        let points: PointData[] = [
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
        points = this.scalePoints(points, {x:0.4, y:0.6});
        points = this.offsetPoints(points, {x:size/3, y:size/4});
        icon.poly(points);
        icon.image.origin.set(size/2, size/2);
        icon.image.rotation = Math.PI * 1.25;
        return icon
    }

    public static bulletIcon(size: number): Renderer {
        const icon = new Renderer();
        let points: PointData[] = [
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
        points = this.scalePoints(points, {x:0.2, y:0.6});
        points = this.offsetPoints(points, {x:size/2.5, y:size/4});
        icon.poly(points);
        icon.poly(this.offsetPoints(points, {x: -size/4, y: 0}));
        icon.poly(this.offsetPoints(points, {x: size/4, y: 0}))
        icon.image.origin.set(size/2, size/2);
        icon.image.rotation = Math.PI * 1.25;
        return icon
    }

    public static flakIcon(size: number): Renderer {
        const icon = new Renderer();
        let points: PointData[] = this.scalePoints([
            {x: 0.5 , y: 0.5 }, // middle
            {x: 0.5 , y: 0.15}, // top of vertical stroke
            {x: 0.55, y: 0.25}, // top triangle p1
            {x: 0.45, y: 0.25}, // p2
            {x: 0.5 , y: 0.15}, // back to top
            {x: 0.5 , y: 0.85}, // bottom of vertical stroke
            {x: 0.55, y: 0.75}, // bottom triangle p1
            {x: 0.45, y: 0.75}, // p2
            {x: 0.5 , y: 0.85}, // back to bottom
            {x: 0.5 , y: 0.5 }, // middle
            {x: 0.2 , y: 0.35}, // top left diagonal
            {x: 0.25, y: 0.43}, // top left triangle p1
            {x: 0.3 , y: 0.35}, // p2
            {x: 0.2 , y: 0.35}, // back to top left
            {x: 0.8 , y: 0.65}, // bottom right diagonal
            {x: 0.75, y: 0.57}, // bottom right triangle p1
            {x: 0.7 , y: 0.65}, // p2
            {x: 0.8 , y: 0.65}, // back to bottom right
            {x: 0.5 , y: 0.5 }, // middle
            {x: 0.2 , y: 0.65}, // bottom left diagonal
            {x: 0.25, y: 0.55}, // bottom left triangle p1
            {x: 0.3 , y: 0.66}, // p2
            {x: 0.2 , y: 0.65}, // back to bottom left
            {x: 0.8 , y: 0.35}, // top right diagonal
            {x: 0.75, y: 0.45}, // top right triangle p1
            {x: 0.68, y: 0.33}, // p2
            {x: 0.8 , y: 0.35}, // back to top right
        ], {x: size, y: size});
        icon.poly(points);
        return icon
    }

    private static offsetPoints(points: PointData[], offset: PointData) {
        const newPoints: PointData[] = [];
        for (const p of points) {
            newPoints.push({x: p.x + offset.x, y: p.y + offset.y});
        }
        return newPoints;
    }

    private static scalePoints(points: PointData[], scale: PointData) {
        const newPoints: PointData[] = [];
        for (const p of points) {
            newPoints.push({x: p.x * scale.x, y: p.y * scale.y});
        }
        return newPoints;
    }
}