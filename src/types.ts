import { IObject } from "@daybrush/utils";

/**
 * @typedef
 * @memberof Gesto
 */
export interface Event {
    eventType: string;
    stop(): void;
}

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
 * @extends Gesto.Event
 */
export interface OnDragStart extends Position, Event {
    datas: IObject<any>;
    inputEvent: any;
    isTrusted: any;
}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Position
 * @extends Gesto.Event
 */
export interface OnDrag extends Position, Event {
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
 * @extends Gesto.Event
 */
export interface OnDragEnd extends Position, Event {
    isDrag: boolean;
    isDouble: boolean;
    datas: IObject<any>;
    inputEvent: any;
}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Position
 * @extends Gesto.Event
 */
export interface OnPinchStart extends Position, Event {
    datas: IObject<any>;
    touches: Position[];
    angle: number;
    inputEvent: any;
}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Position
 * @extends Gesto.Event
 */
export interface OnPinch extends Position, Event {
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
 * @extends Gesto.Event
 */
export interface OnPinchEnd extends Position, Event {
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
}

/**
 * @typedef
 * @memberof Gesto
 */
export interface GestoEvents {
    "dragStart": OnDragStart;
    "drag": OnDrag;
    "dragEnd": OnDragEnd;
    "pinchStart": OnPinchStart;
    "pinch": OnPinch;
    "pinchEnd": OnPinchEnd;
}

type x = Exclude<keyof GestoEvents, "stop" | "eventType">;

/**
 * @typedef
 * @memberof Gesto
 */
export type ComponentTriggerType<T extends IObject<any>> = Pick<T, Exclude<keyof T, "stop" | "eventType">>;
