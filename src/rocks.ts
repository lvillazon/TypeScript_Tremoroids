// Falling rocks
import { Graphics, type PointData } from "pixi.js";

const GRAVITY = 0.02;
const ROUGHNESS = 0.1;

export class Rock {
    public image: Graphics;
    public velocity: PointData;
    public position: PointData;
    public rotationSpeed: number;
    private points: PointData[] = [];
    private maxAltitude: number;
    public radius: number;

    public constructor(maxAltitude: number, position: PointData, velocity: PointData, radius: number) {
        // the number of points in the outline is proportional to the radius
        this.image = new Graphics();
        this.maxAltitude = maxAltitude;
        this.rotationSpeed = Math.random() / 25 - 0.02;
        let min_x = 0, max_x = 0, min_y = 0, max_y = 0;
        this.radius = radius;
        const number_of_points = radius /10;
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
            this.points.push(p);
        }

        this.image
            .poly(this.points)
            .fill({
            color: 0x000000,
            })
            .stroke({
            width: 3,
            color: 0xffffff,
            });

        this.image.position.set(position.x, position.y);
        this.position = position;
        this.velocity = velocity;

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
        for (const p of this.points) {
            const y = p.y * Math.cos(this.image.rotation)
                    + p.x * Math.sin(this.image.rotation)
                    + this.position.y;
            if (y > lowest) {
                lowest = y;
            }
        }
        return lowest;    
    }

    public altitude(): number {
        // returns the height of the lowest point of the rock from the bottom of the screen
        // (more intuitive than pixel coords which increase as you go down the screen)
        return this.maxAltitude - this.lowestPoint();
    }

}
