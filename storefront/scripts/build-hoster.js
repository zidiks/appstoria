/**
 * Сборка витрины для shared-хостинга с ispmanager (hoster.by):
 *   npm run build:hoster  →  hoster-build/ и hoster-build.zip
 *
 * На хостинге собирать нельзя (мало памяти), поэтому собираем здесь standalone-
 * сервер Next: в нём уже лежит только нужный рантайму кусок node_modules.
 * package.json внутри — без зависимостей: «Npm install» в панели ничего не качает.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const standalone = path.join(root, 'build', 'standalone');
const out = path.join(root, 'hoster-build');
const zip = path.join(root, 'hoster-build.zip');

const START_JS = `// Запуск на хостинге с ispmanager: pm2 вызывает \`npm start\`.
// ispmanager передаёт PORT и INSTANCE_HOST (способ подключения «Порт»),
// а standalone-сервер Next слушает PORT и HOSTNAME. HOSTNAME задаём явно:
// в Linux-окружении это имя машины, и Next повис бы не на том адресе.
if (process.env.SOCKET && !process.env.PORT) {
  console.error('Next.js не умеет слушать unix-сокет: в настройках сайта выберите способ подключения «Порт».');
  process.exit(1);
}
process.env.NODE_ENV = 'production';
process.env.HOSTNAME = process.env.INSTANCE_HOST || '127.0.0.1';
process.env.PORT = process.env.PORT || '3000';
require('./server.js');
`;

const PACKAGE_JSON = {
  name: 'appstoria-storefront',
  private: true,
  scripts: { start: 'node start.js' },
  engines: { node: '>=18.18' },
};

function copy(from, to) {
  fs.cpSync(from, to, { recursive: true, dereference: true });
}

console.log('> next build (standalone)');
execSync('npx next build', {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, HOSTER_BUILD: 'true' },
});

if (!fs.existsSync(path.join(standalone, 'server.js'))) {
  throw new Error('Нет build/standalone/server.js — сборка прошла не в standalone-режиме');
}

console.log('> сборка папки hoster-build');
fs.rmSync(out, { recursive: true, force: true });
copy(standalone, out);
// Статику standalone-сборка не копирует — её раздаёт тот же сервер
copy(path.join(root, 'build', 'static'), path.join(out, 'build', 'static'));
copy(path.join(root, 'public'), path.join(out, 'public'));
// sharp нужен только оптимизатору картинок, а он выключен; к тому же бинарники
// собраны под ОС сборки и на Linux-хостинге всё равно не заработали бы
for (const dir of ['sharp', '@img']) {
  fs.rmSync(path.join(out, 'node_modules', dir), { recursive: true, force: true });
}
fs.writeFileSync(path.join(out, 'start.js'), START_JS);
fs.writeFileSync(path.join(out, 'package.json'), JSON.stringify(PACKAGE_JSON, null, 2) + '\n');

console.log('> упаковка hoster-build.zip');
fs.rmSync(zip, { force: true });
try {
  // bsdtar (Windows 10+, macOS) умеет zip по расширению. На Windows берём системный:
  // GNU tar из Git Bash zip не умеет и путь «C:» принимает за адрес хоста
  const tar =
    process.platform === 'win32'
      ? `"${path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe')}"`
      : 'tar';
  execSync(`${tar} -a -c -f ../${path.basename(zip)} .`, { cwd: out, stdio: 'inherit' });
  console.log(`Готово: ${path.relative(root, zip)} (${(fs.statSync(zip).size / 1048576).toFixed(1)} МБ)`);
} catch {
  console.log(`zip не собрался — заливайте содержимое папки ${path.relative(root, out)}`);
}
