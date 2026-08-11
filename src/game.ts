import { Application, Container } from "pixi.js";
import { RockManager } from "./rock_manager";
import { Landscape } from "./landscape";
import { Tank } from "./tank";
import { Debugger } from "./debug";

const GROUND_LEVEL = 450;
const MAX_ROCKS = 1;
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
            this.playerLayer,
            this.landscape,
            {x: app.screen.width/2, y: app.screen.height - GROUND_LEVEL},  // position
            50);  // size
        this.app.stage.addChild(this.playerLayer);

        this.debugLayer = new Container();
        this.debugInfo = new Debugger(this.debugLayer, this.rockManager);
        this.app.stage.addChild(this.debugLayer);

        this.app.ticker.add((ticker) => {
            if (this.paused) {
                return
            }
            this.rockManager.update(app.screen.width, app.screen.height, ticker.deltaTime, this.debugInfo);
            this.landscape.update(app.screen.width);
            this.tank.update(app.screen.width, app.screen.height, ticker.deltaTime, this.debugInfo);
            //this.debugInfo.update(app.screen.width, app.screen.height);
        });

        // keyboard handler
        window.addEventListener("keydown", (event) => {
            switch (event.code) {
                case "Space":
                    this.paused = !this.paused;
                    break;
                // case "ArrowLeft":
                //     this.rockManager.debugLeft();
                //     break;
                // case "ArrowRight":
                //     this.rockManager.debugRight();
                //     break;
                // case "ArrowUp":
                //     this.rockManager.debugUp();
                //     break;
                // case "ArrowDown":
                //     this.rockManager.debugDown();
                //     break;
            }
        });




    }
}
 