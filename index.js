// Seletores principais
const $startGameButton = document.querySelector(".start-quiz");
const $nextQuestionButton = document.querySelector(".next-question");
const $questionsContainer = document.querySelector(".questions-container");
const $questionText = document.querySelector(".question");
const $answersContainer = document.querySelector(".answers-container");
const $addQuestionButton = document.querySelector(".add-question");
const $newQuestionInput = document.querySelector("#new-question");
const $newAnswerInputs = document.querySelectorAll(".new-answer");
const $selectModeButton = document.querySelector(".select-mode");
const $themeSelection = document.querySelector(".theme-selection");
const $themeSelect = document.querySelector("#theme-select");
const $confirmThemeButton = document.querySelector(".confirm-theme");
const $newCategoryInput = document.querySelector("#new-category");
const $usernameInput = document.querySelector("#player-name");
const $specialModeButtons = document.querySelectorAll(".special-mode");
const $timerDisplay = document.createElement("div");
const playButton = document.getElementById("playButton");
const adminButton = document.getElementById("adminButton");
const gameContainer = document.getElementById("gameContainer");
const adminContainer = document.getElementById("adminContainer");
const quizContainer = document.querySelector(".quiz-container");


// Adiciona o temporizador ao contêiner de perguntas
$timerDisplay.classList.add('alert', 'alert-warning', 'text-center', 'mt-3');

let currentQuestionIndex = 0;
let totalCorrect = 0;
let selectedTheme = "geral"; // Tema fixo predefinido
let filteredQuestions = [];
let timer;
let gameMode = null;
let playerName = "";
let leaderboard = [];
let questionsList = []; // Array para armazenar perguntas
let categories = {
    geral: [],
};

console.log("Estado inicial de questionsList:", questionsList);

// Função para salvar perguntas no localStorage
function saveQuestionsToLocalStorage() {
    localStorage.setItem('questionsList', JSON.stringify(questionsList));
}

// Função para carregar perguntas do localStorage
function loadQuestionsFromLocalStorage() {
    const savedQuestions = localStorage.getItem('questionsList');
    if (savedQuestions) {
        questionsList = JSON.parse(savedQuestions);
        console.log("Perguntas carregadas:", questionsList);
        displayQuestions();
    }

    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
        const categoriesArray = JSON.parse(savedCategories);
        categoriesArray.forEach(category => {
            if (!categories[category]) {
                categories[category] = []; // Cria a categoria se não existir
            }
        });
    }
}
function saveCategoriesToLocalStorage() {
    localStorage.setItem('categories', JSON.stringify(Object.keys(categories)));
}

// Chame a função loadQuestionsFromLocalStorage quando o programa iniciar
loadQuestionsFromLocalStorage();

// Função para adicionar uma nova pergunta
function addQuestion() {
    const questionText = $newQuestionInput.value.trim();
    const category = $newCategoryInput.value.trim().toLowerCase() || "geral"; // Converte para minúsculas

    // Adiciona a nova pergunta à categoria correspondente
    if (!categories[category]) {
        categories[category] = []; // Cria a categoria se não existir
    }

    const answers = Array.from($newAnswerInputs).map(input => input.value.trim());
    const correctAnswerIndex = parseInt(document.querySelector('input[name="correct-answer"]:checked')?.value);

    // Validação
    if (!questionText || answers.some(a => a === "") || answers.length < 2 || isNaN(correctAnswerIndex)) {
        alert("Por favor, preencha todos os campos e escolha a resposta correta.");
        return;
    }

    const newQuestion = {
        id: Date.now(),
        text: questionText,
        category: category,
        answers: answers.map((answer, index) => ({
            text: answer,
            correct: index === correctAnswerIndex
        }))
    };

    // Adiciona a nova pergunta à lista global
    questionsList.push(newQuestion);
    categories[category].push(newQuestion); // Adiciona à categoria correspondente

    // Salva no localStorage
    saveQuestionsToLocalStorage();
    saveCategoriesToLocalStorage(); // Salva os temas no localStorage
    updateThemeSelection(); // Atualiza a seleção de temas
    alert("Pergunta adicionada com sucesso!");
    displayQuestions(); // Atualiza a exibição das perguntas
}

// Função para atualizar a lista de temas
function updateThemeSelection() {
    $themeSelect.innerHTML = ""; // Limpa os temas exibidos

    Object.keys(categories).forEach(category => {
        if (categories[category].length > 0) { // Apenas adiciona se houver perguntas
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            $themeSelect.appendChild(option);
        }
    });

    // Adiciona a opção "Geral" apenas uma vez, se houver perguntas
    if (!Array.from($themeSelect.options).some(option => option.value === "geral") && categories['geral'].length > 0) {
        const generalOption = document.createElement("option");
        generalOption.value = "geral";
        generalOption.textContent = "Geral";
        $themeSelect.appendChild(generalOption);
    }
}

// Função para exibir perguntas
function displayQuestions() {
    const questionsContainer = document.getElementById("questions-display");
    questionsContainer.innerHTML = ""; // Limpa o conteúdo atual

    // Exibe todas as perguntas em questionsList
    questionsList.forEach((question) => {
        const questionItem = document.createElement("div");
        questionItem.className = "question-item";
        
        // Exibe a pergunta com botões Editar e Excluir
        questionItem.innerHTML = `
 <p><strong>Pergunta:</strong> ${question.text}</p>
            <p><strong>Categoria:</strong> ${question.category}</p>
            <p><strong>Respostas:</strong> ${question.answers.map(answer => answer.text).join(", ")}</p>
            <button class="btn btn-secondary btn-sm edit-question" data-id="${question.id}">Editar</button>
            <button class="btn btn-danger btn-sm delete-question" data-id="${question.id}">Excluir</button>
            <hr>
        `;

        questionsContainer.appendChild(questionItem);
    });

    // Adiciona eventos de clique nos botões de edição e exclusão
    document.querySelectorAll('.edit-question').forEach(button => {
        button.addEventListener("click", () => editQuestion(parseInt(button.dataset.id)));
    });

    document.querySelectorAll('.delete-question').forEach(button => {
        button.addEventListener("click", () => deleteQuestion(parseInt(button.dataset.id)));
    });
}
// Função para editar uma pergunta
function editQuestion(questionId) {
    const question = questionsList.find(q => q.id === questionId);

    if (!question) {
        alert("Pergunta não encontrada.");
        return;
    }

    const newQuestionText = prompt("Edite a pergunta:", question.text) || question.text;
    const newCategory = prompt("Edite a categoria:", question.category) || question.category;
    const newAnswers = question.answers.map((answer, index) => {
        const newText = prompt(`Resposta ${index + 1}:`, answer.text) || answer.text;
        return { text: newText, correct: false }; // Inicialmente marcar todas como falsas
    });

    const newCorrectAnswerIndexInput = prompt("Digite o índice da resposta correta (0 a 3):");
    const newCorrectAnswerIndex = parseInt(newCorrectAnswerIndexInput);

if (isNaN(newCorrectAnswerIndex) || newCorrectAnswerIndex < 0 || newCorrectAnswerIndex > 3) {
    alert("Por favor, insira um índice válido entre 0 e 3.");
    return; // Sai da função se o índice não for válido
}

    // Marcar a nova resposta correta
    newAnswers[newCorrectAnswerIndex].correct = true;

    question.text = newQuestionText;
    question.category = newCategory;
    question.answers = newAnswers;

    saveQuestionsToLocalStorage(); // Salva no localStorage

    alert("Pergunta editada com sucesso!");
    displayQuestions();
}

// Função para excluir uma pergunta
function deleteQuestion(questionId) {
    const questionIndex = questionsList.findIndex(q => q.id === questionId);

    if (questionIndex === -1) {
        alert("Pergunta não encontrada.");
        return;
    }

    // Remover a pergunta de `questionsList`
    const question = questionsList.splice(questionIndex, 1)[0];

    // Remover a pergunta da categoria correspondente
    if (categories[question.category]) {
        categories[question.category] = categories[question.category].filter(q => q.id !== questionId);

        // Remover o tema se não houver mais perguntas
        if (categories[question.category].length === 0) {
            delete categories[question.category]; // Remove a categoria do objeto categories
            saveCategoriesToLocalStorage(); // Atualiza o localStorage para remover a categoria vazia
        }
    }

    // Atualizar perguntas filtradas e localStorage
    filteredQuestions = filteredQuestions.filter(q => q.id !== questionId);
    saveQuestionsToLocalStorage();

    alert("Pergunta excluída com sucesso!");
    displayQuestions();
}

// Funções principais de evento
$startGameButton.addEventListener("click", startGame);
$nextQuestionButton.addEventListener("click", displayNextQuestion);
$addQuestionButton.addEventListener("click", addQuestion);
$selectModeButton.addEventListener("click", showThemeSelection);
$confirmThemeButton.addEventListener("click", confirmThemeSelection);

// Função para exibir a seleção de tema
function showThemeSelection() {
    updateThemeSelection();
    $themeSelection.classList.remove("hide");
}

// Função para atualizar a lista de temas
function updateThemeSelection() {
    $themeSelect.innerHTML = ""; // Limpa os temas exibidos
    Object.keys(categories).forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        $themeSelect.appendChild(option);
    });

    // Adiciona a opção "Geral" apenas uma vez
    if (!Array.from($themeSelect.options).some(option => option.value === "geral")) {
        const generalOption = document.createElement("option");
        generalOption.value = "geral";
        generalOption.textContent = "Geral";
        $themeSelect.appendChild(generalOption);
    }
}

// Função para confirmar a seleção de tema
function confirmThemeSelection() {
    selectedTheme = $themeSelect.value;
    filteredQuestions = questionsList.filter(q => q.category === selectedTheme);// Filtra as perguntas do tema selecionado

    if (filteredQuestions.length > 0) {
        alert(`Tema "${selectedTheme}" confirmado!`);
        $startGameButton.classList.remove("hide"); // Habilita o botão "Começar Quiz"
    } else {
        alert(`Não há perguntas no tema "${selectedTheme}". Por favor, adicione perguntas.`);
        $startGameButton.classList.add("hide"); // Desabilita o botão "Começar Quiz"
    }
}

// Função para embaralhar um array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Troca os elementos
    }
}


let isGameActive = false;


// Função para iniciar o jogo
function startGame() {
    playerName = $usernameInput.value.trim();

    if (playerName === "") {
        alert("Por favor, insira seu nome antes de começar.");
        return;
    }

    // Carregar perguntas do localStorage
    loadQuestionsFromLocalStorage();
    history.pushState(null, null, location.href);
    document.getElementById("game-mode-section").classList.add("hide");

    // Atualiza a lista filtrada com base no tema selecionado
    filteredQuestions = questionsList.filter(q => q.category === selectedTheme);
    console.log("Perguntas filtradas para o jogo:", filteredQuestions);

    // Embaralha as perguntas filtradas
    shuffle(filteredQuestions);

    // Verifica se há perguntas disponíveis para o tema selecionado
    if (filteredQuestions.length === 0) {
        alert("Não há perguntas disponíveis para o tema selecionado. Por favor, adicione perguntas antes de iniciar o jogo.");
        return;
    }

    isGameActive = true;
    $usernameInput.parentElement.style.display = "none";
    $selectModeButton.classList.add("hide");
    $themeSelection.classList.add("hide");
    $startGameButton.classList.add("hide");
    $questionsContainer.classList.remove("hide");
    currentQuestionIndex = 0;
    totalCorrect = 0;

    // Adiciona o temporizador ao contêiner de perguntas
    $questionsContainer.appendChild($timerDisplay);
    $timerDisplay.classList.add('alert', 'alert-warning', 'text-center', 'mt-3');

    // Torna o botão de ajuda visível
    document.querySelector('.help-button').classList.remove('hide');

    // Inicia o modo contra o tempo se estiver ativo
    const isContraTempoActive = document.querySelector('.special-mode[data-mode="contra-tempo"]').classList.contains('active');
    if (isContraTempoActive) {
        startTimer(totalTime); // Inicia o temporizador
    }

    displayNextQuestion();
}

// Função para exibir a próxima pergunta
function displayNextQuestion() {
    resetState();

    if (filteredQuestions.length === currentQuestionIndex) {
        return finishGame();
    }

    const questionData = filteredQuestions[currentQuestionIndex];

    // Exibe a pergunta
    if (!questionData || !questionData.text) {
        alert("Erro ao carregar a pergunta. Por favor, reinicie o jogo.");
        return;
    }

    $questionText.textContent = questionData.text;

    // Exibe as respostas
    questionData.answers.forEach(answer => {
        const button = document.createElement("button");
        button.classList.add("btn", "btn-light", "answer", "my-2");
        button.textContent = answer.text;
        button.dataset.correct = answer.correct;
        button.addEventListener("click", selectAnswer);
        $answersContainer.appendChild(button);
    });

    // Torna o botão de ajuda visível para a próxima pergunta
    document.querySelector('.help-button').classList.remove('hide'); // Mostra o botão de ajuda

    // Ativa o modo de tempo se estiver selecionado
    const isTimeModeActive = document.querySelector('.special-mode[data-mode="tempo"]').classList.contains('active');
    if (isTimeModeActive) {
        activateTimeMode();
    }
}

document.querySelector('.help-button').addEventListener("click", function() {
    if (helpCount < 2) {
        const currentQuestion = filteredQuestions[currentQuestionIndex];
        const incorrectAnswers = currentQuestion.answers.filter(answer => !answer.correct);
        
        // Elimina duas respostas incorretas
        for (let i = 0; i < 2 && incorrectAnswers.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * incorrectAnswers.length);
            const answerToRemove = incorrectAnswers[randomIndex];
            const buttonToRemove = Array.from($answersContainer.children).find(button => button.textContent === answerToRemove.text);
            if (buttonToRemove) {
                buttonToRemove.remove();
                incorrectAnswers.splice(randomIndex, 1); // Remove a resposta eliminada da lista
            }
        }

        helpCount++; // Incrementa o contador de ajuda
        if (helpCount === 2) {
            this.classList.add('hide'); // Esconde o botão se o limite de ajuda for atingido
        }
    } else {
        alert("Você já usou suas duas ajudas.");
    }
});

// Adicione um evento de clique para o botão "Modo Contra o Tempo"
document.querySelector('.special-mode[data-mode="tempo"]').addEventListener("click", function () {
    this.classList.toggle('active'); // Alterna a classe para indicar que o modo está ativo
    if (this.classList.contains('active')) {
        alert("Modo Relâmpago ativado! Você terá 10 segundos para responder cada pergunta.");
    } else {
        alert("Modo Relâmpago desativado.");
    }
});

// Função para selecionar a resposta
function selectAnswer(e) {
    const selectedAnswer = e.target;
    const correct = selectedAnswer.dataset.correct === "true";

    if (correct) {
        totalCorrect++;
    }

    Array.from($answersContainer.children).forEach(button => {
        button.classList.add(button.dataset.correct === "true" ? "correct" : "incorrect");
        button.disabled = true;
    });

    // Oculta o botão de ajuda após escolher uma resposta
    document.querySelector('.help-button').classList.add('hide');

    // Remover a chamada automática para a próxima pergunta
    $nextQuestionButton.classList.remove("hide");
    
    // Incrementar o currentQuestionIndex aqui
    currentQuestionIndex++;
    
    clearInterval(timer); // Para o temporizador
}
// Função para resetar o estado de cada pergunta
function resetState() {
    clearInterval(timer);
    $timerDisplay.textContent = "";
    while ($answersContainer.firstChild) {
        $answersContainer.removeChild($answersContainer.firstChild);
    }
    document.body.className = '';
    $nextQuestionButton.classList.add("hide");
}

function activateTimeMode() {
    let timeLeft = 10; // 10 segundos
    $timerDisplay.textContent = `Tempo Restante: ${timeLeft} segundos`;
    
    // Iniciar o temporizador
    timer = setInterval(() => {
        timeLeft--;
        $timerDisplay.textContent = `Tempo Restante: ${timeLeft} segundos`;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            disableAnswers(); // Desabilita as respostas
            showCorrectAnswer(); // Mostra a resposta correta
            document.querySelector('.help-button').classList.add('hide'); // Oculta o botão de ajuda
            // Remover a chamada automática para a próxima pergunta
            currentQuestionIndex++;
            // Não chamar displayNextQuestion() aqui
        }
    }, 1000);
}

// Função para desabilitar as respostas
function disableAnswers() {
    Array.from($answersContainer.children).forEach(button => {
        button.disabled = true;
    });
    $nextQuestionButton.classList.remove("hide");
}

// Função para mostrar a resposta correta
function showCorrectAnswer() {
    const correctButton = Array.from($answersContainer.children).find(button => button.dataset.correct === "true");
    if (correctButton) {
        correctButton.classList.add("correct");
    }
}

// Função para finalizar o jogo e mostrar pontuação e conquistas
function finishGame() {
    clearInterval(timer); // Certifique-se de parar o temporizador

    const score = totalCorrect;
    let achievement = "Novato";

    if (score >= 5) achievement = "Intermediário";
    if (score >= 10) achievement = "Expert";
    if (score >= 15) achievement = "Gênio da Meia Maratona";
    if (score >= 20) achievement = "Goat do Conhecimento";
    if (score >= 25) achievement = "Oráculo Supremo";
    
    updateLeaderboard();
// Oculta o botão de ajuda
document.querySelector('.help-button').classList.add('hide');
    $questionsContainer.innerHTML = `
        <p>Nome: ${playerName}</p>
        <p>Você acertou ${score} de ${filteredQuestions.length} questões!</p>
        <p>Conquista: ${achievement}</p>
        <button onclick="window.location.reload()" class="btn btn-primary btn-lg btn-block mt-3">Refazer teste</button>
    `;
}



// Função para atualizar o ranking
function updateLeaderboard() {
    const savedLeaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    
    // Verifica se o jogador já está no leaderboard
    const existingEntryIndex = savedLeaderboard.findIndex(entry => entry.player === playerName);
    
    if (existingEntryIndex !== -1) {
        // Atualiza a pontuação se o jogador já estiver no leaderboard
        savedLeaderboard[existingEntryIndex].score = totalCorrect;
    } else {
        const timestamp = new Date().toLocaleString('pt-BR', {
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false // Para usar o formato 24 horas
        });
        
        savedLeaderboard.push({ player: playerName, score: totalCorrect, time: timestamp });
    }
    
    savedLeaderboard.sort((a, b) => b.score - a.score);
    
    localStorage.setItem('leaderboard', JSON.stringify(savedLeaderboard));
}

// Função para mostrar o ranking em tempo real
function showLeaderboard() {
    const leaderboardDisplay = document.getElementById("leaderboard-display");
    leaderboardDisplay.innerHTML = ""; // Limpa o conteúdo anterior

    const savedLeaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    if (savedLeaderboard.length === 0) {
        leaderboardDisplay.innerHTML = "<p>Nenhum dado disponível.</p>"; // Mensagem se não houver dados
    }

    savedLeaderboard.forEach((entry, index) => {
        const playerEntry = document.createElement("p");
        playerEntry.textContent = `${index + 1}. ${entry.player} - ${entry.score} pontos - ${entry.time}`;
        leaderboardDisplay.appendChild(playerEntry);
    });
}
function showDashboard() {
    const leaderboardContainer = document.createElement("div");
    leaderboardContainer.className = "dashboard-container";
    leaderboardContainer.innerHTML = "<h3>Ranking dos Jogadores</h3>";

    // Recupera os dados do localStorage
    const savedLeaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    savedLeaderboard.forEach((entry, index) => {
        const playerEntry = document.createElement("p");
        playerEntry.textContent = `${index + 1}. ${entry.player} - ${entry.score} pontos - ${entry.time}`;
        leaderboardContainer.appendChild(playerEntry);
    });

    // Adiciona o container ao body
    document.body.appendChild(leaderboardContainer);
}

let helpCount = 0; // Contador para limitar o uso da ajuda a duas vezes

// Função para usar a ajuda (eliminar 2 respostas erradas)
function useHelp() {
    if (helpCount >= 2) {
        alert("Esta é a última tentativa de ajuda."); // Substituído aqui
        return;
    }

    const incorrectButtons = Array.from($answersContainer.children).filter(button => button.dataset.correct === "false");

    if (incorrectButtons.length < 2) {
        alert("Primeira tentativa de ajuda utilizada"); // Substituído aqui
        return;
    }

    // Elimina duas respostas incorretas
    for (let i = 0; i < 2; i++) {
        const buttonToRemove = incorrectButtons[i];
        buttonToRemove.style.display = 'none'; // Oculta a resposta incorreta
    }

    helpCount++; // Incrementa o contador de ajuda
    if (helpCount === 2) {
        // Se o usuário usou todas as ajudas, desabilita o botão
        document.querySelector('.help-button').classList.add('hide');
    }
}

let totalTime = 60; // Tempo total em segundos para o Modo Contra-Tempo
let timeModeActive = false; // Variável para controlar se o modo de tempo está ativo

// Evento para o botão "Modo Contra-Tempo"
document.querySelector('.special-mode[data-mode="contra-tempo"]').addEventListener("click", function () {
    this.classList.toggle('active'); // Alterna a classe para indicar que o modo está ativo
    if (this.classList.contains('active')) {
        alert("Modo Contra-Tempo ativado! Você terá 1 minuto para responder todas as perguntas.");
        timeModeActive = true; // Ativa o modo de tempo
        startTimer(totalTime); // Inicia o temporizador
    } else {
        alert("Modo Contra-Tempo desativado.");
        timeModeActive = false; // Desativa o modo de tempo
        clearInterval(timer); // Para o temporizador se estiver ativo
    }
});
// Função para iniciar o temporizador
function startTimer(duration) {
    let timeLeft = duration;
    $timerDisplay.textContent = `Tempo Restante: ${timeLeft} segundos`;

    timer = setInterval(() => {
        timeLeft--;
        $timerDisplay.textContent = `Tempo Restante: ${timeLeft} segundos`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            finishGame(); // Finaliza o jogo quando o tempo acaba
        }
    }, 1000);
}
document.addEventListener("DOMContentLoaded", function () {
    const timestamp = new Date().toLocaleString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const dashboardButton = document.getElementById("dashboard-button");
    const mainPage = document.getElementById("main-page");
    const dashboardContainer = document.getElementById("dashboard-container");
    const backToMainDashboard = document.getElementById("back-to-main-dashboard");

    console.log("Timestamp de teste:", timestamp);
    
    dashboardButton.addEventListener("click", function () {
        mainPage.classList.add("d-none");
        dashboardContainer.classList.remove("d-none");
        showLeaderboard(); // Chama a função para mostrar o leaderboard
    });

    backToMainDashboard.addEventListener("click", function () {
    dashboardContainer.classList.add("d-none"); // Esconde a página do dashboard
    mainPage.classList.remove("d-none"); // Exibe a página principal
});
function updateTime() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false // Para usar o formato 24 horas
    };
    const formattedTime = now.toLocaleString('pt-BR', options);
    document.getElementById("current-time").textContent = `Data e Hora: ${formattedTime}`;
}

// Atualiza a hora imediatamente ao carregar a página
updateTime();
// Atualiza a hora a cada segundo
setInterval(updateTime, 1000);
});

function showAdminLeaderboard() {
    const adminLeaderboardDisplay = document.getElementById("admin-leaderboard-display");
    adminLeaderboardDisplay.innerHTML = ""; // Limpa o conteúdo anterior

    const savedLeaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    if (savedLeaderboard.length === 0) {
      adminLeaderboardDisplay.innerHTML = "<p>Nenhum dado disponível.</p>"; // Mensagem se não houver dados
    } else {
 savedLeaderboard.forEach((entry, index) => {
        const playerEntry = document.createElement("div");
        playerEntry.className = "player-entry mb-2 d-flex align-items-center justify-content-between";
        playerEntry.innerHTML = `
          <span>${index + 1}. ${entry.player} - ${entry.score} pontos</span>`;

        adminLeaderboardDisplay.appendChild(playerEntry);
      });
    }
  }

  


// Adicione o evento de clique no botão de ajuda
document.querySelector('.help-button').addEventListener("click", useHelp);
// Chame a função loadQuestionsFromLocalStorage quando o programa iniciar
loadQuestionsFromLocalStorage();

