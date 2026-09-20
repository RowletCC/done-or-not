import { cases } from './cases.js';
import { assess } from './assess.js';
const $ = id => document.getElementById(id);
let active = cases[0];
function select(item) {
  active = item;
  for (const button of $('choices').children) button.setAttribute('aria-pressed', String(button.dataset.id === item.id));
  $('receipt-code').textContent = String(item.trace.transport.status);
  $('receipt-label').textContent = item.trace.transport.status === 202 ? 'ACCEPTED' : 'OK';
  $('case-note').textContent = item.note;
  $('trace').textContent = JSON.stringify(item.trace, null, 2);
  $('result').hidden = true;
  $('reveal').innerHTML = 'Is this task done? <span>↗</span>';
}
for (const [index,item] of cases.entries()) {
  const button = document.createElement('button');
  button.className = 'choice'; button.dataset.id = item.id;
  const number = document.createElement('span');number.textContent=String(index+1).padStart(2,'0');
  button.append(number,document.createTextNode(item.title));
  button.addEventListener('click', () => select(item));
  $('choices').append(button);
}
$('reveal').addEventListener('click', () => {
  const result = assess(active.trace);
  $('result').dataset.status = result.status;
  $('verdict').textContent = {completed:'Completed',failed:'Failed',pending:'Still pending',unknown:'Not established'}[result.status];
  $('layers').replaceChildren();
  for (const layer of result.layers) {
    const li=document.createElement('li'), icon=document.createElement('span'),name=document.createElement('b'),detail=document.createElement('span');
    icon.textContent={passed:'✓',failed:'×',pending:'…',unknown:'?'}[layer.state];
    name.textContent=layer.name;detail.textContent=layer.detail;li.append(icon,name,detail);$('layers').append(li);
  }
  $('lesson').textContent = active.lesson;
  $('result').hidden = false;
  $('reveal').textContent = 'Verdict revealed ✓';
});
$('download').addEventListener('click', () => {
  const url=URL.createObjectURL(new Blob([JSON.stringify(active.trace,null,2)+'\n'],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=`${active.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
select(active);
