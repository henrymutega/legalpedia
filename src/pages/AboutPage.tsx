import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Target, Eye } from 'lucide-react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import headerImage from '@/assets/header-about.jpg';
import team1 from '@/assets/team-1.jpg';
import team2 from '@/assets/team-2.jpg';
import team3 from '@/assets/team-3.jpg';
import team4 from '@/assets/team-4.jpg';

const teamImages = [team1, team2, team3, team4];

const AboutPage = () => {
  const { t } = useTranslation();
  const team = t('team', { returnObjects: true }) as Array<{ name: string; role: string; specialty: string; bio: string }>;
  const timeline = t('about.timeline', { returnObjects: true }) as Array<{ year: string; title: string; desc: string }>;
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <Layout>
      <PageHeader title={t('about.title')} image={headerImage} />

      {/* Story */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left">
              <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
                {t('about.story_title')}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{t('about.story')}</p>
              <p className="text-muted-foreground leading-relaxed">{t('about.story_2')}</p>
            </div>
            <div className="flex justify-center">
              <Scale size={120} className="text-gold/30" />
            </div>
          </div>
        </div>
      </section>

      {/* Growth Timeline */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">
              {t('about.timeline_title')}
            </h2>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-gold/30" />
            <div className="space-y-8">
              {Array.isArray(timeline) && timeline.map((item, i) => (
                <div
                  key={i}
                  className={`relative flex items-start gap-6 md:gap-0 animate-fade-in-up animation-delay-${i % 4}00`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gold border-2 border-background z-10 mt-1.5" />

                  {/* Content - alternating sides on md+ */}
                  <div className={`ml-10 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:ml-auto'}`}>
                    <span className="text-gold font-heading font-bold text-lg">{item.year}</span>
                    <h3 className="font-heading text-lg font-semibold text-foreground mt-1">{item.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card p-8 rounded-lg shadow-soft animate-fade-in-up">
              <Target size={32} className="text-gold mb-4" />
              <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                {t('about.mission_title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{t('about.mission')}</p>
            </div>
            <div className="bg-card p-8 rounded-lg shadow-soft animate-fade-in-up animation-delay-200">
              <Eye size={32} className="text-gold mb-4" />
              <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                {t('about.vision_title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{t('about.vision')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">
              {t('about.team_title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {Array.isArray(team) && team.map((member, i) => (
              <div
                key={i}
                className="group relative rounded-lg overflow-hidden shadow-soft hover:shadow-card transition-shadow cursor-pointer aspect-[3/4]"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setHoveredIdx(hoveredIdx === i ? null : i)}
              >
                <img
                  src={teamImages[i]}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={512}
                  height={640}
                />
                {/* Default name strip */}
                <div className="absolute bottom-0 inset-x-0 bg-primary/80 p-3 transition-opacity group-hover:opacity-0">
                  <h3 className="font-heading text-sm font-semibold text-primary-foreground">{member.name}</h3>
                  <p className="text-gold text-xs">{member.role}</p>
                </div>
                {/* Hover overlay with full details */}
                <div
                  className={`absolute inset-0 bg-primary/85 flex flex-col justify-end p-5 transition-opacity duration-300 ${
                    hoveredIdx === i ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <h3 className="font-heading text-lg font-semibold text-primary-foreground">{member.name}</h3>
                  <p className="text-gold text-sm font-medium mt-1">{member.role}</p>
                  <p className="text-primary-foreground/70 text-xs mt-0.5">{member.specialty}</p>
                  <p className="text-primary-foreground/60 text-xs mt-2 leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
