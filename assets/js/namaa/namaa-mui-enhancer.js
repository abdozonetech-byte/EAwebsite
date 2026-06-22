(function(window,document){
  'use strict';

  var CAN_IMPORT=('noModule' in HTMLScriptElement.prototype);
  var dock=document.getElementById('namaaMuiDock');
  var sidebar=document.getElementById('namaaSidebar');
  var hero=document.getElementById('namaaHero');
  var topbar=document.querySelector('.namaa-topbar');
  if(!CAN_IMPORT)return;

  var CDN_REACT='https://esm.sh/react@18.2.0';
  var CDN_REACT_DOM='https://esm.sh/react-dom@18.2.0/client';
  var CDN_MUI='https://esm.sh/@mui/material@5.15.20?deps=react@18.2.0,react-dom@18.2.0';
  var NAMAA_MUI_VERSION='53-adaptive-agent-dashboards';

  function ensureSlot(id, className, parent, position){
    var el=document.getElementById(id);
    if(el)return el;
    el=document.createElement('div');
    el.id=id;
    el.className=className || '';
    if(!parent)return null;
    if(position==='prepend')parent.insertBefore(el,parent.firstChild);
    else if(position && position.after && position.after.parentNode)position.after.parentNode.insertBefore(el,position.after.nextSibling);
    else parent.appendChild(el);
    return el;
  }

  function getActiveAgent(){return document.body.getAttribute('data-namaa-agent') || 'talk';}
  function getFlowStage(){return document.body.getAttribute('data-namaa-flow-stage') || 'intake';}
  function getRuntimeState(){
    try{return (window.NamaaRuntime && window.NamaaRuntime.getState && window.NamaaRuntime.getState()) || {};}
    catch(error){return {};}
  }
  function runtimeProjectDNA(){
    try{return (window.NamaaRuntime && window.NamaaRuntime.getProjectDNA && window.NamaaRuntime.getProjectDNA()) || (getRuntimeState().projectDNA) || null;}
    catch(error){return null;}
  }
  function isDNAReady(){
    var dna=runtimeProjectDNA();
    return !!(dna && dna.brief);
  }
  function clickSelector(selector){
    var target=document.querySelector(selector);
    if(target)target.click();
  }
  function activateAgent(agent){
    var target=document.querySelector('.namaa-agent-link[data-agent="'+agent+'"], .namaa-plus-menu [data-agent="'+agent+'"]');
    if(target){target.click();return;}
    var dnaTarget=document.querySelector('[data-dna-agent="'+agent+'"]');
    if(dnaTarget){dnaTarget.click();return;}
    if(!isDNAReady()){flowAction('build-project-flow');return;}
    flowAction('build-project-flow');
  }
  function flowAction(action){clickSelector('[data-flow-action="'+action+'"]');}

  function injectFallback(){
    if(dock){
      var active=getActiveAgent();
      var label=active==='images'?'Namaa Images':active==='dev'?'NamaaDev':'Namaa Talk';
      dock.innerHTML='<span>'+label+'</span><span>Project Factory</span>';
    }
  }

  window.setTimeout(function(){
    Promise.all([import(CDN_REACT),import(CDN_REACT_DOM),import(CDN_MUI)]).then(function(mods){
      var React=mods[0];
      var ReactDOM=mods[1];
      var MUI=mods[2];
      var h=React.createElement;
      var ThemeProvider=MUI.ThemeProvider;
      var createTheme=MUI.createTheme;
      var Box=MUI.Box;
      var Stack=MUI.Stack;
      var Chip=MUI.Chip;
      var Paper=MUI.Paper;
      var Button=MUI.Button;
      var ButtonBase=MUI.ButtonBase;
      var Typography=MUI.Typography;
      var Stepper=MUI.Stepper;
      var Step=MUI.Step;
      var StepLabel=MUI.StepLabel;
      var LinearProgress=MUI.LinearProgress;
      var Badge=MUI.Badge;
      var Tooltip=MUI.Tooltip;
      var Fade=MUI.Fade;
      var Grow=MUI.Grow;
      var Divider=MUI.Divider;
      var Avatar=MUI.Avatar;

      var theme=createTheme({
        palette:{
          mode:'light',
          primary:{main:'#2563eb',dark:'#1d4ed8',light:'#dbeafe'},
          secondary:{main:'#0ea5e9'},
          success:{main:'#10b981'},
          warning:{main:'#f59e0b'},
          text:{primary:'#07152f',secondary:'#53657f'},
          background:{paper:'rgba(255,255,255,.84)',default:'#f8fbff'}
        },
        typography:{fontFamily:'Urbanist, Inter, system-ui, -apple-system, Segoe UI, sans-serif',button:{textTransform:'none',fontWeight:900}},
        shape:{borderRadius:18},
        components:{
          MuiPaper:{styleOverrides:{root:{backdropFilter:'blur(18px)',backgroundImage:'linear-gradient(135deg, rgba(255,255,255,.94), rgba(255,255,255,.74))'}}},
          MuiChip:{styleOverrides:{root:{fontWeight:950,letterSpacing:'-.015em'}}},
          MuiButton:{styleOverrides:{root:{borderRadius:999,minHeight:38,boxShadow:'none'}}},
          MuiStepLabel:{styleOverrides:{label:{fontFamily:'Urbanist, system-ui, sans-serif',fontWeight:900,letterSpacing:'-.015em'}}}
        }
      });

      var stages=[
        {key:'brief',label:'Brief',emoji:'🧭'},
        {key:'strategy',label:'Strategy',emoji:'📊'},
        {key:'design',label:'Design',emoji:'🎨'},
        {key:'web',label:'Web',emoji:'💻'}
      ];
      var agents=[
        {key:'talk',label:'Talk',name:'Namaa AI Talk',emoji:'💬',route:'Free Talk',text:'Main chat that understands the user and collects Project DNA',goal:'Talk freely or start Project Build.'},
        {key:'market',label:'Market',name:'Market Research',emoji:'🔎',route:'Morocco research',text:'Cities, demand, competitors, pricing and opportunity gaps',goal:'Works after Project DNA.'},
        {key:'strategy',label:'Strategy',name:'Strategy Agent',emoji:'🧭',route:'Roadmap',text:'Positioning, offer, 30/60/90 days and business actions',goal:'Works after Project DNA.'},
        {key:'marketing',label:'Marketing',name:'Marketing Agent',emoji:'📣',route:'Ads + funnel',text:'Meta, Google, TikTok, content, landing page and leads',goal:'Works after Project DNA.'},
        {key:'crm',label:'CRM',name:'WhatsApp & CRM',emoji:'🟢',route:'Lead flow',text:'Scripts, qualification, follow-up and CRM mini workflow',goal:'Works after Project DNA.'},
        {key:'startup',label:'Startup',name:'Startup Launch',emoji:'🚀',route:'MVP launch',text:'Validation, pricing, launch checklist and execution plan',goal:'Works after Project DNA.'},
        {key:'automation',label:'Automation',name:'AI & Automation',emoji:'⚙️',route:'Systems',text:'AI tools, automations, workflows and business systems',goal:'Works after Project DNA.'},
        {key:'website',label:'Website',name:'IT / Website',emoji:'💻',route:'Web + SEO',text:'Landing page, SEO, performance, UI/UX and tech planning',goal:'Works after Project DNA.'},
        {key:'images',label:'Brand',name:'Brand / Mockups',emoji:'🎨',route:'Logo + mockups',text:'Logo concept, brand board and category mockups',goal:'Runs after strategy.'}
      ];
      function stageIndex(stage){
        if(/complete|dev/.test(stage))return 3;
        if(/image|mockup|design/.test(stage))return 2;
        if(/strategy|pdf|roadmap|brief-ready/.test(stage))return 1;
        return 0;
      }
      function agentStatus(agent,active,stage){
        if(agent===active)return stage.indexOf('generating')>-1?'Working':'Active';
        if(agent==='talk')return 'Ready';
        if(agent==='images' && stageIndex(stage)>=2)return 'Ready';
        if(['market','strategy','marketing','crm','startup','automation','website'].indexOf(agent)>-1 && stageIndex(stage)>=1)return 'Project DNA';
        return 'After DNA';
      }
      function useNamaaState(){
        var state=React.useState({agent:getActiveAgent(),stage:getFlowStage(),runtime:getRuntimeState()});
        var value=state[0];
        var setValue=state[1];
        React.useEffect(function(){
          var raf=0;
          function refresh(){
            window.cancelAnimationFrame(raf);
            raf=window.requestAnimationFrame(function(){setValue({agent:getActiveAgent(),stage:getFlowStage(),runtime:getRuntimeState()});});
          }
          var observer=new MutationObserver(refresh);
          observer.observe(document.body,{attributes:true,attributeFilter:['data-namaa-agent','data-namaa-flow-stage']});
          window.addEventListener('namaa:flow-stage',refresh);
          window.addEventListener('namaa:project-dna',refresh);
          document.addEventListener('click',refresh,true);
          return function(){observer.disconnect();window.removeEventListener('namaa:flow-stage',refresh);window.removeEventListener('namaa:project-dna',refresh);document.removeEventListener('click',refresh,true);window.cancelAnimationFrame(raf);};
        },[]);
        return value;
      }
      function ModeDock(){
        var state=useNamaaState();
        function chip(item){
          var active=state.agent===item.key;
          return h(Tooltip,{key:item.key,title:item.name,arrow:true},
            h(Chip,{
              label:item.label,
              icon:h('span',{style:{fontSize:14,lineHeight:1}},item.emoji),
              onClick:function(){activateAgent(item.key);},
              color:active?'primary':'default',
              variant:active?'filled':'outlined',
              size:'small',
              sx:{
                height:34,borderRadius:'999px',px:.4,bgcolor:active?'#2563eb':'rgba(255,255,255,.80)',borderColor:'#dbeafe',
                color:active?'#fff':'#15376d',boxShadow:active?'0 14px 28px rgba(37,99,235,.24)':'0 8px 20px rgba(37,99,235,.07)',
                transition:'transform .18s cubic-bezier(.2,.8,.2,1), box-shadow .18s ease, background .18s ease',
                '& .MuiChip-icon':{ml:'7px',color:'inherit'},'&:hover':{bgcolor:active?'#1d4ed8':'#fff',transform:'translateY(-1px)'}
              }
            })
          );
        }
        return h(ThemeProvider,{theme:theme},h(Stack,{direction:'row',spacing:1,alignItems:'center',sx:{display:{xs:'none',lg:'flex'}}},agents.map(chip)));
      }
      function FactoryStepper(){
        var state=useNamaaState();
        var active=stageIndex(state.stage);
        return h(ThemeProvider,{theme:theme},
          h(Fade,{in:true,timeout:420},
            h(Paper,{className:'namaa-mui-factory-stepper',elevation:0},
              h(Stack,{direction:{xs:'column',sm:'row'},alignItems:{xs:'stretch',sm:'center'},justifyContent:'space-between',spacing:1.4},
                h(Box,null,
                  h(Typography,{variant:'overline',sx:{fontWeight:950,letterSpacing:'.08em',color:'#2563eb',lineHeight:1}},'Namaa workspace'),
                  h(Typography,{variant:'body2',sx:{fontWeight:850,color:'#50617c',lineHeight:1.25}},'Free Talk first. Project Builder appears only when needed.')
                ),
                h(Stack,{direction:'row',spacing:1},
                  h(Button,{variant:'outlined',size:'small',onClick:function(){flowAction('free-talk-mode');}},'Free Talk'),
                  h(Button,{variant:'contained',size:'small',onClick:function(){flowAction('build-project-flow');}},'Build Project')
                )
              ),
              h(Stepper,{activeStep:active,alternativeLabel:true,sx:{mt:1.7,'.MuiStepConnector-line':{borderColor:'rgba(37,99,235,.18)'}}},
                stages.map(function(step){return h(Step,{key:step.key},h(StepLabel,{icon:h('span',{className:'namaa-mui-step-icon'},step.emoji)},step.label));})
              )
            )
          )
        );
      }
      function AgentHub(){
        var state=useNamaaState();
        var currentIndex=stageIndex(state.stage);
        var runtime=state.runtime || {};
        var projectDNA=runtime.projectDNA || runtimeProjectDNA();
        var dnaReady=!!(projectDNA && projectDNA.brief);
        var activeBrief=dnaReady ? projectDNA.brief : (runtime.projectBrief || runtime.projectBriefDraft || {});
        var briefScore=0;
        try{
          var keys=['projectName','category','market','budget','goal','target','offer','channels'];
          var filled=keys.filter(function(key){return activeBrief && activeBrief[key] && String(activeBrief[key]).length;}).length;
          briefScore=dnaReady ? Number(projectDNA.score || Math.round((filled/keys.length)*100)) : Math.round((filled/keys.length)*100);
        }catch(error){briefScore=0;}
        function statusTone(status,active){
          if(status==='Working')return 'warning';
          if(active || status==='Ready' || status==='DNA ready')return 'success';
          return 'default';
        }
        return h(ThemeProvider,{theme:theme},
          h(Stack,{className:'namaa-mui-agent-hub namaa-mui-agent-hub-v36',spacing:1.15},
            h(Paper,{className:'namaa-mui-command-card',elevation:0},
              h(Stack,{direction:'row',alignItems:'center',spacing:1.1},
                h(Avatar,{className:'namaa-mui-command-avatar'},'N'),
                h(Box,{sx:{minWidth:0,flex:1}},
                  h(Typography,{variant:'caption',sx:{display:'block',fontWeight:950,letterSpacing:'.08em',textTransform:'uppercase',color:'#8fb4ff'}},dnaReady?'Project DNA active':'Namaa command'),
                  h(Typography,{variant:'body2',sx:{fontWeight:950,color:'#fff',lineHeight:1.1}},dnaReady?(activeBrief.projectName || 'Project DNA ready'):'Simple workspace')
                ),
                h(Chip,{label:dnaReady?'DNA '+briefScore+'%':'U52',size:'small',sx:{height:24,borderRadius:'999px',bgcolor:dnaReady?'rgba(16,185,129,.16)':'rgba(96,165,250,.16)',color:dnaReady?'#bbf7d0':'#dbeafe'}})
              ),
              h(Box,{className:'namaa-mui-command-progress',sx:{mt:1.25}},h('span',{style:{width:(Math.max(dnaReady?35:25,briefScore || ((currentIndex+1)*25)))+'%'}})),
              h(Stack,{direction:'row',spacing:.75,sx:{mt:1.25}},
                h(Button,{variant:'contained',size:'small',onClick:function(){flowAction('build-project-flow');},sx:{flex:1,bgcolor:'#2563eb','&:hover':{bgcolor:'#1d4ed8'}}},'Build'),
                h(Button,{variant:'outlined',size:'small',onClick:function(){flowAction('free-talk-mode');},sx:{flex:1,color:'#dbeafe',borderColor:'rgba(219,234,254,.25)','&:hover':{borderColor:'rgba(219,234,254,.45)',bgcolor:'rgba(255,255,255,.06)'}}},'Free Talk')
              )
            ),
            h(Divider,{sx:{borderColor:'rgba(255,255,255,.08)',my:.25}}),
            h(Typography,{variant:'caption',sx:{px:.5,color:'#9fb1cc',fontWeight:950,letterSpacing:'.08em',textTransform:'uppercase'}},'Agent Hub'),
            agents.map(function(agent,index){
              var active=state.agent===agent.key;
              var status=dnaReady && agent.key!=='talk' ? 'DNA ready' : agentStatus(agent.key,state.agent,state.stage);
              var working=status==='Working';
              var available=agent.key==='talk' || dnaReady || status==='Ready' || active || currentIndex>=index;
              return h(Grow,{key:agent.key,in:true,timeout:240+(index*70)},
                h(Paper,{elevation:0,className:'namaa-mui-agent-card namaa-mui-agent-card-v36 '+(active?'is-active':'')+' '+(available?'is-available':'is-locked')},
                  h(ButtonBase,{onClick:function(){activateAgent(agent.key);},sx:{width:'100%',borderRadius:'20px',textAlign:'left',display:'block'}},
                    h(Stack,{direction:'row',alignItems:'center',spacing:1.1},
                      h(Box,{className:'namaa-mui-agent-index'},'0'+(index+1)),
                      h(Badge,{variant:'dot',color:active?'success':'primary',invisible:!active},h('span',{className:'namaa-mui-agent-icon'},agent.emoji)),
                      h(Box,{sx:{minWidth:0,flex:1}},
                        h(Typography,{variant:'body2',sx:{fontWeight:950,color:'#fff',lineHeight:1.05}},agent.name),
                        h(Typography,{variant:'caption',sx:{display:'block',mt:.35,color:'#a9b8cc',fontWeight:800,lineHeight:1.2}},agent.text),
                        h(Typography,{variant:'caption',className:'namaa-mui-agent-route'},agent.route)
                      ),
                      h(Chip,{label:status,size:'small',color:statusTone(status,active),sx:{height:24,borderRadius:'999px',fontSize:10,bgcolor:active?'rgba(16,185,129,.16)':'rgba(255,255,255,.08)',color:active?'#bbf7d0':'#b8c5d8'}})
                    ),
                    h(Typography,{variant:'caption',className:'namaa-mui-agent-goal'},dnaReady && agent.key!=='talk' ? ('Uses DNA: '+(activeBrief.projectName || 'active project')) : agent.goal),
                    working?h(LinearProgress,{sx:{mt:1.15,borderRadius:99,height:4,bgcolor:'rgba(255,255,255,.08)'}}):null
                  )
                )
              );
            }),
            h(Paper,{className:'namaa-mui-next-action',elevation:0},
              h('span',null,currentIndex<1?'🧭':currentIndex<2?'📊':currentIndex<3?'🎨':'💻'),
              h(Box,{sx:{minWidth:0,flex:1}},
                h(Typography,{variant:'caption',sx:{display:'block',fontWeight:950,color:'#fff'}},currentIndex<1?'Next: complete the brief':currentIndex<2?'Next: Strategy PDF':currentIndex<3?'Next: logo + mockups':'Next: website preview'),
                h(Typography,{variant:'caption',sx:{display:'block',color:'#a9b8cc',fontWeight:800}},'Clean MUI template flow. No clutter before the user needs it.')
              )
            )
          )
        );
      }
      function FactoryStatus(){
        var state=useNamaaState();
        var working=/generating|strategy-generating|pdf-ready/.test(state.stage);
        var label=state.stage.indexOf('images')>-1?'Design Agent is preparing visual assets':state.stage.indexOf('dev')>-1?'Web Agent is building the preview':state.stage.indexOf('strategy-generating')>-1?'Strategy Agent is preparing the PDF':state.stage.indexOf('pdf')>-1?'Strategy Agent prepared a branded document':'Namaa workspace';
        return h(ThemeProvider,{theme:theme},
          h(Fade,{in:true,timeout:360},
            h(Paper,{className:'namaa-mui-status-rail',elevation:0},
              h(Stack,{direction:'row',alignItems:'center',spacing:1.1},
                h('span',{className:'namaa-mui-status-orb'},working?'⚙️':'✨'),
                h(Box,{sx:{minWidth:0,flex:1}},
                  h(Typography,{variant:'caption',sx:{display:'block',fontWeight:950,color:'#18345f',lineHeight:1.05}},label),
                  h(Typography,{variant:'caption',sx:{display:'block',fontWeight:800,color:'#6b7890'}},'Free Talk · Build Project · Strategy · Design · Web')
                )
              ),
              working?h(LinearProgress,{sx:{mt:1,borderRadius:99,height:5,bgcolor:'rgba(37,99,235,.10)'}}):null
            )
          )
        );
      }

      var rootSlots=[];
      // Update 48: keep the Home screen clean. No factory stepper or extra topbar widgets on the chat home.
      // The premium MUI layer now enhances only the Namaa Agents sidebar.
      var hubSlot=ensureSlot('namaaMuiAgentHub','namaa-mui-sidebar-slot',sidebar,'append');
      if(hubSlot)rootSlots.push([hubSlot,AgentHub]);

      rootSlots.forEach(function(item){
        var el=item[0];
        var Component=item[1];
        try{ReactDOM.createRoot(el).render(h(Component));}
        catch(error){if(el===dock)injectFallback();}
      });
      document.documentElement.classList.add('namaa-mui-loaded','namaa-mui-base-ready');
    }).catch(function(){injectFallback();});
  },1);
})(window,document);
