// script.js
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const config = {
    regras: {
      uniforme: 'Camiseta azul, calça jeans.',
      celular: 'Permitido só no intervalo.',
      biblioteca: 'Silêncio obrigatório.'
    },
    datas: {
      feira: '10/09/2025',
      provas: '20/09/2025',
      reuniao: '05/09/2025'
    }
  };

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const outputBox = $('#output');

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function setOutput(text) {
    if (!outputBox) return;
    outputBox.style.opacity = 0.6;
    setTimeout(() => {
      outputBox.innerHTML = `<pre style="white-space:pre-wrap;font-size:15px;line-height:1.4">${escapeHtml(text)}</pre>`;
      outputBox.style.opacity = 1;
    }, 90);
  }

  // normaliza string (remove acentos) pra matching mais robusto
  function norm(s = '') {
    return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  const respostas = [
    { keys: ['pomodoro', 'pomodor'], text: '⏳ Técnica Pomodoro: estude 25 min focado, faça 5 min de pausa. A cada 4 ciclos, descanse 15–30 min.' },
    { keys: ['mapa mental', 'mapa'], text: '🧩 Mapa mental: organize as ideias em diagramas com cores e setas.' },
    { keys: ['resumo', 'resumos'], text: '📑 Faça resumos com suas palavras e perguntas-chave.' },
    { keys: ['flashcard', 'flashcards'], text: '🃏 Flashcards: cartões com pergunta de um lado e resposta do outro.' },
    { keys: ['revisao espacada', 'revisao', 'revisao espacada'], text: '📆 Revisão espaçada: hoje, 1 dia, 1 semana, 1 mês.' },
    { keys: ['feynman', 'tecnica feynman'], text: '🎤 Técnica Feynman: explique o conteúdo como se fosse pra uma criança.' },
    { keys: ['uniforme', 'regra de uniforme'], text: '👕 Regra de uniforme: ' + config.regras.uniforme },
    { keys: ['celular', 'uso de celular', 'cel'], text: '📱 Regra de celular: ' + config.regras.celular },
    { keys: ['biblioteca', 'silencio'], text: '📚 Regra da biblioteca: ' + config.regras.biblioteca },
    { keys: ['feira', 'feira de ciencias', 'feira de ciencias'], text: '📅 Feira de Ciências: ' + config.datas.feira },
    { keys: ['prova', 'provas', 'teste', 'testes'], text: '📝 Próximas provas: ' + config.datas.provas },
    { keys: ['reuniao', 'reuniao de pais', 'pais'], text: '📅 Reunião de pais: ' + config.datas.reuniao }
  ];

  function chatAnswer(q) {
    if (!q || !q.trim()) return '🤔 Pergunta vazia. Escreve algo, porra.';
    const qn = norm(q);
    for (const item of respostas) {
      for (const k of item.keys) {
        if (qn.includes(norm(k))) return item.text;
      }
    }
    if (qn.includes('como') && qn.includes('estudar')) {
      return '🔎 Dica rápida: quebre o conteúdo em partes, faça foco 25 min (pomodoro), revise com flashcards e resolva exercícios.';
    }
    return "🤔 Não entendi. Pergunta tipo: 'Pomodoro', 'Como estudar funções?', 'Quando é a feira?'";
  }

  function gerarPlano(diffs, horas, prazo) {
    const materias = String(diffs || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!materias.length) return '⚠️ Nenhuma dificuldade informada.';
    const lines = [`📘 Plano de Estudos (${horas}h/dia por ${prazo} dias)`, ''];
    const total = materias.length;
    for (let i = 1; i <= prazo; i++) {
      const mat = materias[(i - 1) % total];
      const teoria = Math.max(1, Math.round(horas * 0.7));
      const revisao = Math.max(0, horas - teoria);
      lines.push(`Dia ${i}: ${mat} — Teoria/Exercícios ${teoria}h${revisao ? ' + Revisão ' + revisao + 'h' : ''}`);
    }
    return lines.join('\n');
  }

  // UI bindings
  const modeEl = $('#mode');
  const planBox = $('#planBox');
  const questionEl = $('#question');
  const runBtn = $('#runBtn');
  const resetBtn = $('#resetBtn');

  if (modeEl) {
    modeEl.addEventListener('change', (e) => {
      const m = e.target.value;
      if (planBox) {
        if (m === 'plan') { planBox.style.display = 'block'; planBox.setAttribute('aria-hidden', 'false'); }
        else { planBox.style.display = 'none'; planBox.setAttribute('aria-hidden', 'true'); }
      }
    });
  }

  // chips/examples (seguro se não existir)
  $$('.chip').forEach(ch => {
    ch.addEventListener('click', () => {
      const val = ch.dataset && ch.dataset.val ? ch.dataset.val : ch.textContent;
      if (questionEl) questionEl.value = val;
      if (modeEl) { modeEl.value = 'chat'; modeEl.dispatchEvent(new Event('change')); }
    });
  });

  if (runBtn) {
    runBtn.addEventListener('click', () => {
      const mode = (modeEl && modeEl.value) || 'chat';
      if (mode === 'chat') {
        const q = questionEl ? questionEl.value.trim() : '';
        setOutput(chatAnswer(q));
      } else if (mode === 'plan') {
        const diffs = $('#difficulties') ? $('#difficulties').value : '';
        const h = Number($('#hours') ? $('#hours').value : 2) || 2;
        const d = Number($('#deadline') ? $('#deadline').value : 7) || 7;
        setOutput(gerarPlano(diffs, h, d));
      } else if (mode === 'rules') {
        const r = config.regras;
        setOutput(`📏 Regras da escola:\n- Uniforme: ${r.uniforme}\n- Celular: ${r.celular}\n- Biblioteca: ${r.biblioteca}`);
      } else if (mode === 'dates') {
        const dt = config.datas;
        setOutput(`📅 Datas importantes:\n- Feira: ${dt.feira}\n- Provas: ${dt.provas}\n- Reunião: ${dt.reuniao}`);
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (questionEl) questionEl.value = '';
      if ($('#difficulties')) $('#difficulties').value = '';
      if ($('#hours')) $('#hours').value = 2;
      if ($('#deadline')) $('#deadline').value = 7;
      setOutput('Limpo. 🚿');
    });
  }

  // mensagem inicial
  setOutput('Escolha um modo e clique em Rodar. 😉');
});
                                                                                                                                                                                                                                                                      
