import { IObject } from "@daybrush/utils";
import { EmitterParam } from "@scena/event-emitter";
import Gesto from "./Gesto";
/**
 * @typedef
 * @memberof Gesto
 */
export interface Client {
    clientX: number;
    clientY: number;
    originalClientX?: number;
    originalClientY?: number;
}
/**
 * @typedef
 * @memberof Gesto
 */
export interface Dist {
    distX: number;
    distY: number;
}
/**
 * @typedef
 * @memberof Gesto
 */
export interface Delta {
    deltaX: number;
    deltaY: number;
}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Client
 * @extends Gesto.Dist
 * @extends Gesto.Delta
 */
export interface Position extends Client, Dist, Delta {}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Position
 * @extends EventEmitter.EmitterParam
 */
export interface OnDragStart<T = Gesto> extends Position, EmitterParam<T> {
    datas: IObject<any>;
    inputEvent: any;
    isTrusted: any;
    isDouble: boolean;
}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Position
 * @extends EventEmitter.EmitterParam
 */
export interface OnDrag<T = Gesto> extends Position, EmitterParam<T> {
    isDrag: boolean;
    isPinch: boolean;
    movement: number;
    datas: IObject<any>;
    isScroll: boolean;
    inputEvent: any;
}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Position
 * @extends EventEmitter.EmitterParam
 */
export interface OnDragEnd<T = Gesto> extends Position, EmitterParam<T> {
    isDrag: boolean;
    isDouble: boolean;
    datas: IObject<any>;
    inputEvent: any;
}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Position
 * @extends EventEmitter.EmitterParam
 */
export interface OnPinchStart<T = Gesto> extends Position, EmitterParam<T> {
    datas: IObject<any>;
    touches: Position[];
    angle: number;
    inputEvent: any;
}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Position
 * @extends EventEmitter.EmitterParam
 */
export interface OnPinch<T = Gesto> extends Position, EmitterParam<T> {
    datas: IObject<any>;
    touches: Position[];
    rotation: number;
    angle: number;
    scale: number;
    distance: number;
    movement: number;
    inputEvent: any;
}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Position
 * @extends EventEmitter.EmitterParam
 */
export interface OnPinchEnd<T = Gesto> extends Position, EmitterParam<T> {
    isPinch: boolean;
    datas: IObject<any>;
    touches: Position[];
    inputEvent: any;
}

/**
 * @typedef
 * @memberof Gesto
 */
export interface GestoOptions {
    container?: Window | Node | Element;
    events?: Array<"mouse" | "touch">;
    preventRightClick?: boolean;
    preventDefault?: boolean;
    pinchThreshold?: number;
    pinchOutside?: boolean;
    checkInput?: boolean;
    checkWindowBlur?: boolean;
}

/**
 * @typedef
 * @memberof Gesto
 */
export type GestoEvents = {
    "dragStart": OnDragStart;
    "drag": OnDrag;
    "dragEnd": OnDragEnd;
    "pinchStart": OnPinchStart;
    "pinch": OnPinch;
    "pinchEnd": OnPinchEnd;
};
