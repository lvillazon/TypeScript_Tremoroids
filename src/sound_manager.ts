import { sound } from "@pixi/sound";

export type Effect = 
    "MACHINE_GUN" | 
    "CANNON_SHOT" | 
    "CANNON_RELOAD" | 
    "ROCK_IMPACT" | 
    "TANK_RUMBLE" |
    "TANK_STUCK" |
    "TANK_DEAD" |
    "BIG_EXPLOSION" |
    "SMALL_EXPLOSION";

export class SoundManager {
    public constructor() {
        sound.add("MACHINE_GUN", "/sounds/light_machine_gun.mp3");
        sound.add("CANNON_SHOT", "/sounds/cannon_shot.mp3");
        sound.add("CANNON_RELOAD", "/sounds/cannon_reload.mp3");
        sound.add("ROCK_IMPACT", "/sounds/rock_impact.mp3");
//        sound.add("TANK_RUMBLE", "/sounds/tank_rumble.mp3");
        sound.add("TANK_RUMBLE", "/sounds/robot_tank.mp3");
        sound.add("TANK_STUCK", "/sounds/robot_tank.mp3");
        sound.add("TANK_DEAD", "/sounds/robot_tank.mp3");
        sound.add("BIG_EXPLOSION", "/sounds/tank_explosion.mp3");
        sound.add("SMALL_EXPLOSION", "/sounds/rock_explosion.mp3");
        sound.volumeAll = 1.0;
    }

    public fire(gun: number) {
        switch (gun) {
            case 1:
                this.play("CANNON_SHOT");
                break;
            case 2:
                this.play("MACHINE_GUN");
                break;
        }
    }
 
    public play(name: Effect, volume?: number) {
        if (!volume) volume = 1;  // default to full volume
        switch (name) {
            case "CANNON_SHOT":
                sound.play(name, {start: 1.3, end: 2.3, volume: 0.5});
                break;
            case "CANNON_RELOAD":
                sound.play(name, {start: 3.0, end: 4.0, volume: 0.5});
                break;
            case "MACHINE_GUN":
                sound.play(name, {start: 3.0, end: 4.0, volume: 0.5});
                break;
            case "ROCK_IMPACT":
                sound.play(name, {start: 1.0, end: 4.0, volume: volume});
                break;
            case "TANK_RUMBLE":
                sound.play(name, {start: 1.0, end: 1.5, volume: 0.2, loop: true});
                break;                
            case "TANK_STUCK":
                sound.play(name, {start: 7.8, end: 8.0, volume: 0.8, loop: true});
                break;
            case "TANK_DEAD":
                sound.play(name, {start: 7.5, end:12, volume: 0.8});
                break;          
            case "BIG_EXPLOSION":
                sound.play(name);
                break;          
            case "SMALL_EXPLOSION":
                sound.play(name);
                break;          
        }        
    }

    public stop(name: Effect) {
        sound.stop(name);
    }

    public stopAll() {
        sound.stopAll();
        sound.volumeAll = 0;
    }

}