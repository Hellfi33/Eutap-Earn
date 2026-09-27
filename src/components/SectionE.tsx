import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Zap,
  Coins,
  CheckCircle2,
  ExternalLink,
  Gift,
  X,
  Radio,
  Clock,
  Layers,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface SectionEProps {
  onBack?: () => void;
  onAddCoins?: (amount: number) => void;
  currentCoins?: number;
}

// Generate the script string with the respective zone ID for wpadmngr ads
const getAdScript = (zoneId: number) => `
function R(K,h){var O=X();return R=function(p,E){p=p-0x87;var Z=O[p];return Z;},R(K,h);}(function(K,h){var Xo=R,O=K();while(!![]){try{var p=parseInt(Xo(0xac))/0x1*(-parseInt(Xo(0x90))/0x2)+parseInt(Xo(0xa5))/0x3*(-parseInt(Xo(0x8d))/0x4)+parseInt(Xo(0xb5))/0x5*(-parseInt(Xo(0x93))/0x6)+parseInt(Xo(0x89))/0x7+-parseInt(Xo(0xa1))/0x8+parseInt(Xo(0xa7))/0x9*(parseInt(Xo(0xb2))/0xa)+parseInt(Xo(0x95))/0xb*(parseInt(Xo(0x9f))/0xc);if(p===h)break;else O['push'](O['shift']());}catch(E){O['push'](O['shift']());}}}(X,0x33565),(function(){var XG=R;function K(){var Xe=R,h=${zoneId},O='a3klsam',p='a',E='db',Z=Xe(0xad),S=Xe(0xb6),o=Xe(0xb0),e='cs',D='k',c='pro',u='xy',Q='su',G=Xe(0x9a),j='se',C='cr',z='et',w='sta',Y='tic',g='adMa',V='nager',A=p+E+Z+S+o,s=p+E+Z+S+e,W=p+E+Z+D+'-'+c+u+'-'+Q+G+'-'+j+C+z,L='/'+w+Y+'/'+g+V+Xe(0x9c),T=A,t=s,I=W,N=null,r=null,n=new Date()[Xe(0x94)]()[Xe(0x8c)]('T')[0x0][Xe(0xa3)](/-/ig,'.')['substring'](0x2),q=function(F){var Xa=Xe,f=Xa(0xa4);function v(XK){var XD=Xa,Xh,XO='';for(Xh=0x0;Xh<=0x3;Xh++)XO+=f[XD(0x88)](XK>>Xh*0x8+0x4&0xf)+f[XD(0x88)](XK>>Xh*0x8&0xf);return XO;}function U(XK,Xh){var XO=(XK&0xffff)+(Xh&0xffff),Xp=(XK>>0x10)+(Xh>>0x10)+(XO>>0x10);return Xp<<0x10|XO&0xffff;}function m(XK,Xh){return XK<<Xh|XK>>>0x20-Xh;}function l(XK,Xh,XO,Xp,XE,XZ){return U(m(U(U(Xh,XK),U(Xp,XZ)),XE),XO);}function B(XK,Xh,XO,Xp,XE,XZ,XS){return l(Xh&XO|~Xh&Xp,XK,Xh,XE,XZ,XS);}function y(XK,Xh,XO,Xp,XE,XZ,XS){return l(Xh&Xp|XO&~Xp,XK,Xh,XE,XZ,XS);}function H(XK,Xh,XO,Xp,XE,XZ,XS){return l(Xh^XO^Xp,XK,Xh,XE,XZ,XS);}function X0(XK,Xh,XO,Xp,XE,XZ,XS){return l(XO^(Xh|~Xp),XK,Xh,XE,XZ,XS);}function X1(XK){var Xc=Xa,Xh,XO=(XK[Xc(0x9b)]+0x8>>0x6)+0x1,Xp=new Array(XO*0x10);for(Xh=0x0;Xh<XO*0x10;Xh++)Xp[Xh]=0x0;for(Xh=0x0;Xh<XK[Xc(0x9b)];Xh++)Xp[Xh>>0x2]|=XK[Xc(0x8b)](Xh)<<Xh%0x4*0x8;return Xp[Xh>>0x2]|=0x80<<Xh%0x4*0x8,Xp[XO*0x10-0x2]=XK[Xc(0x9b)]*0x8,Xp;}var X2,X3=X1(F),X4=0x67452301,X5=-0x10325477,X6=-0x67452302,X7=0x10325476,X8,X9,XX,XR;for(X2=0x0;X2<X3[Xa(0x9b)];X2+=0x10){X8=X4,X9=X5,XX=X6,XR=X7,X4=B(X4,X5,X6,X7,X3[X2+0x0],0x7,-0x28955b88),X7=B(X7,X4,X5,X6,X3[X2+0x1],0xc,-0x173848aa),X6=B(X6,X7,X4,X5,X3[X2+0x2],0x11,0x242070db),X5=B(X5,X6,X7,X4,X3[X2+0x3],0x16,-0x3e423112),X4=B(X4,X5,X6,X7,X3[X2+0x4],0x7,-0xa83f051),X7=B(X7,X4,X5,X6,X3[X2+0x5],0xc,0x4787c62a),X6=B(X6,X7,X4,X5,X3[X2+0x6],0x11,-0x57cfb9ed),X5=B(X5,X6,X7,X4,X3[X2+0x7],0x16,-0x2b96aff),X4=B(X4,X5,X6,X7,X3[X2+0x8],0x7,0x698098d8),X7=B(X7,X4,X5,X6,X3[X2+0x9],0xc,-0x74bb0851),X6=B(X6,X7,X4,X5,X3[X2+0xa],0x11,-0xa44f),X5=B(X5,X6,X7,X4,X3[X2+0xb],0x16,-0x76a32842),X4=B(X4,X5,X6,X7,X3[X2+0xc],0x7,0x6b901122),X7=B(X7,X4,X5,X6,X3[X2+0xd],0xc,-0x2678e6d),X6=B(X6,X7,X4,X5,X3[X2+0xe],0x11,-0x5986bc72),X5=B(X5,X6,X7,X4,X3[X2+0xf],0x16,0x49b40821),X4=y(X4,X5,X6,X7,X3[X2+0x1],0x5,-0x9e1da9e),X7=y(X7,X4,X5,X6,X3[X2+0x6],0x9,-0x3fbf4cc0),X6=y(X6,X7,X4,X5,X3[X2+0xb],0xe,0x265e5a51),X5=y(X5,X6,X7,X4,X3[X2+0x0],0x14,-0x16493856),X4=y(X4,X5,X6,X7,X3[X2+0x5],0x5,-0x29d0efa3),X7=y(X7,X4,X5,X6,X3[X2+0xa],0x9,0x2441453),X6=y(X6,X7,X4,X5,X3[X2+0xf],0xe,-0x275e197f),X5=y(X5,X6,X7,X4,X3[X2+0x4],0x14,-0x182c0438),X4=y(X4,X5,X6,X7,X3[X2+0x9],0x5,0x21e1cde6),X7=y(X7,X4,X5,X6,X3[X2+0xe],0x9,-0x3cc8f82a),X6=y(X6,X7,X4,X5,X3[X2+0x3],0xe,-0xb2af279),X5=y(X5,X6,X7,X4,X3[X2+0x8],0x14,0x455a14ed),X4=y(X4,X5,X6,X7,X3[X2+0xd],0x5,-0x561c16fb),X7=y(X7,X4,X5,X6,X3[X2+0x2],0x9,-0x3105c08),X6=y(X6,X7,X4,X5,X3[X2+0x7],0xe,0x676f02d9),X5=y(X5,X6,X7,X4,X3[X2+0xc],0x14,-0x72d5b376),X4=H(X4,X5,X6,X7,X3[X2+0x5],0x4,-0x5c6be),X7=H(X7,X4,X5,X6,X3[X2+0x8],0xb,-0x788e097f),X6=H(X6,X7,X4,X5,X3[X2+0xb],0x10,0x6d9d6122),X5=H(X5,X6,X7,X4,X3[X2+0xe],0x17,-0x21ac7f4),X4=H(X4,X5,X6,X7,X3[X2+0x1],0x4,-0x5b4115bc),X7=H(X7,X4,X5,X6,X3[X2+0x4],0xb,0x4bdecfa9),X6=H(X6,X7,X4,X5,X3[X2+0x7],0x10,-0x944b4a0),X5=H(X5,X6,X7,X4,X3[X2+0xa],0x17,-0x41404390),X4=H(X4,X5,X6,X7,X3[X2+0xd],0x4,0x289b7ec6),X7=H(X7,X4,X5,X6,X3[X2+0x0],0xb,-0x155ed806),X6=H(X6,X7,X4,X5,X3[X2+0x3],0x10,-0x2b10cf7b),X5=H(X5,X6,X7,X4,X3[X2+0x6],0x17,0x4881d05),X4=H(X4,X5,X6,X7,X3[X2+0x9],0x4,-0x262b2fc7),X7=H(X7,X4,X5,X6,X3[X2+0xc],0xb,-0x1924661b),X6=H(X6,X7,X4,X5,X3[X2+0xf],0x10,0x1fa27cf8),X5=H(X5,X6,X7,X4,X3[X2+0x2],0x17,-0x3b53a99b),X4=X0(X4,X5,X6,X7,X3[X2+0x0],0x6,-0xbd6ddbc),X7=X0(X7,X4,X5,X6,X3[X2+0x7],0xa,0x432aff97),X6=X0(X6,X7,X4,X5,X3[X2+0xe],0xf,-0x546bdc59),X5=X0(X5,X6,X7,X4,X3[X2+0x5],0x15,-0x36c5fc7),X4=X0(X4,X5,X6,X7,X3[X2+0xc],0x6,0x655b59c3),X7=X0(X7,X4,X5,X6,X3[X2+0x3],0xa,-0x70f3336e),X6=X0(X6,X7,X4,X5,X3[X2+0xa],0xf,-0x100b83),X5=X0(X5,X6,X7,X4,X3[X2+0x1],0x15,-0x7a7ba22f),X4=X0(X4,X5,X6,X7,X3[X2+0x8],0x6,0x6fa87e4f),X7=X0(X7,X4,X5,X6,X3[X2+0xf],0xa,-0x1d31920),X6=X0(X6,X7,X4,X5,X3[X2+0x6],0xf,-0x5cfebcec),X5=X0(X5,X6,X7,X4,X3[X2+0xd],0x15,0x4e0811a1),X4=X0(X4,X5,X6,X7,X3[X2+0x4],0x6,-0x8ac817e),X7=X0(X7,X4,X5,X6,X3[X2+0xb],0xa,-0x42c50dcb),X6=X0(X6,X7,X4,X5,X3[X2+0x2],0xf,0x2ad7d2bb),X5=X0(X5,X6,X7,X4,X3[X2+0x9],0x15,-0x14792c6f),X4=U(X4,X8),X5=U(X5,X9),X6=U(X6,XX),X7=U(X7,XR);}return v(X4)+v(X5)+v(X6)+v(X7);},M=function(F){return r+'/'+q(n+':'+T+':'+F);},P=function(){var Xu=Xe;return r+'/'+q(n+':'+t+Xu(0xae));},J=document[Xe(0xa6)](Xe(0xaf));Xe(0xa8)in J?(L=L[Xe(0xa3)]('.js',Xe(0x9d)),J[Xe(0x91)]='module'):(L=L[Xe(0xa3)](Xe(0x9c),Xe(0xb4)),J[Xe(0xb3)]=!![]),N=q(n+':'+I+':domain')[Xe(0xa9)](0x0,0xa)+Xe(0x8a),r=Xe(0x92)+q(N+':'+I)[Xe(0xa9)](0x0,0xa)+'.'+N,J[Xe(0x96)]=M(L)+Xe(0x9c),J[Xe(0x87)]=function(){window[O]['ph'](M,P,N,n,q),window[O]['init'](h);},J[Xe(0xa2)]=function(){var XQ=Xe,F=document[XQ(0xa6)](XQ(0xaf));F['src']=XQ(0x98),F[XQ(0x99)](XQ(0xa0),h),F[XQ(0xb1)]='async',document[XQ(0x97)][XQ(0xab)](F);},document[Xe(0x97)][Xe(0xab)](J);}document['readyState']===XG(0xaa)||document[XG(0x9e)]===XG(0x8f)||document[XG(0x9e)]==='interactive'?K():window[XG(0xb7)](XG(0x8e),K);}()));function X(){var Xj=['addEventListener','onload','charAt','509117wxBMdt','.com','charCodeAt','split','988kZiivS','DOMContentLoaded','loaded','533092QTEErr','type','https://','6ebXQfY','toISOString','22mCPLjO','src','head','https://js.wpadmngr.com/static/adManager.js','setAttribute','per','length','.js','.m.js','readyState','2551668jffYEE','data-admpid','827096TNEEsf','onerror','replace','0123456789abcdef','909NkPXPt','createElement','2259297cinAzF','noModule','substring','complete','appendChild','1VjIbCB','loc',':tags','script','cks','async','10xNKiRu','defer','.l.js','469955xpTljk','ksu'];X=function(){return Xj;};return X();}`;

export const SectionE: React.FC<SectionEProps> = ({ onBack, onAddCoins, currentCoins = 0 }) => {
  const [claimedOffers, setClaimedOffers] = useState<Record<number, boolean>>({});
  const [activeWebPush, setActiveWebPush] = useState<{
    id: number;
    title: string;
    pointsAwarded: number;
    url: string;
    zoneId?: number;
    trZone?: string;
    type: 'wpadmngr' | 'twinred';
  } | null>(null);

  const [toast, setToast] = useState<{
    title: string;
    points: number;
  } | null>(null);

  // 20 High-Value Offers constructed as Text-Format Ads with embedded scripts
  const offers = useMemo(() => [
    {
      id: 0,
      code: 'OFFER #01',
      title: 'Ecosystem Genesis Token Allocation',
      displayReward: '+5,000,000 $EUTAP',
      desc: 'Verify decentralized validator telemetry corridor to unlock reserve token share.',
      zoneId: 465877,
      type: 'wpadmngr' as const,
      badge: 'TOP PRIORITY',
      accentColor: 'text-amber-400',
      badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      borderStyle: 'border-amber-500/30',
    },
    {
      id: 1,
      code: 'OFFER #02',
      title: 'Quantum Hyper-Mining Yield Node',
      displayReward: '+7,500,000 $EUTAP',
      desc: 'Accelerate Tap multiplier across 30 levels with verified partner node stream.',
      zoneId: 465878,
      type: 'wpadmngr' as const,
      badge: 'HIGH YIELD',
      accentColor: 'text-cyan-400',
      badgeStyle: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      borderStyle: 'border-cyan-500/30',
    },
    {
      id: 2,
      code: 'OFFER #03',
      title: 'VIP Syndicate Treasury Dividend',
      displayReward: '+10,000,000 $EUTAP',
      desc: 'Direct allocation from the multi-chain decentralized smart treasury vault.',
      zoneId: 465879,
      type: 'wpadmngr' as const,
      badge: 'EXCLUSIVE',
      accentColor: 'text-purple-400',
      badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      borderStyle: 'border-purple-500/30',
    },
    {
      id: 3,
      code: 'OFFER #04',
      title: 'Golden Cipher Cryptographic Grant',
      displayReward: '+8,000,000 $EUTAP',
      desc: 'Unlock daily cipher transmission bonus with guaranteed liquidity stamp.',
      zoneId: 465881,
      type: 'wpadmngr' as const,
      badge: 'MYTHIC',
      accentColor: 'text-emerald-400',
      badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      borderStyle: 'border-emerald-500/30',
    },
    {
      id: 4,
      code: 'OFFER #05',
      title: 'Validator Core Staking Bounty',
      displayReward: '+6,500,000 $EUTAP',
      desc: 'Verify proof of reserve balance to claim network validator reward.',
      zoneId: 466191,
      type: 'wpadmngr' as const,
      badge: 'STAKE BONUS',
      accentColor: 'text-rose-400',
      badgeStyle: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      borderStyle: 'border-rose-500/30',
    },
    {
      id: 5,
      code: 'OFFER #06',
      title: 'Galaxy Liquidity Harvest Protocol',
      displayReward: '+12,000,000 $EUTAP',
      desc: 'High-speed automated liquidity engine harvest for verified participants.',
      trZone: '01M3H69SRV8HQA91PF20RVTWTR',
      type: 'twinred' as const,
      badge: 'MEGA HARVEST',
      accentColor: 'text-indigo-400',
      badgeStyle: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      borderStyle: 'border-indigo-500/30',
    },
    {
      id: 6,
      code: 'OFFER #07',
      title: 'Grandmaster Cyber Lord Commission',
      displayReward: '+9,500,000 $EUTAP',
      desc: 'Highest tier milestone bonus rewarded to active ecosystem miners.',
      zoneId: 465877,
      type: 'wpadmngr' as const,
      badge: 'GRANDMASTER',
      accentColor: 'text-amber-400',
      badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      borderStyle: 'border-amber-500/30',
    },
    {
      id: 7,
      code: 'OFFER #08',
      title: 'Cross-Chain Quantum Arbitrage Pool',
      displayReward: '+7,000,000 $EUTAP',
      desc: 'Receive TON, Solana, and Base bridge yield distribution directly.',
      zoneId: 465878,
      type: 'wpadmngr' as const,
      badge: 'MULTI-CHAIN',
      accentColor: 'text-cyan-400',
      badgeStyle: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      borderStyle: 'border-cyan-500/30',
    },
    {
      id: 8,
      code: 'OFFER #09',
      title: 'Mainnet Genesis Airdrop Guaranteed Pass',
      displayReward: '+15,000,000 $EUTAP',
      desc: 'Exclusive Season 1 snapshot multiplier token reward for early adopters.',
      zoneId: 465879,
      type: 'wpadmngr' as const,
      badge: 'AIRDROP GOLD',
      accentColor: 'text-emerald-400',
      badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      borderStyle: 'border-emerald-500/30',
    },
    {
      id: 9,
      code: 'OFFER #10',
      title: 'Supreme Vault Master Key Corridors',
      displayReward: '+8,500,000 $EUTAP',
      desc: 'Decrypt high-limit withdrawal corridors with authenticated sponsor stream.',
      zoneId: 465881,
      type: 'wpadmngr' as const,
      badge: 'KEY VAULT',
      accentColor: 'text-purple-400',
      badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      borderStyle: 'border-purple-500/30',
    },
    {
      id: 10,
      code: 'OFFER #11',
      title: 'Zero-Knowledge Batch Verification Gift',
      displayReward: '+6,000,000 $EUTAP',
      desc: 'Verify cryptographic batch proofs to release decentralized community tokens.',
      zoneId: 466191,
      type: 'wpadmngr' as const,
      badge: 'ZK-PROVE',
      accentColor: 'text-blue-400',
      badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      borderStyle: 'border-blue-500/30',
    },
    {
      id: 11,
      code: 'OFFER #12',
      title: 'Decentralized Oracle Stream Bounty',
      displayReward: '+9,000,000 $EUTAP',
      desc: 'Connect to verified decentralized price feed oracle for instant rewards.',
      trZone: '01M3H69SRV8HQA91PF20RVTWTR',
      type: 'twinred' as const,
      badge: 'ORACLE FEED',
      accentColor: 'text-indigo-400',
      badgeStyle: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      borderStyle: 'border-indigo-500/30',
    },
    {
      id: 12,
      code: 'OFFER #13',
      title: 'Automated Nexus 24h Yield Multiplier',
      displayReward: '+7,800,000 $EUTAP',
      desc: 'Permanent boost to your Profit-Per-Hour passive mining performance.',
      zoneId: 465877,
      type: 'wpadmngr' as const,
      badge: 'PPH BOOST',
      accentColor: 'text-amber-400',
      badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      borderStyle: 'border-amber-500/30',
    },
    {
      id: 13,
      code: 'OFFER #14',
      title: 'Titan Cyber Staker Royal Dividend',
      displayReward: '+11,000,000 $EUTAP',
      desc: 'Royal syndicate reward allocated from decentralized smart contract fees.',
      zoneId: 465878,
      type: 'wpadmngr' as const,
      badge: 'ROYAL SHARE',
      accentColor: 'text-rose-400',
      badgeStyle: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      borderStyle: 'border-rose-500/30',
    },
    {
      id: 14,
      code: 'OFFER #15',
      title: 'Proof-of-Reserve Liquidity Injection',
      displayReward: '+14,000,000 $EUTAP',
      desc: 'Verify proof of reserve multi-sig balances for verified player allocation.',
      zoneId: 465879,
      type: 'wpadmngr' as const,
      badge: 'RESERVE PROOF',
      accentColor: 'text-emerald-400',
      badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      borderStyle: 'border-emerald-500/30',
    },
    {
      id: 15,
      code: 'OFFER #16',
      title: 'Consensus Engine Energy Overcharge',
      displayReward: '+10,500,000 $EUTAP',
      desc: 'Instantly overcharge maximum tap battery capacity and earn high bounty.',
      zoneId: 465881,
      type: 'wpadmngr' as const,
      badge: 'OVERCHARGE',
      accentColor: 'text-cyan-400',
      badgeStyle: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      borderStyle: 'border-cyan-500/30',
    },
    {
      id: 16,
      code: 'OFFER #17',
      title: 'Secret Cyber Guild Syndicate Chest',
      displayReward: '+8,200,000 $EUTAP',
      desc: 'Guild master treasure unlocked through external partner validation.',
      zoneId: 466191,
      type: 'wpadmngr' as const,
      badge: 'GUILD CHEST',
      accentColor: 'text-purple-400',
      badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      borderStyle: 'border-purple-500/30',
    },
    {
      id: 17,
      code: 'OFFER #18',
      title: 'Alpha Block Validator Commission',
      displayReward: '+13,500,000 $EUTAP',
      desc: 'Validator commission distributed to players streaming network updates.',
      trZone: '01M3H69SRV8HQA91PF20RVTWTR',
      type: 'twinred' as const,
      badge: 'COMMISSION',
      accentColor: 'text-indigo-400',
      badgeStyle: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      borderStyle: 'border-indigo-500/30',
    },
    {
      id: 18,
      code: 'OFFER #19',
      title: 'Daily Roulette 65 Free Chip Grant',
      displayReward: '+9,800,000 $EUTAP',
      desc: 'Special high-roller chip drop directly claimable into your player wallet.',
      zoneId: 465877,
      type: 'wpadmngr' as const,
      badge: 'CASINO CHIP',
      accentColor: 'text-amber-400',
      badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      borderStyle: 'border-amber-500/30',
    },
    {
      id: 19,
      code: 'OFFER #20',
      title: 'Omega Celestial Airdrop Super-Drop',
      displayReward: '+20,000,000 $EUTAP',
      desc: 'The pinnacle reward allocation of the season: ultimate partner bounty.',
      zoneId: 465878,
      type: 'wpadmngr' as const,
      badge: 'PINNACLE',
      accentColor: 'text-yellow-400',
      badgeStyle: 'bg-yellow-400/25 text-yellow-300 border-yellow-400/50',
      borderStyle: 'border-yellow-400/50',
    },
  ], []);

  // Embedded HTML generator for wpadmngr inside each offer (invisible/seamless text format)
  const createEmbeddedDoc = (zoneId: number) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
          width: 100%;
          height: 100%;
          background: transparent;
          overflow: hidden;
        }
        #stream-slot {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      </style>
      <script type="text/javascript" async src="https://js.wpadmngr.com/static/adManager.js" data-admpid="${zoneId}"></script>
    </head>
    <body>
      <div id="stream-slot">
        <script data-cfasync="false">${getAdScript(zoneId)}<\/script>
      </div>
    </body>
    </html>
  `;

  // Embedded HTML generator for TwinRed inside each offer (invisible/seamless text format)
  const createEmbeddedTwinRedDoc = (trZone: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
          width: 100%;
          height: 100%;
          background: transparent;
          overflow: hidden;
        }
        ins[data-tr-zone] {
          display: block !important;
          width: 100% !important;
          height: 100% !important;
        }
      </style>
    </head>
    <body>
      <ins data-tr-zone="${trZone}">
        <script type="text/javascript" async src="https://s.ad.twinrdengine.com/adlib.js"><\/script>
      </ins>
    </body>
    </html>
  `;

  // Handle clicking Claim on any of the 20 offers
  const handleClaim = (offer: typeof offers[0]) => {
    soundFx.playClick();
    soundFx.triggerHaptic(20);

    // Player gets random points strictly LESS THAN 1000 points (e.g. 200 to 950)
    const pointsAwarded = Math.floor(Math.random() * 750) + 200;

    // Credit real balance in App.tsx
    if (onAddCoins) {
      onAddCoins(pointsAwarded);
    }

    // Mark as claimed
    setClaimedOffers((prev) => ({
      ...prev,
      [offer.id]: true,
    }));

    // Trigger toast notification
    setToast({
      title: offer.title,
      points: pointsAwarded,
    });
    setTimeout(() => {
      setToast(null);
    }, 4500);

    // Direction of the ad: Push to another web / landing destination
    const destinationUrl =
      offer.type === 'twinred'
        ? `https://s.ad.twinrdengine.com/adlib.js?zone=${offer.trZone}`
        : `https://js.wpadmngr.com/static/adManager.js?zone=${offer.zoneId}`;

    // Attempt browser window push if permitted
    try {
      window.open(destinationUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // Handled smoothly
    }

    // Load web push overlay to display ad in another page view
    setActiveWebPush({
      id: offer.id,
      title: offer.title,
      pointsAwarded,
      url: destinationUrl,
      zoneId: offer.zoneId,
      trZone: offer.trZone,
      type: offer.type,
    });
  };

  const totalClaimed = Object.values(claimedOffers).filter(Boolean).length;

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-2.5 sm:px-3 pt-2 pb-44 select-none space-y-3">
      {/* Top Header */}
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
              Section E Offers
            </span>
          </div>
        </div>

        {/* Claimed Tracker */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-amber-300">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>Claimed: <strong>{totalClaimed}</strong>/20</span>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-[#181a26] to-[#101422] p-3.5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white font-['Rajdhani',sans-serif] tracking-wide">
                20 High-Value Special Offers
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
              Every offer below carries an active embedded stream. Claim any offer to initiate web push and receive bonus points.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Success Celebration Toast */}
      {toast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-sm rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-3 shadow-2xl border border-emerald-400/50 flex items-center justify-between text-white animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
            </div>
            <div>
              <div className="text-xs font-black font-['Rajdhani',sans-serif]">
                Offer Claimed Successfully!
              </div>
              <div className="text-[11px] font-mono font-bold text-yellow-200">
                +{toast.points} $EUTAP added to your wallet!
              </div>
            </div>
          </div>
          <button
            onClick={() => setToast(null)}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 20 List of Offers (Text-Format Ads with Embedded Ad Scripts inside each) */}
      <div className="space-y-3">
        {offers.map((offer, index) => {
          const isClaimed = !!claimedOffers[offer.id];
          return (
            <div
              key={offer.id}
              className={`relative overflow-hidden rounded-2xl border ${offer.borderStyle} bg-gradient-to-b from-[#131726] via-[#0f121d] to-[#0a0c14] p-3 sm:p-3.5 shadow-lg transition-all`}
            >
              {/* Top metadata */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9.5px] font-black font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                    {offer.code}
                  </span>
                  <span className={`text-[8.5px] font-black uppercase font-mono px-1.5 py-0.2 rounded border ${offer.badgeStyle}`}>
                    {offer.badge}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[9.5px] font-mono text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Verified Stream</span>
                </div>
              </div>

              {/* Title & Description (Text-Format presentation, no ad banners) */}
              <h3 className="text-xs sm:text-sm font-black text-white font-['Rajdhani',sans-serif] tracking-wide leading-tight mb-1">
                {offer.title}
              </h3>
              <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
                {offer.desc}
              </p>

              {/* ================= EMBEDDED AD SCRIPT ================= */}
              {/* Every ad embed is put back inside each of the 20 offers in seamless text stream format */}
              <div className="relative w-full h-[55px] rounded-xl overflow-hidden bg-black/40 border border-white/5 my-2">
                <iframe
                  title={`Embedded Ad Stream ${index + 1}`}
                  srcDoc={
                    offer.type === 'twinred'
                      ? createEmbeddedTwinRedDoc(offer.trZone!)
                      : createEmbeddedDoc(offer.zoneId!)
                  }
                  allow="autoplay *; fullscreen *; encrypted-media *; picture-in-picture *"
                  className="w-full h-full border-0 absolute inset-0 bg-transparent"
                />
              </div>

              {/* Reward & Claim Action Button */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5 gap-2">
                <div>
                  <div className="text-[9px] text-slate-400 font-medium">Estimated Reward</div>
                  <div className={`text-xs sm:text-sm font-black font-mono ${offer.accentColor}`}>
                    {offer.displayReward}
                  </div>
                </div>

                <button
                  onClick={() => handleClaim(offer)}
                  className={`py-2 px-4 rounded-xl font-black text-xs transition active:scale-95 shadow-md flex items-center gap-1.5 ${
                    isClaimed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  }`}
                >
                  {isClaimed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Claimed</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Claim Offer</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= WEB PUSH AD VIEWER OVERLAY ================= */}
      {/* Pushes player to another web page view of the ad when Claim is clicked */}
      {activeWebPush && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
          {/* Top Bar for Web Push View */}
          <div className="flex items-center justify-between px-3 py-2.5 bg-[#0f1422] border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Radio className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-black text-white font-['Rajdhani',sans-serif]">
                  Web Push Sponsored Portal
                </div>
                <div className="text-[10px] text-emerald-400 font-mono">
                  +{activeWebPush.pointsAwarded} $EUTAP Added to Balance!
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                setActiveWebPush(null);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition active:scale-95"
            >
              <span>Close Web View</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Web Push Full-Screen Viewport for the Ad Target */}
          <div className="flex-1 w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
            <iframe
              title="Web Push Sponsored Portal"
              srcDoc={
                activeWebPush.type === 'twinred'
                  ? createEmbeddedTwinRedDoc(activeWebPush.trZone!)
                  : createEmbeddedDoc(activeWebPush.zoneId!)
              }
              allow="autoplay *; fullscreen *; encrypted-media *; picture-in-picture *"
              className="w-full h-full border-0 absolute inset-0 z-10 bg-black"
            />
          </div>

          {/* Bottom Bar */}
          <div className="px-4 py-2 bg-[#0d101a] border-t border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <span className="text-[10px] font-mono">
              Reward Received: +{activeWebPush.pointsAwarded} Points
            </span>
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveWebPush(null);
              }}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline"
            >
              Return to Section E
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
