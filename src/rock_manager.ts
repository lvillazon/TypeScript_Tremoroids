import { Rock } from "./rocks";
import { Landscape } from "./landscape";
import { Container, type PointData } from "pixi.js";
import { Debugger } from "./debug";

const SPAWN_CHANCE = 0.01
const HORIZONTAL_VARIABILITY = 2; // how much horizontal velocity is added to shattered rocks
const VERTICAL_DECAY = 3; // how much vertical velocity drops for shattered rocks

export class RockManager {
    private displayLayer: Container;
    private rocks: Rock[] = [];
    private maxRocks: number;
    private minSize: number;
    private maxSize: number;
    private ground: Landscape;
    
    constructor(layer: Container, ground: Landscape, maxRocks: number, minSize:number, maxSize:number) {
        this.displayLayer = layer;
        this.maxRocks = maxRocks;
        this.minSize = minSize;
        this.maxSize = maxSize;
        this.ground = ground;
    }

    public getRock(index: number): Rock {
        return this.rocks[index];
    }

    public getRockCount(): number {
        return this.rocks.length;
    }

    update(width: number, height: number, interval: number, debugHook: Debugger) {
        for(let i=0; i<this.rocks.length; i++) {
            let r = this.rocks[i];
            r.update(interval);

            // remove any rocks that escaped hitting the ground and fell through the screen
            if (r.altitude() > height) {
                this.despawnRockByIndex(i);
            }
        }

        // add new rocks at random until we hit population cap
        if ((this.rocks.length < this.maxRocks) && this.rockSpawnChance()) {
            // console.log("spawning rock at height" + height);
            // spawn above the screen at random x pos
            let startPoint = {x: Math.random() * width, y: -100};
            let size = Math.random() * (this.maxSize - this.minSize) + this.minSize;
            let startVelocity = {x: Math.random() * 2, y: 0};
            this.spawnRock(startPoint, startVelocity, size)
        }
    }

    splitRock(r: Rock) {
        const MAX_FRAGMENTS = 5;
        // shatter this rock into smaller fragments that bounce away
        const numberofFragments = Math.ceil(Math.random() * MAX_FRAGMENTS);
        for (let i=0; i<numberofFragments; i++) {
            this.spawnRock(
                r.position, 
                this.getBounceVelocity(r.velocity), 
                // fragments can't be bigger than the original
                Math.min(r.size, r.size * 2 / numberofFragments));
        }
    }

    private getBounceVelocity(velocity: PointData): PointData {
        return {
            x: velocity.x 
                + (Math.random() * 2 * HORIZONTAL_VARIABILITY) - HORIZONTAL_VARIABILITY,
            y: -velocity.y / VERTICAL_DECAY
        }
    }

    public bounceRock(r: Rock) {
        r.velocity = this.getBounceVelocity(r.velocity);
    }

    public spawnRock(position: PointData, velocity: PointData, radius: number) {
        const r = new Rock(
            {x: position.x, y: position.y}, 
            {x: velocity.x, y: velocity.y}, 
            radius);
        this.rocks.push(r);
        this.displayLayer.addChild(r.rendered.image);
    }

    public spawnDebris(position: PointData, fragments: number, maxSize: number) {
        for (let i=0; i<fragments; i++) {
            this.spawnRock(
                position,
                this.getBounceVelocity({x: 0, y: 5 }),
                Math.random() * maxSize
            );
        }
    }

    public despawnRockByIndex(rockNumber: number) {
        if (rockNumber >= this.rocks.length) return;  // ignore atempts to delete non-existent rocks

        // remove graphical part from the scene
        this.displayLayer.removeChild(this.rocks[rockNumber].rendered.image);
        this.rocks[rockNumber].rendered.image.destroy();
        
        // remove from the rocks array by replacing it with a copy of the last rock
        // and then popping the last rock off - saves shuffling elements down
        this.rocks[rockNumber] = this.rocks[this.rocks.length -1];
        this.rocks.pop();
    }

    public despawnRock(r: Rock) {
        if (r==null) return;
        let i=0;
        while (i<this.rocks.length && r != this.rocks[i]) {
            i++;
        }
        this.despawnRockByIndex(i);
    }

    rockSpawnChance(): boolean {
        return (Math.random() < SPAWN_CHANCE);
    }

    public findCollision(position: PointData): Rock | null {
        // return the first rock that collisdes with this point, or null if none
        let i = 0;
        while (i<this.rocks.length) {
            if (this.rocks[i].collidesWithPoint(position)) {
                return this.rocks[i];
            }
            i++;
        }
        return null;
    }

    public destroy() {
        for (const rock of this.rocks) {
            rock.rendered.image.destroy();
        }
    }
}