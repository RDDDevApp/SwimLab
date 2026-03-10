import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Plus, X, Users, MapPin, Clock, MessageSquare, CheckCircle2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router';
import { SlotCard } from './SlotCard';
import { GlowBadge } from './GlowBadge';
import { COLORS, TYPE_CONFIG } from './constants';

const MOCK_DAYS = [
  {
    date: '27 Jan',
    dayName: 'Lundi',
    dayShort: 'LUN',
    isToday: false,
    slots: [
      {
        id: 1, type: 'endurance', title: 'Endurance 3000m', group: 'Compétition',
        time: '18h00 — 19h30', distance: '3000m', feedbackRate: 82,
        location: 'Piscine Mun.', groupId: 'comp',
      },
      {
        id: 2, type: 'technique', title: 'Éducatifs Papillon', group: 'Loisir',
        time: '19h30 — 20h30', distance: '1800m', feedbackRate: 65,
        location: 'Piscine Mun.', groupId: 'loisir',
      },
    ],
  },
  {
    date: '28 Jan',
    dayName: 'Mardi',
    dayShort: 'MAR',
    isToday: true,
    slots: [
      {
        id: 3, type: 'sprint', title: 'Sprint Séries', group: 'Compétition',
        time: '18h00 — 19h30', distance: '2500m', status: 'emarge',
        location: 'Bassin 50m', groupId: 'comp',
      },
    ],
  },
  {
    date: '29 Jan',
    dayName: 'Mercredi',
    dayShort: 'MER',
    isToday: false,
    slots: [
      {
        id: 4, type: 'empty', title: 'Slot vide', group: 'Compétition',
        time: '18h00 — 19h30', empty: true, groupId: 'comp',
      },
    ],
  },
  {
    date: '30 Jan',
    dayName: 'Jeudi',
    dayShort: 'JEU',
    isToday: false,
    slots: [],
  },
  {
    date: '31 Jan',
    dayName: 'Vendredi',
    dayShort: 'VEN',
    isToday: false,
    slots: [
      {
        id: 5, type: 'recovery', title: 'Récup Active', group: 'Masters',
        time: '17h30 — 18h30', distance: '1500m', feedbackRate: 90,
        location: 'Piscine Mun.', groupId: 'masters',
      },
      {
        id: 6, type: 'endurance', title: 'Fondo Lent', group: 'Avenir',
        time: '19h00 — 20h30', distance: '2200m', feedbackRate: 78,
        groupId: 'avenir',
      },
    ],
  },
  {
    date: '1 Fév',
    dayName: 'Samedi',
    dayShort: 'SAM',
    isToday: false,
    slots: [
      {
        id: 7, type: 'sprint', title: 'Compétition Interne', group: 'Compétition',
        time: '09h00 — 12h00', distance: '4000m', status: 'emarge',
        location: 'Bassin 50m', groupId: 'comp',
      },
    ],
  },
  {
    date: '2 Fév',
    dayName: 'Dimanche',
    dayShort: 'DIM',
    isToday: false,
    slots: [],
  },
];

interface WeekViewProps {
  activeFilters?: string[];
  desktop?: boolean;
}

export function WeekView({ activeFilters = [], desktop = false }: WeekViewProps) {
  const navigate = useNavigate();
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [attendanceSession, setAttendanceSession] = useState<any>(null);
  const [addSlotModal, setAddSlotModal] = useState<{day: string, date: string} | null>(null);
  const [exceptionalSlotModal, setExceptionalSlotModal] = useState<{day: string, date: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'feedback'>('details');

  const filteredDays = MOCK_DAYS.map((day) => ({
    ...day,
    slots: activeFilters.length === 0
      ? day.slots
      : day.slots.filter((s) => activeFilters.includes((s as any).groupId ?? '')),
  }));

  const renderModals = () => (
    <AnimatePresence>
      {/* SESSION DETAILS MODAL */}
      {selectedSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSession(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className={`p-6 text-white bg-gradient-to-br ${TYPE_CONFIG[selectedSession.type]?.color === COLORS.turquoise ? 'from-cyan-500 to-blue-600' : 'from-indigo-500 to-purple-600'}`}>
              <button 
                onClick={() => setSelectedSession(null)} 
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              
              <div className="flex items-center gap-2 text-white/80 text-sm font-bold uppercase tracking-wider mb-3">
                {TYPE_CONFIG[selectedSession.type]?.icon}
                {TYPE_CONFIG[selectedSession.type]?.label}
              </div>
              <h2 className="text-3xl font-extrabold mb-2">{selectedSession.title}</h2>
              
              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm mt-4">
                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {selectedSession.time}</div>
                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {selectedSession.location || 'Bassin principal'}</div>
                <div className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Groupe {selectedSession.group}</div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex gap-4 border-b border-slate-100 pb-4 mb-6">
                <button 
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 py-2 font-bold transition-colors ${activeTab === 'details' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Détails
                </button>
                
                <button 
                  onClick={() => setActiveTab('feedback')}
                  className={`flex-1 py-2 font-bold transition-colors ${activeTab === 'feedback' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Feedback
                </button>
              </div>
              
              {activeTab === 'details' ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Objectif de la séance</h3>
                    <p className="text-slate-700 font-medium">Développement de la capacité aérobie avec travail technique sur les virages. {selectedSession.distance ? `Distance prévue : ${selectedSession.distance}.` : ''}</p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-cyan-500" /> Corps de séance
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-600 font-medium">
                      <li className="flex justify-between"><span>Échauffement à sec</span> <span className="text-slate-400">10 min</span></li>
                      <li className="flex justify-between"><span>400m 4 Nages souple</span> <span className="text-slate-400">10 min</span></li>
                      <li className="flex justify-between"><span>8 x 50m Éducatifs (Spé)</span> <span className="text-slate-400">15 min</span></li>
                      <li className="flex justify-between font-bold text-slate-800"><span>Série Principale (Seuil)</span> <span className="text-indigo-500">40 min</span></li>
                      <li className="flex justify-between"><span>200m Récupération</span> <span className="text-slate-400">5 min</span></li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto pr-2 space-y-3">
                  {[
                    { name: "Lucas Dubois", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64", present: true, rpe: 7, feedback: "Bonnes sensations sur la série principale, mais dur sur la fin." },
                    { name: "Emma Laurent", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64", present: true, rpe: 8, feedback: "Un peu de fatigue musculaire aujourd'hui." },
                    { name: "Hugo Martin", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64", present: false, rpe: null, feedback: null },
                    { name: "Chloé Bernard", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&h=64", present: true, rpe: 6, feedback: null },
                    { name: "Thomas Roux", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=64&h=64", present: true, rpe: 9, feedback: "Séance très intense, j'ai eu du mal à tenir l'allure sur les derniers 50m." },
                    { name: "Sarah Lemoine", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=64&h=64", present: false, rpe: null, feedback: null },
                  ].map((swimmer, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border ${!swimmer.present ? 'bg-slate-100/50 border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm'} transition-colors flex flex-col gap-2`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={swimmer.avatar} alt="" className={`w-8 h-8 rounded-full object-cover ${!swimmer.present && 'grayscale'}`} />
                          <div className="font-bold text-sm text-slate-700">{swimmer.name}</div>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {swimmer.present ? 'Présent' : 'Absent'}
                        </div>
                      </div>
                      
                      {swimmer.present && (swimmer.rpe || swimmer.feedback) && (
                        <div className="ml-11 border-l-2 border-slate-100 pl-3">
                          {swimmer.rpe && (
                            <div className="mb-1 flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">RPE</span>
                              <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-bold ${
                                swimmer.rpe >= 8 ? 'bg-red-100 text-red-700' :
                                swimmer.rpe >= 6 ? 'bg-orange-100 text-orange-700' :
                                'bg-emerald-100 text-emerald-700'
                              }`}>
                                {swimmer.rpe}/10
                              </span>
                            </div>
                          )}
                          {swimmer.feedback && (
                            <div className="text-xs text-slate-600 italic">"{swimmer.feedback}"</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => { setSelectedSession(null); setAttendanceSession(selectedSession); }}
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" /> Faire l'appel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ATTENDANCE MODAL (Émargement) */}
      {attendanceSession && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAttendanceSession(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800">Émargement</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Groupe {attendanceSession.group} • {attendanceSession.time}</p>
              </div>
              <button 
                onClick={() => {
                  setSelectedSession(attendanceSession);
                  setAttendanceSession(null);
                }} 
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {[
                { name: "Lucas Dubois", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64", present: true },
                { name: "Emma Laurent", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64", present: true },
                { name: "Hugo Martin", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64", present: false },
                { name: "Chloé Bernard", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&h=64", present: true },
                { name: "Thomas Roux", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=64&h=64", present: null },
                { name: "Sarah Lemoine", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=64&h=64", present: null },
              ].map((swimmer, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={swimmer.avatar} alt="" className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
                    <span className="font-bold text-slate-700">{swimmer.name}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <button className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${swimmer.present === true ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-emerald-500'}`}>
                      Présent
                    </button>
                    <button className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${swimmer.present === false ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400 hover:text-red-400'}`}>
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => setAttendanceSession(null)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md shadow-emerald-200"
              >
                Valider l'émargement
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ADD SLOT MODAL */}
      {addSlotModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAddSlotModal(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
          >
            <div className="border-b border-slate-100 flex items-center justify-between bg-white px-[24px] py-[5px]">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800">Ajouter une séance</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Jour {addSlotModal.day} • {addSlotModal.date}</p>
              </div>
              <button 
                onClick={() => setAddSlotModal(null)}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-[24px] py-[10px]">
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    const modalData = addSlotModal;
                    setAddSlotModal(null);
                    setExceptionalSlotModal(modalData);
                  }}
                  className="w-full bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 font-bold text-lg px-[24px] py-[5px]"
                >
                  <Plus className="w-6 h-6" />
                  Ajouter un créneau exceptionnel
                </button>
                
                <button 
                  onClick={() => {
                    setAddSlotModal(null);
                    navigate('/groups');
                  }}
                  className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 font-bold text-lg px-[24px] py-[5px]"
                >
                  <Plus className="w-6 h-6" />
                  Ajouter un créneau récurrent
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-[16px] py-[10px]">
              <button 
                onClick={() => setAddSlotModal(null)}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3.5 rounded-xl transition-colors px-[0px] py-[5px]"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* EXCEPTIONAL SLOT FORM MODAL */}
      {exceptionalSlotModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExceptionalSlotModal(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-br from-cyan-500 to-blue-600">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Créneau exceptionnel</h2>
                <p className="text-sm font-medium text-white/80 mt-1">{exceptionalSlotModal.day} • {exceptionalSlotModal.date}</p>
              </div>
              <button 
                onClick={() => setExceptionalSlotModal(null)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-500" />
                    Date
                  </label>
                  <input 
                    type="date"
                    defaultValue="2026-01-28"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all font-medium"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-500" />
                    Horaire
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="time"
                      defaultValue="18:00"
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all font-medium"
                    />
                    <input 
                      type="time"
                      defaultValue="19:30"
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Nom de la séance
                  </label>
                  <input 
                    type="text"
                    placeholder="Ex: Entraînement Sprint"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all font-medium"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-cyan-500" />
                    Type de séance
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-3 bg-cyan-50 hover:bg-cyan-100 border-2 border-cyan-500 text-cyan-700 rounded-xl text-sm font-bold transition-all">
                      Entrainement exceptionnel
                    </button>
                    <button className="p-3 bg-slate-50 hover:bg-slate-100 border-2 border-transparent text-slate-600 rounded-xl text-sm font-bold transition-all">
                      Entrainement perso
                    </button>
                    <button className="p-3 bg-slate-50 hover:bg-slate-100 border-2 border-transparent text-slate-600 rounded-xl text-sm font-bold transition-all">
                      Compétition
                    </button>
                    <button className="p-3 bg-slate-50 hover:bg-slate-100 border-2 border-transparent text-slate-600 rounded-xl text-sm font-bold transition-all">
                      Stage de natation
                    </button>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-500" />
                    Lieu
                  </label>
                  <input 
                    type="text"
                    placeholder="Ex: Piscine Municipale"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setExceptionalSlotModal(null)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3.5 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={() => setExceptionalSlotModal(null)}
                className="flex-1 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-cyan-200"
              >
                Créer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // ── Desktop: 7-column grid ──────────────────────────────────────────────────
  if (desktop) {
    return (
      <div className="p-6 h-full">
        <div className="grid grid-cols-7 gap-3 h-full min-h-[calc(100vh-130px)]">
          {filteredDays.map((day, i) => (
            <motion.div
              key={day.dayName}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col min-h-0 rounded-2xl overflow-hidden border"
              style={{
                backgroundColor: day.isToday
                  ? `rgba(8,145,178,0.07)`
                  : 'rgba(255,255,255,0.45)',
                borderColor: day.isToday
                  ? `${COLORS.turquoise}40`
                  : COLORS.cardBorder,
                backdropFilter: 'blur(12px)',
                boxShadow: day.isToday
                  ? `0 0 24px ${COLORS.turquoise}18, 0 4px 16px rgba(0,0,0,0.06)`
                  : '0 2px 12px rgba(0,0,0,0.04)',
              }}
            >
              {/* Day header */}
              <div
                className="flex-shrink-0 p-3 border-b"
                style={{
                  borderColor: day.isToday ? `${COLORS.turquoise}25` : COLORS.cardBorder,
                  background: day.isToday
                    ? `linear-gradient(135deg, ${COLORS.turquoise}14, transparent)`
                    : 'rgba(255,255,255,0.40)',
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: day.isToday ? COLORS.turquoise : COLORS.textMuted }}
                  >
                    {day.dayShort}
                  </span>
                  {day.isToday && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: COLORS.turquoise, boxShadow: `0 0 6px ${COLORS.turquoise}` }}
                    />
                  )}
                </div>
                <div
                  className="text-lg font-bold"
                  style={{ color: day.isToday ? COLORS.turquoise : COLORS.textPrimary }}
                >
                  {day.date.split(' ')[0]}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: COLORS.textMuted }}>
                  {day.date.split(' ')[1]}
                </div>
              </div>

              {/* Slots */}
              <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto no-scrollbar">
                <AnimatePresence>
                  {day.slots.length > 0 ? (
                    day.slots.map((slot, j) => (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.05 + j * 0.04 }}
                      >
                        <SlotCard 
                          slot={slot as any} 
                          compact 
                          onClick={() => setSelectedSession(slot)}
                          onEmargeClick={(e) => {
                            e.stopPropagation();
                            setAttendanceSession(slot);
                          }}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 flex flex-col items-center justify-center py-6 rounded-xl border border-dashed cursor-pointer group transition-colors hover:border-blue-200"
                      style={{ borderColor: 'rgba(0,0,0,0.08)' }}
                    >
                      <Droplets
                        size={18}
                        style={{ color: `${COLORS.textMuted}80` }}
                        className="mb-1.5"
                      />
                      <span className="text-[10px]" style={{ color: `${COLORS.textMuted}90` }}>
                        Libre
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Add slot */}
                {day.slots.length > 0 && (
                  <motion.button
                    onClick={() => setAddSlotModal({ day: day.dayName, date: day.date })}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-1.5 rounded-xl border border-dashed text-[10px] font-medium transition-colors flex items-center justify-center gap-1 hover:border-cyan-300"
                    style={{
                      borderColor: 'rgba(0,0,0,0.10)',
                      color: COLORS.textMuted,
                    }}
                  >
                    <Plus size={11} />
                    Ajouter un créneau
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        {renderModals()}
      </div>
    );
  }

  // ── Mobile: vertical list ───────────────────────────────────────────────────
  return (
    <div className="p-4 flex flex-col gap-7">
      {filteredDays.map((day, i) => (
        <motion.div
          key={day.dayName}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Day header */}
          <div className="flex items-center gap-2 mb-3">
            {day.isToday && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: COLORS.turquoise,
                  boxShadow: `0 0 8px ${COLORS.turquoise}`,
                }}
              />
            )}
            <span
              className="text-sm font-bold tracking-tight"
              style={{ color: day.isToday ? COLORS.turquoise : COLORS.textPrimary }}
            >
              {day.dayName} <span style={{ color: COLORS.textMuted }}>{day.date}</span>
            </span>
            {day.isToday && (
              <GlowBadge color={COLORS.turquoise}>Aujourd'hui</GlowBadge>
            )}
            <div className="ml-auto">
              <span className="text-xs font-medium" style={{ color: COLORS.textMuted }}>
                {day.slots.length} séance{day.slots.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Slots */}
          <div className="flex flex-col gap-2.5">
            {day.slots.length > 0 ? (
              day.slots.map((slot, j) => (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 + j * 0.05 }}
                >
                  <SlotCard 
                    slot={slot as any} 
                    onClick={() => setSelectedSession(slot)}
                    onEmargeClick={(e) => {
                      e.stopPropagation();
                      setAttendanceSession(slot);
                    }}
                  />
                </motion.div>
              ))
            ) : (
              <div
                className="py-8 flex flex-col items-center justify-center rounded-2xl border border-dashed transition-colors hover:border-blue-200 cursor-pointer"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.30)',
                  borderColor: 'rgba(0,0,0,0.08)',
                }}
              >
                <Droplets
                  size={22}
                  style={{ color: `${COLORS.textMuted}80` }}
                  className="mb-2"
                />
                <span className="text-xs font-medium" style={{ color: COLORS.textMuted }}>
                  Pas de créneau
                </span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
      {renderModals()}
    </div>
  );
}