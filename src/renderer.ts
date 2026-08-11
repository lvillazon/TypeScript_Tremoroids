// Handles graphical effects to get the ray-traced look
import { Graphics, type PointData } from "pixi.js";

export class Renderer {
    private BACKGROUND = 0x000000;
    private GLOW_COLOR = 0x0055AA;
    private LINE_COLOR = 0xBBBBBB;
    private VERTEX_COLOR = 0xFFFFFF;
    private VERTEX_SIZE = 1;
    private GLOW_WIDTH = 4;
    private LINE_WIDTH = 2;
    public image: Graphics;
    private cursorPos: PointData;
    
    public constructor() {
        this.image = new Graphics();
        this.cursorPos = {x: 0, y: 0};
    }

    public clear() {
        this.image.clear();
        this.cursorPos = {x: 0, y: 0};
    }

    public poly(points: PointData[]) {
        this.image
            .poly(points)
            .fill({
            color: this.BACKGROUND,
            })
            .stroke({
            width: this.GLOW_WIDTH,
            color: this.GLOW_COLOR,
            });
        this.image
            .poly(points)
            .stroke({
            width: this.LINE_WIDTH,
            color: this.LINE_COLOR,
            });
        for (let i=0; i<points.length; i++) {
            this.image
                .circle(points[i].x, points[i].y, this.VERTEX_SIZE)
                .fill({color: this.VERTEX_COLOR});
        }
    }

    public circle(x: number, y: number, radius: number) {
        this.image
            .circle(x, y, radius)
            .stroke({
            width: this.GLOW_WIDTH,
            color: this.GLOW_COLOR,
            });
        this.image
            .circle(x, y, radius)
            .stroke({
            width: this.LINE_WIDTH,
            color: this.LINE_COLOR,
            });
    }

    public moveTo(x: number, y: number) {
        this.cursorPos = {x: x, y: y};
    }

    public lineTo(x: number, y: number) {
        this.image.moveTo(this.cursorPos.x, this.cursorPos.y);
        this.image.lineTo(x, y).stroke ({
            width: this.GLOW_WIDTH,
            color: this.GLOW_COLOR,
        });
        this.image.moveTo(this.cursorPos.x, this.cursorPos.y);
        this.image.lineTo(x, y).stroke({
            width: this.LINE_WIDTH,
            color: this.LINE_COLOR,
            });
        this.image
            .circle(x, y, this.VERTEX_SIZE)
            .fill({color: this.VERTEX_COLOR});
        this.moveTo(x, y);
    }
}
