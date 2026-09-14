import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {Presentation,PresentationFile,FileBlob} from '@oai/artifact-tool';
import {finalizePresentation,resolvePresentationFont} from '/Users/mrithyunjayanm/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root=process.cwd(), work=path.join(root,'.presentation-polish');
const skill='/Users/mrithyunjayanm/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const src=JSON.parse(await fs.readFile(path.join(work,'content.json'),'utf8'));
const font=resolvePresentationFont({fontFamily:'Arial'});
const p=Presentation.create({slideSize:{width:1280,height:720}});
const C={ink:'#142D3B',body:'#405561',muted:'#637580',accent:'#087F82',paper:'#FAFBFC',dark:'#102C3A',light:'#BBD5DC'};
function text(s,t,x,y,w,h,size=24,color=C.ink,bold=false){const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=t;a.text.style={fontSize:size,typeface:font,color,bold,autoFit:'none'};return a;}
function slide(title,section='Kealvi',dark=false){const s=p.slides.add();s.background.fill=dark?C.dark:C.paper; if(title)text(s,title,64,62,1152,88,42,dark?'#FFFFFF':C.ink,true);text(s,section,64,676,1040,24,14,dark?C.light:C.muted);text(s,String(p.slides.items.length).padStart(2,'0'),1160,676,55,24,14,dark?C.light:C.muted);return s;}
function notes(s,i,extra=''){s.speakerNotes.textFrame.setText(`Source: 2403717610421033 - Mrithyunjayan M.pptx, slide ${i}. ${extra}`);}
async function img(s,file,x,y,w,h){s.images.add({blob:await fs.readFile(file),contentType:/jpe?g$/i.test(file)?'image/jpeg':'image/png',fit:'contain',position:{left:x,top:y,width:w,height:h},alt:path.basename(file)});}
function items(s,arr,x=64,y=184,w=1120,gap=93){arr.forEach(([head,body],i)=>{text(s,head,x,y+i*gap,w,35,27,C.ink,true);text(s,body,x,y+39+i*gap,w,58,22,C.body);});}
function twocol(s,arr){arr.forEach(([head,body],i)=>{let col=i%2,row=Math.floor(i/2);text(s,head,64+col*598,185+row*148,540,37,26,C.ink,true);text(s,body,64+col*598,226+row*148,530,89,23,C.body);});}

let s=slide('', 'Coimbatore Institute of Technology',true);
text(s,'KEALVI',64,120,940,120,88,'#FFFFFF',true);
text(s,'Live audience workspace',68,259,1040,72,40,'#FFFFFF');
text(s,'Mrithyunjayan M',68,402,900,42,29,'#FFFFFF',true);
text(s,'Register No. 2403717610421033',68,453,900,34,23,C.light);
text(s,'B.E. Computer Science and Engineering',68,493,1050,35,23,C.light);
text(s,'13 September 2026',68,545,800,35,23,C.light);
const logo=src[0].images[0],meta=await sharp(logo).metadata();
// Extract the original crest from its decorative vertical banner, without altering its proportions.
const logoOut=path.join(work,'crest.png');await sharp(logo).extract({left:0,top:Math.round(meta.height*.285),width:meta.width,height:Math.min(meta.width,meta.height-Math.round(meta.height*.285))}).png().toFile(logoOut);
await img(s,logoOut,1090,65,120,120);text(s,'Government Aided Autonomous Institution Affiliated to Anna University',68,604,1100,29,18,C.light);text(s,'Coimbatore 641014',68,635,1000,28,18,C.light);notes(s,1,'Institution: Government Aided Autonomous Institution Affiliated to Anna University, Coimbatore 641014.');

s=slide('Presentation overview');
[['01','Context & objectives','Introduction, problem statement and project goals'],['02','Implementation','Technologies, application structure and features'],['03','Product walkthrough','Desktop screens and responsive mobile layouts'],['04','Interface study','Apple TV analysis, design lessons and conclusion']].forEach(([n,h,b],i)=>{text(s,n,64,177+i*114,90,58,42,C.accent);text(s,h,176,179+i*114,1010,42,29,C.ink,true);text(s,b,176,226+i*114,1010,42,23,C.body)});notes(s,2);
s=slide('A workspace for audience participation');
text(s,'Kealvi brings poll creation, voting and result review into one responsive web application.',64,180,1120,120,36,C.ink);
twocol(s,[['', '']]);s.shapes.items[s.shapes.items.length-1].delete();s.shapes.items[s.shapes.items.length-1].delete();
items(s,[['Core workflow','Create a poll, collect votes, review results and make a decision.'],['Audience','Teams, classrooms, communities and live sessions.'],['Interaction goal','Quick actions with clear feedback on desktop and mobile.']],64,330,1120,100);notes(s,3,'Results refresh every 15 seconds and after voting or publishing. Source: project README.md.');
s=slide('The problem with fragmented polling');
text(s,'Questions, responses and results often live in different tools.',64,169,1120,70,34,C.ink);
items(s,[['Fragmented interaction','Separate forms and chat threads add friction for organizers and participants.'],['Limited visibility','A scattered workflow makes active polls and response distribution harder to follow.'],['Weak decision support','Raw responses need context, including participation history and engagement.']],64,275,1120,113);notes(s,4);
s=slide('Project objectives');twocol(s,[['Create and manage polls','Set a question, answer options, category and closing time.'],['Support live voting','Record responses and display the result distribution.'],['Organize poll history','Search and filter All polls, My polls, Voted and Saved.'],['Show participation insights','Review rankings, category summaries and recent activity.'],['Support mobile use','Keep navigation and essential actions accessible.'],['Assist poll drafting','Offer optional Gemini drafts alongside editable templates.']]);notes(s,5,'Gemini requires configuration. It is not enabled in the supplied checkout.');
s=slide('Technologies and tools');
const vals=[['Component','Role'],['Next.js / React','Web interface and application routes'],['CSS / Tailwind CSS','Responsive styling and interface layout'],['Supabase / PostgreSQL','Poll, option and vote persistence'],['Google Gemini (optional)','Assisted poll drafting when configured'],['Vercel','Hosting and deployment platform'],['GitHub','Source control and collaboration']];
const t=s.tables.add({rows:7,columns:2,left:64,top:173,width:1152,height:432,columnWidths:[370,782],values:vals});t.borders.assign({fill:'#E2E8EB',width:0.6});
for(let r=0;r<7;r++)for(let c=0;c<2;c++){const cell=t.getCell(r,c);cell.fill=r===0?C.dark:(r%2?'#FFFFFF':'#F0F4F5');cell.text.style={typeface:font,fontSize:23,bold:r===0||c===0,color:r===0?'#FFFFFF':C.ink};}notes(s,6,'Technology roles follow the supplied deck. Hosting listed here does not establish a live deployment.');
s=slide('System architecture');
items(s,[['01  Browser interface','Audience and organizers use Next.js / React pages, forms and poll views.'],['02  Application routes','Server handlers validate creation and voting requests, then return updated results.'],['03  Supabase / PostgreSQL','Persistent data stores polls, answer options and recorded votes.'],['04  Optional Gemini integration','A server route requests a draft when the Gemini API key is configured.']],64,180,1130,110);
text(s,'Browser storage retains display identity and saved polls. GitHub and Vercel support delivery.',64,626,1130,35,19,C.muted);notes(s,7,'Architecture clarified against project README.md: browser-local identity and bookmarks, server Route Handlers, Supabase persistence.');
s=slide('Application capabilities');
twocol(s,[['Overview and polling','Workspace totals, editable templates, voting and poll closing.'],['Poll library','Saved polls, voting history, search and status filters.'],['Leaderboard and insights','Contributor rankings and category-level participation.'],['Activity feed','Recent poll launches and voting actions.'],['Sharing and export','Direct poll links and downloadable JSON results.'],['Responsive interface','Desktop and mobile views with clear action feedback.']]);notes(s,8);

async function screenshot(title,file,body,sourceSlide){let s=slide(title,'Kealvi / Product walkthrough');let m=await sharp(file).metadata();
 if(m.height/m.width>1.25){const chunk=Math.ceil(m.height/2);for(let k=0;k<2;k++){const top=k*chunk,h=Math.min(chunk,m.height-top),f=path.join(work,`desktop-${sourceSlide}-${path.basename(file)}-${k}.png`);await sharp(file).extract({left:0,top,width:m.width,height:h}).png().toFile(f);await img(s,f,390+k*418,166,402,455);}text(s,body,64,188,286,284,26,C.body);text(s,'Page continues from left to right',390,635,826,25,18,C.muted);}
 else {await img(s,file,390,166,826,480);text(s,body,64,189,286,284,27,C.body);}
 notes(s,sourceSlide,'Original supplied screenshot. Values describe the captured demonstration state.');return s;}
await screenshot('Overview dashboard',src[8].images[0],'Workspace metrics provide a quick view of active polls, responses and recent activity.',9);
await screenshot('Poll creation',src[8].images[1],'Templates give creators a starting point. Questions, options and closing times remain editable.',9);
await screenshot('Live voting',src[9].images[0],'Participants choose an answer and receive clear confirmation with updated counts and percentages.',10);
await screenshot('Closed poll results',src[9].images[1],'Closing a poll disables voting while keeping the final result distribution available.',10);
await screenshot('Search and empty states',src[9].images[2],'When no poll matches, the interface explains the empty state and suggests a next step.',10);
await screenshot('Shared poll view',src[10].images[1],'A direct link focuses the workspace on one poll. Users can return to the full library.',11);
await screenshot('Saved polls',src[10].images[0],'Bookmarks keep useful polls within reach and persist across reloads in the same browser.',11);
await screenshot('My polls',src[10].images[2],'Creators can revisit polls made in their browser and manage their closing state.',11);
await screenshot('Voting history',src[10].images[3],'The Voted collection provides a convenient way to revisit participated polls and their results.',11);
await screenshot('Contributor leaderboard',src[11].images[0],'The leaderboard brings poll creation and named voting activity into one contributor view.',12);
await screenshot('Participation insights',src[11].images[1],'Engagement indicators and category summaries help users interpret participation.',12);
await screenshot('Activity feed',src[11].images[2],'Recent poll launches and votes appear with context and relative time indicators.',12);
for(let i=0;i<3;i++){const titles=['Mobile overview','Mobile poll room','Mobile activity'];s=slide(titles[i],'Kealvi / Responsive design');const f=src[12].images[i],m=await sharp(f).metadata();const n=Math.max(1,Math.ceil((m.height/m.width)/2.1));const cols=Math.min(n,4);const chunk=Math.ceil(m.height/cols);for(let j=0;j<cols;j++){const top=j*chunk,h=Math.min(chunk,m.height-top),part=path.join(work,`mobile-${i}-${j}.png`);await sharp(f).extract({left:0,top,width:m.width,height:h}).png().toFile(part);await img(s,part,64+j*(1152/cols),166,1152/cols-28,451);}text(s,'Page continues from left to right',64,638,1152,25,18,C.muted);notes(s,13,'Original full-page mobile screenshot, divided into consecutive sections for readability. No page content omitted.');}

s=slide('Apple TV: content discovery','Apple TV / Interface study',true);
for(let i=0;i<4;i++){await img(s,src[13].images[i],64+i*294,170,266,365);text(s,['Home','Apple TV+','Store','Search'][i],64+i*294,552,264,39,26,'#FFFFFF',true);}
text(s,'Featured artwork introduces content. Play, save and persistent navigation support the next action.',64,614,1152,51,23,C.light);notes(s,14,'Interface observations relate to the supplied captures, not a current product audit.');
s=slide('Apple TV: library and account','Apple TV / Interface study',true);
await img(s,src[14].images[0],64,163,278,450);await img(s,src[14].images[1],378,163,278,450);
text(s,'Library',720,195,474,43,30,'#FFFFFF',true);text(s,'A dedicated destination for purchased content and an explanatory empty state.',720,250,460,110,26,C.light);
text(s,'Account',720,391,474,43,30,'#FFFFFF',true);text(s,'Account settings group subscriptions, purchases and family-related controls.',720,446,460,120,26,C.light);notes(s,15);
s=slide('Apple TV: stakeholders and services','Apple TV / Interface study');
text(s,'Stakeholders',64,180,530,44,30,C.accent,true);text(s,'Viewers and subscribers\nStudios and content providers\nPurchase and rental operations\nRecommendation and analytics teams\nAdvertising and promotional partners\nSupport and account teams',64,246,530,344,25,C.body);
text(s,'Supporting services',664,180,550,44,30,C.accent,true);text(s,'Authentication, accounts and family sharing\nSubscriptions, payments and purchases\nStreaming and content delivery\nSearch, voice search and recommendations\nWatchlists and library management\nNotifications and usage analytics',664,246,550,344,25,C.body);notes(s,15,'Service categories from the supplied analysis, not verified internal Apple architecture.');
s=slide('Design lessons for Kealvi');twocol(s,[['Visible primary actions','Create poll remains easy to find, like prominent playback actions.'],['Consistent navigation','Stable destinations help users move between workspace views.'],['Saved content','Saved polls and My polls provide familiar ways to return to content.'],['Fast discovery','Search and filters reduce the effort of finding a relevant poll.'],['Immediate feedback','Vote confirmation, closed states and empty states explain what happened.'],['Personal context','Display names connect contributions with the activity feed and rankings.']]);notes(s,16);
s=slide('Conclusion');
text(s,'Kealvi combines the complete polling workflow in one responsive workspace.',64,177,1130,112,38,C.ink,true);
items(s,[['Practical full-stack integration','The interface connects poll creation and voting with Supabase persistence.'],['Clear participation feedback','Results, collections, insights and activity support review and follow-up.'],['Consistent interaction design','The Apple TV study informs primary actions, navigation and saved-content patterns.']],64,324,1130,102);notes(s,17,'Optional Gemini drafting requires configuration.');
s=slide('','Coimbatore Institute of Technology',true);text(s,'Thank you',64,245,1120,105,80,'#FFFFFF',true);text(s,'Questions & discussion',68,380,1120,53,32,C.light);text(s,'Mrithyunjayan M',68,520,1120,42,27,'#FFFFFF');notes(s,18);

await fs.mkdir(path.join(work,'rendered'),{recursive:true});
const candidate=path.join(work,'candidate.pptx');await(await PresentationFile.exportPptx(p)).save(candidate);
console.log('Exported',p.slides.items.length,'slides');
for(let i=0;i<p.slides.items.length;i++){const blob=await p.export({slide:p.slides.items[i],format:'png',scale:1});await fs.writeFile(path.join(work,'rendered',`slide-${i+1}.png`),new Uint8Array(await blob.arrayBuffer()));console.log('Rendered',i+1);}
const finalPath=path.join(root,'presentations','Kealvi-Mrithyunjayan-Polished.pptx');
const result=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath,pythonExecutable:'/Users/mrithyunjayanm/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit','--require-native-table-slide','6'],requiredNativeTableOwnerSlides:[6],fontPolicy:{basis:'design',families:[font]},verifyArtifactToolImport:true,receiptPath:path.join(work,'validation-final.json')});console.log(JSON.stringify(result));
