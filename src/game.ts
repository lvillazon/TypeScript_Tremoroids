import { Application, Container } from "pixi.js";
import { RockManager } from "./rock_manager";
import { Landscape } from "./landscape";

const GROUND_LEVEL = 60;
const MAX_ROCKS = 10;
const MIN_ROCK_SIZE = 80;
const MAX_ROCK_SIZE = 120;


export class Game {
    private app: Application;
    private rockLayer: Container;
    private rockManager: RockManager;
    private landscapeLayer: Container;
    private landscape: Landscape;

    public constructor(app: Application) {
        this.app = app;
        
        this.rockLayer = new Container();
        this.rockManager = new RockManager(
            this.rockLayer, 
            GROUND_LEVEL, MAX_ROCKS, MIN_ROCK_SIZE, MAX_ROCK_SIZE);
        this.app.stage.addChild(this.rockLayer);
        this.app.ticker.add((ticker) => {
            this.rockManager.update(app.screen.width, app.screen.height, ticker.deltaTime);
        });

        this.landscapeLayer = new Container();
        this.landscape = new Landscape(this.landscapeLayer, GROUND_LEVEL);
        this.app.stage.addChild(this.landscapeLayer);
        this.app.ticker.add((ticker) => {
            this.landscape.update(app.screen.width, app.screen.height, ticker.deltaTime);
        });



    }
}
 