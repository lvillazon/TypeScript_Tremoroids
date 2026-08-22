import { Application, Container } from "pixi.js";
import { RockManager } from "./rock_manager";
import { Landscape } from "./landscape";
import { Tank } from "./tank";
import { Debugger } from "./debug";
import { CrossHairs } from "./crosshairs";
import { ShotManager } from "./shot_manager";

const GROUND_LEVEL = 450;
const MAX_ROCKS = 5;
const MIN_ROCK_SIZE = 80;
const MAX_ROCK_SIZE = 120;


export class Game {
    private app: Application;
    private rockLayer: Container;
    private rockManager: RockManager;
    private landscapeLayer: Container;
    private landscape: Landscape;
    private playerLayer: Container;
    private tank: Tank;
    private shootingLayer: Container;
    private crosshairs: CrossHairs;
    private shotManager: ShotManager;
    private debugInfo: Debugger;
    private debugLayer: Container;
    private paused = false;
    private keys: Set<string>;

    public constructor(app: Application) {
        this.app = app;
        
        this.landscapeLayer = new Container();
        this.landscape = new Landscape(
            this.landscapeLayer, 
            app.screen.height - GROUND_LEVEL, 
            app.screen.width,
        );

        this.rockLayer = new Container();
        this.rockManager = new RockManager(
            this.rockLayer, 
            this.landscape, 
            MAX_ROCKS, MIN_ROCK_SIZE, MAX_ROCK_SIZE);

        this.playerLayer = new Container();
        this.tank = new Tank(
            app.renderer,
            this.playerLayer,
            this.landscape,
            {x: app.screen.width*1/4, y: app.screen.height - GROUND_LEVEL},  // position
            20);  // size

        this.shootingLayer = new Container();
        this.crosshairs = new CrossHairs(this.shootingLayer, 15);
        this.shotManager = new ShotManager(this.shootingLayer, this.landscape, 100);

        this.debugLayer = new Container();
        this.debugInfo = new Debugger(this.debugLayer, this.rockManager);

        // add all the layers in the right order, from background to foreground
        this.app.stage.addChild(this.landscapeLayer);
        this.app.stage.addChild(this.rockLayer);
        this.app.stage.addChild(this.shootingLayer);
        this.app.stage.addChild(this.playerLayer);
        this.app.stage.addChild(this.debugLayer);


        this.app.ticker.add((ticker) => this.update(ticker.deltaTime));

        // keyboard handler
        this.keys = new Set<string>();
        window.addEventListener("keydown", (event) => {
            this.keys.add(event.code);
        });
        window.addEventListener("keyup", (event) => {
            this.keys.delete(event.code);
        });


        // mouse handler
        this.app.stage.eventMode = "static";
        this.app.stage.hitArea = this.app.screen;
        this.app.stage.on('pointermove', (event) => {
            const mouse = event.global;
            this.crosshairs.update({x: mouse.x, y: mouse.y}, this.debugInfo);
        });
        this.app.stage.on('pointerdown', () => {
            this.shotManager.spawnShot(this.tank.getFiringSolution());
        });
    }

    private update(deltaTime: number) {
        if (this.paused) {
            return
        }

        if (this.keys.has("Space")) {
            this.paused = !this.paused;
        }

        this.rockManager.update(this.app.screen.width, this.app.screen.height, deltaTime, this.debugInfo);
        this.shotManager.update(this.app.screen.width, this.app.screen.height, deltaTime, this.debugInfo);
        this.checkShotImpacts();
        
        let scroll = this.tank.update(this.crosshairs.position, this.debugInfo);
        this.landscape.update(this.app.screen.width, scroll);
        //this.debugInfo.update(this.app.screen.width, this.app.screen.height);
    }

    private checkShotImpacts() {
        for (let i=this.shotManager.shots.length-1; i>=0; i--) {  // backwards to avoid skipping on despawn
            const p = this.shotManager.shots[i].position();

            // collision check with the ground
            // collision check with rocks
            const rock = this.rockManager.findCollision(p);
            if (rock) {
                this.shotManager.despawnShot(i);
                this.rockManager.splitRock(this.app.screen.height, rock);
                this.rockManager.despawnRock(rock);
            }
            
            // bounds check with the screen
            if (p.x > this.app.screen.width || p.x < 0 || p.y > this.app.screen.height || p.y < 0) {
                this.shotManager.despawnShot(i);
            }
        }
    }

}
 