import { Application, Container, FederatedPointerEvent, Ticker} from "pixi.js";
import { Renderer, type RenderStyle} from "./renderer";
import { RockManager } from "./rock_manager";
import { Landscape } from "./landscape";
import { Tank } from "./tank";
import { Debugger } from "./debug";
import { CrossHairs } from "./crosshairs";
import { ShotManager } from "./shot_manager";
import { TextManager, Label } from "./text_renderer";
import { SoundManager } from "./sound_manager";

const DEBUG_GLOBAL = false;
const GROUND_LEVEL = 150;
const MAX_ROCKS = 5;
const MIN_ROCK_SIZE = 80;
const MAX_ROCK_SIZE = 120;
const STATIONARY_TIME = 5;  // how many seconds you are allowed to be stopped before failing the level
const STUCK_THRESHOLD = 0.1;  // how much movement is needed per frame before you count as stuck 
const UNSTUCK_THRESHOLD = 1;  // how much movement is needed to count as free again

// Game states
type GameState = "PAUSED" | "PLAYING" | "STUCK" | "JUST LOST" | "GAME OVER";

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
    private soundManager: SoundManager;
    private worldLayer: Container;
    private UILayer: Container;
    private textManager: TextManager
    private debugInfo: Debugger;
    private debugLayer: Container;
    private keys: Set<string>;
    private countdown: number;         // how long player has left to get moving again
    private countdownLabel: Label | null;
    private scoreLabel: Label;
    private score: number;
    private gameState: GameState;
    private cameraShake: number;
    private firing: boolean;
    private scroll: number;
    private onRestart: () => void;
    private tickerCallback: (ticker: Ticker) => void;
    private pointerMoveCallback = (event: FederatedPointerEvent) => {
        const mouse = event.global;
        this.crosshairs.update({x: mouse.x, y: mouse.y}, this.debugInfo);
    };
    private pointerDownCallback = () => {
        this.firing = true;
    };
    private pointerUpCallback = () => {
        this.firing = false;
    };

    
    public constructor(app: Application, onRestart: () => void) {
        this.gameState = "PLAYING";
        this.app = app;
        this.onRestart = onRestart;
        this.countdown = -1;
        this.countdownLabel = null;
        this.cameraShake = 0;
        this.firing = false;
        this.scroll = 0;
        
        this.landscapeLayer = new Container();
        this.landscape = new Landscape(
            this.landscapeLayer, 
            app.screen.height - GROUND_LEVEL, 
            app.screen.width,
        );this.landscapeLayer

        this.rockLayer = new Container();
        this.rockManager = new RockManager(
            this.rockLayer, 
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
        this.debugInfo = new Debugger(this.debugLayer);

        // add all the layers in the right order, from background to foreground
        this.worldLayer = new Container();
        this.worldLayer.addChild(this.landscapeLayer);
        this.worldLayer.addChild(this.shootingLayer);
        this.worldLayer.addChild(this.playerLayer);
        this.worldLayer.addChild(this.debugLayer);
        this.app.stage.addChild(this.worldLayer);
        this.app.stage.addChild(this.rockLayer);
        this.app.stage.addChild(this.UILayer);
        
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
        this.app.stage.on("pointerup", this.pointerUpCallback);
        this.app.stage.on("pointerupoutside", this.pointerUpCallback);

        this.soundManager = new SoundManager();
        this.soundManager.play("TANK_RUMBLE");
    }

    private update(deltaTime: number, elapsedMS: number) {
        if (this.gameState == "PAUSED") {
            // spacebar unpauses
            if (this.keys.has("Space")) {
                this.gameState = "PLAYING";
            }
            return;
        }

        this.updateThingsThatHappenEveryFrame(deltaTime);


        // Things that happen only while playing or stuck
        if (this.gameState == "PLAYING" || this.gameState == "STUCK") {
            this.checkKeyboardActions();

            // fire weapons
            if (this.firing) {
                const fired = this.shotManager.spawnShot(this.tank.getFiringSolution());
                if (fired) {
                    this.soundManager.fire(this.tank.ammoType);
                }
            }

            this.checkIfTankIsStuck();
            this.updateScore(0.1);
        }
        
        if (this.gameState == "STUCK") {
            this.updateCountdown(elapsedMS);
            this.checkIfTankIsStuck();  // check if we have managed to get free
        }           

        if (this.gameState == "JUST LOST") {

            this.gameState = "GAME OVER";
        }

        // Things that happen only when the game is over
        if (this.gameState == "GAME OVER") {
            // spacebar restarts
            if (this.keys.has("Space")) {
                this.requestRestart();
            }
        }
    }

    private updateThingsThatHappenEveryFrame(deltaTime: number) {
        // Camera shake effect fades away automatically
        if (this.cameraShake > 0) {
            const shakeX = Math.random() * this.cameraShake * 2 - this.cameraShake;
            const shakeY = Math.random() * this.cameraShake * 2 - this.cameraShake;
            this.worldLayer.position.set(shakeX, shakeY);
            this.cameraShake *= 0.95;
        }

        // update bullets       
        this.shotManager.update(deltaTime, this.debugInfo);
        this.checkShotImpacts();

        // update rocks
        this.rockManager.update(this.app.screen.width, this.app.screen.height, deltaTime, this.debugInfo);
        this.checkRockImpacts()

        // move tank across landscape and adjust barrel elevation
        this.scroll = this.tank.update(this.crosshairs.position(), this.debugInfo);
        this.landscape.update(this.app.screen.width, this.scroll, this.debugInfo);

        // show debug overlay
        if (DEBUG_GLOBAL)
            this.debugInfo.update(this.app.screen.width, this.app.screen.height);
    }

    private checkKeyboardActions() {
        // spacebar pauses
        if (this.keys.has("Space")) {
            this.gameState = "PAUSED"; 

        // check other keys
        } else if (this.keys.has("KeyX")) {  // DEBUG - press X to suicide
            this.explodeTank();
            this.endGame();
        } else if (this.keys.has("Digit1")) {
            this.changeRenderStyle("FAST");
        } else if (this.keys.has("Digit2")) {
            this.changeRenderStyle("VECTOR");
        } else if (this.keys.has("Digit3")) {
            this.changeRenderStyle("CHUNKY");
        } else if (this.keys.has("Digit4")) {
            this.changeRenderStyle("NEON");
        } else if (this.keys.has("KeyQ")) {
            this.tank.ammoType = 1;
        } else if (this.keys.has("KeyW")) {
            this.tank.ammoType = 2;
        } else if (this.keys.has("Digit4")) {
            this.changeRenderStyle("NEON");
        } else {
            this.keys.forEach(function(value) {console.log(value)});  // DEBUG - show keycode in console
        }
    }

    private checkIfTankIsStuck() {
        if (this.scroll < STUCK_THRESHOLD) {  // tank has stopped moving
            if (this.gameState == "PLAYING") {
                this.gameState = "STUCK";
                this.countdown = STATIONARY_TIME;
                this.countdownLabel = this.textManager.addLabel(
                    STATIONARY_TIME.toString(), 
                    {x: this.app.screen.width/2, y: 100}, 
                    50);
                this.soundManager.stop("TANK_RUMBLE");
                this.soundManager.play("TANK_STUCK");
            }
        } else if (this.scroll > UNSTUCK_THRESHOLD) {  // tank is rolling again 
            if (this.gameState == "STUCK") {  // unstick the tank
                // get rid of the old countdown label
                if (this.countdownLabel) {
                    this.countdownLabel.destroy();
                }
                this.gameState = "PLAYING";
                this.soundManager.stop("TANK_STUCK");
                this.soundManager.play("TANK_RUMBLE");
            }
        }
    }

    private updateCountdown(elapsedMS: number) {
        this.countdown -= elapsedMS/1000;
        if (this.countdown > 0) {
            // only update the countdown text if the number of seconds left is different
            // otherwise we are pointlessly throwing away and recreating a lot of VectorChar objects
            if (this.countdownLabel) {
                if (Math.ceil(this.countdown).toString() != this.countdownLabel.text) {
                    this.countdownLabel.setText(Math.ceil(this.countdown).toString());
                }
                // text size uses the decimal part of the time, so at n.99 seconds, the text has size (99 * 200) + 10
                // and at n.01 seconds, the text has been shrunk to just 12
                const size = (this.countdown - Math.floor(this.countdown)) * 200 + 10;
                this.countdownLabel.resize(size);
            }
        } else {
            // time's up!
            this.soundManager.stop("TANK_RUMBLE");
            this.soundManager.stop("TANK_STUCK");
            this.soundManager.play("TANK_DEAD");
            this.soundManager.stopAll();4
            this.endGame();
        }
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
                this.cameraShake = 1;
                this.landscape.impact(shot, p, this.debugInfo);
                this.shotManager.despawnShot(i);
            } else {
                // collision check with rocks
                const rock = this.rockManager.findCollision(p);
                if (rock) {
                    this.updateScore(rock.size);  // more points for bigger rocks!
                    this.soundManager.play("SMALL_EXPLOSION");
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
            if (rock.collidesWithBoundingBox(this.tank.hitBox(), this.debugInfo)) {
                if (rock.willShatter()) {
                    // rocks big enough to break into smaller ones will destroy the tank
                    this.rockManager.splitRock(rock);
                    this.rockManager.despawnRockByIndex(i);
                    if (!this.tank.isDead())  {  // only blow up tank if not already dead!
                        this.cameraShake = 10;
                        this.explodeTank();
                        this.endGame();
                    }
                } else {
                    // smaller ones bounce off harmlessly
                    this.rockManager.bounceRock(rock);
                }

            } else {
                // collision check with the ground
                const collidePoint = rock.collidesWithGround(this.landscape, this.debugInfo);
                
                if (collidePoint) {
                    this.cameraShake = (rock.size ** 2) / 200;
                    if (rock.willShatter()) {
                        const volume = this.soundVolume(collidePoint.x - this.tank.getPosition().x);
                        this.soundManager.play("ROCK_IMPACT", volume);
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

    private endGame() {
        // end the game
        const gameOverMessage = this.textManager.addLabel(
            "GAME 0VER",
            {x:0, y:0},
            100
        );
        if(this.countdownLabel) this.countdownLabel.destroy();
        gameOverMessage.setPosition(
            this.app.screen.width/2 - gameOverMessage.getWidth()/2, 
            this.app.screen.height/2 - gameOverMessage.height/2);
        this.gameState = "JUST LOST";
    }

    public destroy() {
        // free all memory before quitting
        this.app.ticker.remove(this.tickerCallback);
        this.app.stage.removeEventListener("pointermove", this.pointerMoveCallback);
        this.app.stage.removeEventListener("pointerdown", this.pointerDownCallback);
        this.app.stage.removeEventListener("pointerup", this.pointerUpCallback);
        this.app.stage.removeEventListener("pointerupoutside", this.pointerUpCallback);
        this.rockManager.destroy();
        this.landscape.destroy();
        this.tank.destroy();
        this.crosshairs.destroy();
        this.shotManager.destroy();
        this.textManager.destroy()
        this.debugInfo.destroy();
    }

    private requestRestart() {
        // make sure we don't try to restart in the middle of a Pixi update
        queueMicrotask(() => {  
            this.onRestart();
        });
    }

    private changeRenderStyle(style: RenderStyle) {
        Renderer.style = style;
        this.requestRestart();21
    }

    private soundVolume(distance: number) {
        // returns a value from 0 to 1, based on how far away the sound is
        let relativeDistance = 1-(Math.abs(distance) / this.app.screen.width);
          return Math.min(1.0, relativeDistance);
    }

}
 