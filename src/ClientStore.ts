import { Client, Position } from "./types";
import { getPosition, getDist, getRotatiion, getAverageClient } from "./utils";

export class ClientStore {
    public prevClients: Client[] = [];
    public startClients: Client[] = [];
    public movement = 0;
    public length  = 0;
    constructor(clients: Client[]) {
        this.startClients = clients;
        this.prevClients = clients;
        this.length = clients.length;
    }
    public getAngle(clients: Client[] = this.prevClients) {
        return getRotatiion(clients);
    }
    public getRotation(clients: Client[] = this.prevClients) {
        return getRotatiion(clients) - getRotatiion(this.startClients);
    }
    public getPosition(clients: Client[] = this.prevClients, isAdd?: boolean) {
        const position = getPosition(clients || this.prevClients, this.prevClients, this.startClients);

        const { deltaX, deltaY } = position;

        this.movement += Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        this.prevClients = clients;

        return position;
    }
    public getPositions(clients: Client[] = this.prevClients) {
        const prevClients = this.prevClients;
        const startClients = this.startClients;
        const minLength = Math.min(this.length, prevClients.length);
        const positions: Position[] = [];

        for (let i = 0; i < minLength; ++i) {
            positions[i] = getPosition([clients[i]], [prevClients[i]], [startClients[i]]);
        }

        return positions;
    }
    public getMovement(clients?: Client[]) {
        const movement = this.movement;

        if (!clients) {
            return movement;
        }
        const currentClient = getAverageClient(clients, this.length);
        const prevClient = getAverageClient(this.prevClients, this.length);
        const deltaX = currentClient.clientX - prevClient.clientX;
        const deltaY = currentClient.clientY - prevClient.clientY;

        return Math.sqrt(deltaX * deltaX + deltaY * deltaY) + movement;
    }
    public getDistance(clients = this.prevClients) {
        return getDist(clients);
    }
    public getScale(clients = this.prevClients) {
        return getDist(clients) / getDist(this.startClients);
    }
    public move(deltaX: number, deltaY: number) {
        this.startClients.forEach(client => {
            client.clientX -= deltaX;
            client.clientY -= deltaY;
        });
        this.prevClients.forEach(client => {
            client.clientX -= deltaX;
            client.clientY -= deltaY;
        });
    }
}
