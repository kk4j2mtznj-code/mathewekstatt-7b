/* Deterministic task engine shared by exercises and server-side exit scoring. */
const SKILLS={lesen:'Tabellen lesen',typ:'Zuordnung erkennen',proportional:'Proportionaler Dreisatz',anti:'Antiproportionaler Dreisatz',graph:'Diagramme',alltag:'Anwenden und prüfen'};
function seeded(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function number(raw){let s=String(raw).trim().replace(/,/g,'.');return /^[-+]?\d+(\.\d+)?$/.test(s)?Number(s):NaN;}
function isCorrect(q,a){const n=number(a);return Number.isFinite(n)&&Math.abs(n-q.answer)<1e-7;}
function makeTasks(skill,level,seed,count=6){let r=seeded(seed),int=(a,b)=>a+Math.floor(r()*(b-a+1));return Array.from({length:count},(_,i)=>{
  let k=int(level===1?2:3,level===1?6:9),n=int(2,5),target=int(6,10);
  let q={skill,prompt:'',answer:0,unit:'',steps:[],tip:'',points:1};
  const set=(prompt,answer,steps,tip,unit='')=>Object.assign(q,{prompt,answer,steps,tip,unit});
  if(skill==='lesen'){
    q.table=[['Anzahl Hefte',1,2,4,6],['Preis in €',k,2*k,4*k,6*k]];
    if(i%2===0){let x=[1,2,4,6][int(0,3)];set(`Wie viel kosten ${x} Hefte?`,x*k,[`Suche oben die Anzahl ${x}.`,`Lies darunter den Preis ${x*k} € ab.`],'Lies beide Werte in derselben Spalte.','€');}
    else{let x=[2,4,6][int(0,2)];set(`Wie viele Hefte erhältst du für ${x*k} €?`,x,[`Suche unten den Preis ${x*k} €.`,`In derselben Spalte steht die Anzahl ${x}.`],'Beginne diesmal in der unteren Zeile.','Hefte');}
    if(level===3&&i%3===0){q.table=[['Uhrzeit',8,10,12,14],['Temperatur in °C',k,2*k,2*k,k+1]];set('Von 10 bis 12 Uhr: Wie groß ist die Temperaturänderung?',0,[`Um 10 Uhr und um 12 Uhr sind es ${2*k} °C.`,`Die Änderung beträgt 0 °C.`],'Vergleiche die beiden Temperaturen.','°C');}
  }else if(skill==='typ'){
    let t=i%3,xs=[1,2,4],ys=t===0?xs.map(x=>x*k):t===1?xs.map(x=>4*k/x):xs.map(x=>k+x);
    q.table=[['x',...xs],['y',...ys]];q.choices=['proportional','antiproportional','keines von beiden'];
    set('Welche Art von Zuordnung zeigt die Tabelle?',t,t===0?[`Teile y durch x: ${ys[0]} : 1 = ${ys[1]} : 2 = ${k}.`,'Die Quotienten sind gleich: proportional.']:t===1?[`Multipliziere x · y: 1 · ${ys[0]} = 2 · ${ys[1]} = ${4*k}.`,'Die Produkte sind gleich: antiproportional.']:[`Quotienten: ${ys[0]} : 1 = ${ys[0]}, aber ${ys[1]} : 2 = ${ys[1]/2}.`,`Produkte: 1 · ${ys[0]} = ${ys[0]}, aber 2 · ${ys[1]} = ${2*ys[1]}.`,'Beides ist nicht konstant.'],'Prüfe zuerst die Quotienten, dann die Produkte. Steigen oder Fallen allein reicht nicht.');
    if(level>1&&i%2===0){q.table=null;let t2=int(0,2);q.choices=['proportional','antiproportional','keines von beiden'];set(t2===0?'Gleiche Flaschen ohne Rabatt: Anzahl → Gesamtpreis.':t2===1?'Ein fester Gewinn wird gerecht verteilt: Anzahl Personen → Anteil pro Person.':'Eine Fahrt kostet 4 € Grundgebühr und 2 € je Kilometer: Kilometer → Preis.',t2,t2===0?['Doppelte Anzahl kostet doppelt so viel.','Der Preis pro Flasche bleibt gleich.']:t2===1?['Doppelt so viele Personen erhalten jeweils die Hälfte.','Die gesamte Gewinnsumme bleibt gleich.']:['1 km kostet 6 €, 2 km kosten 8 € und 4 km kosten 12 €.','Weder Quotienten noch Produkte sind gleich.'],'Überlege, was bei einer Verdoppelung geschieht.');}
  }else if(skill==='proportional'){
    let unit=level===1?k:level===2?k/2:k/4,known=n*unit,answer=target*unit;
    if(level===1){n=[2,3,4][int(0,2)];target=n*2;known=n*unit;answer=target*unit;}
    set(`${n} kg Äpfel kosten ${known.toFixed(2).replace('.',',')} €. Wie viel kosten ${target} kg derselben Äpfel?`,answer,[`${n} kg → ${known.toFixed(2).replace('.',',')} €`,`1 kg → ${known} : ${n} = ${unit} €`,`${target} kg → ${unit} · ${target} = ${answer} €`],'Teile beide Werte durch die bekannte Kilogrammzahl. Multipliziere dann mit der gesuchten Menge.','€');
    if(i%2===1){let portions=level===1?4:6,amount=portions*k*25,needed=level===1?8:9;set(`Für ${portions} gleiche Portionen braucht man ${amount} g Reis. Wie viel braucht man für ${needed} Portionen?`,amount/portions*needed,[`1 Portion: ${amount} : ${portions} = ${amount/portions} g`,`${needed} Portionen: ${amount/portions} · ${needed} = ${amount/portions*needed} g`],'Berechne zuerst die Menge für eine Portion.','g');}
  }else if(skill==='anti'){
    let total=[24,36,48,60,72][int(0,4)],workers=level===1?2:3,needed=level===1?4:[4,6][int(0,1)],hours=total/workers;
    set(`${workers} gleich schnelle Helfer brauchen ${hours} Stunden. Wie lange brauchen ${needed} Helfer für dieselbe Arbeit? Alle können gleichzeitig arbeiten.`,total/needed,[`${workers} Helfer → ${hours} h`,`1 Helfer → ${hours} · ${workers} = ${total} h`,`${needed} Helfer → ${total} : ${needed} = ${total/needed} h`],'Mehr Helfer brauchen für dieselbe Arbeit weniger Zeit. Anzahl · Zeit bleibt gleich.','h');
    if(i%2===1){let a=level===1?2:4,b=int(2,5)*3,t=level===1?4:6;set(`Ein Futtervorrat reicht für ${a} Kaninchen ${b} Tage. Wie lange reicht derselbe Vorrat für ${t} Kaninchen? Alle fressen gleich viel.`,a*b/t,[`1 Kaninchen: ${a} · ${b} = ${a*b} Tage`,`${t} Kaninchen: ${a*b} : ${t} = ${a*b/t} Tage`],'Der gesamte Vorrat bleibt gleich. Mehr Tiere verbrauchen ihn schneller.','Tage');}
  }else if(skill==='graph'){
    k=int(1,3);let x=int(1,6);q.graph={k,x,draw:level===3};
    set(level===3?`Ein Getränk kostet ${k} €. Setze den Punkt für ${x} Getränke ins Diagramm oder trage seinen y-Wert ein.`:`Lies ab: Wie viel kosten ${x} Getränke?`,x*k,[`Die x-Achse zeigt die Anzahl Getränke.`,`Bei x = ${x} liegt der y-Wert bei ${x*k}.`,`Das Wertepaar lautet (${x}|${x*k}).`],level===3?'Gehe zuerst auf der x-Achse zur Anzahl. Gehe dann senkrecht zur passenden Preishöhe.':'Gehe von der Anzahl senkrecht zum Graphen und dann waagerecht zur Preisachse.','€');
    if(level===2&&i%2===1){q.graph={k,x,offset:3};q.choices=['proportional','antiproportional','keines von beiden'];set('Welche Zuordnung zeigt der Graph mit einer Grundgebühr von 3 €?',2,['Die Gerade geht durch (0|3), nicht durch den Ursprung.','Daher ist sie nicht proportional. Sie ist auch nicht antiproportional.'],'Eine proportionale Gerade muss durch (0|0) gehen.');}
  }else{
    if(level===1||i%3===0){let people=level===1?4:6,price=people*k*2,newp=level===1?8:8;set(`${people} Freunde teilen sich ein Geschenk für insgesamt ${price} €. Nun beteiligen sich ${newp} Freunde. Wie viel zahlt jeder?`,price/newp,[`Der Gesamtpreis bleibt ${price} €.`,`Pro Person: ${price} : ${newp} = ${price/newp} €.`],'Es wird ein fester Betrag gerecht aufgeteilt.','€');}
    else if(i%3===1){q.choices=['Die Zeit muss halbiert werden.','Die Zeit muss verdoppelt werden.','Die Zeit bleibt immer gleich.'];set('4 gleich schnelle Pumpen brauchen 6 Stunden. Tom behauptet: „8 Pumpen brauchen 12 Stunden.“ Wie wird der Fehler berichtigt?',0,['Die Anzahl verdoppelt sich, daher halbiert sich die Zeit.','6 : 2 = 3 Stunden.'],'Mehr gleich starke Pumpen brauchen für dasselbe Becken weniger Zeit.');}
    else{q.choices=['Jeder weitere Helfer halbiert immer die Zeit.','Im engen Raum können sich die Helfer behindern.','Die Arbeitsmenge wird automatisch kleiner.'];set('Warum funktioniert „doppelt so viele Helfer, halbe Zeit“ im Alltag manchmal nicht genau?',1,['Das Modell setzt gleiche Leistung und gleichzeitiges Arbeiten voraus.','Auf engem Raum können sich Helfer behindern.'],'Überlege, ob alle Helfer gleichzeitig arbeiten können.');}
  }
  return q;
});}
function exitTasks(seed){const specs=[['lesen',1],['typ',2],['proportional',1],['proportional',2],['anti',1],['anti',2],['graph',1],['alltag',3]];return specs.map(([s,l],i)=>({...makeTasks(s,l,(seed+i*101)>>>0,6)[i%6],points:1}));}
