import { Rock } from "./rocks";
import { Landscape } from "./landscape";
import { Container, type PointData } from "pixi.js";

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
    
    constructor(layer: Container, ground: Landscape, maxRocks: number, minSize:number, maxSize:number) {
        console.log("rock size =" + minSize + " - " + maxSize);
        this.displayLayer = layer;
        this.maxRocks = maxRocks;
        this.minSize = minSize;
        this.maxSize = maxSize;
        this.ground = ground;
    }

    update(width: number, height: number, interval: number) {
        // DEBUG show a bounding box around the rock
        // if (this.rocks.length > 0) {
        //     const box = new Graphics();
        //     box.moveTo(this.rocks[0].image.x -10, this.rocks[0].altitude());
        //     box.lineTo(this.rocks[0].image.x +10, this.rocks[0].altitude())
        //         .stroke({
        //             width: 1,
        //             color: 0x00ff00,
        //         });
        //     this.displayLayer.addChild(box);
        //     console.log(this.rocks[0].altitude());
        // }
        if (this.rocks.length > 0) {
            //console.log("Rock 0 of " + this.rocks.length + " is at pos:" + this.rocks[0].position.y);
        }
        for(let i=0; i<this.rocks.length; i++) {
            let r = this.rocks[i];
            r.update(interval);

            // collision check with the ground
            if (r.altitude() < this.ground.heightAt(r.position.x)) {
                //console.log("impact at height=" + this.ground.heightAt(r.position.x));
                if (r.radius > SHATTER_RADIUS) {
                    // big rocks break into smaller ones
                    //console.log("SMASH!");
                    this.splitRock(height, r);
                    this.ground.impact(r);
                } else {
                    // smaller rocks become part of the landscape
                    // TODO
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
            //console.log("spawning with size " + size);
            this.spawnRock(height, startPoint, {x: Math.random(), y: 0}, size)
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