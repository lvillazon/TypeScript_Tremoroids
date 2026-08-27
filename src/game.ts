import { Application, Container, FederatedPointerEvent, Ticker, type PointData } from "pixi.js";
import { RockManager } from "./rock_manager";
import { Landscape } from "./landscape";
import { Tank } from "./tank";
import { Debugger } from "./debug";
import { CrossHairs } from "./crosshairs";
import { ShotManager } from "./shot_manager";
import { TextManager, Label } from "./text_renderer";

const GROUND_LEVEL = 150;
const MAX_ROCKS = 5;
const MIN_ROCK_SIZE = 80;
const MAX_ROCK_SIZE = 120;
const STATIONARY_TIME = 5;  // how many seconds you are allowed to be stopped before failing the level

// Game states
const PLAYING = 0;
const GAME_OVER = 1;

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
    private UILayer: Container;
    private textManager: TextManager
    private debugInfo: Debugger;
    private debugLayer: Container;
    private paused = false;
    private keys: Set<string>;
    private countdown: number;         // how long player has left to get moving again
    private countdownLabel: Label | null;
    private scoreLabel: Label;
    private score: number;
    private gameState: number;
    private onRestart: () => void;
    private tickerCallback: (ticker: Ticker) => void;
    private pointerMoveCallback = (event: FederatedPointerEvent) => {
        const mouse = event.global;
        this.crosshairs.update({x: mouse.x, y: mouse.y}, this.debugInfo);
    };
    private pointerDownCallback = () => {
        if (this.gameState == PLAYING) {
            this.shotManager.spawnShot(this.tank.getFiringSolution());
        }
    };

    
    public constructor(app: Application, onRestart: () => void) {
        this.gameState = PLAYING;
        this.app = app;
        this.onRestart = onRestart;
        this.countdown = -1;
        this.countdownLabel = null;
        
        this.landscapeLayer = new Container();
        this.landscape = new Landscape(
            this.landscapeLayer, 
            app.screen.height - GROUND_LEVEL, 
            app.screen.width,
        );this.landscapeLayer

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
        this.shotManager = new ShotManager(this.shootingLayer);

        this.UILayer = new Container();
        this.textManager = new TextManager(this.UILayer);
        this.textManager.addLabel("SC0RE", {x:10, y:10}, 40);  // label for the player score
        this.scoreLabel = this.textManager.addLabel("00000", {x: 170, y: 10}, 40);
        this.score = 0;

        this.debugLayer = new Container();
        this.debugInfo = new Debugger(this.debugLayer, this.rockManager);

        // add all the layers in the right order, from background to foreground
        this.app.stage.addChild(this.landscapeLayer);
        this.app.stage.addChild(this.rockLayer);
        this.app.stage.addChild(this.shootingLayer);
        this.app.stage.addChild(this.playerLayer);
        this.app.stage.addChild(this.UILayer);
        this.app.stage.addChild(this.debugLayer);

        this.tickerCallback = (ticker: Ticker) => 
            this.update(ticker.deltaTime, ticker.elapsedMS);
        this.app.ticker.add(this.tickerCallback);

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
        this.app.stage.on("pointermove", this.pointerMoveCallback);
        this.app.stage.on("pointerdown", this.pointerDownCallback);
    }

    private update(deltaTime: number, elapsedMS: number) {
        if (this.paused) {
            return
        }

        if (this.keys.has("Space")) {
            if (this.gameState == PLAYING) {
                this.paused = !this.paused;
            } else if (this.gameState == GAME_OVER) {
                queueMicrotask(() => {  // make sure we don't try to restart in the middle of a Pixi update
                    this.onRestart();
                });
                return;
            }
        } else if (this.keys.has("KeyX")) {
            this.explodeTank();
        }

        this.rockManager.update(this.app.screen.width, this.app.screen.height, deltaTime, this.debugInfo);
        this.shotManager.update(deltaTime, this.debugInfo);
        this.checkRockImpacts()
        this.checkShotImpacts();
        
        // move tank across landscape and adjust barrel elevation
        let scroll = this.tank.update(this.crosshairs.position(), this.debugInfo);
        this.landscape.update(this.app.screen.width, scroll);

        if (scroll === 0) {  // tank has stopped moving
            if (this.countdown === -1) {
                this.countdown = STATIONARY_TIME;
                this.countdownLabel = this.textManager.addLabel(
                    STATIONARY_TIME.toString(), 
                    {x: this.app.screen.width/2, y: 100}, 
                    50);
            } else if (this.countdownLabel) {
                this.countdown -= elapsedMS/1000;
                if (this.countdown > 0) {
                    // only update the countdown text if the number of seconds left is different
                    // otherwise we are pointlessly throwing away and recreating a lot of VectorChar objects
                    //if (Math.ceil(this.countdown).toString() != this.countdownLabel.text) {
                        this.countdownLabel.setText(Math.ceil(this.countdown).toString());
                    //}
                    // text size uses the decimal part of the time, so at n.99 seconds, the text has size (99 * 200) + 10
                    // and at n.01 seconds, the text has been shrunk to just 12
                    const size = (this.countdown - Math.floor(this.countdown)) * 200 + 10;
                    this.countdownLabel.resize(size);
                } else {
                    // time's up!
                    this.gameOver();
                }
            }
        } else if (!this.tank.isDead()) {
            this.updateScore(0.1);
        }
        
        //this.debugInfo.update(this.app.screen.width, this.app.screen.height);
    }

    private updateScore(points: number) {
        // add/subtract points from player score
        this.score += points;
        this.scoreLabel.setText(Math.floor(this.score).toString().padStart(5, "0"));
    }

    private checkShotImpacts() {
        for (let i=this.shotManager.shots.length-1; i>=0; i--) {  // backwards to avoid skipping on despawn
            const shot = this.shotManager.shots[i];
            const p = shot.position();

            // collision check with the ground
            const groundImpact = this.landscape.collidesWithPoint(p);
            if (groundImpact) {
                this.landscape.impact(shot, p, this.debugInfo);
                this.shotManager.despawnShot(i);
            } else {
                // collision check with rocks
                const rock = this.rockManager.findCollision(p);
                if (rock) {
                    this.updateScore(rock.size);  // more points for bigger rocks!
                    this.shotManager.despawnShot(i);
                    this.rockManager.splitRock(rock);
                    this.rockManager.despawnRock(rock);
                } 
                else
                // bounds check with the screen
                if (p.x > this.app.screen.width || p.x < 0 || p.y > this.app.screen.height) {
                    this.shotManager.despawnShot(i);
                }
            }
        }
    }

    private checkRockImpacts() {
        for (let i=this.rockManager.getRockCount()-1; i>=0; i--) {  // backwards to avoid skipping on despawn
            const rock = this.rockManager.getRock(i);

            // collision check with the tank
            if (!this.tank.isDead() && rock.collidesWithBoundingBox(this.tank.hitBox(), this.debugInfo)) {
                if (rock.willShatter()) {
                    // rocks big enough to break into smaller ones will destroy the tank
                    this.rockManager.splitRock(rock);
                    this.rockManager.despawnRockByIndex(i);
                    this.explodeTank();
                    this.gameOver();
                } else {
                    // smaller ones bounce off harmlessly
                    this.rockManager.bounceRock(rock);
                }

            } else {
                // collision check with the ground
                const collidePoint = rock.collidesWithGround(this.landscape, this.debugInfo);
                
                if (collidePoint) {
                    if (rock.willShatter()) {
                        // big rocks break into smaller ones
                        this.rockManager.splitRock(rock);
                        this.landscape.impact(rock, collidePoint, this.debugInfo);
                    } else {
                        // smaller rocks become part of the landscape
                        // TODO
                        //console.log("too small for crater");
                    }
                    this.rockManager.despawnRockByIndex(i);
                }
            }
        }
    }

    private explodeTank() {
        this.tank.explode();
        const p = this.tank.getPosition();
        this.rockManager.spawnDebris(
            {x: p.x, y: p.y - this.tank.getSize()},
            3,
            this.tank.getSize()
        );
    }

    private gameOver() {
        const gameOverMessage = this.textManager.addLabel(
            "GAME 0VER",
            {x:0, y:0},
            100
        );
        gameOverMessage.setPosition(
            this.app.screen.width/2 - gameOverMessage.getWidth()/2, 
            this.app.screen.height/2 - gameOverMessage.height/2);
        this.gameState = GAME_OVER;
    }

    public destroy() {
        // free all memory before quitting
        this.app.ticker.remove(this.tickerCallback);
        this.app.stage.removeEventListener("pointermove", this.pointerMoveCallback);
        this.app.stage.removeEventListener("pointerdown", this.pointerDownCallback);
        this.rockManager.destroy();
        this.landscape.destroy();
        this.tank.destroy();
        this.crosshairs.destroy();
        this.shotManager.destroy();
        this.textManager.destroy()
        this.debugInfo.destroy();
    }

}
 