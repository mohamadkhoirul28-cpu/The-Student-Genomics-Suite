import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { TreeNode } from '../../types';
import { ZoomIn, ZoomOut, Move, RotateCcw, Download } from 'lucide-react';

interface PhyloTreeProps {
  treeData: TreeNode | null;
  onNodeClick?: (nodeId: string) => void;
  selectedNodeId?: string | null;
  locationColors?: Record<string, string> | null;
}

export default function PhyloTree({ treeData, onNodeClick, selectedNodeId, locationColors }: PhyloTreeProps) {
  const [layout, setLayout] = useState<'radial' | 'rectangular'>('radial');
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState({ x: 300, y: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoverNode, setHoverNode] = useState<d3.HierarchyPointNode<TreeNode> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-center on load
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setPan({ x: width / 2, y: height / 2 });
    }
  }, [layout, treeData]);

  if (!treeData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200">
        <p className="text-sm text-slate-500">Run the analysis pipeline to compile phylogenetic structures.</p>
      </div>
    );
  }

  // Define dimensions for layout
  const width = 600;
  const height = 600;
  const radius = width / 2 - 80;

  const root = d3.hierarchy<TreeNode>(treeData);

  // Initialize coordinate maps
  const points: {
    id: string;
    name: string;
    x: number;
    y: number;
    isLeaf: boolean;
    location?: string;
    bootstrap?: number;
    branchLength?: number;
    d3Node: d3.HierarchyPointNode<TreeNode>;
  }[] = [];

  const links: {
    source: { x: number; y: number };
    target: { x: number; y: number };
  }[] = [];

  if (layout === 'radial') {
    // 1. RADIAL LAYOUT
    const cluster = d3.cluster<TreeNode>().size([360, radius]);
    const clusterRoot = cluster(root);

    clusterRoot.descendants().forEach(d => {
      const angle = (d.x - 90) * Math.PI / 180;
      const r = d.y;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);

      points.push({
        id: d.data.id || d.data.name,
        name: d.data.name,
        x,
        y,
        isLeaf: !d.children,
        location: d.data.location,
        bootstrap: d.data.bootstrap,
        branchLength: d.data.branchLength,
        d3Node: d
      });
    });

    clusterRoot.links().forEach(link => {
      const angleSrc = (link.source.x - 90) * Math.PI / 180;
      const rSrc = link.source.y;
      const xSrc = rSrc * Math.cos(angleSrc);
      const ySrc = rSrc * Math.sin(angleSrc);

      const angleTgt = (link.target.x - 90) * Math.PI / 180;
      const rTgt = link.target.y;
      const xTgt = rTgt * Math.cos(angleTgt);
      const yTgt = rTgt * Math.sin(angleTgt);

      links.push({
        source: { x: xSrc, y: ySrc },
        target: { x: xTgt, y: yTgt }
      });
    });
  } else {
    // 2. RECTANGULAR LAYOUT
    const cluster = d3.cluster<TreeNode>().size([height - 80, width - 150]);
    const clusterRoot = cluster(root);

    clusterRoot.descendants().forEach(d => {
      // Rotate 90 deg so Root is on left, Leaves are on right
      const x = d.y - width / 2.5;
      const y = d.x - height / 2;

      points.push({
        id: d.data.id || d.data.name,
        name: d.data.name,
        x,
        y,
        isLeaf: !d.children,
        location: d.data.location,
        bootstrap: d.data.bootstrap,
        branchLength: d.data.branchLength,
        d3Node: d
      });
    });

    clusterRoot.links().forEach(link => {
      const xSrc = link.source.y - width / 2.5;
      const ySrc = link.source.x - height / 2;

      const xTgt = link.target.y - width / 2.5;
      const yTgt = link.target.x - height / 2;

      links.push({
        source: { x: xSrc, y: ySrc },
        target: { x: xTgt, y: yTgt }
      });
    });
  }

  // Location-based color mapper for Rusa Timorensis or multi-species barcoding
  function getNodeColor(location?: string, name?: string): string {
    if (location && locationColors && locationColors[location]) {
      return locationColors[location];
    }
    if (location && locationColors) {
      const matchedKey = Object.keys(locationColors).find(
        key => key.toLowerCase() === location.toLowerCase()
      );
      if (matchedKey) return locationColors[matchedKey];
    }

    if (!location || location === 'Unknown') {
      if (name?.includes('rusa') || name?.includes('Rusa')) return '#0F766E'; // primary sequence
      return '#94A3B8'; // gray
    }
    const locLower = location.toLowerCase();
    if (locLower.includes('alas') || locLower.includes('purwo')) return '#10B981'; // Alas Purwo: Emerald
    if (locLower.includes('baluran')) return '#EF4444'; // Baluran: Rose/Red
    if (locLower.includes('betiri') || locLower.includes('meru')) return '#F59E0B'; // Meru Betiri: Amber
    if (locLower.includes('bacterial') || locLower.includes('strain')) return '#3B82F6'; // Blue
    return '#14B8A6'; // Default teal
  }

  // Setup Drag Interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
    setZoom(z => Math.max(0.1, Math.min(3, z * zoomFactor)));
  };

  const resetViewport = () => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setPan({ x: width / 2, y: height / 2 });
      setZoom(0.85);
    }
  };

  // Download SVG
  const downloadSVG = () => {
    const svgElement = document.getElementById('phylo-tree-svg-root');
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `student_genomics_phylo_tree.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-800/40 overflow-hidden shadow-xs relative">
      
      {/* Top Toolbar controls */}
      <div className="p-3 border-b border-slate-100 dark:border-teal-900/40 bg-slate-50 dark:bg-slate-900/40 flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tree Layout:</span>
          <button
            onClick={() => setLayout('radial')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              layout === 'radial' 
                ? 'bg-teal-500 text-white' 
                : 'bg-white dark:bg-slate-850 hover:bg-slate-100 border border-slate-200 dark:border-teal-900/60 text-teal-950 dark:text-teal-200'
            }`}
          >
            Radial Dendrogram
          </button>
          <button
            onClick={() => setLayout('rectangular')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              layout === 'rectangular' 
                ? 'bg-teal-500 text-white' 
                : 'bg-white dark:bg-slate-850 hover:bg-slate-100 border border-slate-200 dark:border-teal-900/60 text-teal-950 dark:text-teal-200'
            }`}
          >
            Cladogram (Rect)
          </button>
        </div>

        <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-teal-900/40 p-1 rounded-lg">
          <button
            onClick={() => setZoom(z => Math.max(0.1, z - 0.15))}
            className="p-1 px-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.min(3, z + 0.15))}
            className="p-1 px-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={resetViewport}
            className="p-1 px-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded"
            title="Recenter"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-750 mx-1" />
          <button
            onClick={downloadSVG}
            className="p-1 px-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 rounded flex items-center space-x-1"
            title="Download SVG Layout"
          >
            <Download className="w-4 h-4" />
            <span className="text-[10px] font-bold">SVG</span>
          </button>
        </div>
      </div>

      {/* Main Canvas view */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden h-[450px] bg-slate-50 dark:bg-slate-900/20`}
      >
        <svg 
          id="phylo-tree-svg-root"
          className="w-full h-full select-none"
        >
          {/* Main Transformation Matrix */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            
            {/* 1. DRAW LINKS */}
            {links.map((link, idx) => {
              if (layout === 'radial') {
                return (
                  <line
                    key={`link-${idx}`}
                    x1={link.source.x}
                    y1={link.source.y}
                    x2={link.target.x}
                    y2={link.target.y}
                    stroke="#94A3B8"
                    strokeWidth={1.5}
                    strokeOpacity={0.75}
                  />
                );
              } else {
                // Cladogram horizontal -> vertical bracket joints
                return (
                  <path
                    key={`link-${idx}`}
                    d={`M ${link.source.x} ${link.source.y} L ${link.source.x} ${link.target.y} L ${link.target.x} ${link.target.y}`}
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth={1.5}
                    strokeOpacity={0.75}
                  />
                );
              }
            })}

            {/* 2. DRAW NODES AND LABELS */}
            {points.map((pt, idx) => {
              const color = getNodeColor(pt.location, pt.name);
              const isSelected = selectedNodeId === pt.id;
              
              // Angle for labels in radial layout
              let labelTransform = '';
              let horizontalTextAnchor = 'start';
              
              if (layout === 'radial') {
                const angleDeg = Math.atan2(pt.y, pt.x) * 180 / Math.PI;
                const rotate = (angleDeg > 90 || angleDeg < -90) ? angleDeg + 180 : angleDeg;
                horizontalTextAnchor = (angleDeg > 90 || angleDeg < -90) ? 'end' : 'start';
                labelTransform = `rotate(${rotate}) translate(${horizontalTextAnchor === 'start' ? 12 : -12}, 3)`;
              } else {
                labelTransform = 'translate(10, 3)';
              }

              return (
                <g 
                  key={`node-${idx}`} 
                  transform={`translate(${pt.x}, ${pt.y})`}
                  className="transition-all"
                  onMouseEnter={() => setHoverNode(pt.d3Node)}
                  onMouseLeave={() => setHoverNode(null)}
                  onClick={() => pt.isLeaf && onNodeClick?.(pt.id)}
                >
                  {/* Internal Nodes vs leaf nodes */}
                  {pt.isLeaf ? (
                    <circle
                      r={isSelected ? 6 : 4}
                      fill={color}
                      className="cursor-pointer stroke-white dark:stroke-slate-900 stroke-2 hover:scale-130 transition-all hover:fill-teal-400"
                    />
                  ) : (
                    <circle
                      r={3}
                      fill="#64748B" // Slate 500
                      className="cursor-pointer"
                    />
                  )}

                  {/* Node label text */}
                  {pt.isLeaf ? (
                    <text
                      transform={labelTransform}
                      textAnchor={horizontalTextAnchor as any}
                      className={`text-[9px] font-mono cursor-pointer select-none transition-colors ${
                        isSelected 
                          ? 'fill-teal-600 dark:fill-teal-300 font-bold' 
                          : 'fill-slate-700 dark:fill-slate-300 hover:fill-teal-500'
                      }`}
                    >
                      {pt.name}
                    </text>
                  ) : (
                    // Bootstrap support values display near branch joints
                    pt.bootstrap !== undefined && (
                      <text
                        x={-14}
                        y={-4}
                        className="text-[8px] fill-slate-400 font-mono scale-90"
                      >
                        {pt.bootstrap}
                      </text>
                    )
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Controls Overlay */}
        {locationColors && Object.keys(locationColors).length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col space-y-1.5 p-2 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-teal-900/60 rounded-lg shadow-sm z-10">
            <p className="text-[10px] font-bold text-teal-950 dark:text-teal-200 uppercase tracking-wider mb-1">Legend (Location)</p>
            {Object.entries(locationColors).map(([loc, color]) => (
              <div key={loc} className="flex items-center space-x-2 text-[10px] text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
                <span className="truncate max-w-[120px]">{loc}</span>
              </div>
            ))}
          </div>
        )}

        {/* Informative Tooltip on Hover */}
        {hoverNode && (
          <div 
            className="absolute bottom-3 right-3 p-3 bg-slate-950/90 text-white rounded-lg text-[10px] font-mono shadow-lg transition-opacity border border-slate-800 max-w-xs"
          >
            <p className="font-bold text-teal-300 border-b border-slate-850 pb-1 mb-1 truncate">
              {hoverNode.data.name}
            </p>
            {hoverNode.data.id && (
              <>
                <p><span className="text-slate-400">ID:</span> {hoverNode.data.id}</p>
                <p><span className="text-slate-400">Origin:</span> {hoverNode.data.location || 'Unknown'}</p>
              </>
            )}
            {hoverNode.data.branchLength !== undefined && (
              <p><span className="text-slate-400">Branch len:</span> {hoverNode.data.branchLength.toFixed(4)}</p>
            )}
            {hoverNode.data.bootstrap !== undefined && (
              <p><span className="text-slate-400">Bootstrap value:</span> {hoverNode.data.bootstrap}%</p>
            )}
            {!hoverNode.children && <p className="text-[9px] text-emerald-400/90 mt-1 uppercase font-bold">✓ Click leaf to edit metadata</p>}
          </div>
        )}
      </div>

    </div>
  );
}
