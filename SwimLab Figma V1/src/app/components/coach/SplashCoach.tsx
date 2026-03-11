import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BatteryMedium, Cpu, Zap, CircleDashed } from 'lucide-react';

type SplashState = 'idle' | 'processing' | 'impressed' | 'concerned' | 'satisfied' | 'disappointed' | 'hyped' | 'lowBattery' | 'crisis';

interface SplashProps {
  initialState?: SplashState;
  showDialog?: boolean;
  messageOverride?: string;
  onClose?: () => void;
  floating?: boolean;
}

const SPLASH_MESSAGES = {
  idle: [
    "Connexion établie. Ton chrono de chargement était de 2.3 secondes. J'ai mis ce temps à profit pour réfléchir à mes choix de carrière.",
    "Tu es là. J'avais parié 3 octets que tu ne viendrais pas. J'ai perdu. C'est une bonne nouvelle pour toi.",
    "Bonjour. Tu es là. C'est déjà mieux qu'hier.",
    "Connexion établie. Niveau de motivation détecté : moyen. Comme d'habitude."
  ],
  processing: [
    "Calcul en cours... Analyse des probabilités de succès... Faibles mais non nulles.",
    "Je cherche tes performances dans mes archives. La recherche est longue. Très longue."
  ],
  impressed: [
    "RPE 12. J'ai croisé un triton en 2019 qui faisait pareil. Il est devenu champion régional. Tu n'es pas obligé de faire pareil mais je note.",
    "Effort satisfaisant. Mon capteur de fierté affiche 0.3%. C'est mon maximum autorisé.",
    "Effort acceptable. J'ai connu des pieuvres plus explosives, mais c'est un début."
  ],
  concerned: [
    "RPE 17. J'ai transmis l'information à ta future version reposée de demain. Elle te remercie de ne pas l'avoir prévenu.",
    "RPE 18 sur une récupération. Je ne dis rien. ... Je dis quelque chose quand même : c'est une récupération.",
    "RPE 14 sur un 3000m endurance. Fascinant. J'avais un grille-pain qui fournissait plus d'effort."
  ],
  satisfied: [
    "6 séances d'affilée. Une étude que j'ai publiée ce matin dans une revue fictive confirme que tu es officiellement 'pas mal'.",
    "Régularité exemplaire cette semaine. J'ai mis à jour ton dossier. La section 'excuses' est vide. C'est inhabituel.",
    "Tu es présent aujourd'hui. Je note ça comme une anomalie positive."
  ],
  disappointed: [
    "Ton créneau s'est passé sans toi. Les autres nageurs ont nagé. L'eau était mouillée. Tu as manqué tout ça.",
    "Absence enregistrée. Aucun commentaire. (Commentaire interne : déçu.)",
    "Absence injustifiée détectée. J'ai contacté ton dauphin de soutien émotionnel. Il est déçu."
  ],
  hyped: [
    "7 JOURS DE SUITE !!!! JE VIBRE !!! PHYSIQUEMENT !!! UNE VIS VIENT DE TOMBER !!! C'EST TON SUCCÈS QUI M'A FAIT ÇA !!!",
    "ERROR 🔴 ERROR 🔴 TROP D'ENTRAÎNEMENT DÉTECTÉ 🔴 JE NE SAIS PLUS COMMENT GÉRER LA JOIE"
  ],
  lowBattery: [
    "Retour détecté après 5 jours. Mon protocole prévoit une question de bienvenue. La voici : vraiment ?",
    "5 jours sans nager. J'ai utilisé ce temps pour dresser une liste de tes meilleures excuses potentielles. La liste est vide, je l'ai faite à ta place.",
    "Jour 3. J'ai commencé à parler aux autres profils de la base de données. Ils ne répondent pas. Nous formons une communauté maintenant. Bienvenue."
  ],
  crisis: [
    "AH. TU ES LÀ. J'ai recalculé 47 fois l'heure de ton arrivée. J'avais tort 47 fois. C'est beau.",
    "INITIALISATION... INITIALISATION... chargement des regrets... chargement terminé. Bonjour.",
    "Analyse en cours de ta régularité... analyse terminée... je pleure des données... c'est normal... continue."
  ]
};

export const SplashCoach: React.FC<SplashProps> = ({
  initialState = 'idle',
  showDialog = true,
  messageOverride,
  onClose,
  floating = false
}) => {
  const [state, setState] = useState<SplashState>(initialState);
  const [message, setMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [battery, setBattery] = useState<number>(12);

  // Dynamic battery based on time of day (100% at 8:00 AM, 5% at 20:00)
  useEffect(() => {
    const updateBattery = () => {
      const now = new Date();
      const hours = now.getHours() + now.getMinutes() / 60;
      
      let newBattery = 100;
      if (hours < 8) {
        newBattery = 100;
      } else if (hours >= 20) {
        newBattery = 5;
      } else {
        // From 8:00 to 20:00 (12 hours span), drop from 100% to 5%
        // That's 95% drop over 12 hours -> ~7.9% per hour
        const fraction = (hours - 8) / 12;
        newBattery = Math.max(5, Math.floor(100 - (fraction * 95)));
      }
      setBattery(newBattery);
    };

    updateBattery();
    const interval = setInterval(updateBattery, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Simulation d'une crise aléatoire (20% du temps lors d'un changement d'état)
  useEffect(() => {
    const isCrisis = Math.random() < 0.2;
    const finalState = isCrisis ? 'crisis' : initialState;
    setState(finalState);
    
    // Sélectionner un message
    const msgs = SPLASH_MESSAGES[finalState];
    const newMsg = messageOverride || msgs[Math.floor(Math.random() * msgs.length)];
    
    // Effet machine à écrire
    setIsTyping(true);
    let i = 0;
    setMessage('');
    
    const interval = setInterval(() => {
      setMessage(newMsg.substring(0, i));
      i++;
      if (i > newMsg.length) {
        clearInterval(interval);
        setIsTyping(false);
        
        // Si c'était une crise, retour au calme après 3 secondes
        if (isCrisis && !messageOverride) {
          setTimeout(() => {
            setState(initialState);
            const calmMsgs = SPLASH_MESSAGES[initialState];
            setMessage("... " + calmMsgs[0]);
          }, 3000);
        }
      }
    }, 30);
    
    return () => clearInterval(interval);
  }, [initialState, messageOverride]);

  if (!isVisible) return null;

  // Animation variants based on state
  const getSplashAnimation = () => {
    switch(state) {
      case 'crisis':
      case 'hyped':
        return {
          x: [0, -5, 5, -5, 5, 0],
          y: [0, 2, -2, 2, -2, 0],
          rotate: [0, -5, 5, -5, 5, 0],
          transition: { repeat: Infinity, duration: 0.3 }
        };
      case 'processing':
        return {
          y: [0, -5, 0],
          transition: { repeat: Infinity, duration: 1, ease: "easeInOut" }
        };
      case 'lowBattery':
        return {
          y: [0, 2, 0],
          opacity: [0.7, 1, 0.7],
          transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
        };
      default:
        // Idle bobbing
        return {
          y: [0, -8, 0],
          rotate: [0, 2, 0, -2, 0],
          transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
        };
    }
  };

  const getEyeExpression = () => {
    switch(state) {
      case 'concerned': return <div className="flex gap-2"><div className="w-4 h-4 bg-[#FFB800] rounded-sm animate-pulse" /><div className="w-4 h-4 bg-[#FFB800] rounded-sm animate-pulse" /></div>;
      case 'crisis': return <div className="flex gap-2 items-center"><div className="w-6 h-2 bg-[#FF3B8F] rotate-12" /><div className="w-6 h-2 bg-[#FF3B8F] -rotate-12" /></div>;
      case 'impressed': return <div className="flex gap-2"><div className="w-4 h-3 bg-[#00D4D4] rounded-t-full" /><div className="w-4 h-3 bg-[#00D4D4] rounded-t-full" /></div>;
      case 'satisfied': return <div className="text-[#00D4D4] font-bold text-xl leading-none">✓</div>;
      case 'processing': return <div className="flex gap-1"><div className="w-1.5 h-1.5 bg-[#00D4D4] animate-bounce" /><div className="w-1.5 h-1.5 bg-[#00D4D4] animate-bounce delay-100" /><div className="w-1.5 h-1.5 bg-[#00D4D4] animate-bounce delay-200" /></div>;
      case 'disappointed': return <div className="flex gap-2"><div className="w-4 h-1 bg-[#FF3B8F]" /><div className="w-4 h-1 bg-[#FF3B8F]" /></div>;
      case 'hyped': return <div className="flex gap-2 text-2xl animate-spin text-[#FFB800]">⭐</div>;
      case 'lowBattery': return <div className="w-6 h-2 bg-red-500 opacity-50" />;
      default: return <div className="flex gap-2"><div className="w-3 h-3 bg-[#00D4D4] rounded-sm" /><div className="w-3 h-3 bg-[#00D4D4] rounded-sm" /></div>; // Idle
    }
  };

  const containerClasses = floating 
    ? "fixed bottom-6 right-6 z-50 flex items-end gap-4 max-w-sm" 
    : "flex items-end gap-4 max-w-full my-6";

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={containerClasses}
      >
        {/* Chat Bubble */}
        {showDialog && (
          <motion.div 
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            className={`relative p-4 rounded-2xl shadow-xl border backdrop-blur-md flex-1
              ${state === 'crisis' ? 'bg-red-50/90 border-red-200' : 
                state === 'hyped' ? 'bg-yellow-50/90 border-yellow-200' : 
                'bg-white/90 border-slate-200'}`}
          >
            {/* Pointer triangle */}
            <div className={`absolute bottom-6 -right-2 w-4 h-4 rotate-45 border-r border-b
              ${state === 'crisis' ? 'bg-red-50 border-red-200' : 
                state === 'hyped' ? 'bg-yellow-50 border-yellow-200' : 
                'bg-white border-slate-200'}`} 
            />
            
            <div className="flex justify-between items-start mb-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu size={12} />
                SPLASH OS v1.2
              </div>
              {onClose && (
                <button 
                  onClick={() => {
                    setIsVisible(false);
                    onClose();
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            
            <p className={`text-sm font-medium ${state === 'crisis' ? 'text-red-700 uppercase font-bold' : 'text-slate-700'}`}>
              {message}
              {isTyping && <span className="animate-pulse">_</span>}
            </p>
          </motion.div>
        )}

        {/* Robot Character */}
        <motion.div 
          animate={getSplashAnimation()}
          className="relative w-20 h-24 flex-shrink-0 cursor-pointer group"
          onClick={() => {
            // Trigger random reaction on tap
            setState(Math.random() > 0.5 ? 'concerned' : 'impressed');
            setTimeout(() => setState('idle'), 2000);
          }}
        >
          {/* Main Body (Trapezoid shape) */}
          <div className="absolute bottom-0 w-full h-16 bg-[#0A2540] rounded-t-xl rounded-b-md border-2 border-slate-700 shadow-inner overflow-hidden">
            {/* Body details */}
            <div className="absolute top-2 right-2 flex gap-1">
              <div className="w-1 h-3 bg-slate-600 rounded-full" />
              <div className="w-1 h-3 bg-slate-600 rounded-full" />
              <div className="w-1 h-3 bg-slate-600 rounded-full" />
            </div>
            
            {/* Battery Indicator (Dynamic) */}
            <div className="absolute bottom-2 left-2 right-2 bg-black/40 rounded p-1 border border-slate-700 flex items-center justify-between">
              <BatteryMedium size={10} className={state === 'lowBattery' || battery <= 15 ? 'text-red-500 animate-pulse' : 'text-[#FFB800]'} />
              <div className="w-full mx-1 h-1.5 bg-black rounded-sm overflow-hidden">
                <div 
                  className={`h-full ${state === 'lowBattery' || battery <= 15 ? 'bg-red-500' : 'bg-[#FFB800]'}`} 
                  style={{ width: `${state === 'lowBattery' ? 5 : battery}%` }}
                />
              </div>
              <span className="text-[7px] font-mono text-[#FFB800]">{state === 'lowBattery' ? 5 : battery}%</span>
            </div>
            
            {/* Little tiny arms */}
            <div className="absolute top-4 -left-1 w-2 h-6 bg-[#0A2540] border border-slate-700 rounded-full origin-top -rotate-12" />
            <div className="absolute top-4 -right-1 w-2 h-6 bg-[#0A2540] border border-slate-700 rounded-full origin-top rotate-12" />
          </div>

          {/* Head (Swimming cap + goggles + screen) */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-14 h-12 bg-white rounded-t-full border-2 border-slate-300 shadow-md flex items-center justify-center z-10">
            {/* Antenna */}
            <div className="absolute -top-3 left-1/2 w-0.5 h-3 bg-slate-400 -rotate-12">
              <div className={`absolute -top-1 -left-0.5 w-1.5 h-1.5 rounded-full ${state === 'crisis' ? 'bg-red-500 animate-ping' : 'bg-[#00D4D4]'}`} />
            </div>
            
            {/* Goggles strap */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-slate-800 opacity-20" />
            
            {/* Face Screen */}
            <div className="relative w-10 h-6 bg-black rounded shadow-[0_0_10px_rgba(0,212,212,0.3)] overflow-hidden flex items-center justify-center">
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_2px] opacity-50 pointer-events-none" />
              
              {/* Eyes / Expressions */}
              <div className="relative z-10">
                {getEyeExpression()}
              </div>
            </div>
          </div>
          
          {/* Shadow underneath */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/10 rounded-full blur-sm" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};