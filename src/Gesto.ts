import { Client, OnDrag, GestoOptions, GestoEvents, ComponentTriggerType } from "./types";
import {
    getEventClients, isMultiTouch,
} from "./utils";
import Component from "@egjs/component";
import { addEvent, removeEvent, now } from "@daybrush/utils";
import { ClientStore } from "./ClientStore";

const INPUT_TAGNAMES = ["textarea", "input"];
/**
 * You can set up drag, pinch events in any browser.
 */
class Gesto extends Component {
    public options: GestoOptions = {};
    private flag = false;
    private pinchFlag = false;
    private datas = {};
    private isDrag = false;
    private isPinch = false;
    private isMouse = false;
    private isTouch = false;
    private clientStores: ClientStore[] = [];
    private targets: Array<Element | Window> = [];
    private prevTime: number = 0;
    private isDouble: boolean = false;

    /**
     *
     */
    constructor(targets: Array<Element | Window> | Element | Window, options: GestoOptions = {}) {
        super();
        const elements = [].concat(targets as any) as Array<Element | Window>;
        this.options = {
            checkInput: false,
            container: elements.length > 1 ? window : elements[0],
            preventRightClick: true,
            preventDefault: true,
            pinchThreshold: 0,
            events: ["touch", "mouse"],
            ...options,
        };

        const { container, events } = this.options;

        this.isTouch = events!.indexOf("touch") > -1;
        this.isMouse = events!.indexOf("mouse") > -1;
        this.targets = elements;

        if (this.isMouse) {
            elements.forEach(el => {
                addEvent(el, "mousedown", this.onDragStart);
            });
            addEvent(container!, "mousemove", this.onDrag);
            addEvent(container!, "mouseup", this.onDragEnd);
            addEvent(container!, "contextmenu", this.onDragEnd);
        }
        if (this.isTouch) {
            const passive = {
                passive: false,
            };
            elements.forEach(el => {
                addEvent(el, "touchstart", this.onDragStart, passive);
            });
            addEvent(container!, "touchmove", this.onDrag, passive);
            addEvent(container!, "touchend", this.onDragEnd, passive);
            addEvent(container!, "touchcancel", this.onDragEnd, passive);
        }
    }
    /**
     * The total moved distance
     */
    public getMovement(clients?: Client[]) {
        return this.getCurrentStore().getMovement(clients) + this.clientStores.slice(1).reduce((prev, cur) => {
            return prev + cur.movement;
        },  0);
    }
    /**
     * Whether to drag
     */
    public isDragging(): boolean {
        return this.isDrag;
    }
    /**
     * Whether to start drag
     */
    public isFlag(): boolean {
        return this.flag;
    }
    /**
     * Whether to start pinch
     */
    public isPinchFlag() {
        return this.pinchFlag;
    }
    /**
     * Whether to pinch
     */
    public isPinching() {
        return this.isPinch;
    }
    /**
     * If a scroll event occurs, it is corrected by the scroll distance.
     */
    public scrollBy(deltaX: number, deltaY: number, e: any, isCallDrag: boolean = true) {
        if (!this.flag) {
            return;
        }
        this.clientStores[0].move(deltaX, deltaY);
        isCallDrag && this.onDrag(e, true);
    }
    /**
     * Create a virtual drag event.
     */
    public move([deltaX, deltaY]: number[], inputEvent: any): ComponentTriggerType<OnDrag> {
        const store = this.getCurrentStore();
        const nextClients = store.prevClients;

        return this.moveClients(nextClients.map(({ clientX, clientY }) => {
            return {
                clientX: clientX + deltaX,
                clientY: clientY + deltaY,
                originalClientX: clientX,
                originalClientY: clientY,
            };
        }), inputEvent, true);
    }
    /**
     * The dragStart event is triggered by an external event.
     */
    public triggerDragStart(e: any) {
        this.onDragStart(e, false);
    }
    /**
     * Unset Gesto
     */
    public unset() {
        const targets = this.targets;
        const container = this.options.container!;

        this.off();
        if (this.isMouse) {
            targets.forEach(target => {
                removeEvent(target, "mousedown", this.onDragStart);
            });
            removeEvent(container, "mousemove", this.onDrag);
            removeEvent(container, "mouseup", this.onDragEnd);
            removeEvent(container, "contextmenu", this.onDragEnd);
        }
        if (this.isTouch) {
            targets.forEach(target => {
                removeEvent(target, "touchstart", this.onDragStart);
            });
            removeEvent(container, "touchstart", this.onDragStart);
            removeEvent(container, "touchmove", this.onDrag);
            removeEvent(container, "touchend", this.onDragEnd);
            removeEvent(container, "touchcancel", this.onDragEnd);
        }
    }
    public onDragStart = (e: any, isTrusted = true) => {
        if (!this.flag && e.cancelable === false) {
            return;
        }
        const { container, pinchOutside, preventRightClick, preventDefault, checkInput } = this.options;
        const isTouch = this.isTouch;
        const isDragStart = !this.flag;

        if (isDragStart) {
            const activeElement = document.activeElement as HTMLElement;
            const target = e.target as HTMLElement;
            const tagName = target.tagName.toLowerCase();
            const hasInput = INPUT_TAGNAMES.indexOf(tagName) > -1;
            const hasContentEditable = target.isContentEditable;

            if (hasInput || hasContentEditable) {
                if (checkInput || activeElement === target) {
                    // force false or already focused.
                    return false;
                }
                if (
                    activeElement
                    && hasContentEditable
                    && activeElement.isContentEditable
                    && activeElement.contains(target)
                ) {
                    return false;
                }
            } else if ((preventDefault || e.type === "touchstart") && activeElement) {
                const activeTagName = activeElement.tagName;
                if (activeElement.isContentEditable || INPUT_TAGNAMES.indexOf(activeTagName) > -1) {
                    activeElement.blur();
                }
            }
            this.clientStores = [new ClientStore(getEventClients(e))];
            this.flag = true;
            this.isDrag = false;
            this.datas = {};

            if (preventRightClick && (e.which === 3 || e.button === 2)) {
                this.initDrag();
                return false;
            }
            const result = this.trigger("dragStart", {
                datas: this.datas,
                inputEvent: e,
                isTrusted,
                ...this.getCurrentStore().getPosition(),
            });
            if (result === false) {
                this.initDrag();
            }
            this.isDouble = now() - this.prevTime < 200;
            this.flag && preventDefault && e.preventDefault();
        }
        if (!this.flag) {
            return false;
        }
        let timer = 0;

        if (isDragStart && isTouch && pinchOutside) {
            timer = setTimeout(() => {
                addEvent(container!, "touchstart", this.onDragStart, { passive: false });
            });
        }
        if (!isDragStart && isTouch && pinchOutside) {
            removeEvent(container!, "touchstart", this.onDragStart);
        }
        if (this.flag && isMultiTouch(e)) {
            clearTimeout(timer);
            if (isDragStart && (e.touches.length !== e.changedTouches.length)) {
                return;
            }
            if (!this.pinchFlag) {
                this.onPinchStart(e);
            }
        }

    }
    public onDrag = (e: any, isScroll?: boolean) => {
        if (!this.flag) {
            return;
        }
        const clients = getEventClients(e);
        const result = this.moveClients(clients, e, false);

        if (this.pinchFlag || result.deltaX || result.deltaY) {
            this.trigger("drag", {
                ...result,
                isScroll: !!isScroll,
                inputEvent: e,
            });
        }
        if (this.pinchFlag) {
            this.onPinch(e, clients);
        }

        this.getCurrentStore().addClients(clients);
    }
    public onDragEnd = (e: any) => {
        if (!this.flag) {
            return;
        }
        const { pinchOutside, container } = this.options;
        if (this.isTouch && pinchOutside) {
            removeEvent(container!, "touchstart", this.onDragStart);
        }

        this.flag = false;

        const position = this.getCurrentStore().getPosition();

        const currentTime = now();
        const isDouble = !this.isDrag && this.isDouble;

        this.prevTime = this.isDrag || isDouble ? 0 : currentTime;

        this.trigger("dragEnd", {
            datas: this.datas,
            isDouble,
            isDrag: this.isDrag,
            inputEvent: e,
            ...position,
        });
        if (this.pinchFlag) {
            this.onPinchEnd(e);
        }
        this.clientStores = [];
    }
    public onPinchStart(e: TouchEvent) {
        const { pinchThreshold } = this.options;

        if (this.isDrag && this.getMovement() > pinchThreshold!) {
            return;
        }
        const store = new ClientStore(getEventClients(e));

        this.pinchFlag = true;
        this.clientStores.splice(0, 0, store);

        const result = this.trigger("pinchStart", {
            datas: this.datas,
            angle: store.getAngle(),
            touches: this.getCurrentStore().getPositions(),
            ...store.getPosition(),
            inputEvent: e,
        });

        if (result === false) {
            this.pinchFlag = false;
        }
    }
    public onPinch(e: TouchEvent, clients: Client[]) {
        if (!this.flag || !this.pinchFlag || clients.length < 2) {
            return;
        }

        const store = this.getCurrentStore();
        this.isPinch = true;

        this.trigger("pinch", {
            datas: this.datas,
            movement: this.getMovement(clients),
            angle: store.getAngle(clients),
            rotation: store.getRotation(clients),
            touches: store.getPositions(clients),
            scale: store.getScale(clients),
            distance: store.getDistance(clients),
            ...store.getPosition(clients),
            inputEvent: e,
        });
    }
    public onPinchEnd(e: TouchEvent) {
        if (!this.pinchFlag) {
            return;
        }
        const isPinch = this.isPinch;

        this.isPinch = false;
        this.pinchFlag = false;
        const store = this.getCurrentStore();
        this.trigger("pinchEnd", {
            datas: this.datas,
            isPinch,
            touches: store.getPositions(),
            ...store.getPosition(),
            inputEvent: e,
        });
        this.isPinch = false;
        this.pinchFlag = false;
    }

    private initDrag() {
        this.clientStores = [];
        this.pinchFlag = false;
        this.flag = false;
    }
    private getCurrentStore() {
        return this.clientStores[0];
    }
    private moveClients(clients: Client[], inputEvent: any, isAdd: boolean): ComponentTriggerType<OnDrag> {
        const store = this.getCurrentStore();
        const position = store[isAdd ? "addClients" : "getPosition"](clients);

        this.isDrag = true;

        return {
            datas: this.datas,
            ...position,
            movement: this.getMovement(clients),
            isDrag: this.isDrag,
            isPinch: this.isPinch,
            isScroll: false,
            inputEvent,
        };
    }
}

interface Gesto {
    on<T extends keyof GestoEvents>(
        eventName: T, handlerToAttach: (event: GestoEvents[T]) => any): this;
    on(eventName: string, handlerToAttach: (event: { [key: string]: any }) => any): this;
    on(events: { [key: string]: (event: { [key: string]: any }) => any }): this;
    trigger<T extends keyof GestoEvents>(eventName: T, param: ComponentTriggerType<GestoEvents[T]>): boolean;
    trigger(eventName: string, param: { [key: string]: any }): boolean;
}
export default Gesto;
