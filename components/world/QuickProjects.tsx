"use client";

import { useEffect, useRef, useState } from "react";
import { projects, type Lang } from "@/lib/data";
import { stations } from "./game";
import { copy } from "./copy";
import Icon from "./Icons";
import s from "./world.module.css";

const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").toLocaleLowerCase();

export default function QuickProjects({ lang, onClose, onVisit }: { lang: Lang; onClose: () => void; onVisit?: (index: number) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(projects[0].name);
  const t = copy[lang];
  const found = projects.filter(p => normalize(`${p.name} ${p.description[lang]} ${p.tags.join(" ")}`).includes(normalize(query.trim())));
  const project = found.find(p => p.name === selected) ?? found[0];
  const stationIndex = project ? stations.findIndex(st => st.project?.name === project.name) : -1;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const element = dialog.current!;
    const previousFocus = document.activeElement as HTMLElement | null;
    if (!element.open) element.showModal();
    // The native "close" event is queued, not synchronous: in Strict Mode's dev-only
    // mount -> cleanup -> mount churn, a stale event from the first close() can land
    // on the second mount's listener after it has already reopened the dialog. Only
    // treat it as real if the dialog is actually closed at the moment it fires.
    const closed = () => { if (!element.open) onCloseRef.current(); };
    element.addEventListener("close", closed);
    return () => {
      element.removeEventListener("close", closed);
      if (element.open) element.close();
      previousFocus?.focus();
    };
  }, []);

  return <dialog ref={dialog} className={s.directory} aria-labelledby="project-directory-title">
    <header className={s.directoryHeader}>
      <div><h2 id="project-directory-title">{t.quickProjects}</h2><p>{t.directoryIntro}</p></div>
      <button className={s.icon} type="button" onClick={onClose} aria-label={t.close}><Icon name="close" /></button>
    </header>
    <div className={s.directoryBody}>
      <div className={s.projectIndex}>
        <label className={s.search}><Icon name="search" /><input autoFocus type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={t.searchProjects} aria-label={t.searchProjects} /></label>
        <p className={s.resultCount} role="status">{found.length} {t.projectCount}</p>
        <nav className={s.projectList} aria-label={t.projects}>
          {found.map((p, i) => <button type="button" key={p.name} aria-current={project?.name === p.name ? "true" : undefined} onClick={() => setSelected(p.name)}>
            <span className={s.projectListNumber}>{String(i + 1).padStart(2, "0")}</span>
            <span><strong>{p.name}</strong><small>{p.tags.slice(0, 2).join(" · ")}</small></span>
            <Icon name="arrow" />
          </button>)}
        </nav>
      </div>
      <section className={s.projectDetail} aria-label={project?.name ?? t.noResults}>
        {project ? <>
          <h3>{project.name}</h3>
          <p className={s.lead}>{project.description[lang]}</p>
          <ul className={s.tags}>{project.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
          {project.highlights && <section className={s.block}><h4 className={s.label}>{t.highlights}</h4><ul className={s.highlights}>{project.highlights.map(h => <li key={h.en}>{h[lang]}</li>)}</ul></section>}
          <div className={s.actions}>
            {project.demo && <a href={project.demo} target="_blank" rel="noopener noreferrer" className={s.plate}>{t.demo}<Icon name="arrow" /></a>}
            {project.repo && <a href={project.repo} target="_blank" rel="noopener noreferrer" className={s.plateSteel}>{t.code}<Icon name="arrow" /></a>}
            {onVisit && stationIndex >= 0 && <button type="button" className={s.visit} onClick={() => onVisit(stationIndex)}><Icon name="car" />{t.visitProject}</button>}
          </div>
        </> : <div className={s.empty}><Icon name="search" width="32" height="32" /><h3>{t.noResults}</h3><p>{t.trySearch}</p><button type="button" className={s.plateSteel} onClick={() => setQuery("")}>{t.clearSearch}</button></div>}
      </section>
    </div>
  </dialog>;
}
