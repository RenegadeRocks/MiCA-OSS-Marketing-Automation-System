import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MICA_ORANGE, MICA_ORANGE_GLOW } from './constants';
import { DEMO_MODE_ENABLED } from '../../../data/demoData';
import type { NodeDef, FormValues, NodePosition } from './types';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}


function seededWobble(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  const r = (min: number, max: number) => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h = (h ^ (h >>> 16)) >>> 0;
    return min + (h % 1000) / 1000 * (max - min);
  };
  return {
    borderRadius: `${r(42, 58)}% ${r(42, 58)}% ${r(42, 58)}% ${r(42, 58)}% / ${r(42, 58)}% ${r(42, 58)}% ${r(42, 58)}% ${r(42, 58)}%`,
  };
}

function getDateBounds() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const future = new Date(now);
  future.setFullYear(future.getFullYear() + 1);
  const maxDate = future.toISOString().split('T')[0];
  return { today, maxDate };
}

function isBudgetValid(val: string): boolean {
  if (!val.trim()) return false;
  const num = Number(val);
  return !isNaN(num) && num >= 100 && num <= 1000000;
}


interface DoodleNodeProps {
  node: NodeDef;
  position: NodePosition;
  isVisible: boolean;
  isActive: boolean;
  values: FormValues;
  yesNoAnswers: Record<string, boolean | null>;
  onValueChange: (key: string, value: string) => void;
  onAdvance: (nodeId: string) => void;
  onYesNo: (nodeId: string, answer: boolean) => void;
  onChoice: (nodeId: string, value: string) => void;
  onStart: () => void;
  onNodeClick: (nodeId: string) => void;
  onEditFocusChange: (payload: { nodeId: string; focused: boolean; width: number; height: number } | null) => void;
  onInputFocusStateChange: (focused: boolean) => void;
  onFinish: () => void;
  onFileUpload: (file: File) => void;
  isUploading: boolean;
  onCustomerDataUpload: (file: File) => void;
  isCustomerDataUploading: boolean;
}

const DoodleNode: React.FC<DoodleNodeProps> = ({
  node,
  position,
  isVisible,
  isActive,
  values,
  yesNoAnswers,
  onValueChange,
  onAdvance,
  onYesNo,
  onChoice,
  onStart,
  onNodeClick,
  onEditFocusChange,
  onInputFocusStateChange,
  onFinish,
  onFileUpload,
  isUploading,
  onCustomerDataUpload,
  isCustomerDataUploading,
}) => {
  const pos = position;

  const wobble = useMemo(() => seededWobble(node.id), [node.id]);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customerFileInputRef = useRef<HTMLInputElement>(null);

  const isStart = node.id === 'start';
  const isLetsGo = node.id === 'letsGo';
  const isActionButton = isStart || isLetsGo;
  const currentValue = node.valueKey ? values[node.valueKey as keyof FormValues] : '';
  const isToneChoiceActive = isActive && node.id === 'tone' && node.inputType === 'choice';
  const yesNoAnswer = yesNoAnswers[node.id] ?? null;
  const isTypingNode = !isActionButton && (node.inputType === 'text' || node.inputType === 'textarea');
  const isExpandableTypingNode = isTypingNode && node.id !== 'howMuch';
  const [isFieldFocused, setIsFieldFocused] = useState(false);
  const [typingBoostActive, setTypingBoostActive] = useState(false);
  const [locationCityMode, setLocationCityMode] = useState(false);
  const typingBoostTimeoutRef = useRef<number | null>(null);
  const [visibleLineCount, setVisibleLineCount] = useState(1);
  const [lineOverflowed, setLineOverflowed] = useState(false);
  const valueLength = currentValue.trim().length;
  const shouldMorphToRect = isActive && isExpandableTypingNode && isFieldFocused;
  const isLocationButtonMode = isActive && node.id === 'location' && !locationCityMode;
  const isRectLikeNode = shouldMorphToRect || isToneChoiceActive;
  const lineGrowthPx = node.inputType === 'textarea' ? 28 : 30;

  const collapsedSize = 200;
  const activeCircleSize = 260;
  const expandedMinWidth = node.inputType === 'textarea' ? 390 : 350;
  const expandedMaxWidth = node.inputType === 'textarea' ? 700 : 620;
  const expandedWidth = clamp(280 + valueLength * 6 + (visibleLineCount - 1) * 10, expandedMinWidth, expandedMaxWidth);
  const expandedBaseHeight = node.inputType === 'textarea' ? 208 : 196;
  const expandedHeight = clamp(
    expandedBaseHeight + Math.max(0, visibleLineCount - 1) * lineGrowthPx + (currentValue.trim() ? 34 : 0),
    node.inputType === 'textarea' ? 240 : 228,
    420,
  );

  const nodeWidth = isStart
    ? pos.r * 2
    : isLetsGo
      ? pos.r * 3
    : isToneChoiceActive
      ? 540
    : isLocationButtonMode
      ? 300
    : (shouldMorphToRect ? expandedWidth : isActive ? activeCircleSize : collapsedSize);
  const nodeHeight = isStart
    ? pos.r * 2
    : isLetsGo
      ? pos.r * 3
    : isToneChoiceActive
      ? (currentValue === 'Custom' ? 640 : 520)
    : isLocationButtonMode
      ? 300
    : (shouldMorphToRect ? expandedHeight : isActive ? activeCircleSize : collapsedSize);
  const nodeBorderRadius = isStart
    ? wobble.borderRadius
    : isLetsGo
      ? '50%'
    : (shouldMorphToRect ? 34 : wobble.borderRadius);


  useEffect(() => {
    if (isActive && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 500);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {
      onInputFocusStateChange(false);
      setLocationCityMode(false);
    }
  }, [isActive, onInputFocusStateChange]);

  useEffect(() => {
    if (locationCityMode && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [locationCityMode]);

  useEffect(() => () => {
    if (typingBoostTimeoutRef.current != null) window.clearTimeout(typingBoostTimeoutRef.current);
  }, []);

  const floatAmplitude = isLetsGo ? 7 : (isToneChoiceActive ? 5 : 3.5);
  const floatDuration = 3.6 + ((node.id.charCodeAt(0) % 8) * 0.19);
  const floatDelay = (node.id.charCodeAt(node.id.length - 1) % 5) * 0.16;

  useEffect(() => {
    if (!isActive || !isExpandableTypingNode || !(inputRef.current instanceof HTMLTextAreaElement)) return;
    const el = inputRef.current;
    const computed = window.getComputedStyle(el);
    const lineHeight = parseFloat(computed.lineHeight) || (node.inputType === 'textarea' ? 28 : 30);
    const padTop = parseFloat(computed.paddingTop) || 0;
    const padBottom = parseFloat(computed.paddingBottom) || 0;
    const verticalPad = padTop + padBottom;

    el.style.height = 'auto';
    const rawLines = Math.max(1, Math.round((el.scrollHeight - verticalPad) / lineHeight));
    const nextVisible = Math.min(5, rawLines);
    const isOverflowing = rawLines > 5;
    setVisibleLineCount(nextVisible);
    setLineOverflowed(isOverflowing);
    el.style.height = `${nextVisible * lineHeight + verticalPad}px`;
    el.style.overflowY = isOverflowing ? 'auto' : 'hidden';
  }, [currentValue, isActive, isExpandableTypingNode, node.inputType]);

  const dateBounds = useMemo(() => getDateBounds(), []);

  const budgetNum = node.id === 'howMuch' ? Number(currentValue) : 0;
  const budgetOutOfRange = node.id === 'howMuch' && currentValue.trim() !== '' && !isBudgetValid(currentValue);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!e.ctrlKey && !e.altKey && !e.metaKey && (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete')) {
      setTypingBoostActive(true);
      if (typingBoostTimeoutRef.current != null) window.clearTimeout(typingBoostTimeoutRef.current);
      typingBoostTimeoutRef.current = window.setTimeout(() => setTypingBoostActive(false), 500);
    }
    if (e.key === 'Enter') {
      if (node.inputType === 'textarea' && !e.shiftKey) {
        e.preventDefault();
        onAdvance(node.id);
      } else if (node.inputType === 'text' && node.id !== 'howMuch') {
        e.preventDefault();
        onAdvance(node.id);
      } else if (node.inputType !== 'textarea') {
        if (node.id === 'howMuch' && !isBudgetValid(currentValue)) return;
        onAdvance(node.id);
      }
    }
  };

  const handleBudgetChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (node.valueKey) onValueChange(node.valueKey, raw);
  }, [node.valueKey, onValueChange]);

  const blockCanvasDragFromInput = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
  };

  const handleFieldFocus = () => {
    setIsFieldFocused(true);
    onInputFocusStateChange(true);
  };

  const handleFieldBlur = () => {
    setIsFieldFocused(false);
    onInputFocusStateChange(false);
  };

  const handleNodeBodyClick = () => {
    if (!isActive && isVisible && !isActionButton) {
      onNodeClick(node.id);
    }
  };

  const handleAttachYes = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
  };

  const handleCustomerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onCustomerDataUpload(file);
  };

  useEffect(() => {
    if (!isExpandableTypingNode || !isActive || !isFieldFocused) {
      onEditFocusChange(null);
      return;
    }
    onEditFocusChange({
      nodeId: node.id,
      focused: true,
      width: nodeWidth,
      height: nodeHeight,
    });
  }, [isActive, isExpandableTypingNode, isFieldFocused, node.id, nodeWidth, nodeHeight, onEditFocusChange]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          data-eyeball-avoid={isActive ? 'true' : undefined}
          style={{
            position: 'absolute',
            left: pos.x - nodeWidth / 2,
            top: pos.y - nodeHeight / 2,
            width: nodeWidth,
            height: nodeHeight,
            borderRadius: nodeBorderRadius,
            transition: 'left 0.4s cubic-bezier(0.4,0,0.2,1), top 0.4s cubic-bezier(0.4,0,0.2,1), width 0.4s cubic-bezier(0.4,0,0.2,1), height 0.4s cubic-bezier(0.4,0,0.2,1), border-radius 0.4s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <div
            className="doodle-floating-node"
            style={{
              width: '100%',
              height: '100%',
              ['--float-amplitude' as string]: `${floatAmplitude}px`,
              ['--float-duration' as string]: `${floatDuration}s`,
              ['--float-delay' as string]: `${floatDelay}s`,
            } as React.CSSProperties}
          >
          {/* Ripple highlights active nodes; LET'S GO keeps attention pulse while visible */}
          {!isToneChoiceActive && (isActive || isLetsGo) && (
            <div
              className={`doodle-ripple ${isRectLikeNode ? 'doodle-ripple-box' : 'doodle-ripple-circle'} ${isLetsGo ? 'doodle-ripple-fast' : ''} ${isStart && isActive ? 'doodle-ripple-start' : ''} ${typingBoostActive && isTypingNode ? 'doodle-ripple-typing-boost' : ''}`}
            />
          )}


          {/* Start node floats gently to feel \"alive\" */}
          {isStart ? (
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
              onClick={handleNodeBodyClick}
              style={{
                width: '100%',
                height: '100%',
                ...wobble,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${MICA_ORANGE}, #FF4400)`,
                border: '3px solid rgba(255,200,80,0.85)',
                boxShadow: `0 0 18px rgba(255,180,50,0.7), 0 0 48px rgba(255,120,0,0.5), inset 0 0 20px rgba(255,200,80,0.15)`,
                backdropFilter: 'blur(12px)',
                padding: 0,
                cursor: 'pointer',
                transition: 'box-shadow 0.3s ease',
              }}
            >
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div onClick={onStart} style={{ textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-1px' }}>
                    Start
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
          <div
            onClick={handleNodeBodyClick}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: nodeBorderRadius,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isLetsGo ? 'center' : 'flex-start',
              overflow: node.id === 'tone' && isActive ? 'visible' : 'hidden',
              // All non-start nodes use the same orange/white branding
              background: isToneChoiceActive ? 'transparent' : `linear-gradient(135deg, ${MICA_ORANGE}, #FF4400)`,
              border: isToneChoiceActive ? 'none' : (isLetsGo ? '3px solid rgba(255,200,80,0.85)' : (isActionButton ? 'none' : `2px solid ${MICA_ORANGE}`)),
              boxShadow: isLetsGo
                ? `0 0 18px rgba(255,180,50,0.7), 0 0 48px rgba(255,120,0,0.5), inset 0 0 20px rgba(255,200,80,0.15)`
                : isActionButton
                ? `0 0 40px rgba(255,90,0,0.45)`
                : isToneChoiceActive
                  ? 'none'
                : isActive
                  ? `0 0 0 3px ${MICA_ORANGE_GLOW}, 0 0 36px rgba(255,122,0,0.25)`
                  : `0 0 22px rgba(255,122,0,0.18)`,
              backdropFilter: 'blur(12px)',
              padding: isToneChoiceActive ? 0 : (isActionButton ? 0 : (isActive ? 20 : 14)),
              cursor: isActionButton ? 'pointer' : (!isActive ? 'pointer' : 'default'),
              transition: 'box-shadow 0.3s ease, border-radius 0.4s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: isLetsGo ? 'center' : 'flex-start',
                gap: 8,
                paddingTop: isLetsGo ? 0 : (isToneChoiceActive ? 0 : (isActive ? 6 : 12)),
              }}
            >

            {isLetsGo && (
              <div onClick={onFinish} style={{ textAlign: 'center', cursor: 'pointer', padding: '0 18px' }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
                  {DEMO_MODE_ENABLED() ? 'Generate Campaign' : 'Generate tone preview'}
                </div>
              </div>
            )}

            {!isActionButton && (
              <>
                {/* Heading label (e.g. CAMPAIGN NAME, WHAT'S THIS FOR?) – match Start style */}
                {!isToneChoiceActive && (
                  <div style={{
                    fontSize: !isActive && node.label.length >= 12 ? 21 : 28,
                    fontWeight: 800,
                    letterSpacing: !isActive && node.label.length >= 12 ? '-0.4px' : '-1px',
                    textTransform: 'none',
                    color: '#ffffff',
                    textAlign: 'center',
                    lineHeight: !isActive && node.label.length >= 12 ? 1.03 : 1.1,
                    maxWidth: '94%',
                  }}>
                    {node.label}
                  </div>
                )}

                {!isActive && currentValue && (
                  <div className="doodle-scrollable" style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: 'rgba(255, 233, 214, 0.95)',
                    textAlign: 'center',
                    maxWidth: '92%',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                    lineHeight: 1.35,
                    maxHeight: 'calc(1.35em * 5)',
                    overflowY: 'auto',
                    paddingRight: 6,
                  }}>
                    {currentValue}
                  </div>
                )}

                {!isActive && node.inputType === 'yesno' && yesNoAnswer !== null && (
                  <div className="doodle-scrollable" style={{ fontSize: 13, fontWeight: 700, color: '#fff', textAlign: 'center', maxWidth: '92%', lineHeight: 1.2, maxHeight: 56, overflowY: 'auto', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                    {node.id === 'attachDoc'
                      ? (yesNoAnswer ? values.attachedDocName || 'Attached' : 'Skipped')
                      : node.id === 'customerData'
                        ? (yesNoAnswer ? values.customerDataName || 'Attached' : 'Skipped')
                        : (yesNoAnswer ? 'Yes' : 'No')
                    }
                  </div>
                )}

                {isActive && node.inputType === 'text' && node.id !== 'howMuch' && node.id !== 'location' && (
                  <div
                    style={{ width: '90%', textAlign: 'center' }}
                    onPointerDown={blockCanvasDragFromInput}
                    onMouseDown={blockCanvasDragFromInput}
                    onTouchStart={blockCanvasDragFromInput}
                  >
                    <textarea
                      ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                      value={currentValue}
                      onChange={(e) => node.valueKey && onValueChange(node.valueKey, e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={handleFieldFocus}
                      onBlur={handleFieldBlur}
                      placeholder={node.placeholder}
                      rows={1}
                      className="doodle-node-textarea doodle-scrollable"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1.5px solid rgba(255,255,255,0.38)',
                        color: 'rgba(255, 244, 233, 0.98)',
                        fontFamily: "'Inter', sans-serif",
                        textAlign: 'center',
                        outline: 'none',
                        width: '100%',
                        padding: '8px 6px 6px',
                        fontSize: 22,
                        fontWeight: 700,
                        lineHeight: 1.35,
                        resize: 'none',
                        overflowY: lineOverflowed ? 'auto' : 'hidden',
                        maxHeight: 168,
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                      }}
                    />
                    {currentValue.trim() && (
                      <div
                        onClick={() => onAdvance(node.id)}
                        style={{ fontSize: 18, color: '#fff', background: 'transparent', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 9999, padding: '12px 32px', cursor: 'pointer', fontWeight: 700, marginTop: 12 }}
                      >
                        press Enter ↓
                      </div>
                    )}
                  </div>
                )}

                {isActive && node.id === 'location' && !locationCityMode && (
                  <div style={{ display: 'flex', gap: 18, marginTop: 14 }}>
                    <button
                      type="button"
                      onClick={() => { onValueChange('location', ''); setLocationCityMode(true); }}
                      style={{
                        padding: '14px 38px',
                        borderRadius: 9999,
                        border: '2px solid rgba(255,255,255,0.4)',
                        background: 'transparent',
                        color: '#fff',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 20,
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      City
                    </button>
                    <button
                      type="button"
                      onClick={() => { onValueChange('location', 'Online'); onAdvance(node.id); }}
                      style={{
                        padding: '14px 38px',
                        borderRadius: 9999,
                        border: '2px solid rgba(255,255,255,0.4)',
                        background: 'transparent',
                        color: '#fff',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 20,
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      Online
                    </button>
                  </div>
                )}

                {isActive && node.id === 'location' && locationCityMode && (
                  <div
                    style={{ width: '90%', textAlign: 'center' }}
                    onPointerDown={blockCanvasDragFromInput}
                    onMouseDown={blockCanvasDragFromInput}
                    onTouchStart={blockCanvasDragFromInput}
                  >
                    <textarea
                      ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                      value={currentValue}
                      onChange={(e) => node.valueKey && onValueChange(node.valueKey, e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={handleFieldFocus}
                      onBlur={handleFieldBlur}
                      placeholder="Any city / village / area"
                      rows={1}
                      className="doodle-node-textarea doodle-scrollable"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1.5px solid rgba(255,255,255,0.38)',
                        color: 'rgba(255, 244, 233, 0.98)',
                        fontFamily: "'Inter', sans-serif",
                        textAlign: 'center',
                        outline: 'none',
                        width: '100%',
                        padding: '8px 6px 6px',
                        fontSize: 22,
                        fontWeight: 700,
                        lineHeight: 1.35,
                        resize: 'none',
                        overflowY: lineOverflowed ? 'auto' : 'hidden',
                        maxHeight: 168,
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                      }}
                    />
                    {currentValue.trim() && (
                      <div
                        onClick={() => onAdvance(node.id)}
                        style={{ fontSize: 18, color: '#fff', background: 'transparent', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 9999, padding: '12px 32px', cursor: 'pointer', fontWeight: 700, marginTop: 12 }}
                      >
                        press Enter ↓
                      </div>
                    )}
                    {!currentValue.trim() && (
                      <div
                        onClick={() => { setLocationCityMode(false); }}
                        style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginTop: 10, cursor: 'pointer', textDecoration: 'underline', textAlign: 'center' }}
                      >
                        ← Online instead?
                      </div>
                    )}
                  </div>
                )}

                {isActive && node.id === 'howMuch' && (
                  <div
                    style={{ width: '84%', textAlign: 'center' }}
                    onPointerDown={blockCanvasDragFromInput}
                    onMouseDown={blockCanvasDragFromInput}
                    onTouchStart={blockCanvasDragFromInput}
                  >
                    <input
                      ref={inputRef as React.RefObject<HTMLInputElement>}
                      type="text"
                      inputMode="numeric"
                      value={currentValue}
                      onChange={handleBudgetChange}
                      onKeyDown={handleKeyDown}
                      onFocus={handleFieldFocus}
                      onBlur={handleFieldBlur}
                      placeholder={node.placeholder}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        borderBottom: `1.5px solid ${budgetOutOfRange ? '#ff4444' : 'rgba(255,255,255,0.3)'}`,
                        color: 'rgba(255, 244, 233, 0.98)',
                        fontFamily: "'Inter', sans-serif",
                        textAlign: 'center',
                        outline: 'none',
                        width: '100%',
                        padding: '8px 4px',
                        fontSize: 20,
                        fontWeight: 600,
                      }}
                    />
                    {budgetOutOfRange && (
                      <div style={{ fontSize: 9, color: '#ff6666', marginTop: 4, fontWeight: 500 }}>
                        {budgetNum < 100 ? 'Min ₹100' : 'Max ₹10,00,000'}
                      </div>
                    )}
                    {isBudgetValid(currentValue) && (
                      <div
                        onClick={() => onAdvance(node.id)}
                        style={{ fontSize: 18, color: '#fff', background: 'transparent', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 9999, padding: '12px 32px', cursor: 'pointer', fontWeight: 700, marginTop: 12 }}
                      >
                        press Enter ↓
                      </div>
                    )}
                  </div>
                )}

                {isActive && node.inputType === 'textarea' && (
                  <div
                    style={{ width: '90%', textAlign: 'center' }}
                    onPointerDown={blockCanvasDragFromInput}
                    onMouseDown={blockCanvasDragFromInput}
                    onTouchStart={blockCanvasDragFromInput}
                  >
                    <textarea
                      ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                      value={currentValue}
                      onChange={(e) => node.valueKey && onValueChange(node.valueKey, e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={handleFieldFocus}
                      onBlur={handleFieldBlur}
                      placeholder={node.placeholder}
                      rows={3}
                      className="doodle-node-textarea doodle-scrollable"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1.5px solid rgba(255,255,255,0.38)',
                        color: 'rgba(255, 244, 233, 0.98)',
                        fontFamily: "'Inter', sans-serif",
                        textAlign: 'center',
                        outline: 'none',
                        width: '100%',
                        padding: '8px 4px 6px',
                        fontSize: 18,
                        lineHeight: 1.55,
                        resize: 'none',
                        overflowY: lineOverflowed ? 'auto' : 'hidden',
                        maxHeight: 180,
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                      }}
                    />
                    {currentValue.trim() && (
                      <div
                        onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onAdvance(node.id); }}
                        style={{ fontSize: 18, color: '#fff', background: 'transparent', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 9999, padding: '12px 32px', cursor: 'pointer', fontWeight: 700, marginTop: 12 }}
                      >
                        next →
                      </div>
                    )}
                  </div>
                )}

                {isActive && node.inputType === 'date' && (
                  <div
                    style={{ width: '84%', textAlign: 'center' }}
                    onPointerDown={blockCanvasDragFromInput}
                    onMouseDown={blockCanvasDragFromInput}
                    onTouchStart={blockCanvasDragFromInput}
                  >
                    <input
                      ref={inputRef as React.RefObject<HTMLInputElement>}
                      type="date"
                      value={currentValue}
                      min={dateBounds.today}
                      max={dateBounds.maxDate}
                      onChange={(e) => node.valueKey && onValueChange(node.valueKey, e.target.value)}
                      onFocus={handleFieldFocus}
                      onBlur={handleFieldBlur}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1.5px solid rgba(255,255,255,0.3)',
                        color: '#fff',
                        fontFamily: "'Inter', sans-serif",
                        textAlign: 'center',
                        outline: 'none',
                        width: '100%',
                        padding: '8px 4px',
                        fontSize: 18,
                        colorScheme: 'dark',
                      }}
                    />
                    {currentValue && (
                      <div
                        onClick={() => onAdvance(node.id)}
                        style={{ fontSize: 18, color: '#fff', background: 'transparent', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 9999, padding: '12px 32px', cursor: 'pointer', fontWeight: 700, marginTop: 12 }}
                      >
                        confirm →
                      </div>
                    )}
                  </div>
                )}

                {isActive && node.inputType === 'yesno' && node.id !== 'attachDoc' && node.id !== 'customerData' && (
                  <div style={{ display: 'flex', gap: 18, marginTop: 14 }}>
                    <button
                      type="button"
                      onClick={() => onYesNo(node.id, true)}
                      style={{
                        padding: '14px 38px',
                        borderRadius: 9999,
                        border: `2px solid ${yesNoAnswer === true ? MICA_ORANGE : 'rgba(255,255,255,0.4)'}`,
                        background: yesNoAnswer === true ? MICA_ORANGE : 'transparent',
                        color: '#fff',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 20,
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => onYesNo(node.id, false)}
                      style={{
                        padding: '14px 38px',
                        borderRadius: 9999,
                        border: `2px solid ${yesNoAnswer === false ? MICA_ORANGE : 'rgba(255,255,255,0.4)'}`,
                        background: yesNoAnswer === false ? MICA_ORANGE : 'transparent',
                        color: '#fff',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 20,
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      No
                    </button>
                  </div>
                )}

                {isActive && node.id === 'attachDoc' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    {isUploading ? (
                      <div style={{ fontSize: 12, color: MICA_ORANGE, fontWeight: 600 }}>
                        Uploading…
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 18 }}>
                        <button
                          type="button"
                          onClick={handleAttachYes}
                          style={{
                            padding: '14px 38px',
                            borderRadius: 9999,
                            border: `2px solid ${yesNoAnswer === true ? MICA_ORANGE : 'rgba(255,255,255,0.4)'}`,
                            background: yesNoAnswer === true ? MICA_ORANGE : 'transparent',
                            color: '#fff',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 20,
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => onYesNo(node.id, false)}
                          style={{
                            padding: '14px 38px',
                            borderRadius: 9999,
                            border: `2px solid ${yesNoAnswer === false ? MICA_ORANGE : 'rgba(255,255,255,0.4)'}`,
                            background: yesNoAnswer === false ? MICA_ORANGE : 'transparent',
                            color: '#fff',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 20,
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                        >
                          Skip
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {isToneChoiceActive && node.choices && (
                  <div style={{ position: 'relative', width: 540, height: currentValue === 'Custom' ? 640 : 520, pointerEvents: 'none' }}>
                    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none', zIndex: 1 }}>
                      <path d="M 270 182 Q 176 186 90 244" stroke="rgba(255,255,255,0.48)" strokeWidth="2.2" fill="none" />
                      <path d="M 270 182 Q 368 186 448 244" stroke="rgba(255,255,255,0.48)" strokeWidth="2.2" fill="none" />
                      <path d="M 270 182 Q 198 252 176 350" stroke="rgba(255,255,255,0.48)" strokeWidth="2.2" fill="none" />
                      <path d="M 270 182 Q 344 252 366 350" stroke="rgba(255,255,255,0.48)" strokeWidth="2.2" fill="none" />
                      <path d="M 270 182 Q 270 320 270 440" stroke="rgba(255,255,255,0.48)" strokeWidth="2.2" fill="none" />
                    </svg>

                    <div
                      style={{
                        position: 'absolute',
                        left: 135,
                        top: 38,
                        width: 270,
                        height: 144,
                        borderRadius: 9999,
                        border: '2px solid rgba(255,255,255,0.82)',
                        background: 'linear-gradient(135deg, #ff7a00, #ff4d00)',
                        boxShadow: '0 0 18px rgba(255,120,0,0.36)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: '0 14px',
                        color: '#fff',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 20,
                        fontWeight: 800,
                        lineHeight: 1.15,
                        letterSpacing: '-0.3px',
                        zIndex: 2,
                      }}
                    >
                      <div className="doodle-ripple doodle-ripple-circle" />
                      Which tone do you prefer?
                    </div>

                    {node.choices.map((choice) => {
                      const itemByChoice: Record<string, { top: number; left: number; shape: 'circle' | 'diamond' | 'ellipse' | 'rounded'; w: number; h: number; drift: number; duration: number }> = {
                        'Casual :)': { top: 214, left: 26, shape: 'circle', w: 156, h: 92, drift: 5, duration: 3.9 },
                        'Warm & Inspirational': { top: 214, left: 300, shape: 'rounded', w: 224, h: 96, drift: 6, duration: 4.1 },
                        'Urgent!': { top: 336, left: 98, shape: 'diamond', w: 152, h: 100, drift: 5, duration: 3.8 },
                        'Professional': { top: 336, left: 292, shape: 'ellipse', w: 216, h: 96, drift: 6, duration: 4.2 },
                        'Custom': { top: 390, left: 192, shape: 'circle', w: 156, h: 92, drift: 4, duration: 4.0 },
                      };
                      const item = itemByChoice[choice] ?? itemByChoice['Casual :)'];
                      const selected = currentValue === choice;
                      return (
                        <motion.button
                          key={choice}
                          type="button"
                          onClick={() => onChoice(node.id, choice)}
                          animate={{ y: [0, -item.drift, 0] }}
                          transition={{ duration: item.duration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                          style={{
                            position: 'absolute',
                            top: item.top,
                            left: item.left,
                            width: item.w,
                            height: item.h,
                            pointerEvents: 'auto',
                            color: '#fff',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: choice.length > 13 ? 18 : 20,
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: `2px solid ${selected ? '#fff4e5' : 'rgba(255,255,255,0.78)'}`,
                            background: selected
                              ? 'linear-gradient(135deg, #ff8b1f, #ff4d00)'
                              : 'linear-gradient(135deg, #ff7a00, #ff5000)',
                            boxShadow: selected ? '0 0 16px rgba(255,130,30,0.52)' : '0 0 10px rgba(255,120,0,0.28)',
                            borderRadius: item.shape === 'circle' ? '9999px' : item.shape === 'ellipse' ? '9999px' : item.shape === 'rounded' ? 22 : 18,
                            zIndex: 3,
                          }}
                        >
                          <span>{choice}</span>
                        </motion.button>
                      );
                    })}

                    {currentValue === 'Custom' && (
                      <div
                        style={{ position: 'absolute', top: 498, left: 40, right: 40, pointerEvents: 'auto', zIndex: 10 }}
                        onPointerDown={blockCanvasDragFromInput}
                        onMouseDown={blockCanvasDragFromInput}
                        onTouchStart={blockCanvasDragFromInput}
                      >
                        <input
                          autoFocus
                          placeholder="e.g. spiritual, gentle, uplifting"
                          value={values.customTone}
                          onChange={e => onValueChange('customTone', e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && values.customTone.trim()) onAdvance(node.id); }}
                          style={{
                            width: '100%', background: 'rgba(0,0,0,0.35)', border: '2px solid rgba(255,255,255,0.7)',
                            borderRadius: 12, color: '#fff', fontFamily: "'Inter', sans-serif",
                            fontSize: 17, fontWeight: 600, padding: '9px 14px', outline: 'none',
                            textAlign: 'center', pointerEvents: 'auto', boxSizing: 'border-box',
                          }}
                        />
                        {values.customTone.trim() && (
                          <div
                            onClick={() => onAdvance(node.id)}
                            style={{ marginTop: 8, fontSize: 16, color: '#fff', background: 'transparent',
                              border: '2px solid rgba(255,255,255,0.4)', borderRadius: 9999,
                              padding: '8px 24px', cursor: 'pointer', fontWeight: 700, textAlign: 'center', pointerEvents: 'auto' }}
                          >
                            next →
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}

                {isActive && node.id === 'customerData' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <input
                      ref={customerFileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleCustomerFileChange}
                      style={{ display: 'none' }}
                    />
                    {isCustomerDataUploading ? (
                      <div style={{ fontSize: 12, color: MICA_ORANGE, fontWeight: 600 }}>
                        Uploading…
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 18 }}>
                        <button
                          type="button"
                          onClick={() => customerFileInputRef.current?.click()}
                          style={{
                            padding: '14px 38px',
                            borderRadius: 9999,
                            border: `2px solid ${yesNoAnswer === true ? MICA_ORANGE : 'rgba(255,255,255,0.4)'}`,
                            background: yesNoAnswer === true ? MICA_ORANGE : 'transparent',
                            color: '#fff',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 20,
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => onYesNo(node.id, false)}
                          style={{
                            padding: '14px 38px',
                            borderRadius: 9999,
                            border: `2px solid ${yesNoAnswer === false ? MICA_ORANGE : 'rgba(255,255,255,0.4)'}`,
                            background: yesNoAnswer === false ? MICA_ORANGE : 'transparent',
                            color: '#fff',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 20,
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                        >
                          Skip
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </>
            )}
            </div>
          </div>
          )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(DoodleNode);
