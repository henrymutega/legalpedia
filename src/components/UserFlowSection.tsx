import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Globe,
  Search,
  FileText,
  MessageSquare,
  Upload,
  UserCheck,
  CheckCircle,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';

const stepIcons = [Globe, Search, FileText, MessageSquare, Upload, UserCheck, CheckCircle];

const UserFlowSection = () => {
  const { t } = useTranslation();
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const steps = t('userFlow.steps', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    detail: string;
  }>;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute('data-index'));
          if (entry.isIntersecting) {
            setVisibleSteps((prev) => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [steps]);

  const toggleStep = (index: number) => {
    setExpandedStep(expandedStep === index ? null : index);
  };

  if (!Array.isArray(steps)) return null;

  return (
    <section ref={sectionRef} className="py-16 lg:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {t('userFlow.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('userFlow.subtitle')}
          </p>
        </div>

        {/* Desktop Flow (horizontal) */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-16 left-[8%] right-[8%] h-0.5 bg-border z-0">
              <div
                className="h-full bg-gold/60 transition-all duration-1000"
                style={{ width: `${(visibleSteps.size / steps.length) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-7 gap-4 relative z-10">
              {steps.map((step, i) => {
                const Icon = stepIcons[i];
                const isVisible = visibleSteps.has(i);
                const isExpanded = expandedStep === i;

                return (
                  <div
                    key={i}
                    ref={(el) => { stepRefs.current[i] = el; }}
                    data-index={i}
                    onClick={() => toggleStep(i)}
                    className={`flex flex-col items-center cursor-pointer transition-all duration-500 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    {/* Node */}
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                        isExpanded
                          ? 'bg-gold text-accent-foreground scale-110 shadow-gold'
                          : 'bg-card border-2 border-border text-muted-foreground hover:border-gold hover:text-gold hover:scale-105 hover:shadow-soft'
                      }`}
                    >
                      <Icon size={22} />
                    </div>

                    {/* Step number */}
                    <span className="text-xs font-semibold text-gold mb-1">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* Title */}
                    <h3 className="font-heading text-sm font-semibold text-foreground text-center mb-1 leading-tight">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground text-xs text-center leading-relaxed">
                      {step.description}
                    </p>

                    {/* Expanded detail */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isExpanded ? 'max-h-40 mt-3 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground leading-relaxed border border-border">
                        {step.detail}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Flow (vertical) */}
        <div className="lg:hidden">
          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-border">
              <div
                className="w-full bg-gold/60 transition-all duration-1000"
                style={{ height: `${(visibleSteps.size / steps.length) * 100}%` }}
              />
            </div>

            <div className="space-y-6">
              {steps.map((step, i) => {
                const Icon = stepIcons[i];
                const isVisible = visibleSteps.has(i);
                const isExpanded = expandedStep === i;

                return (
                  <div
                    key={i}
                    ref={(el) => {
                      if (!stepRefs.current[i]) stepRefs.current[i] = el;
                    }}
                    data-index={i}
                    onClick={() => toggleStep(i)}
                    className={`relative flex gap-4 cursor-pointer transition-all duration-500 ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                    }`}
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    {/* Node */}
                    <div
                      className={`absolute -left-8 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 z-10 ${
                        isExpanded
                          ? 'bg-gold text-accent-foreground scale-110'
                          : 'bg-card border-2 border-border text-muted-foreground'
                      }`}
                    >
                      <Icon size={14} />
                    </div>

                    {/* Content */}
                    <div
                      className={`flex-1 rounded-xl p-4 transition-all duration-300 ${
                        isExpanded
                          ? 'bg-card shadow-card border border-gold/20'
                          : 'bg-card shadow-soft border border-border hover:shadow-card hover:border-gold/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-gold">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <h3 className="font-heading text-base font-semibold text-foreground">
                            {step.title}
                          </h3>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`text-muted-foreground transition-transform duration-300 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                      <p className="text-muted-foreground text-sm mt-1">{step.description}</p>

                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isExpanded ? 'max-h-40 mt-3 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <p className="text-muted-foreground text-xs leading-relaxed border-t border-border pt-3">
                          {step.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-primary rounded-2xl p-8 lg:p-12 max-w-2xl mx-auto">
            <h3 className="font-heading text-2xl lg:text-3xl font-bold text-primary-foreground mb-3">
              {t('userFlow.cta_title')}
            </h3>
            <p className="text-primary-foreground/70 mb-6">
              {t('userFlow.cta_subtitle')}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-accent-foreground font-semibold text-sm uppercase tracking-wider rounded-sm hover:bg-gold-dark transition-colors shadow-gold"
            >
              {t('userFlow.cta_button')}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserFlowSection;
