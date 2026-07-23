# Presentation House Style — the canonical look for `/jupiter:present`

The single visual identity for every emitted presentation. Loaded by `agents/render.md`. One house style across all audiences — differentiate decks by **content and structure**, never by palette or type.

## Hard rules

- **Light only.** No dark theme, no dark backgrounds. Dark *ink text* on light is fine; dark *fills* are not.
- **Self-contained.** Inline all CSS and JS; embed any asset as a data URI. No external requests, no web-font CDN (it is blocked and fails silently).
- **System fonts only, used with restraint.** No web fonts are available. Do NOT push system sans into oversized, tight-tracked display headlines — it looks "weird." Composed headline sizes, near-normal letter-spacing, weight 600. Let layout and whitespace carry the modern feel.
- **Semantic state colours are constant** across all decks (a viewer learns them once): **sage = settled**, **ochre = open**. The accent and neutrals express the house, not the state.
- **No internal language.** No Jupiter terms, phase names, artifact names, or keys on the face (see `agents/render.md` rule 5).
- **Motion is gated** behind `prefers-reduced-motion` AND a `.js` class, so nothing is ever stuck hidden.

---

## Design tokens + base (lift this `<style>` block, adapt components to the brief)

```html
<style>
  :root{
    --bg:#F7F8F7; --surface:#FFFFFF; --surface-2:#F1F3F1;
    --ink:#1C1E1F; --ink-2:#585C5C; --ink-3:#898D8C;
    --line:#E6E8E5; --line-2:#D7DAD6;
    --accent:#0E6E5E; --accent-tint:#E4F1ED; --accent-line:#B2D7CD;
    --settled:#3F7A5B; --settled-tint:#EAF1EC; --settled-line:#B7D3C0;   /* SETTLED */
    --open:#B0741B;  --open-strong:#8F5D13; --open-tint:#F7EFDC; --open-line:#E6C88C; /* OPEN */
    --shadow-sm:0 1px 2px rgba(20,24,22,.05);
    --shadow:0 1px 2px rgba(20,24,22,.04), 0 10px 22px -12px rgba(20,24,22,.14);
    --r:12px;
    --font:system-ui,"Segoe UI",Roboto,-apple-system,"Helvetica Neue",Arial,sans-serif;
    --font-mono:Consolas,"Cascadia Mono","SF Mono",Menlo,ui-monospace,monospace;
    --fs-hero:clamp(1.8rem,1.35rem+1.5vw,2.55rem);
    --fs-h2:clamp(1.28rem,1.08rem+.8vw,1.62rem);
    --maxw:940px;
  }
  *{box-sizing:border-box}
  body{margin:0; background:var(--bg); color:var(--ink); font-family:var(--font);
       font-size:1.05rem; line-height:1.6; -webkit-font-smoothing:antialiased;}
  .wrap{max-width:var(--maxw); margin:0 auto;
        padding:clamp(1.6rem,4vw,3.4rem) clamp(1.2rem,4vw,2rem) 4rem;
        display:flex; flex-direction:column; gap:clamp(2.4rem,5vw,3.6rem)}
  h1,h2,h3{margin:0; font-weight:600; text-wrap:balance}
  h1{font-size:var(--fs-hero); line-height:1.16; letter-spacing:-.018em; max-width:27ch}
  h2{font-size:var(--fs-h2); line-height:1.2; letter-spacing:-.014em; max-width:27ch}
  .eyebrow{font-family:var(--font-mono); font-size:.72rem; letter-spacing:.12em;
           text-transform:uppercase; color:var(--accent)}
  .card{background:var(--surface); border:1px solid var(--line); border-radius:var(--r); padding:1.3rem 1.4rem}

  /* state chips — the shared truth-language */
  .chip{display:inline-flex; align-items:center; gap:.42rem; white-space:nowrap;
        font-family:var(--font-mono); font-size:.67rem; letter-spacing:.04em;
        text-transform:uppercase; padding:.28rem .58rem; border-radius:999px}
  .chip::before{content:""; width:.54rem; height:.54rem; flex:0 0 auto}
  .chip-settled{color:var(--settled); background:var(--settled-tint)}
  .chip-settled::before{background:var(--settled); border-radius:50%}
  .chip-open{color:var(--open-strong); background:var(--open-tint)}
  .chip-open::before{border:1.5px solid var(--open); transform:rotate(45deg)}
</style>
```

**Type:** one system sans for everything; monospace reserved for small eyebrow labels and data. Headlines composed (not giant), `font-weight:600`, letter-spacing about `-.018em`. Body ~1.05rem, line-height 1.6. Numbers that line up get `font-variant-numeric:tabular-nums`.

**Neutrals & accent:** warm-neutral off-white ground, near-black ink, ONE accent (teal `#0E6E5E`) used sparingly (eyebrows, the recommendation, links). The only other hues are the state colours.

**Layout:** single column, `max-width` ~940px, generous but not cavernous spacing via `gap`. Soft light cards (subtle shadow, ~12px radius) — not hard hairline boxes and not accent-rail cards. Wide content (tables, diagrams) scrolls inside its own `overflow-x:auto` wrapper; the body never scrolls sideways. One bold element per deck (e.g. an amber "open bet" panel); everything else quiet.

---

## Motion (add to the `<style>`, plus the markup + script below)

```css
  .progress{position:fixed; top:0; left:0; height:3px; width:0%; background:var(--accent); z-index:60}
  .js .rg > *{opacity:0; transform:translateY(13px)}
  .js .rg.in > *{opacity:1; transform:none;
    transition:opacity .58s cubic-bezier(.22,.61,.24,1), transform .58s cubic-bezier(.22,.61,.24,1)}
  .js .rg.in > *:nth-child(1){transition-delay:.04s}
  .js .rg.in > *:nth-child(2){transition-delay:.10s}
  .js .rg.in > *:nth-child(3){transition-delay:.16s}
  .js .rg.in > *:nth-child(4){transition-delay:.22s}
  .js .rg.in > *:nth-child(5){transition-delay:.28s}
  .js .rg.in > *:nth-child(6){transition-delay:.34s}
  .js .rg.in > *:nth-child(7){transition-delay:.40s}
  .js .rg.in > *:nth-child(8){transition-delay:.46s}
  /* hover-lift only on nested cards (not direct .rg children — avoids transform clash) */
  .cardhover{transition:transform .2s ease, box-shadow .2s ease, border-color .2s ease}
  .cardhover:hover{transform:translateY(-2px); box-shadow:var(--shadow); border-color:var(--line-2)}
  @media (prefers-reduced-motion:reduce){
    .js .rg > *{opacity:1!important; transform:none!important; transition:none!important}
    .cardhover{transition:none} .cardhover:hover{transform:none; box-shadow:var(--shadow-sm)}
    .progress{display:none}
  }
```

- Put `<script>document.documentElement.classList.add('js')</script>` immediately after the `<style>`, and `<div class="progress" id="prog"></div>` as the first element in `<body>`.
- Add class `rg` to the masthead and each top-level `<section>` — its **direct children** stagger in (orchestrated load for the masthead, scroll-reveal for sections).
- Add class `cardhover` to nested list/exhibit cards for the hover-lift. Do NOT put `cardhover` on a direct child of `.rg` (the reveal transform and hover transform would clash) — hover-lift only elements nested one level deeper.

```html
<script>
(function(){
  var reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var els = document.querySelectorAll('.rg');
  if(!reduced && 'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('in'); io.unobserve(e.target);}});},
      {threshold:.1, rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el){io.observe(el);});
  } else { els.forEach(function(el){el.classList.add('in');}); }
  var prog=document.getElementById('prog');
  if(prog){ if(reduced){prog.style.display='none';} else {
    var tick=function(){var d=document.documentElement,max=d.scrollHeight-window.innerHeight,
      p=max>0?(window.scrollY/max):0; prog.style.width=(Math.max(0,Math.min(1,p))*100).toFixed(2)+'%';};
    window.addEventListener('scroll',tick,{passive:true});
    window.addEventListener('resize',tick,{passive:true}); tick();
  }}
})();
</script>
```

Keep motion restrained — enough to feel like a modern page, short of the over-animated look that reads as templated.

---

## Diagrams (Mermaid, state-coloured, stripped to essence)

Use for relational / structural information (a link-map of how things connect, a flow, a state view). Wrap in `<div style="overflow-x:auto">`, colour nodes by state so an open element can never look settled:

```html
<pre class="mermaid">
flowchart LR
  A["Thing"] --> B["Other thing"]
  A:::settled
  B:::open
  classDef settled fill:#EAF1EC,stroke:#3F7A5B,color:#1C1E1F,stroke-width:1.5px;
  classDef open    fill:#F7EFDC,stroke:#B0741B,color:#1C1E1F,stroke-width:1.5px;
  classDef neutral fill:#F1F3F1,stroke:#C9CCC9,color:#585C5C,stroke-width:1px;
</pre>
```

No gridlines, no decoration competing with the content. A diagram must look designed, not default — but only appears when structure genuinely beats prose.

---

## Footer

Close with a plain one-line footer. If the presentation uses synthetic / illustrative data, say so honestly (e.g. `Illustrative sample · not a real organisation · {date}`) — never present fabricated figures as a real organisation's record.
