document.getElementById("instanceForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const nome = document.getElementById("nome").value
  const whatsappBot = document.getElementById("whatsappBot").value
  const button = document.getElementById("submitButton")
  const buttonText = document.getElementById("buttonText")
  const connectionStatus = document.getElementById("connectionStatus")
  const countdown = document.getElementById("countdown")

  button.disabled = true
  buttonText.textContent = "Criando Conexão..."
  connectionStatus.innerHTML = "Criando Conexão..."
  countdown.innerHTML = ""

  try {
    const response = await fetch("https://webhook.automatizacomea.cloud/webhook/Criador_Instancia_0.6", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, whatsappBot }),
    })

    if (response.ok) {
      const contentType = response.headers.get("Content-Type")

      if (contentType && contentType.includes("image/png")) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)

        const qrCodeImage = document.createElement("img")
        qrCodeImage.src = url
        qrCodeImage.alt = "QR Code"
        qrCodeImage.style.width = "200px"
        qrCodeImage.style.height = "200px"

        document.getElementById("qrCodeContainer").innerHTML = ""
        document.getElementById("qrCodeContainer").appendChild(qrCodeImage)
        connectionStatus.innerHTML = "QrCode criado. Aguardando conexão..."
        startCountdown(nome, whatsappBot)
      }
    } else {
      const errorMessage = await response.text()
      console.error("Erro na resposta do servidor:", errorMessage)
      connectionStatus.innerHTML = `Erro ao criar instância: ${errorMessage}`
    }
  } catch (error) {
    console.error("Erro na comunicação com o servidor:", error)
    connectionStatus.innerHTML = "Erro na comunicação com o servidor. Veja o console para detalhes."
  } finally {
    button.disabled = false
    buttonText.textContent = "Estabelecer Conexão com o Bot"
  }
})

function startCountdown(nome, whatsappBot) {
  let timeRemaining = 50
  const countdownInterval = setInterval(async () => {
    timeRemaining--
    document.getElementById("countdown").innerHTML = `QR Code expira em ${timeRemaining} segundos`

    const isConnected = await checkConnectionStatus(nome, whatsappBot)
    if (isConnected) {
      clearInterval(countdownInterval)
      return
    }

    if (timeRemaining <= 0) {
      clearInterval(countdownInterval)
      document.getElementById("countdown").innerHTML =
        "Erro.<br>" +
        "Se não conseguiu ler o QR Code, tente novamente.<br>" +
        "Caso tenha conseguido, verifique a mensagem de confirmação em seu WhatsApp. Se tudo estiver correto, você receberá uma notificação por lá!"
      document.getElementById("qrCodeContainer").innerHTML = "O tempo de conexão expirou"
      document.getElementById("connectionStatus").innerHTML = "Aguardando criação da instância..."
    }
  }, 1000)
}

async function checkConnectionStatus(nome, whatsappBot) {
  const connectionStatus = document.getElementById("connectionStatus")
  const qrCodeContainer = document.getElementById("qrCodeContainer")

  try {
    const response = await fetch("https://webhook.automatizacomea.cloud/webhook/analisa_status_conexao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, whatsappBot }),
    })

    if (response.ok) {
      const data = await response.json()
      if (data.status === "OPEN") {
        connectionStatus.innerHTML = "Conexão estabelecida com sucesso!"
        qrCodeContainer.innerHTML =
          '<img src="confirmation-image.png" alt="Conexão confirmada" style="width: 200px; height: 200px;">'
        return true
      } else {
        connectionStatus.innerHTML = `Status da conexão: ${data.status}`
        return false
      }
    } else {
      throw new Error("Falha ao verificar o status da conexão")
    }
  } catch (error) {
    console.error("Erro ao verificar o status da conexão:", error)
    connectionStatus.innerHTML = "Erro ao verificar o status da conexão. Veja o console para detalhes."
    return false
  }
}
