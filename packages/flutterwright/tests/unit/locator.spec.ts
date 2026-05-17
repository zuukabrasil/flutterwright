import { Locator } from '../../src/locator';
import { Flutterwright } from '../../src/flutterwright';

describe('Locator', () => {
  let mockApp: jest.Mocked<Flutterwright>;
  let locator: Locator;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Criamos uma versão falsa do app apenas com o método sendCommand
    mockApp = {
      sendCommand: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Flutterwright>;
    
    // Instanciamos nosso Locator com o mock do app e o seletor
    locator = new Locator(mockApp, 'submit-btn');
  });

  it('deve chamar o sendCommand da classe principal com a ação tap ao clicar', async () => {
    await locator.click();

    // Verifica se o Locator repassou a ordem corretamente para a classe principal
    expect(mockApp.sendCommand).toHaveBeenCalledTimes(1);
    expect(mockApp.sendCommand).toHaveBeenCalledWith('ext.flutterwright.tap', { target: 'submit-btn' });
  });

  it('deve chamar o sendCommand com a ação fill e o texto correto ao preencher', async () => {
    await locator.fill('senha123');

    expect(mockApp.sendCommand).toHaveBeenCalledTimes(1);
    expect(mockApp.sendCommand).toHaveBeenCalledWith('ext.flutterwright.fill', { 
      target: 'submit-btn', 
      text: 'senha123' 
    });
  });
});