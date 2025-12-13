const { spawn } = require('child_process');
const fetch = global.fetch || require('node-fetch');

function waitForServer(child, timeout = 10000) {
  return new Promise((resolve, reject) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        reject(new Error('Timeout waiting for server to start'));
      }
    }, timeout);

    child.stdout.on('data', (data) => {
      const s = data.toString();
      process.stdout.write(s);
      if (s.includes('Servidor backend a correr') || s.includes('Server running') || s.includes('🚀 Servidor backend a correr')) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve();
        }
      }
    });

    child.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });

    child.on('exit', (code) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        reject(new Error('Server process exited early with code ' + code));
      }
    });
  });
}

async function test() {
  // Start server process
  const child = spawn('node', ['index.js'], { cwd: __dirname + '/../', env: process.env });

  try {
    await waitForServer(child, 15000);
  } catch (err) {
    console.error('Server start failed:', err.message);
    child.kill();
    process.exit(1);
  }

  const base = 'http://localhost:3001';
  const endpoints = [
    '/',
    '/api-docs.json',
    '/consulta',
    '/medico',
    '/paciente',
    '/statusconsulta',
    '/notificacao',
    '/horariomedico',
    '/historicomedico',
    '/tipo_notificacao',
    '/tipoparentesco',
    '/tipotratamento',
    '/tipouser',
    '/tratamentorealizado',
    '/utilizadores',
    '/med_spec'
  ];
  for (const ep of endpoints) {
    try {
      const res = await fetch(base + ep, { method: 'GET' });
      const text = await res.text();
      console.log(`\n[${ep}] status=${res.status} len=${text.length}`);
      console.log(text.slice(0, 1000));
    } catch (err) {
      console.error(`\n[${ep}] error:`, err.message);
    }
  }

  child.kill();
  process.exit(0);
}

test();
