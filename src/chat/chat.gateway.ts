import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';



@WebSocketGateway({cors: true})
export class ChatGateway implements OnModuleInit {

  @WebSocketServer()
  public server: Server

  constructor(private readonly chatService: ChatService) {}
 
  onModuleInit() {
   this.server.on('connection', (socket: Socket)=>{
   
    const {name, token} = socket.handshake.auth; 
    if(!name){
      socket.disconnect();
      return;
    }

    //Add Client to Client List
    this.chatService.onLineConnected({id: socket.id, name: name})

    //Welcome Message 
    socket.emit('welcome-message', `${name} Bienvenido al Chat!!!`)

    //Client List
    this.server.emit('on-clients-changed', this.chatService.getClients());

    socket.on('disconnect', ()=>{
       this.chatService.onLineDisconnected(socket.id);
       this.server.emit('on-clients-changed', this.chatService.getClients());
    })
   });
  }

  @SubscribeMessage('send-message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket
  ){
    const {name, token}= client.handshake.auth;
    if(!message){
      return;
    }

    this.server.emit(
      'on-message',
      {
        userId: client.id,
        message,
        name,
        token
      }
    );
  }

}
