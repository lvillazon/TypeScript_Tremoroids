// Vector style outlines for letters and numbers
import { type PointData } from "pixi.js";
import { Renderer } from "./renderer";

export class VectorChar {
    public rendered: Renderer;
    public position: PointData;
    private char: String;
    public width: number;
    public height: number;

    public destroy() {
        this.rendered.image.destroy()
    }

    
    public resize(newHeight: number) {
        const scalingFactor = newHeight / this.height;
        this.height *= scalingFactor;
        this.width *= scalingFactor;
        this.draw();
    }
    
    public constructor(char: String, height: number) {
        this.rendered = new Renderer();
        this.position = {x: 100, y: 100};
        this.height = height;
        this.width = height * 0.5;
        this.char = char;
        this.draw();
    }

    private draw() {
        let outline: PointData[];
        switch (this.char) {
            case "0":
                outline = [
                    {x: 0.75, y: 0   },
                    {x: 1   , y: 0.25},
                    {x: 1   , y: 0.75},
                    {x: 0.75, y: 1   },
                    {x: 0.25, y: 1   },
                    {x: 0   , y: 0.75},
                    {x: 0   , y: 0.25},
                    {x: 0.25, y: 0   },
                    {x: 0.75, y: 0   },
                ];
                break;

            case "1":
                outline = [
                    {x: 0.2, y: 0.8},
                    {x: 0.5, y: 1  },
                    {x: 0.5, y: 0  },
                    {x: 0.2, y: 0  },
                    {x: 0.8, y: 0  },
                ];
                break;
            
            case "2":
                outline = [
                    {x: 0   , y: 0.75},
                    {x: 0.25, y: 1   },
                    {x: 0.75, y: 1   },
                    {x: 1.0 , y: 0.75},
                    {x: 0   , y: 0   },
                    {x: 1   , y: 0   },
                ];
                break;
            
            case "3":
                outline = [
                    {x: 0   , y: 0.75},
                    {x: 0.25, y: 1   },
                    {x: 0.75, y: 1   },
                    {x: 1.0 , y: 0.6 },
                    {x: 0.5 , y: 0.5 },
                    {x: 1.0 , y: 0.4 },
                    {x: 1.0 , y: 0.25},
                    {x: 0.75, y: 0   },
                    {x: 0.25, y: 0   },
                    {x: 0   , y: 0.25},
                ];
                break;

            case "4":
                outline = [
                    {x: 0.7, y: 0  },
                    {x: 0.7, y: 1  },
                    {x: 0  , y: 0.3},
                    {x: 1  , y: 0.3},
                ];
                break;
                
            case "5":
                outline = [
                    {x: 1   , y: 1   },
                    {x: 0   , y: 1   },
                    {x: 0   , y: 0.6 },
                    {x: 0.8 , y: 0.6 },
                    {x: 1   , y: 0.4 },
                    {x: 1   , y: 0.2 },
                    {x: 0.8 , y: 0   },
                    {x: 0.25, y: 0   },
                    {x: 0   , y: 0.25},
                ];
                break;

            case "6":
                outline = [
                    {x: 1   , y: 1   },
                    {x: 0.5 , y: 1   },
                    {x: 0.25, y: 0.9 },
                    {x: 0   , y: 0.6 },
                    {x: 0   , y: 0.2 },
                    {x: 0.25, y: 0   },
                    {x: 0.8 , y: 0   },
                    {x: 1   , y: 0.2 },
                    {x: 1   , y: 0.45},
                    {x: 0.8 , y: 0.6 },
                    {x: 0.25, y: 0.6 },
                    {x: 0   , y: 0.45}
                ];
                break;

            case "7":
                outline = [
                    {x: 0    , y: 1   },
                    {x: 1    , y: 1   },
                    {x: 1    , y: 0.8 },
                    {x: 0.675, y: 0.5 },
                    {x: 0.4  , y: 0.5 },
                    {x: 0.9  , y: 0.5 },
                    {x: 0.675, y: 0.5 },
                    {x: 0.5  , y: 0.25},
                    {x: 0.5  , y: 0   },
                ];
                break;

            case "8":
                outline = [
                    {x: 1   , y: 0.7 },
                    {x: 0   , y: 0.3 },
                    {x: 0   , y: 0.15},
                    {x: 0.25, y: 0   },
                    {x: 0.75, y: 0   },
                    {x: 1   , y: 0.15},
                    {x: 1   , y: 0.3 },
                    {x: 0   , y: 0.7 },
                    {x: 0   , y: 0.85},
                    {x: 0.25, y: 1   },
                    {x: 0.75, y: 1   },
                    {x: 1   , y: 0.85},
                    {x: 1   , y: 0.7 },
                    
                ];
                break;

            case "9":
                outline = [
                    {x: 1   , y: 0   },
                    {x: 1   , y: 0.8 },
                    {x: 0.8 , y: 1   },
                    {x: 0.2 , y: 1   },
                    {x: 0   , y: 0.8 },
                    {x: 0   , y: 0.65},
                    {x: 0.2 , y: 0.5 },
                    {x: 1   , y: 0.5 },
                ];
                break;

            case "A":
                outline = [
                    {x: 0, y: 0},
                    {x: 0, y: 0.7},
                    {x: 0.5, y: 1},
                    {x: 1, y: 0.7},
                    {x: 1, y: 0},
                    {x: 1, y: 0.4},
                    {x: 0, y: 0.4},
                ];
                break;

            case "C":
                outline = [
                    {x: 1, y: 1},
                    {x: 0, y: 1},
                    {x: 0, y: 0},
                    {x: 1, y: 0},
                ];
                break;

            case "E":
                outline = [
                    {x: 1, y: 1},
                    {x: 0, y: 1},
                    {x: 0, y: 0.5},
                    {x: 0.7, y: 0.5},
                    {x: 0, y: 0.5},
                    {x: 0, y: 0},
                    {x: 1, y: 0},
                ];
                break;

            case "G":
                outline = [
                    {x: 1, y: 1},
                    {x: 0, y: 1},
                    {x: 0, y: 0},
                    {x: 1, y: 0},
                    {x: 1, y: 0.3},
                    {x: 0.5, y: 0.3}
                ];
                break;

            case "M":
                outline = [
                    {x: 0, y: 0},
                    {x: 0, y: 1},
                    {x: 0.5, y: 0.7},
                    {x: 1, y: 1},
                    {x: 1, y: 0},
                ];
                break;

            case "R":
                outline = [
                    {x: 0, y: 0},
                    {x: 0, y: 1},
                    {x: 1, y: 1},
                    {x: 1, y: 0.5},
                    {x: 0, y: 0.5},
                    {x: 1, y: 0},
                ];
                break;

            case "S":
                outline = [
                    {x: 1, y: 1},
                    {x: 0, y: 1},
                    {x: 0, y: 0.5},
                    {x: 1, y: 0.5},
                    {x: 1, y: 0},
                    {x: 0, y: 0},
                ];
                break;

            case "V":
                outline = [
                    {x: 0, y: 1},
                    {x: 0.5, y: 0},
                    {x: 1, y: 1},
                ];
                break;

            case " ":
                outline = [];
                break;

            default:  // any characters we haven't defined appear as a slashed square
                outline = [
                    {x: 0, y: 0},
                    {x: 1, y: 0},
                    {x: 1, y: 1},
                    {x: 0, y: 1},
                    {x: 0, y: 0},
                    {x: 1, y: 1}
                ];
                break;
        }

        // scale to the correct size
        for (let i=0; i<outline.length; i++) {
            outline[i].x *= this.width;
            // this flips the image upside down, which corrects for the fact that it is easier (for me)
            // to hard code the coordinates if I can think of 0,0 as the bottom left and 1,1 as the top right
            // when in reality Pixi puts 0,0 in the top RIGHT
            outline[i].y = 1 - outline[i].y * this.height + this.height;
        }
        this.rendered.clear();
        this.rendered.polyLine(outline);
        this.rendered.image.origin.set(this.width/2, this.height/2);
    }


}