// all projectiles fired by the tank
import { Polygon, type PointData } from "pixi.js";
import { Renderer } from "./renderer";
import { Debugger } from "./debug";

const GRAVITY = 0.02;

export class Shot {
    public rendered: Renderer;
    public velocity: PointData;
    private outline: Polygon;

    public constructor(
        startPoint: PointData, 
        size: number, 
        startSpeed: number, 
        elevation: number) {

        this.rendered = new Renderer();
        const points: PointData[] = [
            {x: 0, y: 0},
            {x: size, y: 0},
            {x: size, y: size},
            {x: 0, y: size},
        ];
        this.outline = new Polygon(points);
        this.rendered.poly(points);

        this.rendered.image.position.copyFrom(startPoint);
        this.velocity = {  // TODO calculate from startSpeed and elevation
            x: startSpeed,
            y: 0
        };
    }

    public update(interval: number) {
        //this.rendered.image.rotation += this.rotationSpeed * interval;
        this.velocity.y += GRAVITY;
        this.rendered.image.position.x += this.velocity.x * interval;
        this.rendered.image.position.y += this.velocity.y * interval;
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
