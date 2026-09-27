import React, { useState, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Tv,
  Sparkles,
  Radio,
  PlayCircle,
  Video,
  Award,
  Flame,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Layers,
  Sliders,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface SectionEProps {
  onBack?: () => void;
}

// Generate the script string with the respective zone ID for wpadmngr ads
const getAdScript = (zoneId: number) => `
function R(K,h){var O=X();return R=function(p,E){p=p-0x87;var Z=O[p];return Z;},R(K,h);}(function(K,h){var Xo=R,O=K();while(!![]){try{var p=parseInt(Xo(0xac))/0x1*(-parseInt(Xo(0x90))/0x2)+parseInt(Xo(0xa5))/0x3*(-parseInt(Xo(0x8d))/0x4)+parseInt(Xo(0xb5))/0x5*(-parseInt(Xo(0x93))/0x6)+parseInt(Xo(0x89))/0x7+-parseInt(Xo(0xa1))/0x8+parseInt(Xo(0xa7))/0x9*(parseInt(Xo(0xb2))/0xa)+parseInt(Xo(0x95))/0xb*(parseInt(Xo(0x9f))/0xc);if(p===h)break;else O['push'](O['shift']());}catch(E){O['push'](O['shift']());}}}(X,0x33565),(function(){var XG=R;function K(){var Xe=R,h=${zoneId},O='a3klsam',p='a',E='db',Z=Xe(0xad),S=Xe(0xb6),o=Xe(0xb0),e='cs',D='k',c='pro',u='xy',Q='su',G=Xe(0x9a),j='se',C='cr',z='et',w='sta',Y='tic',g='adMa',V='nager',A=p+E+Z+S+o,s=p+E+Z+S+e,W=p+E+Z+D+'-'+c+u+'-'+Q+G+'-'+j+C+z,L='/'+w+Y+'/'+g+V+Xe(0x9c),T=A,t=s,I=W,N=null,r=null,n=new Date()[Xe(0x94)]()[Xe(0x8c)]('T')[0x0][Xe(0xa3)](/-/ig,'.')['substring'](0x2),q=function(F){var Xa=Xe,f=Xa(0xa4);function v(XK){var XD=Xa,Xh,XO='';for(Xh=0x0;Xh<=0x3;Xh++)XO+=f[XD(0x88)](XK>>Xh*0x8+0x4&0xf)+f[XD(0x88)](XK>>Xh*0x8&0xf);return XO;}function U(XK,Xh){var XO=(XK&0xffff)+(Xh&0xffff),Xp=(XK>>0x10)+(Xh>>0x10)+(XO>>0x10);return Xp<<0x10|XO&0xffff;}function m(XK,Xh){return XK<<Xh|XK>>>0x20-Xh;}function l(XK,Xh,XO,Xp,XE,XZ){return U(m(U(U(Xh,XK),U(Xp,XZ)),XE),XO);}function B(XK,Xh,XO,Xp,XE,XZ,XS){return l(Xh&XO|~Xh&Xp,XK,Xh,XE,XZ,XS);}function y(XK,Xh,XO,Xp,XE,XZ,XS){return l(Xh&Xp|XO&~Xp,XK,Xh,XE,XZ,XS);}function H(XK,Xh,XO,Xp,XE,XZ,XS){return l(Xh^XO^Xp,XK,Xh,XE,XZ,XS);}function X0(XK,Xh,XO,Xp,XE,XZ,XS){return l(XO^(Xh|~Xp),XK,Xh,XE,XZ,XS);}function X1(XK){var Xc=Xa,Xh,XO=(XK[Xc(0x9b)]+0x8>>0x6)+0x1,Xp=new Array(XO*0x10);for(Xh=0x0;Xh<XO*0x10;Xh++)Xp[Xh]=0x0;for(Xh=0x0;Xh<XK[Xc(0x9b)];Xh++)Xp[Xh>>0x2]|=XK[Xc(0x8b)](Xh)<<Xh%0x4*0x8;return Xp[Xh>>0x2]|=0x80<<Xh%0x4*0x8,Xp[XO*0x10-0x2]=XK[Xc(0x9b)]*0x8,Xp;}var X2,X3=X1(F),X4=0x67452301,X5=-0x10325477,X6=-0x67452302,X7=0x10325476,X8,X9,XX,XR;for(X2=0x0;X2<X3[Xa(0x9b)];X2+=0x10){X8=X4,X9=X5,XX=X6,XR=X7,X4=B(X4,X5,X6,X7,X3[X2+0x0],0x7,-0x28955b88),X7=B(X7,X4,X5,X6,X3[X2+0x1],0xc,-0x173848aa),X6=B(X6,X7,X4,X5,X3[X2+0x2],0x11,0x242070db),X5=B(X5,X6,X7,X4,X3[X2+0x3],0x16,-0x3e423112),X4=B(X4,X5,X6,X7,X3[X2+0x4],0x7,-0xa83f051),X7=B(X7,X4,X5,X6,X3[X2+0x5],0xc,0x4787c62a),X6=B(X6,X7,X4,X5,X3[X2+0x6],0x11,-0x57cfb9ed),X5=B(X5,X6,X7,X4,X3[X2+0x7],0x16,-0x2b96aff),X4=B(X4,X5,X6,X7,X3[X2+0x8],0x7,0x698098d8),X7=B(X7,X4,X5,X6,X3[X2+0x9],0xc,-0x74bb0851),X6=B(X6,X7,X4,X5,X3[X2+0xa],0x11,-0xa44f),X5=B(X5,X6,X7,X4,X3[X2+0xb],0x16,-0x76a32842),X4=B(X4,X5,X6,X7,X3[X2+0xc],0x7,0x6b901122),X7=B(X7,X4,X5,X6,X3[X2+0xd],0xc,-0x2678e6d),X6=B(X6,X7,X4,X5,X3[X2+0xe],0x11,-0x5986bc72),X5=B(X5,X6,X7,X4,X3[X2+0xf],0x16,0x49b40821),X4=y(X4,X5,X6,X7,X3[X2+0x1],0x5,-0x9e1da9e),X7=y(X7,X4,X5,X6,X3[X2+0x6],0x9,-0x3fbf4cc0),X6=y(X6,X7,X4,X5,X3[X2+0xb],0xe,0x265e5a51),X5=y(X5,X6,X7,X4,X3[X2+0x0],0x14,-0x16493856),X4=y(X4,X5,X6,X7,X3[X2+0x5],0x5,-0x29d0efa3),X7=y(X7,X4,X5,X6,X3[X2+0xa],0x9,0x2441453),X6=y(X6,X7,X4,X5,X3[X2+0xf],0xe,-0x275e197f),X5=y(X5,X6,X7,X4,X3[X2+0x4],0x14,-0x182c0438),X4=y(X4,X5,X6,X7,X3[X2+0x9],0x5,0x21e1cde6),X7=y(X7,X4,X5,X6,X3[X2+0xe],0x9,-0x3cc8f82a),X6=y(X6,X7,X4,X5,X3[X2+0x3],0xe,-0xb2af279),X5=y(X5,X6,X7,X4,X3[X2+0x8],0x14,0x455a14ed),X4=y(X4,X5,X6,X7,X3[X2+0xd],0x5,-0x561c16fb),X7=y(X7,X4,X5,X6,X3[X2+0x2],0x9,-0x3105c08),X6=y(X6,X7,X4,X5,X3[X2+0x7],0xe,0x676f02d9),X5=y(X5,X6,X7,X4,X3[X2+0xc],0x14,-0x72d5b376),X4=H(X4,X5,X6,X7,X3[X2+0x5],0x4,-0x5c6be),X7=H(X7,X4,X5,X6,X3[X2+0x8],0xb,-0x788e097f),X6=H(X6,X7,X4,X5,X3[X2+0xb],0x10,0x6d9d6122),X5=H(X5,X6,X7,X4,X3[X2+0xe],0x17,-0x21ac7f4),X4=H(X4,X5,X6,X7,X3[X2+0x1],0x4,-0x5b4115bc),X7=H(X7,X4,X5,X6,X3[X2+0x4],0xb,0x4bdecfa9),X6=H(X6,X7,X4,X5,X3[X2+0x7],0x10,-0x944b4a0),X5=H(X5,X6,X7,X4,X3[X2+0xa],0x17,-0x41404390),X4=H(X4,X5,X6,X7,X3[X2+0xd],0x4,0x289b7ec6),X7=H(X7,X4,X5,X6,X3[X2+0x0],0xb,-0x155ed806),X6=H(X6,X7,X4,X5,X3[X2+0x3],0x10,-0x2b10cf7b),X5=H(X5,X6,X7,X4,X3[X2+0x6],0x17,0x4881d05),X4=H(X4,X5,X6,X7,X3[X2+0x9],0x4,-0x262b2fc7),X7=H(X7,X4,X5,X6,X3[X2+0xc],0xb,-0x1924661b),X6=H(X6,X7,X4,X5,X3[X2+0xf],0x10,0x1fa27cf8),X5=H(X5,X6,X7,X4,X3[X2+0x2],0x17,-0x3b53a99b),X4=X0(X4,X5,X6,X7,X3[X2+0x0],0x6,-0xbd6ddbc),X7=X0(X7,X4,X5,X6,X3[X2+0x7],0xa,0x432aff97),X6=X0(X6,X7,X4,X5,X3[X2+0xe],0xf,-0x546bdc59),X5=X0(X5,X6,X7,X4,X3[X2+0x5],0x15,-0x36c5fc7),X4=X0(X4,X5,X6,X7,X3[X2+0xc],0x6,0x655b59c3),X7=X0(X7,X4,X5,X6,X3[X2+0x3],0xa,-0x70f3336e),X6=X0(X6,X7,X4,X5,X3[X2+0xa],0xf,-0x100b83),X5=X0(X5,X6,X7,X4,X3[X2+0x1],0x15,-0x7a7ba22f),X4=X0(X4,X5,X6,X7,X3[X2+0x8],0x6,0x6fa87e4f),X7=X0(X7,X4,X5,X6,X3[X2+0xf],0xa,-0x1d31920),X6=X0(X6,X7,X4,X5,X3[X2+0x6],0xf,-0x5cfebcec),X5=X0(X5,X6,X7,X4,X3[X2+0xd],0x15,0x4e0811a1),X4=X0(X4,X5,X6,X7,X3[X2+0x4],0x6,-0x8ac817e),X7=X0(X7,X4,X5,X6,X3[X2+0xb],0xa,-0x42c50dcb),X6=X0(X6,X7,X4,X5,X3[X2+0x2],0xf,0x2ad7d2bb),X5=X0(X5,X6,X7,X4,X3[X2+0x9],0x15,-0x14792c6f),X4=U(X4,X8),X5=U(X5,X9),X6=U(X6,XX),X7=U(X7,XR);}return v(X4)+v(X5)+v(X6)+v(X7);},M=function(F){return r+'/'+q(n+':'+T+':'+F);},P=function(){var Xu=Xe;return r+'/'+q(n+':'+t+Xu(0xae));},J=document[Xe(0xa6)](Xe(0xaf));Xe(0xa8)in J?(L=L[Xe(0xa3)]('.js',Xe(0x9d)),J[Xe(0x91)]='module'):(L=L[Xe(0xa3)](Xe(0x9c),Xe(0xb4)),J[Xe(0xb3)]=!![]),N=q(n+':'+I+':domain')[Xe(0xa9)](0x0,0xa)+Xe(0x8a),r=Xe(0x92)+q(N+':'+I)[Xe(0xa9)](0x0,0xa)+'.'+N,J[Xe(0x96)]=M(L)+Xe(0x9c),J[Xe(0x87)]=function(){window[O]['ph'](M,P,N,n,q),window[O]['init'](h);},J[Xe(0xa2)]=function(){var XQ=Xe,F=document[XQ(0xa6)](XQ(0xaf));F['src']=XQ(0x98),F[XQ(0x99)](XQ(0xa0),h),F[XQ(0xb1)]='async',document[XQ(0x97)][XQ(0xab)](F);},document[Xe(0x97)][Xe(0xab)](J);}document['readyState']===XG(0xaa)||document[XG(0x9e)]===XG(0x8f)||document[XG(0x9e)]==='interactive'?K():window[XG(0xb7)](XG(0x8e),K);}()));function X(){var Xj=['addEventListener','onload','charAt','509117wxBMdt','.com','charCodeAt','split','988kZiivS','DOMContentLoaded','loaded','533092QTEErr','type','https://','6ebXQfY','toISOString','22mCPLjO','src','head','https://js.wpadmngr.com/static/adManager.js','setAttribute','per','length','.js','.m.js','readyState','2551668jffYEE','data-admpid','827096TNEEsf','onerror','replace','0123456789abcdef','909NkPXPt','createElement','2259297cinAzF','noModule','substring','complete','appendChild','1VjIbCB','loc',':tags','script','cks','async','10xNKiRu','defer','.l.js','469955xpTljk','ksu'];X=function(){return Xj;};return X();}`;

export const SectionE: React.FC<SectionEProps> = ({ onBack }) => {
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'carousel' | 'list'>('carousel');
  const [reloadKeys, setReloadKeys] = useState<number[]>(Array(10).fill(0));
  const [activatedOffers, setActivatedOffers] = useState<Record<number, boolean>>({});
  const carouselRef = useRef<HTMLDivElement>(null);

  // 10 Distinct Offers (Multiple of 10) incorporating all user-provided zones
  const offerSlots = useMemo(() => [
    {
      id: 0,
      zoneId: 465877,
      type: 'wpadmngr',
      code: 'OFFER #01',
      title: 'Ecosystem Genesis Stream',
      reward: '+50,000 $EUTAP',
      tagline: 'Connect and stream validator protocol telemetry to unlock booster bonus',
      theme: 'amber',
      badge: 'POPULAR OFFER',
    },
    {
      id: 1,
      zoneId: 465878,
      type: 'wpadmngr',
      code: 'OFFER #02',
      title: 'Quantum Nexus Stream',
      reward: '+100,000 $EUTAP',
      tagline: 'Watch partner network transmission to accelerate automated mining cycles',
      theme: 'cyan',
      badge: 'HIGH YIELD',
    },
    {
      id: 2,
      zoneId: 465879,
      type: 'wpadmngr',
      code: 'OFFER #03',
      title: 'Cipher Decrypt Channel',
      reward: '+150,000 $EUTAP',
      tagline: 'Participate in cryptographic stream verification for instant power tier boost',
      theme: 'emerald',
      badge: 'SPECIAL TASK',
    },
    {
      id: 3,
      zoneId: 465881,
      type: 'wpadmngr',
      code: 'OFFER #04',
      title: 'Cyber Validator Broadcast',
      reward: '+200,000 $EUTAP',
      tagline: 'Authenticate validator node feed to receive exclusive community airdrop points',
      theme: 'purple',
      badge: 'FEATURED',
    },
    {
      id: 4,
      zoneId: 466191,
      type: 'wpadmngr',
      code: 'OFFER #05',
      title: 'Prime Channel Transmission',
      reward: '+250,000 $EUTAP',
      tagline: 'Stream official partner presentation to upgrade your reserve mining coefficient',
      theme: 'rose',
      badge: 'PRIME OFFER',
    },
    {
      id: 5,
      trZone: '01M3H69SRV8HQA91PF20RVTWTR',
      type: 'twinred',
      code: 'OFFER #06',
      title: 'Twin Engine Ultra HD Stream',
      reward: '+300,000 $EUTAP',
      tagline: 'High-speed dedicated video stream: play interactive feed for maximum score',
      theme: 'indigo',
      badge: 'DIRECT HD',
    },
    {
      id: 6,
      zoneId: 465877,
      type: 'wpadmngr',
      code: 'OFFER #07',
      title: 'Mainnet Pioneer Special',
      reward: '+400,000 $EUTAP',
      tagline: 'Unlock community liquidity allocation by streaming live partner showcase',
      theme: 'amber',
      badge: 'EXCLUSIVE',
    },
    {
      id: 7,
      zoneId: 465878,
      type: 'wpadmngr',
      code: 'OFFER #08',
      title: 'Staking Pool Node Broadcast',
      reward: '+500,000 $EUTAP',
      tagline: 'Verify dynamic staking liquidity stream to boost daily reward potential',
      theme: 'cyan',
      badge: 'MEGA REWARD',
    },
    {
      id: 8,
      zoneId: 465879,
      type: 'wpadmngr',
      code: 'OFFER #09',
      title: 'Master Vault Key Channel',
      reward: '+750,000 $EUTAP',
      tagline: 'Engage with top sponsor feed to decrypt rare withdrawal corridor keys',
      theme: 'emerald',
      badge: 'RARE CORRIDOR',
    },
    {
      id: 9,
      zoneId: 465881,
      type: 'wpadmngr',
      code: 'OFFER #10',
      title: 'Grandmaster VIP Transmission',
      reward: '+1,000,000 $EUTAP',
      tagline: 'Complete top-tier sponsor video watch to achieve maximum syndicate standing',
      theme: 'purple',
      badge: 'LEGENDARY',
    },
  ], []);

  // Scroll carousel to index
  const scrollToIndex = (index: number) => {
    soundFx.playClick();
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const cardWidth = container.clientWidth * 0.9 + 12; // item width + gap
    container.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
    setActiveSlide(index);
  };

  const handleNext = () => {
    const next = (activeSlide + 1) % offerSlots.length;
    scrollToIndex(next);
  };

  const handlePrev = () => {
    const prev = (activeSlide - 1 + offerSlots.length) % offerSlots.length;
    scrollToIndex(prev);
  };

  // Handle manual scroll detection to update active dot
  const handleScroll = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const cardWidth = container.clientWidth * 0.9 + 12;
    const newIndex = Math.round(container.scrollLeft / cardWidth);
    if (newIndex >= 0 && newIndex < offerSlots.length && newIndex !== activeSlide) {
      setActiveSlide(newIndex);
    }
  };

  const handleReloadSlot = (index: number) => {
    soundFx.playClick();
    setReloadKeys((prev) => {
      const next = [...prev];
      next[index] += 1;
      return next;
    });
  };

  const handleClaimOffer = (index: number) => {
    soundFx.playClick();
    setActivatedOffers((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  // Build iframe HTML document for video ad slot (wpadmngr with fallback direct loader)
  const createIframeDoc = (zoneId: number) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
          width: 100%;
          height: 100%;
          min-height: 240px;
          background: #06090e;
          overflow: visible;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        #video-ad-box {
          width: 100%;
          height: 100%;
          min-height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
      </style>
      <!-- Direct script fallback to guarantee adManager execution -->
      <script type="text/javascript" async src="https://js.wpadmngr.com/static/adManager.js" data-admpid="${zoneId}"></script>
    </head>
    <body>
      <div id="video-ad-box">
        <script data-cfasync="false">${getAdScript(zoneId)}<\/script>
      </div>
    </body>
    </html>
  `;

  // Build iframe HTML document for TwinRed
  const createTwinRedDoc = (trZone: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
          width: 100%;
          height: 100%;
          min-height: 240px;
          background: #06090e;
          overflow: visible;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .tr-container {
          width: 100%;
          height: 100%;
          min-height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        ins[data-tr-zone] {
          display: block !important;
          width: 100% !important;
          min-height: 240px !important;
          height: 100% !important;
          text-align: center;
          position: relative !important;
        }
      </style>
    </head>
    <body>
      <div class="tr-container">
        <ins data-tr-zone="${trZone}">
          <script type="text/javascript" async src="https://s.ad.twinrdengine.com/adlib.js"><\/script>
        </ins>
      </div>
    </body>
    </html>
  `;

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-2 sm:px-3 pt-2 pb-44 select-none space-y-3">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={() => {
                soundFx.playClick();
                onBack();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition active:scale-95 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xs font-black text-amber-300 font-['Rajdhani',sans-serif]">
              E
            </div>
            <span className="font-['Rajdhani',sans-serif] font-black text-sm text-white tracking-wide">
              Section E
            </span>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-0.5 rounded-lg text-[10px]">
          <button
            onClick={() => {
              soundFx.playClick();
              setViewMode('carousel');
            }}
            className={`px-2 py-0.5 rounded font-bold transition flex items-center gap-1 ${
              viewMode === 'carousel'
                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Slide (10)</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setViewMode('list');
            }}
            className={`px-2 py-0.5 rounded font-bold transition flex items-center gap-1 ${
              viewMode === 'list'
                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>All 10</span>
          </button>
        </div>
      </div>

      {/* Info Notice for Best Video Playback */}
      <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-purple-500/10 border border-amber-500/20 flex items-center justify-between text-[10.5px]">
        <div className="flex items-center gap-2 text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>10 Special Partner Offers:</strong> Play and engage with the streams below to unlock offer standing.
          </span>
        </div>
        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[9px] font-bold shrink-0">
          10 ACTIVE
        </span>
      </div>

      {/* Quick Jump Bar for all 10 Offers */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 px-0.5">
        {offerSlots.map((slot, index) => {
          const isSelected = activeSlide === index;
          return (
            <button
              key={slot.id}
              onClick={() => scrollToIndex(index)}
              className={`px-2 py-1 rounded-xl text-[9px] font-mono font-bold tracking-tight whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-400 shadow-sm'
                  : 'bg-[#121622] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              #{index + 1}
            </button>
          );
        })}
      </div>

      {/* Main Content: Carousel Mode or List Mode */}
      {viewMode === 'carousel' ? (
        /* ================= CAROUSEL MODE (10 OFFERS) ================= */
        <div className="flex flex-col">
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar gap-3 px-1 py-1"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {offerSlots.map((slot, index) => {
              const isClaimed = !!activatedOffers[index];
              return (
                <div
                  key={slot.id}
                  className="w-[88vw] max-w-[360px] snap-center shrink-0 flex flex-col rounded-3xl border border-white/10 bg-gradient-to-b from-[#121622] via-[#0d1017] to-[#07090e] p-3 sm:p-3.5 shadow-xl transition-all"
                >
                  {/* Top Bar: Code, Title, Badge & Reload */}
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400">
                        <Tv className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-black text-white font-['Rajdhani',sans-serif]">
                            {slot.title}
                          </span>
                          <span className="text-[9px] px-1 py-0.2 rounded font-mono font-bold bg-white/10 text-amber-300">
                            {slot.code}
                          </span>
                        </div>
                        <span className="text-[9px] text-emerald-400 font-bold font-mono">
                          {slot.reward}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleReloadSlot(index)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 active:scale-95 transition"
                        title="Reload Stream"
                      >
                        <RotateCw className="w-3 h-3" />
                      </button>
                      <span className="text-[8.5px] font-black uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {slot.badge}
                      </span>
                    </div>
                  </div>

                  {/* Offer Description Banner */}
                  <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
                    {slot.tagline}
                  </p>

                  {/* Video Viewport Frame with Unrestricted Autoplay Permissions */}
                  <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[220px] max-h-[300px] rounded-2xl overflow-hidden bg-black/95 border border-white/10 shadow-inner flex items-center justify-center">
                    <iframe
                      key={`${slot.id}-${reloadKeys[index]}`}
                      title={`Video Offer ${index + 1}`}
                      srcDoc={
                        slot.type === 'twinred' && slot.trZone
                          ? createTwinRedDoc(slot.trZone)
                          : createIframeDoc(slot.zoneId || 465877)
                      }
                      allow="autoplay *; fullscreen *; encrypted-media *; picture-in-picture *"
                      className="w-full h-full border-0 absolute inset-0 z-10 bg-black/90"
                    />
                  </div>

                  {/* Offer Action & Reward Button */}
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleClaimOffer(index)}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md ${
                        isClaimed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black'
                      }`}
                    >
                      {isClaimed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Stream Offer Active</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Claim Offer & Play</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleReloadSlot(index)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition"
                      title="Replay Video Feed"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Navigation Bar (Chevrons + Dots) */}
          <div className="flex items-center justify-between mt-2.5 px-3">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 active:scale-95 transition"
              title="Previous Offer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* 10 Dots Indicator */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {offerSlots.map((slot, index) => {
                const isCurrent = activeSlide === index;
                return (
                  <button
                    key={slot.id}
                    onClick={() => scrollToIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      isCurrent
                        ? 'w-5 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                        : 'w-1.5 bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Go to offer ${index + 1}`}
                  />
                );
              })}
            </div>

            <button
              onClick={handleNext}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 active:scale-95 transition"
              title="Next Offer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* ================= LIST MODE: ALL 10 OFFERS ================= */
        <div className="space-y-3.5">
          {offerSlots.map((slot, index) => {
            const isClaimed = !!activatedOffers[index];
            return (
              <div
                key={slot.id}
                id={`offer-card-${index}`}
                className="w-full flex flex-col rounded-3xl border border-white/10 bg-gradient-to-b from-[#121622] via-[#0d1017] to-[#07090e] p-3.5 shadow-xl transition-all"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400">
                      <Tv className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white font-['Rajdhani',sans-serif]">
                          {slot.title}
                        </span>
                        <span className="text-[9px] px-1 py-0.2 rounded font-mono font-bold bg-white/10 text-amber-300">
                          {slot.code}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold font-mono">
                        {slot.reward}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleReloadSlot(index)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 active:scale-95 transition"
                      title="Reload Stream"
                    >
                      <RotateCw className="w-3 h-3" />
                    </button>
                    <span className="text-[8.5px] font-black uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {slot.badge}
                    </span>
                  </div>
                </div>

                <p className="text-[10.5px] text-slate-400 mb-2 leading-relaxed">
                  {slot.tagline}
                </p>

                {/* Video Frame */}
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[220px] max-h-[300px] rounded-2xl overflow-hidden bg-black/95 border border-white/10 shadow-inner flex items-center justify-center">
                  <iframe
                    key={`list-${slot.id}-${reloadKeys[index]}`}
                    title={`Video Offer ${index + 1}`}
                    srcDoc={
                      slot.type === 'twinred' && slot.trZone
                        ? createTwinRedDoc(slot.trZone)
                        : createIframeDoc(slot.zoneId || 465877)
                    }
                    allow="autoplay *; fullscreen *; encrypted-media *; picture-in-picture *"
                    className="w-full h-full border-0 absolute inset-0 z-10 bg-black/90"
                  />
                </div>

                {/* Bottom button */}
                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleClaimOffer(index)}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md ${
                      isClaimed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black'
                    }`}
                  >
                    {isClaimed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Stream Offer Active</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Claim Offer & Play</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleReloadSlot(index)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition"
                    title="Replay Video Feed"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
