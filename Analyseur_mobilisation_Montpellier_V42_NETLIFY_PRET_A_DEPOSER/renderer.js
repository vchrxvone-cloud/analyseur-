const D=window.DEMOGRAPHICS;
const S=window.SOCIOECONOMIC;
const fmt=n=>new Intl.NumberFormat('fr-FR').format(Number(n||0));
const pct=n=>Number(n||0).toLocaleString('fr-FR',{minimumFractionDigits:1,maximumFractionDigits:1})+' %';
const money=n=>Number(n||0).toLocaleString('fr-FR',{maximumFractionDigits:0})+' €';
const num1=n=>Number(n||0).toLocaleString('fr-FR',{minimumFractionDigits:1,maximumFractionDigits:1});
const ageLabels=['18–19','20–24','25–29','30–34','35–39','40–44','45–49','50–54','55–59','60–64','65–69','70–74','75–79','80–84','85+'];

function switchTab(id){
  document.querySelectorAll('aside button[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab===id));
  document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.id===id));
}
document.querySelectorAll('aside button[data-tab]').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));

const g=D.global;
document.getElementById('globalCards').innerHTML=[
  ['Inscrits',fmt(g.registered)],['Femmes',pct(g.womenPct)],
  ['Hommes',pct(g.menPct)],['Âge médian',g.medianAge+' ans']
].map(x=>`<div class="card"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('');

document.getElementById('gender').innerHTML=
`<div class="barrow"><b>Femmes</b><div class="track"><i style="width:${g.womenPct}%"></i></div><span>${pct(g.womenPct)}</span><span>${fmt(g.women)}</span></div>
<div class="barrow"><b>Hommes</b><div class="track"><i style="width:${g.menPct}%"></i></div><span>${pct(g.menPct)}</span><span>${fmt(g.men)}</span></div>`;

const max=Math.max(...ageLabels.map(k=>g.agePct[k]||0));
document.getElementById('ageTable').innerHTML=ageLabels.map(k=>
  `<div class="barrow"><b>${k}</b><div class="track"><i style="width:${(g.agePct[k]||0)/max*100}%"></i></div><span>${pct(g.agePct[k]||0)}</span><span>${fmt(g.ages[k]||0)}</span></div>`
).join('');

const panel=document.getElementById('bureauPanel');
const content=document.getElementById('bureauPanelContent');
document.getElementById('closePanel').addEventListener('click',()=>panel.classList.remove('open'));

function sumAges(d,labels){return labels.reduce((s,k)=>s+(d.ages?.[k]||0),0)}
function metricRow(label,value,barValue=null){
  return `<div class="bureau-metric-row"><div><span>${label}</span><b>${value}</b></div>${barValue===null?'':`<div class="bureau-metric-track"><i style="width:${Math.max(0,Math.min(100,barValue))}%"></i></div>`}</div>`;
}
function renderBureau(bureau){
  const d=D.bureaux[String(bureau)];
  const s=S?.bureaux?.[String(bureau)];
  if(!d)return;
  const young=d.registered?sumAges(d,['18–19','20–24','25–29'])/d.registered*100:0;
  const senior=d.registered?sumAges(d,['65–69','70–74','75–79','80–84','85+'])/d.registered*100:0;
  const localMax=Math.max(...ageLabels.map(k=>d.agePct?.[k]||0),1);
  const part=window.PARTICIPATION_DATA?.bureaux?.[String(bureau)];
  const participationHtml=part?.weighted_turnout!=null?`<div class="bureau-section"><h3>Participation électorale</h3>
    ${metricRow('Moyenne pondérée',pct(part.weighted_turnout),part.weighted_turnout)}
    ${metricRow('Participation récente 2024',part.recent_turnout==null?'—':pct(part.recent_turnout),part.recent_turnout)}
    ${metricRow('Réserve de mobilisation',pct(part.reserve_score),part.reserve_score)}
    ${metricRow('Régularité (écart-type)',num1(part.consistency_sd)+' pts')}
    <p class="bureau-source">${part.elections_count} scrutins disponibles · rang ${part.rank??'—'} sur 139.</p>
  </div>`:'';

  const socioHtml=s?`
  <div class="bureau-section"><h3>Économie et logement</h3>
    ${metricRow('Niveau de vie territorial',money(s.niveau_vie))}
    ${metricRow('Ménages pauvres',pct(s.pct_menages_pauvres),s.pct_menages_pauvres)}
    ${metricRow('Chômage des 15–64 ans',pct(s.pct_chomage),s.pct_chomage)}
    ${metricRow('Familles monoparentales',pct(s.pct_familles_monoparentales),s.pct_familles_monoparentales)}
    ${metricRow('Propriétaires',pct(s.pct_proprietaires),s.pct_proprietaires)}
    ${metricRow('Logements sociaux',pct(s.pct_logements_sociaux),s.pct_logements_sociaux)}
    ${metricRow('Habitat collectif',pct(s.pct_habitat_collectif),s.pct_habitat_collectif)}
    ${metricRow('Maisons',pct(s.pct_maisons),s.pct_maisons)}
    ${metricRow('Surface moyenne territoriale',num1(s.surface_moyenne)+' m²')}
    ${metricRow('Diplômés du supérieur',pct(s.pct_superieur),s.pct_superieur)}
    ${metricRow('Sans diplôme',pct(s.pct_sans_diplome),s.pct_sans_diplome)}
    ${metricRow('Cadres et prof. intellectuelles sup.',pct(s.pct_cadres),s.pct_cadres)}
    ${metricRow('Professions intermédiaires',pct(s.pct_prof_intermediaires),s.pct_prof_intermediaires)}
    ${metricRow('Employés',pct(s.pct_employes),s.pct_employes)}
    ${metricRow('Ouvriers',pct(s.pct_ouvriers),s.pct_ouvriers)}
  </div>
  <div class="bureau-section"><h3>Qualité de l’assignation</h3>
    ${metricRow('Adresse BAN exacte',pct(s.pct_geocodage_exact),s.pct_geocodage_exact)}
    ${metricRow('Rattachement à la voie',pct(s.pct_geocodage_voie),s.pct_geocodage_voie)}
    ${metricRow('Couverture Filosofi',pct(s.pct_couverture_filosofi),s.pct_couverture_filosofi)}
    ${metricRow('Couverture IRIS',pct(s.pct_couverture_iris),s.pct_couverture_iris)}
    <p class="bureau-source">Calcul pondéré sur ${fmt(s.nb_electeurs)} électeurs.</p>
  </div>`:
  `<div class="bureau-section"><h3>Socio-économie</h3><p class="bureau-empty">Aucune donnée disponible.</p></div>`;

  content.innerHTML=`
  <div class="bureau-head"><div><h2>Bureau ${bureau}</h2><p>${d.name||'Montpellier'}</p></div><button class="open-full-data" type="button" data-kind="bureau" data-id="${bureau}">Voir toutes les données</button></div>
  <div class="bureau-kpis">
    <div class="bureau-kpi"><span>Inscrits</span><strong>${fmt(d.registered)}</strong></div>
    <div class="bureau-kpi"><span>Âge médian</span><strong>${d.medianAge??'—'} ans</strong></div>
    <div class="bureau-kpi"><span>Femmes</span><strong>${pct(d.womenPct)}</strong></div>
    <div class="bureau-kpi"><span>Hommes</span><strong>${pct(d.menPct)}</strong></div>
    <div class="bureau-kpi"><span>18–29 ans</span><strong>${pct(young)}</strong></div>
    <div class="bureau-kpi"><span>65 ans et +</span><strong>${pct(senior)}</strong></div>
  </div>
  ${socioHtml}
  ${participationHtml}
  <div class="bureau-section"><h3>Tranches d’âge</h3>
    ${ageLabels.map(k=>`<div class="bureau-age-row"><span>${k}</span><div class="bureau-age-track"><i style="width:${(d.agePct?.[k]||0)/localMax*100}%"></i></div><b>${pct(d.agePct?.[k]||0)}</b></div>`).join('')}
  </div>
  <div class="bureau-bottom-action"><button class="open-full-data" type="button" data-kind="bureau" data-id="${bureau}">Voir toutes les données</button></div>`;
  panel.classList.add('open');
  content.scrollTop=0;
}

function renderIris(p){
  if(!p)return;
  const ic=window.IMMO_COMMERCE_PACK?.iris?.[String(p.code_iris)]||{};
  const immoCommerceHtml=Object.keys(ic).length?`<div class="bureau-section"><h3>Immobilier et vie quotidienne</h3>${metricRow('Prix médian au m²',ic.prix_m2_median_global==null?'Données insuffisantes':money(ic.prix_m2_median_global)+' /m²')}${metricRow('Évolution 2021–2025',ic.evolution_prix_2021_2025_pct==null?'Données insuffisantes':(ic.evolution_prix_2021_2025_pct>0?'+':'')+num1(ic.evolution_prix_2021_2025_pct)+' %')}${ic.evolution_prix_avertissement?`<p class="bureau-source"><strong>Prudence :</strong> ${escapeHtml(ic.evolution_prix_avertissement)}</p>`:''}${metricRow('Transactions analysées',fmt(ic.transactions_residentielles))}${metricRow('Fiabilité immobilière',ic.fiabilite_immobilier_5==null?'—':ic.fiabilite_immobilier_5+' / 5')}${metricRow('Commerces pour 1 000 habitants',num1(ic.osm_commerces_pour_1000_hab))}${metricRow('Supermarchés, supérettes et épiceries',fmt(ic.osm_commerces_alimentaires_stricts))}${metricRow('Distance de marche estimée',ic.distance_marche_estimee_alimentation_m==null?'Données insuffisantes':fmt(ic.distance_marche_estimee_alimentation_m)+' m')}${metricRow('Temps de marche estimé',ic.temps_marche_estime_alimentation_min==null?'Données insuffisantes':fmt(ic.temps_marche_estime_alimentation_min)+' min')}<p class="bureau-source">DVF+ 2021–2025 · OSM Métropole. Accès alimentaire limité aux supermarchés, supérettes et épiceries. Temps estimé à 4,5 km/h avec correction de détour ; ce n’est pas encore un itinéraire réseau réel.</p></div>`:'';
  content.innerHTML=`
  <div class="bureau-head"><div><h2>${p.nom_iris||'IRIS'}</h2><p>IRIS ${p.code_iris} · ${p.type_iris||''}</p></div><button class="open-full-data" type="button" data-kind="iris" data-id="${p.code_iris}">Voir toutes les données</button></div>
  <div class="bureau-kpis">
    <div class="bureau-kpi"><span>Population</span><strong>${fmt(p.population)}</strong></div>
    <div class="bureau-kpi"><span>Femmes</span><strong>${pct(p.pct_femmes)}</strong></div>
    <div class="bureau-kpi"><span>Chômage</span><strong>${pct(p.pct_chomage)}</strong></div>
    <div class="bureau-kpi"><span>Familles monoparentales</span><strong>${pct(p.pct_familles_monoparentales)}</strong></div>
    <div class="bureau-kpi"><span>18–24 ans</span><strong>${pct(p.pct_18_24)}</strong></div>
    <div class="bureau-kpi"><span>25–39 ans</span><strong>${pct(p.pct_25_39)}</strong></div>
    <div class="bureau-kpi"><span>65 ans et +</span><strong>${pct(p.pct_65_plus)}</strong></div>
    <div class="bureau-kpi"><span>Diplômés sup.</span><strong>${pct(p.pct_superieur)}</strong></div>
  </div>
  ${immoCommerceHtml}
  <div class="bureau-section"><h3>Niveaux de diplôme</h3>
    ${metricRow('Diplômés du supérieur',pct(p.pct_superieur),p.pct_superieur)}
    ${metricRow('Sans diplôme ou CEP',pct(p.pct_sans_diplome),p.pct_sans_diplome)}
  </div>
  <div class="bureau-section"><h3>Catégories socioprofessionnelles</h3>
    ${metricRow('Cadres et prof. intellectuelles sup.',pct(p.pct_cadres),p.pct_cadres)}
    ${metricRow('Professions intermédiaires',pct(p.pct_prof_intermediaires),p.pct_prof_intermediaires)}
    ${metricRow('Employés',pct(p.pct_employes),p.pct_employes)}
    ${metricRow('Ouvriers',pct(p.pct_ouvriers),p.pct_ouvriers)}
    ${metricRow('Retraités',pct(p.pct_retraites),p.pct_retraites)}
  </div>
  <div class="bureau-section"><h3>Structure de la population</h3>
    ${metricRow('Femmes',pct(p.pct_femmes),p.pct_femmes)}
    ${metricRow('18–24 ans',pct(p.pct_18_24),p.pct_18_24)}
    ${metricRow('25–39 ans',pct(p.pct_25_39),p.pct_25_39)}
    ${metricRow('65 ans et plus',pct(p.pct_65_plus),p.pct_65_plus)}
    <p class="bureau-source">Source : Insee, recensement 2022, géographie IRIS au 1er janvier 2024.</p>
  </div>
  <div class="bureau-bottom-action"><button class="open-full-data" type="button" data-kind="iris" data-id="${p.code_iris}">Voir toutes les données</button></div>`;
  panel.classList.add('open');
  content.scrollTop=0;
}
window.addEventListener('message',e=>{
  if(e.data?.type==='bureau-selected')renderBureau(String(e.data.bureau));
  if(e.data?.type==='iris-selected')renderIris(e.data.iris);
});

function weightedGlobal(){
  const rows=Object.values(S?.bureaux||{});
  const fields=['niveau_vie','pct_menages_pauvres','pct_proprietaires','pct_logements_sociaux','pct_habitat_collectif','pct_maisons','surface_moyenne','pct_geocodage_exact','pct_geocodage_voie','pct_non_geocode','pct_couverture_filosofi','pct_superieur','pct_sans_diplome','pct_cadres','pct_prof_intermediaires','pct_employes','pct_ouvriers','pct_couverture_iris'];
  const out={bureau:'all',nb_electeurs:rows.reduce((a,r)=>a+(r.nb_electeurs||0),0)};
  fields.forEach(field=>{
    let sum=0,weight=0;
    rows.forEach(r=>{
      if(Number.isFinite(Number(r[field]))&&Number(r.nb_electeurs)>0){
        sum+=Number(r[field])*Number(r.nb_electeurs);
        weight+=Number(r.nb_electeurs);
      }
    });
    out[field]=weight?sum/weight:null;
  });
  return out;
}
const globalSocio=weightedGlobal();
function selectedSocio(){
  const value=document.getElementById('socialBureauSelect').value;
  return value==='all'?globalSocio:S.bureaux[value];
}
function socialRow(label,value,bar=null){
  return `<div class="social-row"><div class="social-row-top"><span>${label}</span><b>${value}</b></div>${bar===null?'':`<div class="social-track"><i style="width:${Math.max(0,Math.min(100,bar))}%"></i></div>`}</div>`;
}
function renderSocialSelection(){
  const s=selectedSocio();
  if(!s)return;
  document.getElementById('socialCards').innerHTML=[
    ['Niveau de vie',money(s.niveau_vie)],
    ['Pauvreté',pct(s.pct_menages_pauvres)],
    ['Logements sociaux',pct(s.pct_logements_sociaux)],
    ['Propriétaires',pct(s.pct_proprietaires)],
    ['Ménages fiscaux imposés',pct(s.pct_menages_imposes)],
    ['Diplômés du supérieur',pct(s.pct_superieur)],['Cadres',pct(s.pct_cadres)]
  ].map(x=>`<div class="card"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('');

  document.getElementById('socialMetrics').innerHTML=
    socialRow('Niveau de vie territorial',money(s.niveau_vie))+
    socialRow('Ménages pauvres',pct(s.pct_menages_pauvres),s.pct_menages_pauvres)+
    socialRow('Propriétaires',pct(s.pct_proprietaires),s.pct_proprietaires)+
    socialRow('Logements sociaux',pct(s.pct_logements_sociaux),s.pct_logements_sociaux)+
    socialRow('Ménages fiscaux imposés',pct(s.pct_menages_imposes),s.pct_menages_imposes)+
    socialRow('Part des impôts dans le revenu disponible',pct(s.pct_impots_revenu),s.pct_impots_revenu)+
    socialRow('Habitat collectif',pct(s.pct_habitat_collectif),s.pct_habitat_collectif)+
    socialRow('Maisons',pct(s.pct_maisons),s.pct_maisons)+
    socialRow('Surface moyenne territoriale',num1(s.surface_moyenne)+' m²')+
    socialRow('Diplômés du supérieur',pct(s.pct_superieur),s.pct_superieur)+
    socialRow('Sans diplôme',pct(s.pct_sans_diplome),s.pct_sans_diplome)+
    socialRow('Cadres et prof. intellectuelles sup.',pct(s.pct_cadres),s.pct_cadres)+
    socialRow('Professions intermédiaires',pct(s.pct_prof_intermediaires),s.pct_prof_intermediaires)+
    socialRow('Employés',pct(s.pct_employes),s.pct_employes)+
    socialRow('Ouvriers',pct(s.pct_ouvriers),s.pct_ouvriers);

  document.getElementById('qualityMetrics').innerHTML=
    socialRow('Adresse BAN exacte',pct(s.pct_geocodage_exact),s.pct_geocodage_exact)+
    socialRow('Rattachement à la voie',pct(s.pct_geocodage_voie),s.pct_geocodage_voie)+
    socialRow('Non géocodé',pct(s.pct_non_geocode),s.pct_non_geocode)+
    socialRow('Couverture Filosofi',pct(s.pct_couverture_filosofi),s.pct_couverture_filosofi)+
    socialRow('Couverture IRIS',pct(s.pct_couverture_iris),s.pct_couverture_iris)+
    socialRow('Électeurs pondérés',fmt(s.nb_electeurs));
}

const select=document.getElementById('socialBureauSelect');
Object.keys(S.bureaux).map(Number).sort((a,b)=>a-b).forEach(b=>{
  const option=document.createElement('option');option.value=String(b);option.textContent=`Bureau ${b}`;select.appendChild(option);
});
select.addEventListener('change',renderSocialSelection);

const socialRows=Object.values(S.bureaux).sort((a,b)=>Number(a.bureau)-Number(b.bureau));
function renderTable(filter=''){
  const q=String(filter).trim();
  const rows=q?socialRows.filter(r=>String(r.bureau).includes(q)):socialRows;
  document.getElementById('socialTableBody').innerHTML=rows.map(r=>`
  <tr data-bureau="${r.bureau}">
    <td><b>${r.bureau}</b></td><td>${fmt(r.nb_electeurs)}</td><td>${money(r.niveau_vie)}</td>
    <td>${pct(r.pct_menages_pauvres)}</td><td>${pct(r.pct_proprietaires)}</td>
    <td>${pct(r.pct_logements_sociaux)}</td><td>${pct(r.pct_superieur)}</td><td>${pct(r.pct_cadres)}</td><td>${pct(r.pct_employes)}</td><td>${pct(r.pct_ouvriers)}</td>
    <td>${pct(r.pct_couverture_iris)}</td>
  </tr>`).join('');

  document.querySelectorAll('#socialTableBody tr').forEach(tr=>tr.addEventListener('click',()=>{
    const bureau=tr.dataset.bureau;
    switchTab('map');
    setTimeout(()=>{
      document.getElementById('mapFrame').contentWindow.postMessage({type:'select-bureau',bureau},'*');
      renderBureau(bureau);
    },80);
  }));
}
document.getElementById('socialSearch').addEventListener('input',e=>renderTable(e.target.value));

renderSocialSelection();
renderTable();


// ---------------- SCHÉMAS ----------------
const schemaConfig={
  pct_chomage:['Chômage','pct'],
  pct_familles_monoparentales:['Familles monoparentales','pct'],
  pct_menages_pauvres:['Pauvreté','pct'],
  pct_logements_sociaux:['Logements sociaux','pct'],
  pct_proprietaires:['Propriétaires','pct'],
  pct_habitat_collectif:['Habitat collectif','pct'],
  pct_maisons:['Maisons','pct'],
  pct_superieur:['Diplômés du supérieur','pct'],
  pct_sans_diplome:['Sans diplôme','pct'],
  pct_cadres:['Cadres','pct'],
  pct_prof_intermediaires:['Professions intermédiaires','pct'],
  pct_employes:['Employés','pct'],
  pct_ouvriers:['Ouvriers','pct'],
  pct_femmes:['Femmes','pct'],
  pct_18_24:['18–24 ans','pct'],
  pct_65_plus:['65 ans et plus','pct'],
  weighted_turnout:['Participation pondérée','pct'],recent_turnout:['Participation récente','pct'],reserve_score:['Réserve de mobilisation','pct'],
  niveau_vie:['Niveau de vie','money'],prix_m2_median_global:['Prix médian au m²','money'],evolution_prix_2021_2025_pct:['Évolution du prix 2021–2025','pct'],osm_commerces_pour_1000_hab:['Commerces pour 1 000 hab.','number'],temps_marche_estime_alimentation_min:['Temps de marche vers alimentation','number']
};
const schemaPresets={
  social:['pct_chomage','pct_familles_monoparentales','pct_menages_pauvres','pct_superieur','pct_cadres','pct_ouvriers'],
  housing:['niveau_vie','pct_proprietaires','pct_logements_sociaux','pct_menages_pauvres','pct_familles_monoparentales','pct_chomage'],
  demography:['pct_femmes','pct_18_24','pct_65_plus','pct_superieur','pct_sans_diplome','pct_familles_monoparentales'],
  education:['pct_superieur','pct_sans_diplome','pct_cadres','pct_prof_intermediaires','pct_employes','pct_ouvriers'],
  employment:['pct_chomage','pct_cadres','pct_prof_intermediaires','pct_employes','pct_ouvriers','niveau_vie'],
  electoral:['weighted_turnout','recent_turnout','reserve_score','pct_18_24','pct_65_plus','pct_chomage'],
  property:['prix_m2_median_global','evolution_prix_2021_2025_pct','niveau_vie','pct_proprietaires','pct_habitat_collectif','pct_maisons'],
  daily:['osm_commerces_pour_1000_hab','temps_marche_estime_alimentation_min','niveau_vie','pct_18_24','pct_65_plus','pct_habitat_collectif']
};
const schemaGalleryPresets=[
  ['social','Profil social','Pauvreté, chômage, familles, diplômes et catégories sociales.'],
  ['demography','Démographie','Âges, femmes, diplômes et structure familiale.'],
  ['education','Diplômes et professions','Niveau de diplôme et structure socioprofessionnelle.'],
  ['employment','Emploi et niveau de vie','Chômage, professions et niveau de vie.'],
  ['housing','Logement et conditions de vie','Propriété, logement social, pauvreté et niveau de vie.'],
  ['property','Immobilier','Prix, évolution, propriété et formes d’habitat.'],
  ['daily','Commerces et vie quotidienne','Commerces, accès alimentaire et structure locale.'],
  ['electoral','Participation et mobilisation','Participation récente, moyenne pondérée et réserve de mobilisation.']
];
const schemaTerritory=document.getElementById('schemaTerritory');
const schemaArea=document.getElementById('schemaArea');
const distributionIndicator=document.getElementById('distributionIndicator');
const relationX=document.getElementById('relationX');
const relationY=document.getElementById('relationY');
const rankingIndicator=document.getElementById('rankingIndicator');
const rankingOrder=document.getElementById('rankingOrder');
const profilePreset=document.getElementById('profilePreset');

function immoForIris(code){
  return window.IMMO_COMMERCE_PACK?.iris?.[String(code)]||{};
}
function irisRows(){
  return (window.IRIS_MONTPELLIER?.features||[]).map(f=>{
    const code=String(f.properties.code_iris);
    return {
      id:code,
      name:f.properties.nom_iris||f.properties.nom||code,
      ...f.properties,
      ...immoForIris(code),
      ...(window.PARTICIPATION_DATA?.iris?.[code]||{}),
      source_immo_commerce:'Données directes à l’échelle IRIS'
    };
  });
}
function geometryCentroid(geometry){
  const pts=[];
  const walk=c=>{if(!Array.isArray(c))return;if(typeof c[0]==='number'&&typeof c[1]==='number')pts.push(c);else c.forEach(walk)};
  walk(geometry?.coordinates);if(!pts.length)return null;
  return [pts.reduce((a,p)=>a+p[0],0)/pts.length,pts.reduce((a,p)=>a+p[1],0)/pts.length];
}
function pointInRing(pt,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++) {const xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1];const hit=((yi>pt[1])!==(yj>pt[1]))&&(pt[0]<(xj-xi)*(pt[1]-yi)/(yj-yi||1e-12)+xi);if(hit)inside=!inside}return inside}
function pointInGeometry(pt,g){if(!pt||!g)return false;const polys=g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];return polys.some(poly=>poly.length&&pointInRing(pt,poly[0])&&!poly.slice(1).some(h=>pointInRing(pt,h)))}
let bureauIrisCache=null;
function bureauToIrisMap(){
  if(bureauIrisCache)return bureauIrisCache;bureauIrisCache={};
  const iris=window.IRIS_MONTPELLIER?.features||[];
  (window.bureauPolygons?.features||[]).forEach(f=>{const id=String(f.properties?.bureau??'');const c=geometryCentroid(f.geometry);const match=iris.find(x=>pointInGeometry(c,x.geometry));if(id&&match)bureauIrisCache[id]=String(match.properties.code_iris)});
  return bureauIrisCache;
}
function bureauRows(){
  const mapping=bureauToIrisMap();
  return Object.entries(S?.bureaux||{}).map(([id,s])=>{
    const d=D.bureaux[id]||{},irisCode=mapping[String(id)],ic=irisCode?immoForIris(irisCode):{};
    return {
      id,name:`Bureau ${id}`,...d,...s,...ic,...(window.PARTICIPATION_DATA?.bureaux?.[String(id)]||{}),
      iris_estimation_code:irisCode||null,
      source_immo_commerce:irisCode?`Estimation issue de l’IRIS ${irisCode}`:'Donnée IRIS non rattachée',
      pct_femmes:d.womenPct,
      pct_18_24:d.registered?100*((d.ages?.['18–19']||0)+(d.ages?.['20–24']||0))/d.registered:null,
      pct_65_plus:d.registered?100*['65–69','70–74','75–79','80–84','85+'].reduce((a,k)=>a+(d.ages?.[k]||0),0)/d.registered:null
    };
  });
}
function schemaRows(){return schemaTerritory.value==='iris'?irisRows():bureauRows()}
function validValues(key){return schemaRows().map(r=>Number(r[key])).filter(Number.isFinite)}
function weightedMean(rows,key,weightKey){const a=rows.map(r=>[Number(r[key]),Number(r[weightKey])]).filter(([v,w])=>Number.isFinite(v)&&Number.isFinite(w)&&w>0);const sw=a.reduce((s,x)=>s+x[1],0);return sw?a.reduce((s,x)=>s+x[0]*x[1],0)/sw:null}
function weightedMedian(rows,key,weightKey){const a=rows.map(r=>[Number(r[key]),Number(r[weightKey])]).filter(([v,w])=>Number.isFinite(v)&&Number.isFinite(w)&&w>0).sort((x,y)=>x[0]-y[0]);const sw=a.reduce((s,x)=>s+x[1],0);let c=0;for(const x of a){c+=x[1];if(c>=sw/2)return x[0]}return null}
function avg(key){
  const rows=schemaRows();
  if(key==='prix_m2_median_global')return weightedMedian(rows,key,'transactions_residentielles');
  if(key==='distance_marche_estimee_alimentation_m'||key==='temps_marche_estime_alimentation_min')return weightedMean(rows,key,'population');
  if(key==='osm_commerces_pour_1000_hab'){
    const ok=rows.filter(r=>Number.isFinite(Number(r.osm_commerces))&&Number(r.population)>0);
    const pop=ok.reduce((s,r)=>s+Number(r.population),0);return pop?1000*ok.reduce((s,r)=>s+Number(r.osm_commerces),0)/pop:null;
  }
  const v=validValues(key);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null;
}
function median(v){if(!v.length)return null;const a=[...v].sort((x,y)=>x-y),m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2}
function quant(v,q){if(!v.length)return null;const a=[...v].sort((x,y)=>x-y),p=(a.length-1)*q,l=Math.floor(p),h=Math.ceil(p);return l===h?a[l]:a[l]+(a[h]-a[l])*(p-l)}
function selectedSchemaRow(){
  const id=schemaArea.value;
  return id==='all'?null:schemaRows().find(r=>String(r.id)===String(id));
}
function fillSchemaSelectors(){
  const options=Object.entries(schemaConfig).map(([k,[label]])=>`<option value="${k}">${label}</option>`).join('');
  [distributionIndicator,relationX,relationY,rankingIndicator].forEach(s=>{
    const old=s.value;s.innerHTML=options;if(schemaConfig[old])s.value=old;
  });
  distributionIndicator.value=distributionIndicator.value||'pct_chomage';
  relationX.value=relationX.value||'pct_superieur';
  relationY.value=relationY.value||'pct_chomage';
  rankingIndicator.value=rankingIndicator.value||'pct_chomage';

  const rows=schemaRows().sort((a,b)=>String(a.name).localeCompare(String(b.name),'fr',{numeric:true}));
  schemaArea.innerHTML='<option value="all">Moyenne de Montpellier</option>'+rows.map(r=>`<option value="${r.id}">${r.name}</option>`).join('');
}
function canvasSetup(id,height=360){
  const c=document.getElementById(id),box=c.parentElement;
  const ratio=window.devicePixelRatio||1;
  const w=Math.max(600,box.clientWidth-20),h=height;
  c.width=w*ratio;c.height=h*ratio;c.style.width=w+'px';c.style.height=h+'px';
  const ctx=c.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);
  ctx.clearRect(0,0,w,h);ctx.font='12px system-ui';ctx.textBaseline='middle';
  return {c,ctx,w,h};
}
function wrapLabel(ctx,text,x,y,maxWidth,lineHeight=14){
  const words=String(text).split(' ');let line='',lines=[];
  words.forEach(word=>{const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test});if(line)lines.push(line);
  lines.slice(0,2).forEach((l,i)=>ctx.fillText(l,x,y+i*lineHeight));
}
function drawProfile(){
  const {ctx,w,h}=canvasSetup('profileChart',440);
  const keys=schemaPresets[profilePreset.value].slice(0,6);
  const row=selectedSchemaRow();
  const center={x:w/2,y:h/2+10};
  const radius=Math.min(w,h)*.31;
  const valueFor=k=>row?Number(row[k]):avg(k);

  // Grille hexagonale bleue
  for(let ring=1;ring<=5;ring++){
    ctx.beginPath();
    keys.forEach((key,i)=>{
      const angle=-Math.PI/2+i*Math.PI/3;
      const r=radius*ring/5;
      const x=center.x+Math.cos(angle)*r;
      const y=center.y+Math.sin(angle)*r;
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    });
    ctx.closePath();
    ctx.strokeStyle=ring===5?'#6688b5':'#294668';
    ctx.lineWidth=ring===5?1.5:1;
    ctx.stroke();
  }

  // Six axes
  keys.forEach((key,i)=>{
    const angle=-Math.PI/2+i*Math.PI/3;
    ctx.beginPath();
    ctx.moveTo(center.x,center.y);
    ctx.lineTo(
      center.x+Math.cos(angle)*radius,
      center.y+Math.sin(angle)*radius
    );
    ctx.strokeStyle='#294668';
    ctx.lineWidth=1;
    ctx.stroke();
  });

  // Valeurs normalisées dans le découpage courant
  const points=keys.map((key,i)=>{
    const values=validValues(key);
    const value=valueFor(key);
    if(!Number.isFinite(value)||!values.length)return null;

    const low=quant(values,.05);
    const high=quant(values,.95);
    const score=Math.max(.03,Math.min(1,(value-low)/(high-low||1)));
    const angle=-Math.PI/2+i*Math.PI/3;

    return {
      x:center.x+Math.cos(angle)*radius*score,
      y:center.y+Math.sin(angle)*radius*score,
      value
    };
  });

  if(points.every(Boolean)){
    ctx.beginPath();
    points.forEach((point,i)=>{
      i?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y);
    });
    ctx.closePath();
    ctx.fillStyle='rgba(53,112,190,.32)';
    ctx.fill();
    ctx.strokeStyle='#5b9cff';
    ctx.lineWidth=3;
    ctx.stroke();
  }

  // Sommets bleus
  points.forEach(point=>{
    if(!point)return;
    ctx.beginPath();
    ctx.arc(point.x,point.y,5,0,Math.PI*2);
    ctx.fillStyle='#9fc5ff';
    ctx.fill();
    ctx.strokeStyle='#397bd3';
    ctx.lineWidth=1.5;
    ctx.stroke();
  });

  // Libellés et valeurs réelles
  keys.forEach((key,i)=>{
    const [label,type]=schemaConfig[key];
    const angle=-Math.PI/2+i*Math.PI/3;
    const x=center.x+Math.cos(angle)*(radius+65);
    const y=center.y+Math.sin(angle)*(radius+46);
    const value=valueFor(key);

    const displayed=Number.isFinite(value)
      ? (type==='money'
          ? Number(value).toLocaleString('fr-FR',{maximumFractionDigits:0})+' €'
          : type==='number'
            ? Number(value).toLocaleString('fr-FR',{maximumFractionDigits:0})
            : type==='age'
              ? Number(value).toLocaleString('fr-FR',{maximumFractionDigits:1})+' ans'
              : Number(value).toLocaleString('fr-FR',{minimumFractionDigits:1,maximumFractionDigits:1})+' %')
      : 'Indisponible';

    ctx.textAlign='center';
    ctx.fillStyle='#dce7f2';
    ctx.font='12px system-ui';
    wrapLabel(ctx,label,x-68,y-11,136,14);

    ctx.fillStyle=Number.isFinite(value)?'#78a9ef':'#d18b8b';
    ctx.font='bold 12px system-ui';
    ctx.fillText(displayed,x,y+25);
  });

  document.getElementById('profileLegend').textContent=
    (row?row.name:'Moyenne de Montpellier')+
    ' — plus le bleu s’étend vers l’extérieur, plus la valeur est supérieure à la moyenne du reste de Montpellier. Plus il reste près du centre, plus la valeur est inférieure.';
}
function drawDistribution(){
  const key=distributionIndicator.value,[label,type]=schemaConfig[key],vals=validValues(key);
  const {ctx,w,h}=canvasSetup('distributionChart',350);
  if(!vals.length)return;
  const min=Math.min(...vals),max=Math.max(...vals),bins=5,counts=Array(bins).fill(0);
  vals.forEach(v=>counts[Math.min(bins-1,Math.floor((v-min)/(max-min||1)*bins))]++);
  const maxC=Math.max(...counts),left=65,bottom=h-55,top=30,barW=(w-left-30)/bins;
  ctx.strokeStyle='#6f8298';ctx.beginPath();ctx.moveTo(left,top);ctx.lineTo(left,bottom);ctx.lineTo(w-20,bottom);ctx.stroke();
  counts.forEach((c,i)=>{
    const bh=(bottom-top-15)*c/(maxC||1),x=left+i*barW+10,y=bottom-bh;
    ctx.fillStyle='#4f7cff';ctx.fillRect(x,y,barW-20,bh);
    ctx.fillStyle='#dce7f2';ctx.textAlign='center';ctx.fillText(String(c),x+(barW-20)/2,y-10);
    const a=min+i*(max-min)/bins,b=min+(i+1)*(max-min)/bins;
    const f=v=>type==='money'?Math.round(v/1000)+'k€':v.toFixed(1)+'%';
    ctx.fillStyle='#9fb0c4';ctx.fillText(f(a)+'–'+f(b),x+(barW-20)/2,bottom+20);
  });
  document.getElementById('distributionSummary').innerHTML=`<b>${label}</b> · moyenne : ${fmt(avg(key),type==='money'?'money':'pct')} · médiane : ${fmt(median(vals),type==='money'?'money':'pct')} · ${vals.length} territoires`;
}
function correlation(xs,ys){
  const n=xs.length;if(n<3)return null;
  const ax=xs.reduce((a,b)=>a+b,0)/n,ay=ys.reduce((a,b)=>a+b,0)/n;
  let num=0,dx=0,dy=0;for(let i=0;i<n;i++){const x=xs[i]-ax,y=ys[i]-ay;num+=x*y;dx+=x*x;dy+=y*y}
  return num/Math.sqrt(dx*dy||1);
}
function drawRelation(){
  const kx=relationX.value,ky=relationY.value;
  const rows=schemaRows().filter(r=>Number.isFinite(Number(r[kx]))&&Number.isFinite(Number(r[ky])));
  const {ctx,w,h}=canvasSetup('relationChart',440);
  if(!rows.length)return;

  const xs=rows.map(r=>Number(r[kx])),ys=rows.map(r=>Number(r[ky]));
  const xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);
  const xmed=median(xs),ymed=median(ys);
  const L=78,R=30,T=35,B=68;
  const xPos=v=>L+(v-xmin)/(xmax-xmin||1)*(w-L-R);
  const yPos=v=>h-B-(v-ymin)/(ymax-ymin||1)*(h-T-B);

  ctx.strokeStyle='#6f8298';
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(L,T);
  ctx.lineTo(L,h-B);
  ctx.lineTo(w-R,h-B);
  ctx.stroke();

  // Médiane X
  ctx.save();
  ctx.setLineDash([7,6]);
  ctx.strokeStyle='#f0b45a';
  ctx.lineWidth=1.5;
  ctx.beginPath();
  ctx.moveTo(xPos(xmed),T);
  ctx.lineTo(xPos(xmed),h-B);
  ctx.stroke();

  // Médiane Y
  ctx.strokeStyle='#59d2a9';
  ctx.beginPath();
  ctx.moveTo(L,yPos(ymed));
  ctx.lineTo(w-R,yPos(ymed));
  ctx.stroke();
  ctx.restore();

  rows.forEach(r=>{
    const x=xPos(Number(r[kx])),y=yPos(Number(r[ky]));
    ctx.beginPath();
    ctx.arc(x,y,4,0,Math.PI*2);
    ctx.fillStyle='rgba(79,124,255,.76)';
    ctx.fill();
  });

  const [labelX,typeX]=schemaConfig[kx];
  const [labelY,typeY]=schemaConfig[ky];
  const formatAxis=(v,type)=>type==='money'
    ? Number(v).toLocaleString('fr-FR',{maximumFractionDigits:0})+' €'
    : Number(v).toLocaleString('fr-FR',{minimumFractionDigits:1,maximumFractionDigits:1})+' %';

  ctx.font='12px system-ui';
  ctx.fillStyle='#dce7f2';
  ctx.textAlign='center';
  ctx.fillText(labelX,(L+w-R)/2,h-22);

  ctx.save();
  ctx.translate(20,(T+h-B)/2);
  ctx.rotate(-Math.PI/2);
  ctx.fillText(labelY,0,0);
  ctx.restore();

  ctx.font='bold 11px system-ui';
  ctx.fillStyle='#f0b45a';
  ctx.textAlign='center';
  ctx.fillText('Médiane X : '+formatAxis(xmed,typeX),xPos(xmed),T-14);

  ctx.fillStyle='#59d2a9';
  ctx.textAlign='left';
  ctx.fillText('Médiane Y : '+formatAxis(ymed,typeY),L+8,yPos(ymed)-12);

  // Quadrant labels
  ctx.font='11px system-ui';
  ctx.fillStyle='rgba(220,231,242,.72)';
  ctx.textAlign='center';
  ctx.fillText('Faible X / Fort Y',(L+xPos(xmed))/2,(T+yPos(ymed))/2);
  ctx.fillText('Fort X / Fort Y',(xPos(xmed)+w-R)/2,(T+yPos(ymed))/2);
  ctx.fillText('Faible X / Faible Y',(L+xPos(xmed))/2,(yPos(ymed)+h-B)/2);
  ctx.fillText('Fort X / Faible Y',(xPos(xmed)+w-R)/2,(yPos(ymed)+h-B)/2);

  const r=correlation(xs,ys);
  const strength=r==null?'indisponible':Math.abs(r)<.25?'faible':Math.abs(r)<.5?'modérée':'forte';
  document.getElementById('relationSummary').innerHTML=
    `Médiane X : <b>${formatAxis(xmed,typeX)}</b> · Médiane Y : <b>${formatAxis(ymed,typeY)}</b><br>`+
    `Corrélation territoriale : <b>${r==null?'—':r.toFixed(2)}</b> · relation ${strength}${r==null?'':r>0?' et positive':' et négative'}. Une corrélation ne prouve pas un lien de causalité.`;
}
function drawRanking(){
  const key=rankingIndicator.value,[label,type]=schemaConfig[key],order=rankingOrder.value;
  const rows=schemaRows().filter(r=>Number.isFinite(Number(r[key]))).sort((a,b)=>order==='desc'?Number(b[key])-Number(a[key]):Number(a[key])-Number(b[key])).slice(0,10);
  const {ctx,w,h}=canvasSetup('rankingChart',420);if(!rows.length)return;
  const max=Math.max(...rows.map(r=>Number(r[key]))),left=190,right=75,top=20,rowH=36;
  rows.forEach((r,i)=>{
    const y=top+i*rowH,x=left,bw=(w-left-right)*Number(r[key])/(max||1);
    ctx.fillStyle='#4f7cff';ctx.fillRect(x,y+8,bw,20);
    ctx.fillStyle='#dce7f2';ctx.textAlign='right';ctx.fillText(r.name,x-10,y+18);
    ctx.textAlign='left';ctx.fillText(fmt(r[key],type==='money'?'money':'pct'),x+bw+8,y+18);
  });
}

function setupGalleryCanvas(canvas,height=330){
  const box=canvas.parentElement,w=Math.max(320,Math.min(620,box.clientWidth-8)),ratio=window.devicePixelRatio||1;
  canvas.width=w*ratio;canvas.height=height*ratio;canvas.style.width=w+'px';canvas.style.height=height+'px';
  const ctx=canvas.getContext('2d');ctx.scale(ratio,ratio);ctx.font='12px system-ui';return {ctx,w,h:height};
}
function schemaValueFor(row,key){return row?Number(row[key]):avg(key)}
function drawRadarOnCanvas(canvas,keys,title){
  const {ctx,w,h}=setupGalleryCanvas(canvas,330),row=selectedSchemaRow(),center={x:w/2,y:h/2+5},radius=Math.min(105,w*.23);
  ctx.clearRect(0,0,w,h);
  for(let ring=1;ring<=5;ring++){
    ctx.beginPath();keys.forEach((key,i)=>{const a=-Math.PI/2+i*Math.PI/3,r=radius*ring/5,x=center.x+Math.cos(a)*r,y=center.y+Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.strokeStyle=ring===3?'#7b94b3':'#294668';ctx.lineWidth=ring===3?2:1;ctx.stroke();
  }
  keys.forEach((key,i)=>{const a=-Math.PI/2+i*Math.PI/3;ctx.beginPath();ctx.moveTo(center.x,center.y);ctx.lineTo(center.x+Math.cos(a)*radius,center.y+Math.sin(a)*radius);ctx.strokeStyle='#294668';ctx.stroke()});
  const pts=keys.map((key,i)=>{const values=validValues(key),v=schemaValueFor(row,key);if(!Number.isFinite(v)||!values.length)return null;const med=median(values),lo=quant(values,.05),hi=quant(values,.95);const below=.5*(v-lo)/(med-lo||1),above=.5+.5*(v-med)/(hi-med||1);const score=Math.max(.04,Math.min(1,v<=med?below:above));const a=-Math.PI/2+i*Math.PI/3;return{x:center.x+Math.cos(a)*radius*score,y:center.y+Math.sin(a)*radius*score,v,med,key}});
  if(pts.every(Boolean)){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle='rgba(53,112,190,.34)';ctx.fill();ctx.strokeStyle='#68a8ff';ctx.lineWidth=3;ctx.stroke()}
  pts.forEach(p=>{if(!p)return;ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fillStyle='#a8ceff';ctx.fill()});
  keys.forEach((key,i)=>{const [label,type]=schemaConfig[key],a=-Math.PI/2+i*Math.PI/3,x=center.x+Math.cos(a)*(radius+54),y=center.y+Math.sin(a)*(radius+39),v=schemaValueFor(row,key);ctx.textAlign='center';ctx.fillStyle='#dce7f2';ctx.font='11px system-ui';wrapLabel(ctx,label,x-55,y-10,110,13);ctx.fillStyle='#8fbaff';ctx.font='bold 11px system-ui';ctx.fillText(Number.isFinite(v)?fmt(v,type==='money'?'money':type==='number'?'number':'pct'):'—',x,y+22)});
}
function drawSchemaGallery(){
  const grid=document.getElementById('schemaGalleryGrid');if(!grid)return;
  grid.innerHTML=schemaGalleryPresets.map(([id,title,desc],i)=>`<article class="schema-gallery-card"><span class="schema-theme-badge">Hexagone thématique</span><h2>${title}</h2><p>${desc}</p><canvas id="schemaGalleryCanvas${i}"></canvas><div class="schema-card-note">Plus le bleu va loin, plus la valeur est supérieure à la moyenne du reste de Montpellier. La ligne médiane de la grille représente la référence globale. Prix : médiane pondérée par les transactions ; accès : moyenne pondérée par la population ; bureaux : estimation issue de l’IRIS de rattachement.</div></article>`).join('');
  schemaGalleryPresets.forEach(([id],i)=>drawRadarOnCanvas(document.getElementById('schemaGalleryCanvas'+i),schemaPresets[id],id));
}
function trendRecordsForSelection(){
 const level=schemaTerritory.value==='iris'?'iris':'bureaux',id=schemaArea.value;
 if(id==='all')return (window.PARTICIPATION_DATA?.elections||[]).map(e=>{const vals=Object.values(window.PARTICIPATION_DATA?.[level]||{}).map(d=>(d.records||[]).find(r=>r.election_id===e.id)?.turnout).filter(Number.isFinite);return {label:e.label,date:e.date,value:vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null}}).filter(x=>Number.isFinite(x.value));
 const d=window.PARTICIPATION_DATA?.[level]?.[String(id)];return (d?.records||[]).map(r=>{const e=(window.PARTICIPATION_DATA?.elections||[]).find(x=>x.id===r.election_id);return {label:e?.label||r.election_id,date:e?.date||'',value:r.turnout}}).filter(x=>Number.isFinite(x.value));
}
function drawLineCard(canvas,records,label,unit='%'){
 const {ctx,w,h}=setupGalleryCanvas(canvas,300),L=52,R=24,T=28,B=68;if(!records.length){ctx.fillStyle='#9fb0c4';ctx.fillText('Données temporelles indisponibles',25,45);return}
 const vals=records.map(x=>x.value),min=Math.min(...vals),max=Math.max(...vals),pad=Math.max(2,(max-min)*.18),lo=min-pad,hi=max+pad,x=i=>L+(records.length===1?0:(w-L-R)*i/(records.length-1)),y=v=>h-B-(v-lo)/(hi-lo||1)*(h-T-B);
 ctx.strokeStyle='#425d78';ctx.beginPath();ctx.moveTo(L,T);ctx.lineTo(L,h-B);ctx.lineTo(w-R,h-B);ctx.stroke();
 ctx.beginPath();records.forEach((r,i)=>i?ctx.lineTo(x(i),y(r.value)):ctx.moveTo(x(i),y(r.value)));ctx.strokeStyle='#68a8ff';ctx.lineWidth=3;ctx.stroke();
 records.forEach((r,i)=>{ctx.beginPath();ctx.arc(x(i),y(r.value),4,0,Math.PI*2);ctx.fillStyle='#a8ceff';ctx.fill();ctx.save();ctx.translate(x(i),h-B+15);ctx.rotate(-.55);ctx.fillStyle='#aebed0';ctx.font='10px system-ui';ctx.fillText((r.label||'').slice(0,25),0,0);ctx.restore()});
 ctx.fillStyle='#dce7f2';ctx.font='bold 12px system-ui';ctx.textAlign='left';ctx.fillText(label,L,T-8);ctx.textAlign='right';ctx.fillText(max.toLocaleString('fr-FR',{maximumFractionDigits:1})+' '+unit,w-R,T-8);ctx.fillText(min.toLocaleString('fr-FR',{maximumFractionDigits:1})+' '+unit,w-R,h-B-5);
}
function drawSchemaTrends(){
 const grid=document.getElementById('schemaTrendGrid');if(!grid)return;const row=selectedSchemaRow();
 const cards=[{title:'Participation électorale dans le temps',desc:'Évolution de la participation selon les scrutins disponibles.',records:trendRecordsForSelection(),unit:'%'},{title:'Évolution du prix immobilier',desc:'Comparaison 2021–2025 lorsque les deux années sont suffisamment documentées.',records:[{label:'2021',value:Number(row?.prix_m2_2021_median)},{label:'2025',value:Number(row?.prix_m2_2025_median)}].filter(x=>Number.isFinite(x.value)),unit:'€/m²'}];
 grid.innerHTML=cards.map((c,i)=>`<article class="schema-gallery-card"><span class="schema-theme-badge">Courbe d’évolution</span><h2>${c.title}</h2><p>${c.desc}</p><canvas id="schemaTrendCanvas${i}"></canvas><div class="schema-card-note">${c.records.length>1?'Lire de gauche à droite pour suivre l’évolution.':'Cette courbe apparaît lorsque plusieurs dates sont disponibles.'}</div></article>`).join('');cards.forEach((c,i)=>drawLineCard(document.getElementById('schemaTrendCanvas'+i),c.records,c.title,c.unit));
}

function drawCurrentSchema(){
  const active=document.querySelector('.schema-tabs button.active')?.dataset.schemaView||'gallery';
  if(active==='gallery')drawSchemaGallery();
  if(active==='profile')drawProfile();
  if(active==='trends')drawSchemaTrends();
  if(active==='distribution')drawDistribution();
  if(active==='relation')drawRelation();
  if(active==='ranking')drawRanking();
}
document.querySelectorAll('.schema-tabs button').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.schema-tabs button').forEach(x=>x.classList.toggle('active',x===b));
  document.querySelectorAll('.schema-view').forEach(v=>v.classList.toggle('active',v.id==='schema'+b.dataset.schemaView[0].toUpperCase()+b.dataset.schemaView.slice(1)));
  requestAnimationFrame(drawCurrentSchema);
}));
schemaTerritory.addEventListener('change',()=>{fillSchemaSelectors();drawCurrentSchema()});
schemaArea.addEventListener('change',drawCurrentSchema);
[distributionIndicator,relationX,relationY,rankingIndicator,rankingOrder,profilePreset].forEach(e=>e.addEventListener('change',drawCurrentSchema));
window.addEventListener('resize',()=>{if(document.getElementById('schemas').classList.contains('active'))drawCurrentSchema()});
document.querySelector('button[data-tab="schemas"]').addEventListener('click',()=>setTimeout(()=>{fillSchemaSelectors();drawCurrentSchema()},50));
fillSchemaSelectors();


// ---------------- ANALYSE GLOBALE RÉELLE : BUREAUX / IRIS ----------------
(function(){
  const bureauButton=document.getElementById('trueGlobalBureau');
  const irisButton=document.getElementById('trueGlobalIris');
  const areaSelect=document.getElementById('trueGlobalArea');
  const ageBox=document.getElementById('trueGlobalAge');
  const socioBox=document.getElementById('trueGlobalSocio');
  const pcsBox=document.getElementById('trueGlobalPcs');
  const methodBox=document.getElementById('trueGlobalMethod');
  if(!areaSelect||!ageBox||!socioBox||!pcsBox)return;

  let mode='bureau';

  function rows(){
    return mode==='iris'?irisRows():bureauRows();
  }

  function medianFor(list,key){
    const values=list.map(r=>Number(r[key])).filter(Number.isFinite).sort((a,b)=>a-b);
    if(!values.length)return null;
    const mid=Math.floor(values.length/2);
    return values.length%2?values[mid]:(values[mid-1]+values[mid])/2;
  }

  function populationWeightedMedian(list,key){
    const usable=list
      .filter(r=>Number.isFinite(Number(r[key]))&&Number(r.population)>0)
      .map(r=>({value:Number(r[key]),weight:Number(r.population)}))
      .sort((a,b)=>a.value-b.value);
    if(!usable.length)return null;
    const total=usable.reduce((sum,r)=>sum+r.weight,0);
    let cumulative=0;
    for(const row of usable){
      cumulative+=row.weight;
      if(cumulative>=total/2)return row.value;
    }
    return usable[usable.length-1].value;
  }

  function irisAggregateStats(key){
    const list=irisRows();
    return {
      median:medianFor(list,key),
      weightedMean:weightedFor(list,key),
      weightedMedian:populationWeightedMedian(list,key)
    };
  }

  function weightedFor(list,key){
    const usable=list.filter(r=>Number.isFinite(Number(r[key])));
    if(!usable.length)return null;
    const weighted=usable.filter(r=>Number(r.registered||r.population||0)>0);
    if(!weighted.length)return medianFor(list,key);
    const total=weighted.reduce((sum,r)=>sum+Number(r.registered||r.population||0),0);
    return weighted.reduce((sum,r)=>sum+Number(r[key])*Number(r.registered||r.population||0),0)/(total||1);
  }

  function selectedRow(){
    if(areaSelect.value==='all')return null;
    return rows().find(r=>String(r.id)===String(areaSelect.value))||null;
  }

  function aggregateValue(key){
    // Les IRIS utilisent une médiane territoriale : les dénominateurs ménages
    // nécessaires à un taux municipal exact ne sont pas embarqués.
    return mode==='iris'?medianFor(rows(),key):weightedFor(rows(),key);
  }

  function valueFor(key){
    const selected=selectedRow();
    const value=selected?Number(selected[key]):aggregateValue(key);
    return Number.isFinite(value)?value:null;
  }

  function fmt(value,type='pct'){
    if(!Number.isFinite(Number(value)))return 'Non disponible';
    if(type==='money')return Number(value).toLocaleString('fr-FR',{maximumFractionDigits:0})+' €';
    if(type==='number')return Number(value).toLocaleString('fr-FR',{maximumFractionDigits:0});
    return Number(value).toLocaleString('fr-FR',{minimumFractionDigits:1,maximumFractionDigits:1})+' %';
  }

  function card(label,key,description='',type='pct'){
    return `<article class="true-global-card">
      <span>${label}</span>
      <strong>${fmt(valueFor(key),type)}</strong>
      <small>${description}</small>
    </article>`;
  }

  function bar(label,key){
    const value=valueFor(key);
    const width=Number.isFinite(value)?Math.max(0,Math.min(100,value)):0;
    return `<div class="true-global-bar">
      <div><span>${label}</span><strong>${fmt(value)}</strong></div>
      <i><b style="width:${width}%"></b></i>
    </div>`;
  }

  function fillAreas(){
    const current=areaSelect.value;
    const territoryRows=rows().slice().sort((a,b)=>
      String(a.name).localeCompare(String(b.name),'fr',{numeric:true})
    );
    areaSelect.innerHTML=
      `<option value="all">${mode==='iris'?'Ensemble des IRIS':'Ensemble des bureaux'}</option>`+
      territoryRows.map(r=>`<option value="${r.id}">${r.name}</option>`).join('');
    if([...areaSelect.options].some(o=>o.value===current))areaSelect.value=current;
  }

  function render(){
    bureauButton?.classList.toggle('active',mode==='bureau');
    irisButton?.classList.toggle('active',mode==='iris');

    const selected=selectedRow();
    if(selected){
      methodBox.innerHTML=
        `<b>${selected.name}</b> — valeurs propres au ${mode==='iris'?'territoire IRIS':'bureau de vote'} sélectionné.`;
    }else if(mode==='iris'){
      const povertyStats=irisAggregateStats('pct_menages_pauvres');
      methodBox.innerHTML=
        `<b>Ensemble des IRIS</b> — trois lectures de la pauvreté territoriale : `+
        `médiane simple <b>${fmt(povertyStats.median)}</b>, `+
        `moyenne pondérée par la population <b>${fmt(povertyStats.weightedMean)}</b>, `+
        `médiane pondérée par la population <b>${fmt(povertyStats.weightedMedian)}</b>. `+
        `Ces valeurs décrivent la distribution des estimations IRIS et ne remplacent pas le taux communal officiel Filosofi.`;
    }else{
      methodBox.innerHTML=
        `<b>Ensemble des bureaux</b> — moyennes estimées pondérées par le nombre d’inscrits. `+
        `Sélectionne un bureau pour afficher ses valeurs territoriales propres.`;
    }

    const ageCards=[
      card('Femmes','pct_femmes','Part des femmes.'),
      card('18–24 ans','pct_18_24','Jeunes adultes.'),
      card('25–39 ans','pct_25_39','Jeunes actifs.'),
      mode==='bureau'
        ? card('40–64 ans','pct_40_64','Population d’âge actif expérimentée.')
        : `<article class="true-global-card unavailable"><span>40–64 ans</span><strong>Non disponible</strong><small>Cette classe n’est pas embarquée dans le fichier IRIS actuel.</small></article>`,
      card('65 ans et plus','pct_65_plus','Population senior.')
    ];
    ageBox.innerHTML=ageCards.join('');

    const irisPovertyStats=mode==='iris'&&!selected?irisAggregateStats('pct_menages_pauvres'):null;
    const povertyOverview=irisPovertyStats?[
      `<article class="true-global-card statistical"><span>Pauvreté — médiane des IRIS</span><strong>${fmt(irisPovertyStats.median)}</strong><small>Chaque IRIS compte une fois.</small></article>`,
      `<article class="true-global-card statistical"><span>Pauvreté — moyenne pondérée</span><strong>${fmt(irisPovertyStats.weightedMean)}</strong><small>Chaque IRIS est pondéré par sa population.</small></article>`,
      `<article class="true-global-card statistical"><span>Pauvreté — médiane pondérée</span><strong>${fmt(irisPovertyStats.weightedMedian)}</strong><small>50 % de la population cumulée se situe de chaque côté.</small></article>`
    ]:[];
    const officialPovertyCard=
      `<article class="true-global-card official-stat">
        <span>Taux officiel de pauvreté — Montpellier</span>
        <strong>30,9 %</strong>
        <small>Insee, Filosofi 2023 — commune de Montpellier. Donnée officielle récente, non directement comparable aux estimations IRIS 2021.</small>
      </article>`;
    socioBox.innerHTML=[officialPovertyCard].concat(povertyOverview,[
      card('Chômage','pct_chomage','Part des chômeurs parmi les actifs.'),
      card('Ménages pauvres','pct_menages_pauvres',
        mode==='iris'&&!selected?'Médiane des IRIS, pas taux municipal.':'Indicateur territorial estimé.'),
      card('Familles monoparentales','pct_familles_monoparentales','Part dans les familles.'),
      card('Diplômés du supérieur','pct_superieur','Diplôme de l’enseignement supérieur.'),
      card('Sans diplôme','pct_sans_diplome','Sans diplôme qualifiant.'),
      card('Niveau de vie','niveau_vie','Niveau de vie territorial estimé.','money'),
      card('Propriétaires','pct_proprietaires','Part des ménages propriétaires.'),
      card('Ménages fiscaux imposés','pct_menages_imposes','Part des ménages fiscaux imposés.'),
      card('Part des impôts','pct_impots_revenu','Poids des impôts dans le revenu disponible.'),
      card('Logements sociaux','pct_logements_sociaux','Part estimée du parc social.'),
      card('Habitat collectif','pct_habitat_collectif','Part en habitat collectif.'),
      card('Maisons','pct_maisons','Part vivant en maison.')
    ]).join('');

    pcsBox.innerHTML=[
      bar('Cadres','pct_cadres'),
      bar('Professions intermédiaires','pct_prof_intermediaires'),
      bar('Employés','pct_employes'),
      bar('Ouvriers','pct_ouvriers'),
      bar('Retraités','pct_retraites')
    ].join('');
  }

  function switchMode(nextMode){
    mode=nextMode;
    fillAreas();
    render();
  }

  bureauButton?.addEventListener('click',()=>switchMode('bureau'));
  irisButton?.addEventListener('click',()=>switchMode('iris'));
  areaSelect.addEventListener('change',render);
  document.querySelector('button[data-tab="global"]')?.addEventListener('click',()=>setTimeout(render,30));

  fillAreas();
  render();
})();


// ---------------- SERVICES À LA POPULATION ----------------
(function(){
 const SP=window.SERVICES_POPULATION;if(!SP)return;
 const level=document.getElementById('servicesLevel'),area=document.getElementById('servicesArea');
 const cards=document.getElementById('servicesCards'),transport=document.getElementById('serviceTransportMetrics');
 const cycle=document.getElementById('serviceCycleMetrics'),works=document.getElementById('serviceWorksMetrics');
 const mapFrame=document.getElementById('servicesMapFrame'),mapStatus=document.getElementById('servicesMapStatus');
 const activeLines=new Set(['1','2','3','4','5']);
 const n=(v,d=1)=>Number(v||0).toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d});
 const integer=v=>Number(v||0).toLocaleString('fr-FR',{maximumFractionDigits:0});
 function current(){return level.value==='global'?SP.global:(SP[level.value]?.[area.value]||{})}
 function lineTotal(r,key){return [...activeLines].reduce((s,l)=>s+Number(r[`tram_${l}_${key}`]||0),0)}
 function metric(a,b,u='',date=''){return `<div class="service-metric"><span>${a}${date?`<small>${date}</small>`:''}</span><strong>${b}${u}</strong></div>`}
 function fillAreas(){
  if(level.value==='global'){area.disabled=true;area.innerHTML='<option value="all">Ensemble de Montpellier</option>'}
  else{area.disabled=false;area.innerHTML=Object.entries(SP[level.value]||{}).sort((a,b)=>String(a[1].name).localeCompare(String(b[1].name),'fr',{numeric:true})).map(([id,r])=>`<option value="${id}">${r.name}</option>`).join('')}
  render()
 }
 function render(){
  const r=current(),tramKm=lineTotal(r,'km'),tramPass=lineTotal(r,'passages');
  cards.innerHTML=[
   ['Arrêts de tram',integer(r.tram_stops),'réseau fourni'],
   ['Arrêts de bus',integer(r.bus_stops),'réseau fourni'],
   ['Passages GTFS',integer(r.gtfs_passages),'16/10/2026'],
   ['Réseau cyclable',n(r.cycle_km)+' km','données disponibles'],
   ['Passages vélo observés',integer(r.bike_total_2024),'année 2024'],
   ['Chantiers longs gênants',integer(r.long_obstructive_works),'au 28/07/2026']
  ].map(([a,b,d])=>`<div class="card dated-card"><span>${a}</span><strong>${b}</strong><small>${d}</small></div>`).join('');

  transport.innerHTML=
   metric('Lignes de tram actives',[...activeLines].map(x=>'L'+x).join(', ')||'Aucune')+
   metric('Longueur de tram sélectionnée',n(tramKm),' km','réseau fourni')+
   metric('Passages tram planifiés',integer(tramPass),'','16/10/2026')+
   metric('Arrêts de tram',integer(r.tram_stops))+
   metric('Arrêts de bus',integer(r.bus_stops))+
   metric('Longueur des lignes de bus',n(r.bus_km),' km')+
   metric('Passages planifiés tous modes',integer(r.gtfs_passages),'','16/10/2026');

  cycle.innerHTML=
   metric('Aménagements cyclables',n(r.cycle_km),' km')+
   metric('Réseau express vélo',n(r.rev_km),' km')+
   metric('Stations Vélomagg',integer(r.velomagg_stations))+
   metric('Capacité Vélomagg',integer(r.velomagg_capacity),' vélos')+
   metric('Compteurs implantés',integer(r.counters))+
   metric('Compteurs actifs dans les archives',integer(r.counters_2024),'','2024')+
   metric('Passages vélo observés',integer(r.bike_total_2024),'','2024')+
   metric('Moyenne par compteur-jour',n(r.bike_avg_counter_day_2024),' passages','2024');

  works.innerHTML=
   metric('Chantiers retenus',integer(r.long_obstructive_works),'','28/07/2026')+
   metric('Durée maximale déclarée',integer(r.max_work_duration_days),' jours')+
   '<p class="service-note">Les petits événements de circulation et interventions brèves ne sont pas comptabilisés.</p>';

  mapStatus.textContent=level.value==='global'?'Montpellier':(r.name||'Territoire sélectionné');
  mapFrame?.contentWindow?.postMessage({type:'services-filter',lines:[...activeLines],level:level.value,area:area.value},'*')
 }
 document.querySelectorAll('.tram-filter').forEach(btn=>btn.addEventListener('click',()=>{
  const l=btn.dataset.line;activeLines.has(l)?activeLines.delete(l):activeLines.add(l);
  btn.classList.toggle('active',activeLines.has(l));
  document.getElementById('tramAll')?.classList.toggle('active',activeLines.size===5);render()
 }));
 document.getElementById('tramAll')?.addEventListener('click',()=>{
  const on=activeLines.size!==5;activeLines.clear();if(on)['1','2','3','4','5'].forEach(x=>activeLines.add(x));
  document.querySelectorAll('.tram-filter').forEach(b=>b.classList.toggle('active',activeLines.has(b.dataset.line)));
  document.getElementById('tramAll').classList.toggle('active',on);render()
 });
 level?.addEventListener('change',fillAreas);area?.addEventListener('change',render);
 document.querySelector('button[data-tab="services"]')?.addEventListener('click',()=>setTimeout(render,50));
 window.addEventListener('message',e=>{if(e.data?.type==='services-map-ready')render()});

 const tbody=document.getElementById('serviceWorksBody'),search=document.getElementById('serviceWorksSearch');
 function renderWorks(){
  const q=(search?.value||'').toLowerCase();
  let rows=SP.major_works.filter(r=>Object.values(r).join(' ').toLowerCase().includes(q));
  if(level.value!=='global'){
   const territory=current();
   // The table remains global because a work can cross several boundaries; the map and counters remain territorial.
  }
  tbody.innerHTML=rows.slice(0,200).map(r=>`<tr>
    <td><span class="work-status ${r.status==='En cours'?'ongoing':'planned'}">${r.status}</span></td>
    <td>${r.address}</td><td>${r.start}</td><td>${r.end}</td>
    <td>${integer(r.duration_days)} j</td><td>${r.nature}<br><small>${r.type}</small></td>
    <td>${r.traffic||'—'}${r.parking&&r.parking!=='None'?`<br><small>Stationnement : ${r.parking}</small>`:''}</td>
   </tr>`).join('');
 }
 search?.addEventListener('input',renderWorks);renderWorks();fillAreas()
})();


// ---------------- OUTILS DE DÉCISION : COMPARAISON ET INDICE ----------------
(function(){
 const I=window.IRIS_MONTPELLIER;
 const indicatorConfig={
  registered:{label:'Inscrits / population',type:'number'},
  medianAge:{label:'Âge médian',type:'age'},
  pct_femmes:{label:'Femmes',type:'pct'},
  pct_18_24:{label:'18–24 ans',type:'pct'},
  pct_65_plus:{label:'65 ans et plus',type:'pct'},
  pct_chomage:{label:'Chômage des 15–64 ans',type:'pct'},
  pct_familles_monoparentales:{label:'Familles monoparentales',type:'pct'},
  pct_menages_pauvres:{label:'Ménages pauvres',type:'pct'},
  pct_superieur:{label:'Diplômés du supérieur',type:'pct'},
  pct_sans_diplome:{label:'Sans diplôme',type:'pct'},
  pct_cadres:{label:'Cadres',type:'pct'},
  pct_employes:{label:'Employés',type:'pct'},
  pct_ouvriers:{label:'Ouvriers',type:'pct'},
  pct_proprietaires:{label:'Propriétaires',type:'pct'},
  pct_logements_sociaux:{label:'Logements sociaux',type:'pct'},
  niveau_vie:{label:'Niveau de vie territorial',type:'money'}
 };
 const compareKeys=['registered','medianAge','pct_18_24','pct_65_plus','pct_chomage','pct_familles_monoparentales','pct_menages_pauvres','pct_superieur','pct_sans_diplome','pct_cadres','pct_employes','pct_ouvriers','pct_proprietaires','pct_logements_sociaux','niveau_vie','prix_m2_median_global','evolution_prix_2021_2025_pct','osm_commerces_pour_1000_hab','temps_marche_estime_alimentation_min'];

 function bureauDecisionRows(){
  return Object.entries(S?.bureaux||{}).map(([id,s])=>{
   const d=D?.bureaux?.[id]||{};
   const registered=Number(d.registered||s.nb_electeurs||0);
   const ageSum=keys=>keys.reduce((sum,k)=>sum+Number(d.ages?.[k]||0),0);
   return {
    id:String(id),name:`Bureau ${id}`,registered,
    medianAge:Number(d.medianAge),
    pct_femmes:Number(d.womenPct),
    pct_18_24:registered?100*ageSum(['18–19','20–24'])/registered:null,
    pct_65_plus:registered?100*ageSum(['65–69','70–74','75–79','80–84','85+'])/registered:null,
    ...s
   };
  });
 }
 function irisDecisionRows(){
  return (I?.features||[]).map(f=>{
   const p=f.properties||{};
   return {id:String(p.code_iris),name:p.nom_iris||p.nom||String(p.code_iris),registered:Number(p.population),medianAge:null,...p};
  });
 }
 function rowsFor(level){return level==='iris'?irisDecisionRows():bureauDecisionRows()}
 function formatValue(value,type){
  if(!Number.isFinite(Number(value)))return '—';
  if(type==='pct')return Number(value).toLocaleString('fr-FR',{maximumFractionDigits:1})+' %';
  if(type==='money')return Number(value).toLocaleString('fr-FR',{maximumFractionDigits:0})+' €';
  if(type==='age')return Number(value).toLocaleString('fr-FR',{maximumFractionDigits:1})+' ans';
  return Number(value).toLocaleString('fr-FR',{maximumFractionDigits:0});
 }
 function medianValue(values){
  const a=values.filter(Number.isFinite).sort((x,y)=>x-y);
  if(!a.length)return null;
  const m=Math.floor(a.length/2);
  return a.length%2?a[m]:(a[m-1]+a[m])/2;
 }

 const compareLevel=document.getElementById('territoryCompareLevel');
 const compareA=document.getElementById('territoryCompareA');
 const compareB=document.getElementById('territoryCompareB');
 const compareSummary=document.getElementById('territoryCompareSummary');
 const compareTable=document.getElementById('territoryCompareTable');

 function fillCompareSelectors(){
  const rows=rowsFor(compareLevel.value).sort((a,b)=>a.name.localeCompare(b.name,'fr',{numeric:true}));
  const oldA=compareA.value,oldB=compareB.value;
  const opts=rows.map(r=>`<option value="${r.id}">${r.name}</option>`).join('');
  compareA.innerHTML=opts;compareB.innerHTML=opts;
  compareA.value=rows.some(r=>r.id===oldA)?oldA:(rows[0]?.id||'');
  compareB.value=rows.some(r=>r.id===oldB)?oldB:(rows[1]?.id||rows[0]?.id||'');
  renderComparison();
 }
 function comparisonSentence(a,b,rows){
  const candidates=compareKeys.map(key=>{
   const av=Number(a[key]),bv=Number(b[key]);
   if(!Number.isFinite(av)||!Number.isFinite(bv)||av===bv)return null;
   const values=rows.map(r=>Number(r[key])).filter(Number.isFinite);
   const range=Math.max(...values)-Math.min(...values);
   return {key,av,bv,score:range?Math.abs(av-bv)/range:0};
  }).filter(Boolean).sort((x,y)=>y.score-x.score).slice(0,4);
  if(!candidates.length)return 'Les données disponibles ne permettent pas de distinguer clairement ces deux territoires.';
  return candidates.map(c=>{
   const label=indicatorConfig[c.key].label.toLowerCase();
   return `${c.av>c.bv?a.name:b.name} présente davantage de ${label}`;
  }).join(' ; ')+'.';
 }
 function renderComparison(){
  const rows=rowsFor(compareLevel.value);
  const a=rows.find(r=>r.id===compareA.value),b=rows.find(r=>r.id===compareB.value);
  if(!a||!b)return;
  compareSummary.innerHTML=`
   <div class="compare-name-card"><span>Premier territoire</span><strong>${a.name}</strong></div><div class="compare-versus">comparé à</div><div class="compare-name-card"><span>Second territoire</span><strong>${b.name}</strong></div>
   <p>${comparisonSentence(a,b,rows)}</p>`;
  compareTable.innerHTML=`<div class="compare-table-head"><span>Indicateur et référence montpelliéraine</span><span>${a.name}</span><span>Différence</span><span>${b.name}</span></div>`+
   compareKeys.filter(k=>Number.isFinite(Number(a[k]))||Number.isFinite(Number(b[k]))).map(key=>{
    const cfg=indicatorConfig[key],av=Number(a[key]),bv=Number(b[key]);
    const delta=Number.isFinite(av)&&Number.isFinite(bv)?av-bv:null;
    const deltaText=delta==null?'—':(delta>0?'+':'')+formatValue(delta,cfg.type);
    const med=medianValue(rows.map(r=>Number(r[key])));
    return `<div class="compare-table-row">
      <span><b>${cfg.label}</b><small>Médiane : ${formatValue(med,cfg.type)}</small></span>
      <span class="${Number.isFinite(av)&&av>med?'above':'below'}">${formatValue(av,cfg.type)}</span>
      <span class="${delta>0?'positive':delta<0?'negative':''}">${deltaText}</span>
      <span class="${Number.isFinite(bv)&&bv>med?'above':'below'}">${formatValue(bv,cfg.type)}</span>
    </div>`;
   }).join('');
 }
 compareLevel?.addEventListener('change',fillCompareSelectors);
 compareA?.addEventListener('change',renderComparison);
 compareB?.addEventListener('change',renderComparison);
 fillCompareSelectors();

 const indexLevel=document.getElementById('customIndexLevel');
 const indexPreset=document.getElementById('customIndexPreset');
 const indexCriteria=document.getElementById('customIndexCriteria');
 const indexRanking=document.getElementById('customIndexRanking');
 const indexArea=document.getElementById('customIndexArea');
 const indexDetail=document.getElementById('customIndexDetail');
 const indexReset=document.getElementById('customIndexReset');

 const indexChoices={
  pct_chomage:{label:'Je préfère un chômage plus faible',direction:-1},
  pct_menages_pauvres:{label:'Je préfère moins de ménages en situation de pauvreté',direction:-1},
  pct_familles_monoparentales:{label:'Je cherche les territoires comptant davantage de familles monoparentales',direction:1},
  pct_18_24:{label:'Je cherche une population plus jeune',direction:1},
  pct_65_plus:{label:'Je cherche une population plus âgée',direction:1},
  pct_superieur:{label:'Je préfère davantage de diplômés du supérieur',direction:1},
  pct_sans_diplome:{label:'Je cherche les territoires où les besoins éducatifs sont plus forts',direction:1},
  pct_cadres:{label:'Je préfère davantage de cadres',direction:1},
  pct_employes:{label:'Je cherche davantage d’employés',direction:1},
  pct_ouvriers:{label:'Je cherche davantage d’ouvriers',direction:1},
  pct_proprietaires:{label:'Je préfère davantage de propriétaires',direction:1},
  pct_logements_sociaux:{label:'Je préfère davantage de logements sociaux',direction:1}
 };
 const indexKeys=Object.keys(indexChoices);
 const presets={
  daily:{pct_chomage:2,pct_menages_pauvres:1,pct_familles_monoparentales:0,pct_18_24:1,pct_65_plus:0,pct_superieur:2,pct_sans_diplome:0,pct_cadres:1,pct_employes:0,pct_ouvriers:0,pct_proprietaires:1,pct_logements_sociaux:1},
  affordable:{pct_chomage:1,pct_menages_pauvres:1,pct_familles_monoparentales:0,pct_18_24:0,pct_65_plus:0,pct_superieur:0,pct_sans_diplome:0,pct_cadres:0,pct_employes:0,pct_ouvriers:0,pct_proprietaires:0,pct_logements_sociaux:3},
  dynamic:{pct_chomage:3,pct_menages_pauvres:1,pct_familles_monoparentales:0,pct_18_24:2,pct_65_plus:0,pct_superieur:3,pct_sans_diplome:0,pct_cadres:2,pct_employes:1,pct_ouvriers:0,pct_proprietaires:0,pct_logements_sociaux:0},
  mobilisation:{pct_chomage:3,pct_menages_pauvres:3,pct_familles_monoparentales:2,pct_18_24:2,pct_65_plus:0,pct_superieur:1,pct_sans_diplome:1,pct_cadres:0,pct_employes:1,pct_ouvriers:1,pct_proprietaires:0,pct_logements_sociaux:1},
  custom:{}
 };
 let indexSettings={};
 let currentScored=[];
 const importanceLabels=['Ignoré','Peu important','Important','Très important'];
 function applyPreset(name){
  const base=presets[name]||presets.daily;
  indexSettings={};
  indexKeys.forEach(k=>indexSettings[k]={weight:Number(base[k]||0),direction:indexChoices[k].direction});
  renderCriteria();calculateIndex();
 }
 function renderCriteria(){
  indexCriteria.innerHTML=indexKeys.map(key=>{
   const s=indexSettings[key]||{weight:0,direction:indexChoices[key].direction};
   const rawLabel=indicatorConfig[key]?.label||key;
   return `<div class="index-criterion ${s.weight?'active':''}" data-key="${key}">
    <div class="index-criterion-head"><div><b>${indexChoices[key].label}</b><small>Donnée utilisée : ${rawLabel}</small></div><span class="importance-badge level-${s.weight}">${importanceLabels[s.weight]}</span></div>
    <label class="importance-select-label">Importance
      <select class="index-importance"><option value="0">Ignoré</option><option value="1">Peu important</option><option value="2">Important</option><option value="3">Très important</option></select>
    </label>
   </div>`;
  }).join('');
  indexCriteria.querySelectorAll('.index-criterion').forEach(box=>{
   const key=box.dataset.key,select=box.querySelector('.index-importance');
   select.value=String(indexSettings[key].weight);
   select.addEventListener('change',()=>{
    indexSettings[key].weight=Number(select.value);indexPreset.value='custom';renderCriteria();calculateIndex();
   });
  });
 }
 function normalize(value,min,max,direction){
  if(!Number.isFinite(value)||!Number.isFinite(min)||!Number.isFinite(max)||max===min)return null;
  const n=100*(value-min)/(max-min);return direction===-1?100-n:n;
 }
 function qualitative(norm){return norm>=80?'Très favorable':norm>=60?'Favorable':norm>=40?'Intermédiaire':norm>=20?'Défavorable':'Très défavorable'}
 function calculateIndex(){
  const rows=rowsFor(indexLevel.value);const stats={};
  indexKeys.forEach(k=>{const vals=rows.map(r=>Number(r[k])).filter(Number.isFinite).sort((a,b)=>a-b);stats[k]={min:vals[0],max:vals[vals.length-1],median:medianValue(vals)}});
  currentScored=rows.map(row=>{let total=0,weights=0;const contributions=[];
   indexKeys.forEach(key=>{const setting=indexSettings[key]||{weight:0,direction:indexChoices[key].direction};if(!setting.weight)return;
    const value=Number(row[key]),stat=stats[key],norm=normalize(value,stat.min,stat.max,setting.direction);if(norm==null)return;
    total+=norm*setting.weight;weights+=setting.weight;contributions.push({key,value,norm,weight:setting.weight,median:stat.median,direction:setting.direction});
   });return {...row,indexScore:weights?total/weights:null,contributions};
  }).filter(r=>Number.isFinite(r.indexScore)).sort((a,b)=>b.indexScore-a.indexScore);
  currentScored.forEach((r,i)=>r.indexRank=i+1);renderIndexRanking(currentScored);fillIndexAreas(currentScored);renderIndexDetail(currentScored);
 }
 function renderIndexRanking(scored){
  if(!scored.length){indexRanking.innerHTML='<p class="index-empty">Choisissez au moins une priorité.</p>';return}
  indexRanking.innerHTML=scored.slice(0,15).map(r=>`<button type="button" data-id="${r.id}"><span class="rank-number">${r.indexRank}</span><span class="rank-name"><b>${r.name}</b><small>${r.contributions.length} priorité${r.contributions.length>1?'s':''} prise${r.contributions.length>1?'s':''} en compte</small></span><span class="rank-score"><b>${r.indexScore.toLocaleString('fr-FR',{maximumFractionDigits:0})}</b><small>/100</small></span></button>`).join('');
  indexRanking.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{indexArea.value=b.dataset.id;renderIndexDetail(scored)}));
 }
 function fillIndexAreas(scored){
  const old=indexArea.value;indexArea.innerHTML='<option value="all">Vue d’ensemble du classement</option>'+scored.map(r=>`<option value="${r.id}">${r.indexRank}e — ${r.name}</option>`).join('');
  indexArea.value=(old==='all'||scored.some(r=>r.id===old))?old:'all';
 }
 function summarySentence(row){
  const sorted=[...row.contributions].sort((a,b)=>(b.norm*b.weight)-(a.norm*a.weight));
  const best=sorted[0],worst=[...row.contributions].sort((a,b)=>a.norm-b.norm)[0];
  if(!best)return 'Aucune priorité active.';
  let text=`${row.name} est surtout favorisé par « ${indexChoices[best.key].label.toLowerCase()} ».`;
  if(worst&&worst.norm<45&&worst.key!==best.key)text+=` Son principal point faible est « ${indexChoices[worst.key].label.toLowerCase()} ».`;
  return text;
 }
 function renderIndexDetail(scored){
  if(!scored.length){indexDetail.innerHTML='<div class="index-empty">Activez au moins un critère pour produire un classement.</div>';return}
  if(indexArea.value==='all'){
   const active=indexKeys.filter(k=>(indexSettings[k]?.weight||0)>0);const top=scored.slice(0,3);
   indexDetail.innerHTML=`<div class="index-score-card global"><span>Vue d’ensemble</span><strong>${scored.length} territoires classés</strong><small>${active.length} priorité${active.length>1?'s':''} active${active.length>1?'s':''}</small></div><div class="index-global-top"><h4>Les trois meilleures correspondances</h4>${top.map(r=>`<div><b>${r.indexRank}. ${r.name}</b><span>${r.indexScore.toLocaleString('fr-FR',{maximumFractionDigits:0})}/100</span></div>`).join('')}</div><div class="index-explanation"><b>Ce que signifie ce classement</b><p>Les territoires en tête ressemblent le plus au profil que vous avez défini. Ouvrez un territoire pour voir précisément ses points forts et ses points faibles.</p></div>`;return;
  }
  const row=scored.find(r=>r.id===indexArea.value)||scored[0];indexArea.value=row.id;
  const items=[...row.contributions].sort((a,b)=>b.weight-a.weight||b.norm-a.norm);
  indexDetail.innerHTML=`<div class="index-score-card"><span>Correspondance avec vos priorités</span><strong>${row.indexScore.toLocaleString('fr-FR',{maximumFractionDigits:0})}/100</strong><small>${row.indexRank}e sur ${scored.length}</small></div><div class="index-verdict"><b>Pourquoi ce classement ?</b><p>${summarySentence(row)}</p></div><div class="index-contributions">${items.map(c=>{
   const cfg=indicatorConfig[c.key]||{label:c.key,type:'pct'};const delta=c.value-c.median;const deltaText=(delta>=0?'+':'')+formatValue(delta,cfg.type);
   return `<div class="index-factor"><div><b>${indexChoices[c.key].label}</b><small>${cfg.label} : ${formatValue(c.value,cfg.type)} · médiane Montpellier : ${formatValue(c.median,cfg.type)}</small></div><div class="factor-result ${c.norm>=60?'good':c.norm<40?'bad':'neutral'}"><strong>${qualitative(c.norm)}</strong><small>${deltaText} par rapport à la médiane</small></div></div>`;
  }).join('')}</div>`;
 }
 indexPreset?.addEventListener('change',()=>{if(indexPreset.value!=='custom')applyPreset(indexPreset.value)});
 indexLevel?.addEventListener('change',calculateIndex);indexArea?.addEventListener('change',()=>renderIndexDetail(currentScored));
 indexReset?.addEventListener('click',()=>{const p=indexPreset.value==='custom'?'daily':indexPreset.value;indexPreset.value=p;applyPreset(p)});
 applyPreset('daily');
})();


// ---------------- FICHE TERRITORIALE COMPLÈTE ----------------
(function(){
  const modal=document.getElementById('territoryDataModal');
  const title=document.getElementById('territoryDataTitle');
  const content=document.getElementById('territoryDataContent');
  const close=document.getElementById('territoryDataClose');

  const labels={
    registered:'Inscrits / population',
    women:'Femmes (nombre)',men:'Hommes (nombre)',
    womenPct:'Femmes',menPct:'Hommes',medianAge:'Âge médian',
    niveau_vie:'Niveau de vie territorial',
    pct_menages_pauvres:'Ménages pauvres',
    pct_chomage:'Chômage des 15–64 ans',
    pct_familles_monoparentales:'Familles monoparentales',
    pct_proprietaires:'Propriétaires',
    pct_menages_imposes:'Ménages fiscaux imposés',
    pct_impots_revenu:'Part des impôts dans le revenu disponible',
    pct_logements_sociaux:'Logements sociaux',
    pct_habitat_collectif:'Habitat collectif',
    pct_maisons:'Maisons',
    surface_moyenne:'Surface moyenne',
    pct_superieur:'Diplômés du supérieur',
    pct_sans_diplome:'Sans diplôme',
    pct_cadres:'Cadres et professions intellectuelles supérieures',
    pct_prof_intermediaires:'Professions intermédiaires',
    pct_employes:'Employés',
    pct_ouvriers:'Ouvriers',
    pct_retraites:'Retraités',
    pct_femmes:'Femmes',
    pct_18_24:'18–24 ans',
    pct_25_39:'25–39 ans',
    pct_65_plus:'65 ans et plus',
    pct_geocodage_exact:'Géocodage exact',
    pct_geocodage_voie:'Rattachement à la voie',
    pct_non_geocode:'Non géocodés',
    pct_couverture_filosofi:'Couverture Filosofi',
    pct_couverture_iris:'Couverture IRIS',
    nb_electeurs:'Électeurs pondérés',
    population:'Population',
    code_iris:'Code IRIS',
    nom_iris:'Nom IRIS',
    type_iris:'Type IRIS'
  };

  const pctKeys=new Set(Object.keys(labels).filter(k=>k.startsWith('pct_')).concat(['womenPct','menPct']));
  const moneyKeys=new Set(['niveau_vie']);
  const areaKeys=new Set(['surface_moyenne']);

  function prettyKey(key){
    return labels[key]||String(key).replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  }
  function prettyValue(key,value){
    if(value===null||value===undefined||value==='')return '—';
    if(typeof value==='object')return null;
    if(typeof value==='number'){
      if(pctKeys.has(key))return value.toLocaleString('fr-FR',{maximumFractionDigits:1})+' %';
      if(moneyKeys.has(key))return value.toLocaleString('fr-FR',{maximumFractionDigits:0})+' €';
      if(areaKeys.has(key))return value.toLocaleString('fr-FR',{maximumFractionDigits:1})+' m²';
      if(key==='medianAge')return value.toLocaleString('fr-FR',{maximumFractionDigits:1})+' ans';
      return value.toLocaleString('fr-FR',{maximumFractionDigits:1});
    }
    return String(value);
  }
  function section(titleText, rows){
    const valid=rows.filter(([,v])=>v!==null&&v!==undefined&&typeof v!=='object');
    if(!valid.length)return '';
    return `<section class="territory-data-section"><h3>${titleText}</h3><div class="territory-data-grid">${
      valid.map(([k,v])=>`<div class="territory-data-item"><span>${prettyKey(k)}</span><strong>${prettyValue(k,v)}</strong></div>`).join('')
    }</div></section>`;
  }
  function ageSection(d){
    if(!d?.agePct)return '';
    return `<section class="territory-data-section"><h3>Tranches d’âge</h3><div class="territory-age-list">${
      Object.entries(d.agePct).map(([k,v])=>`<div><span>${k}</span><i><b style="width:${Math.max(0,Math.min(100,Number(v)||0))}%"></b></i><strong>${Number(v||0).toLocaleString('fr-FR',{maximumFractionDigits:1})} %</strong></div>`).join('')
    }</div></section>`;
  }
  function openBureau(id){
    const d=D?.bureaux?.[String(id)];
    const s=S?.bureaux?.[String(id)];
    if(!d)return;
    title.textContent=`Bureau ${id}`;
    content.innerHTML=
      section('Démographie',[
        ['registered',d.registered],['women',d.women],['men',d.men],
        ['womenPct',d.womenPct],['menPct',d.menPct],['medianAge',d.medianAge]
      ])+
      ageSection(d)+
      section('Économie et logement',[
        ['niveau_vie',s?.niveau_vie],['pct_menages_pauvres',s?.pct_menages_pauvres],
        ['pct_chomage',s?.pct_chomage],['pct_familles_monoparentales',s?.pct_familles_monoparentales],
        ['pct_menages_imposes',s?.pct_menages_imposes],['pct_impots_revenu',s?.pct_impots_revenu],
        ['pct_proprietaires',s?.pct_proprietaires],['pct_logements_sociaux',s?.pct_logements_sociaux],
        ['pct_habitat_collectif',s?.pct_habitat_collectif],['pct_maisons',s?.pct_maisons],
        ['surface_moyenne',s?.surface_moyenne]
      ])+
      section('Diplômes et catégories socioprofessionnelles',[
        ['pct_superieur',s?.pct_superieur],['pct_sans_diplome',s?.pct_sans_diplome],
        ['pct_cadres',s?.pct_cadres],['pct_prof_intermediaires',s?.pct_prof_intermediaires],
        ['pct_employes',s?.pct_employes],['pct_ouvriers',s?.pct_ouvriers]
      ])+
      section('Participation électorale',[
        ['Moyenne pondérée',window.PARTICIPATION_DATA?.bureaux?.[String(id)]?.weighted_turnout],
        ['Participation récente 2024',window.PARTICIPATION_DATA?.bureaux?.[String(id)]?.recent_turnout],
        ['Réserve de mobilisation',window.PARTICIPATION_DATA?.bureaux?.[String(id)]?.reserve_score],
        ['Variabilité',window.PARTICIPATION_DATA?.bureaux?.[String(id)]?.consistency_sd]
      ])+
      section('Qualité et méthode',[
        ['nb_electeurs',s?.nb_electeurs],['pct_geocodage_exact',s?.pct_geocodage_exact],
        ['pct_geocodage_voie',s?.pct_geocodage_voie],['pct_non_geocode',s?.pct_non_geocode],
        ['pct_couverture_filosofi',s?.pct_couverture_filosofi],['pct_couverture_iris',s?.pct_couverture_iris]
      ]);
    show();
  }
  function openIris(id){
    const feature=(window.IRIS_MONTPELLIER?.features||[]).find(f=>String(f.properties?.code_iris)===String(id));
    const base=feature?.properties;
    if(!base)return;
    const fiscal=Array.isArray(S?.iris)?(S.iris.find(x=>String(x.code_iris||x.CODE_IRIS_STD)===String(id))||{}):(S?.iris?.[String(id)]||{});
    const p={...base,...fiscal};
    title.textContent=p.nom_iris||`IRIS ${id}`;
    const meta=['code_iris','nom_iris','type_iris','population'];
    const demographics=['pct_femmes','pct_18_24','pct_25_39','pct_65_plus'];
    const socio=['pct_chomage','pct_familles_monoparentales','pct_superieur','pct_sans_diplome','pct_cadres','pct_prof_intermediaires','pct_employes','pct_ouvriers','pct_retraites'];
    const used=new Set([...meta,...demographics,...socio]);
    const other=Object.entries(p).filter(([k,v])=>!used.has(k)&&typeof v!=='object');
    content.innerHTML=
      section('Identification',meta.map(k=>[k,p[k]]))+
      section('Démographie',demographics.map(k=>[k,p[k]]))+
      section('Situation sociale et professionnelle',socio.map(k=>[k,p[k]]))+
      section('Participation électorale estimée',[
        ['Moyenne pondérée',window.PARTICIPATION_DATA?.iris?.[String(id)]?.weighted_turnout],
        ['Participation récente 2024',window.PARTICIPATION_DATA?.iris?.[String(id)]?.recent_turnout],
        ['Réserve de mobilisation',window.PARTICIPATION_DATA?.iris?.[String(id)]?.reserve_score]
      ])+
      section('Autres données disponibles',other);
    show();
  }
  function show(){
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
  }
  function hide(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
  }

  document.addEventListener('click',e=>{
    const btn=e.target.closest('.open-full-data');
    if(!btn)return;
    btn.dataset.kind==='bureau'?openBureau(btn.dataset.id):openIris(btn.dataset.id);
  });
  close?.addEventListener('click',hide);
  modal?.addEventListener('click',e=>{if(e.target===modal)hide()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});
})();


// ---------------- PARTICIPATION ÉLECTORALE ----------------
(function(){
 const P=window.PARTICIPATION_DATA;
 if(!P)return;
 const bureauSelect=document.getElementById('participationBureau');
 const levelSelect=document.getElementById('participationLevel');
 const weightsBox=document.getElementById('participationWeights');
 const cards=document.getElementById('participationGlobalCards');
 const summary=document.getElementById('participationSelectedSummary');
 const rankingBody=document.getElementById('participationRankingBody');
 const electionBody=document.getElementById('participationElectionBody');
 const search=document.getElementById('participationSearch');
 const reset=document.getElementById('participationResetWeights');
 const recommended=Object.fromEntries(P.elections.map(e=>[e.id,e.weight]));
 let weights={...recommended};
 let currentScores=[];

 const pctv=v=>Number(v).toLocaleString('fr-FR',{maximumFractionDigits:1})+' %';
 const nfmt=v=>Number(v).toLocaleString('fr-FR',{maximumFractionDigits:0});

 function dataset(){return levelSelect?.value==='iris'?(P.iris||{}):P.bureaux}
 function territoryLabel(id){const d=dataset()[String(id)];return levelSelect?.value==='iris'?(d?.name||`IRIS ${id}`):`Bureau ${id}`}
 function recordsFor(id){return dataset()[String(id)]?.records||[]}
 function globalRecordSeries(){
  return P.elections.map(e=>{
   const vals=Object.values(dataset()).map(d=>(d.records||[]).find(x=>x.election_id===e.id)?.turnout).filter(Number.isFinite);
   return vals.length?{...e,turnout:vals.reduce((a,b)=>a+b,0)/vals.length}:null;
  }).filter(Boolean);
 }
 function compute(){
  currentScores=Object.entries(dataset()).map(([id,b])=>{
   const rec=recordsFor(id).filter(r=>Number.isFinite(Number(r.turnout))&&Number(weights[r.election_id])>0);
   const w=rec.reduce((s,r)=>s+Number(weights[r.election_id]),0);
   const weighted=w?rec.reduce((s,r)=>s+r.turnout*Number(weights[r.election_id]),0)/w:null;
   const recent=rec.filter(r=>r.date.startsWith('2024'));
   const rw=recent.reduce((s,r)=>s+Number(weights[r.election_id]),0);
   const recentTurnout=rw?recent.reduce((s,r)=>s+r.turnout*Number(weights[r.election_id]),0)/rw:null;
   const minTurnout=rec.length?Math.min(...rec.map(x=>x.turnout)):null;
   const maxTurnout=rec.length?Math.max(...rec.map(x=>x.turnout)):null;
   const amplitude=minTurnout==null?null:maxTurnout-minTurnout;
   return {id,weighted,recentTurnout,reserve:weighted==null?null:100-weighted,amplitude,minTurnout,maxTurnout,count:rec.length,records:rec};
  }).filter(r=>r.weighted!=null).sort((a,b)=>b.weighted-a.weighted);
  currentScores.forEach((r,i)=>r.rank=i+1);
  renderCards();renderRanking();renderSelected();
  window.dispatchEvent(new CustomEvent('participation-weights-updated',{detail:{weights,scores:currentScores}}));
 }
 function renderWeights(){
  weightsBox.innerHTML=P.elections.map(e=>`<div class="participation-weight">
    <div><b>${e.label}</b><small>Poids recommandé : ${recommended[e.id]}</small></div>
    <input type="range" min="0" max="5" step="0.125" value="${weights[e.id]}" data-id="${e.id}">
    <output>${weights[e.id]}</output>
  </div>`).join('');
  weightsBox.querySelectorAll('input').forEach(i=>i.addEventListener('input',()=>{
   weights[i.dataset.id]=Number(i.value);
   i.closest('.participation-weight').querySelector('output').textContent=Number(i.value).toLocaleString('fr-FR',{maximumFractionDigits:3});
   compute();
  }));
 }
 function renderCards(){
  const vals=currentScores.map(r=>r.weighted).sort((a,b)=>a-b);
  const med=vals.length?(vals[Math.floor((vals.length-1)/2)]+vals[Math.ceil((vals.length-1)/2)])/2:0;
  const avg=vals.reduce((a,b)=>a+b,0)/(vals.length||1);
  const low=currentScores[currentScores.length-1],high=currentScores[0];
  cards.innerHTML=[
   ['Moyenne des bureaux',pctv(avg)],['Médiane',pctv(med)],
   ['Territoire le plus mobilisé',high?`${territoryLabel(high.id)} · ${pctv(high.weighted)}`:'—'],
   ['Plus forte réserve',low?`${territoryLabel(low.id)} · ${pctv(low.reserve)}`:'—']
  ].map(x=>`<div class="card"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('');
 }
 function renderRanking(){
  const q=(search?.value||'').trim().toLowerCase();
  rankingBody.innerHTML=currentScores.filter(r=>!q||String(r.id).includes(q)||territoryLabel(r.id).toLowerCase().includes(q)).map(r=>`<tr data-id="${r.id}">
   <td>${r.rank}</td><td><b>${territoryLabel(r.id)}</b></td><td>${pctv(r.weighted)}</td>
   <td>${r.recentTurnout==null?'—':pctv(r.recentTurnout)}</td><td>${pctv(r.reserve)}</td>
   <td>${r.amplitude==null?'—':r.amplitude.toLocaleString('fr-FR',{maximumFractionDigits:1})+' pts'}</td><td>${r.count}/9</td>
  </tr>`).join('');
  rankingBody.querySelectorAll('tr').forEach(tr=>tr.addEventListener('click',()=>{bureauSelect.value=tr.dataset.id;renderSelected()}));
 }
 function renderSelected(){
  const id=bureauSelect.value||'all';
  const profileTitle=document.getElementById('participationProfileTitle');
  if(id==='all'){
   profileTitle.textContent=levelSelect.value==='iris'?'Vue globale des IRIS':'Vue globale des bureaux';
   const vals=currentScores.map(x=>x.weighted).sort((a,b)=>a-b);
   const avg=vals.reduce((a,b)=>a+b,0)/(vals.length||1);
   const med=vals.length?(vals[Math.floor((vals.length-1)/2)]+vals[Math.ceil((vals.length-1)/2)])/2:null;
   const globalSeries=globalRecordSeries();
   const min=globalSeries.length?Math.min(...globalSeries.map(x=>x.turnout)):null;
   const max=globalSeries.length?Math.max(...globalSeries.map(x=>x.turnout)):null;
   summary.innerHTML=`<div class="participation-summary-grid">
    <div><span>Participation moyenne pondérée</span><strong>${pctv(avg)}</strong></div>
    <div><span>Médiane des territoires</span><strong>${med==null?'—':pctv(med)}</strong></div>
    <div><span>Nombre de territoires classés</span><strong>${currentScores.length}</strong></div>
    <div><span>Territoire le plus mobilisé</span><strong>${currentScores[0]?territoryLabel(currentScores[0].id):'—'}</strong></div>
    <div><span>Territoire avec la plus forte réserve</span><strong>${currentScores.at(-1)?territoryLabel(currentScores.at(-1).id):'—'}</strong></div>
    <div><span>Écart de participation global</span><strong>${min==null?'—':(max-min).toLocaleString('fr-FR',{maximumFractionDigits:1})+' pts'}</strong><small>${min==null?'':`De ${pctv(min)} à ${pctv(max)}`}</small></div>
   </div>`;
   electionBody.innerHTML=globalSeries.map(e=>`<tr><td>${e.label}</td><td>${e.date.split('-').reverse().join('/')}</td><td>${weights[e.id]}</td><td>—</td><td>—</td><td>${pctv(e.turnout)}</td><td>—</td></tr>`).join('');
   drawChart({records:globalSeries,id:'all'});return;
  }
  const r=currentScores.find(x=>x.id===id); if(!r)return;
  profileTitle.textContent=`Profil de ${territoryLabel(id)}`;
  const category=r.weighted>=65?'Très mobilisé':r.weighted>=58?'Mobilisé':r.weighted>=50?'Intermédiaire':r.weighted>=42?'Peu mobilisé':'Forte réserve';
  summary.innerHTML=`<div class="participation-summary-grid">
   <div><span>Participation moyenne pondérée</span><strong>${pctv(r.weighted)}</strong></div>
   <div><span>Rang de participation</span><strong>${r.rank}e sur ${currentScores.length}</strong><small>Rang 1 = participation la plus élevée</small></div>
   <div><span>Participation moyenne en 2024</span><strong>${r.recentTurnout==null?'—':pctv(r.recentTurnout)}</strong></div>
   <div><span>Réserve de mobilisation</span><strong>${pctv(r.reserve)}</strong><small>100 % moins la participation pondérée</small></div>
   <div><span>Profil de mobilisation</span><strong>${category}</strong></div>
   <div><span>Écart de participation</span><strong>${r.amplitude==null?'—':r.amplitude.toLocaleString('fr-FR',{maximumFractionDigits:1})+' pts'}</strong><small>${r.minTurnout==null?'':`De ${pctv(r.minTurnout)} à ${pctv(r.maxTurnout)}`}</small></div>
   ${levelSelect.value==='iris'?'<div><span>Méthode</span><strong>Estimation spatiale</strong></div>':''}
  </div>`;
  electionBody.innerHTML=P.elections.map(e=>{const rec=recordsFor(id).find(x=>x.election_id===e.id);return `<tr><td>${e.label}</td><td>${e.date.split('-').reverse().join('/')}</td><td>${weights[e.id]}</td><td>${rec?nfmt(rec.registered):'—'}</td><td>${rec?nfmt(rec.voters):'—'}</td><td class="${rec?.turnout>=95?'participation-anomaly':''}">${rec?pctv(rec.turnout):'—'}</td><td>${rec?(rec.gap_city>=0?'+':'')+rec.gap_city.toLocaleString('fr-FR',{maximumFractionDigits:1})+' pts':'—'}</td></tr>`}).join('');
  drawChart(r);
 }
 function drawChart(r){
  const c=document.getElementById('participationChart'),box=c.parentElement,ratio=window.devicePixelRatio||1;
  const w=Math.max(620,box.clientWidth-20),h=320;c.width=w*ratio;c.height=h*ratio;c.style.width=w+'px';c.style.height=h+'px';
  const ctx=c.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);
  const rec=r.records||P.elections.map(e=>recordsFor(r.id).find(x=>x.election_id===e.id)).filter(Boolean);
  const pad={l:45,r:20,t:25,b:75},cw=w-pad.l-pad.r,ch=h-pad.t-pad.b;
  ctx.strokeStyle='#31495f';ctx.fillStyle='#8fa4b8';ctx.font='11px system-ui';
  [0,25,50,75,100].forEach(v=>{const y=pad.t+ch*(1-v/100);ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();ctx.fillText(v+' %',5,y+4)});
  ctx.strokeStyle='#f0a020';ctx.lineWidth=2;ctx.beginPath();
  rec.forEach((x,i)=>{const xx=pad.l+(rec.length===1?cw/2:i*cw/(rec.length-1)),yy=pad.t+ch*(1-x.turnout/100);i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)});
  ctx.stroke();
  rec.forEach((x,i)=>{const xx=pad.l+(rec.length===1?cw/2:i*cw/(rec.length-1)),yy=pad.t+ch*(1-x.turnout/100);ctx.fillStyle='#f0a020';ctx.beginPath();ctx.arc(xx,yy,4,0,Math.PI*2);ctx.fill();ctx.save();ctx.translate(xx,h-12);ctx.rotate(-.65);ctx.fillStyle='#9db0c3';ctx.fillText(x.label.replace(' — ',' '),0,0);ctx.restore()});
 }
 bureauSelect.innerHTML='<option value="all">Ensemble de Montpellier</option>'+Object.keys(P.bureaux).map(id=>`<option value="${id}">Bureau ${id}</option>`).join('');
 bureauSelect.addEventListener('change',renderSelected);levelSelect?.addEventListener('change',()=>{const data=dataset();bureauSelect.innerHTML='<option value="all">Ensemble de Montpellier</option>'+Object.keys(data).map(id=>`<option value="${id}">${territoryLabel(id)}</option>`).join('');compute()});search?.addEventListener('input',renderRanking);
 reset?.addEventListener('click',()=>{weights={...recommended};renderWeights();compute()});
 renderWeights();compute();
 window.PARTICIPATION_UI={getWeights:()=>({...weights}),getScores:()=>currentScores};
})();


// ---------------- RÉSULTATS ÉLECTORAUX ET EXPLICATION ----------------
(function(){
 const R=window.ELECTION_RESULTS;
 if(!R)return;
 const electionSel=document.getElementById('resultsElection');
 const levelSel=document.getElementById('resultsLevel');
 const partySel=document.getElementById('resultsParty');
 const areaSel=document.getElementById('resultsArea');
 const cards=document.getElementById('resultsCards');
 const territorySummary=document.getElementById('resultsTerritorySummary');
 const explanation=document.getElementById('resultsExplanation');
 const corrBox=document.getElementById('resultsCorrelations');
 const qualityBox=document.getElementById('resultsModelQuality');
 const contribBox=document.getElementById('resultsContributions');
 const rankingBody=document.getElementById('resultsRankingBody');
 const search=document.getElementById('resultsSearch');
 const modelStatus=document.getElementById('resultsModelStatus');
 const toggleCorr=document.getElementById('resultsToggleCorrelations');
 let showAllCorrelations=false;
 const fiscalInput=document.getElementById('fiscalCsvInput');
 const fiscalStatus=document.getElementById('fiscalImportStatus');
 let fiscalData={};
 try{fiscalData=JSON.parse(localStorage.getItem('filosofiFiscalIris2021')||'{}')}catch(e){fiscalData={}}

 function normalizeHeader(s){
  return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'');
 }
 function parseCsv(text){
  const first=text.split(/\r?\n/,1)[0]||'';
  const sep=(first.match(/;/g)||[]).length>=(first.match(/,/g)||[]).length?';':',';
  const lines=text.split(/\r?\n/).filter(Boolean);
  const headers=lines.shift().split(sep).map(x=>x.replace(/^"|"$/g,''));
  return lines.map(line=>{
   const cells=[];let cur='',q=false;
   for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(q&&line[i+1]==='"'){cur+='"';i++}else q=!q}else if(ch===sep&&!q){cells.push(cur);cur=''}else cur+=ch}
   cells.push(cur);
   return Object.fromEntries(headers.map((h,i)=>[h,cells[i]??'']));
  });
 }
 function numericValue(v){
  if(v===null||v===undefined||v==='')return null;
  const x=Number(String(v).replace(/\s/g,'').replace(',','.'));
  return Number.isFinite(x)?x:null;
 }
 function applyFiscalData(){
  if(!S)return;
  S.iris=S.iris||{};
  Object.entries(fiscalData).forEach(([code,v])=>{
   const target=Array.isArray(S.iris)?S.iris.find(x=>String(x.code_iris||x.CODE_IRIS_STD)===String(code)):(S.iris[code]||(S.iris[code]={code_iris:code}));
   if(target){target.pct_menages_imposes=v.pct_menages_imposes;target.pct_impots_revenu=v.pct_impots_revenu}
  });
  S.bureaux=S.bureaux||{};
  Object.entries(window.FISCAL_CROSSWALK||{}).forEach(([bid,parts])=>{
   const vals=parts.map(p=>({w:Number(p.share)||0,v:fiscalData[p.iris]})).filter(x=>x.v);
   if(!vals.length)return;
   const target=S.bureaux[bid]||(S.bureaux[bid]={bureau:Number(bid)});
   const weighted=key=>{const ok=vals.filter(x=>Number.isFinite(Number(x.v[key])));const sw=ok.reduce((s,x)=>s+x.w,0);return sw?ok.reduce((s,x)=>s+x.w*Number(x.v[key]),0)/sw:null};
   target.pct_menages_imposes=weighted('pct_menages_imposes');
   target.pct_impots_revenu=weighted('pct_impots_revenu');
  });
  if(fiscalStatus){
   const n=Object.keys(fiscalData).filter(k=>String(k).startsWith('34172')).length;
   fiscalStatus.textContent=n?`${n} IRIS montpelliérains chargés · indicateurs fiscaux actifs dans les corrélations et le modèle.`:'Aucune donnée fiscale montpelliéraine détectée.';
  }
 }
 async function importFiscalFiles(files){
  const merged={...fiscalData};
  for(const file of files){
   const rows=parseCsv(await file.text());
   if(!rows.length)continue;
   const keys=Object.keys(rows[0]),byNorm=Object.fromEntries(keys.map(k=>[normalizeHeader(k),k]));
   const codeKey=byNorm.CODGEO||byNorm.CODEIRIS||byNorm.IRIS;
   const imposedKey=byNorm.PMIMP||keys.find(k=>normalizeHeader(k).includes('PARTDESMENAGESIMPOSES'));
   const taxKey=byNorm.PIMPOT||keys.find(k=>normalizeHeader(k).includes('PARTDESIMPOTS'));
   if(!codeKey)continue;
   rows.forEach(r=>{
    const code=String(r[codeKey]||'').replace(/\.0$/,'').trim();
    if(!/^34172\d{4}$/.test(code))return;
    const cur=merged[code]||{};
    const imposed=imposedKey?numericValue(r[imposedKey]):null;
    const tax=taxKey?numericValue(r[taxKey]):null;
    if(imposed!==null)cur.pct_menages_imposes=imposed;
    if(tax!==null)cur.pct_impots_revenu=Math.abs(tax);
    merged[code]=cur;
   });
  }
  fiscalData=merged;
  localStorage.setItem('filosofiFiscalIris2021',JSON.stringify(fiscalData));
  applyFiscalData();
  document.getElementById('mapFrame')?.contentWindow?.postMessage({type:'fiscal-data-updated'},'*');
  fillAreas();render();
 }
 fiscalInput?.addEventListener('change',e=>importFiscalFiles([...e.target.files]));
 applyFiscalData();

 const indicators={
  pct_superieur:'Diplômés du supérieur',pct_sans_diplome:'Sans diplôme',
  pct_cadres:'Cadres',pct_prof_intermediaires:'Professions intermédiaires',
  pct_employes:'Employés',pct_ouvriers:'Ouvriers',pct_chomage:'Chômage',
  pct_menages_pauvres:'Ménages pauvres',pct_familles_monoparentales:'Familles monoparentales',
  pct_proprietaires:'Propriétaires',pct_logements_sociaux:'Logements sociaux',
  pct_18_24:'18–24 ans',pct_65_plus:'65 ans et plus',niveau_vie:'Niveau de vie',pct_menages_imposes:'Ménages fiscaux imposés',pct_impots_revenu:'Part des impôts dans le revenu disponible'
 };
 const defaultModel=['pct_superieur','pct_chomage','pct_18_24','pct_65_plus','pct_proprietaires','pct_logements_sociaux','pct_menages_imposes','pct_impots_revenu'];

 function election(){return R.elections.find(e=>e.id===electionSel.value)||R.elections[0]}
 function territorial(){
  const e=election();
  return e && R.territorial && Object.prototype.hasOwnProperty.call(R.territorial,e.id) ? R.territorial[e.id] : null;
 }
 function partyName(key){
  const t=territorial();
  return t?.parties?.[key]?.name||election()?.options?.find(o=>o.key===key)?.name||key;
 }
 function rows(){
  const t=territorial();if(!t)return [];
  const source=levelSel.value==='iris'?t.iris:t.bureaux;
  if(levelSel.value==='iris'){
   return Object.entries(source||{}).map(([id,res])=>{
    const f=(window.IRIS_MONTPELLIER?.features||[]).find(x=>String(x.properties?.code_iris)===String(id));
    const socioIris=(S?.iris?.[id]||S?.iris?.find?.(x=>String(x.code_iris)===String(id))||{});
    return {id,name:f?.properties?.nom_iris||socioIris.nom_iris||id,res,profile:{...(f?.properties||{}),...socioIris}};
   });
  }
  return Object.entries(source||{}).map(([id,res])=>{
   const d=D?.bureaux?.[id]||{},s=S?.bureaux?.[id]||{},registered=Number(d.registered||0);
   const ageSum=keys=>keys.reduce((a,k)=>a+Number(d.ages?.[k]||0),0);
   return {id,name:`Bureau ${id}`,res,profile:{...s,
    pct_18_24:registered?100*((d.ages?.['18–19']||0)+(d.ages?.['20–24']||0))/registered:null,
    pct_65_plus:registered?100*ageSum(['65–69','70–74','75–79','80–84','85+'])/registered:null
   }};
  });
 }
 function score(row){return Number(row.res?.parties?.[partySel.value]?.pct)}
 const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
 function sd(a){const m=mean(a);return a.length?Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/a.length):null}
 function corr(x,y){
  const p=x.map((v,i)=>[Number(v),Number(y[i])]).filter(q=>q.every(Number.isFinite));
  if(p.length<3)return null;
  const xs=p.map(q=>q[0]),ys=p.map(q=>q[1]),mx=mean(xs),my=mean(ys);
  const num=p.reduce((s,q)=>s+(q[0]-mx)*(q[1]-my),0);
  const den=Math.sqrt(p.reduce((s,q)=>s+(q[0]-mx)**2,0)*p.reduce((s,q)=>s+(q[1]-my)**2,0));
  return den?num/den:null;
 }
 function transpose(A){return A[0].map((_,i)=>A.map(r=>r[i]))}
 function matMul(A,B){return A.map(r=>B[0].map((_,j)=>r.reduce((s,v,i)=>s+v*B[i][j],0)))}
 function invert(A){
  const n=A.length,M=A.map((r,i)=>[...r,...Array.from({length:n},(_,j)=>i===j?1:0)]);
  for(let i=0;i<n;i++){
   let p=i;for(let k=i+1;k<n;k++)if(Math.abs(M[k][i])>Math.abs(M[p][i]))p=k;
   [M[i],M[p]]=[M[p],M[i]];if(Math.abs(M[i][i])<1e-9)return null;
   const q=M[i][i];for(let j=0;j<2*n;j++)M[i][j]/=q;
   for(let k=0;k<n;k++)if(k!==i){const f=M[k][i];for(let j=0;j<2*n;j++)M[k][j]-=f*M[i][j]}
  }
  return M.map(r=>r.slice(n));
 }
 function model(data){
  const validValue=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
  const keys=defaultModel.filter(k=>data.filter(r=>validValue(r.profile[k])&&Number.isFinite(score(r))).length>=Math.max(20,data.length*.7));
  const clean=data.filter(r=>Number.isFinite(score(r))&&keys.every(k=>validValue(r.profile[k])));
  if(clean.length<keys.length+5)return null;
  const y=clean.map(score),ym=mean(y),ys=sd(y)||1;
  const stats=Object.fromEntries(keys.map(k=>{const v=clean.map(r=>Number(r.profile[k]));return [k,{m:mean(v),s:sd(v)||1}]}));
  const X=clean.map(r=>[1,...keys.map(k=>(Number(r.profile[k])-stats[k].m)/stats[k].s)]);
  const yz=y.map(v=>[(v-ym)/ys]),Xt=transpose(X),XtX=matMul(Xt,X);
  for(let i=1;i<XtX.length;i++)XtX[i][i]+=.15;
  const inv=invert(XtX);if(!inv)return null;
  const beta=matMul(matMul(inv,Xt),yz).map(r=>r[0]);
  const pred=X.map(r=>ym+r.reduce((s,v,i)=>s+v*beta[i],0)*ys);
  const sse=y.reduce((s,v,i)=>s+(v-pred[i])**2,0),sst=y.reduce((s,v)=>s+(v-ym)**2,0);
  return {keys,clean,beta,stats,ym,ys,pred,r2:sst?1-sse/sst:0};
 }
 function fillElectionOptions(){
  const old=electionSel.value;
  electionSel.innerHTML=R.elections.map(e=>`<option value="${e.id}">${e.label}${e.territorial_available?' · explicatif actif':''}</option>`).join('');
  if(R.elections.some(e=>e.id===old)) electionSel.value=old;
  else if(R.elections.some(e=>e.id==='mun2026_t2')) electionSel.value='mun2026_t2';
  else electionSel.value=R.elections.find(e=>R.territorial && R.territorial[e.id])?.id||R.elections[0]?.id||'';
  fillPartyOptions();
 }
 function fillPartyOptions(){
  const e=election(),t=territorial(),old=partySel.value;
  const options=t?Object.keys(t.parties||{}):(e.options||[]).map(o=>o.key);
  partySel.innerHTML=options.map(k=>`<option value="${k}">${partyName(k)}</option>`).join('');
  if(options.includes(old))partySel.value=old;
  levelSel.disabled=!t;areaSel.disabled=!t;
  fillAreas();render();
 }
 function fillAreas(){
  const t=territorial();
  if(!t){areaSel.innerHTML='<option>Montpellier</option>';return}
  const rs=rows().filter(r=>Number.isFinite(score(r))).sort((a,b)=>a.name.localeCompare(b.name,'fr',{numeric:true}));
  const old=areaSel.value;areaSel.innerHTML='<option value="all">Ensemble de Montpellier</option>'+rs.map(r=>`<option value="${r.id}">${r.name}</option>`).join('');
  if(rs.some(r=>r.id===old))areaSel.value=old;
 }
 function renderCity(){
  const e=election(),opts=e.options||[];
  cards.innerHTML=[
   ['Scrutin',e.label],['Participation',e.participation==null?'—':e.participation.toLocaleString('fr-FR',{maximumFractionDigits:1})+' %'],
   ['Inscrits',e.registered==null?'—':Number(e.registered).toLocaleString('fr-FR',{maximumFractionDigits:0})],
   ['Exprimés',e.expressed==null?'—':Number(e.expressed).toLocaleString('fr-FR',{maximumFractionDigits:0})]
  ].map(x=>`<div class="card"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('');
  if(!opts.length){
   territorySummary.innerHTML=`<div class="method-banner">${e.unavailable_reason||'Aucun résultat exploitable pour Montpellier dans le fichier fourni.'}</div>`;
   explanation.innerHTML='<p>Le scrutin est référencé dans l’archive, mais aucune analyse territoriale n’est possible.</p>';
   corrBox.innerHTML='';qualityBox.innerHTML='';contribBox.innerHTML='';rankingBody.innerHTML='';return;
  }
  const selected=opts.find(o=>o.key===partySel.value)||opts[0];
  if(areaSel.value!=='all') territorySummary.innerHTML=`<div class="results-summary-grid">
   <div><span>Liste ou candidat</span><strong>${selected.name}</strong></div>
   <div><span>Voix</span><strong>${Number(selected.votes).toLocaleString('fr-FR',{maximumFractionDigits:0})}</strong></div>
   <div><span>Score à Montpellier</span><strong>${Number(selected.pct).toLocaleString('fr-FR',{maximumFractionDigits:1})} %</strong></div>
   <div><span>Classement</span><strong>${opts.findIndex(o=>o.key===selected.key)+1}/${opts.length}</strong></div>
   <div><span>Niveau disponible</span><strong>Commune</strong></div>
   <div><span>Analyse territoriale</span><strong>Indisponible</strong></div>
  </div>`;
  drawObserved(selected.pct,null,null);
  explanation.innerHTML='<p>Ce fichier fournit le résultat agrégé de Montpellier, sans ventilation par bureau de vote. Il est donc impossible de relier honnêtement ce score aux caractéristiques sociales des bureaux ou des IRIS.</p><p class="result-warning">Le résultat municipal est bien embarqué dans l’application, mais le modèle explicatif reste désactivé pour éviter de produire une fausse analyse territoriale.</p>';
  corrBox.innerHTML=opts.map((o,i)=>`<div class="result-corr"><span><b>${i+1}. ${o.name}</b><small>${Number(o.votes).toLocaleString('fr-FR',{maximumFractionDigits:0})} voix</small></span><strong>${Number(o.pct).toLocaleString('fr-FR',{maximumFractionDigits:1})} %</strong></div>`).join('');
  qualityBox.innerHTML='<div class="results-quality"><span>Niveau</span><strong>Ville</strong><small>Résultat officiel agrégé de Montpellier</small></div>';
  contribBox.innerHTML='';
  rankingBody.innerHTML=opts.map((o,i)=>`<tr><td>${i+1}</td><td><b>${o.name}</b></td><td>${Number(o.pct).toLocaleString('fr-FR',{maximumFractionDigits:1})} %</td><td>${Number(o.votes).toLocaleString('fr-FR',{maximumFractionDigits:0})} voix</td><td>—</td><td>—</td></tr>`).join('');
 }
 function render(){
  const e=election(),t=territorial();
  if(!t){
   modelStatus.innerHTML=`<strong>Explicatif non chargé</strong><span>Aucune table territoriale trouvée pour l’identifiant ${e?.id||'inconnu'}.</span>`;
   renderCity();return;
  }
  const allRows=rows();
  const data=allRows.filter(r=>Number.isFinite(score(r)));
  if(!data.length){
   modelStatus.innerHTML=`<strong>Explicatif bloqué</strong><span>${Object.keys(t.bureaux||{}).length} bureaux sont présents, mais aucun score n’est associé à « ${partyName(partySel.value)} ».</span>`;
   renderCity();return;
  }
  const m=model(data),scores=data.map(score),city=mean(scores),sorted=[...data].sort((a,b)=>score(b)-score(a));
  const completeCount=m?.clean?.length||0;
  const criteriaCount=m?.keys?.length||0;
  modelStatus.innerHTML=`<strong>${m?'Modèle explicatif activé':'Corrélations actives — modèle multivarié incomplet'}</strong><span>${data.length} ${levelSel.value==='iris'?'IRIS':'bureaux'} avec résultat · ${completeCount} observations complètes · ${criteriaCount} critères multivariés.</span>`;
  const pname=partyName(partySel.value);
  if(areaSel.value==='all'){
   const med=[...scores].sort((a,b)=>a-b); const median=med.length?(med[Math.floor((med.length-1)/2)]+med[Math.ceil((med.length-1)/2)])/2:null;
   const minRow=sorted.at(-1),maxRow=sorted[0];
   document.getElementById('resultsTerritoryTitle').textContent=`Vue globale — ${levelSel.value==='iris'?'IRIS':'bureaux'}`;
   document.getElementById('resultsExplanationTitle').textContent='Ce qu’il faut retenir à Montpellier';
   territorySummary.innerHTML=`<div class="results-summary-grid"><div><span>Résultat moyen des territoires</span><strong>${city.toLocaleString('fr-FR',{maximumFractionDigits:1})} %</strong></div><div><span>Résultat médian</span><strong>${median.toLocaleString('fr-FR',{maximumFractionDigits:1})} %</strong></div><div><span>Nombre de territoires analysés</span><strong>${data.length}</strong></div><div><span>Résultat le plus élevé</span><strong>${maxRow.name} · ${score(maxRow).toLocaleString('fr-FR',{maximumFractionDigits:1})} %</strong></div><div><span>Résultat le plus faible</span><strong>${minRow.name} · ${score(minRow).toLocaleString('fr-FR',{maximumFractionDigits:1})} %</strong></div><div><span>Écart entre le plus haut et le plus bas</span><strong>${(score(maxRow)-score(minRow)).toLocaleString('fr-FR',{maximumFractionDigits:1})} pts</strong></div></div>`;
   drawObserved(city,median,null);
   explanation.innerHTML=`<p>À l’échelle des ${levelSel.value==='iris'?'IRIS':'bureaux'}, ${pname} obtient en moyenne <b>${city.toLocaleString('fr-FR',{maximumFractionDigits:1})} %</b>. Les résultats s’étendent de <b>${score(minRow).toLocaleString('fr-FR',{maximumFractionDigits:1})} %</b> à <b>${score(maxRow).toLocaleString('fr-FR',{maximumFractionDigits:1})} %</b>.</p><p>Les relations ci-dessous décrivent les profils territoriaux associés aux scores les plus élevés ou les plus faibles. Elles ne permettent pas de conclure au vote individuel des habitants.</p>`;
  } else {
   document.getElementById('resultsTerritoryTitle').textContent='Résultat dans ce territoire';
   document.getElementById('resultsExplanationTitle').textContent='Lecture simple du résultat';
  }
  const selected=data.find(r=>r.id===areaSel.value)||sorted[0];
  const rank=sorted.findIndex(r=>r.id===selected.id)+1,selectedScore=score(selected);
  const mi=m?.clean.findIndex(r=>r.id===selected.id)??-1,pred=mi>=0?m.pred[mi]:null,res=pred==null?null:selectedScore-pred;
  cards.innerHTML=[
   ['Liste analysée',pname],['Moyenne territoriale',city.toLocaleString('fr-FR',{maximumFractionDigits:1})+' %'],
   ['Territoire en tête',`${sorted[0].name} · ${score(sorted[0]).toLocaleString('fr-FR',{maximumFractionDigits:1})} %`],
   ['Pouvoir explicatif du modèle',m?`${(100*m.r2).toLocaleString('fr-FR',{maximumFractionDigits:0})} %`:'Insuffisant']
  ].map(x=>`<div class="card"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('');
  if(areaSel.value!=='all') territorySummary.innerHTML=`<div class="results-summary-grid">
   <div><span>Résultat dans ce territoire</span><strong>${selectedScore.toLocaleString('fr-FR',{maximumFractionDigits:1})} %</strong></div>
   <div><span>Écart à Montpellier</span><strong>${selectedScore-city>=0?'+':''}${(selectedScore-city).toLocaleString('fr-FR',{maximumFractionDigits:1})} pts</strong></div>
   <div><span>Classement pour cette liste</span><strong>${rank}e sur ${sorted.length}</strong><small>Rang 1 = score le plus élevé</small></div>
   <div><span>Résultat attendu selon le profil territorial</span><strong>${pred==null?'—':pred.toLocaleString('fr-FR',{maximumFractionDigits:1})+' %'}</strong></div>
   <div><span>Écart entre résultat réel et attendu</span><strong>${res==null?'—':(res>=0?'+':'')+res.toLocaleString('fr-FR',{maximumFractionDigits:1})+' pts'}</strong></div>
   <div><span>Méthode</span><strong>${levelSel.value==='iris'?'Résultat IRIS estimé':'Résultat bureau observé'}</strong></div>
  </div>`;
  if(areaSel.value!=='all') drawObserved(selectedScore,city,pred);
  const corrs=Object.entries(indicators).map(([k,label])=>({k,label,r:corr(data.map(x=>x.profile[k]),scores)})).filter(x=>x.r!=null).sort((a,b)=>Math.abs(b.r)-Math.abs(a.r));
  const shownCorr=showAllCorrelations?corrs:corrs.slice(0,5);
  corrBox.innerHTML=shownCorr.map(x=>{const a=Math.abs(x.r);const strength=a>=.8?'très forte':a>=.6?'forte':a>=.4?'modérée':a>=.2?'faible':'très faible';const phrase=x.r>=0?`Les territoires où « ${x.label.toLowerCase()} » est plus élevé donnent généralement un score plus élevé à la liste.`:`Les territoires où « ${x.label.toLowerCase()} » est plus élevé donnent généralement un score plus faible à la liste.`;return `<div class="result-corr"><span><b>${x.label}</b><small>${phrase}</small><em>Relation ${strength} ${x.r>=0?'positive':'négative'}</em></span><strong>${x.r>=0?'+':''}${x.r.toLocaleString('fr-FR',{maximumFractionDigits:2})}</strong></div>`}).join('');
  toggleCorr.hidden=corrs.length<=5;toggleCorr.textContent=showAllCorrelations?'Réduire la liste':'Voir toutes les relations';
  if(m){
   qualityBox.innerHTML=`<div class="results-quality"><span>Pouvoir explicatif du modèle</span><strong>${(100*m.r2).toLocaleString('fr-FR',{maximumFractionDigits:0})} %</strong><small>Le modèle reproduit environ cette part des écarts observés entre ${m.clean.length} territoires à partir de ${m.keys.length} critères. Cela ne signifie pas qu’il explique ce pourcentage des votes individuels.</small></div>`;
   const contrib=m.keys.map((k,i)=>{const z=(Number(selected.profile[k])-m.stats[k].m)/m.stats[k].s;return {k,label:indicators[k],points:z*m.beta[i+1]*m.ys,value:selected.profile[k]}}).sort((a,b)=>Math.abs(b.points)-Math.abs(a.points));
   const baseline=areaSel.value==='all'||pred==null?null:pred-contrib.reduce((s,c)=>s+c.points,0);
   const contributionRows=areaSel.value==='all'?contrib.map(c=>({...c,points:m.beta[m.keys.indexOf(c.k)+1]*m.ys})):contrib;
   contribBox.innerHTML=`<div class="model-calculation"><b>${areaSel.value==='all'?'Effets moyens du modèle':'Construction du résultat attendu'}</b>${baseline==null?'':`<p>Point de départ du modèle : <strong>${baseline.toLocaleString('fr-FR',{maximumFractionDigits:1})} %</strong></p>`}</div>`+contributionRows.map(c=>{const dir=Math.abs(c.points)<.15?'Effet estimé presque nul':c.points>0?'Augmente le résultat attendu':'Diminue le résultat attendu';return `<div class="result-contribution"><span><b>${c.label}</b><small>${areaSel.value==='all'?'Poids propre du critère dans le modèle':`Valeur dans le territoire : ${Number(c.value).toLocaleString('fr-FR',{maximumFractionDigits:1})}${c.k==='niveau_vie'?' €':' %'}`}</small><em>${dir}</em></span><strong class="${Math.abs(c.points)<.15?'neutral':c.points>=0?'positive':'negative'}">${c.points>=0?'+':''}${c.points.toLocaleString('fr-FR',{maximumFractionDigits:1})} pt${Math.abs(c.points)>=2?'s':''}</strong></div>`}).join('')+(areaSel.value==='all'||pred==null?'':`<div class="model-total"><span>Résultat attendu selon le profil territorial</span><strong>${pred.toLocaleString('fr-FR',{maximumFractionDigits:1})} %</strong></div>`);
   const phrase=contrib.slice(0,3).map(c=>`${c.label.toLowerCase()} (${c.points>=0?'+':''}${c.points.toLocaleString('fr-FR',{maximumFractionDigits:1})} pt${Math.abs(c.points)>=1?'s':''})`).join(', ');
   if(areaSel.value!=='all') explanation.innerHTML=`<p>Dans <b>${selected.name}</b>, ${pname} obtient <b>${selectedScore.toLocaleString('fr-FR',{maximumFractionDigits:1})} %</b>, soit ${(selectedScore-city)>=0?'+':''}${(selectedScore-city).toLocaleString('fr-FR',{maximumFractionDigits:1})} points par rapport à la moyenne.</p><p>Le résultat attendu selon le profil territorial est de <b>${pred.toLocaleString('fr-FR',{maximumFractionDigits:1})} %</b>. Les facteurs les plus associés à cette estimation sont : ${phrase}.</p><p>${Math.abs(res)<2?'Le résultat est proche de ce que prévoit le profil territorial.':`Un écart de ${Math.abs(res).toLocaleString('fr-FR',{maximumFractionDigits:1})} points reste non reproduit par le modèle.`}</p><p class="result-warning">Ces associations décrivent le territoire dans son ensemble. Elles ne permettent pas de savoir comment chaque catégorie d’habitants a voté.</p>`;
  }else{
   qualityBox.innerHTML='<p>Données insuffisantes pour un modèle multivarié fiable.</p>';contribBox.innerHTML='';explanation.innerHTML='<p>Les corrélations simples restent disponibles. Le modèle multivarié n’a pas assez d’observations complètes pour les critères sélectionnés.</p>';
  }
  const q=(search?.value||'').toLowerCase();
  rankingBody.innerHTML=sorted.filter(r=>!q||r.name.toLowerCase().includes(q)||r.id.includes(q)).map((r,i)=>{
   const idx=m?.clean.findIndex(x=>x.id===r.id)??-1,p=idx>=0?m.pred[idx]:null,rr=p==null?null:score(r)-p;
   return `<tr data-id="${r.id}"><td>${i+1}</td><td><b>${r.name}</b></td><td>${score(r).toLocaleString('fr-FR',{maximumFractionDigits:1})} %</td><td>${score(r)-city>=0?'+':''}${(score(r)-city).toLocaleString('fr-FR',{maximumFractionDigits:1})} pts</td><td>${p==null?'—':p.toLocaleString('fr-FR',{maximumFractionDigits:1})+' %'}</td><td>${rr==null?'—':(rr>=0?'+':'')+rr.toLocaleString('fr-FR',{maximumFractionDigits:1})+' pts'}</td></tr>`;
  }).join('');
  rankingBody.querySelectorAll('tr').forEach(tr=>tr.addEventListener('click',()=>{areaSel.value=tr.dataset.id;render()}));
 }
 function drawObserved(observed,average,predicted){
  const c=document.getElementById('resultsObservedChart'),box=c.parentElement,ratio=window.devicePixelRatio||1;
  const w=Math.max(560,box.clientWidth-20),h=230;c.width=w*ratio;c.height=h*ratio;c.style.width=w+'px';c.style.height=h+'px';
  const ctx=c.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);
  const vals=[observed,average,predicted].filter(Number.isFinite),max=Math.max(40,Math.ceil(Math.max(...vals,0)/10)*10),x=v=>70+(w-110)*v/max;
  ctx.strokeStyle='#30485e';ctx.fillStyle='#8ea3b7';ctx.font='11px system-ui';
  for(let v=0;v<=max;v+=10){ctx.beginPath();ctx.moveTo(x(v),25);ctx.lineTo(x(v),190);ctx.stroke();ctx.fillText(v+' %',x(v)-10,210)}
  [['Observé',observed,50],['Moyenne',average,105],['Estimé',predicted,160]].filter(i=>Number.isFinite(i[1])).forEach(([label,v,y])=>{
   ctx.fillStyle='#dce8f3';ctx.fillText(label,5,y);ctx.fillStyle=label==='Observé'?'#f0a020':label==='Estimé'?'#5b9cff':'#8da4b8';ctx.fillRect(70,y-10,Math.max(2,x(v)-70),20);ctx.fillStyle='#dce8f3';ctx.fillText(v.toLocaleString('fr-FR',{maximumFractionDigits:1})+' %',x(v)+6,y);
  });
 }
 electionSel?.addEventListener('change',fillPartyOptions);
 levelSel?.addEventListener('change',()=>{fillAreas();render()});
 partySel?.addEventListener('change',()=>{fillAreas();render()});
 areaSel?.addEventListener('change',render);search?.addEventListener('input',render);toggleCorr?.addEventListener('click',()=>{showAllCorrelations=!showAllCorrelations;render()});
 fillElectionOptions();
})();


// V42 — navigation et volets mobiles
(function initMobileExperience(){
  const menuBtn=document.getElementById('mobileMenuButton');
  const panelsBtn=document.getElementById('mobilePanelsButton');
  const backdrop=document.getElementById('mobileNavBackdrop');
  const nav=document.querySelector('.shell > aside');
  const isMobile=()=>window.matchMedia('(max-width:760px)').matches;

  function closeNav(){
    if(!nav) return;
    nav.classList.remove('mobile-open');
    backdrop?.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded','false');
  }
  function toggleNav(){
    if(!nav) return;
    const open=!nav.classList.contains('mobile-open');
    nav.classList.toggle('mobile-open',open);
    backdrop?.classList.toggle('open',open);
    menuBtn?.setAttribute('aria-expanded',String(open));
  }
  menuBtn?.addEventListener('click',toggleNav);
  backdrop?.addEventListener('click',closeNav);
  nav?.querySelectorAll('button[data-tab]').forEach(b=>b.addEventListener('click',closeNav));

  const selector='.panel, .true-global-category, .schema-gallery-card, .data-pack-card, .territory-data-section';
  function titleFor(el){
    const heading=el.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > .schema-panel-head h2, :scope > .data-pack-head h2, :scope > .table-head h2, :scope > .results-model-status strong');
    if(heading?.textContent.trim()) return heading.textContent.trim();
    if(el.id) return el.id.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
    return 'Afficher le contenu';
  }
  function makeCollapsible(el,index){
    if(el.dataset.mobileReady==='true' || el.closest('.bureau-panel')) return;
    // Les petits panneaux purement techniques et les cartes de contrôle restent ouverts.
    if(el.classList.contains('fiscal-import-panel') || el.classList.contains('custom-index-method')) return;
    el.dataset.mobileReady='true';
    el.classList.add('mobile-collapsible');
    const title=titleFor(el);
    const children=[...el.childNodes];
    const body=document.createElement('div');
    body.className='mobile-panel-body';
    children.forEach(n=>body.appendChild(n));
    const toggle=document.createElement('button');
    toggle.type='button';
    toggle.className='mobile-panel-toggle';
    toggle.setAttribute('aria-expanded','true');
    toggle.innerHTML=`<span>${title}</span><span class="mobile-panel-chevron" aria-hidden="true">▾</span>`;
    el.append(toggle,body);
    const initiallyClosed=isMobile() && index>1 && !el.classList.contains('territory-compare-panel') && !el.classList.contains('custom-index-panel');
    el.dataset.mobileCollapsed=String(initiallyClosed);
    toggle.setAttribute('aria-expanded',String(!initiallyClosed));
    toggle.addEventListener('click',()=>{
      const closed=el.dataset.mobileCollapsed==='true';
      el.dataset.mobileCollapsed=String(!closed);
      toggle.setAttribute('aria-expanded',String(closed));
    });
  }
  function scan(){document.querySelectorAll(selector).forEach(makeCollapsible)}
  scan();
  const observer=new MutationObserver(()=>scan());
  observer.observe(document.querySelector('main')||document.body,{childList:true,subtree:true});

  let allClosed=false;
  panelsBtn?.addEventListener('click',()=>{
    if(!isMobile()) return;
    allClosed=!allClosed;
    document.querySelectorAll('.mobile-collapsible').forEach(el=>{
      el.dataset.mobileCollapsed=String(allClosed);
      el.querySelector(':scope > .mobile-panel-toggle')?.setAttribute('aria-expanded',String(!allClosed));
    });
    panelsBtn.setAttribute('aria-label',allClosed?'Ouvrir tous les volets':'Fermer tous les volets');
    panelsBtn.textContent=allClosed?'▣':'▤';
  });

  window.addEventListener('resize',()=>{
    if(!isMobile()) closeNav();
  });
})();
