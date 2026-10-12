"use client";

import { certifications, education, profile, skillGroups, type Lang } from "@/lib/data";
import { driveTo, rest, stations, type Station } from "./game";
import { copy, stationTitle } from "./copy";
import s from "./world.module.css";

const two = (n: number) => String(n).padStart(2, "0");

function Links({ repo, demo, lang }: { repo?: string; demo?: string; lang: Lang }) {
  if (!repo && !demo) return null;
  const t = copy[lang];
  return (
    <p className={s.links}>
      {demo && (
        <a href={demo} target="_blank" rel="noopener noreferrer" className={s.demo}>
          {t.demo} ↗
        </a>
      )}
      {repo && (
        <a href={repo} target="_blank" rel="noopener noreferrer">
          {t.code} ↗
        </a>
      )}
    </p>
  );
}

/** What a station says: the same content whether read beside the slab or as a page. */
export default function Panel({
  station,
  index,
  lang,
  heading: Heading = "h2",
  drivable = false,
}: {
  station: Station;
  index: number;
  lang: Lang;
  heading?: "h1" | "h2";
  /** in the 3D hall the opening panel explains the controls and starts the tour */
  drivable?: boolean;
}) {
  const t = copy[lang];
  const head = (
    <header className={s.head}>
      <p className={s.place}>
        {two(index + 1)} / {two(stations.length)}
      </p>
      <Heading className={s.title}>{stationTitle(station, lang)}</Heading>
    </header>
  );

  if (station.kind === "intro") {
    return (
      <>
        {head}
        <p className={s.role}>
          {profile.title} / {profile.location[lang]}
        </p>
        {/* the summary itself is the next stop, the profile */}
        {drivable && <p className={s.lead}>{t.lede}</p>}

        {drivable && (
          <section className={s.block}>
            <h3 className={s.label}>{t.how}</h3>
            <dl className={s.controls}>
              <div>
                <dt>
                  <kbd>W</kbd>
                  <kbd>S</kbd>
                </dt>
                <dd>{t.gas}</dd>
              </div>
              <div>
                <dt>
                  <kbd>A</kbd>
                  <kbd>D</kbd>
                </dt>
                <dd>{t.steer}</dd>
              </div>
              <div>
                <dt>
                  <kbd className={s.wide}>Space</kbd>
                </dt>
                <dd>{t.hand}</dd>
              </div>
              <div>
                <dt>
                  <kbd className={s.wide}>Shift</kbd>
                </dt>
                <dd>{t.boost}</dd>
              </div>
              <div>
                <dt>
                  <kbd className={s.wide}>Enter</kbd>
                </dt>
                <dd>{t.auto}</dd>
              </div>
            </dl>
            <p className={s.aside}>{t.tap}.</p>
          </section>
        )}

        <div className={s.actions}>
          {drivable && (
            <button type="button" className={s.plate} onClick={() => driveTo(1)}>
              {t.begin}
            </button>
          )}
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className={s.plateSteel}>
            GitHub
          </a>
        </div>
        <p className={s.meta}>{t.open}</p>
      </>
    );
  }

  if (station.kind === "project") {
    const p = station.project!;
    return (
      <>
        {head}
        <p className={s.lead}>{p.description[lang]}</p>
        <ul className={s.tags}>
          {p.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>

        <section className={s.block}>
          <h3 className={s.label}>{t.highlights}</h3>
          <ul className={s.highlights}>
            {p.highlights!.map((h) => (
              <li key={h.vi}>{h[lang]}</li>
            ))}
          </ul>
        </section>
        <Links repo={p.repo} demo={p.demo} lang={lang} />
      </>
    );
  }

  if (station.kind === "repos") {
    return (
      <>
        {head}
        <ul className={s.repos}>
          {rest.map((p) => (
            <li key={p.name}>
              <h3>{p.name}</h3>
              <Links repo={p.repo} demo={p.demo} lang={lang} />
              <p>{p.description[lang]}</p>
            </li>
          ))}
        </ul>
      </>
    );
  }

  if (station.kind === "about") {
    return (
      <>
        {head}
        <p className={s.lead}>{profile.summary[lang]}</p>
        <div className={s.pair}>
          <section>
            <h3 className={s.label}>{t.education}</h3>
            <p className={s.strong}>{education.school}</p>
            <p className={s.quiet}>{education.major}</p>
            <p className={s.meta}>
              GPA {education.gpa} / {education.period[lang]}
            </p>
          </section>
          <section>
            <h3 className={s.label}>{t.certs}</h3>
            <ul className={s.plain}>
              {certifications.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
        </div>
      </>
    );
  }

  if (station.kind === "skills") {
    return (
      <>
        {head}
        <dl className={s.skills}>
          {skillGroups.map((g) => (
            <div key={g.title}>
              <dt>{g.label[lang]}</dt>
              <dd>
                {g.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </>
    );
  }

  return (
    <>
      {head}
      <p className={s.headline}>{t.contactHead}</p>
      <p className={s.lead}>{t.contactBody}</p>
      <div className={s.actions}>
        <a href={`mailto:${profile.email}`} className={s.plate}>
          {t.email}
        </a>
        <a href={profile.github} target="_blank" rel="noopener noreferrer" className={s.plateSteel}>
          GitHub
        </a>
      </div>
      <dl className={s.contactLines}>
        <div>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </dd>
        </div>
        <div>
          <dt>{lang === "vi" ? "Điện thoại" : "Phone"}</dt>
          <dd>
            <a href={`tel:${profile.phone}`}>{profile.phone}</a>
          </dd>
        </div>
        <div>
          <dt>{lang === "vi" ? "Nơi ở" : "Based in"}</dt>
          <dd>{profile.location[lang]}</dd>
        </div>
      </dl>
    </>
  );
}
