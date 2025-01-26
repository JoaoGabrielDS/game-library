const BASE_URL = 'http://localhost:8080'; // URL do backend

// Elementos do DOM
const listContainer = document.getElementById('list-container');
const gamesContainer = document.getElementById('games-container');
const gameImage = document.getElementById('game-image');
const gameDescription = document.getElementById('game-description');
const gameDetailContainer = document.getElementById('game-detail-container');
const placeholderText = document.getElementById('placeholder-text');

// Função para buscar as listas
async function fetchLists() {
    try {
        const response = await fetch(`${BASE_URL}/lists`);
        if (!response.ok) {
            throw new Error(`Erro ao buscar listas: ${response.status}`);
        }
        const lists = await response.json();
        console.log('Listas recebidas:', lists);

        listContainer.innerHTML = '';
        lists.forEach(list => {
            const listItem = document.createElement('li');
            listItem.textContent = list.name;
            listItem.onclick = () => fetchGames(list.id); // Carrega os jogos ao clicar
            listContainer.appendChild(listItem);
        });
    } catch (error) {
        console.error('Erro ao buscar listas:', error);
    }
}

// Função para buscar jogos de uma lista específica
async function fetchGames(listId) {
    try {
        const response = await fetch(`${BASE_URL}/lists/${listId}/games`);
        if (!response.ok) {
            throw new Error(`Erro ao buscar jogos: ${response.status}`);
        }
        const games = await response.json();
        console.log(`Jogos da lista ${listId}:`, games);

        gamesContainer.innerHTML = '';
        games.forEach((game, index) => {
            const gameItem = document.createElement('li');
            gameItem.textContent = game.title;
            gameItem.draggable = true; // Torna o item arrastável
            gameItem.dataset.index = index; // Salva o índice do jogo

            // Evento de clique para exibir os detalhes
            gameItem.addEventListener('click', () => showGameDetails(game));

            // Eventos de drag-and-drop
            gameItem.addEventListener('dragstart', (event) => handleDragStart(event, index));
            gameItem.addEventListener('dragover', (event) => handleDragOver(event));
            gameItem.addEventListener('drop', (event) => handleDrop(event, listId, index));

            gamesContainer.appendChild(gameItem);
        });
    } catch (error) {
        console.error('Erro ao buscar jogos:', error);
    }
}


let draggedIndex = null; // Índice do item sendo arrastado

function handleDragStart(event, index) {
    draggedIndex = index; // Salva o índice do item arrastado
    event.dataTransfer.effectAllowed = 'move';
    console.log(`Drag iniciado no índice ${index}`);
    event.target.classList.add('dragging'); // Adiciona estilo de arraste
}

function handleDragOver(event) {
    event.preventDefault(); // Permite o drop
    event.dataTransfer.dropEffect = 'move';
}

async function handleDrop(event, listId, targetIndex) {
    event.preventDefault();

    if (draggedIndex !== null && draggedIndex !== targetIndex) {
        console.log(`Movendo do índice ${draggedIndex} para ${targetIndex}`);
        
        // Chamar a função move no backend
        await moveGameInList(listId, draggedIndex, targetIndex);

        // Limpa o índice arrastado e atualiza a lista
        draggedIndex = null;
        fetchGames(listId); // Atualiza a interface
    }
}


// Função para mostrar os detalhes de um jogo
function showGameDetails(game) {
    // Exibe o contêiner de detalhes e oculta o texto de placeholder
    gameDetailContainer.style.display = 'block';
    placeholderText.style.display = 'none';

    // Define os detalhes do jogo
    gameImage.src = game.imgUrl || ''; // Define a URL da imagem (ou vazio se não existir)
    gameImage.alt = game.title || 'Imagem do jogo'; // Define o título como texto alternativo
    gameDescription.innerHTML = `
        <p><strong>Title:</strong> ${game.title}</p>
        <p><strong>Year:</strong> ${game.year}</p>
        <p><strong>Description:</strong> ${game.shortDescription}</p>
    `;
}

// Inicializar a página com a imagem vazia
window.onload = () => {
    gameDetailContainer.style.display = 'none'; // Oculta o contêiner de detalhes
    placeholderText.style.display = 'block'; // Exibe o texto de placeholder
};

// Mover posição de um jogo dentro de uma lista
async function moveGameInList(listId, sourceIndex, destinationIndex) {
    try {
        await fetch(`${BASE_URL}/lists/${listId}/replacement`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sourceIndex: sourceIndex,
                destinantionIndex: destinationIndex
            })
        });

        // Atualiza a lista automaticamente para refletir a nova ordem
        fetchGames(listId);
    } catch (error) {
        console.error('Erro ao reordenar jogo:', error);
    }
}



// Carregar as listas ao iniciar
fetchLists();
