import { Application, Container } from "pixi.js";
import { RockManager } from "./rock_manager";
import { Landscape } from "./landscape";
import { Tank } from "./tank";
import { Debugger } from "./debug";

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
        this.app.stage.addChild(this.landscapeLayer);

        this.rockLayer = new Container();
        this.rockManager = new RockManager(
            this.rockLayer, 
            this.landscape, 
            MAX_ROCKS, MIN_ROCK_SIZE, MAX_ROCK_SIZE);
        this.app.stage.addChild(this.rockLayer);

        this.playerLayer = new Container();
        this.tank = new Tank(
            app.renderer,
            this.playerLayer,
            this.landscape,
            {x: app.screen.width*1/4, y: app.screen.height - GROUND_LEVEL},  // position
            20);  // size
        this.app.stage.addChild(this.playerLayer);

        this.debugLayer = new Container();
        this.debugInfo = new Debugger(this.debugLayer, this.rockManager);
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

    }

    private update(deltaTime: number) {
        if (this.paused) {
            return
        }

        if (this.keys.has("Space")) {
            this.paused = !this.paused;
        }

        this.rockManager.update(this.app.screen.width, this.app.screen.height, deltaTime, this.debugInfo);
        let scroll = this.tank.update(this.debugInfo);
        this.landscape.update(this.app.screen.width, scroll);
        //this.debugInfo.update(this.app.screen.width, this.app.screen.height);
    }

}
 