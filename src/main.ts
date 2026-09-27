// Workmate: a company AI extension that knows when a person is the better answer.
// Prototype for the "Technologies Reimagined" pitch video.
// Change names, roles and wording in CONFIG below (e.g. swap in team members).

type Status = "available" | "busy" | "away";

interface Person {
  id: string;
  name: string;
  role: string;
  status: Status;
  statusText: string;
  why: string;
  email: string;
  slots: string[];
}

const CONFIG = {
  appName: "Workmate",
  company: "Company",
  userName: "Yein",
  exampleQuestion: "How do I get approval for a client request?",
  people: [
    {
      id: "sarah",
      name: "Sarah Kim",
      role: "Project Manager",
      status: "available",
      statusText: "Available now",
      why: "Works with client approvals",
      email: "sarah.kim@company.com",
      slots: ["11:30 am", "2:00 pm", "4:15 pm"],
    },
    {
      id: "david",
      name: "David Smith",
      role: "Account Manager",
      status: "busy",
      statusText: "Busy until 3pm",
      why: "Handled 5 client requests this year",
      email: "david.smith@company.com",
      slots: ["3:15 pm", "4:30 pm"],
    },
    {
      id: "emma",
      name: "Emma Park",
      role: "Team Lead",
      status: "away",
      statusText: "In meetings today",
      why: "Approves client requests for your team",
      email: "emma.park@company.com",
      slots: ["Tomorrow 9:30 am", "Tomorrow 1:00 pm"],
    },
  ] as Person[],
};

type View =
  | "ask"
  | "thinking"
  | "route"
  | "people"
  | "email"
  | "teams"
  | "meet"
  | "done"
  | "answer";

type DoneKind = "outlook" | "teams" | "meet";

interface State {
  screen: View;
  question: string;
  selectedId: string;
  showMore: boolean;
  draft: string;
  slot: string | null;
  doneKind: DoneKind | null;
}

const state: State = {
  screen: "ask",
  question: "",
  selectedId: CONFIG.people[0].id,
  showMore: false,
  draft: "",
  slot: null,
  doneKind: null,
};

// ---------- helpers ----------

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );

const firstName = (p: Person): string => p.name.split(" ")[0];
const initials = (p: Person): string =>
  p.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
const selected = (): Person =>
  CONFIG.people.find((p) => p.id === state.selectedId) ?? CONFIG.people[0];

function draftFor(p: Person, kind: "email" | "teams"): string {
  const q = state.question.trim();
  const isExample = q.toLowerCase() === CONFIG.exampleQuestion.toLowerCase();
  const ask = isExample
    ? "I'm working on a client request and I'm not sure how the approval process works."
    : `I'm trying to work out: "${q}"`;
  if (kind === "teams") {
    return `Hi ${firstName(p)}! ${ask} Do you have 10 minutes today or tomorrow to walk me through it?`;
  }
  return `Hi ${firstName(p)},\n\n${ask} Would you have 10 minutes this week to walk me through it?\n\nThanks,\n${CONFIG.userName}`;
}

const icon = {
  send: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l15-7-5 15-2.5-6.5L4 12z" fill="currentColor"/></svg>`,
  back: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  external: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  check: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  people: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 19c.6-3.2 3-5 6-5s5.4 1.8 6 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="17" cy="9" r="2.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16.5 14.2c2.4.2 4 1.8 4.5 4.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  spark: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill="currentColor"/></svg>`,
};

// ---------- pieces ----------

const questionBubble = (): string =>
  `<div class="bubble" aria-label="Your question">${esc(state.question)}</div>`;

const backLink = (to: View, label: string): string =>
  `<button class="back" data-go="${to}">${icon.back}<span>${esc(label)}</span></button>`;

function personCard(p: Person): string {
  const isSel = p.id === state.selectedId;
  return `
  <div class="person ${isSel ? "is-selected" : ""}">
    <div class="person-top">
      <span class="avatar" aria-hidden="true">${esc(initials(p))}</span>
      <div class="person-id">
        <p class="person-name">${esc(p.name)}</p>
        <p class="person-role">${esc(p.role)}</p>
      </div>
      <span class="status status-${p.status}"><i aria-hidden="true"></i>${esc(p.statusText)}</span>
    </div>
    <p class="why"><strong>Why ${esc(firstName(p))}?</strong> ${esc(p.why)}</p>
    <button class="select ${isSel ? "on" : ""}" data-select="${p.id}" aria-pressed="${isSel}">
      ${isSel ? `${icon.check}<span>Selected</span>` : `<span>Select</span>`}
    </button>
  </div>`;
}

// ---------- screens ----------

function screenAsk(): string {
  return `
  <div class="screen ask">
    <div class="welcome">
      <p class="hello">Hi ${esc(CONFIG.userName)}, what are you working on?</p>
      <p class="sub">Ask anything about work. I'll help you find the best way to get it answered, whether that's me or a colleague.</p>
    </div>
    <div class="composer">
      <label class="sr" for="q">Your question</label>
      <textarea id="q" rows="2" placeholder="Ask a question">${esc(state.question)}</textarea>
      <button class="send" data-action="send" aria-label="Send">${icon.send}<span>Send</span></button>
    </div>
  </div>`;
}

function screenThinking(): string {
  return `
  <div class="screen">
    ${questionBubble()}
    <div class="thinking" role="status"><span></span><span></span><span></span><p>Checking who at your company knows about this</p></div>
  </div>`;
}

function screenRoute(): string {
  return `
  <div class="screen">
    ${questionBubble()}
    <div class="reply">
      <p class="reply-lead">This looks like a company-specific question.</p>
      <p class="reply-body">People here have handled this before, so someone at work may give you a better answer than I can.</p>

      <div class="route-rec">
        <p class="tag">Recommended</p>
        <div class="route-row">
          <span class="route-icon">${icon.people}</span>
          <p>Ask someone at work</p>
        </div>
        <button class="btn primary wide" data-go="people">Connect</button>
      </div>

      <div class="or"><span>or</span></div>
      <button class="btn quiet wide" data-go="answer">Get an AI answer instead</button>
    </div>
  </div>`;
}

function screenPeople(): string {
  const [rec, ...others] = CONFIG.people;
  const visibleOthers = state.showMore ? others : others.slice(0, 1);
  const p = selected();
  return `
  <div class="screen">
    ${backLink("route", "Back")}
    <h2 class="title">Here's who can help</h2>

    <p class="group">Recommended</p>
    ${personCard(rec)}

    <p class="group">Other options</p>
    ${visibleOthers.map(personCard).join("")}
    ${
      !state.showMore && others.length > 1
        ? `<button class="link" data-action="more">Show more people</button>`
        : ""
    }

    <div class="contact">
      <p class="contact-title">Contact ${esc(firstName(p))} via</p>
      <div class="contact-row">
        <button class="btn primary" data-go="teams">Message on Teams</button>
        <button class="btn primary" data-go="email">Email</button>
        <button class="btn primary" data-go="meet">Meet in person</button>
      </div>
    </div>

    <div class="or"><span>or</span></div>
    <button class="btn quiet wide" data-go="answer">Get an AI answer instead</button>
  </div>`;
}

function screenEmail(): string {
  const p = selected();
  return `
  <div class="screen">
    ${backLink("people", "Back to connection options")}
    <h2 class="title">Contact ${esc(firstName(p))} by email</h2>

    <div class="mini">
      <span class="avatar" aria-hidden="true">${esc(initials(p))}</span>
      <div>
        <p class="person-name">${esc(p.name)}</p>
        <p class="person-role">${esc(p.role)}</p>
      </div>
    </div>

    <div class="field">
      <p class="field-label">Email</p>
      <div class="email-line">
        <span>${esc(p.email)}</span>
        <button class="chip" data-action="copy">Copy</button>
      </div>
    </div>

    <div class="field">
      <label class="field-label" for="draft">Suggested message</label>
      <p class="ai-note">${icon.spark}Drafted by AI. You can edit it before sending.</p>
      <textarea id="draft" rows="9">${esc(state.draft)}</textarea>
    </div>

    <p class="hint">${esc(firstName(p))}'s email address and the suggested message will open in Outlook, ready to send.</p>
    <button class="btn primary wide" data-done="outlook">Open in Outlook ${icon.external}</button>
  </div>`;
}

function screenTeams(): string {
  const p = selected();
  return `
  <div class="screen">
    ${backLink("people", "Back to connection options")}
    <h2 class="title">Message ${esc(firstName(p))} on Teams</h2>

    <div class="mini">
      <span class="avatar" aria-hidden="true">${esc(initials(p))}</span>
      <div>
        <p class="person-name">${esc(p.name)}</p>
        <p class="person-role"><span class="status status-${p.status} inline"><i aria-hidden="true"></i>${esc(p.statusText)}</span></p>
      </div>
    </div>

    <div class="field">
      <label class="field-label" for="draft">Suggested message</label>
      <p class="ai-note">${icon.spark}Drafted by AI. You can edit it before sending.</p>
      <textarea id="draft" rows="5">${esc(state.draft)}</textarea>
    </div>

    <p class="hint">A chat with ${esc(firstName(p))} will open in Teams with this message, ready to send.</p>
    <button class="btn primary wide" data-done="teams">Open in Teams ${icon.external}</button>
  </div>`;
}

function screenMeet(): string {
  const p = selected();
  return `
  <div class="screen">
    ${backLink("people", "Back to connection options")}
    <h2 class="title">Meet ${esc(firstName(p))} in person</h2>
    <p class="reply-body">Free times from ${esc(firstName(p))}'s calendar. Each invite is 10 minutes, so it stays easy to say yes.</p>

    <div class="slots" role="radiogroup" aria-label="Pick a time">
      ${p.slots
        .map(
          (s) =>
            `<button class="slot ${state.slot === s ? "on" : ""}" role="radio" aria-checked="${state.slot === s}" data-slot="${esc(s)}">${esc(s)}</button>`
        )
        .join("")}
    </div>

    <button class="btn primary wide" data-done="meet" ${state.slot ? "" : "disabled"}>Send invite</button>
    <p class="hint">${state.slot ? "" : "Pick a time to send the invite."}</p>
  </div>`;
}

function screenDone(): string {
  const p = selected();
  const kind = state.doneKind;
  const head =
    kind === "outlook"
      ? "Draft opened in Outlook"
      : kind === "teams"
      ? "Chat opened in Teams"
      : `Invite sent to ${firstName(p)} for ${state.slot ?? ""}`;
  return `
  <div class="screen done">
    <span class="done-mark">${icon.check}</span>
    <h2 class="title">${esc(head)}</h2>
    <p class="reply-body">After you talk, you can save ${esc(firstName(p))}'s tip here. Next time someone asks the same thing, the AI answer will include it, so ${esc(firstName(p))} doesn't get the same question twice.</p>
    <button class="btn quiet wide" data-action="reset">Ask something else</button>
  </div>`;
}

function screenAnswer(): string {
  const p = CONFIG.people[0];
  return `
  <div class="screen">
    ${backLink("route", "Back")}
    ${questionBubble()}
    <div class="reply">
      <p class="source">${icon.spark}Based on your company's Client Approvals Policy</p>
      <ol class="steps">
        <li>Check the request value. Under $10,000, your team lead can approve it.</li>
        <li>Over $10,000, it needs sign-off from a Project Manager and Finance.</li>
        <li>Submit it in the Client Requests tracker with the scope and the client's email attached.</li>
        <li>Approvals usually take 2 working days.</li>
      </ol>
    </div>

    <div class="nudge">
      <p><strong>${esc(p.name)}</strong> has approved requests like this before. Want to check your case with ${esc(firstName(p))}?</p>
      <button class="btn primary" data-go="people">Connect with ${esc(firstName(p))}</button>
    </div>
    <button class="link" data-action="reset">Ask something else</button>
  </div>`;
}

const screens: Record<View, () => string> = {
  ask: screenAsk,
  thinking: screenThinking,
  route: screenRoute,
  people: screenPeople,
  email: screenEmail,
  teams: screenTeams,
  meet: screenMeet,
  done: screenDone,
  answer: screenAnswer,
};

// ---------- render + events ----------

const body = document.getElementById("panel-body") as HTMLElement;
const toastEl = document.getElementById("toast") as HTMLElement;

function render(focusSelector?: string): void {
  body.innerHTML = screens[state.screen]();
  body.scrollTop = 0;
  const target =
    (focusSelector && body.querySelector<HTMLElement>(focusSelector)) ||
    body.querySelector<HTMLElement>(".title, .hello, .reply-lead");
  if (target) {
    if (!target.hasAttribute("tabindex") && !/TEXTAREA|BUTTON|INPUT/.test(target.tagName)) {
      target.setAttribute("tabindex", "-1");
    }
    target.focus({ preventScroll: true });
  }
}

function toast(msg: string): void {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  window.setTimeout(() => toastEl.classList.remove("show"), 1800);
}

function go(to: View): void {
  if (to === "email" || to === "teams") state.draft = draftFor(selected(), to);
  if (to === "meet") state.slot = null;
  state.screen = to;
  render(to === "ask" ? "#q" : undefined);
}

function send(): void {
  const q = (document.getElementById("q") as HTMLTextAreaElement | null)?.value.trim() ?? "";
  if (!q) {
    toast("Type a question first");
    return;
  }
  state.question = q;
  state.screen = "thinking";
  render();
  window.setTimeout(() => {
    state.screen = "route";
    render();
  }, 1100);
}

function reset(): void {
  state.question = "";
  state.selectedId = CONFIG.people[0].id;
  state.showMore = false;
  state.slot = null;
  state.doneKind = null;
  go("ask");
}

body.addEventListener("click", (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>("button");
  if (!el || el.hasAttribute("disabled")) return;

  if (el.dataset.go) return go(el.dataset.go as View);

  if (el.dataset.select) {
    state.selectedId = el.dataset.select;
    return render(`[data-select="${el.dataset.select}"]`);
  }

  if (el.dataset.slot) {
    state.slot = el.dataset.slot;
    return render(`[data-slot="${CSS.escape(el.dataset.slot)}"]`);
  }

  if (el.dataset.done) {
    const draft = document.getElementById("draft") as HTMLTextAreaElement | null;
    if (draft) state.draft = draft.value;
    state.doneKind = el.dataset.done as DoneKind;
    const label =
      state.doneKind === "outlook" ? "Opening Outlook" : state.doneKind === "teams" ? "Opening Teams" : "Sending invite";
    toast(label);
    window.setTimeout(() => {
      state.screen = "done";
      render();
    }, 700);
    return;
  }

  switch (el.dataset.action) {
    case "send":
      return send();
    case "more":
      state.showMore = true;
      return render();
    case "copy":
      try {
        void navigator.clipboard?.writeText(selected().email);
      } catch {
        /* clipboard may be blocked; the toast still confirms for the demo */
      }
      return toast("Email copied");
    case "reset":
      return reset();
  }
});

body.addEventListener("keydown", (e) => {
  const t = e.target as HTMLElement;
  if (t.id === "q" && e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

body.addEventListener("input", (e) => {
  const t = e.target as HTMLTextAreaElement;
  if (t.id === "draft") state.draft = t.value;
  if (t.id === "q") state.question = t.value;
});

// Filming helper: press the backtick key (`) on the first screen to auto-type the example question.
document.addEventListener("keydown", (e) => {
  if (e.key !== "`" || state.screen !== "ask") return;
  const q = document.getElementById("q") as HTMLTextAreaElement | null;
  if (!q) return;
  e.preventDefault();
  q.value = "";
  q.focus();
  const text = CONFIG.exampleQuestion;
  let i = 0;
  const tick = (): void => {
    q.value = text.slice(0, ++i);
    state.question = q.value;
    if (i < text.length) window.setTimeout(tick, 45 + Math.random() * 60);
  };
  tick();
});

// Fill in names used outside the panel
document.querySelectorAll<HTMLElement>("[data-fill]").forEach((n) => {
  const key = n.dataset.fill as "appName" | "company" | "userName";
  n.textContent = CONFIG[key];
});

render();
