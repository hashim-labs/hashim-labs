'use client';
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { useInView } from 'framer-motion';

const Spline = dynamic(() => import('./SplineScene'), { ssr: false });

export default function SplineCanvas() {
  const sceneRef = useRef(null);
  const isVisible = useInView(sceneRef, { margin: '200px' });
  return (
    <div className="absolute inset-0 z-0 pointer-events-none flex justify-end items-center pr-23">
      <div ref={sceneRef} className="w-[500px] h-[500px] relative">
        {isVisible && <Spline scene="https://prod.spline.design/CekctndbSK6KGzdN/scene.splinecode" />}
        <style jsx>{`
          .spline-watermark {
            display: none !important;
          }
        `}</style>
      </div>
    </div>
  );
}
