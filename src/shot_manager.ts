import { FiringSolution } from "./tank";
import { Shot } from "./shots";
import { Landscape } from "./landscape";
import { Container, type PointData } from "pixi.js";
import { Debugger } from "./debug";

export class ShotManager {
    private displayLayer: Container;
    public shots: Shot[] = [];
    private maxShots: number;
    private ground: Landscape;
    
    constructor(layer: Container, ground: Landscape, maxShots: number) {
        this.displayLayer = layer;
        this.maxShots = maxShots;
        this.ground = ground;
    }

    update(width: number, height: number, interval: number, debugHook: Debugger) {
        for(let i=0; i<this.shots.length; i++) {
            let s = this.shots[i];
            s.update(interval);
        }
    }

    spawnShot(firingSolution: FiringSolution) {
        const size = 10;
        const s = new Shot(
            firingSolution.startPoint,
            size, 
            firingSolution.speed, 
            firingSolution.elevation)
        this.shots.push(s);
        this.displayLayer.addChild(s.rendered.image);
    }

    public despawnShot(shotNumber: number) {
        // remove graphical part from the scene
        this.displayLayer.removeChild(this.shots[shotNumber].rendered.image);
        // remove from the shots array by replacing it with a copy of the last rock
        // and then popping the last rock off - saves shuffling elements down
        this.shots[shotNumber] = this.shots[this.shots.length -1];
        this.shots.pop();
    }
}