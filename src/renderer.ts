// Handles graphical effects to get the ray-traced look
import { Graphics, type PointData } from "pixi.js";

export type RenderStyle = "FAST" | "CHUNKY" | "VECTOR" | "NEON";

function mulberry32(seed: number): () => number {
    // using this as a replacement to Math.random, so that I can set a seed
    // this allows the game to request consistent colors for related objects - eg tank frames
    return function() {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;

        let t = seed;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);

        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function pickRandomColor(seed?: number): number {
    let random: () => number;
    if (seed) {
        random = mulberry32(seed);
    } else {
        random = mulberry32(Math.random()*1000);
    }
    const colors = [
            0x5E57FF,
            0xF23CA6,
            0xFF9535,
            0x4BFF36,
            0x02FEE4
        ];
    const result = colors[Math.floor(random() * colors.length)];
    return result;
}

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
    public static style: RenderStyle = "VECTOR";
    
    public constructor(seed?: number) {
        this.image = new Graphics();
        this.cursorPos = {x: 0, y: 0};
        if (Renderer.style == "NEON") {
            this.LINE_COLOR = pickRandomColor(seed);
        }
33    }

    public clear() {
        this.image.clear();
        this.cursorPos = {x: 0, y: 0};
    }

    public poly(points: PointData[]) {
        this.generalPoly(points, true);
    }
    
    public polyLine(points: PointData[]) {
        this.generalPoly(points, false);
    }
    
    private generalPoly(points: PointData[], closed: boolean) {
        switch (Renderer.style) {
            case "FAST": {
                this.image
                    .poly(points, closed)
                    .stroke({
                    width: this.LINE_WIDTH,
                    color: this.LINE_COLOR,
                    });
                break;
            }
            case "CHUNKY": {
                this.image
                    .poly(points, closed)
                    .fill({
                    color: this.BACKGROUND,
                    })
                    .stroke({
                    width: this.LINE_WIDTH * 2,
                    color: this.LINE_COLOR,
                    cap: "round",
                    join: "round"
                    });
                break;
            }
            case "NEON": {
                this.image
                    .poly(points, closed)
                    .fill({
                    color: this.BACKGROUND,
                    })
                    .stroke({
                    width: this.LINE_WIDTH * 2,
                    color: this.LINE_COLOR,
                    cap: "round",
                    join: "round"
                    });
                break;
            }
            case "VECTOR": {
                this.image
                    .poly(points, closed)
                    .fill({
                    color: this.BACKGROUND,
                    })
                    .stroke({
                    width: this.GLOW_WIDTH,
                    color: this.GLOW_COLOR,
                    });
                this.image
                    .poly(points, closed)
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
        }
    }

    public circle(x: number, y: number, radius: number) {
        switch (Renderer.style) {
            case "FAST": {
                this.image
                    .circle(x, y, radius)
                    .stroke({
                    width: this.LINE_WIDTH,
                    color: this.LINE_COLOR,
                    });
                break;
            }
            case "CHUNKY": {
                this.image
                    .circle(x, y, radius)
                    .stroke({
                    width: this.LINE_WIDTH * 2,
                    color: this.LINE_COLOR,
                    cap: "round",
                    join: "round"
                    });
                break;
            }
            case "NEON": {
                this.image
                    .circle(x, y, radius)
                    .stroke({
                    width: this.LINE_WIDTH * 2,
                    color: this.LINE_COLOR,
                    cap: "round",
                    join: "round"
                    });
                break;
            }
            case "VECTOR": {
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
                break;
            }
        }
    }

    public moveTo(x: number, y: number) {
        this.cursorPos = {x: x, y: y};
    }

    public lineTo(x: number, y: number) {
        switch (Renderer.style) {
            case "FAST": {
                this.image.moveTo(this.cursorPos.x, this.cursorPos.y);
                this.image.lineTo(x, y).stroke({
                    width: this.LINE_WIDTH,
                    color: this.LINE_COLOR,
                    });
                this.moveTo(x, y);
                break;
            }
            case "CHUNKY": {
                this.image.moveTo(this.cursorPos.x, this.cursorPos.y);
                this.image.lineTo(x, y).stroke({
                    width: this.LINE_WIDTH * 2,
                    color: this.LINE_COLOR,
                    cap: "round",
                    join: "round"
                    });
                this.moveTo(x, y);
                break;
            }
            case "NEON": {
                this.image.moveTo(this.cursorPos.x, this.cursorPos.y);
                this.image.lineTo(x, y).stroke({
                    width: this.LINE_WIDTH * 2,
                    color: this.LINE_COLOR,
                    cap: "round",
                    join: "round"
                    });
                this.moveTo(x, y);
                break;
            }
            case "VECTOR": {
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
                break;
            }
        }
    }
}
