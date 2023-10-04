import { Client, Position } from "./types";
import { IArrayFormat, isNumber } from "@daybrush/utils";

export function getRad(pos1: number[], pos2: number[]) {
    const distX = pos2[0] - pos1[0];
    const distY = pos2[1] - pos1[1];
    const rad = Math.atan2(distY, distX);

    return rad >= 0 ? rad : rad + Math.PI * 2;
}

export function getRotatiion(touches: Client[]) {
    return getRad([
        touches[0].clientX,
        touches[0].clientY,
    ], [
        touches[1].clientX,
        touches[1].clientY,
    ]) / Math.PI * 180;
}

export function isMultiTouch(e: any): e is TouchEvent {
    return e.touches && e.touches.length >= 2;
}
export function getEventClients(e: any): Client[] {
    if (!e) {
        return [];
    } if (e.touches) {
        return getClients(e.touches);
    } else {
        return [getClient(e)];
    }
}
export function isMouseEvent(e: any): e is MouseEvent {
    return e && (e.type.indexOf("mouse") > -1 || "button" in e);
}
export function getPosition(clients: Client[], prevClients: Client[], startClients: Client[]): Position {
    const length = startClients.length;
    const {
        clientX,
        clientY,
        originalClientX,
        originalClientY,
    } = getAverageClient(clients, length);
    const {
        clientX: prevX,
        clientY: prevY,
    } = getAverageClient(prevClients, length);

    const {
        clientX: startX,
        clientY: startY,
    } = getAverageClient(startClients, length);
    const deltaX = clientX - prevX;
    const deltaY = clientY - prevY;
    const distX = clientX - startX;
    const distY = clientY - startY;

    return {
        clientX: originalClientX!,
        clientY: originalClientY!,
        deltaX,
        deltaY,
        distX,
        distY,
    };
}
export function getDist(clients: Client[]) {
    return Math.sqrt(
        Math.pow(clients[0].clientX - clients[1].clientX, 2)
        + Math.pow(clients[0].clientY - clients[1].clientY, 2),
    );
}
export function getClients(touches: IArrayFormat<Touch>) {
    const length = Math.min(touches.length, 2);
    const clients = [];

    for (let i = 0; i < length; ++i) {
        clients.push(getClient(touches[i]));
    }
    return clients;
}
export function getClient(e: MouseEvent | Touch): Client {
    return {
        clientX: e.clientX,
        clientY: e.clientY,
    };
}
export function getAverageClient(clients: Client[], length = clients.length): Required<Client> {
    const sumClient: Required<Client> = {
        clientX: 0,
        clientY: 0,
        originalClientX: 0,
        originalClientY: 0,
    };
    const minLength = Math.min(clients.length, length);

    for (let i = 0; i < minLength; ++i) {
        const client = clients[i];

        sumClient.originalClientX += "originalClientX" in client ? client.originalClientX! : client.clientX;
        sumClient.originalClientY += "originalClientY" in client ? client.originalClientY! : client.clientY;
        sumClient.clientX += client.clientX;
        sumClient.clientY += client.clientY;
    }
    if (!length) {
        return sumClient;
    }
    return {
        clientX: sumClient.clientX / length,
        clientY: sumClient.clientY / length,
        originalClientX: sumClient.originalClientX / length,
        originalClientY: sumClient.originalClientY / length,
    };
}
export function plueClient(client1: Client, client2: Client) {
    return {
        clientX: (client1.clientX + client2.clientX),
        clientY: (client1.clientY + client2.clientY),
    };
}

export function minusClient(client1: Client, client2: Client) {
    return {
        clientX: (client1.clientX - client2.clientX),
        clientY: (client1.clientY - client2.clientY),
    };
}
