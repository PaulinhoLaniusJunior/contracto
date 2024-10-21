// Pegar os elementos do DOM
const addContractBtn = document.getElementById('addContractBtn');
const contractFileInput = document.getElementById('contractFileInput');
const contractHistory = document.getElementById('contractHistory');
const contractList = document.getElementById('contractList');
const contractViewer = document.getElementById('contractViewer');
const contractIframe = document.getElementById('contractIframe');
const closeViewerBtn = document.getElementById('closeViewerBtn');
const signatureModal = document.getElementById('signatureModal');
const signaturePad = document.getElementById('signaturePad');
const signaturePositioningModal = document.getElementById('signaturePositioningModal');
const signatureImage = document.getElementById('signatureImage');
const pdfCanvas = document.getElementById('pdfCanvas');
 
let signatureData = ''; // Variável para armazenar a assinatura
let currentFile = null; // Variável para armazenar o arquivo atual selecionado
 
// Abrir o seletor de arquivos quando clicar em "Adicionar Contrato"
addContractBtn.addEventListener('click', () => {
contractFileInput.click();
});
 
// Lidar com o upload de arquivos
contractFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        addToHistory(file);
    }
});
 
// Adiciona um contrato ao histórico
function addToHistory(file) {
    const dateAdded = new Date().toLocaleString();
    const fileSize = (file.size / 1024).toFixed(2) + ' KB'; // Tamanho em KB
    const li = document.createElement('li');
    li.innerHTML = `
${file.name} - ${dateAdded} - ${fileSize}
        <div class="buttons-container">
            <button class="btn sign-btn">Assinar</button>
            <button class="btn view-btn">Visualizar</button>
            <button class="btn delete-btn">Excluir</button>
        </div>
    `;
 
    // Armazena o arquivo atual para o processo de assinatura
    li.querySelector('.sign-btn').addEventListener('click', () => {
        currentFile = file;
        openSignaturePad(file);
    });
    
    li.querySelector('.view-btn').addEventListener('click', () => viewContract(file));
    li.querySelector('.delete-btn').addEventListener('click', () => deleteContract(li));
 
    contractList.appendChild(li);
}
 
// Função para visualizar o contrato
function viewContract(file) {
    const url = URL.createObjectURL(file); // Cria uma URL temporária para o arquivo
    contractIframe.src = url; // Define o src do iframe para o arquivo
contractViewer.style.display = 'block'; // Exibe a área de visualização
}
 
// Função para excluir contrato
function deleteContract(li) {
    contractList.removeChild(li); // Remove o contrato da lista
if (contractViewer.style.display === 'block') {
contractViewer.style.display = 'none'; // Esconde a área de visualização
        contractIframe.src = ''; // Limpa o iframe
    }
}
 
// Fechar o visualizador
closeViewerBtn.addEventListener('click', () => {
contractViewer.style.display = 'none'; // Esconde a área de visualização
    contractIframe.src = ''; // Limpa o iframe
});
 
// Função para abrir o modal de assinatura
function openSignaturePad() {
signatureModal.style.display = 'flex'; // Exibe o modal de assinatura
    const ctx = signaturePad.getContext('2d');
    let isDrawing = false;
 
    // Configuração para desenhar no canvas
    signaturePad.addEventListener('mousedown', (e) => {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    });
 
    signaturePad.addEventListener('mousemove', (e) => {
        if (isDrawing) {
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        }
    });
 
    signaturePad.addEventListener('mouseup', () => {
        isDrawing = false;
    });
 
    signaturePad.addEventListener('mouseleave', () => {
        isDrawing = false;
    });
 
    // Botão para limpar a assinatura
    document.getElementById('clearSignature').addEventListener('click', () => {
        ctx.clearRect(0, 0, signaturePad.width, signaturePad.height);
    });
 
    // Botão para salvar a assinatura e ir para o posicionamento
    document.getElementById('saveSignature').addEventListener('click', () => {
        signatureData = signaturePad.toDataURL(); // Salva a assinatura como base64
signatureModal.style.display = 'none'; // Esconde o modal de assinatura
        openPositioningScreen(); // Abre a tela para posicionar a assinatura
    });
}
 
// Função para abrir a tela de posicionamento de assinatura
function openPositioningScreen() {
signaturePositioningModal.style.display = 'flex'; // Exibe o modal de posicionamento
    enableSignaturePositioning(signatureData);
}
 
// Permitir o posicionamento da assinatura
function enableSignaturePositioning(signatureData) {
    signatureImage.src = signatureData;
signatureImage.style.display = 'block';
    let isDragging = false;
    let offsetX, offsetY;
 
    signatureImage.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
    });
 
    pdfCanvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
signatureImage.style.left = `${e.clientX - offsetX}px`;
signatureImage.style.top = `${e.clientY - offsetY}px`;
        }
    });
 
    pdfCanvas.addEventListener('mouseup', () => {
        isDragging = false;
    });
 
    // Salvar a assinatura posicionada
    document.getElementById('savePositionedSignature').addEventListener('click', () => {
        saveSignatureAtPosition(currentFile); // Passar o arquivo atual para a função de salvar
    });
 
    // Cancelar o posicionamento
    document.getElementById('cancelPositioning').addEventListener('click', () => {
signaturePositioningModal.style.display = 'none';
    });
}
 
// Função para salvar a assinatura no PDF
async function saveSignatureAtPosition(file) {
const posX = parseInt(signatureImage.style.left);
const posY = parseInt(signatureImage.style.top);
 
    const pdfBytes = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
    const firstPage = pdfDoc.getPages()[0];
 
    // Carregar a imagem da assinatura
    const signatureImageObj = await pdfDoc.embedPng(signatureData);
    const signatureWidth = 150;
    const signatureHeight = (signatureImageObj.height / signatureImageObj.width) * signatureWidth;
 
    firstPage.drawImage(signatureImageObj, {
        x: posX,
        y: posY,
        width: signatureWidth,
        height: signatureHeight
    });
 
    const modifiedPdfBytes = await pdfDoc.save();
 
    // Atualizar o contrato no histórico
updateContractInHistory(modifiedPdfBytes, file.name);
}
 
// Função para atualizar o histórico de contratos com o novo arquivo
function updateContractInHistory(modifiedPdfBytes, fileName) {
    const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
    const fileUrl = URL.createObjectURL(blob);
 
    const contractItems = document.querySelectorAll('#contractList li');
    contractItems.forEach(item => {
        if (item.textContent.includes(fileName)) {
            item.querySelector('.view-btn').addEventListener('click', () => viewContract(blob));
        }
    });
 
    // Fechar o modal de posicionamento
signaturePositioningModal.style.display = 'none';
}
 
// Função para visualizar o contrato e adicionar botão de download
function viewContract(blob) {
    const url = URL.createObjectURL(blob);
    contractIframe.src = url;
contractViewer.style.display = 'block';
 
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn';
    downloadBtn.textContent = 'Download';
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = url;
link.download = 'Contrato-assinado.pdf';
link.click();
    });
 
    contractViewer.appendChild(downloadBtn);
}