import { FiringSolution } from "./tank";
import { Shot } from "./shots";
import { Container } from "pixi.js";
import { Debugger } from "./debug";

export class ShotManager {
    private displayLayer: Container;
    public shots: Shot[] = [];
    
    constructor(layer: Container) {
        this.displayLayer = layer;
    }

    update(interval: number, debugHook: Debugger) {
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
        this.shots[shotNumber].rendered.image.destroy();
        // remove from the shots array by replacing it with a copy of the last rock
        // and then popping the last rock off - saves shuffling elements down
        this.shots[shotNumber] = this.shots[this.shots.length -1];
        this.shots.pop();
    }

    public destroy() {
        for (let i=this.shots.length-1; i>=0; i--) {
            this.despawnShot(i);
        }
    }
}