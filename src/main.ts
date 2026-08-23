import { Application } from "pixi.js";
import { Game } from "./game";

let game: Game;
let app: Application;

async function main(): Promise<void> {
  // instantiate the PixiJS engine
  app = new Application();
  await app.init({
      resizeTo: window,
      background: "#000000",
  });
  document.body.style.margin = "0";
  document.body.style.cursor = "none";
  document.body.appendChild(app.canvas);

  // instantiate the game controller
  game = new Game(app, restartGame);
}

function restartGame() {
  game.destroy();
  game = new Game(app, restartGame);
}

main().catch(console.error);