import { Flutterwright } from './src/index';
import path from 'path';

async function runTest() {
  const app = new Flutterwright();
  const exampleAppPath = path.resolve(__dirname, '../../example_app');

  try {
    await app.launch(exampleAppPath, 'linux');

    // Mapeia os nossos novos elementos
    const welcomeText = app.locator('welcome-txt');
    const nameInput = app.locator('name-input');
    const confirmButton = app.locator('submit-btn');

    // 1. Testa a leitura inicial (Assertion)
    const initialText = await welcomeText.innerText();
    console.log(`📖 Texto inicial na tela: "${initialText}"`);

    // 2. Executa a ação de preenchimento (Fill)
    console.log('⌨️ Preenchendo o campo de nome...');
    await nameInput.fill('Lucas');

    await new Promise(r => setTimeout(r, 500));

    // 3. Executa o clique
    console.log('👉 Clicando no botão confirmar...');
    await confirmButton.click();

    await new Promise(r => setTimeout(r, 300));

    // 4. Captura o novo texto e valida o resultado
    const finalText = await welcomeText.innerText();
    console.log(`📖 Texto final na tela: "${finalText}"`);

    if (finalText === 'Olá, Lucas!') {
      console.log('✅ SUCESSO: O fluxo de automação funcionou perfeitamente!');
    } else {
      console.error('❌ ERRO: O texto final não corresponde ao esperado.');
    }

    await new Promise(r => setTimeout(r, 1500));

  } catch (error) {
    console.error('❌ Ocorreu um erro na automação:', error);
  } finally {
    console.log('👋 Limpando e fechando processos...');
    await app.disconnect();
  }
}

runTest();