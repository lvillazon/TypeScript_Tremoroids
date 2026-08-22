// all projectiles fired by the tank
import { type PointData } from "pixi.js";
import { Renderer } from "./renderer";
import { Debugger } from "./debug";

const GRAVITY = 0.04;

export class Shot {
    public rendered: Renderer;
    public velocity: PointData;
    public size: number;

    public constructor(
        startPoint: PointData, 
        size: number, 
        startSpeed: number, 
        elevation: number) {
        
        this.size = size;
        this.rendered = new Renderer();
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
        this.rendered.poly(points);

        this.rendered.image.position.copyFrom(startPoint);
        this.velocity = {
//            x:0,y:0};
            x: startSpeed * Math.cos(elevation),
            y: startSpeed * Math.sin(elevation)
        };
    }

    public update(interval: number) {
        //this.rendered.image.rotation += this.rotationSpeed * interval;
        this.velocity.y += GRAVITY;
        this.rendered.image.position.x += this.velocity.x * interval;
        this.rendered.image.position.y += this.velocity.y * interval;
        this.rendered.image.rotation = Math.atan2(this.velocity.y, this.velocity.x) - Math.PI/2;
    }

    public position(): PointData {
        return this.rendered.image.position;
    }

    // public collidesWith(ground: Landscape, debugHook: Debugger): PointData | null {
    //     // check if any of the points in the array are inside this rock
    //     // let absolutePoints: PointData[] = [];
    //     // for (let i=0; i<this.outline.points.length; i++) {
    //     //     absolutePoints.push(this.outline.points[i])
    //     // }
    //     const outline = this.absoluteOutline();
    //     for (let i=0; i<outline.points.length; i+=2) {
    //         const groundX = outline.points[i];
    //         const groundY = ground.heightAt(groundX);
    //         if (outline.contains(groundX, groundY)) {
    //             debugHook.drawPoint({x: groundX, y: groundY}, 0xFFFF00);
    //             return {x: groundX, y: groundY};
    //         }
    //     }
    //     return null;
    // }
}
