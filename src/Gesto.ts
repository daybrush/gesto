import { Client, OnDrag, GestoOptions, GestoEvents } from "./types";
import {
    getEventClients, isMouseEvent, isMultiTouch,
} from "./utils";
import EventEmitter, { TargetParam } from "@scena/event-emitter";
import { addEvent, removeEvent, now, IObject, getWindow, isWindow } from "@daybrush/utils";
import { ClientStore } from "./ClientStore";

const INPUT_TAGNAMES = ["textarea", "input"];
/**
 * You can set up drag, pinch events in any browser.
 */
class Gesto extends EventEmitter<GestoEvents> {
    public options: GestoOptions = {};

    private flag = false;
    private pinchFlag = false;
    private data: IObject<any> = {};
    private isDrag = false;
    private isPinch = false;

    private clientStores: ClientStore[] = [];
    private targets: Array<Element | Window> = [];
    private prevTime: number = 0;
    private doubleFlag: boolean = false;
    private _useMouse = false;
    private _useTouch = false;
    private _useDrag = false;
    private _dragFlag = false;
    private _isTrusted = false;
    private _isMouseEvent = false;
    private _isSecondaryButton = false;
    private _preventMouseEvent = false;
    private _prevInputEvent: any = null;
    private _isDragAPI = false;
    private _isIdle = true;
    private _preventMouseEventId = 0;
    private _window: WindowProxy = window;

    /**
     *
     */
    constructor(targets: Array<Element | Window> | Element | Window, options: GestoOptions = {}) {
        super();
        const elements = [].concat(targets as any) as Array<Element | Window>;
        const firstTarget = elements[0];

        this._window = isWindow(firstTarget) ? firstTarget : getWindow(firstTarget);
        this.options = {
            checkInput: false,
            container: firstTarget && !("document" in firstTarget)  ? getWindow(firstTarget) : firstTarget,
            preventRightClick: true,
            preventWheelClick: true,
            preventClickEventOnDragStart: false,
            preventClickEventOnDrag: false,
            preventClickEventByCondition: null,
            preventDefault: true,
            checkWindowBlur: false,
            keepDragging: false,
            pinchThreshold: 0,
            events: ["touch", "mouse"],
            ...options,
        };

        const { container, events, checkWindowBlur } = this.options;

        this._useDrag = events!.indexOf("drag") > -1;
        this._useTouch = events!.indexOf("touch") > -1;
        this._useMouse = events!.indexOf("mouse") > -1;
        this.targets = elements;

        if (this._useDrag) {
            elements.forEach(el => {
                addEvent(el, "dragstart", this.onDragStart);
            });
        }
        if (this._useMouse) {
            elements.forEach(el => {
                addEvent(el, "mousedown", this.onDragStart);
                addEvent(el, "mousemove", this._passCallback);
            });
            addEvent(container!, "contextmenu", this._onContextMenu);
        }
        if (checkWindowBlur) {
            addEvent(getWindow(), "blur", this.onBlur);
        }
        if (this._useTouch) {
            const passive = {
                passive: false,
            };
            elements.forEach(el => {
                addEvent(el, "touchstart", this.onDragStart, passive);
                addEvent(el, "touchmove", this._passCallback, passive);
            });
        }
    }
    /**
     * Stop Gesto's drag events.
     */
    public stop() {
        this.isDrag = false;
        this.data = {};
        this.clientStores = [];
        this.pinchFlag = false;
        this.doubleFlag = false;
        this.prevTime = 0;
        this.flag = false;
        this._isIdle = true;

        this._allowClickEvent();
        this._dettachDragEvent();
        this._isDragAPI = false;
    }
    /**
     * The total moved distance
     */
    public getMovement(clients?: Client[]) {
        return this.getCurrentStore().getMovement(clients) + this.clientStores.slice(1).reduce((prev, cur) => {
            return prev + cur.movement;
        }, 0);
    }
    /**
     * Whether to drag
     */
    public isDragging(): boolean {
        return this.isDrag;
    }
    /**
     * Whether the operation of gesto is finished and is in idle state
     */
    public isIdle(): boolean {
        return this._isIdle;
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
     * Whether to start double click
     */
    public isDoubleFlag() {
        return this.doubleFlag;
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
    public move([deltaX, deltaY]: number[], inputEvent: any): TargetParam<OnDrag> {
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
     * Set the event data while dragging.
     */
    public setEventData(data: IObject<any>) {
        const currentData = this.data;

        for (const name in data) {
            currentData[name] = data[name];
        }
        return this;
    }
    /**
     * Set the event data while dragging.
     * Use `setEventData`
     * @deprecated
     */
    public setEventDatas(data: IObject<any>) {
        return this.setEventData(data);
    }
    /**
     * Get the current event state while dragging.
     */
    public getCurrentEvent(inputEvent: any = this._prevInputEvent) {
        return {
            data: this.data,
            datas: this.data,
            ...this._getPosition(),
            movement: this.getMovement(),
            isDrag: this.isDrag,
            isPinch: this.isPinch,
            isScroll: false,
            inputEvent,
        };
    }
    /**
     * Get & Set the event data while dragging.
     */
    public getEventData() {
        return this.data;
    }
    /**
     * Get & Set the event data while dragging.
     * Use getEventData method
     * @depreacated
     */
    public getEventDatas() {
        return this.data;
    }
    /**
     * Unset Gesto
     */
    public unset() {
        const targets = this.targets;
        const container = this.options.container!;

        this.off();
        removeEvent(this._window, "blur", this.onBlur);

        if (this._useDrag) {
            targets.forEach(el => {
                removeEvent(el, "dragstart", this.onDragStart);
            });
        }
        if (this._useMouse) {
            targets.forEach(target => {
                removeEvent(target, "mousedown", this.onDragStart);
            });
            removeEvent(container, "contextmenu", this._onContextMenu);
        }
        if (this._useTouch) {
            targets.forEach(target => {
                removeEvent(target, "touchstart", this.onDragStart);
            });
            removeEvent(container, "touchstart", this.onDragStart);
        }
        this._prevInputEvent = null;
        this._allowClickEvent();
        this._dettachDragEvent();
    }
    public onDragStart = (e: any, isTrusted = true) => {
        if (!this.flag && e.cancelable === false) {
            return;
        }
        const isDragAPI = e.type.indexOf("drag") >= -1;

        if (this.flag && isDragAPI) {
            return;
        }

        this._isDragAPI = true;
        const {
            container,
            pinchOutside,
            preventWheelClick,
            preventRightClick,
            preventDefault,
            checkInput,
            dragFocusedInput,
            preventClickEventOnDragStart,
            preventClickEventOnDrag,
            preventClickEventByCondition,
        } = this.options;
        const useTouch = this._useTouch;
        const isDragStart = !this.flag;

        this._isSecondaryButton = e.which === 3 || e.button === 2;

        if (
            (preventWheelClick && (e.which === 2 || e.button === 1))
            || (preventRightClick && (e.which === 3 || e.button === 2))
        ) {
            this.stop();
            return false;
        }

        if (isDragStart) {
            const activeElement = this._window.document.activeElement as HTMLElement;
            const target = e.target as HTMLElement;

            if (target) {
                const tagName = target.tagName.toLowerCase();
                const hasInput = INPUT_TAGNAMES.indexOf(tagName) > -1;
                const hasContentEditable = target.isContentEditable;

                if (hasInput || hasContentEditable) {
                    if (checkInput || (!dragFocusedInput && activeElement === target)) {
                        // force false or already focused.
                        return false;
                    }
                    // no focus
                    if (activeElement && (
                        activeElement === target
                        || (hasContentEditable && activeElement.isContentEditable && activeElement.contains(target))
                    )) {
                        if (dragFocusedInput) {
                            target.blur();
                        } else {
                            return false;
                        }
                    }
                } else if ((preventDefault || e.type === "touchstart") && activeElement) {
                    const activeTagName = activeElement.tagName.toLowerCase();

                    if (activeElement.isContentEditable || INPUT_TAGNAMES.indexOf(activeTagName) > -1) {
                        activeElement.blur();
                    }
                }

                if (preventClickEventOnDragStart || preventClickEventOnDrag || preventClickEventByCondition) {
                    addEvent(this._window, "click", this._onClick, true);
                }
            }
            this.clientStores = [new ClientStore(getEventClients(e))];
            this._isIdle = false;
            this.flag = true;
            this.isDrag = false;
            this._isTrusted = isTrusted;
            this._dragFlag = true;
            this._prevInputEvent = e;
            this.data = {};

            this.doubleFlag = now() - this.prevTime < 200;
            this._isMouseEvent = isMouseEvent(e);
            if (!this._isMouseEvent && this._preventMouseEvent) {
                this._allowMouseEvent();
            }

            const result = this._preventMouseEvent || this.emit("dragStart", {
                data: this.data,
                datas: this.data,
                inputEvent: e,
                isMouseEvent: this._isMouseEvent,
                isSecondaryButton: this._isSecondaryButton,
                isTrusted,
                isDouble: this.doubleFlag,
                ...this.getCurrentStore().getPosition(),
                preventDefault() {
                    e.preventDefault();
                },
                preventDrag: () => {
                    this._dragFlag = false;
                },
            });
            if (result === false) {
                this.stop();
            }
            if (this._isMouseEvent && this.flag && preventDefault) {
                e.preventDefault();
            }
        }
        if (!this.flag) {
            return false;
        }
        let timer = 0;

        if (isDragStart) {
            this._attchDragEvent();

            // wait pinch
            if (useTouch && pinchOutside) {
                timer = setTimeout(() => {
                    addEvent(container!, "touchstart", this.onDragStart, {
                        passive: false
                    });
                });
            }
        } else if (useTouch && pinchOutside) {
            // pinch is occured
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
        const {
            preventDefault,
        } = this.options;
        if (!this._isMouseEvent && preventDefault) {
            e.preventDefault();
        }
        this._prevInputEvent = e;
        const clients = getEventClients(e);
        const result = this.moveClients(clients, e, false);

        if (this._dragFlag) {
            if (this.pinchFlag || result.deltaX || result.deltaY) {
                const dragResult = this._preventMouseEvent || this.emit("drag", {
                    ...result,
                    isScroll: !!isScroll,
                    inputEvent: e,
                });

                if (dragResult === false) {
                    this.stop();
                    return;
                }
            }
            if (this.pinchFlag) {
                this.onPinch(e, clients);
            }
        }

        this.getCurrentStore().getPosition(clients, true);
    }
    public onDragEnd = (e?: any) => {
        if (!this.flag) {
            return;
        }
        const {
            pinchOutside,
            container,
            preventClickEventOnDrag,
            preventClickEventOnDragStart,
            preventClickEventByCondition,
        } = this.options;
        const isDrag = this.isDrag;

        if (preventClickEventOnDrag || preventClickEventOnDragStart || preventClickEventByCondition) {
            requestAnimationFrame(() => {
                this._allowClickEvent();
            });
        }
        if (!preventClickEventByCondition && !preventClickEventOnDragStart && preventClickEventOnDrag && !isDrag) {
            this._allowClickEvent();
        }

        if (this._useTouch && pinchOutside) {
            removeEvent(container!, "touchstart", this.onDragStart);
        }
        if (this.pinchFlag) {
            this.onPinchEnd(e);
        }
        const clients = e?.touches ? getEventClients(e) : [];
        const clientsLength = clients.length;

        if (clientsLength === 0 || !this.options.keepDragging) {
            this.flag = false;
        } else {
            this._addStore(new ClientStore(clients));
        }


        const position = this._getPosition();
        const currentTime = now();
        const isDouble = !isDrag && this.doubleFlag;

        this._prevInputEvent = null;
        this.prevTime = isDrag || isDouble ? 0 : currentTime;

        if (!this.flag) {
            this._dettachDragEvent();

            this._preventMouseEvent || this.emit("dragEnd", {
                data: this.data,
                datas: this.data,
                isDouble,
                isDrag: isDrag,
                isClick: !isDrag,
                isMouseEvent: this._isMouseEvent,
                isSecondaryButton: this._isSecondaryButton,
                inputEvent: e,
                isTrusted: this._isTrusted,
                ...position,
            });

            this.clientStores = [];

            if (!this._isMouseEvent) {
                this._preventMouseEvent = true;

                // Prevent the problem of touch event and mouse event occurring simultaneously
                clearTimeout(this._preventMouseEventId);
                this._preventMouseEventId = setTimeout(() => {
                    this._preventMouseEvent = false;
                }, 200);
            }
            this._isIdle = true;
        }
    }
    public onPinchStart(e: TouchEvent) {
        const { pinchThreshold } = this.options;

        if (this.isDrag && this.getMovement() > pinchThreshold!) {
            return;
        }
        const store = new ClientStore(getEventClients(e));

        this.pinchFlag = true;
        this._addStore(store);

        const result = this.emit("pinchStart", {
            data: this.data,
            datas: this.data,
            angle: store.getAngle(),
            touches: this.getCurrentStore().getPositions(),
            ...store.getPosition(),
            inputEvent: e,
            isTrusted: this._isTrusted,
            preventDefault() {
                e.preventDefault();
            },
            preventDrag: () => {
                this._dragFlag = false;
            },
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

        this.emit("pinch", {
            data: this.data,
            datas: this.data,
            movement: this.getMovement(clients),
            angle: store.getAngle(clients),
            rotation: store.getRotation(clients),
            touches: store.getPositions(clients),
            scale: store.getScale(clients),
            distance: store.getDistance(clients),
            ...store.getPosition(clients),
            inputEvent: e,
            isTrusted: this._isTrusted,
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
        this.emit("pinchEnd", {
            data: this.data,
            datas: this.data,
            isPinch,
            touches: store.getPositions(),
            ...store.getPosition(),
            inputEvent: e,
        });
    }
    private getCurrentStore() {
        return this.clientStores[0];
    }
    private moveClients(clients: Client[], inputEvent: any, isAdd: boolean): TargetParam<OnDrag> {
        const position = this._getPosition(clients, isAdd);

        const isPrevDrag = this.isDrag;

        if (position.deltaX || position.deltaY) {
            this.isDrag = true;
        }
        let isFirstDrag = false;

        if (!isPrevDrag && this.isDrag) {
            isFirstDrag = true;
        }

        return {
            data: this.data,
            datas: this.data,
            ...position,
            movement: this.getMovement(clients),
            isDrag: this.isDrag,
            isPinch: this.isPinch,
            isScroll: false,
            isMouseEvent: this._isMouseEvent,
            isSecondaryButton: this._isSecondaryButton,
            inputEvent,
            isTrusted: this._isTrusted,
            isFirstDrag,
        };
    }
    private onBlur = () => {
        this.onDragEnd();
    }
    private _addStore(store: ClientStore) {
        this.clientStores.splice(0, 0, store);
    }
    private _getPosition(clients?: Client[], isAdd?: boolean) {
        const store = this.getCurrentStore();
        const position = store.getPosition(clients, isAdd);

        const { distX, distY } = this.clientStores.slice(1).reduce((prev, cur) => {
            const storePosition = cur.getPosition();

            prev.distX += storePosition.distX;
            prev.distY += storePosition.distY;
            return prev;
        }, position);

        return {
            ...position,
            distX,
            distY,
        };
    }
    private _allowClickEvent = () => {
        removeEvent(this._window, "click", this._onClick, true);
    };
    private _attchDragEvent() {
        const win = this._window;
        const container = this.options.container!;
        const passive = {
            passive: false
        };

        if (this._isDragAPI) {
            addEvent(container, "dragover", this.onDrag, passive);
            addEvent(win, "dragend", this.onDragEnd);
        }
        if (this._useMouse) {
            addEvent(container, "mousemove", this.onDrag);
            addEvent(win, "mouseup", this.onDragEnd);
        }

        if (this._useTouch) {
            addEvent(container, "touchmove", this.onDrag, passive);
            addEvent(win, "touchend", this.onDragEnd, passive);
            addEvent(win, "touchcancel", this.onDragEnd, passive);
        }
    };
    private _dettachDragEvent() {
        const win = this._window;
        const container = this.options.container!;

        if (this._isDragAPI) {
            removeEvent(container, "dragover", this.onDrag);
            removeEvent(win, "dragend", this.onDragEnd);
        }
        if (this._useMouse) {
            removeEvent(container, "mousemove", this.onDrag);
            removeEvent(win, "mouseup", this.onDragEnd);
        }

        if (this._useTouch) {
            removeEvent(container, "touchstart", this.onDragStart);
            removeEvent(container, "touchmove", this.onDrag);
            removeEvent(win, "touchend", this.onDragEnd);
            removeEvent(win, "touchcancel", this.onDragEnd);
        }
    };
    private _onClick = (e: MouseEvent) => {
        this._allowClickEvent();
        this._allowMouseEvent();

        const preventClickEventByCondition = this.options.preventClickEventByCondition;
        if (preventClickEventByCondition?.(e)) {
            return;
        }
        e.stopPropagation();
        e.preventDefault();
    }
    private _onContextMenu = (e: MouseEvent) => {
        const options = this.options;
        if (!options.preventRightClick) {
            e.preventDefault();
        } else {
            this.onDragEnd(e);
        }
    }
    private _allowMouseEvent() {
        this._preventMouseEvent = false;
        clearTimeout(this._preventMouseEventId);
    }
    private _passCallback = () => { };
}

export default Gesto;
