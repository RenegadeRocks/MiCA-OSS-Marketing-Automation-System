import React, { useState, useCallback, useRef, useLayoutEffect } from 'react';
import { Clapperboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useAnimationContext } from '../../../context/AnimationContext';
import { useEyeballMood } from '../../../contexts/EyeballMoodContext';
import { supabase } from '../../../lib/supabase';
import { Navbar } from '../../../components/Navbar';
import DoodleCanvas from './DoodleCanvas';
import { MICA_ORANGE, STEP_TOTAL } from './constants';
import type { FormValues } from './types';
import { DEMO_MODE_ENABLED, DEMO_CAMPAIGN } from '../../../data/demoData';

import '../../../App.css';

const DoodleMapPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setMode, setGazeTarget } = useAnimationContext();
  const { setMood: setEyeballMood } = useEyeballMood();
  const loadingTextRef = useRef<HTMLDivElement>(null);
  const demoBannerRef = useRef<HTMLDivElement>(null);
  const [demoBannerHeight, setDemoBannerHeight] = useState(0);

  useLayoutEffect(() => {
    const node = demoBannerRef.current;
    if (!node) {
      setDemoBannerHeight(0);
      return;
    }
    const measure = () => setDemoBannerHeight(node.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const [visibleNodes, setVisibleNodes] = useState<Set<string>>(new Set(['start']));
  const [drawnEdges, setDrawnEdges] = useState<Set<string>>(new Set());
  const [activeNode, setActiveNode] = useState('start');
  const [step, setStep] = useState(0);
  const [yesNoAnswers, setYesNoAnswers] = useState<Record<string, boolean | null>>({});
  const [values, setValues] = useState<FormValues>({
    name: '', desc: '', audience: '', date: '', budgetAmount: '', location: '', tone: '',
    customTone: '', attachedDocUrl: '', attachedDocName: '', customerDataUrl: '', customerDataName: '',
  });
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCustomerDataUploading, setIsCustomerDataUploading] = useState(false);

  const showNode = useCallback((nodeId: string, edgeId?: string) => {
    setVisibleNodes((prev) => new Set([...prev, nodeId]));
    if (edgeId) setDrawnEdges((prev) => new Set([...prev, edgeId]));
    requestAnimationFrame(() => setActiveNode(nodeId));
  }, []);

  const hideNodes = useCallback((nodeIds: string[], edgeIds: string[], valuesToClear: string[]) => {
    setVisibleNodes((prev) => {
      const next = new Set(prev);
      nodeIds.forEach((id) => next.delete(id));
      return next;
    });
    setDrawnEdges((prev) => {
      const next = new Set(prev);
      edgeIds.forEach((id) => next.delete(id));
      return next;
    });
    if (valuesToClear.length > 0) {
      setValues((prev) => {
        const next = { ...prev };
        valuesToClear.forEach((key) => { (next as Record<string, string>)[key] = ''; });
        return next;
      });
    }
  }, []);

  const handleValueChange = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleStart = useCallback(() => {
    if (step !== 0) return;
    showNode('productName', 'e1');
    setStep(1);
  }, [step, showNode]);

  const handleAdvance = useCallback((nodeId: string) => {
    switch (nodeId) {
      case 'productName':
        if (!values.name.trim()) return;
        showNode('whatDoesItDo', 'e2');
        setStep(2);
        break;
      case 'whatDoesItDo':
        if (!values.desc.trim()) return;
        showNode('whoIsItFor', 'e3');
        setStep(3);
        break;
      case 'whoIsItFor':
        if (!values.audience.trim()) return;
        showNode('hasDate', 'e4');
        setStep(4);
        break;
      case 'datePicker':
        if (!values.date) return;
        showNode('hasBudget', 'e6');
        setStep(6);
        break;
      case 'howMuch': {
        const num = Number(values.budgetAmount);
        if (!values.budgetAmount.trim() || isNaN(num) || num < 100 || num > 1000000) return;
        showNode('location', 'e9');
        setStep(8);
        break;
      }
      case 'location':
        if (!values.location.trim()) return;
        showNode('tone', 'e11');
        setStep(9);
        break;
      case 'tone':
        // Called when user presses Next after typing custom tone words
        showNode('attachDoc', 'e12');
        setStep(10);
        break;
      default:
        break;
    }
  }, [values, showNode]);

  const handleYesNo = useCallback((nodeId: string, answer: boolean) => {
    setYesNoAnswers((prev) => ({ ...prev, [nodeId]: answer }));

    switch (nodeId) {
      case 'hasDate':
        if (answer) {
          hideNodes([], ['e7'], []);
          showNode('datePicker', 'e5');
          setStep(5);
        } else {
          hideNodes(['datePicker'], ['e5', 'e6'], ['date']);
          showNode('hasBudget', 'e7');
          setStep(6);
        }
        break;
      case 'hasBudget':
        if (answer) {
          hideNodes([], ['e10'], []);
          showNode('howMuch', 'e8');
          setStep(7);
        } else {
          hideNodes(['howMuch'], ['e8', 'e9'], ['budgetAmount']);
          showNode('location', 'e10');
          setStep(8);
        }
        break;
      case 'attachDoc':
        showNode('customerData', 'e13');
        setStep(11);
        break;
      case 'customerData':
        showNode('letsGo', 'e14');
        setStep(12);
        break;
      default:
        break;
    }
  }, [showNode, hideNodes]);

  const handleChoice = useCallback((nodeId: string, value: string) => {
    const nodeDef = { location: 'location', tone: 'tone' } as Record<string, string>;
    const valueKey = nodeDef[nodeId];
    if (valueKey) {
      setValues((prev) => ({ ...prev, [valueKey]: value }));
    }

    switch (nodeId) {
      case 'tone':
        if (value !== 'Custom') {
          showNode('attachDoc', 'e12');
          setStep(10);
        }
        // Custom: just store the value, stay on this node
        break;
      default:
        break;
    }
  }, [showNode]);

  const handleNodeClick = useCallback((nodeId: string) => {
    if (nodeId !== 'datePicker' && visibleNodes.has('datePicker') && !values.date) {
      hideNodes(['datePicker'], ['e5', 'e6'], []);
      setYesNoAnswers((prev) => ({ ...prev, hasDate: null }));
    }
    if (nodeId !== 'howMuch' && visibleNodes.has('howMuch') && !values.budgetAmount) {
      hideNodes(['howMuch'], ['e8', 'e9'], []);
      setYesNoAnswers((prev) => ({ ...prev, hasBudget: null }));
    }
    setActiveNode(nodeId);
  }, [visibleNodes, values, hideNodes]);

  const handleFileUpload = useCallback(async (file: File) => {
    // Move forward immediately once a file is chosen; upload can complete in background.
    setValues((prev) => ({
      ...prev,
      attachedDocName: file.name,
    }));
    setYesNoAnswers((prev) => ({ ...prev, attachDoc: true }));
    showNode('customerData', 'e13');
    setStep(11);

    if (!user?.id || DEMO_MODE_ENABLED()) {
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop() || 'bin';
      const path = `${user.id}/${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('product-documents')
        .upload(path, file);
      if (error) {
        console.error('File upload failed:', error);
        return;
      }
      setValues((prev) => ({
        ...prev,
        attachedDocUrl: path,
      }));
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
    }
  }, [user, showNode]);

  const handleCustomerDataUpload = useCallback(async (file: File) => {
    setValues(prev => ({ ...prev, customerDataName: file.name }));
    setYesNoAnswers(prev => ({ ...prev, customerData: true }));
    showNode('letsGo', 'e14');
    setStep(12);

    if (!user?.id || DEMO_MODE_ENABLED()) return;

    setIsCustomerDataUploading(true);
    try {
      const path = `${user.id}/${Date.now()}.csv`;
      const { error } = await supabase.storage
        .from('customer-documents')
        .upload(path, file);
      if (!error) setValues(prev => ({ ...prev, customerDataUrl: path }));
    } finally {
      setIsCustomerDataUploading(false);
    }
  }, [user, showNode]);

  const handleLaunch = useCallback(async () => {
    if (submitting || !user) return;
    setSubmitting(true);
    setLaunchError(null);

    if (DEMO_MODE_ENABLED()) {
      navigate(`/campaign/${DEMO_CAMPAIGN.id}/generating`);
      setSubmitting(false);
      return;
    }

    if (values.date) {
      const launchDateObj = new Date(values.date);
      launchDateObj.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((launchDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 1) {
        setLaunchError('Launch date must be at least 1 day in the future.');
        setSubmitting(false);
        return;
      }
      if (diffDays > 45) {
        setLaunchError('Launch date must be within 45 days from today.');
        setSubmitting(false);
        return;
      }
    }

    const budgetNum = parseFloat(values.budgetAmount.replace(/[^0-9.]/g, '')) || 0;
    const insertPayload = {
      user_id: user.id,
      product_name: values.name,
      product_description: values.desc,
      product_document_url: values.attachedDocUrl || null,
      target_audience: values.audience,
      launch_date: values.date || null,
      budget: budgetNum,
      location: values.location || null,
      product_links: '',
      tone: values.tone || 'Professional',
      tone_custom_words: values.tone === 'Custom' ? (values.customTone || null) : null,
      customer_data_url: values.customerDataUrl || null,
      creator_name: user?.user_metadata?.full_name || 'Business Owner',
      status: 'tone_preview',
    };

    try {
      const { data, error } = await supabase.from('campaigns').insert(insertPayload).select().single();
      if (error) throw error;
      if (data?.id) {
        navigate(`/campaign/${data.id}/tone-preview`);
      }
    } catch (err: unknown) {
      console.error('Failed to create campaign:', err);
      setLaunchError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [user, values, navigate, submitting]);

  const handleFinish = useCallback(() => {
    if (DEMO_MODE_ENABLED()) {
      handleLaunch();
      return;
    }
    setFinished(true);
    setMode('generating');
    setEyeballMood('concentrating');
    setTimeout(() => {
      if (loadingTextRef.current) {
        const rect = loadingTextRef.current.getBoundingClientRect();
        setGazeTarget({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }
    }, 200);
    setTimeout(() => {
      setMode('idle');
      setEyeballMood('idle');
      setGazeTarget(null);
      handleLaunch();
    }, 2400);
  }, [handleLaunch, setMode, setEyeballMood, setGazeTarget]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div className="bg-smoke-layer" />

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 60% 55% at 28% 55%, rgba(255,90,0,0.06) 0%, transparent 70%),
          radial-gradient(ellipse 50% 45% at 74% 32%, rgba(100,50,255,0.04) 0%, transparent 70%)
        `,
      }} />

      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200 }}>
        <Navbar />
      </div>

      {DEMO_MODE_ENABLED() && (
        <div
          ref={demoBannerRef}
          style={{
            position: 'fixed',
            top: 40,
            left: 0,
            right: 0,
            zIndex: 199,
            background: 'linear-gradient(180deg, rgba(15,18,32,0.92) 0%, rgba(15,18,32,0.78) 100%)',
            borderBottom: `1px solid ${MICA_ORANGE}55`,
            color: 'rgba(255, 232, 210, 0.95)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: `0 0 24px rgba(255,122,0,0.08), inset 0 -1px 0 rgba(255,122,0,0.04)`,
          }}
          className="px-4 py-2 text-[12px] sm:text-sm leading-snug flex items-start gap-2.5"
        >
          <Clapperboard
            className="shrink-0 mt-[1px]"
            size={16}
            style={{ color: MICA_ORANGE }}
          />
          <span>
            <strong style={{ color: MICA_ORANGE }}>You&apos;re in demo mode.</strong>{' '}
            Feel free to type anything here — the campaign you&apos;ll see is an actual one we generated for the Happiness Program (by Art of Living), recorded so you can preview the full experience without spending API credits. To run a campaign for your own business, turn off demo mode in Settings.
          </span>
        </div>
      )}

      <div style={{
        position: 'fixed',
        top: 40 + demoBannerHeight + 12,
        left: 32,
        zIndex: 100,
        pointerEvents: 'auto',
        fontSize: 22,
        lineHeight: 1.3,
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          color: '#FFFFFF',
        }}>
          Create new marketing campaign
        </span>
      </div>

      <div style={{
        position: 'fixed',
        bottom: 26,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 9,
        zIndex: 100,
      }}>
        {Array.from({ length: STEP_TOTAL }, (_, i) => i + 1).map((i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: step >= i ? MICA_ORANGE : 'rgba(255,255,255,0.13)',
              transform: step === i ? 'scale(1.45)' : 'scale(1)',
              boxShadow: step === i ? '0 0 10px rgba(255,90,0,0.65)' : 'none',
              transition: 'all 0.4s',
            }}
          />
        ))}
      </div>

      <DoodleCanvas
        visibleNodes={visibleNodes}
        drawnEdges={drawnEdges}
        activeNode={activeNode}
        step={step}
        values={values}
        yesNoAnswers={yesNoAnswers}
        onValueChange={handleValueChange}
        onStart={handleStart}
        onAdvance={handleAdvance}
        onYesNo={handleYesNo}
        onChoice={handleChoice}
        onNodeClick={handleNodeClick}
        onFinish={handleFinish}
        onFileUpload={handleFileUpload}
        isUploading={isUploading}
        onCustomerDataUpload={handleCustomerDataUpload}
        isCustomerDataUploading={isCustomerDataUploading}
      />

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 150,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(30,60,120,0.98) 0%, rgba(8,12,28,0.99) 70%)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
              style={{ textAlign: 'center' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 52, height: 52, margin: '0 auto 28px',
                  border: '4px solid rgba(100,160,255,0.18)',
                  borderTopColor: '#4d9fff',
                  borderRadius: '50%',
                }}
              />
              <div
                ref={loadingTextRef}
                style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.5px' }}
              >
                Generating tone preview…
              </div>
              <div style={{ fontSize: 14, color: 'rgba(180,210,255,0.5)' }}>
                This will only take a moment
              </div>
              {launchError && (
                <div style={{ fontSize: 13, color: '#ff6666', marginTop: 18, fontWeight: 500 }}>
                  {launchError}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoodleMapPage;
