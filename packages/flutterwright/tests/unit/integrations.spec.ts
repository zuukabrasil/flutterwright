import { Flutterwright } from '../../src/flutterwright';
import WebSocket from 'ws';

jest.mock('ws');

describe('Gerenciador de Respostas (Message Broker)', () => {
  let app: Flutterwright;
  let mockWsInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    app = new Flutterwright();

    mockWsInstance = {
      on: jest.fn(),
      send: jest.fn(),
      close: jest.fn(),
      readyState: 1, // OPEN
    };

    (WebSocket as unknown as jest.Mock).mockImplementation(() => mockWsInstance);
  });

  it('deve aguardar a resposta do Flutter antes de resolver o click()', async () => {
    let messageCallback: Function = () => {};

    // 1. Simula a conexão e captura os ouvintes
    mockWsInstance.on.mockImplementation((event: string, cb: Function) => {
      if (event === 'message') messageCallback = cb;
      if (event === 'open') cb();
    });

    // 2. O roteador mágico: responde de acordo com o que o Flutterwright pedir
    mockWsInstance.send.mockImplementation((data: string, cb: Function) => {
      if (cb) cb(); // Confirma o envio na rede

      const request = JSON.parse(data);
      
      // 3. Simulamos o atraso de rede da Dart VM
      setTimeout(() => {
        if (request.method === 'getVM') {
          // Devolve a thread principal para o connect() passar
          messageCallback(JSON.stringify({
            jsonrpc: '2.0',
            id: request.id,
            result: { isolates: [{ id: 'isolates/fake-999' }] }
          }));
        } 
        else if (request.method === 'ext.flutterwright.tap') {
          // Devolve o sucesso do clique para o click() passar
          messageCallback(JSON.stringify({
            jsonrpc: '2.0',
            id: request.id,
            result: { status: 'success' }
          }));
        }
      }, 20);
    });

    // 4. Conecta (vai acionar o getVM no mock)
    await app.connect('ws://localhost');
    const button = app.locator('btn-login');

    // 5. Clica (vai acionar o tap no mock)
    await expect(button.click()).resolves.toBeUndefined();
    
    // 6. Verifica se o payload enviado estava correto
    // ATENÇÃO: Como o getVM foi enviado primeiro, o 'tap' agora é a chamada de índice [1]
    const sentPayload = JSON.parse(mockWsInstance.send.mock.calls[1][0]);
    expect(sentPayload.method).toBe('ext.flutterwright.tap');
    
    // Bônus: Garante que ele injetou a Isolate ID no comando!
    expect(sentPayload.params.isolateId).toBe('isolates/fake-999');
  });
});