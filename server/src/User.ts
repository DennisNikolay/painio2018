import * as WebSocket from 'ws';
export interface User{
    lobby: string,
    socket: WebSocket,
}