// Falling rocks
import { Graphics } from "pixi.js";

const GRAVITY = 0.02;
const ROUGHNESS = 0.1;

export class Rock {
    public image: Graphics;
    private velocity = [0, 0];
    private position = [0, 0];
    private rotation: number;
    private maxAltitude: number;

    public constructor(maxAltitude: number, x: number, y: number, size: number) {
        // size is the number of points in the outline
        // but average radius is also proportional to size
        this.image = new Graphics();
        this.maxAltitude = maxAltitude;
        this.rotation = Math.random() / 25 - 0.02;
        const points: number[] = [];
        let min_x = 0, max_x = 0, min_y = 0, max_y = 0;
        let radius = size * 10
        let wiggle = 0.5;
        for (let i=0; i<size; i++) {
            let theta = 2 * Math.PI * i / size;
            wiggle += Math.random() * (2 * ROUGHNESS) - ROUGHNESS;  // +/- roughness
            let x = radius * Math.cos(theta) * wiggle;
            let y = radius * Math.sin(theta) * wiggle;
            min_x = Math.min(x, min_x);
            max_x = Math.max(x, max_x);
            min_y = Math.min(y, min_y);
            max_y = Math.max(y, max_y);
            points.push(x);
            points.push(y);
        }

        this.image
            .poly(points)
            .fill({
            color: 0x000000,
            })
            .stroke({
            width: 3,
            color: 0xffffff,
            });

        this.image.position.set(x, y);
        this.position = [x, y];
    }

    public update(interval: number) {
        this.image.rotation += this.rotation * interval;
        this.velocity[1] += GRAVITY
        this.position[0] += this.velocity[0]
        this.position[1] += this.velocity[1]
        //console.log(this.position);
        this.image.position.set(this.position[0], this.position[1]);
    }

    public altitude(): number {
        return this.maxAltitude - this.position[1];
    }
}

    // def render(self):
    //     # returns a surface with the rock outline on it
    //     sprite = pg.Surface((self.width, self.height), pg.SRCALPHA)
    //     pg.draw.polygon(sprite, [0, 0, 0], self.points)  # fill in black
    //     pg.draw.polygon(sprite, [255, 255, 255], self.points, width=1)  # white outline
    //     # DEBUG draw bounding box in green
    //     # pg.draw.rect(sprite, [0, 255, 0], pg.Rect(0, 0, self.width, self.height), width=1)
    //     return sprite