import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, ChevronDown, Clock3, Monitor, RotateCcw, Smartphone, Sparkles } from 'lucide-react';
import './IrShowcasePage.css';
import { compileDocument } from '../ir-engine/compiler';
import { initialFixtureRevision, koraFixture, vektorFixture } from '../ir-engine/fixtures';
import {
  applyAssetSwap,
  applyFullRedesign,
  applyHeadlineEdit,
  applyHeroMoodShift,
  computeDrift,
  makeRevision,
  rollbackDocument,
} from '../ir-engine/revisions';
import type { IrDocument, IrRevision } from '../ir-engine/types';

type FixtureName = 'kora' | 'vektor';
type Viewport = 1440 | 375;

function cloneDocument(document: IrDocument): IrDocument {
  return JSON.parse(JSON.stringify(document)) as IrDocument;
}

export default function IrShowcasePage() {
  const [fixture, setFixture] = useState<FixtureName>('kora');
  const [revisions, setRevisions] = useState<IrRevision[]>(() => [initialFixtureRevision(cloneDocument(koraFixture))]);
  const [activeId, setActiveId] = useState(revisions[0].id);
  const [viewport, setViewport] = useState<Viewport>(1440);
  const [headline, setHeadline] = useState('Built Light');
  const [message, setMessage] = useState('Ready for the three-edit stability test.');
  const [showDrift, setShowDrift] = useState(true);
  const [audit, setAudit] = useState({ checked: false, horizontalOverflow: false, clippedHeading: false, brokenImages: 0 });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const active = revisions.find((revision) => revision.id === activeId) ?? revisions[revisions.length - 1];
  const document = active.document;
  const anchorRevision = revisions.find((revision) => revision.id === document.anchor.createdFromRevisionId) ?? revisions[0];
  const drift = useMemo(() => computeDrift(anchorRevision.document.anchor, document, anchorRevision.document.sections), [anchorRevision, document]);
  const preview = useMemo(() => compileDocument(document), [document]);
  const previous = active.parentId ? revisions.find((revision) => revision.id === active.parentId) ?? null : null;

  function commit(next: IrDocument, label: string, kind: IrRevision['kind'] = 'edit') {
    const revision = makeRevision(next, label, kind, active.id);
    setRevisions((current) => [...current, revision]);
    setActiveId(revision.id);
    setMessage(label + ' — saved as a new immutable revision.');
    setShowDrift(true);
  }

  function selectFixture(nextFixture: FixtureName) {
    const source = nextFixture === 'kora' ? koraFixture : vektorFixture;
    const revision = initialFixtureRevision(cloneDocument(source));
    setFixture(nextFixture);
    setRevisions([revision]);
    setActiveId(revision.id);
    setHeadline(nextFixture === 'kora' ? 'Built Light' : 'Sound, with intention.');
    setMessage(nextFixture === 'kora' ? 'Kora Spatial loaded. Photography intentionally omitted.' : 'Vektor Audio loaded with three approved Supabase assets.');
    setShowDrift(true);
  }

  function runHeadlineEdit() {
    const node = document.sections.find((section) => section.role === 'hero')?.nodes[0];
    if (!node) return;
    try {
      commit(applyHeadlineEdit(document, node.id, headline.trim() || 'Built Light'), 'Edit 1 · Hero headline');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Headline edit failed.');
    }
  }

  function runAssetSwap() {
    if (fixture !== 'vektor') {
      setMessage('Switch to Vektor Audio to test the approved product-image swap.');
      return;
    }
    const hero = document.sections.find((section) => section.role === 'hero')?.nodes[0];
    if (!hero) return;
    const nextAsset = hero.imageAssetId === 'jbl-charge-6' ? 'jbl-flip-7' : 'jbl-charge-6';
    try {
      commit(applyAssetSwap(document, hero.id, nextAsset, 'User requested a fitting approved product-image replacement.'), 'Edit 2 · Approved asset swap');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Asset swap failed.');
    }
  }

  function runMoodShift() {
    const hero = document.sections.find((section) => section.role === 'hero');
    if (!hero) return;
    const mood = (hero.moodOverride ?? document.anchor.mood) === 'warm-editorial' ? 'quiet-editorial' : 'warm-editorial';
    commit(applyHeroMoodShift(document, hero.id, mood, 'User explicitly requested a warmer hero direction.'), 'Edit 3 · Hero mood and token shift');
  }

  function runFullRedesign() {
    const next = applyFullRedesign(document, 'technical-dark');
    commit(next, 'Full redesign · New brand anchor', 'full-redesign');
  }

  function rollback() {
    if (!previous) return;
    const revision = makeRevision(rollbackDocument(previous), 'Rollback to ' + previous.label, 'rollback', active.id);
    setRevisions((current) => [...current, revision]);
    setActiveId(revision.id);
    setMessage('Rolled back to the previous saved design. Earlier revisions remain intact.');
    setShowDrift(true);
  }

  const driftCount = drift.tokenDeltas.length + drift.sectionFlips.length + drift.activeOverrides.length;
  const initialCollection = anchorRevision.document.sections.find((section) => section.role === 'collection');
  const currentCollection = document.sections.find((section) => section.role === 'collection');
  const collectionStable = JSON.stringify(initialCollection) === JSON.stringify(currentCollection);
  const stableNodeIds = anchorRevision.document.sections.every((section) => {
    const current = document.sections.find((item) => item.id === section.id);
    return Boolean(current) && section.nodes.map((node) => node.id).join('|') === current?.nodes.map((node) => node.id).join('|');
  });

  function auditPreview() {
    const previewDocument = iframeRef.current?.contentDocument;
    if (!previewDocument) return;
    const root = previewDocument.documentElement;
    const body = previewDocument.body;
    const heading = previewDocument.querySelector('h1');
    const horizontalOverflow = Math.max(root.scrollWidth, body.scrollWidth) > viewport;
    const clippedHeading = Boolean(heading && (heading.scrollWidth > heading.clientWidth + 1 || heading.scrollHeight > heading.clientHeight + 1));
    const brokenImages = Array.from(previewDocument.images).filter((image) => !image.complete || image.naturalWidth === 0).length;
    setAudit({ checked: true, horizontalOverflow, clippedHeading, brokenImages });
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(auditPreview);
    return () => window.cancelAnimationFrame(frame);
  }, [preview, viewport]);

  return (
    <main className="ir-shell">
      <header className="ir-topbar">
        <div className="ir-brand"><span className="ir-brand-mark">Z</span><div><strong>Zuno IR Lab</strong><small>Isolated design-system experiment</small></div></div>
        <a className="ir-exit" href="/"><ArrowLeft size={15} /> Back to Zuno</a>
      </header>

      <section className="ir-intro">
        <div>
          <p className="ir-kicker"><Sparkles size={13} /> DESIGN INTELLIGENCE / V1 PROOF</p>
          <h1>Beautiful by intent.<br /><em>Stable by design.</em></h1>
          <p className="ir-lede">A two-section website, three deliberate edits, and a revision history that protects everything you didn't ask to change.</p>
        </div>
        <div className="ir-lab-stamp"><span>EXPERIMENT 01</span><strong>2 <i>sections</i></strong><strong>3 <i>edits</i></strong><span>LIVE COMPILER</span></div>
      </section>

      <section className="ir-workbench">
        <div className="ir-toolbar">
          <div className="ir-project-select">
            <label htmlFor="ir-fixture">Benchmark</label>
            <div className="ir-select-wrap"><select id="ir-fixture" value={fixture} onChange={(event) => selectFixture(event.target.value as FixtureName)}><option value="kora">Kora Spatial · Architecture</option><option value="vektor">Vektor Audio · Electronics</option></select><ChevronDown size={14} /></div>
          </div>
          <div className="ir-viewport-toggle" aria-label="Preview viewport">
            <button className={viewport === 1440 ? 'active' : ''} onClick={() => setViewport(1440)}><Monitor size={15} /> Desktop</button>
            <button className={viewport === 375 ? 'active' : ''} onClick={() => setViewport(375)}><Smartphone size={15} /> Mobile</button>
          </div>
          <div className="ir-revision-count"><Clock3 size={14} /> {revisions.length} revisions</div>
        </div>

        <div className="ir-preview-meta"><span>LIVE PREVIEW / {viewport}px</span><span>{document.brandName.toUpperCase()} <i>·</i> {active.label.toUpperCase()}</span><span>{audit.checked ? (audit.horizontalOverflow || audit.clippedHeading || audit.brokenImages ? 'AUDIT / REVIEW' : 'AUDIT / PASS') : 'AUDIT / CHECKING'}</span></div>
        <div className="ir-preview-stage">
          <iframe ref={iframeRef} onLoad={auditPreview} title={document.brandName + ' generated website preview'} sandbox="allow-same-origin" srcDoc={preview} style={{ width: viewport + 'px', height: (viewport === 1440 ? 900 : 812) + 'px' }} />
        </div>

        <div className="ir-lower-grid">
          <section className="ir-panel ir-edits">
            <div className="ir-panel-heading"><div><span>01 / CONTROLLED EDITS</span><h2>Change one thing.</h2></div><span className="ir-live-dot">LIVE</span></div>
            <label htmlFor="ir-headline">Hero headline</label>
            <div className="ir-input-row"><input id="ir-headline" value={headline} onChange={(event) => setHeadline(event.target.value)} /><button onClick={runHeadlineEdit}>Apply edit</button></div>
            <div className="ir-action-list">
              <button onClick={runAssetSwap} className="ir-action"><span className="ir-step">02</span><span><strong>Swap approved image</strong><small>{fixture === 'vektor' ? 'JBL Charge 6 ↔ JBL Flip 7' : 'Available on Vektor Audio benchmark'}</small></span><ArrowUpRight size={16} /></button>
              <button onClick={runMoodShift} className="ir-action"><span className="ir-step">03</span><span><strong>Shift hero mood + tokens</strong><small>Scoped edit · warm editorial direction</small></span><ArrowUpRight size={16} /></button>
              <button onClick={runFullRedesign} className="ir-action"><span className="ir-step">04</span><span><strong>Explicit full redesign</strong><small>Create a new anchor and reset drift</small></span><ArrowUpRight size={16} /></button>
            </div>
            <div className="ir-feedback" role="status"><Check size={14} /> {message}</div>
          </section>

          <section className="ir-panel ir-integrity">
            <div className="ir-panel-heading"><div><span>02 / DESIGN INTEGRITY</span><h2>Drift diagnostics.</h2></div><span className="ir-advisory">ADVISORY</span></div>
            {showDrift && driftCount > 0 ? <div className="ir-drift-note"><span>{driftCount} recorded design delta{driftCount === 1 ? '' : 's'}</span><button onClick={() => setShowDrift(false)} aria-label="Dismiss drift notice">Dismiss</button></div> : <p className="ir-clean-state"><Check size={15} /> {driftCount === 0 ? 'Aligned with active brand anchor.' : 'Advisory dismissed. Changes remain recorded.'}</p>}
            <div className="ir-drift-list"><div><span>tokenDeltas</span><strong>{drift.tokenDeltas.length}</strong></div><div><span>sectionFlips</span><strong>{drift.sectionFlips.length}</strong></div><div><span>activeOverrides</span><strong>{drift.activeOverrides.length}</strong></div></div>
            {drift.activeOverrides.map((override) => <p className="ir-override-detail" key={override.id}><strong>{override.field}</strong> · {override.overrideReason} <small>Affects: {override.affectedIds.join(', ')}</small></p>)}
            <div className="ir-panel-foot"><span>Anchor: {document.anchor.id}</span><span>Identity: {document.anchor.mood}</span></div>
            <div className="ir-integrity-checks"><span><Check size={12} /> {stableNodeIds ? 'Node IDs stable' : 'Node IDs changed'}</span><span><Check size={12} /> {collectionStable ? 'Collection untouched' : 'Collection changed'}</span><span>{audit.checked && audit.horizontalOverflow ? 'Horizontal overflow detected' : 'No horizontal overflow detected'}</span><span>{audit.checked && audit.clippedHeading ? 'Heading clipping detected' : 'No heading clipping detected'}</span><span>{audit.checked ? audit.brokenImages + ' broken image(s)' : 'Image audit pending'}</span></div>
          </section>
        </div>

        <section className="ir-panel ir-history">
          <div className="ir-panel-heading"><div><span>03 / IMMUTABLE HISTORY</span><h2>Every step is reversible.</h2></div><button className="ir-rollback" disabled={!previous} onClick={rollback}><RotateCcw size={14} /> Roll back one step</button></div>
          <div className="ir-timeline">{revisions.slice().reverse().slice(0, 6).map((revision) => <button key={revision.id} className={revision.id === active.id ? 'ir-revision active' : 'ir-revision'} onClick={() => setActiveId(revision.id)}><span className="ir-revision-dot" /><span><strong>{revision.label}</strong><small>{revision.kind} · {new Date(revision.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></span>{revision.id === active.id ? <span className="ir-current">CURRENT</span> : null}</button>)}</div>
        </section>
      </section>
      <footer className="ir-footer"><span>IR ENGINE V1.0 / EXPERIMENTAL</span><span>Standalone HTML · CSS tokens · No production workspace changes</span></footer>
    </main>
  );
}
