import{r as e,X as a,$ as s,U as r,a1 as t,a6 as n,ac as l,ad as c,q as i,m,j as o,H as d,ae as u,a4 as f}from"./index-vXRN0nb0.js";import{I as p}from"./infinite-scroll-DKrkS5nY.js";import{a as h}from"./attach-properties-to-component-CClyKAqJ.js";import{a as v}from"./common-DYHPXX_Z.js";import{B as x}from"./index-C8zUc8uH.js";import"./dot-loading-BBOaOjEl.js";const j="adm-list",N={mode:"default"},g=e.forwardRef(((n,l)=>{const c=a(N,n),i=e.useRef(null);return e.useImperativeHandle(l,(()=>({get nativeElement(){return i.current}}))),s(c,r.createElement("div",{className:t(j,`${j}-${c.mode}`),ref:i},c.header&&r.createElement("div",{className:`${j}-header`},c.header),r.createElement("div",{className:`${j}-body`},r.createElement("div",{className:`${j}-body-inner`},c.children))))}));function y(e){return null!=e&&!1!==e}const E="adm-list-item",$=h(g,{Item:e=>{var a,i;const{arrow:m,arrowIcon:o}=e,{list:d={}}=n(),u=null!==(a=e.clickable)&&void 0!==a?a:!!e.onClick,f=null!==(i=null!=m?m:o)&&void 0!==i?i:u,p=l(d.arrowIcon,!0!==m?m:null,!0!==o?o:null),h=r.createElement("div",{className:`${E}-content`},y(e.prefix)&&r.createElement("div",{className:`${E}-content-prefix`},e.prefix),r.createElement("div",{className:`${E}-content-main`},y(e.title)&&r.createElement("div",{className:`${E}-title`},e.title),e.children,y(e.description)&&r.createElement("div",{className:`${E}-description`},e.description)),y(e.extra)&&r.createElement("div",{className:`${E}-content-extra`},e.extra),f&&r.createElement("div",{className:`${E}-content-arrow`},p||r.createElement(c,null)));return s(e,r.createElement(u?"a":"div",{className:t(`${E}`,u?["adm-plain-anchor"]:[],e.disabled&&`${E}-disabled`),onClick:e.disabled?void 0:e.onClick},h))}});function _(){const a=i((e=>e.user.info)),[s,r]=e.useState([]),[t,n]=e.useState(!0),[l,c]=e.useState(1),[h,j]=e.useState(0),N=m(),[g,y]=e.useState(!1);return e.useEffect((()=>{const e=N.search;if(e){const a=e.replace("?total=","");a&&j(a),e.includes("myself")?y(!0):y(!1)}}),[]),o.jsxs("div",{className:"frens-detail-page",children:[o.jsx("div",{className:"frens-title",children:g?o.jsx("span",{children:"My Scores"}):o.jsxs("span",{children:[h," frens"]})}),o.jsx($,{children:s.map(((e,s)=>{return o.jsx($.Item,{children:o.jsxs("div",{className:"frens-list",children:[o.jsxs("div",{className:"frens-detail-left",children:[o.jsxs("div",{className:"score",children:["+ ",e.score.toLocaleString(),o.jsx("img",{src:"/assets/common/cat.webp"})]}),e.ticket?o.jsxs("div",{className:"score",children:["+ ",e.ticket,o.jsx("img",{src:"/assets/common/ticket.webp"})]}):null,o.jsx("div",{className:"frens-detail-time",children:d(e.createdAt).format("YYYY-MM-DD HH:mm")})]}),o.jsxs("div",{className:"frens-detail-right",children:[o.jsxs("div",{className:"by-user",children:["by",o.jsx("div",{className:"user-icon",style:{background:v(e.from_username)},children:e.from_username.slice(0,2)}),o.jsx("div",{className:"frens-detail-name",children:e.from_username==a.username?o.jsx("span",{style:{color:"var(--highColor)"},children:"me"}):e.from_username})]}),o.jsx("div",{className:"type",children:(r=e.type,"register"==r&&(r="Register"),"checkIn_parent"==r&&(r="Checking In"),"play_game_reward_parent"==r&&(r="Drop Game"),"play_game_reward_parent"!=r&&"play_game_reward"!=r||(r="Drop Game"),"harvest_farming"==r&&(r="Farming"),"share_playGame"==r&&(r="Share Game"),r)})]})]})},s);var r}))}),o.jsx(p,{loadMore:async function(){const e=N.search;let a=!1;e&&e.includes("myself")&&(a=!0);const s=await(async e=>{let a;return a=e?await u({page:l}):await f({page:l}),c((e=>e+1)),a.data.rows})(a);1==l?(s.length<20&&n(!1),r(s)):(r((e=>[...e,...s])),n(s.length>0))},hasMore:t}),o.jsx(x,{scrollName:"content"})]})}export{_ as default};
