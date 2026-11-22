# Tachycardia-induced cardiomyopathy: planning outline

Status (2026-11-22): plan and literature review done; revised the same day after Mohammad asked for a cardiology talk, not a hepatology one. Deck being built on the assumptions below.

## Brief

| Item | Status |
|---|---|
| Topic | Tachycardia-induced (arrhythmia-induced) cardiomyopathy: mechanism, which rhythms, how to suspect and prove it, rate vs rhythm control, ablation, imaging, recovery of EF, recurrence |
| Standpoint | Cardiology and EP (Mohammad, 2026-11-22: "not from hepatologist at all"). Liver only where it is clinically part of heart failure (congestive liver tests in the opening labs, one line) |
| Audience | **Assumed:** internal medicine residents and cardiology fellows. To confirm |
| Length | **Assumed:** 60 minutes, about 55 numbered slides. The 30-minute cut is marked `ext()` in build.js (about 38 slides) |
| Date and venue | Unknown |
| Format | Longitudinal case plus review, three patients |
| Decisions the talk should change | Suspect it in every new HFrEF with a fast or irregular rhythm or frequent PVCs; read a regular rate of 150 as flutter until proven otherwise; no diltiazem when EF <40%; early rhythm control, ablation where it cures; no ICD in the first weeks; keep watching after the EF comes back |

## The patients

Invented teaching values. No real patient data.

**Patient A, 54M, ED.** Six weeks of exertional dyspnea, orthopnea, leg edema. Triage reads the ECG as sinus tachycardia.

| Time | What happens |
|---|---|
| Hour 0 | HR 148 regular, BP 104/72, SpO2 94%. Crackles, JVP to the angle of the jaw, 2+ edema. NT-proBNP 5,200, hs-troponin T 38 flat, TSH 1.8, AST 86, ALT 104, T bili 2.6 (congestive). ECG: atrial flutter with 2:1 conduction |
| Hour 2 | Echo: EF 25%, LVEDD 56 mm, wall thickness 9 mm, moderate functional MR, IVC 2.6 cm |
| Day 1 to 2 | Coronary CTA without stenosis; 2 beers a week, no stimulants; ferritin normal. CMR: no late gadolinium enhancement |
| Day 2 | Heparin, TEE, cardioversion, cavotricuspid isthmus ablation, metoprolol succinate, GDMT started |
| Week 1 | NT-proBNP 1,900 |
| Month 3 | EF 55%, LVEDD 54 mm, liver tests normal. No ICD |
| Year 2 | Three weeks of palpitations, AF at 130. EF 30% again |

**Patient B, 38F.** Palpitations and "skipped beats" for a year, mild dyspnea. Holter: PVC burden 26%, monomorphic, LBBB morphology with inferior axis (RVOT). EF 40%, LVEDD 58 mm, QRS 96 ms, CMR no LGE. RVOT ablation, EF 58% at 4 months.

**Patient C, 68M.** Persistent AF for 14 months, resting HR 82 on metoprolol, 24-hour mean 88. EF 35%, coronaries clean, no LGE. "His rate is controlled, so it isn't the AF." AF ablation, EF 52% at 6 months.

## Sections (60 minutes)

| # | Section | Slides | Min | 30-min cut keeps |
|---|---|---:|---:|---|
| 0 | Cover, objectives | 1 | 1 | all |
| 1 | Patient A in the ED | 7 | 8 | ECG, echo, which came first |
| 2 | History 1913 to 1986 | 5 | 4 | timeline and Packer |
| 3 | What it is: kinds, rhythms, rate, time course, mechanism | 6 | 7 | kinds, rhythms, rate |
| 4 | Diagnosis | 6 | 7 | workup, TIC vs DCM, LGE, proving it |
| 5 | Patient A: treatment and recovery | 6 | 7 | drug to avoid, rhythm, ICD, month 3 |
| 6 | Patient C: rate-controlled AF | 8 | 10 | AF-CHF, CASTLE-AF, CAMERA-MRI, guideline |
| 7 | Patient B: PVCs | 6 | 6 | burden, ablation, who won't recover |
| 8 | After recovery | 4 | 5 | recurrence, remodeling |
| 9 | Back to the patients, what I'd do, questions | 3 | 2 | all |

## Beat by beat

### 1. Patient A in the ED

| Beat | First on screen | Prompt | Reveal (next slide) | Figure | Source |
|---|---|---|---|---|---|
| 1.1 | Section page: "54M, short of breath for six weeks" | | | Gemini watercolor, ED bay | |
| 1.2 | Vitals and exam | What do you want to know? | single | Table | |
| 1.3 | Labs: NT-proBNP, troponin, TSH, Na, Cr, AST/ALT/bili | What do they tell you? | Heart failure with congestive liver tests; troponin flat | Lab table, red for abnormal | Lau 2002 PMID 12480058 (congestive liver tests) |
| 1.4 | 12-lead, regular narrow tachycardia at 148 | What's the rhythm? | Atrial flutter with 2:1 conduction. A fixed rate near 150 is flutter until proven otherwise; adenosine or vagal maneuvers unmask flutter waves | Real ECG (his own or CC-licensed), then the same ECG with flutter waves marked | |
| 1.5 | Differential of a regular narrow tachycardia at 150 | Which of these can do it? | sinus tach, flutter 2:1, focal AT, AVNRT, AVRT, PJRT (long RP) | Table with RP and clues | Huizar 2019 |
| 1.6 | Echo table | What's going on? | New HFrEF, non-dilated-looking LV for an EF of 25%, no LVH | Echo table | |
| 1.7 | Two boxes: flutter → weak LV, weak LV → flutter | Which came first? | Answered in section 4 and month 3 | Drawn boxes | |

### 2. History

Timeline slide (1913, 1949, 1962, 1971, 1986), then the papers. **PDFs needed** for title blocks.

| Year | Content | Source |
|---|---|---|
| 1913 | Gossage and Braxton Hicks: auricular fibrillation in hearts with no other disease. Exact content to check against the PDF | QJM 1913;os6:435-440, doi 10.1093/oxfordjournals.qjmed.a069352 |
| 1949 | Phillips and Levine: AF without other heart disease, and heart failure that resolved with rate control. To check against the PDF | Am J Med 1949;7:478-489, doi 10.1016/0002-9343(49)90397-6 |
| 1962 | Whipple: rapid pacing of normal dog hearts caused reversible heart failure (cited via Shinbane 1997) | Shinbane JACC 1997 PMID 9091514 |
| 1971 | Coleman, Taylor, Pool, Whipple, Covell, Ross, Braunwald: chronic tachycardia causes heart failure in dogs | Am Heart J 1971;81:790-8, PMID 5088355 |
| 1986 | Packer names it: 8 patients, EF 19% to 33% at 8 days to 45% late | Am J Cardiol 1986;57:563-70, PMID 3953440 |

### 3. What it is

| Beat | Content | Source |
|---|---|---|
| 3.1 | Pure vs superimposed (AF-induced vs AF-mediated), table filled on the reveal | Joglar 2023 PMID 38033089; Fenelon PMID 8848384 |
| 3.2 | Which rhythms: AF, flutter, focal AT, AVRT/PJRT, AVNRT, VT, PVCs, sinus tachycardia; all "yes" on the reveal, AF and flutter most common. Pacing, LBBB and pre-excitation are separate entities | Shoureshi JACC 2024 PMID 38811098 |
| 3.3 | How fast: focal AT with CM ran slower (117 vs 141 bpm) but incessant (100% vs 20%). Suspect with mean HR >100 | Medi JACC 2009 PMID 19422986; Huizar 2019 PMID 31072578 |
| 3.4 | Irregularity matters on its own: same mean rate, irregular RR cut cardiac output 5.2 to 4.4 L/min and raised PCWP 14 to 17 | Clark JACC 1997 PMID 9316536 |
| 3.5 | Time course: develops over 3 to 120 days in clinical series; recovers in 4 to 12 weeks | Shoureshi 2024 |
| 3.6 | Pig model at 240/min for 3 weeks: FS 31 to 15%, LVEDD 3.8 to 5.6 cm, mass unchanged; after 4 weeks off pacing FS back to normal but LVEDD 4.2 and mass up. Human biopsy: less fibrosis than DCM, abnormal mitochondria, macrophages | Spinale Circ Res 1991 PMID 1934334; Mueller JACC 2017 PMID 28449778 |

### 4. Diagnosis

| Beat | Content | Source |
|---|---|---|
| 4.1 | Workup table, tests blank first: ischemia, TSH, alcohol and stimulants, iron, CMR, monitor ≥2 weeks (≥6 days for PVC burden) | Shoureshi 2024 |
| 4.2 | TIC vs idiopathic DCM: all TIC improved EF ≥15%, no DCM did; LVEDD ≤61 mm sens 100%, spec 71%; 4 DCM transplants | Jeong Clin Cardiol 2008 PMID 18404727 |
| 4.3 | LGE: in CAMERA-MRI ablation arm, no LGE normalized 73% vs 29%; PVC patients, LGE in 1 of 19 with TIC vs 4 of 5 with primary CM | Prabhu 2017 PMID 28855115; Hasdemir 2012 PMID 22303908 |
| 4.4 | NT-proBNP ratio after cardioversion ≥2.3 at 1 week: sens 84%, spec 95% (pilot, 40 patients) | Nia 2011 PMID 21538234 |
| 4.5 | You prove it afterwards: EF improves once the rhythm is controlled, usually 4 to 12 weeks, judged within 6 months | Shoureshi 2024 |
| 4.6 | Patient A workup results: "Probably. We'll know in 3 months." | |

### 5. Patient A: treatment

| Beat | Content | Source |
|---|---|---|
| 5.1 | Which drug would you avoid? Diltiazem (Class 3: Harm with EF <40%). Beta-blocker if BP allows, IV amiodarone if not (2a), digoxin add-on (2a). Anticoagulate | Joglar 2023 recs 4, 5, 11 |
| 5.2 | Rate or rhythm: new HFrEF + AF, suspect AiCM, early rhythm control (Class 1, B-NR). Flutter: CTI ablation acute success 91%; AF after flutter ablation 34% | Joglar 2023 rec 1; Pérez Circ AE 2009 PMID 19808495 |
| 5.3 | What we did, Hour 0 to Week 1 | |
| 5.4 | Persistent flutter series: 16 of 28 improved, 12 normalized, 9 of 19 no longer met ICD criteria | Pizzale 2009 PMID 19668781 |
| 5.5 | ICD now? No. Reassess after ≥3 months of GDMT | Pizzale 2009; 2017 AHA/ACC/HRS VA guideline (Al-Khatib, PMID 29097296) |
| 5.6 | Month 3: EF 55%, LVEDD 54, labs normal | |

### 6. Patient C: rate-controlled AF

| Beat | Content | Source |
|---|---|---|
| 6.1 | Section page and data | |
| 6.2 | AF-CHF: drug rhythm control vs rate, CV death 27% vs 25% | Roy NEJM 2008 PMID 18565859 |
| 6.3 | CASTLE-AF: death or HF admission 28.5% vs 44.6%, HR 0.62; death 13.4% vs 25.0% | Marrouche NEJM 2018 PMID 29385358 |
| 6.4 | CAMERA-MRI (Australia): EF +18 vs +4.4; normalized 58% vs 9%; at 4 years +16.4 vs +8.6 | Prabhu 2017; Sugumar 2020 PMID 33334453 |
| 6.5 | CASTLE-HTx (one German center): 8% vs 30%, HR 0.24 | Sohns NEJM 2023 PMID 37634135 |
| 6.6 | 2023 guideline table (paraphrased, COR/LOE) | Joglar 2023 |
| 6.7 | Rate targets: RACE II lenient (<110) vs strict (<80), 12.9% vs 14.9% in permanent AF; guideline 2b for stricter target in suspected TIC | Van Gelder NEJM 2010 PMID 20231232 |
| 6.8 | When rhythm control fails: AV node ablation + CRT, death 11% vs 29% | Brignole EHJ 2021 PMID 34453840 |

### 7. Patient B: PVCs

| Beat | Content | Source |
|---|---|---|
| 7.1 | Section page, Holter summary | |
| 7.2 | Baman: burden 33% vs 13%, >24% cutoff, lowest 10% | Baman 2010 PMID 20348027 |
| 7.3 | CHS population: top quartile OR 3.10 for EF drop, HR 1.48 HF, 1.31 death | Dukes 2015 PMID 26160626 |
| 7.4 | Ablation vs no ablation: 34% to 59% after ablation; 28% unchanged without | Bogun 2007 PMID 17599667 |
| 7.5 | Who won't normalize: QRS >130, burden <17%, LVEDD >63 | Penela 2017 PMID 28756100 |
| 7.6 | ESC 2022: PVC ≥10% with unexplained low EF, CMR, ablation recommended | Zeppenfeld 2022 PMID 36017572 |

### 8. After recovery

| Beat | Content | Source |
|---|---|---|
| 8.1 | Patient A at year 2; Nerheim: recurrence, EF fell within 6 months, 3 of 24 sudden deaths | Nerheim 2004 PMID 15226218 |
| 8.2 | Persistent remodeling: LVEDVI 72 vs 51 mL/m² in matched controls | Dandamudi 2008 PMID 18675220 |
| 8.3 | What we do: surveillance (2a), early treatment of recurrence, keep GDMT unless cardiology stops it | Joglar 2023 rec 8 |
| 8.4 | RV pacing-induced CM: 12.3%, RV pacing ≥20% | Kiehl 2016 PMID 27855853 |

### 9. Close

Three-patient table; what I'd do (plain lines); Questions with the QR.

## Figures

- **ECGs** (most important): flutter 2:1 at ~150 (Patient A), AF with RVR (Patient A, year 2), frequent monomorphic PVCs with LBBB-inferior axis (Patient B). His own de-identified teaching ECGs first; otherwise CC-licensed images from Wikimedia Commons, credited.
- **Paper title blocks** from PDFs he downloads (list below). Until then each paper slide shows a typed citation box.
- **Redrawn charts** from the numbers above (native shapes, checked against the abstracts).
- **Gemini watercolors** (prompts in the prompts file): cover (1910s string-galvanometer ECG), section pages for the three patients, a smartwatch spot. Reused from his earlier decks: blood tubes, phone, pocket notebook, the stethoscope pause background.

### PDFs to download (Tufts library)

1. Gossage and Braxton Hicks, QJM 1913, doi 10.1093/oxfordjournals.qjmed.a069352
2. Phillips and Levine, Am J Med 1949, doi 10.1016/0002-9343(49)90397-6
3. Coleman ... Braunwald, Am Heart J 1971, PMID 5088355
4. Packer, Am J Cardiol 1986, PMID 3953440
5. Prabhu (CAMERA-MRI), JACC 2017, PMID 28855115
6. Marrouche (CASTLE-AF), NEJM 2018, PMID 29385358
7. Sohns (CASTLE-HTx), NEJM 2023, PMID 37634135
8. Roy (AF-CHF), NEJM 2008, PMID 18565859
9. Nerheim, Circulation 2004, PMID 15226218
10. Baman, Heart Rhythm 2010, PMID 20348027

## Evidence list (PMIDs checked on PubMed 2026-11-22)

| Ref | PMID |
|---|---|
| Gossage, Braxton Hicks. QJM 1913;os6:435-440 | none (doi on Crossref) |
| Phillips, Levine. Am J Med 1949;7:478-489 | none (doi on Crossref) |
| Coleman ... Braunwald. Am Heart J 1971;81:790-8 | 5088355 |
| Packer et al. Am J Cardiol 1986;57:563-70 | 3953440 |
| Spinale et al. Circ Res 1991;69:1058-67 | 1934334 |
| Fenelon et al. PACE 1996;19:95-106 | 8848384 |
| Shinbane et al. JACC 1997;29:709-15 | 9091514 |
| Clark et al. JACC 1997;30:1039-45 | 9316536 |
| Lau et al. Am J Cardiol 2002;90:1405-9 | 12480058 |
| Nerheim et al. Circulation 2004;110:247-52 | 15226218 |
| Bogun et al. Heart Rhythm 2007;4:863-7 | 17599667 |
| Jeong et al. Clin Cardiol 2008;31:172-8 | 18404727 |
| Dandamudi et al. Heart Rhythm 2008;5:1111-4 | 18675220 |
| Roy et al. (AF-CHF) NEJM 2008;358:2667-77 | 18565859 |
| Medi et al. JACC 2009;53:1791-7 | 19422986 |
| Pérez et al. Circ Arrhythm Electrophysiol 2009;2:393-401 | 19808495 |
| Pizzale et al. Can J Cardiol 2009;25:469-72 | 19668781 |
| Baman et al. Heart Rhythm 2010;7:865-9 | 20348027 |
| Van Gelder et al. (RACE II) NEJM 2010;362:1363-73 | 20231232 |
| Nia et al. Clin Res Cardiol 2011;100:887-96 | 21538234 |
| Hasdemir et al. PACE 2012;35:465-70 | 22303908 |
| Ling et al. Heart Rhythm 2013;10:1334-9 | 23811081 |
| Dukes et al. JACC 2015;66:101-9 | 26160626 |
| Kiehl et al. Heart Rhythm 2016;13:2272-8 | 27855853 |
| Prabhu et al. (CAMERA-MRI) JACC 2017;70:1949-61 | 28855115 |
| Mueller et al. JACC 2017;69:2160-72 | 28449778 |
| Penela et al. Heart Rhythm 2017;14:1864-70 | 28756100 |
| Al-Khatib et al. 2017 AHA/ACC/HRS VA guideline. JACC 2018;72:e91-e220 | 29097296 |
| Marrouche et al. (CASTLE-AF) NEJM 2018;378:417-27 | 29385358 |
| Huizar et al. JACC 2019;73:2328-44 | 31072578 |
| Sugumar et al. JACC Clin EP 2020;6:1721-31 | 33334453 |
| Brignole et al. (APAF-CRT) EHJ 2021;42:4731-9 | 34453840 |
| Zeppenfeld et al. 2022 ESC VA guideline. EHJ 2022;43:3997-4126 | 36017572 |
| Sohns et al. (CASTLE-HTx) NEJM 2023;389:1380-9 | 37634135 |
| Joglar et al. 2023 ACC/AHA/ACCP/HRS AF guideline. Circulation 2024;149:e1-e156 | 38033089 (full text read, PMC11095842) |
| Shoureshi et al. JACC 2024;83:2214-32 | 38811098 |

### Still to check

- What the 1913 and 1949 papers say (need the PDFs). Nothing about them goes on a slide beyond the citation until they are read.
- ESC 2022 classes for the PVC recommendations: taken from ESC wording ("is recommended" = I, "should be considered" = IIa) via the ACC summary, not the guideline table itself.
- Stopping GDMT after recovery in pure TIC: no trial; TRED-HF was recovered DCM. The slide leaves it to cardiology.
