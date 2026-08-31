import { FiringSolution } from "./tank";
import { Shot } from "./shots";
import { Container, type PointData } from "pixi.js";
import { Debugger } from "./debug";

const DEBUG = false;

export class ShotManager {
    private displayLayer: Container;
    public shots: Shot[] = [];
    
    constructor(layer: Container) {
        this.displayLayer = layer;
    }

    update(interval: number, debugHook: Debugger) {
        for(const s of this.shots) {
            s.update(interval);
        }

        if (DEBUG) {
            for(const s of this.shots) {
                debugHook.drawPoint(s.position());
            }
        }
    }

    spawnShot(firingSolution: FiringSolution | null) {
        if (firingSolution) {
            const s = new Shot(
                firingSolution.startPoint,
                firingSolution.elevation,
                firingSolution.speed, 
                firingSolution.power,
                firingSolution.size);
            this.shots.push(s);
            this.displayLayer.addChild(s.rendered.image);
            return true;
        }
        return false;  // no shot fired;
    }
    
    public spawnExplosion(position: PointData, size: number) {
        for (let i=0; i<(size * 3); i++) {
            const angle = Math.random() * 2 * Math.PI;
            const f = new FiringSolution(
                position,
                angle,
                size, // speed
                size, // power
                5  // size
            );
            this.spawnShot(f);
        }
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