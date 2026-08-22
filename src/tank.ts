// The player tank
import { type Renderer as PixiRenderer} from "pixi.js";
import { Container, Graphics, Sprite, Texture, type PointData } from "pixi.js";
import { Renderer } from "./renderer";
import { Debugger } from "./debug";
import type { Landscape } from "./landscape";

const ANIMATION_FRAMES = 5;
const SPEED = 1;
const GRAVITY = 0.02;

function distanceBetween(point1: PointData, point2:PointData): number {
    return Math.sqrt(((point1.x - point2.x) **2) + ((point1.y - point2.y) **2));
}
    
function toRadians(angle: number): number {
    return angle * Math.PI / 180;
}

function slope(point1: PointData, point2: PointData): number {
    // gradient of the line connecting these points   
    const xDiff = point1.x - point2.x;
    const yDiff = point1.y - point2.y;
    const slope = (yDiff==0) ? Infinity : yDiff / xDiff;
    return slope;
}

export class FiringSolution {
    public startPoint: PointData;
    public elevation: number;
    public speed: number;

    constructor(start: PointData, elevation: number, speed: number) {
        this.startPoint = {x: start.x, y: start.y};
        this.elevation = elevation;
        this.speed = speed;
    }
}

export class Tank {
    private displayLayer: Container;
    private tankContainer: Container;
    private ground: Landscape;
    public velocity: PointData;
    public landscapeX: number;  // how far the tank has travelled across the landscape
    private oldPosition: PointData;
    public rotationSpeed: number;
    private gunCaliber: number;
    private gunLength: number;
    private muzzlePosition: PointData;
    private gunElevation: number;
    private gunPower: number;
    private size: number;
    private trackSpacing: number;
    private centerContactPoint: PointData;
    private centerOfGravity: PointData;  // in local coords
    private frontWheel: PointData;
    private backWheel: PointData;

    private frames: Texture[] = [];
    private frameNumber: number;
    private sprite: Sprite;
    private barrel: Renderer;
    private minElevation: number;
    private maxElevation: number;

    public constructor(
        textureRenderer: PixiRenderer, 
        layer: Container, ground: Landscape, position: PointData, size: number) {
        this.displayLayer = layer;
        this.ground = ground;
        this.size = size;
        this.trackSpacing = size/3;
        this.gunCaliber = this.size * 0;  // half the barrel thickness, in pixels. 0 = single line
        this.gunLength = this.size * 2.5;  // barrel length
        this.muzzlePosition = {x: 0, y: 0};
        this.gunElevation = 0;
        this.gunPower = 7;

        for (let f=0; f<ANIMATION_FRAMES; f++) {
            const image = this.drawTankFrame(f);
            this.frames.push(
                textureRenderer.generateTexture(image)
            );
            image.destroy();  // explicitly release GPU resources used by Pixi
        }
        this.sprite = new Sprite(this.frames[0]);
        this.sprite.anchor.set(0.5, 1);  // explicitly set the translation/drawing achor to the bottom? left corner
        this.tankContainer = new Container();
        this.tankContainer.addChild(this.sprite);
        this.barrel = new Renderer();  // the barrel is a separate image overlaid, to allow aiming
        this.tankContainer.addChild(this.barrel.image);
        this.displayLayer.addChild(this.tankContainer);

        this.rotationSpeed = 0;
        this.tankContainer.position = {x: position.x, y: position.y};
        this.oldPosition = {x: this.tankContainer.position.x, y: this.tankContainer.position.y};
        // [-1.6, -0.55, 0.55, 1.6]
        this.centerContactPoint = {x: 0, y: 0};
        this.centerOfGravity = {x: 0, y: -size};
        this.frontWheel = {x: size * 2.0, y: size * 0.1};
        this.backWheel = {x: size * -2.0, y: size * -0.1};
        this.tankContainer.origin.set(this.centerOfGravity.x, this.centerOfGravity.y);
        this.landscapeX = 0;
        this.velocity = {x: 0, y: 0};
        this.frameNumber = 0;
        this.maxElevation = 0.1;
        this.minElevation = -1.5;
    }

    private drawTankFrame(frameNumber: number): Graphics {
        // procedurally draw the tank frames so we can create sprite textures
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

        return rendered.image;
    }

    public getFiringSolution(): FiringSolution {
        return new FiringSolution(
            this.muzzlePosition,
            this.gunElevation,
            this.gunPower
        );
    }

    private drawBarrel(aimPoint: PointData, debugHook: Debugger) {
        // barrel tries to point at the crosshairs
        // but has max and min elevation
        const barrelMount = {x: 0, y: -this.size * 1.7};  // where on the tank is the base of the barrel
        this.barrel.image.position.copyFrom(barrelMount);

        // calculate the angle to point at the crosshairs
        const mount = this.tankContainer.toGlobal(barrelMount);
        const dx = aimPoint.x - mount.x;
        const dy = aimPoint.y - mount.y;
        const absoluteAngle = Math.atan2(dy, dx);
        // make sure gun barrel doesn't exceed elevation limits
        this.barrel.image.rotation = 
            Math.min(this.maxElevation, Math.max(this.minElevation, 
                     absoluteAngle - this.tankContainer.rotation));
        this.gunElevation = this.barrel.image.rotation 
                            + this.tankContainer.rotation;

        //this.barrel.image.origin.set(0, 0);
        this.barrel.clear();
        this.barrel.moveTo(this.size, -this.gunCaliber);
        this.barrel.lineTo(this.gunLength, -this.gunCaliber);
        if (this.gunCaliber > 0) {
            this.barrel.lineTo(this.gunLength, this.gunCaliber);
            this.barrel.lineTo(this.size, this.gunCaliber);
        }
        this.muzzlePosition = this.barrel.image.toGlobal({
            x: this.gunLength,
            y: 0});
        debugHook.drawPoint(this.tankContainer.toGlobal(this.barrel.image.position), 0x00FF00);

    }

    public update(aimPoint: PointData, debugHook: Debugger) {
        this.drawBarrel(aimPoint, debugHook);  // update barrel to point at crosshairs

        // calculate rotation to keep the tank on the terrain
        // convert the key reference points on the tank from local to screen coords
        const absoluteCoG = this.tankContainer.toGlobal(this.centerOfGravity);
        const absoluteFrontWheel = this.tankContainer.toGlobal(this.frontWheel);
        const absoluteBackWheel = this.tankContainer.toGlobal(this.backWheel);
        const absoluteCenterContact = this.tankContainer.toGlobal(this.centerContactPoint);

        // when ground tries to rise heigher than the front contact point
        // rotate the tank to meet the slope
        const heightAtFrontWheel = this.ground.heightAt(absoluteFrontWheel.x);
        if (heightAtFrontWheel < absoluteFrontWheel.y) {
            const newTankSlope = slope(
                absoluteBackWheel,
                {x: absoluteFrontWheel.x, y: heightAtFrontWheel});
            if (newTankSlope < -0.6) {
                this.velocity = {x:0, y:0};  // too steep to carry on
            } else {
                this.tankContainer.rotation = Math.atan(newTankSlope);
                this.velocity.x = SPEED * Math.cos(this.tankContainer.rotation);
                this.velocity.y = SPEED * Math.sin(this.tankContainer.rotation);
            }

        } 
        // if there is fresh air under the tank, let it fall
        else {
            if (this.ground.heightAt(absoluteCenterContact.x) > absoluteCenterContact.y-1) {
                this.velocity.y += GRAVITY;
            } 
        }

        // update position on the scrolling landscape
        this.landscapeX += this.velocity.x;
        this.tankContainer.position.y += this.velocity.y;
        // update the tank animation if we have travelled far enough
        let distanceTravelled = distanceBetween(
            {x: this.landscapeX, y: this.tankContainer.position.y}, 
            this.oldPosition
        );
        if (distanceTravelled >= 1) {
            this.oldPosition = {x: this.tankContainer.position.x, y: this.tankContainer.position.y};
            this.frameNumber = (this.frameNumber + 1) % ANIMATION_FRAMES;
            this.sprite.texture = this.frames[this.frameNumber];
        }

        //debugHook.drawLine(absoluteBackWheel, absoluteFrontWheel, 0x00FF00);        
        //debugHook.drawPoint(this.screenPosition, 0xFFFFFF);
        //debugHook.drawPoint(absoluteFrontWheel, 0x00FF00);
        //debugHook.drawPoint(absoluteCoG, 0xFFFF00);
        //debugHook.drawPoint(absoluteBackWheel, 0xFF0000);
        
        return this.velocity.x;  // used to tell the landscape how much to scroll
    }

}
