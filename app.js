const { metrics, videos, themes, personas, quotes, actions } = window.woopaCommentLab;

const state = {
  personaGroup: "all",
  videoId: "all",
  personaId: "all",
  query: ""
};

const heroMetrics = document.querySelector("#hero-metrics");
const videoGrid = document.querySelector("#video-grid");
const signalBars = document.querySelector("#signal-bars");
const personaGrid = document.querySelector("#persona-grid");
const videoTable = document.querySelector("#video-table");
const videoFilter = document.querySelector("#video-filter");
const personaSelect = document.querySelector("#persona-select");
const quoteSearch = document.querySelector("#quote-search");
const quoteCount = document.querySelector("#quote-count");
const quoteList = document.querySelector("#quote-list");
const actionGrid = document.querySelector("#action-grid");
const personaFilters = document.querySelectorAll(".persona-filter");

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#039;",
    '"': "&quot;"
  })[character]);
}

function renderHeroMetrics() {
  heroMetrics.innerHTML = metrics.map((metric) => `
    <div class="hero-metric">
      <strong>${metric.value}</strong>
      <span>${metric.label}</span>
    </div>
  `).join("");
}

function renderVideos() {
  videoGrid.innerHTML = videos.map((video, index) => `
    <article class="video-card">
      <div class="video-card__top">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <span>${video.format}</span>
      </div>
      <h3>${escapeHtml(video.shortTitle)}</h3>
      <p class="video-card__stat">공개 댓글 ${video.comments} · 표본 ${video.sample}</p>
      <p class="video-card__signal">${escapeHtml(video.signal)}</p>
      <a href="${video.url}" target="_blank" rel="noreferrer">원본 영상 열기</a>
    </article>
  `).join("");
}

function renderSignals() {
  const maximum = Math.max(...themes.map((theme) => theme.count));
  signalBars.innerHTML = themes.map((theme, index) => `
    <article class="signal-row ${theme.kind}" style="--signal-width: ${(theme.count / maximum) * 100}%">
      <span class="signal-rank">${String(index + 1).padStart(2, "0")}</span>
      <strong>${escapeHtml(theme.name)}</strong>
      <div class="signal-track" aria-hidden="true"><span></span></div>
      <span class="signal-video">${theme.videos}개 영상</span>
      <span class="signal-score">${theme.count}건<br /><small>${theme.ratio}%</small></span>
    </article>
  `).join("");
}

function renderPersonas() {
  const visible = personas.filter((persona) => state.personaGroup === "all" || persona.group === state.personaGroup);
  personaGrid.innerHTML = visible.map((persona) => `
    <article class="persona-card ${persona.group}">
      <header>
        <span>${persona.id}</span>
        <span class="persona-score">${persona.score}</span>
      </header>
      <h3>${escapeHtml(persona.name)}</h3>
      <p class="persona-meta">${persona.videos}개 영상에서 확인 · 표본 기반 가설</p>
      <dl>
        <div><dt>원하는 것</dt><dd>${escapeHtml(persona.need)}</dd></div>
        <div><dt>현재 관찰</dt><dd>${escapeHtml(persona.current)}</dd></div>
        <div><dt>다음 검증</dt><dd>${escapeHtml(persona.next)}</dd></div>
      </dl>
      <button type="button" class="persona-evidence" data-persona-id="${persona.id}" data-evidence-id="${persona.evidence}">근거 ${persona.evidence} 보기</button>
    </article>
  `).join("");
}

function renderVideoTable() {
  videoTable.innerHTML = videos.map((video) => `
    <tr>
      <td><a href="${video.url}" target="_blank" rel="noreferrer">${escapeHtml(video.shortTitle)}</a><small>${escapeHtml(video.format)} · 조회 ${video.views}</small></td>
      <td>${video.comments}</td>
      <td>${escapeHtml(video.sample)}</td>
      <td>${escapeHtml(video.signal)}</td>
      <td>${escapeHtml(video.implication)}</td>
    </tr>
  `).join("");
}

function fillQuoteFilters() {
  videoFilter.innerHTML = [
    '<option value="all">전체 영상</option>',
    ...videos.map((video) => `<option value="${video.id}">${escapeHtml(video.shortTitle)}</option>`)
  ].join("");
  personaSelect.innerHTML = [
    '<option value="all">전체 페르소나</option>',
    ...personas.map((persona) => `<option value="${persona.id}">${persona.id} · ${escapeHtml(persona.name)}</option>`)
  ].join("");
}

function visibleQuotes() {
  const query = state.query.trim().toLowerCase();
  return quotes.filter((quote) => {
    const byVideo = state.videoId === "all" || quote.videoId === state.videoId;
    const byPersona = state.personaId === "all" || quote.personas.includes(state.personaId);
    const searchValue = `${quote.id} ${quote.video} ${quote.theme} ${quote.text} ${quote.note}`.toLowerCase();
    const byQuery = !query || searchValue.includes(query);
    return byVideo && byPersona && byQuery;
  });
}

function renderQuotes() {
  const visible = visibleQuotes();
  quoteCount.textContent = `대표 인용 ${visible.length}건 표시 · 전체 원문 표본 220건은 출처 파일에서 확인 가능`;
  quoteList.innerHTML = visible.length ? visible.map((quote) => `
    <article class="quote-card" id="${quote.id}">
      <header>
        <span class="theme-chip">${escapeHtml(quote.theme)}</span>
        <span>좋아요 ${quote.likes}</span>
      </header>
      <blockquote>“${escapeHtml(quote.text)}”</blockquote>
      <div class="quote-detail">
        <p><strong>${quote.id}</strong><span>${escapeHtml(quote.video)}</span></p>
        <p>${escapeHtml(quote.note)}</p>
      </div>
      <footer>
        <span>${quote.personas.join(" · ")}</span>
        <a href="https://www.youtube.com/watch?v=${quote.videoId}" target="_blank" rel="noreferrer">원본 영상</a>
      </footer>
    </article>
  `).join("") : '<p class="empty-state">조건에 맞는 대표 인용이 없습니다. 다른 필터나 검색어를 선택해 보세요.</p>';
}

function renderActions() {
  actionGrid.innerHTML = actions.map((action) => `
    <article class="action-card">
      <span class="action-number">${action.number}</span>
      <p class="action-evidence">${escapeHtml(action.evidence)}</p>
      <h3>${escapeHtml(action.title)}</h3>
      <dl>
        <div><dt>관찰</dt><dd>${escapeHtml(action.observation)}</dd></div>
        <div><dt>다음 실험</dt><dd>${escapeHtml(action.test)}</dd></div>
      </dl>
    </article>
  `).join("");
}

function focusEvidence(personaId, evidenceId) {
  state.personaId = personaId;
  state.videoId = "all";
  state.query = evidenceId;
  personaSelect.value = personaId;
  videoFilter.value = "all";
  quoteSearch.value = evidenceId;
  renderQuotes();
  document.querySelector("#quotes").scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => document.querySelector(`#${evidenceId}`)?.focus({ preventScroll: true }), 350);
}

personaFilters.forEach((button) => {
  button.addEventListener("click", () => {
    state.personaGroup = button.dataset.personaFilter;
    personaFilters.forEach((filter) => filter.classList.toggle("is-active", filter === button));
    renderPersonas();
  });
});

personaGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-persona-id]");
  if (!button) return;
  focusEvidence(button.dataset.personaId, button.dataset.evidenceId);
});

videoFilter.addEventListener("change", (event) => {
  state.videoId = event.target.value;
  renderQuotes();
});

personaSelect.addEventListener("change", (event) => {
  state.personaId = event.target.value;
  renderQuotes();
});

quoteSearch.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderQuotes();
});

renderHeroMetrics();
renderVideos();
renderSignals();
renderPersonas();
renderVideoTable();
fillQuoteFilters();
renderQuotes();
renderActions();
