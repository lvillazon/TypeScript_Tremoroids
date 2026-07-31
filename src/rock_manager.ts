import { Rock } from "./rocks";
import { Container } from "pixi.js";

export class RockManager {
    private displayLayer: Container;
    private rocks: Rock[] = [];
    private maxRocks: number;
    
    constructor(layer: Container, maxRocks: number, min_size:number, max_size:number) {
        this.displayLayer = layer;
        this.maxRocks = maxRocks;
    }

    update(width: number, height: number, interval: number) {
        for(let i=0; i<this.rocks.length; i++) {
            this.rocks[i].update(interval);
            if (this.rocks[i].altitude() < 0) {
                this.displayLayer.removeChild(this.rocks[i].image); // remove graphical part from the scene
                // remove from the rocks array by replacing it with a copy of the last rock
                // and then popping the last rock off - saves shuffling elements down
                this.rocks[i] = this.rocks[this.rocks.length -1];
                this.rocks.pop();
            }
        }
        // add new rocks at random until we hit population cap
        if (this.rocks.length < this.maxRocks && this.rockSpawnChance()) {
            console.log("spawning rock at height" + height);
            const r = new Rock(height, Math.random() * width, -100, 10);  // spawn above the screen at random x pos
            this.rocks.push(r);
            this.displayLayer.addChild(r.image);
        }
    }

    rockSpawnChance(): boolean {
        return (Math.random() < 0.01);
    }
}