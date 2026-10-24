
function tsPopulateExams(){const sel=document.getElementById('tsExamSelect');if(!sel)return;const names=[...new Set(db.exams.map(e=>e.examName||'Untitled'))].sort();const cur=sel.value;sel.innerHTML='<option value="">— select exam —</option>'+names.map(n=>`<option value="${n}"${n===cur?' selected':''}>${n}</option>`).join('');}
function renderTopStudentsPage(){tsPopulateExams();const examName=document.getElementById('tsExamSelect').value;const mode=document.getElementById('tsViewMode').value;const cont=document.getElementById('tsContent');if(!cont)return;if(!examName){cont.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted)">Please select an exam above.</div>';return;}if(mode==='class')renderTSClass(examName,cont);else renderTSSubject(examName,cont);}
function tsBest(r){if(!r.length)return null;return r.reduce((a,b)=>(b.total||0)>(a.total||0)?b:a);}
/* Returns array of top-3 students (with ties fully included).
   Each item: { rec, rank }  where rank is 1/2/3 (ties share a rank). */
function tsTop3(recs){
  if(!recs.length) return [];
  const sorted=[...recs].sort((a,b)=>(b.total||0)-(a.total||0));
  const result=[];
  let rank=1, prevTotal=null, prevCount=0;
  for(const rec of sorted){
    const tot=rec.total||0;
    if(prevTotal!==null && tot<prevTotal){ rank+=prevCount; prevCount=0; }
    if(rank>3) break;
    result.push({rec,rank});
    prevCount++;
    prevTotal=tot;
  }
  return result;
}
function tsBestBySubject(r,s){const v=r.filter(x=>x.scores&&x.scores[s]!==undefined);if(!v.length)return null;return v.reduce((a,b)=>b.scores[s]>a.scores[s]?b:a);}
function tsStudentGender(admNo){const s=db.students.find(x=>x.admNo===admNo);return s?(s.gender||''):''; }
function tsStudentName(admNo){const s=db.students.find(x=>x.admNo===admNo);return s?s.fullName:(db.exams.find(e=>e.admNo===admNo)||{}).name||admNo;}
function renderTSClass(examName,cont){
  const medalColors=['#FFD700','#C0C0C0','#CD7F32'];
  const medalLabels=['1st','2nd','3rd'];
  // Group rows by grade
  const byGrade={};
  tsClassRows(examName).forEach(r=>{
    if(!byGrade[r.grade]) byGrade[r.grade]=[];
    byGrade[r.grade].push(r);
  });
  let html='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px">';
  ALL_GRADES.forEach(grade=>{
    const rows=byGrade[grade];
    if(!rows) return;
    const first=rows[0];
    const totalStudents=first.count;
    html+=`<div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,var(--surface-3),var(--surface-2));padding:10px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
        <span style="font-weight:800;font-size:13px;color:var(--emerald)">Grade ${grade}</span>
        <span class="badge badge-blue" style="font-size:11px">${totalStudents} student${totalStudents!==1?'s':''}</span>
      </div>`;
    if(first.name==='—'){
      html+=`<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:12px">No records</div>`;
    } else {
      rows.forEach(r=>{
        const gender=tsStudentGender(r.admNo);
        const gIcon=gender==='Male'?'👦':gender==='Female'?'👧':'🎓';
        const medalColor=medalColors[(r.position-1)]||'#aaa';
        const medalLabel=medalLabels[(r.position-1)]||(r.position+'th');
        html+=`<div style="padding:10px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border)">
          <div style="min-width:32px;height:32px;border-radius:50%;background:${medalColor};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;color:#1a2a1e">${medalLabel}</div>
          <div style="font-size:20px">${gIcon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.name}</div>
            <div style="font-size:10px;color:var(--text-muted);margin-top:1px">${r.admNo}${r.isTie?' <span style="color:var(--gold);font-size:9px">TIE</span>':''}</div>
          </div>
          <div style="text-align:right">
            <div style="font-family:monospace;font-size:18px;font-weight:800;color:var(--gold)">${r.total}</div>
            <div style="font-size:10px;color:var(--text-muted)">${r.overallRubric}</div>
          </div>
        </div>`;
      });
    }
    html+=`</div>`;
  });
  html+='</div>';
  cont.innerHTML=html;
}
function renderTSSubject(examName,cont){let html='';ALL_GRADES.forEach(grade=>{const recs=db.exams.filter(e=>e.grade===grade&&(e.examName||'Untitled')===examName);if(!recs.length)return;const subjects=getSubjects(grade);const recsG=recs.map(r=>({...r,gender:tsStudentGender(r.admNo)}));const boys=recsG.filter(r=>r.gender==='Male');const girls=recsG.filter(r=>r.gender==='Female');html+=`<div style="margin-bottom:28px"><div style="font-size:14px;font-weight:800;color:var(--emerald);padding:8px 0 10px;border-bottom:2px solid var(--emerald);margin-bottom:12px;display:flex;align-items:center;gap:8px"><span>📚 Grade ${grade}</span><span style="font-size:11px;font-weight:500;color:var(--text-muted)">(${recs.length} records · ${boys.length} boys · ${girls.length} girls)</span></div><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:var(--surface-3)"><th style="padding:8px 12px;text-align:left;font-weight:700;color:var(--text-muted);border-bottom:1px solid var(--border)">Subject</th><th style="padding:8px 12px;text-align:left;font-weight:700;color:var(--sky);border-bottom:1px solid var(--border)">👦 Top Boy</th><th style="padding:8px 12px;text-align:center;font-weight:700;color:var(--sky);border-bottom:1px solid var(--border)">Score</th><th style="padding:8px 12px;text-align:left;font-weight:700;color:var(--rose);border-bottom:1px solid var(--border)">👧 Top Girl</th><th style="padding:8px 12px;text-align:center;font-weight:700;color:var(--rose);border-bottom:1px solid var(--border)">Score</th></tr></thead><tbody>`;subjects.forEach((s,i)=>{const topBoy=tsBestBySubject(boys,s);const topGirl=tsBestBySubject(girls,s);const bg=i%2===0?'var(--surface-2)':'var(--surface-3)';const rb=r=>r?`<span class="rubric-tag ${(getRubric(r.scores[s],r.grade,r.examName)||{class:''}).class}" style="font-size:10px">${(getRubric(r.scores[s],r.grade,r.examName)||{code:'—'}).code}</span>`:'';html+=`<tr style="background:${bg}"><td style="padding:7px 12px;font-weight:700;color:var(--sky);border-bottom:1px solid var(--border)">${s}</td><td style="padding:7px 12px;border-bottom:1px solid var(--border)">${topBoy?`<span style="font-weight:600">${tsStudentName(topBoy.admNo)}</span><br><span style="font-size:10px;color:var(--text-muted)">${topBoy.admNo}</span>`:'<span style="color:var(--text-muted)">—</span>'}</td><td style="padding:7px 12px;text-align:center;border-bottom:1px solid var(--border);font-family:monospace;font-weight:800;color:var(--gold)">${topBoy?topBoy.scores[s]:'—'} ${rb(topBoy)}</td><td style="padding:7px 12px;border-bottom:1px solid var(--border)">${topGirl?`<span style="font-weight:600">${tsStudentName(topGirl.admNo)}</span><br><span style="font-size:10px;color:var(--text-muted)">${topGirl.admNo}</span>`:'<span style="color:var(--text-muted)">—</span>'}</td><td style="padding:7px 12px;text-align:center;border-bottom:1px solid var(--border);font-family:monospace;font-weight:800;color:var(--gold)">${topGirl?topGirl.scores[s]:'—'} ${rb(topGirl)}</td></tr>`;});html+='</tbody></table></div></div>';});if(!html)html='<div style="padding:40px;text-align:center;color:var(--text-muted)">No records found.</div>';cont.innerHTML=html;}
function tsGetData(){return{examName:(document.getElementById('tsExamSelect')||{}).value||'',mode:(document.getElementById('tsViewMode')||{}).value||'class'};}
function tsClassRows(examName){
  // Pre-build grade-level pools for class rank computation
  const gradePool={};
  ALL_GRADES.forEach(g=>{
    const lvl=g.charAt(0);
    if(!gradePool[lvl]) gradePool[lvl]=[];
    db.exams.filter(e=>e.grade===g&&(e.examName||'Untitled')===examName).forEach(e=>gradePool[lvl].push(e));
  });
  // Sort each pool descending by total for rank lookup
  Object.keys(gradePool).forEach(lvl=>gradePool[lvl].sort((a,b)=>(b.total||0)-(a.total||0)));

  const rows=[];
  ALL_GRADES.forEach(grade=>{
    const recs=db.exams.filter(e=>e.grade===grade&&(e.examName||'Untitled')===examName);
    const top3=tsTop3(recs);
    if(!top3.length){
      rows.push({grade,name:'—',admNo:'—',gender:'—',total:'—',outOf:0,totalPoints:'—',outOfPoints:0,overallRubric:'—',classRank:'—',gradeTotalCount:'—',count:recs.length,position:1,isTie:false});
      return;
    }
    const gradeLevel=grade.charAt(0);
    const isJunior=['7','8','9'].includes(gradeLevel);
    const outOf=isJunior?900:800;
    const outOfPoints=isJunior?72:64;
    const pool=gradePool[gradeLevel]||[];

    top3.forEach(({rec:best,rank:position})=>{
      let totalPoints='—';
      let overallRubric='—';
      if(best){
        const subjects=getSubjects(grade);
        const validSubjs=subjects.filter(s=>best.scores&&best.scores[s]!==undefined);
        const pts=validSubjs.reduce((a,s)=>a+getRubric(best.scores[s],best.grade,best.examName).pts,0);
        totalPoints=Math.round(pts);
        const tr=getTotalRubric(totalPoints,isJunior);
        overallRubric=tr?tr.code:'—';
      }
      let classRank='—';
      let gradeTotalCount='—';
      if(best){
        const pos=pool.findIndex(e=>e.admNo===best.admNo);
        classRank=pos>=0?pos+1:'—';
        gradeTotalCount=pool.length;
      }
      // Detect tie: another student in same grade has same total
      const isTie=recs.filter(r=>r.admNo!==best.admNo&&(r.total||0)===(best.total||0)).length>0;
      rows.push({
        grade,
        name:best?tsStudentName(best.admNo):'—',
        admNo:best?best.admNo:'—',
        gender:best?(tsStudentGender(best.admNo)||'—'):'—',
        total:best?(best.total||0):'—',
        outOf,
        totalPoints,
        outOfPoints,
        overallRubric,
        classRank,
        gradeTotalCount,
        count:recs.length,
        position,   // 1, 2 or 3
        isTie       // true if this position score is shared with another student
      });
    });
  });
  return rows;
}
function tsSubjectRows(examName){return ALL_GRADES.map(grade=>{const recs=db.exams.filter(e=>e.grade===grade&&(e.examName||'Untitled')===examName);if(!recs.length)return null;const subjects=getSubjects(grade);const recsG=recs.map(r=>({...r,gender:tsStudentGender(r.admNo)}));const boys=recsG.filter(r=>r.gender==='Male');const girls=recsG.filter(r=>r.gender==='Female');const rows=subjects.map(s=>{const b=tsBestBySubject(boys,s);const g=tsBestBySubject(girls,s);const bRub=b?(getRubric(b.scores[s],b.grade,b.examName)||{code:'—'}).code:'—';const gRub=g?(getRubric(g.scores[s],g.grade,g.examName)||{code:'—'}).code:'—';return{subject:s,boyName:b?tsStudentName(b.admNo):'—',boyAdm:b?b.admNo:'—',boyScore:b?b.scores[s]:'—',boyRubric:bRub,girlName:g?tsStudentName(g.admNo):'—',girlAdm:g?g.admNo:'—',girlScore:g?g.scores[s]:'—',girlRubric:gRub};});return{grade,rows,boyCount:boys.length,girlCount:girls.length,total:recs.length};}).filter(Boolean);}
function exportTopStudentsPDF(){
  const {examName,mode}=tsGetData();
  if(!examName){toast('⚠️ Please select an exam first.',true);return;}
  const jsPDF=window._getJsPDF();
  const orientSel=document.getElementById('tsOrientation');
  const orientation=orientSel?orientSel.value:'portrait';
  const doc=new jsPDF({orientation,unit:'mm',format:'a4'});
  const modeLabel=mode==='class'?'Top 3 Students Per Class (Overall)':'Top Boy & Girl Per Subject Per Class';
  let y=pdfHeader(doc,'TOP STUDENTS REPORT','UPPER PRIMARY AND JUNIOR SCHOOL');
  const W2=doc.internal.pageSize.getWidth();
  doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(80,100,130);
  doc.text(`${examName}  |  ${modeLabel}  |  ${new Date().toLocaleDateString('en-KE')}`,W2/2,y,{align:'center'});
  y+=6;
  const fills={EE1:[144,238,144],EE2:[186,225,186],ME1:[173,216,230],ME2:[176,224,230],AE1:[255,255,153],AE2:[255,228,181],BE1:[255,182,193],BE2:[255,160,122]};
  const medalFills={1:[255,223,0],2:[220,220,220],3:[210,140,64]};

  if(mode==='class'){
    const rows=tsClassRows(examName);
    // Group by grade level for banners
    const gradeLevels=[...new Set(ALL_GRADES.map(g=>g.charAt(0)))];
    let currentY=y;
    gradeLevels.forEach(lvl=>{
      const lvlRows=rows.filter(r=>r.grade.charAt(0)===lvl&&r.name!=='—');
      if(!lvlRows.length)return;
      const isJnr=['7','8','9'].includes(lvl);
      const marksOut=isJnr?900:800;
      const ptsOut=isJnr?72:64;
      const W=doc.internal.pageSize.getWidth();

      // Grade level banner
      if(currentY>doc.internal.pageSize.getHeight()-60){
        doc.addPage();
        currentY=pdfHeader(doc,'TOP STUDENTS REPORT','UPPER PRIMARY AND JUNIOR SCHOOL');
        const _Wc=doc.internal.pageSize.getWidth();doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(80,100,130);doc.text(`${examName}  |  ${modeLabel}  |  ${new Date().toLocaleDateString('en-KE')}`,_Wc/2,currentY,{align:'center'});currentY+=6;
        pdfFooter(doc);
      }
      doc.setFillColor(255,220,220); doc.rect(4,currentY,W-8,7,'F');
      doc.setFillColor(242,199,68);  doc.rect(4,currentY+6,W-8,1,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(11,29,58);
      doc.text(`GRADE ${lvl}`,8,currentY+4.8);
      doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(80,100,130);
      doc.text(`Marks out of ${marksOut}  |  Points out of ${ptsOut}`,W-8,currentY+4.8,{align:'right'});
      currentY+=10;

      doc.autoTable({
        tableLineColor:[0,0,0],tableLineWidth:0.4,
        startY:currentY,margin:{left:4,right:4},
        head:[['Class','Pos','Student','Total Marks /'+marksOut,'Total Points /'+ptsOut,'Rubric','Class Rank']],
        body:lvlRows.map(r=>[
          r.grade,
          r.position+(r.isTie?'*':''),
          r.name,
          r.total==='—'?'—':`${r.total} / ${r.outOf}`,
          r.totalPoints==='—'?'—':`${r.totalPoints} / ${r.outOfPoints}`,
          r.overallRubric,
          r.classRank==='—'?'—':`${r.classRank} / ${r.gradeTotalCount}`
        ]),
        theme:'grid',
        headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:8,cellPadding:2},
        styles:{fontSize:8.5,cellPadding:2,halign:'center',lineColor:[0,0,0],lineWidth:0.4},
        columnStyles:{
          0:{cellWidth:16,fontStyle:'bold'},
          1:{cellWidth:12,fontStyle:'bold'},
          2:{cellWidth:66,halign:'left',fontStyle:'bold',fontSize:8.5},
          3:{cellWidth:28,fontStyle:'bold',fontSize:8.5},
          4:{cellWidth:24},
          5:{cellWidth:18},
          6:{cellWidth:30,fontStyle:'bold'}
        },
        didParseCell(d){
          if(d.section==='body'){
            const row=lvlRows[d.row.index];
            if(!row) return;
            // Medal tint for position column
            if(d.column.index===1){
              const mf=medalFills[row.position];
              if(mf){d.cell.styles.fillColor=mf;d.cell.styles.textColor=[0,0,0];d.cell.styles.fontStyle='bold';}
            }
            // Alternate row tint
            if(d.row.index%2===0&&d.column.index>1) d.cell.styles.fillColor=[255,245,245];
            // Rubric colour
            if(d.column.index===5){
              const fk=String(d.cell.raw||'').replace(/\./g,'');
              if(fills[fk]){d.cell.styles.fillColor=fills[fk];d.cell.styles.textColor=[0,0,0];d.cell.styles.fontStyle='bold';}
            }
            if(d.column.index===3){d.cell.styles.textColor=[30,60,180];d.cell.styles.fontStyle='bold';}
            if(d.column.index===6){d.cell.styles.textColor=[11,29,58];d.cell.styles.fontStyle='bold';}
          }
        },
        didDrawPage(){pdfFooter(doc);}
      });
      // Tie footnote
      const hasTie=lvlRows.some(r=>r.isTie);
      if(hasTie){
        doc.setFont('helvetica','italic');doc.setFontSize(7);doc.setTextColor(120,80,0);
        doc.text('* Position shared due to equal total marks (tie)',8,doc.lastAutoTable.finalY+4);
        currentY=doc.lastAutoTable.finalY+9;
      } else {
        currentY=doc.lastAutoTable.finalY+8;
      }
    });

  } else {
    const sections=tsSubjectRows(examName);
    if(!sections.length){toast('No records found.',true);return;}
    let firstSection=true;
    sections.forEach(sec=>{
      if(!firstSection&&doc.lastAutoTable){
        y=doc.lastAutoTable.finalY+8;
        if(y>doc.internal.pageSize.getHeight()-30){
          doc.addPage();
          y=pdfHeader(doc,'TOP STUDENTS REPORT','UPPER PRIMARY AND JUNIOR SCHOOL');
          const _Ws=doc.internal.pageSize.getWidth();doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(80,100,130);doc.text(`${examName}  |  ${modeLabel}  |  ${new Date().toLocaleDateString('en-KE')}`,_Ws/2,y,{align:'center'});y+=6;
        }
      }
      const W=doc.internal.pageSize.getWidth();
      doc.setFillColor(255,220,220); doc.rect(4,y,W-8,7,'F');
      doc.setFillColor(242,199,68);  doc.rect(4,y+6,W-8,1,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(11,29,58);
      doc.text(`Grade ${sec.grade}`,8,y+4.8);
      doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(80,100,130);
      doc.text(`${sec.total} records  |  Boys: ${sec.boyCount}  |  Girls: ${sec.girlCount}`,W-8,y+4.8,{align:'right'});
      y+=10;

      doc.autoTable({
        tableLineColor:[0,0,0],tableLineWidth:0.4,
        startY:y,margin:{left:4,right:4},
        head:[['Subject','Top Boy','Adm No','Score','Rubric','Top Girl','Adm No','Score','Rubric']],
        body:sec.rows.map(r=>[r.subject,r.boyName,r.boyAdm,r.boyScore,r.boyRubric,r.girlName,r.girlAdm,r.girlScore,r.girlRubric]),
        theme:'grid',
        headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:7,cellPadding:1.5},
        styles:{fontSize:7.5,cellPadding:1.8,halign:'center',lineColor:[0,0,0],lineWidth:0.4},
        columnStyles:{
          0:{cellWidth:18,fontStyle:'bold',halign:'left',textColor:[30,60,120]},
          1:{cellWidth:44,halign:'left',fontStyle:'bold',fontSize:7.5},
          2:{cellWidth:18,fontSize:6.5,textColor:[80,80,80]},
          3:{cellWidth:13,fontStyle:'bold',fontSize:9},
          4:{cellWidth:13,fontSize:6.5},
          5:{cellWidth:44,halign:'left',fontStyle:'bold',fontSize:7.5},
          6:{cellWidth:18,fontSize:6.5,textColor:[80,80,80]},
          7:{cellWidth:13,fontStyle:'bold',fontSize:9},
          8:{cellWidth:13,fontSize:6.5}
        },
        didParseCell(d){
          if(d.section==='body'){
            if(d.row.index%2===0&&d.column.index>0&&d.column.index!==4&&d.column.index!==8)
              d.cell.styles.fillColor=[255,245,245];
            if(d.column.index===4||d.column.index===8){
              const fk=String(d.cell.raw||'').replace('.','');
              if(fills[fk]){d.cell.styles.fillColor=fills[fk];d.cell.styles.textColor=[0,0,0];d.cell.styles.fontStyle='bold';}
            }
            if(d.column.index===3||d.column.index===7){
              d.cell.styles.textColor=[0,0,0];d.cell.styles.fontStyle='bold';
            }
          }
        },
        didDrawPage(){pdfFooter(doc);}
      });
      firstSection=false;
    });
  }

  addPageNumbers(doc);
  doc.save(`TopStudents_${examName.replace(/\s+/g,'_')}_${mode==='class'?'PerClass':'PerSubject'}.pdf`);
  toast('✅ PDF exported');
}

function exportTopStudentsExcel(){
  const {examName,mode}=tsGetData();
  if(!examName){toast('⚠️ Please select an exam first.',true);return;}
  ensureXLSX(()=>{
    const wb=XLSX.utils.book_new();
    if(mode==='class'){
      const rows=tsClassRows(examName);
      const aoa=[
        ['SANTAPRIS ACADEMY — UPPER PRIMARY AND JUNIOR SCHOOL'],
        [`TOP 3 STUDENTS PER CLASS — ${examName}`],
        [`Generated: ${new Date().toLocaleDateString('en-KE')}`],
        [],
        ['Grade/Class','Position','Student','Adm No','Total Marks','Out Of','Total Points','Out Of Points','Rubric','Class Rank','Class Size','Tie?']
      ];
      rows.forEach(r=>{
        aoa.push([
          r.grade,
          r.name==='—'?'—':r.position+(r.isTie?' (tie)':''),
          r.name,
          r.admNo,
          r.total,r.outOf,
          r.totalPoints,r.outOfPoints,
          r.overallRubric,
          r.classRank==='—'?'—':`${r.classRank} / ${r.gradeTotalCount}`,
          r.count,
          r.isTie?'Yes':''
        ]);
      });
      const ws=XLSX.utils.aoa_to_sheet(aoa);
      ws['!cols']=[{wch:10},{wch:12},{wch:30},{wch:12},{wch:14},{wch:10},{wch:14},{wch:14},{wch:10},{wch:14},{wch:12},{wch:6}];
      XLSX.utils.book_append_sheet(wb,ws,'Top 3 Per Class');

      // Per-grade sheets
      const gradeLevels=[...new Set(ALL_GRADES.map(g=>g.charAt(0)))];
      gradeLevels.forEach(lvl=>{
        const lvlRows=rows.filter(r=>r.grade.charAt(0)===lvl&&r.name!=='—');
        if(!lvlRows.length) return;
        const gAoa=[
          ['SANTAPRIS ACADEMY — UPPER PRIMARY AND JUNIOR SCHOOL'],
          [`Grade ${lvl} — Top 3 Students Per Class`],
          [`Exam: ${examName}`],[],
          ['Grade/Class','Position','Student','Adm No','Total Marks','Out Of','Points','Out Of Points','Rubric','Class Rank','Class Size','Tie?']
        ];
        lvlRows.forEach(r=>gAoa.push([r.grade,r.position+(r.isTie?' (tie)':''),r.name,r.admNo,r.total,r.outOf,r.totalPoints,r.outOfPoints,r.overallRubric,r.classRank==='—'?'—':`${r.classRank}/${r.gradeTotalCount}`,r.count,r.isTie?'Yes':'']));
        const gws=XLSX.utils.aoa_to_sheet(gAoa);
        gws['!cols']=[{wch:10},{wch:12},{wch:30},{wch:12},{wch:14},{wch:10},{wch:12},{wch:14},{wch:10},{wch:14},{wch:10},{wch:6}];
        XLSX.utils.book_append_sheet(wb,gws,`Grade_${lvl}`.substring(0,31));
      });

    } else {
      const sections=tsSubjectRows(examName);
      const aoa=[
        ['SANTAPRIS ACADEMY — UPPER PRIMARY AND JUNIOR SCHOOL'],
        [`TOP BOY & GIRL PER SUBJECT — ${examName}`],
        [`Generated: ${new Date().toLocaleDateString('en-KE')}`],[]
      ];
      sections.forEach(sec=>{
        aoa.push([`GRADE ${sec.grade}  (${sec.boyCount} boys · ${sec.girlCount} girls)`]);
        aoa.push(['Subject','Top Boy','Adm No','Boy Score','Boy Rubric','Top Girl','Adm No','Girl Score','Girl Rubric']);
        sec.rows.forEach(r=>aoa.push([r.subject,r.boyName,r.boyAdm,r.boyScore,r.boyRubric,r.girlName,r.girlAdm,r.girlScore,r.girlRubric]));
        aoa.push([]);
        const gAoa=[
          ['SANTAPRIS ACADEMY — UPPER PRIMARY AND JUNIOR SCHOOL'],
          [`Grade ${sec.grade} — Top Boy & Girl Per Subject`],
          [`Exam: ${examName}  |  ${sec.boyCount} boys · ${sec.girlCount} girls`],[],
          ['Subject','Top Boy','Adm No','Boy Score','Boy Rubric','Top Girl','Adm No','Girl Score','Girl Rubric'],
          ...sec.rows.map(r=>[r.subject,r.boyName,r.boyAdm,r.boyScore,r.boyRubric,r.girlName,r.girlAdm,r.girlScore,r.girlRubric])
        ];
        const gws=XLSX.utils.aoa_to_sheet(gAoa);
        gws['!cols']=[{wch:10},{wch:26},{wch:12},{wch:10},{wch:10},{wch:26},{wch:12},{wch:10},{wch:10}];
        XLSX.utils.book_append_sheet(wb,gws,`Grade_${sec.grade}`.substring(0,31));
      });
      const ws=XLSX.utils.aoa_to_sheet(aoa);
      ws['!cols']=[{wch:10},{wch:26},{wch:12},{wch:10},{wch:10},{wch:26},{wch:12},{wch:10},{wch:10}];
      XLSX.utils.book_append_sheet(wb,ws,'All Classes');
    }
    XLSX.writeFile(wb,`TopStudents_${examName.replace(/\s+/g,'_')}_${mode==='class'?'Top3PerClass':'PerSubject'}.xlsx`);
    toast('✅ Excel exported');
  });
}

function exportTopStudentsWord(){
  const {examName,mode}=tsGetData();
  if(!examName){toast('⚠️ Please select an exam first.',true);return;}
  const orientSel=document.getElementById('tsOrientation');
  const tsOrient=orientSel?orientSel.value:'portrait';
  const medalColors={1:'#B8860B',2:'#808080',3:'#8B4513'};
  const medalBg={1:'#FFF9C4',2:'#F0F0F0',3:'#FDEBD0'};
  const styles=`body{font-family:Calibri,Arial,sans-serif;font-size:10pt;color:#1a2a1e;margin:20mm}h1{font-size:14pt;color:#0a5c32;border-bottom:2pt solid #0a5c32;padding-bottom:4pt;margin-bottom:6pt}.subtitle{font-size:11pt;color:#b22222;font-weight:bold;margin-bottom:2pt}.meta{font-size:9pt;color:#5a7a6a;margin-bottom:12pt}table{width:100%;border-collapse:collapse;margin-bottom:12pt;font-size:9pt}th{background:#b22222;color:#fff;padding:5pt 7pt;text-align:left;font-weight:bold}td{padding:4pt 7pt;border-bottom:1pt solid #c8dfd0}tr:nth-child(even) td{background:#fff5f5}.grade-banner{background:#ffe0e0;padding:5pt 8pt;font-weight:bold;color:#8b0000;margin-top:14pt;border-left:3pt solid #b22222}.tie-note{font-size:8pt;color:#7a5800;font-style:italic;margin-top:2pt}@page{size:A4 ` + (tsOrient==='landscape' ? 'landscape' : 'portrait') + `;margin:18mm}`;
  const modeLabel=mode==='class'?'Top 3 Per Class (Overall)':'Top Boy & Girl Per Subject Per Class';
  let body=`<h1>Top Students Report</h1><div class="subtitle">UPPER PRIMARY AND JUNIOR SCHOOL</div><div class="meta">Exam: <b>${examName}</b> &nbsp;|&nbsp; ${modeLabel} &nbsp;|&nbsp; ${new Date().toLocaleDateString('en-KE')}</div>`;

  if(mode==='class'){
    const rows=tsClassRows(examName);
    // Group by grade level
    const gradeLevels=[...new Set(ALL_GRADES.map(g=>g.charAt(0)))];
    gradeLevels.forEach(lvl=>{
      const lvlRows=rows.filter(r=>r.grade.charAt(0)===lvl&&r.name!=='—');
      if(!lvlRows.length) return;
      const isJnr=['7','8','9'].includes(lvl);
      const marksOut=isJnr?900:800;
      body+=`<div class="grade-banner">Grade ${lvl} &nbsp;— Marks out of ${marksOut}</div>`;
      body+=`<table><thead><tr><th>Class</th><th>Position</th><th>Student</th><th>Adm No</th><th>Total Marks</th><th>Points</th><th>Rubric</th><th>Class Rank</th></tr></thead><tbody>`;
      lvlRows.forEach(r=>{
        const bg=medalBg[r.position]||'';
        const posLabel=r.position+(r.isTie?' *':'');
        body+=`<tr style="background:${bg}"><td><b>${r.grade}</b></td><td style="font-weight:bold;color:${medalColors[r.position]||'#333'}">${posLabel}</td><td>${r.name}</td><td style="font-size:8pt;color:#555">${r.admNo}</td><td><b>${r.total}</b> / ${r.outOf}</td><td>${r.totalPoints} / ${r.outOfPoints}</td><td>${r.overallRubric}</td><td>${r.classRank==='—'?'—':`${r.classRank} / ${r.gradeTotalCount}`}</td></tr>`;
      });
      body+=`</tbody></table>`;
      if(lvlRows.some(r=>r.isTie)) body+=`<div class="tie-note">* Position shared due to equal total marks (tie)</div>`;
    });
  } else {
    const sections=tsSubjectRows(examName);
    sections.forEach(sec=>{
      body+=`<div class="grade-banner">Grade ${sec.grade} &nbsp;(${sec.boyCount} boys · ${sec.girlCount} girls)</div><table><thead><tr><th>Subject</th><th>Top Boy</th><th>Adm</th><th>Score</th><th>Rubric</th><th>Top Girl</th><th>Adm</th><th>Score</th><th>Rubric</th></tr></thead><tbody>`;
      sec.rows.forEach(r=>{body+=`<tr><td><b>${r.subject}</b></td><td>${r.boyName}</td><td>${r.boyAdm}</td><td><b>${r.boyScore}</b></td><td>${r.boyRubric}</td><td>${r.girlName}</td><td>${r.girlAdm}</td><td><b>${r.girlScore}</b></td><td>${r.girlRubric}</td></tr>`;});
      body+=`</tbody></table>`;
    });
  }

  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${styles}</style></head><body>${body}</body></html>`;
  const blob=new Blob(['\ufeff',html],{type:'application/msword'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;
  a.download=`TopStudents_${examName.replace(/\s+/g,'_')}_${mode==='class'?'Top3PerClass':'PerSubject'}.doc`;
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url),5000);
  toast('✅ Word document exported');
}



/* ═══════════════════════════════════════════════════════
   DARK / LIGHT MODE TOGGLE (html.force-light overrides in 01-main.css)
   ═══════════════════════════════════════════════════════ */
function _syncThemeBtn(){
  try{
    const b = document.getElementById('darkModeBtn');
    if(b) b.textContent = document.documentElement.classList.contains('force-light') ? '☀️' : '🌙';
  }catch(e){}
}
function toggleDarkMode(){
  document.documentElement.classList.toggle('force-light');
  _syncThemeBtn();
  try{localStorage.setItem('santapris_theme', document.documentElement.classList.contains('force-light') ? 'light' : 'dark');}catch(e){}
}
(function(){
  try{
    // Head script already applied the class pre-paint; just sync the icon.
    _syncThemeBtn();
    setTimeout(_syncThemeBtn, 500);
  }catch(e){}
})();

/* ═══════════════════════════════════════════════════════
   ANIMATED STAT COUNTERS
   ═══════════════════════════════════════════════════════ */
function animateCounter(el,target,duration=1200){
  const start=0,step=target/Math.max(1,Math.floor(duration/16));
  let cur=0;
  const t=setInterval(()=>{
    cur=Math.min(cur+step,target);
    el.textContent=Math.round(cur);
    if(cur>=target)clearInterval(t);
  },16);
}
function runCounterAnimations(){
  document.querySelectorAll('.animated-counter').forEach(el=>{
    const tgt=parseInt(el.dataset.target||el.textContent)||0;
    animateCounter(el,tgt);
  });
}
// Hook into existing renderDashboard
const _origRenderDashboard_v2=renderDashboard;
renderDashboard=function(){
  _origRenderDashboard_v2.apply(this,arguments);
  // Update data-target values from live db
  const stuEl=document.getElementById('dashStu');
  const tchEl=document.getElementById('dashTch');
  const exEl=document.getElementById('dashEx');
  const clEl=document.getElementById('dashActiveClasses');
  if(stuEl){stuEl.dataset.target=db.students.length;}
  if(tchEl){tchEl.dataset.target=db.teachers.length;}
  if(exEl){exEl.dataset.target=db.exams.length;}
  if(clEl){const cls=new Set(db.exams.map(e=>e.grade)).size;clEl.dataset.target=cls;clEl.textContent=cls;}
  setTimeout(runCounterAnimations,100);
  renderDashAlerts();
};

/* ═══════════════════════════════════════════════════════
   SMART ALERTS
   ═══════════════════════════════════════════════════════ */
function renderDashAlerts(){
  const el=document.getElementById('dashAlerts');
  if(!el)return;
  const exams=[...new Set(db.exams.map(e=>e.examName||'Untitled'))].sort();
  if(exams.length<2){el.innerHTML='';return;}
  const latest=exams[exams.length-1];
  const prev=exams[exams.length-2];
  const alerts=[];
  ALL_GRADES.forEach(g=>{
    const subjects=getSubjects(g);
    subjects.forEach(s=>{
      const m1=getMeanScore(prev,g,s);
      const m2=getMeanScore(latest,g,s);
      if(m1!==null&&m2!==null&&(m1-m2)>=10){
        alerts.push({grade:g,subject:s,drop:Math.round(m1-m2),from:m1.toFixed(1),to:m2.toFixed(1)});
      }
    });
  });
  if(!alerts.length){el.innerHTML='';return;}
  let html=`<div style="background:rgba(255,78,106,0.08);border:1px solid rgba(255,78,106,0.3);border-radius:12px;padding:16px 20px;margin-bottom:20px">
    <div style="font-weight:700;font-size:13px;color:var(--rose);margin-bottom:10px">⚠️ Performance Alerts — ${alerts.length} class/subject combination${alerts.length>1?'s':''} dropped ≥10 pts (${prev} → ${latest})</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px">`;
  alerts.slice(0,12).forEach(a=>{
    html+=`<div style="background:rgba(255,78,106,0.12);border:1px solid rgba(255,78,106,0.2);border-radius:8px;padding:6px 12px;font-size:12px">
      <span style="font-weight:700;color:var(--rose)">${a.grade} ${a.subject}</span>
      <span style="color:var(--text-muted)"> — dropped </span>
      <span style="font-weight:700;color:var(--rose)">${a.drop} pts</span>
      <span style="color:var(--text-muted)"> (${a.from}→${a.to})</span>
    </div>`;
  });
  if(alerts.length>12)html+=`<div style="font-size:12px;color:var(--text-muted);padding:6px 12px">...and ${alerts.length-12} more</div>`;
  html+=`</div></div>`;
  el.innerHTML=html;
}

/* ═══════════════════════════════════════════════════════
   GLOBAL QUICK SEARCH (Ctrl+K)
   ═══════════════════════════════════════════════════════ */
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();openQuickSearch();}});
function openQuickSearch(){
  const ov=document.getElementById('quickSearchOverlay');
  ov.style.display='flex';
  setTimeout(()=>document.getElementById('quickSearchInput').focus(),50);
  document.getElementById('quickSearchResults').innerHTML='<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px">Start typing to search students, teachers, or exam records...</div>';
  document.getElementById('quickSearchInput').value='';
}
function closeQuickSearch(){
  document.getElementById('quickSearchOverlay').style.display='none';
}
function runQuickSearch(q){
  const res=document.getElementById('quickSearchResults');
  if(!q||q.length<2){res.innerHTML='<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px">Type at least 2 characters to search...</div>';return;}
  const ql=q.toLowerCase();
  const stuHits=db.students.filter(s=>(s.fullName||'').toLowerCase().includes(ql)||(s.admNo||'').toLowerCase().includes(ql)).slice(0,5);
  const tchHits=db.teachers.filter(t=>(t.name||'').toLowerCase().includes(ql)).slice(0,3);
  const exHits=[...new Set(db.exams.filter(e=>(e.examName||'').toLowerCase().includes(ql)||(e.grade||'').toLowerCase()===ql||(e.name||'').toLowerCase().includes(ql)).map(e=>e.examName))].slice(0,3);
  let html='';
  if(stuHits.length){html+=`<div style="padding:8px 16px;font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:600;border-bottom:1px solid var(--border)">Students</div>`;
    stuHits.forEach(s=>{const g=s.gender==='Male'?'👦':'👧';html+=`<div onclick="closeQuickSearch();openStudentProfile('${s.admNo}')" style="padding:12px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid var(--border)" onmouseover="this.style.background='var(--surface-2)'" onmouseout="this.style.background=''">
      <span style="font-size:20px">${g}</span><div style="flex:1"><div style="font-weight:600;font-size:13px">${s.fullName}</div><div style="font-size:11px;color:var(--text-muted)">${s.admNo} · Grade ${s.grade||'—'}</div></div></div>`;});
  }
  if(tchHits.length){html+=`<div style="padding:8px 16px;font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:600;border-bottom:1px solid var(--border)">Teachers</div>`;
    tchHits.forEach(t=>{html+=`<div onclick="closeQuickSearch();showPage('teachers',null)" style="padding:12px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid var(--border)" onmouseover="this.style.background='var(--surface-2)'" onmouseout="this.style.background=''">
      <span style="font-size:20px">👩‍🏫</span><div style="flex:1"><div style="font-weight:600;font-size:13px">${t.name}</div><div style="font-size:11px;color:var(--text-muted)">${(t.assignments||[]).map(a=>a.subject).join(', ')||'No subjects'}</div></div></div>`;});
  }
  if(exHits.length){html+=`<div style="padding:8px 16px;font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:600;border-bottom:1px solid var(--border)">Exams</div>`;
    exHits.forEach(ex=>{html+=`<div onclick="closeQuickSearch();showPage('exams',null)" style="padding:12px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid var(--border)" onmouseover="this.style.background='var(--surface-2)'" onmouseout="this.style.background=''">
      <span style="font-size:20px">📝</span><div style="font-weight:600;font-size:13px">${ex}</div></div>`;});
  }
  if(!html)html='<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px">No results found for "'+q+'"</div>';
  res.innerHTML=html;
}

function exportGradeTrendsPDF(){
  const gradeF=document.getElementById('gtGrade').value;
  const subjF=document.getElementById('gtSubject').value;
  const exams=[...new Set(db.exams.map(e=>e.examName||'Untitled'))].sort();
  if(!exams.length)return toast('No exam data available',true);
  const jsPDF=window._getJsPDF();
  const doc=new jsPDF({orientation:exams.length>3?'landscape':'portrait'});
  let y=pdfHeader(doc,'GRADE PERFORMANCE TRENDS','UPPER PRIMARY AND JUNIOR SCHOOL');
  const W=doc.internal.pageSize.getWidth();
  doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(80,100,130);
  const filterLabel=(gradeF?`Grade ${gradeF}`:' All Grades')+(subjF?` | Subject: ${subjF}`:'');
  doc.text(filterLabel+' | '+new Date().toLocaleDateString('en-KE'),W/2,y,{align:'center'});y+=8;
  const grades=gradeF?[gradeF]:ALL_GRADES;
  const subjects=subjF?[subjF]:ALL_SUBJ;
  const head=[['Grade','Subject',...exams]];
  const body=[];
  grades.forEach(grade=>{
    const gSubjs=getSubjects(grade);
    const filtSubjs=subjects.filter(s=>gSubjs.includes(s));
    filtSubjs.forEach(s=>{
      const row=[grade,s];
      exams.forEach(ex=>{
        const recs=db.exams.filter(e=>e.grade===grade&&(e.examName||'Untitled')===ex&&e.scores&&e.scores[s]!==undefined);
        row.push(recs.length?(recs.reduce((a,e)=>a+(e.scores[s]||0),0)/recs.length).toFixed(1):'—');
      });
      body.push(row);
    });
  });
  if(!body.length){toast('No data for filters',true);return;}
  doc.autoTable({startY:y,head,body,theme:'grid',
    headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:7.5},
    styles:{fontSize:7.5,cellPadding:1.5,halign:'center',lineColor:[0,0,0],lineWidth:0.4},
    columnStyles:{0:{fontStyle:'bold',halign:'left'},1:{halign:'left'}},
    margin:{left:4,right:4}});
  addPageNumbers(doc);pdfFooter(doc);
  doc.save(`GradeTrends${gradeF?'_'+gradeF:''}.pdf`);toast('✅ PDF exported');
}

/* ═══════════════════════════════════════════════════════
   HALL OF FAME
   ═══════════════════════════════════════════════════════ */
function populateHofExams(){
  const sel=document.getElementById('hofExam');if(!sel)return;
  const names=[...new Set(db.exams.map(e=>e.examName||'Untitled'))].sort();
  const cur=sel.value||names[names.length-1]||'';
  sel.innerHTML='<option value="">— Select Exam —</option>'+names.map(n=>`<option${n===cur?' selected':''}>${n}</option>`).join('');
}
function renderHallOfFame(){
  populateHofExams();
  const examName=document.getElementById('hofExam').value;
  const cont=document.getElementById('hofContent');
  if(!examName){cont.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted)">Please select an exam above.</div>';return;}
  // Get top 10 school-wide
  const all=db.exams.filter(e=>(e.examName||'Untitled')===examName).sort((a,b)=>(b.total||0)-(a.total||0));
  const medals=['🥇','🥈','🥉'];
  const medalColors=['linear-gradient(135deg,#b8860b,#FFD700)','linear-gradient(135deg,#808080,#C0C0C0)','linear-gradient(135deg,#8B4513,#CD7F32)'];
  let html=`<div style="text-align:center;margin-bottom:32px">
    <div style="font-size:36px;margin-bottom:8px">🎖️</div>
    <div style="font-size:22px;font-weight:800;color:var(--gold)">${examName}</div>
    <div style="font-size:14px;color:var(--text-muted);margin-top:4px">Top Performers — All Classes</div>
  </div>`;
  // Podium for top 3
  if(all.length>=3){
    html+=`<div style="display:flex;align-items:flex-end;justify-content:center;gap:8px;margin-bottom:32px">`;
    [[1,all[1],260,'silver'],[0,all[0],300,'gold'],[2,all[2],220,'bronze']].forEach(([i,rec,h,color])=>{
      const name=tsStudentName(rec.admNo);
      const grade=rec.grade||'—';
      const colors={'gold':medalColors[0],'silver':medalColors[1],'bronze':medalColors[2]};
      const labelColors={'gold':'#7a5500','silver':'#444','bronze':'#5a2d0c'};
      html+=`<div style="display:flex;flex-direction:column;align-items:center;width:160px">
        <div style="font-size:28px;margin-bottom:6px">${medals[i]}</div>
        <div style="font-weight:800;font-size:13px;text-align:center;margin-bottom:4px;color:var(--text)">${name}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">Grade ${grade}</div>
        <div style="font-family:monospace;font-size:20px;font-weight:800;color:var(--gold);margin-bottom:8px">${rec.total||0}</div>
        <div style="width:100%;height:${h-100}px;background:${colors[color]};border-radius:12px 12px 0 0;display:flex;align-items:center;justify-content:center">
          <span style="font-size:32px">${medals[i]}</span>
        </div>
        <div style="width:100%;background:var(--surface-2);border:1px solid var(--border);border-top:none;padding:8px;text-align:center;border-radius:0 0 8px 8px">
          <div style="font-weight:700;font-size:12px;color:${labelColors[color]}">Rank ${i+1}</div>
        </div>
      </div>`;
    });
    html+=`</div>`;
  }
  // Full leaderboard
  html+=`<div class="card"><div class="card-header"><div class="card-title">🏆 Full Leaderboard</div></div><div class="card-body"><div class="table-wrap"><table><thead><tr><th>Rank</th><th>Student</th><th>Adm No</th><th>Grade</th><th>Total</th><th>Rubric</th></tr></thead><tbody>`;
  all.slice(0,20).forEach((rec,i)=>{
    const name=tsStudentName(rec.admNo);
    const isJnr=['7','8','9'].includes((rec.grade||'').charAt(0));
    const subjects=getSubjects(rec.grade||'4N');
    const pts=subjects.filter(s=>rec.scores&&rec.scores[s]!==undefined).reduce((a,s)=>a+getRubric(rec.scores[s],rec.grade,rec.examName).pts,0);
    const tr=getTotalRubric(Math.round(pts),isJnr);
    const rub=tr?tr.code:'—';
    const medal=i<3?medals[i]:`${i+1}`;
    html+=`<tr><td style="font-weight:800;font-size:16px;text-align:center">${medal}</td><td style="font-weight:700">${name}</td><td><span class="adm-badge">${rec.admNo}</span></td><td><span class="badge badge-blue">${rec.grade}</span></td><td style="font-family:monospace;font-weight:800;color:var(--gold);font-size:15px">${rec.total||0}</td><td>${rub}</td></tr>`;
  });
  html+=`</tbody></table></div></div></div>`;
  cont.innerHTML=html;
  // Confetti animation
  launchConfetti();
}
function launchConfetti(){
  const colors=['#FFD700','#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8'];
  for(let i=0;i<60;i++){
    const conf=document.createElement('div');
    conf.style.cssText=`position:fixed;top:-20px;left:${Math.random()*100}vw;width:10px;height:10px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>0.5?'50%':'2px'};pointer-events:none;z-index:9999;animation:confettiFall ${1.5+Math.random()*2}s linear ${Math.random()}s forwards`;
    document.body.appendChild(conf);
    setTimeout(()=>conf.remove(),4000);
  }
  if(!document.getElementById('confettiCSS')){
    const s=document.createElement('style');s.id='confettiCSS';
    s.textContent='@keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}';
    document.head.appendChild(s);
  }
}

/* ═══════════════════════════════════════════════════════
   PERFORMANCE HEATMAP
   ═══════════════════════════════════════════════════════ */
function populateHmExams(){
  const sel=document.getElementById('hmExam');if(!sel)return;
  const names=[...new Set(db.exams.map(e=>e.examName||'Untitled'))].sort();
  const cur=sel.value||names[names.length-1]||'';
  sel.innerHTML='<option value="">— Select Exam —</option>'+names.map(n=>`<option${n===cur?' selected':''}>${n}</option>`).join('');
}
function renderHeatmap(){
  const examName=document.getElementById('hmExam').value;
  const cont=document.getElementById('hmContent');
  if(!examName){cont.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted)">Please select an exam above.</div>';return;}
  const subjects=ALL_SUBJ;
  const grades=ALL_GRADES.filter(g=>db.exams.some(e=>e.grade===g&&(e.examName||'Untitled')===examName));
  if(!grades.length){cont.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted)">No data for this exam.</div>';return;}
  function scoreColor(v){
    if(v===null)return'var(--surface-2)';
    if(v>=80)return'rgba(46,139,87,0.8)';
    if(v>=70)return'rgba(0,180,120,0.6)';
    if(v>=60)return'rgba(100,200,100,0.5)';
    if(v>=50)return'rgba(242,199,68,0.6)';
    if(v>=40)return'rgba(255,140,0,0.6)';
    return'rgba(220,50,70,0.7)';
  }
  function textColor(v){return(v!==null&&v<55)?'#fff':'var(--text)';}
  let html=`<div style="overflow-x:auto"><table style="border-collapse:collapse;width:100%;min-width:600px"><thead><tr>
    <th style="padding:10px 14px;text-align:left;background:var(--surface-2);font-size:12px;border:1px solid var(--border)">Grade</th>`;
  subjects.forEach(s=>{html+=`<th style="padding:8px 10px;text-align:center;background:var(--surface-2);font-size:11px;border:1px solid var(--border);min-width:70px">${s}</th>`;});
  html+=`<th style="padding:8px 10px;text-align:center;background:var(--surface-2);font-size:11px;border:1px solid var(--border)">Avg</th></tr></thead><tbody>`;
  grades.forEach(grade=>{
    const gSubjs=getSubjects(grade);
    let rowTotal=0,rowCount=0;
    const cells=subjects.map(s=>{
      if(!gSubjs.includes(s))return{v:null,color:'var(--surface-3)'};
      const recs=db.exams.filter(e=>e.grade===grade&&(e.examName||'Untitled')===examName&&e.scores&&e.scores[s]!==undefined);
      if(!recs.length)return{v:null,color:'var(--surface-2)'};
      const mean=recs.reduce((a,e)=>a+(e.scores[s]||0),0)/recs.length;
      rowTotal+=mean;rowCount++;
      return{v:mean,color:scoreColor(mean)};
    });
    const rowAvg=rowCount?rowTotal/rowCount:null;
    html+=`<tr><td style="padding:10px 14px;font-weight:700;background:var(--surface-2);border:1px solid var(--border);font-size:13px;color:var(--sky)">${grade}</td>`;
    cells.forEach(c=>{html+=`<td style="padding:8px 10px;text-align:center;background:${c.color};border:1px solid var(--border);font-family:monospace;font-weight:700;font-size:12px;color:${textColor(c.v)}">${c.v!==null?c.v.toFixed(1):'—'}</td>`;});
    html+=`<td style="padding:8px 10px;text-align:center;background:${scoreColor(rowAvg)};border:1px solid var(--border);font-weight:800;font-size:13px;color:${textColor(rowAvg)}">${rowAvg!==null?rowAvg.toFixed(1):'—'}</td></tr>`;
  });
  html+=`</tbody></table></div>`;
  // Legend
  html+=`<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;font-size:12px">
    <div style="display:flex;align-items:center;gap:6px"><div style="width:20px;height:16px;background:rgba(46,139,87,0.8);border-radius:3px"></div>≥80 (Excellent)</div>
    <div style="display:flex;align-items:center;gap:6px"><div style="width:20px;height:16px;background:rgba(0,180,120,0.6);border-radius:3px"></div>70–79</div>
    <div style="display:flex;align-items:center;gap:6px"><div style="width:20px;height:16px;background:rgba(100,200,100,0.5);border-radius:3px"></div>60–69</div>
    <div style="display:flex;align-items:center;gap:6px"><div style="width:20px;height:16px;background:rgba(242,199,68,0.6);border-radius:3px"></div>50–59</div>
    <div style="display:flex;align-items:center;gap:6px"><div style="width:20px;height:16px;background:rgba(255,140,0,0.6);border-radius:3px"></div>40–49</div>
    <div style="display:flex;align-items:center;gap:6px"><div style="width:20px;height:16px;background:rgba(220,50,70,0.7);border-radius:3px"></div>&lt;40 (Needs attention)</div>
  </div>`;
  cont.innerHTML=html;
}

/* ═══════════════════════════════════════════════════════
   GRADE TRENDS
   ═══════════════════════════════════════════════════════ */
function populateGtDropdowns(){
  const gSel=document.getElementById('gtGrade');const sSel=document.getElementById('gtSubject');
  if(!gSel||!sSel)return;
  const curG=gSel.value,curS=sSel.value;
  gSel.innerHTML='<option value="">All Grades</option>'+ALL_GRADES.map(g=>`<option${g===curG?' selected':''}>${g}</option>`).join('');
  sSel.innerHTML='<option value="">All Subjects</option>'+ALL_SUBJ.map(s=>`<option${s===curS?' selected':''}>${s}</option>`).join('');
}
function renderGradeTrends(){
  const gradeF=document.getElementById('gtGrade').value;
  const subjF=document.getElementById('gtSubject').value;
  const cont=document.getElementById('gtContent');
  const exams=[...new Set(db.exams.map(e=>e.examName||'Untitled'))].sort();
  if(exams.length<1){cont.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted)">No exam data available.</div>';return;}
  const grades=gradeF?[gradeF]:ALL_GRADES;
  const subjects=subjF?[subjF]:ALL_SUBJ;
  let html='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:16px">';
  grades.forEach(grade=>{
    const gSubjs=getSubjects(grade);
    const filtSubjs=subjects.filter(s=>gSubjs.includes(s));
    if(!filtSubjs.length)return;
    const hasData=exams.some(ex=>db.exams.some(e=>e.grade===grade&&(e.examName||'Untitled')===ex));
    if(!hasData)return;
    html+=`<div class="card"><div class="card-header"><div class="card-title">Grade ${grade}</div></div><div class="card-body">`;
    const maxW=300,barH=16,pad=4;
    filtSubjs.forEach(s=>{
      html+=`<div style="margin-bottom:12px"><div style="font-size:11px;font-weight:700;color:var(--sky);margin-bottom:4px">${s}</div><div style="display:flex;gap:4px;align-items:flex-end">`;
      exams.forEach(ex=>{
        const recs=db.exams.filter(e=>e.grade===grade&&(e.examName||'Untitled')===ex&&e.scores&&e.scores[s]!==undefined);
        const mean=recs.length?recs.reduce((a,e)=>a+(e.scores[s]||0),0)/recs.length:null;
        const pct=mean!==null?mean:0;
        const color=pct>=70?'var(--emerald)':pct>=50?'var(--gold)':'var(--rose)';
        html+=`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px">
          <div style="font-size:9px;font-weight:700;color:${color}">${mean!==null?mean.toFixed(1):'—'}</div>
          <div style="width:100%;height:${mean!==null?Math.max(4,Math.round(pct*0.5))+'px':'4px'};background:${mean!==null?color:'var(--surface-3)'};border-radius:2px 2px 0 0;min-height:4px"></div>
          <div style="font-size:8px;color:var(--text-muted);text-align:center;max-width:50px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis" title="${ex}">${ex.split(' ')[0]}</div>
        </div>`;
      });
      html+='</div></div>';
    });
    html+='</div></div>';
  });
  html+='</div>';
  if(html==='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:16px"></div>')
    html='<div style="padding:40px;text-align:center;color:var(--text-muted)">No data for the selected filters.</div>';
  cont.innerHTML=html;
}

/* ═══════════════════════════════════════════════════════
   MOST IMPROVED
   ═══════════════════════════════════════════════════════ */
function populateMiDropdowns(){
  const exams=[...new Set(db.exams.map(e=>e.examName||'Untitled'))].sort();
  ['miExam1','miExam2'].forEach(id=>{
    const sel=document.getElementById(id);if(!sel)return;
    const cur=sel.value;
    sel.innerHTML='<option value="">— Select Exam —</option>'+exams.map(n=>`<option${n===cur?' selected':''}>${n}</option>`).join('');
  });
  const gSel=document.getElementById('miGrade');if(!gSel)return;
  const curG=gSel.value;
  gSel.innerHTML='<option value="">All Grades</option>'+ALL_GRADES.map(g=>`<option${g===curG?' selected':''}>${g}</option>`).join('');
}
function getMostImprovedData(){
  const ex1=document.getElementById('miExam1').value;
  const ex2=document.getElementById('miExam2').value;
  const gradeF=document.getElementById('miGrade').value;
  if(!ex1||!ex2||ex1===ex2)return null;
  const grades=gradeF?[gradeF]:ALL_GRADES;
  const rows=[];
  grades.forEach(grade=>{
    const recs1=db.exams.filter(e=>e.grade===grade&&(e.examName||'Untitled')===ex1);
    const recs2=db.exams.filter(e=>e.grade===grade&&(e.examName||'Untitled')===ex2);
    recs1.forEach(r1=>{
      const r2=recs2.find(r=>r.admNo===r1.admNo);
      if(!r2)return;
      const diff=(r2.total||0)-(r1.total||0);
      rows.push({admNo:r1.admNo,name:tsStudentName(r1.admNo),grade,score1:r1.total||0,score2:r2.total||0,diff});
    });
  });
  return{rows:rows.sort((a,b)=>b.diff-a.diff),ex1,ex2};
}
function renderMostImproved(){
  const cont=document.getElementById('miContent');
  const data=getMostImprovedData();
  if(!data){cont.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted)">Select two different exams to compare.</div>';return;}
  const {rows,ex1,ex2}=data;
  if(!rows.length){cont.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted)">No matching students found in both exams.</div>';return;}
  let html=`<div class="card"><div class="card-header"><div class="card-title">🚀 Most Improved — ${ex1} → ${ex2}</div><span style="font-size:11px;color:var(--text-muted)">${rows.length} students compared</span></div><div class="card-body"><div class="table-wrap"><table><thead><tr><th>Rank</th><th>Student</th><th>Grade</th><th>${ex1}</th><th>${ex2}</th><th>Change</th></tr></thead><tbody>`;
  rows.forEach((r,i)=>{
    const arrow=r.diff>0?'↑':r.diff<0?'↓':'→';
    const color=r.diff>0?'var(--emerald)':r.diff<0?'var(--rose)':'var(--text-muted)';
    html+=`<tr><td style="font-weight:700;text-align:center">${i+1}</td><td style="font-weight:600">${r.name}</td><td><span class="badge badge-blue">${r.grade}</span></td><td style="font-family:monospace">${r.score1}</td><td style="font-family:monospace;font-weight:700;color:var(--gold)">${r.score2}</td><td style="font-weight:800;color:${color};font-family:monospace">${arrow} ${Math.abs(r.diff)}</td></tr>`;
  });
  html+=`</tbody></table></div></div></div>`;
  cont.innerHTML=html;
}
function exportMostImprovedPDF(){
  const data=getMostImprovedData();
  if(!data||!data.rows.length)return toast('No data to export',true);
  const jsPDF=window._getJsPDF();
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  let y=pdfHeader(doc,'MOST IMPROVED STUDENTS','UPPER PRIMARY AND JUNIOR SCHOOL');
  doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(80,100,130);
  doc.text(`${data.ex1} → ${data.ex2}  |  ${new Date().toLocaleDateString('en-KE')}`,doc.internal.pageSize.getWidth()/2,y,{align:'center'});y+=8;
  doc.autoTable({startY:y,head:[['Rank','Student','Grade',data.ex1,data.ex2,'Change']],
    body:data.rows.map((r,i)=>[i+1,r.name,r.grade,r.score1,r.score2,(r.diff>0?'+':'')+r.diff]),
    theme:'grid',headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:8},
    styles:{fontSize:8.5,cellPadding:2,lineColor:[0,0,0],lineWidth:0.4},
    didParseCell(d){if(d.section==='body'&&d.column.index===5){const v=parseFloat(d.cell.raw);d.cell.styles.textColor=v>0?[0,150,80]:v<0?[200,50,50]:[80,80,80];d.cell.styles.fontStyle='bold';}},
    margin:{left:4,right:4}});
  addPageNumbers(doc);pdfFooter(doc);
  doc.save(`MostImproved_${data.ex1.replace(/\s+/g,'_')}_vs_${data.ex2.replace(/\s+/g,'_')}.pdf`);
  toast('✅ PDF exported');
}
function exportMostImprovedExcel(){
  const data=getMostImprovedData();
  if(!data||!data.rows.length)return toast('No data to export',true);
  ensureXLSX(()=>{
    const aoa=[['SANTAPRIS ACADEMY — UPPER PRIMARY AND JUNIOR SCHOOL'],[`MOST IMPROVED STUDENTS: ${data.ex1} → ${data.ex2}`],[`Generated: ${new Date().toLocaleDateString('en-KE')}`],[],['Rank','Student','Grade',data.ex1,data.ex2,'Change'],...data.rows.map((r,i)=>[i+1,r.name,r.grade,r.score1,r.score2,(r.diff>0?'+':'')+r.diff])];
    const ws=XLSX.utils.aoa_to_sheet(aoa);ws['!cols']=[{wch:6},{wch:30},{wch:10},{wch:16},{wch:16},{wch:10}];
    const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Most Improved');
    XLSX.writeFile(wb,`MostImproved_${data.ex1.replace(/\s+/g,'_')}.xlsx`);toast('✅ Excel exported');
  });
}

/* ═══════════════════════════════════════════════════════
   GENDER ANALYSIS
   ═══════════════════════════════════════════════════════ */
function populateGaDropdowns(){
  const exams=[...new Set(db.exams.map(e=>e.examName||'Untitled'))].sort();
  const eSel=document.getElementById('gaExam');if(!eSel)return;
  const curE=eSel.value||exams[exams.length-1]||'';
  eSel.innerHTML='<option value="">— Select Exam —</option>'+exams.map(n=>`<option${n===curE?' selected':''}>${n}</option>`).join('');
  const gSel=document.getElementById('gaGrade');if(!gSel)return;
  const curG=gSel.value;
  gSel.innerHTML='<option value="">All Grades</option>'+ALL_GRADES.map(g=>`<option${g===curG?' selected':''}>${g}</option>`).join('');
}
function renderGenderAnalysis(){
  const examName=document.getElementById('gaExam').value;
  const gradeF=document.getElementById('gaGrade').value;
  const cont=document.getElementById('gaContent');
  if(!examName){cont.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted)">Please select an exam.</div>';return;}
  const grades=gradeF?[gradeF]:ALL_GRADES;
  const subjects=ALL_SUBJ;
  let html='<div style="overflow-x:auto"><table style="border-collapse:collapse;width:100%;min-width:500px"><thead><tr><th style="padding:10px 14px;text-align:left;background:var(--surface-2);border:1px solid var(--border)">Subject</th>';
  grades.forEach(g=>{html+=`<th colspan="2" style="padding:8px 10px;text-align:center;background:var(--surface-2);border:1px solid var(--border);font-size:12px">${g}</th>`;});
  html+=`</tr><tr><th style="padding:6px 14px;background:var(--surface-2);border:1px solid var(--border)"></th>`;
  grades.forEach(()=>{html+=`<th style="padding:6px 8px;text-align:center;background:#e8f4ff;border:1px solid var(--border);font-size:10px;color:var(--sky)">👦 Boys</th><th style="padding:6px 8px;text-align:center;background:#fff0f5;border:1px solid var(--border);font-size:10px;color:var(--rose)">👧 Girls</th>`;});
  html+='</tr></thead><tbody>';
  subjects.forEach((s,si)=>{
    const bg=si%2===0?'':'var(--surface-2)';
    html+=`<tr><td style="padding:8px 14px;font-weight:700;color:var(--sky);border:1px solid var(--border);background:${bg}">${s}</td>`;
    grades.forEach(grade=>{
      if(!getSubjects(grade).includes(s)){html+=`<td colspan="2" style="text-align:center;border:1px solid var(--border);color:var(--text-muted);font-size:11px;background:${bg}">N/A</td>`;return;}
      const recs=db.exams.filter(e=>e.grade===grade&&(e.examName||'Untitled')===examName&&e.scores&&e.scores[s]!==undefined);
      const boys=recs.filter(e=>tsStudentGender(e.admNo)==='Male');
      const girls=recs.filter(e=>tsStudentGender(e.admNo)==='Female');
      const bMean=boys.length?boys.reduce((a,e)=>a+(e.scores[s]||0),0)/boys.length:null;
      const gMean=girls.length?girls.reduce((a,e)=>a+(e.scores[s]||0),0)/girls.length:null;
      const bColor=bMean!==null&&gMean!==null?(bMean>gMean?'color:var(--emerald);font-weight:800':''):'';
      const gColor=bMean!==null&&gMean!==null?(gMean>bMean?'color:var(--emerald);font-weight:800':''):'';
      html+=`<td style="padding:7px 10px;text-align:center;border:1px solid var(--border);font-family:monospace;font-size:12px;background:#e8f4ff;${bColor}">${bMean!==null?bMean.toFixed(1):'—'}</td>`;
      html+=`<td style="padding:7px 10px;text-align:center;border:1px solid var(--border);font-family:monospace;font-size:12px;background:#fff0f5;${gColor}">${gMean!==null?gMean.toFixed(1):'—'}</td>`;
    });
    html+='</tr>';
  });
  html+='</tbody></table></div><div style="font-size:12px;color:var(--text-muted);margin-top:12px">🟢 Green = higher score in that class for that subject</div>';
  cont.innerHTML=html;
}
function exportGenderPDF(){
  const examName=document.getElementById('gaExam').value;
  if(!examName)return toast('Select an exam first',true);
  const jsPDF=window._getJsPDF();const doc=new jsPDF({orientation:'landscape'});
  let y=pdfHeader(doc,'GENDER PERFORMANCE ANALYSIS','UPPER PRIMARY AND JUNIOR SCHOOL');
  doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(80,100,130);
  doc.text(`Exam: ${examName}  |  ${new Date().toLocaleDateString('en-KE')}`,doc.internal.pageSize.getWidth()/2,y,{align:'center'});y+=8;
  const grades=ALL_GRADES.filter(g=>db.exams.some(e=>e.grade===g&&(e.examName||'Untitled')===examName));
  const head=[['Subject',...grades.flatMap(g=>[`${g} Boys`,`${g} Girls`])]];
  const body=ALL_SUBJ.map(s=>{
    const row=[s];
    grades.forEach(grade=>{
      if(!getSubjects(grade).includes(s)){row.push('—','—');return;}
      const recs=db.exams.filter(e=>e.grade===grade&&(e.examName||'Untitled')===examName&&e.scores&&e.scores[s]!==undefined);
      const boys=recs.filter(e=>tsStudentGender(e.admNo)==='Male');
      const girls=recs.filter(e=>tsStudentGender(e.admNo)==='Female');
      row.push(boys.length?(boys.reduce((a,e)=>a+(e.scores[s]||0),0)/boys.length).toFixed(1):'—');
      row.push(girls.length?(girls.reduce((a,e)=>a+(e.scores[s]||0),0)/girls.length).toFixed(1):'—');
    });
    return row;
  });
  doc.autoTable({startY:y,head,body,theme:'grid',headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:7},styles:{fontSize:7.5,cellPadding:1.5,lineColor:[0,0,0],lineWidth:0.4},margin:{left:4,right:4}});
  addPageNumbers(doc);pdfFooter(doc);
  doc.save(`GenderAnalysis_${examName.replace(/\s+/g,'_')}.pdf`);toast('✅ PDF exported');
}
function exportGenderExcel(){
  const examName=document.getElementById('gaExam').value;
  if(!examName)return toast('Select an exam first',true);
  ensureXLSX(()=>{
    const grades=ALL_GRADES.filter(g=>db.exams.some(e=>e.grade===g&&(e.examName||'Untitled')===examName));
    const header=['Subject',...grades.flatMap(g=>[`${g} Boys`,`${g} Girls`])];
    const rows=ALL_SUBJ.map(s=>{
      const row=[s];
      grades.forEach(grade=>{
        if(!getSubjects(grade).includes(s)){row.push('','');return;}
        const recs=db.exams.filter(e=>e.grade===grade&&(e.examName||'Untitled')===examName&&e.scores&&e.scores[s]!==undefined);
        const boys=recs.filter(e=>tsStudentGender(e.admNo)==='Male');
        const girls=recs.filter(e=>tsStudentGender(e.admNo)==='Female');
        row.push(boys.length?parseFloat((boys.reduce((a,e)=>a+(e.scores[s]||0),0)/boys.length).toFixed(1)):'');
        row.push(girls.length?parseFloat((girls.reduce((a,e)=>a+(e.scores[s]||0),0)/girls.length).toFixed(1)):'');
      });
      return row;
    });
    const aoa=[['SANTAPRIS ACADEMY — UPPER PRIMARY AND JUNIOR SCHOOL'],[`GENDER PERFORMANCE: ${examName}`],[`Generated: ${new Date().toLocaleDateString('en-KE')}`],[],header,...rows];
    const ws=XLSX.utils.aoa_to_sheet(aoa);
    const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Gender Analysis');
    XLSX.writeFile(wb,`GenderAnalysis_${examName.replace(/\s+/g,'_')}.xlsx`);toast('✅ Excel exported');
  });
}

/* ═══════════════════════════════════════════════════════
   RUBRIC DISTRIBUTION
   ═══════════════════════════════════════════════════════ */
function populateRdDropdowns(){
  const exams=[...new Set(db.exams.map(e=>e.examName||'Untitled'))].sort();
  const eSel=document.getElementById('rdExam');if(!eSel)return;
  const curE=eSel.value||exams[exams.length-1]||'';
  eSel.innerHTML='<option value="">— Select Exam —</option>'+exams.map(n=>`<option${n===curE?' selected':''}>${n}</option>`).join('');
  const gSel=document.getElementById('rdGrade');if(!gSel)return;
  const curG=gSel.value;
  gSel.innerHTML='<option value="">All Grades</option>'+ALL_GRADES.map(g=>`<option${g===curG?' selected':''}>${g}</option>`).join('');
}
function renderRubricDist(){
  const examName=document.getElementById('rdExam').value;
  const gradeF=document.getElementById('rdGrade').value;
  const cont=document.getElementById('rdContent');
  if(!examName){cont.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted)">Please select an exam.</div>';return;}
  const grades=gradeF?[gradeF]:ALL_GRADES;
  const rubColors={EE1:'#2ecc71',EE2:'#27ae60',ME1:'#3498db',ME2:'#2980b9',AE1:'#f39c12',AE2:'#e67e22',BE1:'#e74c3c',BE2:'#c0392b'};
  let html='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:16px">';
  grades.forEach(grade=>{
    const recs=db.exams.filter(e=>e.grade===grade&&(e.examName||'Untitled')===examName);
    if(!recs.length)return;
    const isJnr=['7','8','9'].includes(grade.charAt(0));
    const pts=recs.map(r=>{
      const subjects=getSubjects(grade);
      const validS=subjects.filter(s=>r.scores&&r.scores[s]!==undefined);
      const p=validS.reduce((a,s)=>a+getRubric(r.scores[s],r.grade,r.examName).pts,0);
      const tr=getTotalRubric(Math.round(p),isJnr);
      return tr?tr.code:'BE2';
    });
    const counts={};
    pts.forEach(p=>{counts[p]=(counts[p]||0)+1;});
    const total=pts.length;
    html+=`<div class="card"><div class="card-header"><div class="card-title">Grade ${grade}</div><span style="font-size:11px;color:var(--text-muted)">${total} students</span></div><div class="card-body">`;
    ['EE1','EE2','ME1','ME2','AE1','AE2','BE1','BE2'].forEach(code=>{
      const n=counts[code]||0;const pct=total?Math.round(n/total*100):0;
      html+=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <div style="width:40px;font-size:10px;font-weight:700;color:${rubColors[code]}">${code}</div>
        <div style="flex:1;height:18px;background:var(--surface-3);border-radius:4px;overflow:hidden">
          <div style="width:${pct}%;height:100%;background:${rubColors[code]};border-radius:4px;transition:width .5s"></div>
        </div>
        <div style="width:40px;text-align:right;font-size:11px;font-weight:700;color:${rubColors[code]}">${pct}%</div>
        <div style="width:24px;text-align:right;font-size:10px;color:var(--text-muted)">${n}</div>
      </div>`;
    });
    html+='</div></div>';
  });
  html+='</div>';
  cont.innerHTML=html;
}
function exportRubricDistPDF(){
  const examName=document.getElementById('rdExam').value;
  if(!examName)return toast('Select an exam first',true);
  const jsPDF=window._getJsPDF();const doc=new jsPDF({orientation:'portrait'});
  let y=pdfHeader(doc,'RUBRIC DISTRIBUTION REPORT','UPPER PRIMARY AND JUNIOR SCHOOL');
  doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(80,100,130);
  doc.text(`Exam: ${examName}  |  ${new Date().toLocaleDateString('en-KE')}`,doc.internal.pageSize.getWidth()/2,y,{align:'center'});y+=8;
  const gradeF=document.getElementById('rdGrade').value;
  const grades=(gradeF?[gradeF]:ALL_GRADES).filter(g=>db.exams.some(e=>e.grade===g&&(e.examName||'Untitled')===examName));
  const rubCodes=['EE1','EE2','ME1','ME2','AE1','AE2','BE1','BE2'];
  const rows=grades.map(grade=>{
    const recs=db.exams.filter(e=>e.grade===grade&&(e.examName||'Untitled')===examName);
    const isJnr=['7','8','9'].includes(grade.charAt(0));
    const counts={};
    recs.forEach(r=>{
      const subjects=getSubjects(grade);const validS=subjects.filter(s=>r.scores&&r.scores[s]!==undefined);
      const p=validS.reduce((a,s)=>a+getRubric(r.scores[s],r.grade,r.examName).pts,0);
      const tr=getTotalRubric(Math.round(p),isJnr);const code=tr?tr.code:'BE2';
      counts[code]=(counts[code]||0)+1;
    });
    return[grade,...rubCodes.map(c=>counts[c]||0),recs.length];
  });
  doc.autoTable({startY:y,head:[['Grade',...rubCodes,'Total']],body:rows,theme:'grid',
    headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:8},
    styles:{fontSize:8.5,cellPadding:2,halign:'center',lineColor:[0,0,0],lineWidth:0.4},
    margin:{left:4,right:4}});
  addPageNumbers(doc);pdfFooter(doc);
  doc.save(`RubricDist_${examName.replace(/\s+/g,'_')}.pdf`);toast('✅ PDF exported');
}

function exportRubricDistExcel(){
  const examName=document.getElementById('rdExam').value;
  if(!examName)return toast('Select an exam first',true);
  ensureXLSX(()=>{
    const gradeF=document.getElementById('rdGrade').value;
    const grades=(gradeF?[gradeF]:ALL_GRADES).filter(g=>db.exams.some(e=>e.grade===g&&(e.examName||'Untitled')===examName));
    const rubCodes=['EE1','EE2','ME1','ME2','AE1','AE2','BE1','BE2'];
    const aoa=[['SANTAPRIS ACADEMY — UPPER PRIMARY AND JUNIOR SCHOOL'],[`RUBRIC DISTRIBUTION: ${examName}`],[`Generated: ${new Date().toLocaleDateString('en-KE')}`],[],['Grade',...rubCodes,'Total']];
    grades.forEach(grade=>{
      const recs=db.exams.filter(e=>e.grade===grade&&(e.examName||'Untitled')===examName);
      const isJnr=['7','8','9'].includes(grade.charAt(0));
      const counts={};
      recs.forEach(r=>{
        const subjects=getSubjects(grade);const validS=subjects.filter(s=>r.scores&&r.scores[s]!==undefined);
        const p=validS.reduce((a,s)=>a+getRubric(r.scores[s]).pts,0);
        const tr=getTotalRubric(Math.round(p),isJnr);const code=tr?tr.code:'BE2';
        counts[code]=(counts[code]||0)+1;
      });
      aoa.push([grade,...rubCodes.map(c=>counts[c]||0),recs.length]);
    });
    const ws=XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols']=[{wch:10},...rubCodes.map(()=>({wch:8})),{wch:8}];
    const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Rubric Distribution');
    XLSX.writeFile(wb,`RubricDist_${examName.replace(/\s+/g,'_')}.xlsx`);toast('✅ Excel exported');
  });
}
/* ═══════════════════════════════════════════════════════
   ACADEMIC CALENDAR
   ═══════════════════════════════════════════════════════ */
if(!db.calendarEvents)db.calendarEvents=[];
function openAddCalEvent(){
  document.getElementById('calDate').value=new Date().toISOString().split('T')[0];
  document.getElementById('calTitle').value='';document.getElementById('calNotes').value='';
  document.getElementById('calEventModal').style.display='flex';
}
function saveCalEvent(){
  const title=document.getElementById('calTitle').value.trim();
  const date=document.getElementById('calDate').value;
  const cat=document.getElementById('calCat').value;
  const notes=document.getElementById('calNotes').value.trim();
  if(!title||!date)return toast('Please fill in title and date',true);
  if(!db.calendarEvents)db.calendarEvents=[];
  db.calendarEvents.push({id:Date.now(),title,date,cat,notes});
  db.calendarEvents.sort((a,b)=>a.date.localeCompare(b.date));
  saveDB();document.getElementById('calEventModal').style.display='none';
  renderCalendar();toast('✅ Event saved');
}
function deleteCalEvent(id){
  db.calendarEvents=(db.calendarEvents||[]).filter(e=>e.id!==id);
  saveDB();renderCalendar();toast('Event deleted');
}
function renderCalendar(){
  const cont=document.getElementById('calContent');if(!cont)return;
  const events=(db.calendarEvents||[]);
  const catIcons={exam:'📝',term:'📚',event:'🎉',holiday:'🌴',meeting:'👥'};
  const catColors={exam:'rgba(30,86,200,0.12)',term:'rgba(0,200,150,0.12)',event:'rgba(242,199,68,0.12)',holiday:'rgba(46,139,87,0.12)',meeting:'rgba(180,80,200,0.12)'};
  const catBorders={exam:'rgba(30,86,200,0.4)',term:'rgba(0,200,150,0.4)',event:'rgba(242,199,68,0.4)',holiday:'rgba(46,139,87,0.4)',meeting:'rgba(180,80,200,0.4)'};
  if(!events.length){cont.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted)">No calendar events yet. Click <strong>+ Add Event</strong> to get started.</div>';return;}
  // Group by month
  const byMonth={};
  events.forEach(ev=>{
    const m=ev.date.substring(0,7);
    if(!byMonth[m])byMonth[m]=[];
    byMonth[m].push(ev);
  });
  let html='';
  Object.entries(byMonth).forEach(([month,evs])=>{
    const d=new Date(month+'-01');
    const mLabel=d.toLocaleDateString('en-KE',{year:'numeric',month:'long'});
    html+=`<div style="margin-bottom:24px"><div style="font-weight:800;font-size:14px;color:var(--sky);margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid var(--border)">${mLabel}</div>`;
    evs.forEach(ev=>{
      const evDate=new Date(ev.date).toLocaleDateString('en-KE',{weekday:'short',day:'numeric',month:'short'});
      html+=`<div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:10px;padding:12px 16px;background:${catColors[ev.cat]||'var(--surface-2)'};border:1px solid ${catBorders[ev.cat]||'var(--border)'};border-radius:10px">
        <div style="font-size:22px">${catIcons[ev.cat]||'📌'}</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:14px">${ev.title}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${evDate}${ev.notes?` — ${ev.notes}`:''}</div>
        </div>
        <button onclick="deleteCalEvent(${ev.id})" style="background:none;border:none;cursor:pointer;color:var(--rose);font-size:16px;padding:2px 6px" title="Delete">🗑</button>
      </div>`;
    });
    html+='</div>';
  });
  cont.innerHTML=html;
}
function exportCalendarPDF(){
  const jsPDF=window._getJsPDF();const doc=new jsPDF({orientation:'portrait'});
  let y=pdfHeader(doc,'ACADEMIC CALENDAR','UPPER PRIMARY AND JUNIOR SCHOOL');
  doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(80,100,130);
  doc.text(new Date().getFullYear()+' Academic Year',doc.internal.pageSize.getWidth()/2,y,{align:'center'});y+=8;
  const events=(db.calendarEvents||[]);
  if(!events.length){doc.text('No events recorded.',20,y);doc.save('AcademicCalendar.pdf');return;}
  doc.autoTable({startY:y,head:[['Date','Category','Event','Notes']],
    body:events.map(ev=>[ev.date,ev.cat.toUpperCase(),ev.title,ev.notes||'']),
    theme:'grid',headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:8},
    styles:{fontSize:8.5,cellPadding:2,lineColor:[0,0,0],lineWidth:0.4},margin:{left:4,right:4}});
  addPageNumbers(doc);pdfFooter(doc);doc.save('AcademicCalendar.pdf');toast('✅ PDF exported');
}

/* ═══════════════════════════════════════════════════════
   ATTENDANCE TRACKER
   ═══════════════════════════════════════════════════════ */
if(!db.attendance)db.attendance={};
function populateAttDropdowns(){
  const gSel=document.getElementById('attGrade');if(!gSel)return;
  const curG=gSel.value;
  gSel.innerHTML='<option value="">— Select Grade —</option>'+ALL_GRADES.map(g=>`<option${g===curG?' selected':''}>${g}</option>`).join('');
  const dEl=document.getElementById('attDate');if(dEl&&!dEl.value)dEl.value=new Date().toISOString().split('T')[0];
}
function renderAttendance(){
  const date=document.getElementById('attDate').value;
  const grade=document.getElementById('attGrade').value;
  const cont=document.getElementById('attContent');if(!cont)return;
  if(!date||!grade){cont.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted)">Select a date and grade to mark attendance.</div>';return;}
  const students=db.students.filter(s=>s.grade===grade).sort((a,b)=>(a.fullName||'').localeCompare(b.fullName||''));
  if(!students.length){cont.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted)">No students in this grade.</div>';return;}
  if(!db.attendance)db.attendance={};
  const key=`${date}_${grade}`;
  const saved=db.attendance[key]||{};
  let html=`<div class="card"><div class="card-header"><div class="card-title">Grade ${grade} — ${new Date(date).toLocaleDateString('en-KE',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div><span style="font-size:11px;color:var(--text-muted)">${students.length} students</span></div><div class="card-body">
  <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
    <button onclick="markAll('${key}','P')" style="padding:6px 14px;background:rgba(0,200,150,0.15);border:1px solid rgba(0,200,150,0.4);border-radius:8px;color:var(--emerald);cursor:pointer;font-weight:600;font-size:12px">✅ Mark All Present</button>
    <button onclick="markAll('${key}','A')" style="padding:6px 14px;background:rgba(255,78,106,0.1);border:1px solid rgba(255,78,106,0.3);border-radius:8px;color:var(--rose);cursor:pointer;font-weight:600;font-size:12px">❌ Mark All Absent</button>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px">`;
  students.forEach(s=>{
    const status=saved[s.admNo]||'P';
    html+=`<div id="attCard_${s.admNo}" style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:${status==='P'?'rgba(0,200,150,0.08)':'rgba(255,78,106,0.08)'};border:1px solid ${status==='P'?'rgba(0,200,150,0.3)':'rgba(255,78,106,0.3)'};border-radius:8px;cursor:pointer" onclick="toggleAtt('${key}','${s.admNo}')">
      <div style="font-size:20px">${status==='P'?'✅':'❌'}</div>
      <div style="flex:1"><div style="font-weight:600;font-size:13px">${s.fullName}</div><div style="font-size:10px;color:var(--text-muted)">${s.admNo}</div></div>
      <div style="font-weight:700;font-size:12px;color:${status==='P'?'var(--emerald)':'var(--rose)'}">${status==='P'?'Present':'Absent'}</div>
    </div>`;
  });
  html+='</div></div></div>';
  // Monthly summary
  html+=buildAttSummary(grade);
  cont.innerHTML=html;
}
function toggleAtt(key,admNo){
  if(!db.attendance)db.attendance={};
  if(!db.attendance[key])db.attendance[key]={};
  const cur=db.attendance[key][admNo]||'P';
  db.attendance[key][admNo]=cur==='P'?'A':'P';
  // Update card without full re-render
  const card=document.getElementById(`attCard_${admNo}`);
  if(card){
    const newStatus=db.attendance[key][admNo];
    card.style.background=newStatus==='P'?'rgba(0,200,150,0.08)':'rgba(255,78,106,0.08)';
    card.style.borderColor=newStatus==='P'?'rgba(0,200,150,0.3)':'rgba(255,78,106,0.3)';
    card.innerHTML=`<div style="font-size:20px">${newStatus==='P'?'✅':'❌'}</div><div style="flex:1"><div style="font-weight:600;font-size:13px">${(db.students.find(s=>s.admNo===admNo)||{}).fullName||admNo}</div><div style="font-size:10px;color:var(--text-muted)">${admNo}</div></div><div style="font-weight:700;font-size:12px;color:${newStatus==='P'?'var(--emerald)':'var(--rose)'}">${newStatus==='P'?'Present':'Absent'}</div>`;
    card.setAttribute('onclick',`toggleAtt('${key}','${admNo}')`);
  }
}
function markAll(key,status){
  if(!db.attendance)db.attendance={};
  if(!db.attendance[key])db.attendance[key]={};
  const grade=key.split('_')[1];
  const students=db.students.filter(s=>s.grade===grade);
  students.forEach(s=>{db.attendance[key][s.admNo]=status;});
  renderAttendance();
}
function saveAttendance(){saveDB();toast('✅ Attendance saved');}
function buildAttSummary(grade){
  const studentList=db.students.filter(s=>s.grade===grade);
  if(!studentList.length)return'';
  // Count attendance for each student
  const counts={};
  studentList.forEach(s=>{counts[s.admNo]={P:0,A:0};});
  Object.entries(db.attendance||{}).forEach(([key,rec])=>{
    if(key.split('_')[1]!==grade)return;
    Object.entries(rec).forEach(([admNo,status])=>{
      if(counts[admNo])counts[admNo][status]=(counts[admNo][status]||0)+1;
    });
  });
  const totalDays=[...new Set(Object.keys(db.attendance||{}).filter(k=>k.split('_')[1]===grade))].length;
  if(!totalDays)return'';
  let html=`<div class="card" style="margin-top:20px"><div class="card-header"><div class="card-title">📊 Monthly Summary — Grade ${grade}</div><span style="font-size:11px;color:var(--text-muted)">${totalDays} school day(s) recorded</span></div><div class="card-body"><div class="table-wrap"><table><thead><tr><th>Student</th><th>Present</th><th>Absent</th><th>Attendance %</th></tr></thead><tbody>`;
  studentList.sort((a,b)=>{
    const aRate=(counts[a.admNo]?.P||0)/(totalDays||1);
    const bRate=(counts[b.admNo]?.P||0)/(totalDays||1);
    return aRate-bRate;
  }).forEach(s=>{
    const p=counts[s.admNo]?.P||0;const a=counts[s.admNo]?.A||0;
    const pct=totalDays?Math.round(p/totalDays*100):100;
    const color=pct>=90?'var(--emerald)':pct>=75?'var(--gold)':'var(--rose)';
    html+=`<tr><td style="font-weight:600">${s.fullName}</td><td style="color:var(--emerald);font-weight:700">${p}</td><td style="color:${a>0?'var(--rose)':'var(--text-muted)'}">${a}</td><td style="font-weight:800;color:${color}">${pct}%</td></tr>`;
  });
  html+=`</tbody></table></div></div></div>`;
  return html;
}
function exportAttendancePDF(){
  const date=document.getElementById('attDate').value;
  const grade=document.getElementById('attGrade').value;
  if(!date||!grade)return toast('Select date and grade first',true);
  const jsPDF=window._getJsPDF();const doc=new jsPDF({orientation:'portrait'});
  let y=pdfHeader(doc,'ATTENDANCE REGISTER','UPPER PRIMARY AND JUNIOR SCHOOL');
  doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(80,100,130);
  doc.text(`Grade ${grade}  |  ${new Date(date).toLocaleDateString('en-KE',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}`,doc.internal.pageSize.getWidth()/2,y,{align:'center'});y+=8;
  const key=`${date}_${grade}`;
  const saved=db.attendance&&db.attendance[key]||{};
  const students=db.students.filter(s=>s.grade===grade).sort((a,b)=>(a.fullName||'').localeCompare(b.fullName||''));
  doc.autoTable({startY:y,head:[['#','Adm No','Student Name','Status']],
    body:students.map((s,i)=>[i+1,s.admNo,s.fullName,saved[s.admNo]==='A'?'ABSENT':'PRESENT']),
    theme:'grid',headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:8},
    styles:{fontSize:8.5,cellPadding:2,lineColor:[0,0,0],lineWidth:0.4},
    didParseCell(d){if(d.section==='body'&&d.column.index===3){d.cell.styles.textColor=d.cell.raw==='ABSENT'?[200,50,50]:[0,150,80];d.cell.styles.fontStyle='bold';}},
    margin:{left:4,right:4}});
  addPageNumbers(doc);pdfFooter(doc);doc.save(`Attendance_${grade}_${date}.pdf`);toast('✅ PDF exported');
}

/* ═══════════════════════════════════════════════════════
   FEE TRACKER
   ═══════════════════════════════════════════════════════ */
if(!db.fees)db.fees={};
function populateFeeDropdowns(){
  const gSel=document.getElementById('feeGrade');if(!gSel)return;
  const curG=gSel.value;
  gSel.innerHTML='<option value="">All Grades</option>'+ALL_GRADES.map(g=>`<option${g===curG?' selected':''}>${g}</option>`).join('');
}
function toggleFeeStatus(admNo,term){
  if(!db.fees)db.fees={};
  const key=`${admNo}_${term}`;
  db.fees[key]=db.fees[key]==='paid'?'unpaid':'paid';
  saveDB();
  const btn=document.getElementById(`feeBtn_${admNo}`);
  if(btn){
    const paid=db.fees[key]==='paid';
    btn.textContent=paid?'✅ Paid':'❌ Unpaid';
    btn.style.background=paid?'rgba(0,200,150,0.15)':'rgba(255,78,106,0.1)';
    btn.style.borderColor=paid?'rgba(0,200,150,0.4)':'rgba(255,78,106,0.3)';
    btn.style.color=paid?'var(--emerald)':'var(--rose)';
    const row=btn.closest('tr');if(row)row.style.background=paid?'rgba(0,200,150,0.04)':'rgba(255,78,106,0.04)';
  }
}
function renderFeeTracker(){
  const gradeF=document.getElementById('feeGrade').value;
  const term=document.getElementById('feeTerm').value;
  const cont=document.getElementById('feeContent');if(!cont)return;
  const students=(gradeF?db.students.filter(s=>s.grade===gradeF):db.students).sort((a,b)=>(a.grade||'').localeCompare(b.grade||'')||(a.fullName||'').localeCompare(b.fullName||''));
  if(!students.length){cont.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted)">No students found.</div>';return;}
  if(!db.fees)db.fees={};
  const paid=students.filter(s=>db.fees[`${s.admNo}_${term}`]==='paid').length;
  const unpaid=students.length-paid;
  let html=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:20px">
    <div style="background:rgba(0,200,150,0.12);border:1px solid rgba(0,200,150,0.3);border-radius:12px;padding:16px;text-align:center"><div style="font-size:28px;font-weight:800;color:var(--emerald)">${paid}</div><div style="font-size:12px;color:var(--text-muted)">Paid</div></div>
    <div style="background:rgba(255,78,106,0.1);border:1px solid rgba(255,78,106,0.3);border-radius:12px;padding:16px;text-align:center"><div style="font-size:28px;font-weight:800;color:var(--rose)">${unpaid}</div><div style="font-size:12px;color:var(--text-muted)">Unpaid</div></div>
    <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center"><div style="font-size:28px;font-weight:800;color:var(--sky)">${Math.round(paid/students.length*100)}%</div><div style="font-size:12px;color:var(--text-muted)">Payment rate</div></div>
  </div>
  <div class="card"><div class="card-header"><div class="card-title">Fee Status — ${term}</div></div><div class="card-body"><div class="table-wrap"><table><thead><tr><th>Grade</th><th>Student</th><th>Adm No</th><th>Status</th></tr></thead><tbody>`;
  students.forEach(s=>{
    const key=`${s.admNo}_${term}`;const isPaid=db.fees[key]==='paid';
    html+=`<tr style="background:${isPaid?'rgba(0,200,150,0.04)':'rgba(255,78,106,0.04)'}"><td><span class="badge badge-blue">${s.grade||'—'}</span></td><td style="font-weight:600">${s.fullName}</td><td><span class="adm-badge">${s.admNo}</span></td><td>
      <button id="feeBtn_${s.admNo}" onclick="toggleFeeStatus('${s.admNo}','${term}')" style="padding:5px 12px;border-radius:8px;border:1px solid;cursor:pointer;font-weight:700;font-size:12px;background:${isPaid?'rgba(0,200,150,0.15)':'rgba(255,78,106,0.1)'};border-color:${isPaid?'rgba(0,200,150,0.4)':'rgba(255,78,106,0.3)'};color:${isPaid?'var(--emerald)':'var(--rose)'}">${isPaid?'✅ Paid':'❌ Unpaid'}</button>
    </td></tr>`;
  });
  html+=`</tbody></table></div></div></div>`;
  cont.innerHTML=html;
}
function exportFeesPDF(){
  const term=document.getElementById('feeTerm').value;
  const jsPDF=window._getJsPDF();const doc=new jsPDF({orientation:'portrait'});
  let y=pdfHeader(doc,'FEE DEFAULTERS REPORT','UPPER PRIMARY AND JUNIOR SCHOOL');
  doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(80,100,130);
  doc.text(`Term: ${term}  |  ${new Date().toLocaleDateString('en-KE')}`,doc.internal.pageSize.getWidth()/2,y,{align:'center'});y+=8;
  if(!db.fees)db.fees={};
  const unpaid=db.students.filter(s=>db.fees[`${s.admNo}_${term}`]!=='paid').sort((a,b)=>(a.grade||'').localeCompare(b.grade||''));
  doc.autoTable({startY:y,head:[['Grade','Student','Adm No','Status']],
    body:unpaid.map(s=>[s.grade||'—',s.fullName,s.admNo,'UNPAID']),
    theme:'grid',headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:8},
    styles:{fontSize:8.5,cellPadding:2,lineColor:[0,0,0],lineWidth:0.4},
    didParseCell(d){if(d.section==='body'&&d.column.index===3){d.cell.styles.textColor=[200,50,50];d.cell.styles.fontStyle='bold';}},
    margin:{left:4,right:4}});
  addPageNumbers(doc);pdfFooter(doc);doc.save(`FeeDefaulters_${term.replace(/\s+/g,'_')}.pdf`);toast('✅ PDF exported');
}
function exportFeesExcel(){
  const term=document.getElementById('feeTerm').value;
  ensureXLSX(()=>{
    if(!db.fees)db.fees={};
    const rows=db.students.sort((a,b)=>(a.grade||'').localeCompare(b.grade||'')).map(s=>[s.grade||'—',s.fullName,s.admNo,db.fees[`${s.admNo}_${term}`]==='paid'?'PAID':'UNPAID']);
    const aoa=[['SANTAPRIS ACADEMY — UPPER PRIMARY AND JUNIOR SCHOOL'],[`FEE STATUS — ${term}`],[`Generated: ${new Date().toLocaleDateString('en-KE')}`],[],['Grade','Student','Adm No','Status'],...rows];
    const ws=XLSX.utils.aoa_to_sheet(aoa);ws['!cols']=[{wch:10},{wch:30},{wch:12},{wch:10}];
    const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Fee Status');
    XLSX.writeFile(wb,`FeeStatus_${term.replace(/\s+/g,'_')}.xlsx`);toast('✅ Excel exported');
  });
}

/* ═══════════════════════════════════════════════════════
   PARENT COMMUNICATIONS
   ═══════════════════════════════════════════════════════ */
if(!db.comms)db.comms=[];
function openAddComm(){
  const sel=document.getElementById('commStudent');
  if(!sel)return;
  sel.innerHTML='<option value="">— Select Student —</option>'+db.students.sort((a,b)=>(a.fullName||'').localeCompare(b.fullName||'')).map(s=>`<option value="${s.admNo}">${s.fullName} (${s.grade||'—'})</option>`).join('');
  document.getElementById('commDate').value=new Date().toISOString().split('T')[0];
  document.getElementById('commNotes').value='';
  document.getElementById('commModal').style.display='flex';
}
function saveComm(){
  const admNo=document.getElementById('commStudent').value;
  const date=document.getElementById('commDate').value;
  const type=document.getElementById('commType').value;
  const notes=document.getElementById('commNotes').value.trim();
  if(!admNo||!notes)return toast('Please select a student and add notes',true);
  if(!db.comms)db.comms=[];
  db.comms.push({id:Date.now(),admNo,date,type,notes});
  db.comms.sort((a,b)=>b.date.localeCompare(a.date));
  saveDB();document.getElementById('commModal').style.display='none';
  renderParentComms();toast('✅ Communication logged');
}
function deleteComm(id){
  db.comms=(db.comms||[]).filter(c=>c.id!==id);
  saveDB();renderParentComms();toast('Log deleted');
}
function renderParentComms(){
  const cont=document.getElementById('commsContent');if(!cont)return;
  const q=(document.getElementById('commsSearch').value||'').toLowerCase();
  const comms=(db.comms||[]).filter(c=>{
    if(!q)return true;
    const s=db.students.find(st=>st.admNo===c.admNo);
    return(s&&(s.fullName||'').toLowerCase().includes(q))||c.notes.toLowerCase().includes(q);
  });
  const typeIcons={meeting:'👥',phone:'📞',note:'📝',sms:'📱'};
  if(!comms.length){cont.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted)">No communication logs yet. Click <strong>+ Add Note</strong> to start.</div>';return;}
  let html='<div style="display:flex;flex-direction:column;gap:12px">';
  comms.forEach(c=>{
    const s=db.students.find(st=>st.admNo===c.admNo);
    const name=s?s.fullName:c.admNo;
    const grade=s?s.grade||'—':'—';
    html+=`<div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:16px 20px;display:flex;gap:14px;align-items:flex-start">
      <div style="font-size:24px">${typeIcons[c.type]||'💬'}</div>
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px">
          <span style="font-weight:700;font-size:14px">${name}</span>
          <span class="badge badge-blue">${grade}</span>
          <span style="font-size:11px;color:var(--text-muted)">${new Date(c.date).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'})}</span>
          <span style="font-size:11px;color:var(--sky);text-transform:capitalize">${c.type}</span>
        </div>
        <div style="font-size:13px;color:var(--text);line-height:1.6">${c.notes}</div>
      </div>
      <button onclick="deleteComm(${c.id})" style="background:none;border:none;cursor:pointer;color:var(--rose);font-size:16px;padding:2px 6px" title="Delete">🗑</button>
    </div>`;
  });
  html+='</div>';
  cont.innerHTML=html;
}

/* ═══════════════════════════════════════════════════════
   MESSAGE GENERATOR
   ═══════════════════════════════════════════════════════ */
function populateMsgDropdowns(){
  const exams=[...new Set(db.exams.map(e=>e.examName||'Untitled'))].sort();
  const eSel=document.getElementById('msgExam');if(!eSel)return;
  const curE=eSel.value||exams[exams.length-1]||'';
  eSel.innerHTML='<option value="">— Select Exam —</option>'+exams.map(n=>`<option${n===curE?' selected':''}>${n}</option>`).join('');
  const gSel=document.getElementById('msgGrade');if(!gSel)return;
  const curG=gSel.value;
  gSel.innerHTML='<option value="">All Grades</option>'+ALL_GRADES.map(g=>`<option${g===curG?' selected':''}>${g}</option>`).join('');
}
function generateMessages(){
  const examName=document.getElementById('msgExam').value;
  const gradeF=document.getElementById('msgGrade').value;
  const threshold=parseFloat(document.getElementById('msgThreshold').value)||50;
  const msgType=document.getElementById('msgType').value;
  const cont=document.getElementById('msgContent');
  if(!examName)return toast('Please select an exam first',true);
  const grades=gradeF?[gradeF]:ALL_GRADES;
  const students=[];
  grades.forEach(grade=>{
    const recs=db.exams.filter(e=>e.grade===grade&&(e.examName||'Untitled')===examName);
    const subjects=getSubjects(grade);
    const outOf=subjects.length*100;
    recs.forEach(r=>{
      const pct=outOf>0?((r.total||0)/outOf)*100:0;
      if(pct<threshold)students.push({...r,name:tsStudentName(r.admNo),grade,pct:Math.round(pct)});
    });
  });
  students.sort((a,b)=>a.pct-b.pct);
  if(!students.length){cont.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted)">No students found below the threshold.</div>';return;}
  const templates={
    concern:(n,g,s)=>`Dear Parent/Guardian of ${n} (Grade ${g}),\n\nWe wish to bring to your attention that ${n} scored ${s}% in the recent ${examName} examination. This is below our expected standard.\n\nWe encourage you to support your child with additional study time at home and ensure they are completing all assignments. Please do not hesitate to reach out to the class teacher for guidance.\n\nWarm regards,\nSantapris Academy`,
    urgent:(n,g,s)=>`Dear Parent/Guardian of ${n} (Grade ${g}),\n\nThis is an urgent notice regarding ${n}'s academic performance. Their score of ${s}% in ${examName} indicates a significant need for improvement.\n\nWe strongly request a meeting with the class teacher at the earliest opportunity. Please contact the school office to schedule this.\n\nYours faithfully,\nSantapris Academy`,
    positive:(n,g,s)=>`Dear Parent/Guardian of ${n} (Grade ${g}),\n\nWe are reaching out regarding ${n}'s recent ${examName} results (${s}%). While there is room for growth, we believe in ${n}'s potential and encourage continued effort.\n\nWith your support and encouragement at home, we are confident of improvement in the next assessment.\n\nWith warm regards,\nSantapris Academy`,
    meeting:(n,g,s)=>`Dear Parent/Guardian of ${n} (Grade ${g}),\n\nFollowing ${n}'s ${examName} results (${s}%), we would like to invite you for a brief meeting with the class teacher to discuss a plan for academic improvement.\n\nPlease visit the school office or call to schedule a convenient time.\n\nThank you,\nSantapris Academy`
  };
  let html=`<div style="font-weight:700;font-size:14px;margin-bottom:16px;color:var(--rose)">📨 ${students.length} student${students.length>1?'s':''} below ${threshold}% threshold</div>`;
  html+=`<div style="display:flex;flex-direction:column;gap:12px">`;
  window._msgStore=window._msgStore||{};
  window._msgStore={};
  let msgIndex=0;
  students.forEach(s=>{
    const msg=templates[msgType](s.name,s.grade,s.pct);
    window._msgStore[msgIndex]=msg;
    const _thisIdx=msgIndex;
    msgIndex++;
    html+=`<div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:16px 20px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <span style="font-weight:700;font-size:14px">${s.name}</span>
        <span class="badge badge-blue">${s.grade}</span>
        <span style="font-size:12px;color:var(--rose);font-weight:700">${s.pct}%</span>
        <button onclick="copyMsgById(${_thisIdx})" id="copybtn_${_thisIdx}" style="margin-left:auto;padding:5px 12px;background:var(--surface-3);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:12px;color:var(--text)">📋 Copy</button>
      </div>
      <pre style="font-family:Calibri,Arial,sans-serif;font-size:12px;white-space:pre-wrap;color:var(--text);line-height:1.7;margin:0;background:var(--surface-3);padding:12px 14px;border-radius:8px">${msg}</pre>
    </div>`;
  });
  html+=`</div><div style="margin-top:16px"><button onclick="copyAllMsgs()" style="padding:8px 18px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-weight:600;font-size:13px;color:var(--text)">📋 Copy All Messages</button></div>`;
  cont.innerHTML=html;
}
function copyMsg(btn){
  const msg=decodeURIComponent(btn.dataset.msg||'');
  navigator.clipboard.writeText(msg).then(()=>{btn.textContent='✅ Copied!';setTimeout(()=>btn.textContent='📋 Copy',2000);}).catch(()=>toast('Copy failed',true));
}
function copyMsgById(idx){
  const msg=(window._msgStore||{})[idx]||'';
  const btn=document.getElementById('copybtn_'+idx);
  navigator.clipboard.writeText(msg).then(()=>{if(btn){btn.textContent='✅ Copied!';setTimeout(()=>btn.textContent='📋 Copy',2000);}}).catch(()=>toast('Copy failed',true));
}
function copyAllMsgs(){
  const store=window._msgStore||{};
  const all=Object.values(store).join('\n\n---\n\n');
  if(!all)return toast('No messages to copy',true);
  navigator.clipboard.writeText(all).then(()=>toast('✅ All messages copied')).catch(()=>toast('Copy failed',true));
}

/* ═══════════════════════════════════════════════════════
   TEACHER WORKLOAD
   ═══════════════════════════════════════════════════════ */
function renderTeacherWorkload(){
  const cont=document.getElementById('twContent');if(!cont)return;
  const teachers=db.teachers||[];
  if(!teachers.length){cont.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted)">No teachers registered.</div>';return;}
  const data=teachers.map(t=>{
    const assigns=t.assignments||[];
    const totalClasses=assigns.reduce((a,ass)=>a+(ass.classes||[]).length,0);
    const totalStudents=assigns.reduce((a,ass)=>{
      const classes=ass.classes||[];
      return a+classes.reduce((b,g)=>b+db.students.filter(s=>s.grade===g).length,0);
    },0);
    const subjects=assigns.map(a=>a.subject).filter(Boolean);
    const classTeacher=t.classTeacher||'—';
    return{name:fmtTeacher(t.name),classTeacher,subjects,totalClasses,totalStudents};
  }).sort((a,b)=>b.totalStudents-a.totalStudents);
  const maxStu=Math.max(...data.map(d=>d.totalStudents),1);
  let html=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px;margin-bottom:24px">`;
  data.forEach(d=>{
    const pct=Math.round(d.totalStudents/maxStu*100);
    html+=`<div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:16px 18px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="width:40px;height:40px;border-radius:50%;background:var(--surface-3);display:flex;align-items:center;justify-content:center;font-size:20px">👩‍🏫</div>
        <div><div style="font-weight:700;font-size:14px">${d.name}</div><div style="font-size:11px;color:var(--text-muted)">Class Teacher: ${d.classTeacher}</div></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">
        <div style="text-align:center;background:var(--surface-3);border-radius:8px;padding:8px"><div style="font-size:20px;font-weight:800;color:var(--sky)">${d.totalClasses}</div><div style="font-size:10px;color:var(--text-muted)">Classes</div></div>
        <div style="text-align:center;background:var(--surface-3);border-radius:8px;padding:8px"><div style="font-size:20px;font-weight:800;color:var(--gold)">${d.totalStudents}</div><div style="font-size:10px;color:var(--text-muted)">Students</div></div>
        <div style="text-align:center;background:var(--surface-3);border-radius:8px;padding:8px"><div style="font-size:20px;font-weight:800;color:var(--emerald)">${d.subjects.length}</div><div style="font-size:10px;color:var(--text-muted)">Subjects</div></div>
      </div>
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">${d.subjects.join(', ')||'No subjects'}</div>
      <div style="height:6px;background:var(--surface-3);border-radius:3px"><div style="height:100%;width:${pct}%;background:var(--sky);border-radius:3px"></div></div>
    </div>`;
  });
  html+=`</div>`;
  // Table view
  html+=`<div class="card"><div class="card-header"><div class="card-title">📊 Summary Table</div></div><div class="card-body"><div class="table-wrap"><table><thead><tr><th>Teacher</th><th>Class Teacher Of</th><th>Subjects</th><th>Classes</th><th>Students</th></tr></thead><tbody>`;
  data.forEach(d=>{
    html+=`<tr><td style="font-weight:700">${d.name}</td><td>${d.classTeacher}</td><td style="font-size:12px">${d.subjects.join(', ')||'—'}</td><td style="text-align:center;font-weight:700;color:var(--sky)">${d.totalClasses}</td><td style="text-align:center;font-weight:700;color:var(--gold)">${d.totalStudents}</td></tr>`;
  });
  html+=`</tbody></table></div></div></div>`;
  cont.innerHTML=html;
}
function exportWorkloadPDF(){
  const jsPDF=window._getJsPDF();const doc=new jsPDF({orientation:'portrait'});
  let y=pdfHeader(doc,'TEACHER WORKLOAD SUMMARY','UPPER PRIMARY AND JUNIOR SCHOOL');
  doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(80,100,130);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-KE')}`,doc.internal.pageSize.getWidth()/2,y,{align:'center'});y+=8;
  const data=(db.teachers||[]).map(t=>{
    const assigns=t.assignments||[];
    const totalClasses=assigns.reduce((a,ass)=>a+(ass.classes||[]).length,0);
    const totalStudents=assigns.reduce((a,ass)=>{const classes=ass.classes||[];return a+classes.reduce((b,g)=>b+db.students.filter(s=>s.grade===g).length,0);},0);
    return[fmtTeacher(t.name),t.classTeacher||'—',assigns.map(a=>a.subject).join(', ')||'—',totalClasses,totalStudents];
  }).sort((a,b)=>b[4]-a[4]);
  doc.autoTable({startY:y,head:[['Teacher','Class Teacher Of','Subjects','Classes','Students']],body:data,
    theme:'grid',headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:8},
    styles:{fontSize:8.5,cellPadding:2,lineColor:[0,0,0],lineWidth:0.4},margin:{left:4,right:4}});
  addPageNumbers(doc);pdfFooter(doc);doc.save('TeacherWorkload.pdf');toast('✅ PDF exported');
}

/* ═══════════════════════════════════════════════════════
   STUDENT PROGRESS TRACKER
   ═══════════════════════════════════════════════════════ */
function openStudentProgress(admNo){
  const student=db.students.find(s=>s.admNo===admNo);
  const sub=document.getElementById('spSubtitle');
  if(sub&&student)sub.textContent=`${student.fullName} — ${student.grade||'—'}`;
  renderStudentProgress(admNo);
  showPage('studentProgress',null);
}
function renderStudentProgress(admNo){
  const cont=document.getElementById('spContent');if(!cont)return;
  const student=db.students.find(s=>s.admNo===admNo);
  if(!student){cont.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted)">Student not found.</div>';return;}
  const allExams=db.exams.filter(e=>e.admNo===admNo).sort((a,b)=>(a.examName||'').localeCompare(b.examName||''));
  if(!allExams.length){cont.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-muted)">No exam records for this student.</div>';return;}
  const subjects=getSubjects(student.grade||'4N');
  // Score cards per exam
  let html=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-bottom:24px">`;
  allExams.forEach((ex,i)=>{
    const prev=i>0?allExams[i-1]:null;
    const diff=prev?((ex.total||0)-(prev.total||0)):null;
    const arrow=diff!==null?(diff>0?'↑':diff<0?'↓':'→'):'';
    const arrowColor=diff>0?'var(--emerald)':diff<0?'var(--rose)':'var(--text-muted)';
    html+=`<div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:16px">
      <div style="font-size:12px;font-weight:700;color:var(--sky);margin-bottom:8px">${ex.examName||'Untitled'}</div>
      <div style="font-size:32px;font-weight:800;font-family:monospace;color:var(--gold)">${ex.total||0}</div>
      ${diff!==null?`<div style="font-size:13px;font-weight:700;color:${arrowColor};margin-top:4px">${arrow} ${Math.abs(diff)} pts</div>`:'<div style="font-size:11px;color:var(--text-muted);margin-top:4px">First exam</div>'}
    </div>`;
  });
  html+=`</div>`;
  // Subject breakdown table
  html+=`<div class="card"><div class="card-header"><div class="card-title">📊 Subject Score History</div></div><div class="card-body"><div class="table-wrap"><table><thead><tr><th>Subject</th>`;
  allExams.forEach(ex=>{html+=`<th style="text-align:center;font-size:11px">${ex.examName||'Untitled'}</th>`;});
  html+=`</tr></thead><tbody>`;
  subjects.forEach(s=>{
    html+=`<tr><td style="font-weight:700;color:var(--sky)">${s}</td>`;
    allExams.forEach(ex=>{
      const score=ex.scores&&ex.scores[s]!==undefined?ex.scores[s]:null;
      const color=score!==null?(score>=70?'var(--emerald)':score>=50?'var(--gold)':'var(--rose)'):'var(--text-muted)';
      html+=`<td style="text-align:center;font-family:monospace;font-weight:700;color:${color}">${score!==null?score:'—'}</td>`;
    });
    html+=`</tr>`;
  });
  html+=`</tbody></table></div></div></div>`;
  cont.innerHTML=html;
  cont.dataset.admNo=admNo;
}
function exportStudentProgressPDF(){
  const cont=document.getElementById('spContent');if(!cont)return;
  const admNo=cont.dataset.admNo;if(!admNo)return;
  const student=db.students.find(s=>s.admNo===admNo);
  const jsPDF=window._getJsPDF();const doc=new jsPDF({orientation:'portrait'});
  const name=student?student.fullName:admNo;
  let y=pdfHeader(doc,'STUDENT PROGRESS REPORT','UPPER PRIMARY AND JUNIOR SCHOOL');
  doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(80,100,130);
  doc.text(`${name}  |  Grade ${student?student.grade:'—'}  |  ${admNo}`,doc.internal.pageSize.getWidth()/2,y,{align:'center'});y+=8;
  const allExams=db.exams.filter(e=>e.admNo===admNo).sort((a,b)=>(a.examName||'').localeCompare(b.examName||''));
  const subjects=getSubjects(student?student.grade:'4N');
  const head=[['Subject',...allExams.map(e=>e.examName||'Untitled')]];
  const body=subjects.map(s=>[s,...allExams.map(e=>e.scores&&e.scores[s]!==undefined?e.scores[s]:'—')]);
  body.push(['TOTAL',...allExams.map(e=>e.total||0)]);
  doc.autoTable({startY:y,head,body,theme:'grid',headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:8},styles:{fontSize:8.5,cellPadding:2,halign:'center',lineColor:[0,0,0],lineWidth:0.4},columnStyles:{0:{halign:'left',fontStyle:'bold'}},margin:{left:4,right:4}});
  addPageNumbers(doc);pdfFooter(doc);
  doc.save(`Progress_${admNo}_${name.replace(/\s+/g,'_')}.pdf`);toast('✅ PDF exported');
}

/* ═══════════════════════════════════════════════════════
   HOOK STUDENT PROFILE TO ADD "VIEW PROGRESS" BUTTON
   ═══════════════════════════════════════════════════════ */
const _origOpenProfile_v2=openStudentProfile;
openStudentProfile=function(admNo){
  _origOpenProfile_v2.apply(this,arguments);
  // Add progress button after profile loads
  setTimeout(()=>{
    const modal=document.getElementById('studentProfileModal');
    if(!modal)return;
    const existing=modal.querySelector('#viewProgressBtn');
    if(existing)existing.remove();
    const btn=document.createElement('button');
    btn.id='viewProgressBtn';
    btn.textContent='📈 View Progress';
    btn.style.cssText='margin:0 24px 16px;padding:8px 16px;background:rgba(30,86,200,0.15);border:1px solid rgba(30,86,200,0.4);border-radius:8px;color:var(--sky);font-size:13px;font-weight:600;cursor:pointer;width:calc(100% - 48px)';
    btn.onclick=()=>{
      document.getElementById('studentProfileModal').style.display='none';
      openStudentProgress(admNo);
    };
    const footer=modal.querySelector('[style*="padding:16px 24px"]');
    if(footer)footer.parentNode.insertBefore(btn,footer);
    else modal.querySelector('.profile-body')?.appendChild(btn);
  },100);
};

/* ═══════════════════════════════════════════════════════
   SAVE DB EXTENSION (ensure new fields persist)
   ═══════════════════════════════════════════════════════ */
/* saveDB already defined above — just ensure new fields exist before saving */
const _origSaveDB_v2=saveDB;
saveDB=function(){
  if(!db.calendarEvents)db.calendarEvents=[];
  if(!db.attendance)db.attendance={};
  if(!db.fees)db.fees={};
  if(!db.comms)db.comms=[];
  if(!db.timetables)db.timetables=[];
  _origSaveDB_v2.apply(this,arguments);
};

/* ═══════════════════════════════════════════════════════
   INIT NEW FIELDS ON LOAD
   ═══════════════════════════════════════════════════════ */
(function initNewFields(){
  if(!db.calendarEvents)db.calendarEvents=[];
  if(!db.attendance)db.attendance={};
  if(!db.fees)db.fees={};
  if(!db.comms)db.comms=[];
})();





/* ═══════════════════════════════════════════════════════════════════════
   TIMETABLE GENERATOR MODULE v2 — Santapris Academy
   Mon–Fri · 10 periods/day · 47 usable lessons/week
   Constraint solver: no teacher clash, core subject spacing, teacher load
   ═══════════════════════════════════════════════════════════════════════ */

// ── Constants ─────────────────────────────────────────────────────────────
const TT = {
  DAYS: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
  DAY_SHORT: ['MON','TUE','WED','THUR','FRI'],
  BREAK_LETTERS: ['B','R','E','A','K'], // spells BREAK vertically

  // Period times (10 periods per day)
  PERIOD_TIMES: [
    '7:00–7:50AM', '7:50–8:40AM', '8:50–9:40AM', '9:40–10:30AM',
    '11:00–11:35AM', '11:35–12:10PM', '12:10–12:45PM',
    '2:00–2:40PM', '2:40–3:30PM', '4:00–5:00PM'
  ],
  BREAK_TIMES: [
    '8:40–8:50AM',    // break col 1 (between P2 and P3)
    '10:30–11:00AM',  // break col 2 (between P4 and P5) — LONG BREAK
    '12:45–1:30PM',   // break col 3 (between P7 and P8) — LUNCH
    '3:30–4:00PM'     // break col 4 (between P9 and P10)
  ],

  // Special fixed slots [day(0-4), period(0-9)]
  ASSEMBLY_MON: [0, 1],  // Mon P2
  ASSEMBLY_FRI: [4, 1],  // Fri P2
  GAMES_FRI:    [4, 9],  // Fri P10

  // Consecutive groups (no break within a group)
  GROUPS: [[0,1],[2,3],[4,5,6],[7,8],[9]],

  // CORE subjects — must not be consecutive within same group
  CORE: new Set(['MATHS','ENG','KIS']),

  // Subject colors for display
  COLORS: {
    'MATHS':'#1e56c8','ENG':'#0d7a52','KIS':'#c87d00','SCIE':'#7b3db0',
    'AGRIC':'#3a7d44','SST':'#c84040','CRE':'#0d6e8e','C/A':'#a0522d',
    'COMPT':'#4a4a8a','PTE':'#8a2be2','ENVIRON':'#2e8b57','C/ARTS':'#cd5c5c'
  },

  // Default weekly lesson targets per subject per class
  LESSON_TARGETS: {
    'MATHS':6,'ENG':6,'KIS':5,'SCIE':5,'AGRIC':4,'SST':4,
    'CRE':3,'C/A':3,'COMPT':2,'PTE':3,'ENVIRON':4,'C/ARTS':3
  },

  // Teacher max lessons/week from ASC Timetables (editable in UI)
  TEACHER_MAX: {
    'MARTIN':29,'GRACE':31,'DICKENS':33,'JANE':34,'VICTOR':34,
    'EDINA':35,'ASHLEY':34,'PAULINE':35,'GLADYS':35,'CELESTINE':34,
    'LUCY':34,'JECINTAH':26,'ANN':34,'MOSES':34,'PRISCILLAH':34,
    'NJOROGE':32,'FAITH':34,'ESTHER':33,
    'RUTH.B':34,'DEBORAH':34,'STEPHEN':34,'MALOBA':34,
    'DICKENS':33,'MARTIN':29
  }
}
/* Runtime-editable structure state (edited in the UI, module 10) */
TT.NP = 10;
TT.ND = 5;
TT.BREAK_AFTER = new Set([2,4,7,9]);          // break BEFORE these periods
TT.BREAK_IDX = new Map([[2,0],[4,1],[7,2],[9,3]]);
TT.DOUBLES = TT.DOUBLES || {};                 // subject -> doubles per week
TT.TEACHER_OFF = TT.TEACHER_OFF || {};         // NAME -> Set('day_period')
TT.MAX_CONSEC = 4;                             // max consecutive lessons/teacher
;

// Helper: get consecutive group for a period index
function ttGroup(p){ return TT.GROUPS.find(g => g.includes(p)); }

// Helper: are two periods adjacent (within same group, consecutive indices)?
function ttAdjacent(p1, p2){
  const g = ttGroup(p1);
  return g && g.includes(p2) && Math.abs(p1-p2)===1;
}

// ── Stored state ───────────────────────────────────────────────────────────
let _tt2 = null;  // { timetable, stats }
let _ttBusy = false;

// ── Teacher lookup ─────────────────────────────────────────────────────────
function ttTeacher(subj, grade){
  // LP grades have class teacher for everything
  if(['1','2','3'].includes(grade.charAt(0))){
    const t = db.teachers.find(t => {
      const ct = (t.classTeacher||'').split(',').map(s=>s.trim());
      return ct.includes(grade);
    });
    return t ? fmtTeacher(t.name) : '—';
  }
  const t = db.teachers.find(t =>
    Array.isArray(t.assignments) &&
    t.assignments.some(a => a.subject===subj && Array.isArray(a.classes) && a.classes.includes(grade))
  );
  return t ? fmtTeacher(t.name) : '—';
}

// ── Subject list per grade ──────────────────────────────────────────────────
function ttSubjects(grade){
  /* 👩‍🏫 Teachers hub allocations are the source of truth for a class's subjects */
  if (typeof ttClassSubjects === 'function') {
    const fromStore = ttClassSubjects(grade);
    if (fromStore && fromStore.length) return fromStore;
  }
  const g1 = grade.charAt(0);
  if(['1','2','3'].includes(g1)) return ['MATHS','ENG','KIS','ENVIRON','CRE','C/ARTS'];
  if(['7','8','9'].includes(g1)) return ['MATHS','ENG','KIS','SCIE','AGRIC','SST','CRE','C/A','COMPT','PTE'];
  return ['MATHS','ENG','KIS','SCIE','AGRIC','SST','CRE','C/A','COMPT'];
}

// ── Check if slot is a special fixed slot ─────────────────────────────────
function ttIsSpecial(day, period){
  if(day===0 && period===1) return 'ASSEMBLY';
  if(day===4 && period===1) return 'ASSEMBLY';
  if(day===4 && period===TT.NP-1) return 'GAMES';
  return null;
}

// ── Is slot usable for teaching? ─────────────────────────────────────────
function ttUsable(day, period){ return !ttIsSpecial(day, period); }

// ── Core Constraint Checker ───────────────────────────────────────────────
function ttCanPlace(tt, teacherLoad, grade, day, period, subj, teacher, doubleCounts){
  // 1. Slot must be usable
  if(!ttUsable(day, period)) return false;
  // 2. Class slot must be free
  if(tt[grade][day][period] !== null) return false;
  const C = window.__ttConstraints || {};
  // 3. Teacher not busy this slot / time-off / max consecutive run
  if(teacher !== '—'){
    if(teacherLoad[day][period] && teacherLoad[day][period].has(teacher)) return false;
    // At most NP-2 lessons a day — a teacher always keeps 2 free periods.
    let __dayLoad = 0;
    for(let pp=0;pp<TT.NP;pp++) if(teacherLoad[day][pp].has(teacher)) __dayLoad++;
    if(__dayLoad >= Math.max(1, TT.NP - 1)) return false;
    if(C.teacherBlocked && C.teacherBlocked(teacher, day, period)) return false;
    if(C.teacherRunOK && !C.teacherRunOK(teacherLoad, day, period, teacher)) return false;
    const ukey = teacher.toUpperCase();
    const maxL = (window.__ttCapOverride && window.__ttCapOverride[ukey] != null)
      ? window.__ttCapOverride[ukey] : (TT.TEACHER_MAX[ukey] || 999);
    let count = 0;
    for(let d=0;d<TT.ND;d++) for(let p=0;p<TT.NP;p++)
      if(teacherLoad[d][p] && teacherLoad[d][p].has(teacher)) count++;
    if(count >= maxL) return false;
  }
  // 5. Max 2 same subject per day per class
  let dayCount = 0;
  for(let p=0;p<TT.NP;p++){
    if(tt[grade][day][p] && tt[grade][day][p].subj===subj) dayCount++;
  }
  // A subject appears at most ONCE a day — except doubles, which are placed
  // atomically as a consecutive pair (their day is reserved during pair placement).
  if(dayCount >= 1) return false;
  // 6. No consecutive core subjects (within same group)
  if(TT.CORE.has(subj)){
    const group = ttGroup(period);
    if(group){
      for(const adjP of group){
        if(adjP !== period && Math.abs(adjP-period)===1){
          const cell = tt[grade][day][adjP];
          if(cell && TT.CORE.has(cell.subj)) return false;
        }
      }
    }
    // 7. Double lesson limit for core subjects (max 2 doubles per week per class)
    let wouldDouble = false;
    if(group){
      for(const adjP of group){
        if(adjP !== period && Math.abs(adjP-period)===1){
          const cell = tt[grade][day][adjP];
          if(cell && cell.subj===subj) { wouldDouble = true; break; }
        }
      }
    }
    if(wouldDouble){
      const key = `${grade}_${subj}`;
      // Honor an explicitly configured doubles target (Teachers-hub per-class
      // setting, else the Advanced-panel value); default 2 preserves the
      // classic behavior when nothing was configured.
      const custom = (typeof tcIsCustom === 'function') ? tcIsCustom(subj, grade) : false;
      const want = custom ? ttClassDoubles(subj, grade)
        : ((window.TT && window.TT.DOUBLES && window.TT.DOUBLES[subj] != null) ? window.TT.DOUBLES[subj] : 2);
      if((doubleCounts[key]||0) >= want) return false;
    }
  }
  return true;
}

// ── Main Generator ────────────────────────────────────────────────────────
function runTT2(grades, maxRestarts){
  maxRestarts = maxRestarts || 250;

  function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){
      const j=0|Math.random()*(i+1);[arr[i],arr[j]]=[arr[j],arr[i]];
    }
    return arr;
  }

  const C = window.__ttConstraints || {};

  // ── Teacher demand vs weekly caps: raise caps that are physically impossible.
  // A teacher's demand = the sum of the (auto-balanced) lessons of every class
  // they teach. If demand exceeds their cap, those lessons can NEVER all be
  // placed — raise the cap to the demand and say so in the status line.
  const capNotes = [];
  window.__ttCapOverride = {};
  try {
    const demand = {};
    grades.forEach(g => ttSubjects(g).forEach(s => {
      const t = ttTeacher(s, g);
      if (t && t !== '—') {
        const n = (typeof ttClassTarget === 'function') ? ttClassTarget(s, g)
          : ((TT.LESSON_TARGETS[s] != null) ? TT.LESSON_TARGETS[s] : 3);
        demand[t] = (demand[t] || 0) + Math.max(0, n);
      }
    }));
    Object.entries(demand).forEach(([t, n]) => {
      const cap = TT.TEACHER_MAX[t.toUpperCase()] || 999;
      if (n > cap) {
        window.__ttCapOverride[t.toUpperCase()] = n;
        capNotes.push(t + ' ' + cap + '\u2192' + n);
      }
    });
  } catch (e) {}

  // ── Build the lesson list, AUTO-BALANCED to fill every teachable slot ──
  // Teacher headroom is GLOBAL (cross-grade): a teacher serving 16 classes
  // only has 5×NP physical slots in the whole week, no matter how small
  // their share in any single class is.
  const globalDemand = {}, globalFree = {};
  const physLimit = t => {
    let off = 0;
    const o = TT.TEACHER_OFF && TT.TEACHER_OFF[t];
    if (o) off = o.size;
    return TT.ND * TT.NP - off;
  };
  grades.forEach(g => ttSubjects(g).forEach(s => {
    const t = ttTeacher(s, g);
    if (!t || t === '—') return;
    const n = Math.max(0, (typeof ttClassTarget === 'function') ? ttClassTarget(s, g)
      : ((TT.LESSON_TARGETS[s] != null) ? TT.LESSON_TARGETS[s] : 3));
    globalDemand[t] = (globalDemand[t] || 0) + n;
  }));
  Object.keys(globalDemand).forEach(t => {
    const cap = TT.TEACHER_MAX[t.toUpperCase()] || 999;
    globalFree[t] = Math.max(0, Math.min(cap, physLimit(t)) - globalDemand[t]);
  });

  function buildLessons(){
    const lessons = [];
    const notes = [];
    grades.forEach(grade => {
      const subjList = ttSubjects(grade);
      let alloc = subjList.map(s => {
        const t = (typeof ttClassTarget === 'function') ? ttClassTarget(s, grade)
          : ((TT.LESSON_TARGETS[s] != null) ? TT.LESSON_TARGETS[s] : 3);
        return Math.max(0, t);
      });
      let dbl = subjList.map((s, i) => {
        const d = (typeof ttClassDoubles === 'function') ? ttClassDoubles(s, grade)
          : (TT.DOUBLES ? (TT.DOUBLES[s]||0) : 0);
        return Math.max(0, Math.min(d, Math.floor(alloc[i]/2)));
      });
      let slots = 0;
      for(let d=0;d<TT.ND;d++) for(let p=0;p<TT.NP;p++) if(!ttIsSpecial(d,p)) slots++;
      let sum = alloc.reduce((a,b)=>a+b,0);

      // Too many lessons → trim from the largest allocation first.
      const excess0 = sum - slots;
      let excess = sum - slots, guard = 500;
      while(excess > 0 && guard-- > 0){
        let mi = -1;
        for(let i=0;i<alloc.length;i++) if(alloc[i] > 0 && (mi < 0 || alloc[i] > alloc[mi])) mi = i;
        if(mi < 0) break;
        alloc[mi]--; excess--;
        const tFree = ttTeacher(subjList[mi], grade);
        if(tFree && tFree !== '—' && globalFree[tFree] != null) globalFree[tFree]++;
        if(dbl[mi] > Math.floor(alloc[mi]/2)) dbl[mi] = Math.floor(alloc[mi]/2);
        if(dbl[mi] < alloc[mi] - TT.ND) dbl[mi] = alloc[mi] - TT.ND;   // needs doubles to fit the week
        dbl[mi] = Math.min(dbl[mi], Math.floor(alloc[mi]/2));
      }
      // Too few → grow allocations, but ONLY for subjects whose teacher
      // still has weekly headroom — a single teacher serving many classes
      // (e.g. one computer teacher school-wide) saturates fast, so growth
      // must flow to teachers with free capacity. Unassigned teachers are
      // always growable.
      let deficit = slots - sum, g2 = slots*4;
      const CAP = 2 * TT.ND;   // a subject: at most one double-pair per day
      while(deficit > 0 && g2-- > 0){
        let mi = -1;
        for(let i=0;i<alloc.length;i++){
          if(alloc[i] >= CAP) continue;
          const t = ttTeacher(subjList[i], grade);
          if(t && t !== '—' && (globalFree[t] || 0) <= 0) continue;   // teacher is full
          if(mi < 0 || alloc[i] < alloc[mi]) mi = i;
        }
        if(mi < 0) break;
        const t = ttTeacher(subjList[mi], grade);
        if(t && t !== '—') globalFree[t] = Math.max(0, (globalFree[t]||0) - 1);
        alloc[mi]++; deficit--;
        if(dbl[mi] > Math.floor(alloc[mi]/2)) dbl[mi] = Math.floor(alloc[mi]/2);
        if(dbl[mi] < alloc[mi] - TT.ND) dbl[mi] = alloc[mi] - TT.ND;   // needs doubles to fit the week
        dbl[mi] = Math.min(dbl[mi], Math.floor(alloc[mi]/2));
      }
      if(deficit > 0) notes.push(grade + ': ' + deficit + ' slot' + (deficit === 1 ? '' : 's')
        + ' left empty — no teacher has free periods left for this class (assign more teachers/subjects in the 👩‍🏫 Teachers hub)');

      subjList.forEach((s, i) => {
        const teacher = ttTeacher(s, grade);
        for(let k=0;k<dbl[i];k++) lessons.push({grade, subj: s, teacher, span: 2});
        for(let k=0;k<alloc[i]-2*dbl[i];k++) lessons.push({grade, subj: s, teacher, span: 1});
      });
      if(excess !== 0 || (slots - alloc.reduce((a,b)=>a+b,0)) !== 0){
        const diff = slots - alloc.reduce((a,b)=>a+b,0);
        const trimmed = excess0 > 0 ? excess0 : 0;
        if(trimmed) notes.push(grade + ': trimmed ' + trimmed + ' excess lesson' + (trimmed === 1 ? '' : 's') + ' to fit (teacher capacity)');
      }
    });
    return { lessons, notes };
  }

  // Hardest lessons first: doubles, then scarce teachers, then core subjects.
  function sortForPlacement(lessons){
    /* Order decides everything: doubles (most constrained) first, then ALL
       core subjects (they must alternate with non-core in every block, so
       they need the grid while it is still open), then scarce teachers,
       then the rest to fill gaps. */
    const key = l => {
      const tMax = (l.teacher === '—') ? 999 : (TT.TEACHER_MAX[l.teacher.toUpperCase()] || 999);
      let bucket;
      if (l.span === 2) bucket = 0;
      else if (TT.CORE.has(l.subj)) bucket = 1;
      else if (tMax <= 34) bucket = 2;
      else bucket = 3;
      return { bucket, tMax, core: TT.CORE.has(l.subj) ? 0 : 1 };
    };
    return lessons
      .map(l => ({ l, k: key(l) }))
      .sort((a, b) => a.k.bucket - b.k.bucket || a.k.tMax - b.k.tMax || a.k.core - b.k.core)
      .map(x => x.l);
  }

  function adjClash(tt, grade, d, p, subj){
    return C.adjacentClash ? C.adjacentClash(tt, grade, d, p, subj) : false;
  }
  function slotOK(grade, d, p, subj, teacher, doubleCounts){
    if(C.blocked && C.blocked(subj, p)) return false;
    if(adjClash(tt, grade, d, p, subj)) return false;
    return ttCanPlace(tt, teacherLoad, grade, d, p, subj, teacher, doubleCounts);
  }
  function removeAt(grade, d, p){
    const c = tt[grade][d][p];
    if(!c || c.special) return null;
    tt[grade][d][p] = null;
    if(c.teacher && c.teacher !== '—') teacherLoad[d][p].delete(c.teacher);
    return c;
  }
  function insertAt(grade, d, p, subj, teacher){
    tt[grade][d][p] = {subj, teacher};
    if(teacher && teacher !== '—') teacherLoad[d][p].add(teacher);
  }
  function teacherSlotOK(teacherLoad, teacher, d, p){
    if(teacher === '—') return true;
    if(teacherLoad[d][p].has(teacher)) return false;
    let __dayLoad = 0;
    for(let pp=0;pp<TT.NP;pp++) if(teacherLoad[d][pp].has(teacher)) __dayLoad++;
    if(__dayLoad >= Math.max(1, TT.NP - 1)) return false;
    if(C.teacherBlocked && C.teacherBlocked(teacher, d, p)) return false;
    if(C.teacherRunOK && !C.teacherRunOK(teacherLoad, d, p, teacher)) return false;
    const ukey = teacher.toUpperCase();
    const maxL = (window.__ttCapOverride && window.__ttCapOverride[ukey] != null)
      ? window.__ttCapOverride[ukey] : (TT.TEACHER_MAX[ukey] || 999);
    let count = 0;
    for(let dd=0;dd<TT.ND;dd++) for(let pp=0;pp<TT.NP;pp++)
      if(teacherLoad[dd][pp].has(teacher)) count++;
    return count < maxL;
  }

  let tt = null, teacherLoad = null;
  let bestResult = null, bestScore = -1;

  for(let restart=0; restart<maxRestarts; restart++){
    tt = {};
    grades.forEach(g => {
      tt[g] = [];
      for(let d=0;d<TT.ND;d++){
        tt[g][d] = new Array(TT.NP).fill(null);
        for(let p=0;p<TT.NP;p++){
          const sp = ttIsSpecial(d,p);
          if(sp) tt[g][d][p] = {subj: sp, teacher: null, special: true};
        }
      }
    });

    teacherLoad = [];
    for(let d=0;d<TT.ND;d++){
      teacherLoad[d] = [];
      for(let p=0;p<TT.NP;p++) teacherLoad[d][p] = new Set();
    }

    const doubleCounts = {};
    const built = buildLessons();
    const allLessons = sortForPlacement(shuffle(built.lessons));
    let placed = 0, total = 0, pairsPlaced = 0, pairsWanted = 0, degraded = 0;

    allLessons.forEach(l => { total += l.span; l.placed = false; });

    /* ── main pass: place every lesson (doubles as consecutive pairs) ── */
    for(const lesson of allLessons){
      const {grade, subj, teacher, span} = lesson;

      if(span === 2){
        pairsWanted++;
        const cands = [];
        for(let d=0;d<TT.ND;d++){
          let dayCount = 0;
          for(let pp=0;pp<TT.NP;pp++) if(tt[grade][d][pp] && tt[grade][d][pp].subj===subj) dayCount++;
          if(dayCount > 0) continue;
          for(const grp of TT.GROUPS){
            for(let gi=0; gi+1<grp.length; gi++){
              const p = grp[gi], q = grp[gi+1];
              if(q !== p+1) continue;
              let ok = true;
              for(const x of [p, q]){
                if(!ttUsable(d, x)) { ok=false; break; }
                if(tt[grade][d][x] !== null) { ok=false; break; }
                if(C.blocked && C.blocked(subj, x)) { ok=false; break; }
                if(adjClash(tt, grade, d, x, subj)) { ok=false; break; }
                if(!teacherSlotOK(teacherLoad, teacher, d, x)) { ok=false; break; }
              }
              if(ok) cands.push({d, p, score: (p>=2 && q<=TT.NP-2) ? 1 : 0});
            }
          }
        }
        if(!cands.length) continue;
        cands.sort((a,b)=>b.score-a.score);
        const pick = cands[0|Math.random()*Math.min(5, cands.length)];
        insertAt(grade, pick.d, pick.p, subj, teacher);
        insertAt(grade, pick.d, pick.p + 1, subj, teacher);
        doubleCounts[grade+'_'+subj] = (doubleCounts[grade+'_'+subj]||0) + 1;
        placed += 2; lesson.placed = true; pairsPlaced++;
        continue;
      }

      const candidates = [];
      for(let d=0;d<TT.ND;d++){
        for(let p=0;p<TT.NP;p++){
          if(C.blocked && C.blocked(subj, p)) continue;
          if(adjClash(tt, grade, d, p, subj)) continue;
          if(ttCanPlace(tt, teacherLoad, grade, d, p, subj, teacher, doubleCounts)){
            let score = 0;
            let daySubjCount = 0;
            for(let pp=0;pp<TT.NP;pp++) if(tt[grade][d][pp] && tt[grade][d][pp].subj===subj) daySubjCount++;
            score -= daySubjCount * 10;
            if(teacher !== '—'){
              let tchrDay = 0;
              for(let pp=0;pp<TT.NP;pp++) if(teacherLoad[d][pp].has(teacher)) tchrDay++;
              score -= tchrDay * 2;
            }
            if(p>=2 && p<=TT.NP-3) score += 1;
            candidates.push({d, p, score});
          }
        }
      }
      if(!candidates.length) continue;
      candidates.sort((a,b)=>b.score-a.score);
      const pick = candidates[0|Math.random()*Math.min(5, candidates.length)];
      insertAt(grade, pick.d, pick.p, subj, teacher);
      if(TT.CORE.has(subj)){
        const group = ttGroup(pick.p);
        if(group){
          for(const adjP of group){
            if(adjP!==pick.p && Math.abs(adjP-pick.p)===1){
              const adj = tt[grade][pick.d][adjP];
              if(adj && adj.subj===subj){
                doubleCounts[grade+'_'+subj] = (doubleCounts[grade+'_'+subj]||0) + 1;
              }
            }
          }
        }
      }
      placed++; lesson.placed = true;
    }

    /* ── REPAIR PASS: evict-and-relocate until everything is placed ── */
    let rounds = 0, progressed = true;
    while(progressed && rounds < 14){
      progressed = false; rounds++;
      const pending = allLessons.filter(l => !l.placed);

      // 1) unplaced singles: try direct free slots first (cheap), then eviction
      for(const lesson of pending.filter(l => l.span === 1 && !l.placed)){
        const {grade, subj, teacher} = lesson;
        let done = false;
        for(let d=0;d<TT.ND && !done;d++){
          for(let p=0;p<TT.NP && !done;p++){
            if(tt[grade][d][p] !== null) continue;
            if(!slotOK(grade, d, p, subj, teacher, doubleCounts)) continue;
            insertAt(grade, d, p, subj, teacher);
            placed++; lesson.placed = true; done = true; progressed = true;
          }
        }
        if(done) continue;
        // cross-grade eviction: the teacher is busy in ANOTHER grade — kick that
        // lesson and relocate it inside its own grade.
        if(teacher !== '—'){
          outerX:
          for(let d=0;d<TT.ND && !done;d++){
            for(let p=0;p<TT.NP && !done;p++){
              if(tt[grade][d][p] !== null) continue;
              if(C.blocked && C.blocked(subj, p)) continue;
              if(adjClash(tt, grade, d, p, subj)) continue;
              if(teacherLoad[d][p].has(teacher)){
                // find the blocking lesson (any grade)
                for(const g2 of grades){
                  if(g2 === grade) continue;
                  const m = tt[g2][d][p];
                  if(!m || m.special || m.teacher !== teacher) continue;
                  const evicted = removeAt(g2, d, p);
                  // can our lesson go here now?
                  if(!ttCanPlace(tt, teacherLoad, grade, d, p, subj, teacher, doubleCounts)){
                    insertAt(g2, d, p, evicted.subj, evicted.teacher); continue;
                  }
                  insertAt(grade, d, p, subj, teacher);
                  // relocate the evicted lesson inside g2
                  let moved = false;
                  for(let d2=0;d2<TT.ND && !moved;d2++){
                    for(let p2=0;p2<TT.NP && !moved;p2++){
                      if(tt[g2][d2][p2] !== null) continue;
                      if(!slotOK(g2, d2, p2, evicted.subj, evicted.teacher, doubleCounts)) continue;
                      insertAt(g2, d2, p2, evicted.subj, evicted.teacher);
                      moved = true;
                    }
                  }
                  if(moved){
                    placed++; lesson.placed = true; done = true; progressed = true;
                    break outerX;
                  } else {
                    removeAt(grade, d, p);
                    insertAt(g2, d, p, evicted.subj, evicted.teacher);
                  }
                }
              }
            }
          }
        }
        if(done) continue;
        // eviction: occupant of a valid slot relocates elsewhere
        for(let d=0;d<TT.ND && !done;d++){
          for(let p=0;p<TT.NP && !done;p++){
            const m = tt[grade][d][p];
            if(!m || m.special || !m.subj) continue;
            const mSaved = removeAt(grade, d, p);
            if(!slotOK(grade, d, p, subj, teacher, doubleCounts)){
              insertAt(grade, d, p, m.subj, m.teacher); continue;
            }
            insertAt(grade, d, p, subj, teacher);
            placed++; lesson.placed = true; done = true; progressed = true;
            // relocate the evicted single
            let moved = false;
            for(let d2=0;d2<TT.ND && !moved;d2++){
              for(let p2=0;p2<TT.NP && !moved;p2++){
                if(tt[grade][d2][p2] !== null) continue;
                if(!slotOK(grade, d2, p2, m.subj, m.teacher, doubleCounts)) continue;
                insertAt(grade, d2, p2, m.subj, m.teacher);
                moved = true;
              }
            }
            if(!moved){
              // no free home for the evicted lesson — undo everything
              removeAt(grade, d, p);
              insertAt(grade, d, p, m.subj, m.teacher);
              placed--; lesson.placed = false; done = false;
            }
          }
        }
      }

      // 2) unplaced doubles: try pair slots, evicting two relocatable singles
      for(const lesson of pending.filter(l => l.span === 2 && !l.placed)){
        const {grade, subj, teacher} = lesson;
        let done = false;
        for(let d=0;d<TT.ND && !done;d++){
          let dayCount = 0;
          for(let pp=0;pp<TT.NP;pp++) if(tt[grade][d][pp] && tt[grade][d][pp].subj===subj) dayCount++;
          if(dayCount > 0) continue;
          for(const grp of TT.GROUPS){
            for(let gi=0; gi+1<grp.length && !done; gi++){
              const p = grp[gi], q = grp[gi+1];
              if(q !== p+1) continue;
              const m1 = tt[grade][d][p], m2 = tt[grade][d][q];
              if(!m1 || !m2 || m1.special || m2.special) continue;
              const s1 = removeAt(grade, d, p);
              const s2 = removeAt(grade, d, q);
              const fit = slotOK(grade, d, p, subj, teacher, doubleCounts) &&
                          slotOK(grade, d, q, subj, teacher, doubleCounts);
              if(!fit){
                insertAt(grade, d, p, s1.subj, s1.teacher);
                insertAt(grade, d, q, s2.subj, s2.teacher);
                continue;
              }
              insertAt(grade, d, p, subj, teacher);
              insertAt(grade, d, q, subj, teacher);
              // relocate the two evicted singles
              let m1At = null, m2At = null;
              for(let d2=0;d2<TT.ND && !(m1At && m2At);d2++){
                for(let p2=0;p2<TT.NP && !(m1At && m2At);p2++){
                  if(tt[grade][d2][p2] !== null) continue;
                  if(!m1At && slotOK(grade, d2, p2, s1.subj, s1.teacher, doubleCounts)){
                    insertAt(grade, d2, p2, s1.subj, s1.teacher); m1At = {d: d2, p: p2}; continue;
                  }
                  if(!m2At && slotOK(grade, d2, p2, s2.subj, s2.teacher, doubleCounts)){
                    insertAt(grade, d2, p2, s2.subj, s2.teacher); m2At = {d: d2, p: p2};
                  }
                }
              }
              if(m1At && m2At){
                doubleCounts[grade+'_'+subj] = (doubleCounts[grade+'_'+subj]||0) + 1;
                placed += 2; lesson.placed = true; done = true; progressed = true; pairsPlaced++;
              } else {
                // undo the whole operation: put everything back exactly where it was
                removeAt(grade, d, p); removeAt(grade, d, q);
                insertAt(grade, d, p, s1.subj, s1.teacher);
                insertAt(grade, d, q, s2.subj, s2.teacher);
                if(m1At) removeAt(grade, m1At.d, m1At.p);
                if(m2At) removeAt(grade, m2At.d, m2At.p);
              }
            }
          }
        }
        // last resort for a stubborn double: degrade to two singles
        if(!done){
          let ok1 = false, ok2 = false;
          for(let d=0;d<TT.ND && !(ok1&&ok2);d++){
            for(let p=0;p<TT.NP && !(ok1&&ok2);p++){
              if(tt[grade][d][p] !== null) continue;
              if(!ok1 && slotOK(grade, d, p, subj, teacher, doubleCounts)){
                insertAt(grade, d, p, subj, teacher); ok1 = true; placed++;
                lesson.placed = true; progressed = true; continue;
              }
              if(ok1 && !ok2 && slotOK(grade, d, p, subj, teacher, doubleCounts)){
                insertAt(grade, d, p, subj, teacher); ok2 = true; placed++;
              }
            }
          }
          if(ok1 || ok2) degraded += (ok1 ? 1 : 0) + (ok2 ? 1 : 0);
        }
      }
    }

    const score = total ? placed / total : 1;
    if(score > bestScore){
      bestScore = score;
      bestResult = { tt, teacherLoad, placed, total, restarts: restart+1,
        pairsWanted, pairsPlaced, degraded,
        balance: built.notes.length ? built.notes.join(', ') : '',
        caps: capNotes.length ? capNotes.join(', ') : '',
        unplacedLessons: total - placed };
    }
    if(bestScore >= 1) break;
  }

  return bestResult;
}

// ── Page init ─────────────────────────────────────────────────────────────
function initTimetablePage(){
  const gc = document.getElementById('tt_gradeChecks');
  if(!gc || gc.children.length>0) return;

  const groups = {
    'Upper Primary': ['4N','4S','4E','4W','5N','5S','5E','5W','6N','6S'],
    'Junior School': ['7R','7B','8R','8B','9R','9B']
  };
  let html = '';
  Object.entries(groups).forEach(([grp,grades]) => {
    html += `<div style="margin-bottom:8px">
      <span style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em">${grp}</span><br>`;
    grades.forEach(g => {
      const hasStu = db.students.some(s => s.grade===g);
      html += `<label style="display:inline-flex;align-items:center;gap:5px;margin:3px 8px 3px 0;cursor:pointer;font-size:12px;font-weight:600">
        <input type="checkbox" class="tt-grade-cb" value="${g}" ${hasStu?'checked':''} style="accent-color:var(--sky)"> ${g}
      </label>`;
    });
    html += '</div>';
  });
  gc.innerHTML = html;

  // Populate teacher max lesson inputs
  renderTeacherMaxPanel();
}

function renderTeacherMaxPanel(){
  const panel = document.getElementById('tt_teacherMaxPanel');
  if(!panel) return;
  const teachers = db.teachers.filter(t =>
    !t.isLP && Array.isArray(t.assignments) && t.assignments.length>0
  ).sort((a,b)=>a.name.localeCompare(b.name));

  let html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:6px">';
  teachers.forEach(t => {
    const name = fmtTeacher(t.name);
    const max = TT.TEACHER_MAX[name.toUpperCase()] || TT.TEACHER_MAX[t.name.toUpperCase()] || 34;
    html += `<label style="display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;background:var(--surface-2);padding:4px 8px;border-radius:6px;border:1px solid var(--border)">
      <span style="flex:1;color:var(--text)">${name}</span>
      <input type="number" min="1" max="50" value="${max}" 
        onchange="TT.TEACHER_MAX['${name.toUpperCase()}']=parseInt(this.value)"
        style="width:42px;padding:2px 4px;text-align:center;background:var(--surface-3);border:1px solid var(--border);border-radius:4px;color:var(--sky);font-weight:700;font-size:11px">
    </label>`;
  });
  html += '</div>';
  panel.innerHTML = html;
}

function ttSelectAll(withStu){
  document.querySelectorAll('.tt-grade-cb').forEach(cb => {
    cb.checked = withStu ? db.students.some(s=>s.grade===cb.value) : true;
  });
}
function ttDeselectAll(){ document.querySelectorAll('.tt-grade-cb').forEach(cb => cb.checked=false); }

// ── Generate ───────────────────────────────────────────────────────────────
function generateTimetableNow(){
  if(_ttBusy) return;
  const grades = [...document.querySelectorAll('.tt-grade-cb:checked')].map(cb=>cb.value);
  if(!grades.length){ toast('⚠️ Select at least one grade',true); return; }

  _ttBusy = true;
  const btn = document.getElementById('tt_generateBtn');
  const status = document.getElementById('tt_status');
  if(btn){ btn.disabled=true; btn.textContent='⏳ Running solver…'; }
  if(status) status.innerHTML='<span style="color:var(--sky)">⏳ Placing lessons with constraint checking…</span>';

  setTimeout(()=>{
    try{
      const result = runTT2(grades);
      _tt2 = result;
      const pct = Math.round(result.placed/result.total*100);
      const col = pct>=97?'var(--emerald)':pct>=90?'var(--gold)':'var(--rose)';
      let extra = '';
      if(result.balance) extra += ' · ' + result.balance;
      if(result.caps) extra += ' · teacher load raised: ' + result.caps;
      if(result.degraded) extra += ' · ' + result.degraded + ' double(s) placed as singles';
      if(result.unplacedLessons) extra += ' · ' + result.unplacedLessons + ' unplaced';
      if(status) status.innerHTML=`<span style="color:${col}">✅ ${result.placed}/${result.total} lessons placed (${pct}%) · ${result.restarts} restart(s)${extra}</span>`;
      ttRender();
    }catch(e){
      console.error(e);
      if(status) status.innerHTML=`<span style="color:var(--rose)">❌ ${e.message}</span>`;
    }
    _ttBusy=false;
    if(btn){ btn.disabled=false; btn.textContent='⚡ Generate Timetable'; }
  },30);
}

function ttRender(){
  if(!_tt2) return;
  const mode = document.getElementById('tt_viewMode')?.value || 'by-class';
  const grades = [...document.querySelectorAll('.tt-grade-cb:checked')].map(cb=>cb.value);
  const container = document.getElementById('tt_results');
  if(!container) return;

  if(mode==='by-class') ttRenderByClass(_tt2.tt, grades, container);
  else if(mode==='by-teacher') ttRenderByTeacher(_tt2.tt, grades, container);
  else ttRenderByDay(_tt2.tt, grades, container);
}

// ── Render: By Class (one table per grade, rows=days, cols=periods) ────────
function ttRenderByClass(tt, grades, container){
  let html = '';
  grades.forEach(grade => {
    html += `
    <div class="card" style="margin-bottom:28px;overflow:hidden">
      <div class="card-header" style="background:linear-gradient(90deg,rgba(30,86,200,0.18),transparent)">
        <div class="card-title" style="color:var(--sky);font-size:15px">🏫 Grade ${grade}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${ttSubjects(grade).map(s=>`<span style="font-size:10px;font-weight:700;color:${TT.COLORS[s]||'var(--sky)'}">■ ${s}</span>`).join('')}
        </div>
      </div>
      <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:11px;min-width:900px">
        <thead>
          <tr style="background:var(--surface-3)">
            <th style="padding:7px 10px;border:1px solid var(--border);color:var(--text-muted);width:60px;font-size:11px">DAY</th>`;
    // Period headers
    for(let p=0;p<TT.NP;p++){
      if(TT.BREAK_AFTER.has(p)){
        // Add break col before this period
        const bIdx = TT.BREAK_IDX.get(p);
        html += `<th style="padding:4px 3px;border:1px solid var(--border);background:rgba(100,100,100,0.1);color:var(--text-muted);width:36px;font-size:9px;text-align:center">BREAK<br><span style="font-size:8px;font-weight:400">${TT.BREAK_TIMES[bIdx]}</span></th>`;
      }
      html += `<th style="padding:6px 4px;border:1px solid var(--border);color:var(--text);text-align:center;min-width:80px;font-size:10px">
        <div style="font-weight:800">P${p+1}</div>
        <div style="font-size:8px;color:var(--text-muted);font-weight:400">${TT.PERIOD_TIMES[p]}</div>
      </th>`;
    }
    html += `</tr></thead><tbody>`;

    TT.DAYS.forEach((day, di) => {
      html += `<tr>
        <td style="border:1px solid var(--border);padding:5px 8px;font-weight:800;color:var(--sky);text-align:center;background:var(--surface-2)">${TT.DAY_SHORT[di]}</td>`;
      for(let p=0;p<TT.NP;p++){
        if(TT.BREAK_AFTER.has(p)){
          const bLetter = TT.BREAK_LETTERS[di];
          html += `<td style="border:1px solid var(--border);background:rgba(100,100,100,0.08);text-align:center;font-weight:800;color:var(--text-muted);font-size:13px">${bLetter}</td>`;
        }
        const cell = tt[grade]?.[di]?.[p];
        if(!cell){
          html += `<td style="border:1px solid var(--border);background:rgba(100,100,100,0.04)"></td>`;
        } else if(cell.special){
          html += `<td style="border:1px solid var(--border);background:rgba(100,100,100,0.12);text-align:center;padding:4px">
            <div style="font-size:9px;font-weight:800;color:var(--text-muted)">${cell.subj}</div>
          </td>`;
        } else {
          const c = TT.COLORS[cell.subj]||'#888';
          html += `<td style="border:1px solid var(--border);padding:3px">
            <div style="background:${c}1a;border-left:3px solid ${c};padding:3px 4px;border-radius:4px;text-align:center">
              <div style="font-weight:800;color:${c};font-size:11px">${cell.subj}</div>
              <div style="font-size:9px;color:var(--text-muted)">${cell.teacher}</div>
            </div>
          </td>`;
        }
      }
      html += `</tr>`;
    });
    html += `</tbody></table></div></div>`;
  });
  container.innerHTML = html || '<div class="empty-state"><p>No grades selected</p></div>';
}

// ── Render: By Day (all classes, one table per day) ────────────────────────
function ttRenderByDay(tt, grades, container){
  let html = '';
  TT.DAYS.forEach((day, di) => {
    html += `
    <div class="card" style="margin-bottom:24px;overflow:hidden">
      <div class="card-header" style="background:linear-gradient(90deg,rgba(30,86,200,0.15),transparent)">
        <div class="card-title" style="color:var(--sky);font-size:14px">📅 ${day.toUpperCase()}</div>
      </div>
      <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:11px;min-width:900px">
        <thead><tr style="background:var(--surface-3)">
          <th style="border:1px solid var(--border);padding:7px 10px;color:var(--text-muted);width:55px">CLASS</th>`;
    for(let p=0;p<TT.NP;p++){
      if(TT.BREAK_AFTER.has(p)){
        const bIdx = TT.BREAK_IDX.get(p);
        html += `<th style="border:1px solid var(--border);background:rgba(100,100,100,0.1);color:var(--text-muted);width:36px;font-size:9px;text-align:center">BRK</th>`;
      }
      html += `<th style="border:1px solid var(--border);text-align:center;padding:5px 3px;min-width:78px;font-size:10px">
        <div style="font-weight:800">P${p+1}</div>
        <div style="font-size:8px;color:var(--text-muted);font-weight:400">${TT.PERIOD_TIMES[p]}</div>
      </th>`;
    }
    html += `</tr></thead><tbody>`;
    grades.forEach((grade,gi)=>{
      const bg = gi%2===0?'var(--surface-2)':'var(--surface-3)';
      html += `<tr style="background:${bg}">
        <td style="border:1px solid var(--border);padding:5px;font-weight:800;color:var(--sky);text-align:center">${grade}</td>`;
      for(let p=0;p<TT.NP;p++){
        if(TT.BREAK_AFTER.has(p)){
          html += `<td style="border:1px solid var(--border);background:rgba(100,100,100,0.08);text-align:center;font-weight:800;color:var(--text-muted)">${TT.BREAK_LETTERS[di]}</td>`;
        }
        const cell = tt[grade]?.[di]?.[p];
        if(!cell){
          html += `<td style="border:1px solid var(--border)"></td>`;
        } else if(cell.special){
          html += `<td style="border:1px solid var(--border);text-align:center;font-size:9px;font-weight:700;color:var(--text-muted)">${cell.subj}</td>`;
        } else {
          const c = TT.COLORS[cell.subj]||'#888';
          html += `<td style="border:1px solid var(--border);padding:2px">
            <div style="background:${c}1a;border-left:3px solid ${c};padding:2px 3px;border-radius:3px;text-align:center">
              <div style="font-weight:800;color:${c};font-size:10px">${cell.subj}</div>
              <div style="font-size:9px;color:var(--text-muted)">${cell.teacher}</div>
            </div>
          </td>`;
        }
      }
      html += '</tr>';
    });
    html += '</tbody></table></div></div>';
  });
  container.innerHTML = html;
}

// ── Render: By Teacher (TR. MARTIN style, one table per teacher) ───────────
function ttRenderByTeacher(tt, grades, container){
  // Invert: build teacherSchedule[teacher][day][period] = {grade, subj}
  const schedules = {};
  grades.forEach(grade => {
    for(let d=0;d<TT.ND;d++) for(let p=0;p<TT.NP;p++){
      const cell = tt[grade]?.[d]?.[p];
      if(cell && !cell.special && cell.teacher && cell.teacher!=='—'){
        const t = cell.teacher;
        if(!schedules[t]) schedules[t] = {};
        if(!schedules[t][d]) schedules[t][d] = {};
        schedules[t][d][p] = {grade, subj: cell.subj};
      }
    }
  });

  if(!Object.keys(schedules).length){
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">👩‍🏫</div><p>Assign teachers in the Teachers module first, then generate.</p></div>';
    return;
  }

  let html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(440px,1fr));gap:20px">';
  Object.entries(schedules).sort((a,b)=>a[0].localeCompare(b[0])).forEach(([teacher, sched])=>{
    // Count lessons
    let total=0;
    Object.values(sched).forEach(day=>total+=Object.keys(day).length);
    const max = TT.TEACHER_MAX[teacher.toUpperCase()]||'—';

    html += `<div class="card" style="overflow:hidden">
      <div class="card-header" style="background:linear-gradient(90deg,rgba(11,29,58,.3),transparent)">
        <div style="font-weight:800;color:var(--sky);font-size:13px">TR. ${teacher}</div>
        <div style="font-size:11px;color:var(--text-muted)">${total} / ${max} lessons</div>
      </div>
      <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:10px;min-width:380px">
        <thead>
          <tr style="background:var(--surface-3)">
            <th style="border:1px solid var(--border);padding:5px;color:var(--text-muted);width:44px">DAY</th>`;
    for(let p=0;p<TT.NP;p++){
      if(TT.BREAK_AFTER.has(p)){
        html += `<th style="border:1px solid var(--border);background:rgba(100,100,100,0.1);width:22px;font-size:8px;color:var(--text-muted);text-align:center"></th>`;
      }
      html += `<th style="border:1px solid var(--border);text-align:center;padding:3px;min-width:46px;font-size:9px">
        <div style="font-weight:800">P${p+1}</div>
      </th>`;
    }
    html += `</tr></thead><tbody>`;
    TT.DAYS.forEach((day,di)=>{
      html += `<tr>
        <td style="border:1px solid var(--border);padding:3px 5px;font-weight:800;color:var(--gold);text-align:center;font-size:10px">${TT.DAY_SHORT[di]}</td>`;
      for(let p=0;p<TT.NP;p++){
        if(TT.BREAK_AFTER.has(p)){
          html += `<td style="border:1px solid var(--border);background:rgba(100,100,100,0.08);text-align:center;font-weight:800;color:var(--text-muted);font-size:11px">${TT.BREAK_LETTERS[di]}</td>`;
        }
        const sp = ttIsSpecial(di,p);
        if(sp){
          html += `<td style="border:1px solid var(--border);background:rgba(100,100,100,0.1);text-align:center;padding:2px">
            <div style="font-size:8px;font-weight:700;color:var(--text-muted)">${sp}</div>
          </td>`;
        } else {
          const lesson = sched[di]?.[p];
          if(lesson){
            const c = TT.COLORS[lesson.subj]||'#888';
            html += `<td style="border:1px solid var(--border);padding:2px">
              <div style="background:${c}1a;border-top:2px solid ${c};padding:2px;border-radius:3px;text-align:center">
                <div style="font-weight:800;color:${c};font-size:9px">${lesson.subj}</div>
                <div style="font-size:8px;color:var(--text)">${lesson.grade}</div>
              </div>
            </td>`;
          } else {
            html += `<td style="border:1px solid var(--border);background:rgba(100,100,100,0.03)"></td>`;
          }
        }
      }
      html += '</tr>';
    });
    html += `</tbody></table></div></div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

// ── Summary view ──────────────────────────────────────────────────────────
function ttSummary(){
  if(!_tt2) return;
  const grades = [...document.querySelectorAll('.tt-grade-cb:checked')].map(cb=>cb.value);
  const container = document.getElementById('tt_results');
  let html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">';
  grades.forEach(grade => {
    const counts = {};
    ttSubjects(grade).forEach(s=>counts[s]=0);
    for(let d=0;d<TT.ND;d++) for(let p=0;p<TT.NP;p++){
      const cell = _tt2.tt[grade]?.[d]?.[p];
      if(cell && !cell.special && counts[cell.subj]!==undefined) counts[cell.subj]++;
    }
    html += `<div class="card"><div class="card-header"><div class="card-title" style="font-size:13px">Grade ${grade}</div></div>
      <div class="table-wrap"><table style="font-size:11px;width:100%;border-collapse:collapse">
        <thead><tr style="background:var(--surface-3)">
          <th style="padding:5px 8px;border:1px solid var(--border);text-align:left">Subject</th>
          <th style="padding:5px;border:1px solid var(--border);text-align:center">Target</th>
          <th style="padding:5px;border:1px solid var(--border);text-align:center">Placed</th>
          <th style="padding:5px;border:1px solid var(--border);text-align:center">✓</th>
        </tr></thead><tbody>`;
    Object.entries(counts).forEach(([subj,placed])=>{
      const target = (TT.LESSON_TARGETS[subj] != null) ? TT.LESSON_TARGETS[subj] : 3;
      const ok = placed>=target;
      const col = ok?'var(--emerald)':placed>0?'var(--gold)':'var(--rose)';
      html += `<tr>
        <td style="padding:4px 8px;border:1px solid var(--border);font-weight:700;color:${TT.COLORS[subj]||'var(--text)'}">${subj}</td>
        <td style="padding:4px;border:1px solid var(--border);text-align:center;font-family:monospace">${target}</td>
        <td style="padding:4px;border:1px solid var(--border);text-align:center;font-family:monospace;font-weight:700;color:${col}">${placed}</td>
        <td style="padding:4px;border:1px solid var(--border);text-align:center">${ok?'✅':placed>0?'⚠️':'❌'}</td>
      </tr>`;
    });
    html += '</tbody></table></div></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

// ── PDF: By Day (TR. MARTIN landscape format) ─────────────────────────────
function exportTimetablePDF(){
  if(!_tt2){ toast('Generate first',true); return; }
  const grades = [...document.querySelectorAll('.tt-grade-cb:checked')].map(cb=>cb.value);
  const term = document.getElementById('tt_term')?.value||'TERM 1';
  const yr = document.getElementById('tt_year')?.value||'2026';
  const jsPDF = window._getJsPDF();
  const doc = new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
  const W = doc.internal.pageSize.getWidth();
  let first = true;

  TT.DAYS.forEach((day,di)=>{
    if(!first) doc.addPage(); first=false;
    let y = pdfHeader(doc, `${day.toUpperCase()} TIMETABLE`, `${term} ${yr} | Santapris Academy`);

    const classW=14, breakW=9;
    const usable = W-8-classW-(breakW*TT.BREAK_AFTER.size);
    const pW = usable/TT.NP;

    // Build head
    const headRow1 = ['CLASS'];
    const headRow2 = [''];
    for(let p=0;p<TT.NP;p++){
      if(TT.BREAK_AFTER.has(p)){ const __bi = TT.BREAK_IDX.get(p); headRow1.push('BREAK'); headRow2.push(TT.BREAK_TIMES[__bi]||''); }
      headRow1.push(`P${p+1}`);
      headRow2.push(TT.PERIOD_TIMES[p].replace('AM','').replace('PM',''));
    }

    const body = grades.map(grade=>{
      const row = [grade];
      for(let p=0;p<TT.NP;p++){
        if(TT.BREAK_AFTER.has(p)) row.push(TT.BREAK_LETTERS[di]);
        const cell = _tt2.tt[grade]?.[di]?.[p];
        if(!cell) row.push('');
        else if(cell.special) row.push(cell.subj);
        else row.push(`${cell.subj}\n${cell.teacher}`);
      }
      return row;
    });

    const colW = [classW];
    for(let p=0;p<TT.NP;p++){ if(TT.BREAK_AFTER.has(p)) colW.push(breakW); colW.push(pW); }
    const subjColors={
      MATHS:[30,86,200],ENG:[13,122,82],KIS:[200,125,0],SCIE:[123,61,176],
      AGRIC:[58,125,68],SST:[200,64,64],CRE:[13,110,142],'C/A':[160,82,45],
      COMPT:[74,74,138],PTE:[138,43,226]
    };

    doc.autoTable({
      startY:y, head:[headRow1, headRow2], body,
      theme:'grid',
      headStyles:{fillColor:[11,29,58],textColor:[242,199,68],fontStyle:'bold',fontSize:6.5,cellPadding:1.2},
      styles:{fontSize:8,cellPadding:1.5,halign:'center',lineColor:[0,0,0],lineWidth:0.3,overflow:'linebreak'},
      columnStyles:{0:{fontStyle:'bold',halign:'center',fillColor:[22,46,82],textColor:[200,220,255],cellWidth:classW}},
      didParseCell(data){
        if(data.section!=='body') return;
        const raw = String(data.cell.raw||'');
        const subj = raw.split('\n')[0];
        if(['ASSEMBLY','GAMES','B','R','E','A','K'].includes(raw.trim())){
          data.cell.styles.fillColor=[230,230,230];
          data.cell.styles.textColor=[100,100,100];
          data.cell.styles.fontStyle='bold';
        }
        const rgb = subjColors[subj];
        if(rgb){
          data.cell.styles.textColor=rgb;
          data.cell.styles.fillColor=[Math.min(255,rgb[0]*0.08+245),Math.min(255,rgb[1]*0.08+245),Math.min(255,rgb[2]*0.08+245)];
        }
        // Break cols
        const breakCols=[]; { let c=1; for(let p=0;p<TT.NP;p++){ if(TT.BREAK_AFTER.has(p)){ breakCols.push(c); c++; } c++; } }
        if(breakCols.includes(data.column.index)){
          data.cell.styles.fillColor=[220,220,220];
          data.cell.styles.textColor=[100,100,100];
          data.cell.styles.fontStyle='bold';
        }
      },
      columnWidths:colW,
      margin:{left:4,right:4},tableWidth:W-8
    });
    pdfFooter(doc);
  });

  addPageNumbers(doc);
  doc.save(`Timetable_By_Day_${term}_${yr}.pdf`.replace(/\s+/g,'_'));
  toast('📄 Daily timetables exported!');
}

// ── PDF: By Class (one page per grade, like class card) ───────────────────
function exportTimetableByClass(){
  if(!_tt2){ toast('Generate first',true); return; }
  const grades = [...document.querySelectorAll('.tt-grade-cb:checked')].map(cb=>cb.value);
  const term = document.getElementById('tt_term')?.value||'TERM 1';
  const yr = document.getElementById('tt_year')?.value||'2026';
  const jsPDF = window._getJsPDF();
  const doc = new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
  const W = doc.internal.pageSize.getWidth();
  let first = true;

  grades.forEach(grade => {
    if(!first) doc.addPage(); first=false;
    let y = pdfHeader(doc,`GRADE ${grade} — WEEKLY TIMETABLE`,`${term} ${yr} | Santapris Academy`);

    const dayW=14, breakW=9;
    const usable=W-8-dayW-(breakW*4);
    const pW=usable/10;

    const head=[['DAY','P1','P2','','P3','P4','','P5','P6','P7','','P8','P9','','P10'],
                ['',TT.PERIOD_TIMES[0],TT.PERIOD_TIMES[1],'',TT.PERIOD_TIMES[2],TT.PERIOD_TIMES[3],'',
                 TT.PERIOD_TIMES[4],TT.PERIOD_TIMES[5],TT.PERIOD_TIMES[6],'',TT.PERIOD_TIMES[7],
                 TT.PERIOD_TIMES[8],'',TT.PERIOD_TIMES[9]]];

    const body = TT.DAYS.map((day,di)=>{
      const row=[TT.DAY_SHORT[di]];
      for(let p=0;p<TT.NP;p++){
        if(TT.BREAK_AFTER.has(p)) row.push(TT.BREAK_LETTERS[di]);
        const cell = _tt2.tt[grade]?.[di]?.[p];
        if(!cell) row.push('');
        else if(cell.special) row.push(cell.subj);
        else row.push(`${cell.subj}\n${cell.teacher}`);
      }
      return row;
    });

    const colW=[dayW,pW,pW,breakW,pW,pW,breakW,pW,pW,pW,breakW,pW,pW,breakW,pW];
    const subjColors={
      MATHS:[30,86,200],ENG:[13,122,82],KIS:[200,125,0],SCIE:[123,61,176],
      AGRIC:[58,125,68],SST:[200,64,64],CRE:[13,110,142],'C/A':[160,82,45],
      COMPT:[74,74,138],PTE:[138,43,226]
    };

    doc.autoTable({
      startY:y, head, body, theme:'grid',
      headStyles:{fillColor:[11,29,58],textColor:[242,199,68],fontStyle:'bold',fontSize:6,cellPadding:1.2},
      styles:{fontSize:8,cellPadding:1.5,halign:'center',lineColor:[0,0,0],lineWidth:0.3,overflow:'linebreak'},
      columnStyles:{0:{fontStyle:'bold',halign:'center',fillColor:[22,46,82],textColor:[200,220,255],cellWidth:dayW}},
      didParseCell(data){
        if(data.section!=='body') return;
        const raw=String(data.cell.raw||'');
        const subj=raw.split('\n')[0];
        const breakCols=[3,6,10,13];
        if(breakCols.includes(data.column.index)){
          data.cell.styles.fillColor=[220,220,220];
          data.cell.styles.textColor=[100,100,100];
          data.cell.styles.fontStyle='bold';
          return;
        }
        if(['ASSEMBLY','GAMES'].includes(raw.trim())){
          data.cell.styles.fillColor=[230,230,230];
          data.cell.styles.textColor=[100,100,100];
          data.cell.styles.fontStyle='bold';
          return;
        }
        const rgb=subjColors[subj];
        if(rgb){
          data.cell.styles.textColor=rgb;
          data.cell.styles.fillColor=[Math.min(255,rgb[0]*0.08+245),Math.min(255,rgb[1]*0.08+245),Math.min(255,rgb[2]*0.08+245)];
        }
      },
      columnWidths:colW, margin:{left:4,right:4}, tableWidth:W-8
    });
    pdfFooter(doc);
  });

  addPageNumbers(doc);
  doc.save(`Timetable_By_Class_${term}_${yr}.pdf`.replace(/\s+/g,'_'));
  toast('📄 Class timetables exported!');
}

// ── PDF: By Teacher (TR. MARTIN exact format) ─────────────────────────────
function exportTimetableByTeacher(){
  if(!_tt2){ toast('Generate first',true); return; }
  const grades = [...document.querySelectorAll('.tt-grade-cb:checked')].map(cb=>cb.value);
  const term = document.getElementById('tt_term')?.value||'TERM 1';
  const yr = document.getElementById('tt_year')?.value||'2026';

  // Invert to teacher schedules
  const schedules = {};
  grades.forEach(grade=>{
    for(let d=0;d<TT.ND;d++) for(let p=0;p<TT.NP;p++){
      const cell = _tt2.tt[grade]?.[d]?.[p];
      if(cell && !cell.special && cell.teacher && cell.teacher!=='—'){
        const t = cell.teacher;
        if(!schedules[t]) schedules[t]={};
        if(!schedules[t][d]) schedules[t][d]={};
        schedules[t][d][p]={grade,subj:cell.subj};
      }
    }
  });

  const jsPDF = window._getJsPDF();
  const doc = new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
  const W = doc.internal.pageSize.getWidth();
  let first = true;

  const subjColors={
    MATHS:[30,86,200],ENG:[13,122,82],KIS:[200,125,0],SCIE:[123,61,176],
    AGRIC:[58,125,68],SST:[200,64,64],CRE:[13,110,142],'C/A':[160,82,45],
    COMPT:[74,74,138],PTE:[138,43,226]
  };

  Object.entries(schedules).sort((a,b)=>a[0].localeCompare(b[0])).forEach(([teacher,sched])=>{
    if(!first) doc.addPage(); first=false;

    let total=0;
    Object.values(sched).forEach(d=>total+=Object.keys(d).length);
    const max=TT.TEACHER_MAX[teacher.toUpperCase()]||'—';

    let y=pdfHeader(doc,`TR. ${teacher}`,`${term} ${yr} | ${total}/${max} lessons`);

    const dayW=14, breakW=9;
    const usable=W-8-dayW-(breakW*4);
    const pW=usable/10;

    const head=[
      ['DAY','1','2','','3','4','','5','6','7','','8','9','','10'],
      ['',TT.PERIOD_TIMES[0],TT.PERIOD_TIMES[1],TT.BREAK_TIMES[0],
       TT.PERIOD_TIMES[2],TT.PERIOD_TIMES[3],TT.BREAK_TIMES[1],
       TT.PERIOD_TIMES[4],TT.PERIOD_TIMES[5],TT.PERIOD_TIMES[6],TT.BREAK_TIMES[2],
       TT.PERIOD_TIMES[7],TT.PERIOD_TIMES[8],TT.BREAK_TIMES[3],TT.PERIOD_TIMES[9]]
    ];

    const body=TT.DAYS.map((day,di)=>{
      const row=[TT.DAY_SHORT[di]];
      for(let p=0;p<TT.NP;p++){
        if(TT.BREAK_AFTER.has(p)) row.push(TT.BREAK_LETTERS[di]);
        const sp=ttIsSpecial(di,p);
        if(sp){ row.push(sp); continue; }
        const lesson=sched[di]?.[p];
        row.push(lesson ? `${lesson.subj}\n${lesson.grade}` : '');
      }
      return row;
    });

    const colW=[dayW,pW,pW,breakW,pW,pW,breakW,pW,pW,pW,breakW,pW,pW,breakW,pW];

    doc.autoTable({
      startY:y, head, body, theme:'grid',
      headStyles:{fillColor:[11,29,58],textColor:[242,199,68],fontStyle:'bold',fontSize:6,cellPadding:1.2},
      styles:{fontSize:8.5,cellPadding:1.5,halign:'center',lineColor:[0,0,0],lineWidth:0.35,overflow:'linebreak'},
      columnStyles:{0:{fontStyle:'bold',halign:'center',fillColor:[22,46,82],textColor:[200,220,255],cellWidth:dayW}},
      didParseCell(data){
        if(data.section!=='body') return;
        const raw=String(data.cell.raw||'');
        const subj=raw.split('\n')[0];
        const breakCols=[3,6,10,13];
        if(breakCols.includes(data.column.index)){
          data.cell.styles.fillColor=[215,215,215];
          data.cell.styles.textColor=[80,80,80];
          data.cell.styles.fontStyle='bold';
          return;
        }
        if(['ASSEMBLY','GAMES'].includes(raw.trim())){
          data.cell.styles.fillColor=[230,230,230];
          data.cell.styles.textColor=[100,100,100];
          data.cell.styles.fontStyle='bold';
          return;
        }
        const rgb=subjColors[subj];
        if(rgb){
          data.cell.styles.textColor=rgb;
          data.cell.styles.fillColor=[Math.min(255,rgb[0]*0.1+244),Math.min(255,rgb[1]*0.1+244),Math.min(255,rgb[2]*0.1+244)];
          data.cell.styles.fontStyle='bold';
        }
      },
      columnWidths:colW, margin:{left:4,right:4}, tableWidth:W-8
    });
    pdfFooter(doc);
  });

  addPageNumbers(doc);
  doc.save(`Timetable_By_Teacher_${term}_${yr}.pdf`.replace(/\s+/g,'_'));
  toast('📄 Teacher timetables exported!');
}

// ── Save / Load ──────────────────────────────────────────────────────────
function saveTimetableToDB(){
  if(!_tt2){ toast('Generate first',true); return; }
  const term=document.getElementById('tt_term')?.value||'TERM 1';
  const yr=document.getElementById('tt_year')?.value||'2026';
  if(!db.timetables) db.timetables=[];
  db.timetables=db.timetables.filter(t=>!(t.term===term&&t.year==yr));
  db.timetables.push({term,year:yr,savedAt:new Date().toISOString(),timetable:_tt2.tt});
  saveDB(); toast('✅ Timetable saved!');
}

function loadTimetableFromDB(){
  const term=document.getElementById('tt_term')?.value||'TERM 1';
  const yr=document.getElementById('tt_year')?.value||'2026';
  const saved=(db.timetables||[]).find(t=>t.term===term&&t.year==yr);
  if(!saved){ toast('No saved timetable for this term/year',true); return; }
  const grades=[...document.querySelectorAll('.tt-grade-cb:checked')].map(cb=>cb.value);
  _tt2={tt:saved.timetable,placed:0,total:0,restarts:0};
  ttRender();
  toast('✅ Loaded from '+saved.savedAt.slice(0,10));
}
