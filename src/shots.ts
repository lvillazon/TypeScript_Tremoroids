// all projectiles fired by the tank
import { type PointData } from "pixi.js";
import { Renderer } from "./renderer";

const GRAVITY = 0.04;

export class Shot {
    public rendered: Renderer;
    public velocity: PointData;
    public size: number;
    public power: number;
    public explode: boolean;

    public constructor(
        startPoint: PointData,
        elevation: number,
        startSpeed: number,
        shotPower: number,
        size: number) {
        
        this.size = size;
        this.power = shotPower;
        this.explode = false;
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

    public getPower(): number {
        return this.power;
    }

    public update(interval: number) {
        //this.rendered.image.rotation += this.rotationSpeed * interval;
        this.velocity.y += GRAVITY;
        this.rendered.image.position.x += this.velocity.x * interval;
        this.rendered.image.position.y += this.velocity.y * interval;
        this.rendered.image.rotation = Math.atan2(this.velocity.y, this.velocity.x) - Math.PI/2;
        // flak shots explode at the top of their arc
        if (this.power == 0 && this.velocity.y > 0) {
            this.explode = true;
        }
    }

    public position(): PointData {
        return this.rendered.image.position;
    }

    public leavesDebris(): boolean {
        return false;  // stop old shells piling up on the ground like rocks do
    }

}
