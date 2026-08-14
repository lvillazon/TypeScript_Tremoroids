// The player tank
import { type Renderer as PixiRenderer} from "pixi.js";
import { Container, Graphics, Sprite, Texture, type PointData } from "pixi.js";
import { Renderer } from "./renderer";
import { Debugger } from "./debug";
import type { Landscape } from "./landscape";

const ANIMATION_FRAMES = 5;
const SPEED = 1;

function distanceBetween(point1: PointData, point2:PointData) {
    return Math.sqrt(((point1.x - point2.x) **2) + ((point1.y - point2.y) **2));
}

export class Tank {
    private displayLayer: Container;
    private ground: Landscape;
    public velocity: PointData;
    public screenPosition: PointData;  // where the tanks sprite is on the screen
    public landscapeX: number;  // how far the tank has travelled across the landscape
    private oldPosition: PointData;
    public rotationSpeed: number;
    private barrelAngle: number;
    private size: number;
    private trackSpacing: number;
    private readonly frontContactPoint: PointData;  // used for determining the tank's angle wrt the ground
    private readonly centerContactPoint: PointData;
    private readonly backContactPoint: PointData;
    private absoluteFrontContactPoint: PointData = {x:0, y:0};
    private absoluteCenterContactPoint: PointData = {x:0, y:0};
    private absoluteBackContactPoint: PointData = {x:0, y:0};

    private frames: Texture[] = [];
    private frameNumber: number;
    private sprite: Sprite;

    public constructor(
        textureRenderer: PixiRenderer, 
        layer: Container, ground: Landscape, position: PointData, size: number) {
        this.displayLayer = layer;
        this.ground = ground;
        this.size = size;
        this.trackSpacing = size/3;
        this.barrelAngle = this.toRadians(-30);  // in degrees
        for (let f=0; f<ANIMATION_FRAMES; f++) {
            const image = this.drawTankFrame(f);
            this.frames.push(
                textureRenderer.generateTexture(image)
            );
            image.destroy();  // explicitly release GPU resources used by Pixi
        }
        this.sprite = new Sprite(this.frames[0]);
        this.sprite.anchor.set(0.5, 1.0);  // move the translation/rotation achor to the middle of the bottom edged
        this.displayLayer.addChild(this.sprite);
        this.rotationSpeed = 0;
        this.screenPosition = {x: position.x, y: position.y};
        this.oldPosition = {x: this.screenPosition.x, y: this.screenPosition.y};
        // [-1.6, -0.55, 0.55, 1.6]
        this.frontContactPoint = {x: size * 1.6, y: 0};
        this.centerContactPoint = {x: 0, y: 0};
        this.backContactPoint = {x: size * -1.6, y: 0};
        this.sprite.origin.set(this.backContactPoint.x, this.backContactPoint.y);
        this.landscapeX = 0;
        this.velocity = {x: 0, y: 0};
        this.frameNumber = 0;
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
        let trackAngleOffset = Math.PI * 0.9;
        for (let i=0; i<tank_image_detail; i++) {
            let frontTheta = Math.PI/2 + Math.PI * i / tank_image_detail 
                            + animationOffsetAngle * frameNumber;
            let backTheta = frontTheta - trackAngleOffset;
            let x1 = centre1.x + wheelRadius * Math.cos(frontTheta);
            let y1 = centre1.y + wheelRadius * Math.sin(frontTheta);
            let x2 = centre1.x + (wheelRadius + trackLength) * Math.cos(frontTheta);
            let y2 = centre1.y + (wheelRadius + trackLength) * Math.sin(frontTheta);
            let x3 = centre2.x + wheelRadius * Math.cos(backTheta);
            let y3 = centre2.y + wheelRadius * Math.sin(backTheta);
            let x4 = centre2.x + (wheelRadius + trackLength) * Math.cos(backTheta);
            let y4 = centre2.y + (wheelRadius + trackLength) * Math.sin(frontTheta-trackAngleOffset);
            rendered.moveTo(x1, y1);
            rendered.lineTo(x2, y2);
            rendered.moveTo(x3, y3);
            rendered.lineTo(x4, y4);
        }
        // now the two straight sections
        for (let x=centre1.x; x<centre2.x; x+=this.trackSpacing) {
            rendered.moveTo(x + animationOffset * frameNumber, centre1.y + wheelRadius);
            rendered.lineTo(x + animationOffset * frameNumber, centre1.y + wheelRadius + trackLength);
            rendered.moveTo(x + animationOffset * frameNumber, centre1.y - wheelRadius);
            rendered.lineTo(x + animationOffset * frameNumber, centre1.y - wheelRadius - trackLength);
        }

        rendered.image.circle(0, 0, 3).fill({color: 0x00FFFF});  // DEBUG show centre

        return rendered.image;
    }
    
    private toRadians(angle: number): number {
        return angle * Math.PI / 180;
    }

    // private toDegrees(angle: number): number {
    //     return angle * 180 / Math.PI;
    // }

    public update(width: number, height: number, interval: number, debugHook: Debugger) {
        // this.rendered.image.rotation += this.rotationSpeed * interval;
        // this.velocity.y += GRAVITY;
        this.velocity.x = SPEED;
        this.landscapeX += this.velocity.x;
        this.screenPosition.y += this.velocity.y;
        let distanceTravelled = distanceBetween(
            {x: this.landscapeX, y: this.screenPosition.y}, 
            this.oldPosition
        );
        // console.log(
        //     "old:" + this.oldPosition.x + ", " + this.oldPosition.y + 
        //     " current:" + this.position.x + ", " + this.position.y + 
        //     " distance ="+ distanceTravelled);
        if (distanceTravelled >= 1) {
            this.oldPosition = {x: this.screenPosition.x, y: this.screenPosition.y};
            this.frameNumber = (this.frameNumber + 1) % ANIMATION_FRAMES;
            this.sprite.texture = this.frames[this.frameNumber];
        }

        this.sprite.position.set(this.screenPosition.x, this.screenPosition.y);
        
        // calculate rotation to keep the tank on the terrain
        const frontHeight = this.ground.heightAt(this.absoluteFrontContactPoint.x);
        const centerHeight = this.ground.heightAt(this.absoluteCenterContactPoint.x);
        const backHeight = this.ground.heightAt(this.absoluteBackContactPoint.x);
        if (this.absoluteFrontContactPoint.y > frontHeight) {
            this.sprite.origin.set(this.backContactPoint.x, this.backContactPoint.y);
            this.sprite.rotation -= 0.01;
        }

        this.recalculateRotationPoints();
        
        debugHook.drawPoint(this.screenPosition, 0xFF00FF);
        debugHook.drawPoint(this.absoluteFrontContactPoint, 0x00FF00);
        debugHook.drawPoint(this.absoluteCenterContactPoint, 0xFFFF00);
        debugHook.drawPoint(this.absoluteBackContactPoint, 0xFF0000);
        
        return this.velocity.x;
    }

    public left() {
        this.velocity = {x: -SPEED, y: 0}
    }

    public right() {
        this.velocity = {x: SPEED, y: 0}
    }

    private recalculateRotationPoints() {
        // rotate the front and rear points around the center point
        const theta = this.sprite.rotation;
        const absoluteOrigin = {
            x: this.screenPosition.x + this.sprite.origin.x,
            y: this.screenPosition.y + this.sprite.origin.y
        };
        this.absoluteFrontContactPoint = this.rotateToAbsoluteCoordinates(
            this.frontContactPoint,
            absoluteOrigin,
            theta
        )
        this.absoluteCenterContactPoint = this.rotateToAbsoluteCoordinates(
            this.centerContactPoint,
            absoluteOrigin,
            theta
        )
        this.absoluteBackContactPoint = this.rotateToAbsoluteCoordinates(
            this.backContactPoint,
            absoluteOrigin,
            theta
        )
    }

    private rotateToAbsoluteCoordinates(point: PointData, center: PointData, angle: number): PointData{
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: 
                center.x 
                + point.x * cos
                - point.y * sin,
            y:
                center.y
                + point.x * sin
                + point.y * cos
        };
    }

}
