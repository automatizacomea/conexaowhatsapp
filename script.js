document.getElementById('instanceForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const whatsappBot = document.getElementById('whatsappBot').value;

    document.getElementById('connectionStatus').innerHTML = 'Criando instância...';
    document.getElementById('countdown').innerHTML = '';

    try {
        const response = await fetch('https://serven8.automatizacomea.cloud/webhook-test/Criador_Instancia_0.6', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, whatsappBot })
        });

        if (response.ok) {
            const contentType = response.headers.get('Content-Type');
            
            if (contentType && contentType.includes('image/png')) {
                // Exibir QR Code
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);

                const qrCodeImage = document.createElement('img');
                qrCodeImage.src = url;
                qrCodeImage.alt = 'QR Code';
                qrCodeImage.style.width = '200px';
                qrCodeImage.style.height = '200px';

                document.getElementById('qrCodeContainer').innerHTML = ''; // Limpa o placeholder
                document.getElementById('qrCodeContainer').appendChild(qrCodeImage);
                document.getElementById('connectionStatus').innerHTML = 'Instância criada. Aguardando conexão...';
                startCountdown();

                // Iniciar verificação periódica de conexão
                setTimeout(checkConnection, 5000);
            }
        } else {
            const errorMessage = await response.text();
            console.error('Erro na resposta do servidor:', errorMessage);
            document.getElementById('connectionStatus').innerHTML = `Erro ao criar instância: ${errorMessage}`;
        }
    } catch (error) {
        console.error('Erro na comunicação com o servidor:', error);
        document.getElementById('connectionStatus').innerHTML = 'Erro na comunicação com o servidor. Veja o console para detalhes.';
    }
});

// Função para verificar a conexão
async function checkConnection() {
    try {
        const response = await fetch('https://serven8.automatizacomea.cloud/webhook-test/Analisar_Instacia', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Verificar se a conexão foi estabelecida
            if (data.connected === true) {
                showSuccessMessage("Conexão estabelecida com sucesso!");
            } else {
                setTimeout(checkConnection, 5000); // Verificar novamente após 5 segundos
            }
        } else {
            console.error('Erro ao verificar conexão.');
        }
    } catch (error) {
        console.error('Erro na comunicação com o servidor ao verificar a conexão:', error);
    }
}

// Função para exibir a mensagem de sucesso
function showSuccessMessage(message) {
    document.getElementById('qrCodeContainer').innerHTML = '<div class="alert alert-success">' + message + '</div>';
    document.getElementById('connectionStatus').innerHTML = message;
    document.getElementById('countdown').innerHTML = ''; // Remove o contador
}

// Função para iniciar o contador de expiração do QR Code
function startCountdown() {
    let timeRemaining = 50;
    const countdownInterval = setInterval(() => {
        timeRemaining--;
        document.getElementById('countdown').innerHTML = `QR Code expira em ${timeRemaining} segundos`;

        if (timeRemaining <= 0) {
            clearInterval(countdownInterval);
            document.getElementById('countdown').innerHTML = 'QR Code expirado. Faça a solicitação novamente.';
            document.getElementById('qrCodeContainer').innerHTML = 'QR Code expirado'; // Remove o QR Code
        }
    }, 1000);
}
