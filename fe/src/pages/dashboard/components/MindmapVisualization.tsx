import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookOpen, Target, Activity } from "lucide-react";

export const MindmapVisualization = ({ cpl, mkData }: { cpl: any, mkData: any[] }) => {
    const [mounted, setMounted] = useState(false);
    
    // Drag state
    const [offsets, setOffsets] = useState<Record<string, {x: number, y: number}>>({});
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
    
    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!draggingId) return;
        
        const handleGlobalMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            setOffsets(prev => ({
                ...prev,
                [draggingId]: {
                    x: dragStart.offsetX + dx,
                    y: dragStart.offsetY + dy
                }
            }));
        };
        
        const handleGlobalMouseUp = () => {
            setDraggingId(null);
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [draggingId, dragStart]);

    const handleMouseDown = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        setDraggingId(id);
        const currOffset = offsets[id] || { x: 0, y: 0 };
        setDragStart({ 
            x: e.clientX, 
            y: e.clientY,
            offsetX: currOffset.x,
            offsetY: currOffset.y
        });
    };

    const nodes = useMemo(() => {
        if (cpl?.mataKuliah && cpl.mataKuliah.length > 0) {
            return cpl.mataKuliah.map((item: any) => ({
                id: item.mataKuliah?.kodeMk || Math.random().toString(),
                label: item.mataKuliah?.namaMk || 'Unknown MK',
                kode: item.mataKuliah?.kodeMk || '',
                bobot: item.bobotKontribusi || 0,
                sks: item.mataKuliah?.sks || 0
            }));
        }
        if (mkData && mkData.length > 0) {
            return mkData.map((item: any) => ({
                id: item.name,
                label: item.name,
                kode: item.kode || '',
                bobot: 0,
                nilai: item.nilai,
                sks: 0
            }));
        }
        return [];
    }, [cpl, mkData]);

    if (nodes.length === 0) {
        return (
            <Card className="border-none shadow-md overflow-hidden bg-gradient-to-br from-background to-muted/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-primary">
                        <Target className="w-6 h-6" />
                        Peta Relasi Pembelajaran
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[400px] flex flex-col items-center justify-center p-6 m-6 rounded-2xl border border-dashed border-primary/20 bg-primary/5">
                    <Activity className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground font-medium">Belum ada pemetaan mata kuliah</p>
                </CardContent>
            </Card>
        );
    }

    const totalNodes = nodes.length;
    const isDense = totalNodes > 5;

    const centerOffsetX = offsets["center"]?.x || 0;
    const centerOffsetY = offsets["center"]?.y || 0;

    return (
        <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
            {/* Standard Header */}
            <CardHeader className="border-b border-border/40 pb-4 bg-muted/10 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 drop-shadow-sm">
                            <Target className="w-5 h-5 text-primary" />
                            Peta Relasi Pembelajaran
                        </CardTitle>
                        <CardDescription className="mt-1.5 text-sm font-medium">
                            Visualisasi interaktif relasi antara CPL dan Mata Kuliah pendukung. Tarik card untuk menyesuaikan posisi.
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-background/50 border-primary/20 text-primary shadow-sm">
                        {nodes.length} Mata Kuliah
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-0 relative">
                
                {/* Background Grid & Effects */}
                <div className="absolute inset-0 bg-grid-slate-200/20 dark:bg-grid-slate-800/20 bg-[length:30px_30px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
                
                <div className="relative w-full h-[850px] overflow-hidden flex items-center justify-center"
                     style={{ cursor: draggingId ? 'grabbing' : 'default' }}>
                    
                    {/* SVG Connections with Bezier Curves */}
                    <svg 
                        viewBox="-1000 -1000 2000 2000" 
                        className={cn(
                            "absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2000px] h-[2000px] pointer-events-none overflow-visible",
                            isDense ? "top-1/2" : "top-[70%]"
                        )}
                        style={{ zIndex: 1 }}
                    >
                        <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                            </linearGradient>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {nodes.map((node: any, index: number) => {
                            const angleSpread = isDense ? 2 * Math.PI : Math.PI; 
                            const angleOffset = isDense ? -Math.PI/2 : Math.PI; 
                            
                            let angle = 0;
                            if (isDense) {
                                angle = (index / totalNodes) * angleSpread + angleOffset;
                            } else {
                                angle = Math.PI + (Math.PI / (totalNodes + 1)) * (index + 1);
                            }
                            
                            const baseRadius = 280;
                            const stagger = isDense ? (index % 2 === 0 ? 50 : -50) : 0;
                            const radius = baseRadius + stagger;
                            
                            const startX = centerOffsetX; 
                            const startY = centerOffsetY; 
                            
                            const nodeOffsetX = offsets[`node-${index}`]?.x || 0;
                            const nodeOffsetY = offsets[`node-${index}`]?.y || 0;
                            
                            const endX = (Math.cos(angle) * radius) + nodeOffsetX;
                            const endY = (Math.sin(angle) * radius) + nodeOffsetY;

                            // Control points for organic bezier curves
                            const cp1X = startX + (endX - startX) * 0.4;
                            const cp1Y = startY + (endY - startY) * 0.1;
                            const cp2X = startX + (endX - startX) * 0.6;
                            const cp2Y = endY;

                            const pathData = `M ${startX} ${startY} C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${endX} ${endY}`;

                            return (
                                <g key={`path-${index}`} className={cn("transition-all duration-1000 ease-out", mounted && !draggingId ? "opacity-100" : "opacity-0")} style={{ transitionDelay: `${index * 50}ms` }}>
                                    <path
                                        d={pathData}
                                        fill="none"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth="4"
                                        strokeOpacity="0.05"
                                    />
                                    <path
                                        id={`animated-path-${index}`}
                                        d={pathData}
                                        fill="none"
                                        stroke="url(#lineGradient)"
                                        strokeWidth="2"
                                        strokeDasharray="6 6"
                                        className="animate-pulse"
                                        style={{ animationDuration: `${3 + index % 2}s` }}
                                    />
                                    {mounted && !draggingId && (
                                        <circle r="4" fill="hsl(var(--primary))" filter="url(#glow)">
                                            <animateMotion
                                                dur={`${4 + (index % 3)}s`}
                                                repeatCount="indefinite"
                                            >
                                                <mpath href={`#animated-path-${index}`} />
                                            </animateMotion>
                                        </circle>
                                    )}
                                </g>
                            );
                        })}
                        
                        {/* Static lines for while dragging */}
                        {draggingId && nodes.map((node: any, index: number) => {
                            const angleSpread = isDense ? 2 * Math.PI : Math.PI; 
                            const angleOffset = isDense ? -Math.PI/2 : Math.PI; 
                            
                            let angle = 0;
                            if (isDense) {
                                angle = (index / totalNodes) * angleSpread + angleOffset;
                            } else {
                                angle = Math.PI + (Math.PI / (totalNodes + 1)) * (index + 1);
                            }
                            
                            const baseRadius = 280;
                            const stagger = isDense ? (index % 2 === 0 ? 50 : -50) : 0;
                            const radius = baseRadius + stagger;
                            
                            const startX = centerOffsetX; 
                            const startY = centerOffsetY; 
                            
                            const nodeOffsetX = offsets[`node-${index}`]?.x || 0;
                            const nodeOffsetY = offsets[`node-${index}`]?.y || 0;
                            
                            const endX = (Math.cos(angle) * radius) + nodeOffsetX;
                            const endY = (Math.sin(angle) * radius) + nodeOffsetY;
                            
                            const cp1X = startX + (endX - startX) * 0.4;
                            const cp1Y = startY + (endY - startY) * 0.1;
                            const cp2X = startX + (endX - startX) * 0.6;
                            const cp2Y = endY;

                            return (
                                <path
                                    key={`static-path-${index}`}
                                    d={`M ${startX} ${startY} C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${endX} ${endY}`}
                                    fill="none"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth="2"
                                    strokeOpacity="0.4"
                                    strokeDasharray="6 6"
                                />
                            );
                        })}
                    </svg>

                    {/* Central CPL Node */}
                    <div 
                        onMouseDown={(e) => handleMouseDown(e, "center")}
                        className={cn(
                            "absolute z-20 flex items-center justify-center transition-all duration-100 ease-out left-1/2",
                            isDense ? "top-1/2" : "top-[70%]",
                            mounted ? "scale-100 opacity-100" : "scale-50 opacity-0",
                            draggingId === "center" ? "cursor-grabbing" : "cursor-grab hover:scale-105"
                        )}
                        style={{
                            transform: `translate(calc(-50% + ${centerOffsetX}px), calc(-50% + ${centerOffsetY}px)) scale(${mounted ? 1 : 0.5})`
                        }}
                    >
                        {/* Glow effect behind */}
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse pointer-events-none" />
                        
                        {/* Node Body */}
                        <div className="relative flex flex-col items-center justify-center w-32 h-32 bg-gradient-to-br from-primary to-blue-600 text-primary-foreground rounded-full shadow-[0_0_30px_rgba(var(--primary),0.3)] border-4 border-background ring-4 ring-primary/20">
                            <span className="font-bold text-3xl tracking-wider pointer-events-none">{cpl?.kodeCpl}</span>
                        </div>
                    </div>

                    {/* Child MK Nodes */}
                    {nodes.map((node: any, index: number) => {
                        const angleSpread = isDense ? 2 * Math.PI : Math.PI; 
                        const angleOffset = isDense ? -Math.PI/2 : Math.PI;
                        
                        let angle = 0;
                        if (isDense) {
                            angle = (index / totalNodes) * angleSpread + angleOffset;
                        } else {
                            angle = Math.PI + (Math.PI / (totalNodes + 1)) * (index + 1);
                        }
                        
                        const baseRadius = 280;
                        const stagger = isDense ? (index % 2 === 0 ? 50 : -50) : 0;
                        const currentRadius = baseRadius + stagger;
                        
                        const nodeOffsetX = offsets[`node-${index}`]?.x || 0;
                        const nodeOffsetY = offsets[`node-${index}`]?.y || 0;
                        
                        const translateX = (Math.cos(angle) * currentRadius) + nodeOffsetX;
                        const translateY = (Math.sin(angle) * currentRadius) + nodeOffsetY;
                        
                        const isDraggingThis = draggingId === `node-${index}`;

                        return (
                            <div 
                                key={`node-${index}`}
                                onMouseDown={(e) => handleMouseDown(e, `node-${index}`)}
                                className={cn(
                                    "absolute flex flex-col items-center justify-center p-4 bg-background/90 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-xl transition-all duration-100 ease-out w-[190px]",
                                    isDraggingThis ? "z-50 cursor-grabbing border-primary scale-105 shadow-2xl" : "z-30 cursor-grab hover:-translate-y-1 hover:border-primary/50 hover:shadow-primary/30 group hover:z-40",
                                    mounted ? "opacity-100" : "opacity-0"
                                )}
                                style={{ 
                                    left: "50%", 
                                    top: isDense ? "50%" : "70%",
                                    transform: `translate(-50%, -50%) translate(${translateX}px, ${translateY}px) scale(${mounted ? (isDraggingThis ? 1.05 : 1) : 0.5})`,
                                    transitionDelay: mounted || draggingId ? '0ms' : `${300 + index * 50}ms`
                                }}
                            >
                                <div className="flex flex-col items-center justify-center gap-2.5 w-full pointer-events-none">
                                    {node.kode && (
                                        <Badge variant="outline" className="text-xs bg-primary/5 font-mono px-2.5 py-0.5 border-primary/20 text-primary">
                                            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                                            {node.kode}
                                        </Badge>
                                    )}
                                    
                                    <span className="text-sm font-semibold leading-snug text-center text-foreground/90 group-hover:text-primary transition-colors">
                                        {node.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
