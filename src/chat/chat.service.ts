import { Injectable } from '@nestjs/common';

interface Client{
    id: string;
    name: string;
}

@Injectable()
export class ChatService {
    private clients: Record<string, Client>={};

    onLineConnected(client: Client){
       this.clients[client.id]= client;
    }

    onLineDisconnected(id: string){
      delete this.clients[id];
    }

    getClients(){
        return Object.values(this.clients)   //[Client, Client, Client...]
    }
}
