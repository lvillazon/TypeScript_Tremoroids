// The player tank
import { type Renderer as PixiRenderer} from "pixi.js";
import { Container, Graphics, Sprite, Texture, type PointData } from "pixi.js";
import { Renderer } from "./renderer";
import { Debugger } from "./debug";
import type { Landscape } from "./landscape";

const ANIMATION_FRAMES = 3;
const SPEED = 1;

function distanceBetween(point1: PointData, point2:PointData) {
    return Math.sqrt((point1.x - point2.x) ^2 + (point1.y - point2.y) ^2);
}

export class Tank {
    private displayLayer: Container;
    private ground: Landscape;
    public velocity: PointData;
    public position: PointData;
    private oldPosition: PointData;
    public rotationSpeed: number;
    private barrelAngle: number;
    private size: number;
    private trackSpacing: number;
    private frames: Texture[] = [];
    private frameNumber: number;
    private frameTimer: number;
    private sprite: Sprite;

    public constructor(
        textureRenderer: PixiRenderer, 
        layer: Container, ground: Landscape, position: PointData, size: number) {
        this.displayLayer = layer;
        this.ground = ground;
        this.size = size;
        this.trackSpacing = size/5;
        this.barrelAngle = this.toRadians(-30);  // in degrees
        for (let f=0; f<ANIMATION_FRAMES; f++) {
            const image = this.drawTankFrame(f);
            this.frames.push(
                textureRenderer.generateTexture(image)
            );
            image.destroy();  // explicitly release GPU resources used by Pixi
        }
        this.sprite = new Sprite(this.frames[0]);
        this.displayLayer.addChild(this.sprite);
        this.rotationSpeed = 0;
        this.position = {x: position.x, y: position.y - this.size * 2.6};
        this.oldPosition = {x: this.position.x, y: this.position.y};
        this.velocity = {x: 0, y: 0};
        this.frameNumber = 0;
        this.frameTimer = 0;
    }

    private drawTankFrame(frameNumber: number): Graphics {
        const tank_image_detail = 5;  // higher numbers mean more points in the tank graphic
        const rendered: Renderer = new Renderer();

        // the tank image comprises:
        // a semicircle turret in the middle, with a line for the barrel
        let points: PointData[] = [];
        for (let i=0; i<tank_image_detail+1; i++) {
            let theta = -Math.PI + Math.PI * i / tank_image_detail;
            let x = this.size * Math.cos(theta);
            let y = this.size * Math.sin(theta);
            let p: PointData = {x, y};
            points.push(p);
        }
        rendered.poly(points);  // turret
        // barrel
        rendered.moveTo(
            this.size * Math.cos(this.barrelAngle),
            this.size * Math.sin(this.barrelAngle)
        );
        rendered.lineTo(
            2.5 * this.size * Math.cos(this.barrelAngle),
            2.5 * this.size * Math.sin(this.barrelAngle)
        );

        // 3 lines to define the top hull
        rendered.moveTo(-this.size*2.5, this.size*0.5);
        rendered.lineTo(-this.size*2, 0);
        rendered.lineTo(this.size*2, 0);
        rendered.lineTo(this.size*2.5, this.size*0.5);

        // an oval for the tank track outline
        points = [];
        for (let i=0; i<tank_image_detail+1; i++) {
            let theta = Math.PI/2 + Math.PI * i / tank_image_detail;
            let x = -this.size * 1.6 + this.size * 0.5 * Math.cos(theta);
            let y = this.size * 0.7 + this.size * 0.5 * Math.sin(theta);
            points.push({x: x, y: y});
        }
        for (let i=0; i<tank_image_detail+1; i++) {
            let theta = -Math.PI/2 + Math.PI * i / tank_image_detail;
            let x = this.size * 1.6 + this.size * 0.5 * Math.cos(theta);
            let y = this.size * 0.7 + this.size * 0.5 * Math.sin(theta);
            points.push({x: x, y: y});
        }
        rendered.poly(points);  // turrent

        // 4 circles within the outline to represent the wheels
        const wheelPositions = [-1.6, -0.55, 0.55, 1.6];
        for (let i=0; i<wheelPositions.length; i++) {
            rendered.circle(
                -this.size * wheelPositions[i],
                this.size * 0.7,
                this.size/ 6
            );
        }

        // short lines to represent the tread on the tracks
        // left and right curved sections first
        let centre1 = {x: -this.size * 1.6, y: this.size * 0.7};
        let centre2 = {x: this.size * 1.6, y: this.size * 0.7};
        let wheelRadius = this.size * 0.5;
        let trackLength = this.size * 0.1;
        let animationOffset = this.size/15;
        let animationOffsetAngle = Math.PI / 30;
        for (let i=0; i<tank_image_detail+1; i++) {
            let theta = Math.PI/2 + Math.PI * i / tank_image_detail 
                        + animationOffsetAngle * frameNumber;
            let x1 = centre1.x + wheelRadius * Math.cos(theta);
            let y1 = centre1.y + wheelRadius * Math.sin(theta);
            let x2 = centre1.x + (wheelRadius + trackLength) * Math.cos(theta);
            let y2 = centre1.y + (wheelRadius + trackLength) * Math.sin(theta);
            let x3 = centre2.x + wheelRadius * Math.cos(theta-Math.PI);
            let y3 = centre2.y + wheelRadius * Math.sin(theta-Math.PI);
            let x4 = centre2.x + (wheelRadius + trackLength) * Math.cos(theta-Math.PI);
            let y4 = centre2.y + (wheelRadius + trackLength) * Math.sin(theta-Math.PI);
            rendered.moveTo(x1, y1);
            rendered.lineTo(x2, y2);
            rendered.moveTo(x3, y3);
            rendered.lineTo(x4, y4);
        }
        // now the two straight sections
        console.log("tracks = " +this.trackSpacing);
        for (let x=centre1.x; x<centre2.x; x+=this.trackSpacing) {
            rendered.moveTo(x + animationOffset * frameNumber, centre1.y + wheelRadius);
            rendered.lineTo(x + animationOffset * frameNumber, centre1.y + wheelRadius + trackLength);
            rendered.moveTo(x + animationOffset * frameNumber, centre1.y - wheelRadius);
            rendered.lineTo(x + animationOffset * frameNumber, centre1.y - wheelRadius - trackLength);
        }
        return rendered.image;
    }
    
    private toRadians(angle: number): number {
        return angle * Math.PI / 180;
    }

    private toDegrees(angle: number): number {
        return angle * 180 / Math.PI;
    }

    public update(width: number, height: number, interval: number, debugHook: Debugger) {
        // this.rendered.image.rotation += this.rotationSpeed * interval;
        // this.velocity.y += GRAVITY;
        this.velocity.x *= .95;
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        let distanceTravelled = distanceBetween(this.position, this.oldPosition);
        if (distanceTravelled >= this.trackSpacing) {
            this.oldPosition = {x: this.position.x, y: this.position.y};
            this.frameNumber = (this.frameNumber + 1) % ANIMATION_FRAMES;
            this.sprite.texture = this.frames[this.frameNumber];
        }
        this.sprite.position.set(this.position.x, this.position.y);
    }

    public left() {
        this.velocity = {x: -SPEED, y: 0}
    }

    public right() {
        this.velocity = {x: SPEED, y: 0}
    }

}
