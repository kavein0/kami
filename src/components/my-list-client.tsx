"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ListEntryData, ListStatus } from "@/lib/types";
import { updateListEntry, removeFromList } from "@/app/actions/list";
import { Star, MessageSquare, Trash2, Edit3, X, Save, LayoutGrid, List as ListIcon, Columns, Plus, Minus, Search, CheckSquare, Square } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import { useDictionary } from "./dictionary-provider";

type ViewMode = "kanban" | "grid" | "list";
type ListDictionary = Dictionary["list"];

interface Props {
  entries: ListEntryData[];
  dict: ListDictionary;
  lang: string;
}

export function MyListClient({ entries: initialEntries, dict, lang }: Props) {
  const fullDict = useDictionary();
  const COLUMNS = [
    { id: "watching", title: dict.watching, color: "border-neon-cyan/50 text-neon-cyan" },
    { id: "plan_to_watch", title: dict.planned, color: "border-neon-yellow/50 text-neon-yellow" },
    { id: "watched", title: dict.completed, color: "border-neon-green/50 text-neon-green" },
    { id: "on_hold", title: dict.onHold, color: "border-neon-purple/50 text-neon-purple" },
    { id: "dropped", title: dict.dropped, color: "border-neon-pink/50 text-neon-pink" }
  ] as const satisfies ReadonlyArray<{
    id: ListStatus;
    title: string;
    color: string;
  }>;

  const [entries, setEntries] = useState<ListEntryData[]>(initialEntries);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);

  // Kanban specifically requires grouped columns
  const kanbanColumns = useMemo(() => {
    const grouped: Record<string, ListEntryData[]> = {
      watching: [], plan_to_watch: [], watched: [], on_hold: [], dropped: []
    };
    entries.forEach(e => {
      // Apply search filter to Kanban too
      const titleName = lang === "en" ? (e.title.nameEn || e.title.name) : e.title.name;
      if (searchQuery && !titleName.toLowerCase().includes(searchQuery.toLowerCase())) return;
      if (grouped[e.status]) grouped[e.status].push(e);
    });
    return grouped;
  }, [entries, searchQuery]);

  // General filtered entries for Grid/List
  const filteredEntries = useMemo(() => {
    if (!searchQuery) return entries;
    const lowerQ = searchQuery.toLowerCase();
    return entries.filter(e => {
      const titleName = lang === "en" ? (e.title.nameEn || e.title.name) : e.title.name;
      return titleName.toLowerCase().includes(lowerQ);
    });
  }, [entries, searchQuery, lang]);

  // Derived Stats
  const stats = useMemo(() => {
    let totalScore = 0;
    let scoredCount = 0;
    let totalMinutes = 0;

    entries.forEach(e => {
      if (e.score) {
        totalScore += e.score;
        scoredCount++;
      }
      
      const epCount = e.title.episodes || 1; // if movie, assume 1 episode
      const progress = e.progress || (e.status === 'watched' ? epCount : 0);
      
      // Attempt to parse duration (e.g. "24 min per ep", "1 hr 40 min", "24 min")
      let minutesPerEp = 24; // default
      if (e.title.duration) {
        const hrMatch = e.title.duration.match(/(\d+)\s*hr/i);
        const minMatch = e.title.duration.match(/(\d+)\s*min/i);
        if (hrMatch || minMatch) {
          minutesPerEp = (hrMatch ? parseInt(hrMatch[1]) * 60 : 0) + (minMatch ? parseInt(minMatch[1]) : 0);
        }
      }
      
      totalMinutes += progress * minutesPerEp;
    });

    const days = Math.floor(totalMinutes / (24 * 60));
    const remainingHours = Math.round((totalMinutes % (24 * 60)) / 60);

    return {
      averageScore: scoredCount > 0 ? (totalScore / scoredCount).toFixed(1) : 0,
      days,
      remainingHours,
      totalCount: entries.length
    };
  }, [entries]);

  useEffect(() => {
    setMounted(true);
    // Auto-switch to grid on small screens by default if they haven't explicitly chosen
    if (window.innerWidth < 768 && viewMode === "kanban") {
      setViewMode("grid");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateScoreComment = async (id: string, score: number, comment: string) => {
    const updated = entries.map(e => e.id === id ? { ...e, score, comment } : e);
    setEntries(updated);
    setEditingId(null);
    await updateListEntry(id, { score, comment: comment || undefined });
  };

  const handleUpdateProgress = async (id: string, newProgress: number) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    const maxEp = entry.title.episodes || 9999;
    const safeProgress = Math.max(0, Math.min(newProgress, maxEp));
    
    // Optimistic UI update
    setEntries(entries.map(e => e.id === id ? { ...e, progress: safeProgress } : e));
    await updateListEntry(id, { progress: safeProgress });
  };

  const handleDelete = async (id: string) => {
    if (confirm(dict.deleteConfirm || "Delete?")) {
      setEntries(entries.filter(e => e.id !== id));
      await removeFromList(id);
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkMove = async (status: ListStatus) => {
    const ids = Array.from(selectedIds);
    // Optimistic
    setEntries(entries.map(e => ids.includes(e.id) ? { ...e, status } : e));
    setSelectedIds(new Set());
    // Submit individually (or create a bulk action route later, but parallel fetches work)
    await Promise.all(ids.map(id => updateListEntry(id, { status })));
  };

  const handleBulkDelete = async () => {
    if (confirm(dict.deleteConfirm || "Delete?")) {
      const ids = Array.from(selectedIds);
      setEntries(entries.filter(e => !ids.includes(e.id)));
      setSelectedIds(new Set());
      await Promise.all(ids.map(id => removeFromList(id)));
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return; // ignore same column reorder for now
    const destinationStatus = COLUMNS.find((column) => column.id === destination.droppableId)?.id;
    if (!destinationStatus) return;

    // Optimistic update
    setEntries(entries.map(e => e.id === draggableId ? { ...e, status: destinationStatus } : e));
    await updateListEntry(draggableId, { status: destinationStatus });
  };

  if (!mounted) return <div className="min-h-[50vh] flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Controls & Stats */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-dark-bg/50 backdrop-blur-md p-4 rounded-3xl border border-dark-border">
        
        {/* Stats */}
        <div className="flex gap-6 items-center w-full lg:w-auto">
          <div className="flex flex-col">
            <span className="text-xs text-dark-muted font-heading uppercase tracking-widest">{dict.total || "Total"}</span>
            <span className="text-xl font-bold">{stats.totalCount}</span>
          </div>
          <div className="w-px h-8 bg-dark-border" />
          <div className="flex flex-col">
            <span className="text-xs text-dark-muted font-heading uppercase tracking-widest">{dict.averageScore || "Avg Score"}</span>
            <div className="flex items-center gap-1 text-neon-yellow">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-xl font-bold">{stats.averageScore}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-dark-border hidden sm:block" />
          <div className="flex flex-col hidden sm:flex">
            <span className="text-xs text-dark-muted font-heading uppercase tracking-widest">{dict.timeSpent || "Time Spent"}</span>
            <span className="text-lg font-bold text-neon-cyan">
              {stats.days} <span className="text-xs text-dark-muted">{dict.days || "d"}</span> {stats.remainingHours} <span className="text-xs text-dark-muted">{dict.hours || "h"}</span>
            </span>
          </div>
        </div>

        {/* View Controls & Search */}
        <div className="flex gap-3 w-full lg:w-auto flex-wrap lg:flex-nowrap">
          <div className="relative flex-1 lg:w-64 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
            <input 
              type="text" 
              placeholder={dict.search || "Search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-dark-border rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:border-neon-cyan transition-colors"
            />
          </div>
          
          <div className="flex bg-black/40 border border-dark-border rounded-xl p-1 shrink-0">
            <button 
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "kanban" ? "bg-neon-cyan/20 text-neon-cyan" : "text-dark-muted hover:text-white"}`}
              title={dict.kanban || "Board"}
            >
              <Columns className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-neon-purple/20 text-neon-purple" : "text-dark-muted hover:text-white"}`}
              title={dict.grid || "Grid"}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-neon-green/20 text-neon-green" : "text-dark-muted hover:text-white"}`}
              title={dict.table || "List"}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20 text-dark-muted">
          <p className="text-xl">{dict.empty || "Your list is empty"}</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-20 text-dark-muted">
          <p className="text-xl">{dict.search || "No results found"}</p>
        </div>
      ) : (
        <div className="mt-4">
          {viewMode === "kanban" && (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar">
                {COLUMNS.map((col) => (
                  <Droppable key={col.id} droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 min-w-[280px] lg:min-w-[300px] snap-center rounded-3xl glass-strong border ${
                          snapshot.isDraggingOver ? "bg-white/5 border-white/20" : "border-dark-border"
                        } p-4 flex flex-col min-h-[65vh]`}
                      >
                        <div className="mb-4 flex items-center gap-2">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full glass border text-sm font-bold uppercase tracking-widest ${col.color}`}>
                            <span className={`w-2 h-2 rounded-full ${col.color.includes('cyan') ? 'bg-neon-cyan' : col.color.includes('yellow') ? 'bg-neon-yellow' : col.color.includes('green') ? 'bg-neon-green' : col.color.includes('purple') ? 'bg-neon-purple' : 'bg-neon-pink'} shadow-[0_0_6px_currentColor] animate-pulse`} />
                            {col.title}
                          </div>
                          <span className="ml-auto text-xs font-mono text-dark-muted bg-dark-surface border border-dark-border px-2 py-0.5 rounded-full">{kanbanColumns[col.id].length}</span>
                        </div>
                        
                        <div className="flex-1 flex flex-col gap-3 overflow-y-auto overflow-x-hidden pr-0.5 h-full">
                          {kanbanColumns[col.id].map((entry, index) => (
                            <Draggable key={entry.id} draggableId={entry.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`relative rounded-2xl overflow-hidden glass border ${
                                    snapshot.isDragging ? "shadow-2xl shadow-neon-cyan/20 border-neon-cyan/50 z-40" : "border-dark-border/50"
                                  } p-3 transition-colors hover:border-white/20 bg-dark-bg/80 backdrop-blur-xl group`}
                                >
                                  <EntryCardContent 
                                    entry={entry} 
                                    dict={dict} 
                                    lang={lang}
                                    isSelected={selectedIds.has(entry.id)}
                                    onToggleSelect={() => toggleSelection(entry.id)}
                                    onEdit={() => setEditingId(entry.id)}
                                    onDelete={() => handleDelete(entry.id)}
                                    onProgressUpdate={(p) => handleUpdateProgress(entry.id, p)}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {kanbanColumns[col.id].length === 0 && (
                            <div className="flex flex-col items-center justify-center gap-3 flex-1 h-full min-h-[200px] rounded-2xl border border-dashed border-dark-border/40 text-dark-muted/40 text-xs text-center px-4 py-6 mb-2">
                              <span className="text-3xl opacity-30">✦</span>
                              <span className="font-medium">{dict.empty || "Empty"}</span>
                              <span className="text-[10px] opacity-60">{dict.dragTitlesHere || "Drag titles here"}</span>
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
          )}

          {viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEntries.map(entry => (
                <div key={entry.id} className="relative rounded-2xl overflow-hidden glass border border-dark-border/50 p-4 transition-colors hover:border-white/20 bg-dark-bg/80 backdrop-blur-xl">
                  <EntryCardContent 
                    entry={entry} 
                    dict={dict} 
                    lang={lang}
                    isSelected={selectedIds.has(entry.id)}
                    onToggleSelect={() => toggleSelection(entry.id)}
                    onEdit={() => setEditingId(entry.id)}
                    onProgressUpdate={(p) => handleUpdateProgress(entry.id, p)}
                    showStatusBadge
                    onDelete={() => handleDelete(entry.id)}
                  />
                </div>
              ))}
            </div>
          )}

          {viewMode === "list" && (
            <div className="flex flex-col gap-2">
              {filteredEntries.map(entry => (
                <div key={entry.id} className="flex gap-4 items-center bg-dark-border/20 border border-dark-border/50 rounded-xl p-3 hover:bg-dark-border/40 transition-colors">
                  <button onClick={() => toggleSelection(entry.id)} className="text-dark-muted hover:text-neon-cyan pl-2">
                    {selectedIds.has(entry.id) ? <CheckSquare className="w-5 h-5 text-neon-cyan" /> : <Square className="w-5 h-5" />}
                  </button>
                  <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0 relative bg-black shrink-0">
                    {entry.title.poster && <Image src={entry.title.poster} alt={entry.title.name} fill sizes="40px" className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{entry.title.name}</h4>
                    <span className="text-xs text-dark-muted">{COLUMNS.find(c => c.id === entry.status)?.title || entry.status}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 pr-2">
                    <div className="flex items-center gap-2">
                      {entry.title.type !== 'movie' && (
                        <>
                          <button onClick={() => handleUpdateProgress(entry.id, (entry.progress||0) - 1)} className="p-1 hover:text-white text-dark-muted"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="text-xs font-mono w-10 text-center">{entry.progress || 0} / {entry.title.episodes || "?"}</span>
                          <button onClick={() => handleUpdateProgress(entry.id, (entry.progress||0) + 1)} className="p-1 hover:text-white text-dark-muted"><Plus className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-neon-yellow w-12 justify-end shrink-0">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-sm font-bold">{entry.score || "-"}</span>
                    </div>
                    <button onClick={() => setEditingId(entry.id)} className="p-1.5 text-dark-muted hover:text-neon-cyan"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-dark-muted hover:text-neon-pink"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Global Modals / Overlays */}
      <AnimatePresence>
        {editingId && (
          <QuickEditOverlay 
            key="edit-overlay"
            entry={entries.find(e => e.id === editingId)!} 
            dict={dict}
            onClose={() => setEditingId(null)}
            onSave={(scale, comment) => handleUpdateScoreComment(editingId, scale, comment)}
          />
        )}

        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-strong border border-neon-cyan/50 rounded-2xl p-4 shadow-2xl flex items-center gap-4 w-[90%] max-w-lg"
          >
            <div className="flex items-center gap-2 bg-neon-cyan/20 px-3 py-1.5 rounded-lg text-neon-cyan font-bold whitespace-nowrap">
              <CheckSquare className="w-4 h-4" />
              {selectedIds.size} {dict.selectedCount || "selected"}
            </div>
            
            <div className="w-px h-6 bg-dark-border" />
            
            <div className="flex-1 flex gap-2 overflow-x-auto hide-scrollbar">
              <select 
                onChange={(e) => {
                  const nextStatus = COLUMNS.find((column) => column.id === e.target.value)?.id;
                  if (nextStatus) {
                    handleBulkMove(nextStatus);
                    e.target.value = "";
                  }
                }}
                className="bg-black border border-dark-border text-sm rounded-lg py-2 px-3 outline-none hover:border-gray-500 cursor-pointer min-w-[140px]"
                defaultValue=""
              >
                <option value="" disabled>{dict.bulkMove || "Move to..."}</option>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            <button onClick={handleBulkDelete} className="p-2 bg-neon-pink/10 hover:bg-neon-pink/20 text-neon-pink rounded-lg transition-colors flex-shrink-0" title={dict.bulkDelete || "Delete"}>
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="p-2 text-dark-muted hover:text-white flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Reusable card content for Kanban and Grid
function EntryCardContent({ 
  entry, dict, lang, isSelected, onToggleSelect, onEdit, onDelete, onProgressUpdate, showStatusBadge = false
}: { 
  entry: ListEntryData, dict: ListDictionary, lang: string, isSelected: boolean, onToggleSelect: () => void, onEdit: () => void, onDelete?: () => void, onProgressUpdate: (p: number) => void, showStatusBadge?: boolean 
}) {
  return (
    <div className="relative z-10 w-full h-full flex flex-col">
      <div className="flex gap-3">
        {/* Poster */}
        <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 relative bg-dark-border cursor-pointer group" onClick={onToggleSelect}>
          {entry.title.poster && (
            <Image
              src={entry.title.poster}
              alt={entry.title.name}
              fill
              sizes="80px"
              className={`object-cover transition-opacity ${isSelected ? "opacity-50" : "group-hover:opacity-80"}`}
            />
          )}
          {isSelected && (
            <div className="absolute inset-0 flex items-center justify-center bg-neon-cyan/20">
              <CheckSquare className="w-8 h-8 text-neon-cyan" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex flex-col flex-1 justify-between py-1">
          <div>
            <h4 className="font-bold text-sm leading-tight line-clamp-2 text-white" title={lang === "en" ? (entry.title.nameEn || entry.title.name) : entry.title.name} onClick={onToggleSelect}>
              {lang === "en" ? (entry.title.nameEn || entry.title.name) : entry.title.name}
            </h4>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs text-dark-muted">
                {entry.title.type === "movie" ? (dict.typeMovie || "Movie") : entry.title.type === "series" ? (dict.typeSeries || "Series") : (dict.typeAnime || "Anime")}
              </span>
              {showStatusBadge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-border text-dark-muted lowercase">
                  {entry.status.replace("_", " ")}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-2">
            {/* Progress Bar */}
            {entry.title.type !== 'movie' && (
              <div className="flex items-center justify-between bg-black/40 rounded-lg p-1 border border-dark-border/50">
                <button onClick={() => onProgressUpdate((entry.progress || 0) - 1)} className="p-1 hover:text-neon-pink disabled:opacity-30 disabled:hover:text-inherit text-dark-muted transition-colors rounded" disabled={(entry.progress||0) <= 0}>
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="flex-1 text-center flex flex-col items-center leading-none">
                  <span className="text-xs font-mono font-bold tracking-wide text-white">
                    {entry.progress || 0} <span className="text-dark-muted text-[10px]">/ {entry.title.episodes || "?"}</span>
                  </span>
                </div>
                <button 
                  onClick={() => onProgressUpdate((entry.progress || 0) + 1)} 
                  className="p-1 hover:text-neon-green disabled:opacity-30 disabled:hover:text-inherit text-dark-muted transition-colors rounded"
                  disabled={entry.title.episodes ? (entry.progress||0) >= entry.title.episodes : false}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-1">
              <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-md text-neon-yellow">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-bold">{entry.score || "-"}</span>
              </div>
              <div className="flex gap-1 ml-auto">
                <button
                  onClick={onEdit}
                  title={dict.edit || "Edit"}
                  className="p-1.5 rounded-md bg-black/30 hover:bg-neon-cyan/20 hover:text-neon-cyan text-dark-muted transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                {onDelete && (
                  <button
                    onClick={onDelete}
                    title={dict.bulkDelete || "Delete"}
                    className="p-1.5 rounded-md bg-black/30 hover:bg-neon-pink/20 hover:text-neon-pink text-dark-muted transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comment indicator */}
      {entry.comment && (
        <div className="mt-3 text-[11px] text-dark-muted/80 italic bg-black/30 px-2.5 py-2 rounded-xl break-words line-clamp-2 border border-dark-border/30">
          <MessageSquare className="w-3 h-3 inline-block mr-1 opacity-50" />
          {entry.comment}
        </div>
      )}
    </div>
  );
}

function QuickEditOverlay({ entry, dict, onClose, onSave }: { entry: ListEntryData, dict: ListDictionary, onClose: () => void, onSave: (s: number, c: string) => void }) {
  const [score, setScore] = useState(entry.score || 0);
  const [comment, setComment] = useState(entry.comment || "");

  // Prevent scroll propagation to allow typing safely
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm glass-strong border border-dark-border rounded-2xl p-5 shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute right-4 top-4 p-1 text-dark-muted hover:text-white rounded-full bg-black/50 hover:bg-black transition-colors"><X className="w-5 h-5" /></button>
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-neon-cyan">{dict.edit || "Edit"}</span>
          <h3 className="text-lg font-bold mt-1 line-clamp-1">{entry.title.name}</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-dark-muted mb-1.5 block uppercase tracking-wider font-semibold">{dict.score} (0-10)</label>
            <input 
              type="number" min="0" max="10" 
              value={score} onChange={(e) => setScore(Number(e.target.value))}
              className="w-full bg-black/50 border border-dark-border rounded-xl p-3 text-sm outline-none focus:border-neon-cyan transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-dark-muted mb-1.5 block uppercase tracking-wider font-semibold">{dict.comment || "Comment"}</label>
            <textarea 
              value={comment} onChange={(e) => setComment(e.target.value)}
              className="w-full h-[80px] bg-black/50 border border-dark-border rounded-xl p-3 text-sm outline-none focus:border-neon-cyan transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 bg-dark-border/50 text-white font-bold text-sm rounded-xl hover:bg-dark-border transition-colors tracking-wide"
            >
              {dict.cancel || "Cancel"}
            </button>
            <button 
              onClick={() => onSave(score, comment)}
              className="flex-1 py-2.5 bg-neon-cyan text-black font-bold text-sm rounded-xl flex justify-center items-center gap-2 hover:opacity-90 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all tracking-wide"
            >
              <Save className="w-4 h-4" /> {dict.save || "Save"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
