import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import {
  ArrowLeft, Edit3, Camera, 
  Trophy, Star, Zap, Flame, Crown, Shield, Heart, X, Check,
  ChevronDown, LogOut, Trash2
} from 'lucide-react';

const bgImage = "https://images.unsplash.com/photo-1593935882214-7c9568ad5cde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2ltbWluZyUyMHBvb2wlMjBtaW5pbWFsaXN0JTIwYmx1ZSUyMHdhdGVyJTIwYnJpZ2h0fGVufDF8fHx8MTc3MjYzNTUyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

// Available badges
const availableBadges = [
  { id: 1, name: 'Champion', icon: Trophy, color: 'from-yellow-400 to-amber-500', active: true },
  { id: 2, name: 'Assidu', icon: Star, color: 'from-blue-400 to-indigo-500', active: true },
  { id: 3, name: 'Rapide', icon: Zap, color: 'from-purple-400 to-pink-500', active: false },
  { id: 4, name: 'Endurant', icon: Flame, color: 'from-orange-400 to-red-500', active: true },
  { id: 5, name: 'Record', icon: Crown, color: 'from-indigo-400 to-purple-500', active: false },
  { id: 6, name: 'Dévoué', icon: Heart, color: 'from-pink-400 to-rose-500', active: false },
  { id: 7, name: 'Défenseur', icon: Shield, color: 'from-emerald-400 to-teal-500', active: false },
];

// Available titles
const availableTitles = [
  { id: 1, name: 'Nageur Elite', unlocked: true },
  { id: 2, name: 'Champion Régional', unlocked: true },
  { id: 3, name: 'Maître des Bassins', unlocked: false },
  { id: 4, name: 'Légende de la Piscine', unlocked: false },
  { id: 5, name: 'Record Breaker', unlocked: true },
  { id: 6, name: 'Pro du Papillon', unlocked: true },
];

const specialties = [
  "Crawl (Nage Libre)",
  "Dos",
  "Brasse",
  "Papillon",
  "4 Nages"
];

// Mock swimmer data
const swimmerData = {
  name: 'Alex Bertrand',
  email: 'alex.bertrand@email.com',
  phone: '+33 6 12 34 56 78',
  birthDate: '15 Mars 2002',
  location: 'Paris, France',
  club: 'Aqua Elite Paris',
  group: 'Elite',
  speciality: 'Crawl (Nage Libre)',
  joinDate: 'Septembre 2020',
  currentTitle: 'Champion Régional',
  profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
};

export const SwimmerProfile: React.FC = () => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState(availableBadges.filter(b => b.active));
  const [selectedTitle, setSelectedTitle] = useState(swimmerData.currentTitle);
  const [selectedSpecialty, setSelectedSpecialty] = useState(swimmerData.speciality);
  const [isSpecialtyMenuOpen, setIsSpecialtyMenuOpen] = useState(false);

  const toggleBadge = (badgeId: number) => {
    const badge = availableBadges.find(b => b.id === badgeId);
    if (!badge) return;

    if (selectedBadges.find(b => b.id === badgeId)) {
      setSelectedBadges(selectedBadges.filter(b => b.id !== badgeId));
    } else if (selectedBadges.length < 3) {
      setSelectedBadges([...selectedBadges, badge]);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src={bgImage} 
          alt="" 
          className="w-full h-full object-cover opacity-10 scale-105 blur-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-blue-50/50 to-white/80" />
        
        {/* Animated Orbs */}
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link 
            to="/solo" 
            className="p-3 rounded-2xl bg-white/60 hover:bg-white transition-all border border-white/80 shadow-sm backdrop-blur-md"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Mon Profil</h1>
            <p className="text-slate-500 font-medium">Gérez vos informations et personnalisez votre profil</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Card */}
          <div className="bg-white/50 backdrop-blur-xl border border-white/80 rounded-[32px] shadow-xl shadow-indigo-900/5 overflow-hidden">
            {/* Cover */}
            <div className="h-32 bg-gradient-to-br from-indigo-500 via-blue-500 to-indigo-600 relative">
              <button className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors backdrop-blur-sm">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Image */}
            <div className="relative px-6 pb-6">
              <div className="relative -mt-16 mb-4">
                <img 
                  src={swimmerData.profileImage}
                  alt={swimmerData.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-xl mx-auto object-cover"
                />
                <button className="absolute bottom-2 right-1/2 translate-x-16 p-2 bg-indigo-500 hover:bg-indigo-600 rounded-full text-white shadow-lg transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Name, Title & Speciality */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-1">{swimmerData.name}</h2>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/50">
                    {selectedTitle}
                  </span>
                  <button 
                    onClick={() => setShowTitleModal(true)}
                    className="p-1.5 bg-white/50 hover:bg-white rounded-full text-slate-500 transition-colors shadow-sm border border-slate-200"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Dropdown Spécialité */}
                <div className="relative inline-block w-48">
                  <button 
                    onClick={() => setIsSpecialtyMenuOpen(!isSpecialtyMenuOpen)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-2 bg-white/60 hover:bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-all shadow-sm"
                  >
                    <span>{selectedSpecialty}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isSpecialtyMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isSpecialtyMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-20"
                      >
                        {specialties.map((spec, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedSpecialty(spec);
                              setIsSpecialtyMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                              selectedSpecialty === spec 
                                ? 'bg-indigo-50 text-indigo-700' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            {spec}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Badges */}
              <div className="mb-2 border-t border-slate-200/60 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-700">Badges actifs</h3>
                  <button 
                    onClick={() => setShowBadgeModal(true)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    Modifier
                  </button>
                </div>
                <div className="flex gap-3 justify-center">
                  {selectedBadges.slice(0, 3).map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <div 
                        key={badge.id}
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Edit Button */}
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 border border-indigo-400/30 flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Modifier le profil
              </button>
            </div>
          </div>

          {/* Club Info */}
          <div className="space-y-6">
            <div className="bg-white/50 backdrop-blur-xl border border-white/80 rounded-[32px] shadow-xl shadow-indigo-900/5 p-8 h-fit">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Informations club</h3>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg text-xs font-bold transition-colors shadow-sm border border-red-100">
                  <LogOut className="w-3.5 h-3.5" />
                  Quitter
                </button>
              </div>
              
              <div className="space-y-5">
                <div className="p-4 bg-white/60 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Club</p>
                  <p className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-500" />
                    {swimmerData.club}
                  </p>
                </div>
                
                <div className="p-4 bg-white/60 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Groupe</p>
                  <p className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    {swimmerData.group}
                  </p>
                </div>
                
                <div className="p-4 bg-white/60 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Membre depuis</p>
                  <p className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    {swimmerData.joinDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {/* Badge Selection Modal */}
        {showBadgeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowBadgeModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
            >
              <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-indigo-500 to-blue-600">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">Gérer mes badges</h2>
                    <p className="text-sm font-medium text-white/80 mt-1">
                      Sélectionnez jusqu'à 3 badges à afficher ({selectedBadges.length}/3)
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowBadgeModal(false)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {availableBadges.map((badge) => {
                    const Icon = badge.icon;
                    const isSelected = selectedBadges.find(b => b.id === badge.id);
                    const canSelect = selectedBadges.length < 3 || isSelected;
                    
                    return (
                      <button
                        key={badge.id}
                        onClick={() => canSelect && toggleBadge(badge.id)}
                        disabled={!canSelect}
                        className={`relative p-4 rounded-2xl border-2 transition-all ${
                          isSelected 
                            ? 'border-cyan-500 bg-cyan-50 scale-105' 
                            : canSelect 
                              ? 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:scale-105' 
                              : 'border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center mb-2 shadow-md`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-xs font-bold text-slate-700 text-center">{badge.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button 
                  onClick={() => setShowBadgeModal(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => setShowBadgeModal(false)}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-200"
                >
                  Valider
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Title Selection Modal */}
        {showTitleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowTitleModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
            >
              <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-indigo-500 to-purple-600">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">Changer de titre</h2>
                    <p className="text-sm font-medium text-white/80 mt-1">
                      Sélectionnez votre titre actif
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowTitleModal(false)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-2">
                  {availableTitles.map((title) => (
                    <button
                      key={title.id}
                      onClick={() => title.unlocked && setSelectedTitle(title.name)}
                      disabled={!title.unlocked}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        selectedTitle === title.name
                          ? 'border-indigo-500 bg-indigo-50'
                          : title.unlocked
                            ? 'border-slate-200 bg-slate-50 hover:border-slate-300'
                            : 'border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {title.unlocked ? (
                            <Star className="w-5 h-5 text-amber-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                          )}
                          <span className={`font-bold ${
                            selectedTitle === title.name 
                              ? 'text-indigo-700' 
                              : title.unlocked 
                                ? 'text-slate-800' 
                                : 'text-slate-400'
                          }`}>
                            {title.name}
                          </span>
                        </div>
                        {selectedTitle === title.name && (
                          <Check className="w-5 h-5 text-indigo-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button 
                  onClick={() => setShowTitleModal(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => setShowTitleModal(false)}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-200"
                >
                  Valider
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {isEditingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingProfile(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-indigo-500 to-blue-600">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-extrabold text-white">Modifier le profil</h2>
                  <button 
                    onClick={() => setIsEditingProfile(false)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Prénom</label>
                      <input 
                        type="text"
                        defaultValue="Alex"
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nom</label>
                      <input 
                        type="text"
                        defaultValue="Bertrand"
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                    <input 
                      type="email"
                      defaultValue={swimmerData.email}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Date de naissance</label>
                    <input 
                      type="date"
                      defaultValue="2002-03-15"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Localisation</label>
                    <input 
                      type="text"
                      defaultValue={swimmerData.location}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium"
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 mt-6">
                    <button className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors font-bold text-sm">
                      <Trash2 className="w-4 h-4" />
                      Supprimer le compte
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-200"
                >
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
