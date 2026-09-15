const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const state = JSON.parse(fs.readFileSync(path.join(root, 'state.json'), 'utf8'));
const stages = new Set(state.stages.map(s => s.id));
const tasks = new Set(state.tasks.map(t => t.id));
if (stages.size !== state.stages.length || tasks.size !== state.tasks.length) throw new Error('Duplicate IDs');
if (!stages.has(state.defaultStage)) throw new Error('Missing initial stage');
for (const t of state.tasks) {
  if (!stages.has(t.stage) || t.dependsOn.some(id => !tasks.has(id))) throw new Error('Invalid task references: ' + t.id);
  if (t.status === 'accepted' && (!t.acceptance || !t.evidence || !t.source)) throw new Error('Accepted task lacks evidence: ' + t.id);
}
const labels = {accepted:'Принято',planned:'В очереди',paused:'На паузе',review:'На проверке',active:'В работе',blocked:'Заблокировано'};
if (state.tasks.some(t => !labels[t.status])) throw new Error('Unknown status');
const line = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
const out = [
  '# Обзор проекта «' + state.project + '»', '',
  'Состояние на ' + state.updatedAt + '. Генерируется из `state.json`; статусы изменяются в источнике после подтверждённых результатов.', '',
  '**Цель:** ' + state.goal + '.', '',
  '**Текущий фокус:** ' + state.currentFocus + '. **Готовность к продаже:** ' + state.releaseReadiness.toLowerCase() + '.', '',
  state.planStatus + '.', '',
  '## Этапы и критерии перехода', '',
  '| Этап | Состояние | Результат и условие перехода |', '|---|---|---|',
  ...state.stages.map(s => '| ' + s.number + '. ' + line(s.title) + ' | ' + line(s.status) + ' | ' + line(s.outcome) + '. ' + line(s.gate) + ' |'), '',
  '## Задачи', '',
  '| Задача | Состояние | Ответственный | Доказательство |', '|---|---|---|---|',
  ...state.tasks.map(t => '| ' + line(t.title) + ' | ' + labels[t.status] + ' | ' + line(t.owner) + ' | ' + line(t.evidence) + ' |'), '',
  '## Решения', '', ...state.decisions.map(d => '- **' + d.title + ':** ' + d.value + '.'), '',
  '## Контроль курса', '', ...state.control.map(c => '- ' + c + '.'), '',
  '## Обновление', '',
  'Архитектор обновляет `state.json` после принятого результата или изменения решения; разработчик предоставляет доказательства выполнения. Состояние «принято» требует выполненных критериев и проверяемого основания. Паузы и непроверенные области сохраняются явно. Общий процент готовности продукта не вычисляется без определённого объёма выпуска.', '',
  'После изменения источника `node project-control/render.cjs` обновляет этот обзор. Для обновления интерактивного снимка вторым аргументом передаётся путь к HTML-фрагменту. Просмотр панели не запускает задачи и не меняет их статусы.', '',
  'Общие правила находятся в ../AGENTS.md; порядок разработки и контекст — в ../DEVELOPMENT.md. Этот обзор показывает состояние проекта и не создаёт отдельные правила для диалога.', ''
];
fs.writeFileSync(path.join(root, 'overview.md'), out.join('\n'), 'utf8');
if (process.argv[2]) {
  const destination = path.resolve(process.argv[2]);
  const template = fs.readFileSync(path.join(root, 'dashboard.fragment.html'), 'utf8');
  if (!template.includes('__PROJECT_STATE_JSON__')) throw new Error('Missing data placeholder');
  const html = template.replace('__PROJECT_STATE_JSON__', JSON.stringify(state).replaceAll('<', '\\u003c'));
  fs.mkdirSync(path.dirname(destination), {recursive:true});
  fs.writeFileSync(destination, html, 'utf8');
}
console.log('Validated: ' + state.stages.length + ' stages, ' + state.tasks.length + ' tasks. Overview generated.');
