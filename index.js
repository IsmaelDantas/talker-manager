const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const crypto = require('crypto');
const { tokenValidation,
  nameAuth,
  ageAuth,
  talkAuth,
  watchedAtAuth,
  rateAuth,
} = require('./Middlewares/middlewares');
// const { stringify } = require('querystring');

const jsonArchive = 'talker.json';
const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

// requisito 1
app.get('/talker', (_req, res) => {
  const data = JSON.parse(fs.readFileSync('talker.json', 'utf8'));
  return res.status(HTTP_OK_STATUS).json(data);
});

// requisito 8
app.get('/talker/search',
  tokenValidation,
  (req, res) => {
    const data = JSON.parse(fs.readFileSync(jsonArchive, 'utf8'));
    const { q } = req.query;
    if (!q) return res.status(200).json(data);
    const filteredName = data.filter((d) => d.name.includes(q));
    if (filteredName.length === 0) {
      return res.status(200).json(filteredName);
    }
    return res.status(200).json(filteredName);
  });

// requisito 2
app.get('/talker/:id', (req, res) => {
  const { id } = req.params;
  const data = JSON.parse(fs.readFileSync('talker.json', 'utf8'));
  const talkerId = data.find((talk) => Number(talk.id) === Number(id));
  
  if (!talkerId) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });

  return res.status(HTTP_OK_STATUS).json(talkerId);
});

// requisito 3 e 4
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const emailValidator = /\S+@\S+\.\S+/; // retirado do link https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
  if (!email) return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  
  if (!emailValidator.test(email)) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
 
  if (!password) return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  if (password.length < 6) {
     return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }
  const token = crypto.randomBytes(8).toString('hex');
  return res.status(200).json({ token });
});

// requisito 5
app.post('/talker',
  tokenValidation,
  nameAuth,
  ageAuth,
  talkAuth,
  watchedAtAuth,
  rateAuth,
  (req, res) => {
    const data = JSON.parse(fs.readFileSync(jsonArchive, 'utf8'));
    const id = data.length + 1;
    const { name, age, talk } = req.body;
    const { watchedAt, rate } = talk;
    const speaker = { id, name, age, talk: { watchedAt, rate } };
    data.push(speaker);
    fs.writeFileSync(jsonArchive, JSON.stringify(data));
    return res.status(201).json(speaker);
  });

// requisito 6
app.put('/talker/:id',
  tokenValidation,
  nameAuth,
  ageAuth,
  talkAuth,
  watchedAtAuth,
  rateAuth,  
  (req, res) => {
    const data = JSON.parse(fs.readFileSync(jsonArchive, 'utf8'));
    const { id } = req.params;
    const { name, age, talk } = req.body;
    const { watchedAt, rate } = talk;
    const speaker = { id: Number(id), name, age, talk: { watchedAt, rate } };
    const filterId = data.filter((p) => Number(p.id) !== Number(id));
    filterId.push(speaker);
    console.log(speaker);
    fs.writeFileSync(jsonArchive, JSON.stringify(filterId));
    return res.status(200).json(speaker);
  });

// requisito 7
app.delete('/talker/:id',
  tokenValidation,
  (req, res) => {
    const data = JSON.parse(fs.readFileSync(jsonArchive, 'utf8'));
    const { id } = req.params;
    const index = data.findIndex((p) => p.id === Number(id)); // findIndex retirado do link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
    data.splice(index, 1);
    fs.writeFileSync(jsonArchive, JSON.stringify(data));
    return res.status(204).end();
  });

app.listen(PORT, () => {
  console.log('Online');
});