/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MEMORY_GRAPH_NODES, MEMORY_GRAPH_LINKS, GraphNode, GraphLink } from '../data';
import { Settings } from '../types';
import { Share2, Tag, Calendar, Target, Link as LinkIcon, FileText, CheckSquare, Info } from 'lucide-react';
import { Task, Goal } from '../types';

interface MemoryGraphViewProps {
  settings: Settings;
  tasks?: Task[];
  goals?: Goal[];
  discoveredLinks?: any[];
  discoveringLinks?: boolean;
  onDiscoverLinks?: () => void;
  onAcceptLink?: (link: { source: string; target: string }) => void;
}

export default function MemoryGraphView({ 
  settings,
  tasks = [],
  goals = [],
  discoveredLinks = [],
  discoveringLinks = false,
  onDiscoverLinks,
  onAcceptLink
}: MemoryGraphViewProps) {
  const isDark = settings.theme === 'dark';

  // Selected node state
  const [selectedNodeId, setSelectedNodeId] = useState<string>('g1');
  const [filterType, setFilterType] = useState<string>('all');

  const selectedNode = MEMORY_GRAPH_NODES.find(n => n.id === selectedNodeId) || MEMORY_GRAPH_NODES[0];

  // Filter nodes based on choice
  const filteredNodes = MEMORY_GRAPH_NODES.filter(node => {
    if (filterType === 'all') return true;
    return node.type === filterType;
  });

  // Filter links - only keep link if both source and target nodes are in the filtered set
  const filteredLinks = MEMORY_GRAPH_LINKS.filter(link => {
    const sourceExists = filteredNodes.some(n => n.id === link.source);
    const targetExists = filteredNodes.some(n => n.id === link.target);
    return sourceExists && targetExists;
  });

  // Helper to color nodes based on type
  const getNodeColor = (type: string, isSelected: boolean) => {
    if (isSelected) return '#6366f1'; // glowing indigo for selected

    const colorMap: Record<string, string> = {
      goal: '#818cf8',    // Indigo-400
      task: '#f43f5e',    // Rose-500
      event: '#a78bfa',   // Violet-400
      file: '#fbbf24',    // Amber-400
      link: '#2dd4bf'     // Teal-400
    };
    return colorMap[type] || '#94a3b8';
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'goal': return Target;
      case 'task': return CheckSquare;
      case 'event': return Calendar;
      case 'file': return FileText;
      case 'link': return LinkIcon;
      default: return Info;
    }
  };

  const DetailsIcon = getIconForType(selectedNode?.type || 'goal');

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs opacity-50 uppercase tracking-widest mb-1 font-semibold font-mono">ASSOCIATIVE THINKING</p>
          <h1 className="text-2xl font-light tracking-tight">
            Cognitive <span className="font-semibold">Memory Graph</span>
          </h1>
        </div>

        {/* Dynamic filters to avoid overcrowding */}
        <div className="flex flex-wrap gap-1.5 text-[10px] font-bold tracking-wider">
          {['all', 'goal', 'task', 'event', 'file', 'link'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all border ${
                filterType === type
                  ? isDark
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-black text-white border-black font-bold'
                  : isDark
                    ? 'bg-black border-white/10 text-white hover:bg-white/5'
                    : 'bg-white border-[#00000010] text-black hover:bg-black/5'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </header>

      {/* Gemini Cognitive Discoveries Panel */}
      <div className={`p-6 rounded-xl border ${
        isDark ? 'bg-[#0a0524] border-indigo-500/20 text-white' : 'bg-indigo-50/50 border-indigo-100 text-black'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Share2 className="h-4 w-4 text-indigo-400 shrink-0" />
            <h3 className="font-bold text-sm tracking-tight">Gemini Memory Discovery Engine</h3>
          </div>
          <button
            onClick={onDiscoverLinks}
            disabled={discoveringLinks}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              isDark 
                ? 'bg-white text-black hover:opacity-90' 
                : 'bg-black text-white hover:opacity-90'
            } disabled:opacity-50`}
          >
            {discoveringLinks ? 'Discovering Linkages...' : 'Run Discovery Sweep'}
          </button>
        </div>

        {discoveredLinks && discoveredLinks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {discoveredLinks.map((link, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'
                } flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider font-bold opacity-60 text-indigo-400 mb-2">
                    <span>Target Connection</span>
                    <span>✦ Discovery</span>
                  </div>
                  <p className="font-semibold leading-tight">{link.sourceLabel} ⟷ {link.targetLabel}</p>
                  <p className="text-[11px] opacity-85 mt-1.5 leading-relaxed">{link.relationshipReason}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#00000008] dark:border-white/5 flex justify-end">
                  <button
                    onClick={() => onAcceptLink && onAcceptLink({ source: link.source, target: link.target })}
                    className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                      isDark ? 'bg-white text-black hover:opacity-90' : 'bg-black text-white hover:opacity-90'
                    }`}
                  >
                    Accept &amp; Connect Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] opacity-75 leading-relaxed">
            Let Gemini crawl across your current tasks, active milestones, projects, and journal logs. It will suggest hidden cognitive patterns, relational links, and dependency pairings that can help streamline your daily focus hierarchy. Click the button to start.
          </p>
        )}
      </div>

      {/* Workspace Area: Left is SVG Graph, Right is Connected Node panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SVG Node Canvas Column */}
        <div className="lg:col-span-8">
          <div className={`p-6 rounded-xl border flex items-center justify-center relative overflow-hidden ${
            isDark ? 'bg-[#000000] border-white/10' : 'bg-white border-[#00000008]'
          }`}>
            {/* Visual Guide Overlay */}
            <span className="absolute top-4 left-4 text-[9px] font-bold uppercase tracking-widest opacity-50 flex items-center space-x-1.5">
              <Share2 className="h-3.5 w-3.5" />
              <span>Canvas Explore</span>
            </span>

            {/* SVG Visual Stage */}
            <svg 
              viewBox="50 50 650 320" 
              className="w-full h-auto max-h-[340px] select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Draw Connector Links */}
              {filteredLinks.map((link, idx) => {
                const sourceNode = MEMORY_GRAPH_NODES.find(n => n.id === link.source);
                const targetNode = MEMORY_GRAPH_NODES.find(n => n.id === link.target);

                if (!sourceNode || !targetNode) return null;

                const isLinkActive = link.source === selectedNodeId || link.target === selectedNodeId;

                return (
                  <line
                    key={`link-${idx}`}
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={isLinkActive ? '#6366f1' : isDark ? '#ffffff' : '#000000'}
                    strokeWidth={isLinkActive ? 2 : 0.8}
                    strokeOpacity={isLinkActive ? 0.85 : 0.25}
                    strokeDasharray={isLinkActive ? 'none' : '4,4'}
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Draw Nodes */}
              {filteredNodes.map(node => {
                const isSelected = selectedNodeId === node.id;
                const nodeColor = getNodeColor(node.type, isSelected);

                return (
                  <g 
                    key={node.id} 
                    className="cursor-pointer group"
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                    {/* Glowing highlight ring around selected node */}
                    {isSelected && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={16}
                        fill="none"
                        stroke={nodeColor}
                        strokeWidth={1.5}
                        className="animate-pulse"
                      />
                    )}

                    {/* Main Node bubble */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={10}
                      fill={nodeColor}
                      stroke={isDark ? '#000000' : '#ffffff'}
                      strokeWidth={1.5}
                      className="transition-all duration-200 hover:scale-125"
                    />

                    {/* Node text tags */}
                    <text
                      x={node.x}
                      y={node.y + 22}
                      textAnchor="middle"
                      fill={isDark ? '#F2FFFF' : '#000000'}
                      fontSize="9.5"
                      fontFamily="Outfit, Inter, sans-serif"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      className="pointer-events-none opacity-90 font-medium"
                    >
                      {node.label.split(': ')[1]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Node Details Column */}
        <div className="lg:col-span-4">
          <div className={`p-6 rounded-xl border h-full flex flex-col justify-between ${
            isDark ? 'bg-[#000000] border-white/10 text-[#F2FFFF]' : 'bg-white border-[#00000008] text-black'
          }`}>
            <div>
              <h2 className="text-xs uppercase tracking-wider font-bold mb-4 pb-2 border-b border-[#00000008] dark:border-white/5">
                Associated Node Details
              </h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2.5 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                    <DetailsIcon className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-50 block">{selectedNode?.type} node</span>
                    <h3 className="font-bold text-sm leading-tight mt-0.5">{selectedNode?.label}</h3>
                  </div>
                </div>

                <div className={`p-4 rounded-xl text-xs leading-relaxed ${
                  isDark ? 'bg-white/5 text-[#F2FFFF]/90' : 'bg-slate-50 text-black/90'
                }`}>
                  <p className="font-sans font-medium">{selectedNode?.details || "No metadata listed for this item."}</p>
                </div>
              </div>
            </div>

            {/* Direct related list */}
            <div className="mt-6 pt-3 border-t border-[#00000008] dark:border-white/5 space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-bold opacity-50 block">Linked Associations</span>
              
              <div className="space-y-1.5">
                {MEMORY_GRAPH_LINKS
                  .filter(l => l.source === selectedNodeId || l.target === selectedNodeId)
                  .map((link, i) => {
                    const otherId = link.source === selectedNodeId ? link.target : link.source;
                    const otherNode = MEMORY_GRAPH_NODES.find(n => n.id === otherId);

                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedNodeId(otherId)}
                        className={`w-full text-left p-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-between transition-all ${
                          isDark ? 'hover:bg-white/5 text-indigo-300' : 'hover:bg-slate-100 text-indigo-700'
                        }`}
                      >
                        <span className="truncate">↳ {otherNode?.label}</span>
                        <span className="opacity-50 text-[8px]">({otherNode?.type})</span>
                      </button>
                    );
                  })}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
