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
    data: IObject<any>;
    inputEvent: any;
    isTrusted: boolean;
    isMouseEvent: boolean;
    isSecondaryButton: boolean;
    isDouble: boolean;
    preventDefault: () => void;
    preventDrag: () => void;
}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Position
 * @extends EventEmitter.EmitterParam
 */
export interface OnDrag<T = Gesto> extends Position, EmitterParam<T> {
    isDrag: boolean;
    isMouseEvent: boolean;
    isSecondaryButton: boolean;
    isPinch: boolean;
    movement: number;
    datas: IObject<any>;
    data: IObject<any>;
    isScroll: boolean;
    isFirstDrag: boolean;
    inputEvent: any;
    isTrusted: boolean;
}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Position
 * @extends EventEmitter.EmitterParam
 */
export interface OnDragEnd<T = Gesto> extends Position, EmitterParam<T> {
    isDrag: boolean;
    isClick: boolean;
    isMouseEvent: boolean;
    isSecondaryButton: boolean;
    isDouble: boolean;
    datas: IObject<any>;
    data: IObject<any>;
    inputEvent: any;
    isTrusted: boolean;
}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Position
 * @extends EventEmitter.EmitterParam
 */
export interface OnPinchStart<T = Gesto> extends Position, EmitterParam<T> {
    datas: IObject<any>;
    data: IObject<any>;
    touches: Position[];
    angle: number;
    inputEvent: any;
    isTrusted: boolean;
    preventDefault: () => void;
    preventDrag: () => void;
}
/**
 * @typedef
 * @memberof Gesto
 * @extends Gesto.Position
 * @extends EventEmitter.EmitterParam
 */
export interface OnPinch<T = Gesto> extends Position, EmitterParam<T> {
    datas: IObject<any>;
    data: IObject<any>;
    touches: Position[];
    rotation: number;
    angle: number;
    scale: number;
    distance: number;
    movement: number;
    inputEvent: any;
    isTrusted: boolean;
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
    data: IObject<any>;
    touches: Position[];
    inputEvent: any;
}

/**
 * @typedef
 * @memberof Gesto
 */
export interface GestoOptions {
    container?: Window | Node | Element;
    /**
     * @default ["mouse", "touch"]
     */
    events?: Array<"drag" |"mouse" | "touch">;
    /**
     * Whether to prevent dragging of the right mouse button
     * @default true
     */
    preventRightClick?: boolean;
    /**
     * @default true
     */
    preventWheelClick?: boolean;
    preventDefault?: boolean;
    /**
     * Prevents pinching when the drag is moved more than a certain distance. That distance allowance is pinchThreshold.
     * @default 0
     */
    pinchThreshold?: number;
    /**
     * Whether to keep dragging even when pinch ends
     * @default false
     */
    keepDragging?: boolean;
    /**
     * Prevent click event on drag. (mousemove, touchmove)
     * @default false
     */
    preventClickEventOnDrag?: boolean;
    /**
     * Prevent click event on dragStart. (mousedown, touchstart)
     * @default false
     */
    preventClickEventOnDragStart?: boolean;
    /**
     * Prevent click event according to specific conditions.
     * Returning true allows the click event, returning false prevents it.
     * @default null
     */
    preventClickEventByCondition?: ((e: MouseEvent) => boolean) | null;
    pinchOutside?: boolean;
    /**
     * Prevent dragging of `input`, `textarea`, and contenteditable.
     * @default false
     */
    checkInput?: boolean;
    /**
     * Whether to drag the focused input
     * If `checkInput` is true, this option is not applied.
     * @default false
     */
    dragFocusedInput?: boolean;
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
