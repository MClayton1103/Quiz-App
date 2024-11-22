const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());

// Rota para obter todas as perguntas e respostas
app.get('/all-questions', (req, res) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'perguntas.json'), 'utf-8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error("Erro ao obter perguntas:", error);
        res.status(500).send("Erro ao obter perguntas.");
    }
});

// Rota para salvar perguntas
app.post('/save-questions', (req, res) => {
    const data = req.body;
    fs.writeFileSync(path.join(__dirname, 'perguntas.json'), JSON.stringify(data, null, 2));
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
