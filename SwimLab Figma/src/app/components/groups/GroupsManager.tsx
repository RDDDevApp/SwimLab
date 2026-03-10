import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import {
  Users, UserPlus, Settings, Calendar, Trash2, Edit3, 
  ChevronLeft, Search, Plus, MoreVertical, Droplets,
  Activity, Star, Clock, AlertCircle, X, Check, AlertTriangle
} from 'lucide-react';

const bgImage = "https://images.unsplash.com/photo-1593935882214-7c9568ad5cde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2ltbWluZyUyMHBvb2wlMjBtaW5pbWFsaXN0JTIwYmx1ZSUyMHdhdGVyJTIwYnJpZ2h0fGVufDF8fHx8MTc3MjYzNTUyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

// --- Mock Data ---
const initialGroups = [
  {
    id: 1,
    name: 'Elite',
    description: 'Nageurs de niveau national et international',
    color: 'from-blue-500 to-indigo-600',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    swimmers: 12,
    slots: 5,
    level: 'Avancé',
    icon: Star
  },
  {
    id: 2,
    name: 'Espoir',
    description: 'Jeunes talents en préparation',
    color: 'from-cyan-500 to-blue-500',
    badgeColor: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    swimmers: 18,
    slots: 4,
    level: 'Intermédiaire',
    icon: Activity
  },
  {
    id: 3,
    name: 'Masters',
    description: 'Nageurs adultes compétiteurs',
    color: 'from-emerald-500 to-teal-600',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    swimmers: 24,
    slots: 3,
    level: 'Tous niveaux',
    icon: Users
  }
];

const mockSwimmers = [
  { id: 1, name: 'Lucas Dubois', age: 21, specialty: 'Sprint Libre', attendance: 95 },
  { id: 2, name: 'Emma Laurent', age: 19, specialty: '4 Nages', attendance: 88 },
  { id: 3, name: 'Hugo Martin', age: 22, specialty: 'Dos', attendance: 92 },
  { id: 4, name: 'Chloé Bernard', age: 20, specialty: 'Brasse', attendance: 85 },
];

// Nageurs non attribués à un groupe
const unassignedSwimmers = [
  { id: 5, name: 'Sarah Lemoine', age: 18, specialty: 'Sprint Libre', joinedDate: '2026-03-05' },
  { id: 6, name: 'Thomas Roux', age: 24, specialty: 'Papillon', joinedDate: '2026-03-08' },
  { id: 7, name: 'Julie Moreau', age: 17, specialty: '4 Nages', joinedDate: '2026-03-09' },
];

const mockSlots = [
  { id: 1, day: 'Lundi', time: '18:00 - 20:00', type: 'Endurance', location: 'Bassin 50m' },
  { id: 2, day: 'Mercredi', time: '18:00 - 20:00', type: 'Vitesse', location: 'Bassin 25m' },
  { id: 3, day: 'Vendredi', time: '19:00 - 21:00', type: 'Récupération', location: 'Bassin 50m' },
];

export const GroupsManager: React.FC = () => {
  const [groups, setGroups] = useState(initialGroups);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'swimmers' | 'slots' | 'settings'>('swimmers');
  const [swimmerAssignments, setSwimmerAssignments] = useState<{[key: number]: number | null}>({});

  const activeGroup = groups.find(g => g.id === selectedGroup);

  const handleDeleteGroup = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce groupe ?")) {
      setGroups(groups.filter(g => g.id !== id));
      if (selectedGroup === id) setSelectedGroup(null);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
      
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

      <div className="relative z-10 container mx-auto px-4 py-8 md:px-8 h-screen flex flex-col max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Link 
              to="/coach" 
              className="p-3 rounded-2xl bg-white/60 hover:bg-white transition-all border border-white/80 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Users className="w-4 h-4" /> Gestion d'équipe
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Mes Groupes</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unassignedSwimmers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-amber-900">
                      {unassignedSwimmers.length} nageur{unassignedSwimmers.length > 1 ? 's' : ''} non affecté{unassignedSwimmers.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-amber-700">
                      Rejoints récemment
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAssignModal(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all border border-amber-400/30"
                >
                  <UserPlus className="w-5 h-5" />
                  Affecter
                </motion.button>
              </motion.div>
            )}

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all border border-indigo-400/30"
            >
              <Plus className="w-5 h-5" />
              Nouveau groupe
            </motion.button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0 pb-8">
          
          {/* Left Panel: Groups List */}
          <div className="w-full lg:w-80 flex flex-col gap-4 flex-shrink-0">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Rechercher un groupe..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-20 lg:pb-0 custom-scrollbar">
              {groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).map((group) => (
                <motion.div
                  key={group.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedGroup(group.id)}
                  className={`cursor-pointer rounded-2xl p-4 transition-all border ${
                    selectedGroup === group.id 
                      ? 'bg-white shadow-xl shadow-indigo-900/5 border-indigo-200 ring-1 ring-indigo-100' 
                      : 'bg-white/40 backdrop-blur-md hover:bg-white/60 border-white/60 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${group.color} text-white flex items-center justify-center shadow-inner`}>
                        <group.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-800">{group.name}</h3>
                    </div>
                    {selectedGroup === group.id && (
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5 bg-slate-100/80 px-2 py-1 rounded-md">
                      <Users className="w-3.5 h-3.5" /> {group.swimmers}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100/80 px-2 py-1 rounded-md">
                      <Calendar className="w-3.5 h-3.5" /> {group.slots} créneaux
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Panel: Group Details */}
          <div className="flex-1 bg-white/50 backdrop-blur-xl border border-white/80 rounded-[32px] shadow-xl shadow-indigo-900/5 overflow-hidden flex flex-col relative min-h-[600px]">
            {activeGroup ? (
              <>
                {/* Detail Header */}
                <div className="p-8 border-b border-slate-200/50 bg-white/40">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeGroup.color} text-white flex items-center justify-center shadow-lg shadow-indigo-500/20`}>
                        <activeGroup.icon className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-slate-800 mb-2">{activeGroup.name}</h2>
                        <p className="text-slate-500 font-medium">{activeGroup.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2.5 bg-white rounded-xl text-slate-400 hover:text-indigo-600 shadow-sm border border-slate-100 transition-colors tooltip-trigger">
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteGroup(activeGroup.id)}
                        className="p-2.5 bg-white rounded-xl text-slate-400 hover:text-red-500 shadow-sm border border-slate-100 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${activeGroup.badgeColor}`}>
                      {activeGroup.level}
                    </span>
                    <span className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> 2 nageurs inactifs cette semaine
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex px-8 pt-4 gap-8 border-b border-slate-200/50">
                  {[
                    { id: 'swimmers', label: 'Nageurs', icon: Users, count: activeGroup.swimmers },
                    { id: 'slots', label: 'Créneaux', icon: Calendar, count: activeGroup.slots },
                    { id: 'settings', label: 'Paramètres', icon: Settings }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 pb-4 text-sm font-bold transition-colors relative ${
                        activeTab === tab.id ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      {tab.count !== undefined && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                      {activeTab === tab.id && (
                        <motion.div 
                          layoutId="activeTab" 
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-8 flex-1 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    
                    {/* SWIMMERS TAB */}
                    {activeTab === 'swimmers' && (
                      <motion.div
                        key="swimmers"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-bold text-slate-800">Composition du groupe</h3>
                          <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors">
                            <UserPlus className="w-4 h-4" /> Ajouter
                          </button>
                        </div>

                        <div className="bg-white/60 border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/80 border-b border-slate-200/60">
                              <tr>
                                <th className="px-6 py-4 font-bold text-slate-500">Nageur</th>
                                <th className="px-6 py-4 font-bold text-slate-500">Spécialité</th>
                                <th className="px-6 py-4 font-bold text-slate-500">Assiduité</th>
                                <th className="px-6 py-4 font-bold text-slate-500 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {mockSwimmers.map(swimmer => (
                                <tr key={swimmer.id} className="hover:bg-white transition-colors group">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-slate-600">
                                        {swimmer.name.charAt(0)}
                                      </div>
                                      <div>
                                        <div className="font-bold text-slate-800">{swimmer.name}</div>
                                        <div className="text-xs text-slate-400">{swimmer.age} ans</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 font-medium text-slate-600">
                                    <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs">{swimmer.specialty}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full ${swimmer.attendance > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                          style={{ width: `${swimmer.attendance}%` }}
                                        />
                                      </div>
                                      <span className="text-xs font-bold text-slate-600">{swimmer.attendance}%</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <button className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                      <X className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}

                    {/* SLOTS TAB */}
                    {activeTab === 'slots' && (
                      <motion.div
                        key="slots"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-bold text-slate-800">Créneaux d'entraînement hebdomadaires</h3>
                          <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors">
                            <Plus className="w-4 h-4" /> Nouveau créneau
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {mockSlots.map(slot => (
                            <div key={slot.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow group">
                              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                                <Clock className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-slate-800 text-lg mb-1">{slot.day}</h4>
                                <div className="text-sm font-medium text-slate-500 mb-3">{slot.time}</div>
                                <div className="flex flex-wrap gap-2">
                                  <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                                    {slot.type}
                                  </span>
                                  <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                                    {slot.location}
                                  </span>
                                </div>
                              </div>
                              <button className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                      <motion.div
                        key="settings"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="max-w-2xl"
                      >
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Paramètres du groupe</h3>
                        
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Nom du groupe</label>
                            <input 
                              type="text" 
                              defaultValue={activeGroup.name}
                              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                            <textarea 
                              rows={3}
                              defaultValue={activeGroup.description}
                              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Niveau ciblé</label>
                            <select defaultValue="Avancé" className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium appearance-none">
                              <option value="Débutant">Débutant</option>
                              <option value="Intermédiaire">Intermédiaire</option>
                              <option value="Avancé">Avancé</option>
                              <option value="Elite">Elite</option>
                              <option value="Tous niveaux">Tous niveaux</option>
                            </select>
                          </div>

                          <div className="pt-4 border-t border-slate-200">
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md shadow-indigo-200">
                              Enregistrer les modifications
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Aucun groupe sélectionné</h3>
                <p className="max-w-md">Sélectionnez un groupe dans la liste de gauche pour voir ses détails ou créez-en un nouveau.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Creation Modal Modal Background (Mock) */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 z-10"
            >
              <button onClick={() => setIsCreating(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Nouveau Groupe</h2>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Nom</label>
                  <input type="text" placeholder="Ex: Poussins A" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Description courte</label>
                  <input type="text" placeholder="Objectif de la saison..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setIsCreating(false)} className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Annuler</button>
                <button onClick={() => setIsCreating(false)} className="flex-1 py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-md shadow-indigo-200">Créer</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ASSIGN SWIMMERS MODAL */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowAssignModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-amber-500 to-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">Affecter des nageurs</h2>
                    <p className="text-sm font-medium text-white/80 mt-1">
                      {unassignedSwimmers.length} nageur{unassignedSwimmers.length > 1 ? 's' : ''} en attente d'affectation
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowAssignModal(false)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-3">
                  {unassignedSwimmers.map((swimmer) => (
                    <div 
                      key={swimmer.id}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center gap-4"
                    >
                      {/* Swimmer Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white shadow-sm flex items-center justify-center text-sm font-bold text-white">
                            {swimmer.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{swimmer.name}</div>
                            <div className="text-xs text-slate-500">{swimmer.age} ans • {swimmer.specialty}</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 ml-13">
                          Rejoint le {new Date(swimmer.joinedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>

                      {/* Group Selector */}
                      <div className="w-64">
                        <select 
                          value={swimmerAssignments[swimmer.id] || ''}
                          onChange={(e) => setSwimmerAssignments({
                            ...swimmerAssignments,
                            [swimmer.id]: e.target.value ? parseInt(e.target.value) : null
                          })}
                          className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-bold text-sm appearance-none cursor-pointer"
                        >
                          <option value="">Sélectionner un groupe...</option>
                          {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                {unassignedSwimmers.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Tous les nageurs sont affectés !</h3>
                    <p className="text-slate-500">Il n'y a plus de nageurs en attente d'affectation.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {unassignedSwimmers.length > 0 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                  <button 
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3.5 rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={() => {
                      // Logique de sauvegarde ici
                      setShowAssignModal(false);
                    }}
                    className="flex-1 bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-amber-200"
                  >
                    Valider les affectations
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};