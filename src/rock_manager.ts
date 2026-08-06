import { Rock } from "./rocks";
import { Landscape } from "./landscape";
import { Container, type PointData } from "pixi.js";
import { Debugger } from "./debug";

const SPAWN_CHANCE = 0.01
const SHATTER_RADIUS = 50;
const HORIZONTAL_VARIABILITY = 2; // how much horizontal velocity is added to shattered rocks
const VERTICAL_DECAY = 3; // how much vertical velocity drops for shattered rocks

export class RockManager {
    private displayLayer: Container;
    private rocks: Rock[] = [];
    private maxRocks: number;
    private minSize: number;
    private maxSize: number;
    private ground: Landscape;
    private debug: boolean;
    
    constructor(layer: Container, ground: Landscape, maxRocks: number, minSize:number, maxSize:number) {
        console.log("rock size =" + minSize + " - " + maxSize);
        this.displayLayer = layer;
        this.maxRocks = maxRocks;
        this.minSize = minSize;
        this.maxSize = maxSize;
        this.ground = ground;
        this.debug = false;
    }

    public debugGetRock(index: number): Rock {
        return this.rocks[index];
    }

    public debugGetRockCount(): number {
        return this.rocks.length;
    }

    debugLeft() {
        this.debug = true;
        this.rocks[0].position.x -= 10;
    }

    debugRight() {
        this.debug = true;
        this.rocks[0].position.x += 10;
    }

    debugUp() {
        this.debug = true;
        this.rocks[0].position.y -= 10;
    }

    debugDown() {
        this.debug = true;
        this.rocks[0].position.y += 10;
    }

    update(width: number, height: number, interval: number, debugHook: Debugger) {
        for(let i=0; i<this.rocks.length; i++) {
            let r = this.rocks[i];
            r.update(interval);

            // collision check with the ground
            if (r.collidesWith(this.ground, debugHook)) {
                console.log("colliding");
//            if (r.altitude() < this.ground.heightAt(r.position.x)) {
                //console.log("impact at height=" + this.ground.heightAt(r.position.x));
                if (r.radius > SHATTER_RADIUS) {
                    // big rocks break into smaller ones
                    //console.log("SMASH!");
                    this.splitRock(height, r);
                    this.ground.impact(r);
                } else {
                    // smaller rocks become part of the landscape
                    // TODO
                    console.log("too small for crater");
                }

                this.displayLayer.removeChild(this.rocks[i].image); // remove graphical part from the scene
                // remove from the rocks array by replacing it with a copy of the last rock
                // and then popping the last rock off - saves shuffling elements down
                this.rocks[i] = this.rocks[this.rocks.length -1];
                this.rocks.pop();
            }
        }
        // add new rocks at random until we hit population cap
        if (this.rocks.length < this.maxRocks && this.rockSpawnChance()) {
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
        // shatter this rock into smaller fragments that bounce away
        const v1 = r.velocity.x - (Math.random() * HORIZONTAL_VARIABILITY);
        const v2 = r.velocity.x + (Math.random() * HORIZONTAL_VARIABILITY);
        this.spawnRock(
            screenHeight, 
            r.position, 
            {x: v1, y: -r.velocity.y / VERTICAL_DECAY}, 
            r.radius/2);
        this.spawnRock(
            screenHeight,
            r.position, 
            {x: v2, y: -r.velocity.y / VERTICAL_DECAY}, 
            r.radius/2);
    }

    spawnRock(screenHeight: number, position: PointData, velocity: PointData, radius: number) {
        const r = new Rock(
            screenHeight, 
            {x: position.x, y: position.y}, 
            {x: velocity.x, y: velocity.y}, 
            radius);
        this.rocks.push(r);
        this.displayLayer.addChild(r.image);
    }

    rockSpawnChance(): boolean {
        return (Math.random() < SPAWN_CHANCE);
    }
}