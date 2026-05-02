import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';
import {
  NODE_POSITIONS,
  NODES,
  SPRING_PAN,
  SPRING_SCALE,
} from './constants';
import type { FormValues, NodePosition } from './types';
import DoodleNode from './DoodleNode';
import NoodleConnections from './NoodleConnections';

interface DoodleCanvasProps {
  visibleNodes: Set<string>;
  drawnEdges: Set<string>;
  activeNode: string;
  step: number;
  values: FormValues;
  yesNoAnswers: Record<string, boolean | null>;
  onValueChange: (key: string, value: string) => void;
  onStart: () => void;
  onAdvance: (nodeId: string) => void;
  onYesNo: (nodeId: string, answer: boolean) => void;
  onChoice: (nodeId: string, value: string) => void;
  onNodeClick: (nodeId: string) => void;
  onFinish: () => void;
  onFileUpload: (file: File) => void;
  isUploading: boolean;
  onCustomerDataUpload: (file: File) => void;
  isCustomerDataUploading: boolean;
}

const CAMERA_GUIDE: Record<string, { x: number; y: number; scale: number }> = {
  start: { x: 18, y: 22, scale: 1.0 },
  productName: { x: 14, y: 16, scale: 1.03 },
  whatDoesItDo: { x: 12, y: 14, scale: 1.03 },
  whoIsItFor: { x: 12, y: 14, scale: 1.03 },
  hasDate: { x: 10, y: 14, scale: 1.03 },
  datePicker: { x: 10, y: 14, scale: 1.03 },
  hasBudget: { x: 10, y: 14, scale: 1.03 },
  howMuch: { x: 10, y: 12, scale: 1.03 },
  location: { x: 8, y: 14, scale: 1.03 },
  tone: { x: 8, y: 10, scale: 1.04 },
  attachDoc:    { x: 8, y: 12, scale: 1.03 },
  customerData: { x: 8, y: 12, scale: 1.03 },
  letsGo:       { x: 10, y: 12, scale: 1.04 },
};

const DoodleCanvas: React.FC<DoodleCanvasProps> = ({
  visibleNodes,
  drawnEdges,
  activeNode,
  step,
  values,
  yesNoAnswers,
  onValueChange,
  onStart,
  onAdvance,
  onYesNo,
  onChoice,
  onNodeClick,
  onFinish,
  onFileUpload,
  isUploading,
  onCustomerDataUpload,
  isCustomerDataUploading,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [editExpansion, setEditExpansion] = useState<{ nodeId: string; focused: boolean; width: number; height: number } | null>(null);
  const userDraggedRef = useRef(false);
  const hasDragMovedRef = useRef(false);
  const prevActiveNodeRef = useRef(activeNode);
  const panXAnimationRef = useRef<{ stop: () => void } | null>(null);
  const panYAnimationRef = useRef<{ stop: () => void } | null>(null);
  const scaleAnimationRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const renderPositions = useMemo<Record<string, NodePosition>>(() => {
    const next: Record<string, NodePosition> = Object.fromEntries(
      Object.entries(NODE_POSITIONS).map(([id, p]) => [id, { ...p }]),
    );

    if (!editExpansion?.focused || !visibleNodes.has(editExpansion.nodeId)) return next;

    const source = next[editExpansion.nodeId];
    if (!source) return next;

    const influenceRadius = Math.max(editExpansion.width, editExpansion.height) * 0.95;
    const pushFactor = 0.45;
    for (const id of visibleNodes) {
      if (id === editExpansion.nodeId) continue;
      const p = next[id];
      if (!p) continue;
      const dx = p.x - source.x;
      const dy = p.y - source.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist >= influenceRadius) continue;
      const unitX = dx / dist;
      const unitY = dy / dist;
      const push = (influenceRadius - dist) * pushFactor;
      p.x += unitX * push;
      p.y += unitY * push;
    }
    return next;
  }, [editExpansion, visibleNodes]);

  const activePos = renderPositions[activeNode] || renderPositions.start || NODE_POSITIONS.start;
  const initialGuide = CAMERA_GUIDE[activeNode] || CAMERA_GUIDE.start;

  const panX = useMotionValue(viewport.w / 2 - (activePos.x + initialGuide.x));
  const panY = useMotionValue(viewport.h / 2 - (activePos.y + initialGuide.y));
  const springScale = useSpring(1.0, SPRING_SCALE);

  useEffect(() => {
    if (prevActiveNodeRef.current !== activeNode) {
      userDraggedRef.current = false;
      prevActiveNodeRef.current = activeNode;
    }
    if (userDraggedRef.current) return;

    const pos = renderPositions[activeNode] || renderPositions.start || NODE_POSITIONS.start;
    const guide = CAMERA_GUIDE[activeNode] || CAMERA_GUIDE.start;
    const targetX = viewport.w / 2 - (pos.x + guide.x);
    const targetY = viewport.h / 2 - (pos.y + guide.y);

    panXAnimationRef.current?.stop();
    panYAnimationRef.current?.stop();
    scaleAnimationRef.current?.stop();
    panXAnimationRef.current = animate(panX, targetX, {
      type: 'spring',
      stiffness: SPRING_PAN.stiffness,
      damping: SPRING_PAN.damping,
      restSpeed: 0.5,
      restDelta: 0.5,
    });
    panYAnimationRef.current = animate(panY, targetY, {
      type: 'spring',
      stiffness: SPRING_PAN.stiffness,
      damping: SPRING_PAN.damping,
      restSpeed: 0.5,
      restDelta: 0.5,
    });
    scaleAnimationRef.current = animate(springScale, guide.scale, {
      type: 'spring',
      stiffness: SPRING_SCALE.stiffness,
      damping: SPRING_SCALE.damping,
      restSpeed: 0.002,
      restDelta: 0.002,
    });
  }, [activeNode, viewport, panX, panY, springScale, renderPositions]);

  useEffect(() => {
    if (step === 0) {
      springScale.set(1.0);
    }
  }, [step, springScale]);

  const handleDragStart = useCallback(() => {
    if (isInputFocused) return;
    hasDragMovedRef.current = false;
    setIsDragging(true);
  }, [isInputFocused]);

  const handleDrag = useCallback(() => {
    if (isInputFocused || hasDragMovedRef.current) return;
    panXAnimationRef.current?.stop();
    panYAnimationRef.current?.stop();
    scaleAnimationRef.current?.stop();
    userDraggedRef.current = true;
    hasDragMovedRef.current = true;
  }, [isInputFocused]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputFocusStateChange = useCallback((focused: boolean) => {
    setIsInputFocused(focused);
    if (focused) {
      setIsDragging(false);
    }
  }, []);

  const handleEditFocusChange = useCallback(
    (payload: { nodeId: string; focused: boolean; width: number; height: number } | null) => {
      setEditExpansion(payload);
    },
    []
  );

  const dragConstraints = useMemo(() => {
    const nodeIds = Array.from(visibleNodes);
    if (nodeIds.length === 0) return { left: 0, right: 0, top: 0, bottom: 0 };

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const id of nodeIds) {
      const n = renderPositions[id];
      if (!n) continue;
      minX = Math.min(minX, n.x - n.r);
      maxX = Math.max(maxX, n.x + n.r);
      minY = Math.min(minY, n.y - n.r);
      maxY = Math.max(maxY, n.y + n.r);
    }

    const padX = viewport.w * 0.3;
    const padY = viewport.h * 0.15;

    return {
      left: -(maxX - viewport.w + padX),
      right: -minX + padX,
      top: -(maxY - viewport.h + padY),
      bottom: -minY + padY,
    };
  }, [visibleNodes, viewport, renderPositions]);

  const worldSize = useMemo(() => {
    const allNodes = Object.values(renderPositions);
    const maxX = Math.max(...allNodes.map((n) => n.x + n.r));
    const maxY = Math.max(...allNodes.map((n) => n.y + n.r));
    const minWidth = viewport.w * 1.9;
    const minHeight = viewport.h * 1.8;
    return {
      w: Math.max(minWidth, maxX + 650),
      h: Math.max(minHeight, maxY + 650),
    };
  }, [viewport, renderPositions]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        cursor: isInputFocused ? 'default' : (isDragging ? 'grabbing' : 'grab'),
      }}
    >
      <motion.div
        drag={!isInputFocused}
        dragElastic={0.02}
        dragMomentum={false}
        dragConstraints={dragConstraints}
        dragTransition={{ power: 0.1, timeConstant: 320 }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{
          x: panX,
          y: panY,
          scale: springScale,
          position: 'absolute',
          width: worldSize.w,
          height: worldSize.h,
          background: 'transparent',
          willChange: 'transform',
        }}
      >
        <NoodleConnections drawnEdges={drawnEdges} yesNoAnswers={yesNoAnswers} nodePositions={renderPositions} />

        {NODES.map((node) => (
          <DoodleNode
            key={node.id}
            node={node}
            position={renderPositions[node.id] || NODE_POSITIONS[node.id]}
            isVisible={visibleNodes.has(node.id)}
            isActive={activeNode === node.id}
            values={values}
            yesNoAnswers={yesNoAnswers}
            onValueChange={onValueChange}
            onAdvance={onAdvance}
            onYesNo={onYesNo}
            onChoice={onChoice}
            onStart={onStart}
            onNodeClick={onNodeClick}
            onEditFocusChange={handleEditFocusChange}
            onInputFocusStateChange={handleInputFocusStateChange}
            onFinish={onFinish}
            onFileUpload={onFileUpload}
            isUploading={isUploading}
            onCustomerDataUpload={onCustomerDataUpload}
            isCustomerDataUploading={isCustomerDataUploading}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default DoodleCanvas;
