import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { 
  Mail, Lock, User, ArrowRight, Droplets, 
  Users, Building, Shield, ChevronLeft, CheckCircle2 
} from 'lucide-react';



type Step = 'LOGIN' | 'ROLE' | 'SIGNUP' | 'CODE' | 'CREATE_CLUB';
type Role = 'coach' | 'swimmer' | null;

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('LOGIN');
  const [role, setRole] = useState<Role>(null);
  const [code, setCode] = useState('');

  // Variants for AnimatePresence
  const pageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Par défaut, on redirige vers le coach dashboard pour la démo
    navigate('/coach');
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('CODE');
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return; // Fausse validation
    
    if (role === 'coach') {
      navigate('/coach'); // A rejoint un club existant
    } else {
      navigate('/swimmer'); // A rejoint le club, vue swimmer classique
    }
  };

  const handleSkipCode = () => {
    if (role === 'coach') {
      setStep('CREATE_CLUB'); // Coach sans code -> crée son club
    } else {
      navigate('/solo'); // Swimmer sans code -> vue solo
    }
  };

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/coach'); // Club créé, go dashboard
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white p-4">
      
      {/* Background dynamique "Liquid Glass" */}
      <div className="fixed inset-0 z-0 pointer-events-none">

        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-cyan-50/40 to-white/60" />
        
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: 'transform' }}
          className="absolute top-0 left-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{ willChange: 'transform' }}
          className="absolute bottom-0 right-20 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Conteneur principal */}
      <div className="relative z-10 w-full max-w-md">
        
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 mb-4 transform rotate-3 hover:rotate-6 transition-transform">
            <Droplets className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">SwimMaster Pro</h1>
          <p className="text-slate-500 font-medium mt-1 text-center">
            {step === 'LOGIN' ? 'Bon retour parmi nous' : 'Rejoignez la révolution aquatique'}
          </p>
        </div>

        {/* Card de contenu */}
        <div className="relative">
          <AnimatePresence mode="wait">
            
            {/* VUE : CONNEXION */}
            {step === 'LOGIN' && (
              <motion.div
                key="login"
                variants={pageVariants}
                initial="initial" animate="animate" exit="exit"
                transition={{ duration: 0.3 }}
                className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-2xl shadow-blue-900/10"
              >
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Adresse Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        type="email" 
                        required
                        placeholder="coach@club.com"
                        className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-bold text-slate-700">Mot de passe</label>
                      <a href="#" className="text-xs font-bold text-cyan-600 hover:text-cyan-700">Oublié ?</a>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 group">
                    Se connecter
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                <div className="mt-8 text-center text-sm font-medium text-slate-500">
                  Pas encore de compte ?{' '}
                  <button onClick={() => setStep('ROLE')} className="text-cyan-600 font-bold hover:underline">
                    Créer un compte
                  </button>
                </div>
              </motion.div>
            )}

            {/* VUE : CHOIX DU RÔLE */}
            {step === 'ROLE' && (
              <motion.div
                key="role"
                variants={pageVariants}
                initial="initial" animate="animate" exit="exit"
                transition={{ duration: 0.3 }}
                className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-2xl shadow-blue-900/10"
              >
                <button onClick={() => setStep('LOGIN')} className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Retour
                </button>
                
                <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Quel est votre profil ?</h2>
                
                <div className="space-y-4">
                  <button 
                    onClick={() => { setRole('swimmer'); setStep('SIGNUP'); }}
                    className="w-full group relative overflow-hidden rounded-2xl bg-white/50 border border-white/80 p-6 flex items-center gap-5 hover:bg-white transition-all shadow-sm hover:shadow-xl hover:shadow-cyan-900/10 text-left"
                  >
                    <div className="w-14 h-14 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Droplets className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-800 mb-1">Nageur</h3>
                      <p className="text-sm text-slate-500 font-medium">Rejoindre un club ou s'entraîner en solo</p>
                    </div>
                    <div className="absolute right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                      <ArrowRight className="w-5 h-5 text-cyan-500" />
                    </div>
                  </button>

                  <button 
                    onClick={() => { setRole('coach'); setStep('SIGNUP'); }}
                    className="w-full group relative overflow-hidden rounded-2xl bg-white/50 border border-white/80 p-6 flex items-center gap-5 hover:bg-white transition-all shadow-sm hover:shadow-xl hover:shadow-blue-900/10 text-left"
                  >
                    <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Shield className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-800 mb-1">Coach</h3>
                      <p className="text-sm text-slate-500 font-medium">Gérer des groupes et créer des entraînements</p>
                    </div>
                    <div className="absolute right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                      <ArrowRight className="w-5 h-5 text-blue-500" />
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* VUE : FORMULAIRE INSCRIPTION */}
            {step === 'SIGNUP' && (
              <motion.div
                key="signup"
                variants={pageVariants}
                initial="initial" animate="animate" exit="exit"
                transition={{ duration: 0.3 }}
                className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-2xl shadow-blue-900/10"
              >
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setStep('ROLE')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Profil {role === 'coach' ? 'Coach' : 'Nageur'}
                  </button>
                  <div className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    Étape 1/2
                  </div>
                </div>

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Nom complet</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        required
                        placeholder="Camille Lacourt"
                        className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Adresse Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        type="email" 
                        required
                        placeholder="camille@exemple.com"
                        className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Mot de passe</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full mt-2 py-3.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2">
                    Continuer
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* VUE : CODE CLUB */}
            {step === 'CODE' && (
              <motion.div
                key="code"
                variants={pageVariants}
                initial="initial" animate="animate" exit="exit"
                transition={{ duration: 0.3 }}
                className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-2xl shadow-blue-900/10 text-center"
              >
                <div className="flex items-center justify-between mb-8">
                  <button onClick={() => setStep('SIGNUP')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Retour
                  </button>
                  <div className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    Étape 2/2
                  </div>
                </div>

                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-blue-600" />
                </div>
                
                <h2 className="text-xl font-extrabold text-slate-800 mb-2">Code d'invitation Club</h2>
                <p className="text-sm text-slate-500 mb-8 px-4">
                  {role === 'coach' 
                    ? "Entrez le code fourni par votre club pour rejoindre l'équipe de coachs." 
                    : "Entrez le code de votre club pour accéder à vos entraînements."}
                </p>

                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <input 
                    type="text" 
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="EX: CLUB-2024"
                    className="w-full text-center text-xl tracking-widest font-bold px-4 py-4 bg-white/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-inner"
                  />

                  <button 
                    type="submit" 
                    disabled={!code.trim()}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all"
                  >
                    Rejoindre le club
                  </button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                  <div className="relative flex justify-center text-sm"><span className="px-4 bg-[#eef6fa] text-slate-400 font-medium">OU</span></div>
                </div>

                <button 
                  onClick={handleSkipCode}
                  className="w-full py-3.5 bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-bold transition-all"
                >
                  {role === 'coach' ? 'Créer mon propre club' : 'Continuer en Nageur Solo'}
                </button>
              </motion.div>
            )}

            {/* VUE : CREER UN CLUB (Coach uniquement) */}
            {step === 'CREATE_CLUB' && (
              <motion.div
                key="create-club"
                variants={pageVariants}
                initial="initial" animate="animate" exit="exit"
                transition={{ duration: 0.3 }}
                className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-2xl shadow-blue-900/10"
              >
                <div className="flex items-center justify-between mb-8">
                  <button onClick={() => setStep('CODE')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Retour
                  </button>
                  <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    Dernière étape
                  </div>
                </div>

                <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Créez votre structure</h2>
                <p className="text-sm text-slate-500 mb-6">
                  Définissez votre club ou votre équipe pour commencer à inviter des nageurs.
                </p>

                <form onSubmit={handleCreateClub} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Nom du club / structure</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Dauphins d'Annecy"
                        className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Ville (Optionnel)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Annecy"
                      className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all shadow-sm"
                    />
                  </div>

                  <button type="submit" className="w-full mt-4 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Terminer et accéder au Dashboard
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-xs font-medium text-slate-400">
          En continuant, vous acceptez nos <a href="#" className="underline hover:text-slate-600">Conditions d'utilisation</a> et notre <a href="#" className="underline hover:text-slate-600">Politique de confidentialité</a>.
        </div>

      </div>
    </div>
  );
};