document.getElementById('instanceForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const whatsappBot = document.getElementById('whatsappBot').value;
    const button = document.getElementById('submitButton');
    const buttonText = document.getElementById('buttonText');
    const connectionStatus = document.getElementById('connectionStatus');
    const countdown = document.getElementById('countdown');

    button.disabled = true;
    buttonText.textContent = 'Criando Instância...';
    connectionStatus.innerHTML = 'Criando instância...';
    countdown.innerHTML = '';

    try {
        const response = await fetch('https://serven8.automatizacomea.cloud/webhook-test/Criador_Instancia_0.6', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, whatsappBot })
        });

        if (response.ok) {
            const contentType = response.headers.get('Content-Type');
            
            if (contentType && contentType.includes('image/png')) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);

                const qrCodeImage = document.createElement('img');
                qrCodeImage.src = url;
                qrCodeImage.alt = 'QR Code';
                qrCodeImage.style.width = '200px';
                qrCodeImage.style.height = '200px';

                document.getElementById('qrCodeContainer').innerHTML = '';
                document.getElementById('qrCodeContainer').appendChild(qrCodeImage);
                connectionStatus.innerHTML = 'Instância criada. Aguardando conexão...';
                startCountdown();
            }
        } else {
            const errorMessage = await response.text();
            console.error('Erro na resposta do servidor:', errorMessage);
            connectionStatus.innerHTML = `Erro ao criar instância: ${errorMessage}`;
        }
    } catch (error) {
        console.error('Erro na comunicação com o servidor:', error);
        connectionStatus.innerHTML = 'Erro na comunicação com o servidor. Veja o console para detalhes.';
    } finally {
        button.disabled = false;
        buttonText.textContent = 'Estabelecer Conexão com o Bot';
    }
});

function startCountdown() {
    let timeRemaining = 50;
    const countdownInterval = setInterval(() => {
        timeRemaining--;
        document.getElementById('countdown').innerHTML = `QR Code expira em ${timeRemaining} segundos`;

        if (timeRemaining <= 0) {
            clearInterval(countdownInterval);
            document.getElementById('countdown').innerHTML = 'Tempo Esgotado.<br>' +
                'Caso não tenha conseguido ler o QR Code, solicite novamente.<br>' +
                'Caso já conseguiu, verifique a confirmação no seu WhatsApp.';
            document.getElementById('qrCodeContainer').innerHTML = 'QR Code expirado';
        }
    }, 1000);
}
