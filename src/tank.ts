// The player tank
import { Container, Polygon, type PointData } from "pixi.js";
import { Renderer } from "./renderer";
import { Debugger } from "./debug";
import type { Landscape } from "./landscape";

const GRAVITY = 0.02;

export class Tank {
    private displayLayer: Container;
    private ground: Landscape;
    public velocity: PointData;
    public position: PointData;
    public rotationSpeed: number;
    private barrelAngle: number;
    private rendered: Renderer;

    public constructor(layer: Container, ground: Landscape, position: PointData, size: number) {
        this.displayLayer = layer;
        this.ground = ground;
        this.rendered = new Renderer();
        this.displayLayer.addChild(this.rendered.image);
        this.rotationSpeed = 0;
        
        const tank_image_detail = 10;  // higher numbers mean more points in the tank graphic
        // the tank image comprises:
        // a semicircle turret in the middle, with a line for the barrel
        let points: PointData[] = [];
        for (let i=0; i<tank_image_detail+1; i++) {
            let theta = -Math.PI + Math.PI * i / tank_image_detail;
            let x = size * Math.cos(theta);
            let y = size * Math.sin(theta);
            let p: PointData = {x, y};
            points.push(p);
        }
        this.rendered.poly(points);  // turrent
        this.barrelAngle = -30;  // in degrees
        this.rendered.moveTo(
            size * Math.cos(this.toRadians(this.barrelAngle)),
            size * Math.sin(this.toRadians(this.barrelAngle))
        );
        this.rendered.lineTo(
            2.5 * size * Math.cos(this.toRadians(this.barrelAngle)),
            2.5 * size * Math.sin(this.toRadians(this.barrelAngle))
        );

        // 3 lines to define the top hull
        this.rendered.moveTo(-size*2.5, size*0.5);
        this.rendered.lineTo(-size*2, 0);
        this.rendered.lineTo(size*2, 0);
        this.rendered.lineTo(size*2.5, size*0.5);

        // an oval for the tank track outline
        points = [];
        for (let i=0; i<tank_image_detail+1; i++) {
            let theta = Math.PI/2 + Math.PI * i / tank_image_detail;
            let x = -size * 1.6 + size * 0.5 * Math.cos(theta);
            let y = size * 0.7 + size * 0.5 * Math.sin(theta);
            points.push({x: x, y: y});
        }
        for (let i=0; i<tank_image_detail+1; i++) {
            let theta = -Math.PI/2 + Math.PI * i / tank_image_detail;
            let x = size * 1.6 + size * 0.5 * Math.cos(theta);
            let y = size * 0.7 + size * 0.5 * Math.sin(theta);
            points.push({x: x, y: y});
        }
        this.rendered.poly(points);  // turrent

        // 4 circles within the outline to represent the wheels
        this.rendered.circle(
            -size * 1.6,
            size * 0.7,
            size/ 6
        );
        // this.rendered.circle(
        //     0,
        //     size * 0.7,
        //     size/ 6
        // );
        this.rendered.circle(
            -size * 0.55,
            size * 0.7,
            size/ 6
        );
        this.rendered.circle(
            size * 0.55,
            size * 0.7,
            size/ 6
        );
        this.rendered.circle(
            size * 1.6,
            size * 0.7,
            size/ 6
        );
        // short lines to represent the tread on the tracks

        // this.outline = new Polygon(points);
        // this.rendered.poly(points);
        
        this.rendered.image.position.set(position.x, position.y);
        this.position = {x: position.x, y: position.y - size * 1.3};
        this.velocity = {x: 0, y: 0};
    }

    private toRadians(angle: number): number {
        return angle * Math.PI / 180;
    }

    private toDegrees(angle: number): number {
        return angle * 180 / Math.PI;
    }

    public update(width: number, height: number, interval: number, debugHook: Debugger) {
        // this.rendered.image.rotation += this.rotationSpeed * interval;
        // this.velocity.y += GRAVITY;
        // this.position.x += this.velocity.x;
        // this.position.y += this.velocity.y;
        this.rendered.image.position.set(this.position.x, this.position.y);
    }

}
