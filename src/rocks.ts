// Falling rocks
import { Graphics, Polygon, type PointData } from "pixi.js";
import { Debugger } from "./debug";
import type { Landscape } from "./landscape";

const GRAVITY = 0.02;
const ROUGHNESS = 0.1;

export class Rock {
    public image: Graphics;
    public velocity: PointData;
    public position: PointData;
    public rotationSpeed: number;
    private outline: Polygon;
    private maxAltitude: number;
    public radius: number;
    public color: number;
    public collidePoint: PointData; // DEBUG

    public constructor(maxAltitude: number, position: PointData, velocity: PointData, radius: number) {
        // the number of points in the outline is proportional to the radius
        this.image = new Graphics();
        this.maxAltitude = maxAltitude;
        this.rotationSpeed = Math.random() / 25 - 0.02;
        let min_x = 0, max_x = 0, min_y = 0, max_y = 0;
        this.radius = radius;
        const number_of_points = radius /10;
        const points: PointData[] = [];
        let wiggle = 0.5;
        for (let i=0; i<number_of_points; i++) {
            let theta = 2 * Math.PI * i / number_of_points;
            wiggle += Math.random() * (2 * ROUGHNESS) - ROUGHNESS;  // +/- roughness
            let x = this.radius * Math.cos(theta) * wiggle;
            let y = this.radius * Math.sin(theta) * wiggle;
            min_x = Math.min(x, min_x);
            max_x = Math.max(x, max_x);
            min_y = Math.min(y, min_y);
            max_y = Math.max(y, max_y);
            let p: PointData = {x, y};
            points.push(p);
        }
        this.outline = new Polygon(points);
        this.color = 0xffffff;
        this.image
            .poly(this.outline.points)
            .fill({
            color: 0x000000,
            })
            .stroke({
            width: 3,
            color: this.color,
            });
        // DEBUG add a line from the centre to the bottom point, to show orientation
        //this.image.lineTo(0, this.radius).stroke({width: 3, color:0x00ff00}); 

        this.image.position.set(position.x, position.y);
        this.position = position;
        this.velocity = velocity;
        // DEBUG
        // the collidePoint is the x,y in absolute coords where we will check for impact
        this.collidePoint = {x:position.x, y:position.y}

    }

    public update(interval: number) {
        this.image.rotation += this.rotationSpeed * interval;
        this.velocity.y += GRAVITY;
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        //console.log(this.position);
        this.image.position.set(this.position.x, this.position.y);
    }

    private lowestPoint(): number {
        let lowest = -Infinity;
        for (let i=0; i<this.outline.points.length; i+=2) {
            let px = this.outline.points[i];
            let py = this.outline.points[i+1];
            const y = py * Math.cos(this.image.rotation)
                    + px * Math.sin(this.image.rotation)
                    + this.position.y;
            if (y > lowest) {
                lowest = y;
            }
        }
        return lowest;    
    }

    public debugGetOutline(): Polygon {  // public wrapper just for debug
        return this.absoluteOutline();
    }

    private absoluteOutline(): Polygon {
        // return the outline in absolute coords
        // also allowing for rotation
        let absolutePoints: PointData[] = [];
        for (let i=0; i<this.outline.points.length; i+=2) {
            const px = this.outline.points[i];
            const py = this.outline.points[i+1];
            const x = px * Math.cos(this.image.rotation)
                    - py * Math.sin(this.image.rotation)
                    + this.position.x;
            const y = px * Math.sin(this.image.rotation)
                    + py * Math.cos(this.image.rotation)
                    + this.position.y;
            absolutePoints.push({x: x, y: y}); 
        }
        return new Polygon(absolutePoints);   
    }

    public altitude(): number {
        // returns the height of the lowest point of the rock from the bottom of the screen
        // (more intuitive than pixel coords which increase as you go down the screen)
        return this.maxAltitude - this.lowestPoint();
    }

    public collidesWith(ground: Landscape, debugHook: Debugger): boolean {
        // check if any of the points in the array are inside this rock
        // let absolutePoints: PointData[] = [];
        // for (let i=0; i<this.outline.points.length; i++) {
        //     absolutePoints.push(this.outline.points[i])
        // }
        const outline = this.absoluteOutline();
        for (let i=0; i<outline.points.length; i+=2) {
            const groundX = outline.points[i];
            const groundY = ground.heightAt(groundX);
            if (outline.contains(groundX, groundY)) {
                debugHook.drawPoint({x: groundX, y: groundY});
                return true;
            }
        }
        return false;
    }

}
