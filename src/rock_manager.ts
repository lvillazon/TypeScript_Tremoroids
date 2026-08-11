import { Rock } from "./rocks";
import { Landscape } from "./landscape";
import { Container, type PointData } from "pixi.js";
import { Debugger } from "./debug";

const SPAWN_CHANCE = 0.01
const SHATTER_RADIUS = 30;
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
        console.log("rock size =" + minSize + " - " + maxSize);
        this.displayLayer = layer;
        this.maxRocks = maxRocks;
        this.minSize = minSize;
        this.maxSize = maxSize;
        this.ground = ground;
    }

    public debugGetRock(index: number): Rock {
        return this.rocks[index];
    }

    public debugGetRockCount(): number {
        return this.rocks.length;
    }

    update(width: number, height: number, interval: number, debugHook: Debugger) {
        for(let i=0; i<this.rocks.length; i++) {
            let r = this.rocks[i];
            r.update(interval);

            // collision check with the ground
            const collidePoint = r.collidesWith(this.ground, debugHook);
            if (collidePoint != null) {
                console.log("colliding");
                if (r.radius > SHATTER_RADIUS) {
                    // big rocks break into smaller ones
                    console.log("SMASH!");
                    this.splitRock(height, r);
                    this.ground.impact(r, collidePoint, debugHook);
                } else {
                    // smaller rocks become part of the landscape
                    // TODO
                    console.log("too small for crater");
                }
                this.despawnRock(i);
            }

            // remove any rocks that escaped hitting the ground and fell through the screen
            if (r.altitude() < 0) {
                this.despawnRock(i);
            }
        }


        // add new rocks at random until we hit population cap
        if ((this.rocks.length < this.maxRocks) && this.rockSpawnChance()) {
            // console.log("spawning rock at height" + height);
            // spawn above the screen at random x pos
            let startPoint = {x: Math.random() * width, y: -100};
            let size = Math.random() * (this.maxSize - this.minSize) + this.minSize;
            let startVelocity = {x:0, y:0}; //{x: Math.random(), y: 0};
            //console.log("spawning with size " + size);
            this.spawnRock(height, startPoint, startVelocity, size)
        }
    }

    splitRock(screenHeight: number, r: Rock) {
        const MAX_FRAGMENTS = 5;
        // shatter this rock into smaller fragments that bounce away
        const numberofFragments = Math.ceil(Math.random() * MAX_FRAGMENTS);
        for (let i=0; i<numberofFragments; i++) {
            const v = r.velocity.x 
                + (Math.random() * 2 * HORIZONTAL_VARIABILITY) - HORIZONTAL_VARIABILITY;
            this.spawnRock(
                screenHeight, 
                r.position, 
                {x: v, y: -r.velocity.y / VERTICAL_DECAY}, 
                // fragments can't be bigger than the original
                Math.min(r.radius, r.radius * 2 / numberofFragments));
        }
    }

    spawnRock(screenHeight: number, position: PointData, velocity: PointData, radius: number) {
        const r = new Rock(
            screenHeight, 
            {x: position.x, y: position.y}, 
            {x: velocity.x, y: velocity.y}, 
            radius);
        this.rocks.push(r);
        this.displayLayer.addChild(r.rendered.image);
    }

    private despawnRock(rockNumber: number) {
        // remove graphical part from the scene
        this.displayLayer.removeChild(this.rocks[rockNumber].rendered.image);
        // remove from the rocks array by replacing it with a copy of the last rock
        // and then popping the last rock off - saves shuffling elements down
        this.rocks[rockNumber] = this.rocks[this.rocks.length -1];
        this.rocks.pop();
    }

    rockSpawnChance(): boolean {
        return (Math.random() < SPAWN_CHANCE);
    }
}