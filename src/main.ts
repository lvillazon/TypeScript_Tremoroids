import { Application } from "pixi.js";
import { Game } from "./game";

async function main(): Promise<void> {
  // instantiate the PixiJS engine
  const app = new Application();
  await app.init({
      resizeTo: window,
      background: "#000000",
  });
  document.body.style.margin = "0";
  document.body.style.cursor = "none";
  document.body.appendChild(app.canvas);

  // instantiate the game controller
  new Game(app);
}

main().catch(console.error);