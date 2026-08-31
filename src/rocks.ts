// Falling rocks
import { Polygon, Bounds, type PointData } from "pixi.js";
import { Renderer } from "./renderer";
import { Debugger } from "./debug";
import type { Landscape } from "./landscape";

const GRAVITY = 0.02;
const ROUGHNESS = 0.1;
const SHATTER_RADIUS = 30;

export class Rock {
    public rendered: Renderer;
    public velocity: PointData;
    public position: PointData;
    public rotationSpeed: number;
    private outline: Polygon;
    public size: number;

    public constructor(position: PointData, velocity: PointData, size: number) {
        // the number of points in the outline is proportional to the radius
        this.rendered = new Renderer();
        this.rotationSpeed = Math.random() / 25 - 0.02;
        let min_x = 0, max_x = 0, min_y = 0, max_y = 0;
        this.size = size;
        const number_of_points = Math.max(size /10, 3);  // need at least 3 points
        const points: PointData[] = [];
        let wiggle = 0.5;
        for (let i=0; i<number_of_points; i++) {
            const theta = 2 * Math.PI * i / (number_of_points + 1);
            wiggle += Math.random() * (2 * ROUGHNESS) - ROUGHNESS;  // +/- roughness
            const x = this.size * Math.cos(theta) * wiggle;
            const y = this.size * Math.sin(theta) * wiggle;
            min_x = Math.min(x, min_x);
            max_x = Math.max(x, max_x);
            min_y = Math.min(y, min_y);
            max_y = Math.max(y, max_y);
            const p: PointData = {x, y};
            points.push(p);
        }
        // recalculate the actual radius based on the points plotted
        this.size = (max_x - min_x) /2;
        this.outline = new Polygon(points);
        this.rendered.poly(points);

        this.rendered.image.position.set(position.x, position.y);
        this.position = position;
        this.velocity = velocity;
    }

    public willShatter(): boolean {
        // any rocks over a certain size shatter when they are shot or hit the ground
        return (this.size > SHATTER_RADIUS);
    }

    public willBounce(): boolean {
        // is it big enough to bounce off the tank?
        return (this.size > SHATTER_RADIUS/2);
    }

    public getPower(): number {
        return this.size;
    }

    public update(interval: number) {
        this.rendered.image.rotation += this.rotationSpeed * interval;
        this.velocity.y += GRAVITY;
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.rendered.image.position.set(this.position.x, this.position.y);
    }

    public lowestPoint(): number {
        let lowest = -Infinity;
        for (let i=0; i<this.outline.points.length; i+=2) {
            let px = this.outline.points[i];
            let py = this.outline.points[i+1];
            const y = py * Math.cos(this.rendered.image.rotation)
                    + px * Math.sin(this.rendered.image.rotation)
                    + this.position.y;
            if (y > lowest) {
                lowest = y;
            }
        }
        return lowest;    
    }

    public getImpactOutline(): PointData[] {
        // return the outline of thr bottom half of the rock, in absolute coords
        // also allowing for rotation
        let absolutePoints: PointData[] = [];
        for (let i=0; i<this.outline.points.length; i+=2) {
            const px = this.outline.points[i];
            const py = this.outline.points[i+1];
            const x = px * Math.cos(this.rendered.image.rotation)
                    - py * Math.sin(this.rendered.image.rotation)
                    + this.position.x;
            const y = px * Math.sin(this.rendered.image.rotation)
                    + py * Math.cos(this.rendered.image.rotation)
                    + this.position.y;
            if (y > this.position.y) {
                absolutePoints.push({x: x, y: y}); 
            }
        }
        return absolutePoints;   
    }

    private absoluteOutline(): Polygon {
        // return the outline in absolute coords
        // also allowing for rotation
        let absolutePoints: PointData[] = [];
        for (let i=0; i<this.outline.points.length; i+=2) {
            const px = this.outline.points[i];
            const py = this.outline.points[i+1];
            const x = px * Math.cos(this.rendered.image.rotation)
                    - py * Math.sin(this.rendered.image.rotation)
                    + this.position.x;
            const y = px * Math.sin(this.rendered.image.rotation)
                    + py * Math.cos(this.rendered.image.rotation)
                    + this.position.y;
            absolutePoints.push({x: x, y: y}); 
        }
        return new Polygon(absolutePoints);   
    }

    public altitude(): number {
        // returns the y-coord of the lowest point of the rock from the bottom of the screen
        // (remember y-coords increase as you move down the screen)
        return this.lowestPoint();
    }

    public collidesWithGround(ground: Landscape, debugHook: Debugger): PointData | null {
        // check if any of the points in the array are inside this rock
        const outline = this.absoluteOutline();
        for (let i=0; i<outline.points.length; i+=2) {
            const groundX = outline.points[i];
            const groundY = ground.heightAt(groundX);
            if (outline.contains(groundX, groundY)) {
                debugHook.drawPoint({x: groundX, y: groundY}, 0xFFFF00);
                return {x: groundX, y: groundY};
            }
        }
        return null;
    }

    public collidesWithBoundingBox(hitBox: Bounds, debugHook: Debugger): boolean {
        // check if any of the points in the array are inside the hitbox
        const outline = this.absoluteOutline();
        for (let i=0; i<outline.points.length; i+=2) {
            if (hitBox.containsPoint(outline.points[i], outline.points[i+1])) {
                debugHook.drawPoint({x: outline.points[i], y: outline.points[i+1]}, 0xFFFF00);
                return true;
            }
        }
        return false;
    }

    public collidesWithPoint(point: PointData): boolean {
        return this.absoluteOutline().contains(point.x, point.y);
    }
}
