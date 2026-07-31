import { Application, Container } from "pixi.js";
import { RockManager } from "./rock_manager";

export class Game {
    private app: Application;
    private rockLayer: Container;
    private rockManager: RockManager;

    public constructor(app: Application) {
        this.app = app;
        this.rockLayer = new Container();
        this.rockManager = new RockManager(this.rockLayer, 10, 10, 50);
        this.app.stage.addChild(this.rockLayer);

        this.app.ticker.add((ticker) => {
            this.rockManager.update(app.screen.width, app.screen.height, ticker.deltaTime);
        });


    }
}
 