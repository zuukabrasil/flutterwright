import { Flutterwright } from '../../src/flutterwright';
import { Locator } from '../../src/locator';
import WebSocket from 'ws';

// Mockamos a biblioteca 'ws'
jest.mock('ws');

describe('Flutterwright Main Class', () => {
  let app: Flutterwright;
  let mockWsInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    app = new Flutterwright();

    // Adicionamos o mock do 'send' na nossa instância falsa
    mockWsInstance = {
      on: jest.fn(),
      close: jest.fn(),
      send: jest.fn(),
      readyState: 1, // 1 = OPEN
    };

    (WebSocket as unknown as jest.Mock).mockImplementation(() => mockWsInstance);
  });

  // ✨ NOVA FUNÇÃO: Simula o Flutter respondendo a conexão e entregando a Isolate ID
  const simulateSuccessfulConnection = () => {
    let messageCallback: any = null;

    mockWsInstance.on.mockImplementation((event: string, cb: Function) => {
      if (event === 'message') messageCallback = cb; // Salva quem ouve as mensagens
      if (event === 'open') cb(); // Dispara a abertura
    });

    mockWsInstance.send.mockImplementation((data: string, cb: Function) => {
      if (cb) cb(); // Confirma o envio da rede
      
      const payload = JSON.parse(data);
      
      // Se a classe pedir a VM, simulamos a resposta do Flutter 10ms depois
      if (payload.method === 'getVM') {
        setTimeout(() => {
          if (messageCallback) {
            messageCallback(JSON.stringify({
              jsonrpc: '2.0',
              id: payload.id,
              result: { isolates: [{ id: 'isolates/fake-12345' }] } // O fake Isolate!
            }));
          }
        }, 10);
      }
    });
  };

  it('deve conectar ao WebSocket e capturar o Isolate principal no evento open', async () => {
    simulateSuccessfulConnection();

    await expect(app.connect('ws://localhost')).resolves.toBeUndefined();
    expect(WebSocket).toHaveBeenCalledWith('ws://localhost');
    expect(mockWsInstance.send).toHaveBeenCalled(); // Garante que ele tentou buscar o Isolate
  });

  it('deve disparar erro se tentar criar um locator antes de conectar', () => {
    expect(() => {
      app.locator('meu-botao');
    }).toThrow('Você precisa chamar launch() ou connect() antes de usar um locator.');
  });

  it('deve retornar uma instância de Locator ao chamar locator() após conectado', async () => {
    simulateSuccessfulConnection();
    await app.connect('ws://localhost');
    
    const element = app.locator('meu-botao');
    expect(element).toBeInstanceOf(Locator);
  });

  it('deve retornar um Locator formatado ao chamar getByText()', async () => {
    simulateSuccessfulConnection();
    await app.connect('ws://localhost');
    
    const element = app.getByText('Salvar') as any; 
    expect(element.selector).toBe('text=Salvar');
  });
});