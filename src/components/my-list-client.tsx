"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ListEntryData } from "@/lib/types";
import { updateListEntry, removeFromList } from "@/app/actions";
import { Star, MessageSquare, Trash2, Edit3, X, Save } from "lucide-react";

interface Props {
  entries: ListEntryData[];
  dict: any;
}

export function MyListClient({ entries, dict }: Props) {
  const COLUMNS = [
    { id: "watching", title: dict.watching, color: "border-neon-cyan/50 text-neon-cyan" },
    { id: "plan_to_watch", title: dict.planned, color: "border-neon-yellow/50 text-neon-yellow" },
    { id: "watched", title: dict.completed, color: "border-neon-green/50 text-neon-green" },
    { id: "on_hold", title: dict.onHold, color: "border-neon-purple/50 text-neon-purple" },
    { id: "dropped", title: dict.dropped, color: "border-neon-pink/50 text-neon-pink" }
  ];
  const buildColumns = useCallback((data: ListEntryData[]) => {
    const grouped: Record<string, ListEntryData[]> = {
      watching: [], plan_to_watch: [], watched: [], on_hold: [], dropped: []
    };
    data.forEach(entry => {
      if (grouped[entry.status]) {
        grouped[entry.status].push(entry);
      }
    });
    return grouped;
  }, []);

  const [columns, setColumns] = useState<Record<string, ListEntryData[]>>(() => buildColumns(entries));
  
  // Need to wait for mount for DND strict mode compatibility
  const [mounted, setMounted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setColumns(buildColumns(entries));
  }, [entries, buildColumns]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (source.droppableId === destination.droppableId) {
      const newCol = [...columns[source.droppableId]];
      const [movedItem] = newCol.splice(source.index, 1);
      newCol.splice(destination.index, 0, movedItem);
      
      setColumns({
        ...columns,
        [source.droppableId]: newCol
      });
      return;
    }

    const sourceCol = [...columns[source.droppableId]];
    const destCol = [...columns[destination.droppableId]];
    
    const [movedItem] = sourceCol.splice(source.index, 1);
    movedItem.status = destination.droppableId;
    destCol.splice(destination.index, 0, movedItem);

    setColumns({
      ...columns,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol
    });

    // Update DB
    await updateListEntry(movedItem.id, { status: destination.droppableId });
  };

  const handleUpdate = async (id: string, score: number, comment: string) => {
    await updateListEntry(id, { score, comment });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm(dict.delete + "?")) {
      await removeFromList(id);
    }
  };

  if (!mounted) return <div className="min-h-[50vh] flex items-center justify-center">{dict.loading || "Loading..."}</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar">
        {COLUMNS.map((col) => (
          <Droppable key={col.id} droppableId={col.id}>
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`min-w-[300px] w-[300px] flex-shrink-0 snap-center rounded-3xl glass-strong border ${
                  snapshot.isDraggingOver ? "bg-white/5 border-white/20" : "border-dark-border"
                } p-4 flex flex-col`}
              >
                <div className={`text-lg font-bold mb-4 pb-2 border-b uppercase tracking-wider ${col.color}`}>
                  {col.title} <span className="opacity-50 text-sm">({columns[col.id].length})</span>
                </div>
                
                <div className="flex-1 flex flex-col gap-3 min-h-[150px]">
                  {columns[col.id].map((entry, index) => (
                    <Draggable key={entry.id} draggableId={entry.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`relative rounded-2xl overflow-hidden glass border ${
                            snapshot.isDragging ? "shadow-2xl shadow-neon-cyan/20 border-neon-cyan/50 z-50" : "border-dark-border/50"
                          } p-3 transition-colors hover:border-white/20 bg-dark-bg/80 backdrop-blur-xl group`}
                        >
                          <div className="flex gap-3 relative z-10">
                            {/* Poster */}
                            <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 relative bg-dark-border">
                              {entry.title.poster && (
                                <Image
                                  src={entry.title.poster}
                                  alt={entry.title.name}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                />
                              )}
                            </div>
                            
                            {/* Content */}
                            <div className="flex flex-col flex-1 justify-between py-1">
                              <div>
                                <h4 className="font-bold text-sm leading-tight line-clamp-2 text-white">
                                  {entry.title.name}
                                </h4>
                                <span className="text-xs text-dark-muted mt-1 block">
                                  {entry.title.type === "movie" ? (dict.movie || "Movie") : entry.title.type === "series" ? (dict.series || "Series") : "Anime"}
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1 text-neon-yellow">
                                  <Star className="w-3.5 h-3.5 fill-current" />
                                  <span className="text-xs font-semibold">{entry.score || "-"}</span>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingId(entry.id)}
                                    className="p-1.5 rounded-lg bg-dark-border/50 hover:text-neon-cyan transition-colors"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(entry.id)}
                                    className="p-1.5 rounded-lg bg-dark-border/50 hover:text-neon-pink transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Comment indicator */}
                          {entry.comment && (
                            <div className="mt-2 text-xs text-dark-muted italic bg-black/20 p-2 rounded-lg break-words line-clamp-2">
                              <MessageSquare className="w-3 h-3 inline-block mr-1" />
                              {entry.comment}
                            </div>
                          )}

                          {/* Quick Edit Overlay */}
                          <AnimatePresence>
                            {editingId === entry.id && (
                              <QuickEditOverlay 
                                entry={entry} 
                                dict={dict}
                                onClose={() => setEditingId(null)}
                                onSave={(s, c) => handleUpdate(entry.id, s, c)}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}

function QuickEditOverlay({ entry, dict, onClose, onSave }: { entry: ListEntryData, dict: any, onClose: () => void, onSave: (s: number, c: string) => void }) {
  const [score, setScore] = useState(entry.score || 0);
  const [comment, setComment] = useState(entry.comment || "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute inset-0 z-20 bg-dark-bg/95 backdrop-blur-xl p-3 flex flex-col"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold uppercase tracking-widest">{dict.edit || "Edit"}</span>
        <button onClick={onClose} className="p-1 text-dark-muted hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      
      <div className="space-y-3 flex-1 flex flex-col">
        <div>
          <label className="text-xs text-dark-muted mb-1 block">{dict.score} (1-10)</label>
          <input 
            type="number" min="1" max="10" 
            value={score} onChange={(e) => setScore(Number(e.target.value))}
            className="w-full bg-dark-border/50 rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-neon-cyan"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-dark-muted mb-1 block">Comment</label>
          <textarea 
            value={comment} onChange={(e) => setComment(e.target.value)}
            className="w-full h-[60px] bg-dark-border/50 rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-neon-cyan resize-none"
          />
        </div>
        <button 
          onClick={() => onSave(score, comment)}
          className="w-full py-2 bg-neon-cyan text-black font-bold text-sm rounded-lg flex justify-center items-center gap-2 hover:opacity-90"
        >
          <Save className="w-4 h-4" /> {dict.save}
        </button>
      </div>
    </motion.div>
  );
}
