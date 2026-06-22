(function(window,document){
  'use strict';
  var dock=document.getElementById('namaaMuiDock');
  if(!dock || !('noModule' in HTMLScriptElement.prototype))return;
  var CDN_REACT='https://esm.sh/react@18.2.0';
  var CDN_REACT_DOM='https://esm.sh/react-dom@18.2.0/client';
  var CDN_MUI='https://esm.sh/@mui/material@5.15.20?deps=react@18.2.0,react-dom@18.2.0';

  function setFallback(agent){
    var label=agent==='images'?'Namaa Images':agent==='dev'?'NamaaDev':'Namaa Talk';
    dock.innerHTML='<span>'+label+'</span><span>Business Maroc</span>';
  }
  function getActive(){return document.body.getAttribute('data-namaa-agent') || 'talk';}

  window.setTimeout(function(){
    Promise.all([import(CDN_REACT),import(CDN_REACT_DOM),import(CDN_MUI)]).then(function(mods){
      var React=mods[0];
      var ReactDOM=mods[1];
      var MUI=mods[2];
      var createElement=React.createElement;
      var createTheme=MUI.createTheme;
      var ThemeProvider=MUI.ThemeProvider;
      var Stack=MUI.Stack;
      var Chip=MUI.Chip;
      var theme=createTheme({
        palette:{primary:{main:'#2563eb'},success:{main:'#12bfa5'},text:{primary:'#07152f'}},
        typography:{fontFamily:'Urbanist, system-ui, -apple-system, Segoe UI, sans-serif'},
        shape:{borderRadius:16},
        components:{MuiChip:{styleOverrides:{root:{fontWeight:900,letterSpacing:'-.01em'}}}}
      });
      function App(){
        var state=React.useState(getActive());
        var active=state[0];
        var setActive=state[1];
        React.useEffect(function(){
          function sync(event){
            var btn=event.target && event.target.closest ? event.target.closest('[data-agent]') : null;
            if(btn)window.setTimeout(function(){setActive(getActive());},30);
          }
          document.addEventListener('click',sync);
          var observer=new MutationObserver(function(){setActive(getActive());});
          observer.observe(document.body,{attributes:true,attributeFilter:['data-namaa-agent']});
          return function(){document.removeEventListener('click',sync);observer.disconnect();};
        },[]);
        function activate(agent){
          var target=document.querySelector('.namaa-agent-link[data-agent="'+agent+'"]') || document.querySelector('.namaa-plus-menu [data-agent="'+agent+'"]');
          if(target)target.click();
          setActive(agent);
        }
        function chip(label,agent,icon){
          return createElement(Chip,{
            key:agent,
            label:label,
            icon:createElement('span',{style:{fontSize:14,lineHeight:1}},icon),
            onClick:function(){activate(agent);},
            color:active===agent?'primary':'default',
            variant:active===agent?'filled':'outlined',
            size:'small',
            sx:{
              height:34,
              borderRadius:'999px',
              px:.4,
              bgcolor:active===agent?'#2563eb':'rgba(255,255,255,.76)',
              borderColor:'#dbeafe',
              color:active===agent?'#fff':'#15376d',
              boxShadow:active===agent?'0 12px 24px rgba(37,99,235,.22)':'0 8px 20px rgba(37,99,235,.06)',
              '& .MuiChip-icon':{ml:'7px',color:'inherit'},
              '&:hover':{bgcolor:active===agent?'#1d4ed8':'#fff',transform:'translateY(-1px)'}
            }
          });
        }
        return createElement(ThemeProvider,{theme:theme},
          createElement(Stack,{direction:'row',spacing:1,alignItems:'center',sx:{display:{xs:'none',lg:'flex'}}},[
            chip('Talk','talk','🧠'),
            chip('Images','images','🎨'),
            chip('Dev','dev','💻')
          ])
        );
      }
      dock.innerHTML='';
      ReactDOM.createRoot(dock).render(createElement(App));
      document.documentElement.classList.add('namaa-mui-loaded');
    }).catch(function(){setFallback(getActive());});
  },1);
})(window,document);
