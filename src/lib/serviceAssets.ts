import { Building2, Scale, Shield, Home as HomeIcon, Users, Briefcase } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import serviceCorporate from '@/assets/service-corporate.jpg';
import serviceCorporate2 from '@/assets/service-corporate-2.jpg';
import serviceCorporate3 from '@/assets/service-corporate-3.jpg';
import serviceLitigation from '@/assets/service-litigation.jpg';
import serviceLitigation2 from '@/assets/service-litigation-2.jpg';
import serviceLitigation3 from '@/assets/service-litigation-3.jpg';
import serviceIp from '@/assets/service-ip.jpg';
import serviceIp2 from '@/assets/service-ip-2.jpg';
import serviceIp3 from '@/assets/service-ip-3.jpg';
import serviceRealestate from '@/assets/service-realestate.jpg';
import serviceRealestate2 from '@/assets/service-realestate-2.jpg';
import serviceRealestate3 from '@/assets/service-realestate-3.jpg';
import serviceFamily from '@/assets/service-family.jpg';
import serviceFamily2 from '@/assets/service-family-2.jpg';
import serviceFamily3 from '@/assets/service-family-3.jpg';
import serviceEmployment from '@/assets/service-employment.jpg';
import serviceEmployment2 from '@/assets/service-employment-2.jpg';
import serviceEmployment3 from '@/assets/service-employment-3.jpg';

export const SERVICE_KEYS = ['corporate', 'litigation', 'ip', 'realestate', 'family', 'employment'] as const;

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  corporate: Building2,
  litigation: Scale,
  ip: Shield,
  realestate: HomeIcon,
  family: Users,
  employment: Briefcase,
};

export const SERVICE_IMAGES: Record<string, string> = {
  corporate: serviceCorporate,
  litigation: serviceLitigation,
  ip: serviceIp,
  realestate: serviceRealestate,
  family: serviceFamily,
  employment: serviceEmployment,
};

export const SERVICE_IMAGE_SETS: Record<string, string[]> = {
  corporate: [serviceCorporate, serviceCorporate2, serviceCorporate3],
  litigation: [serviceLitigation, serviceLitigation2, serviceLitigation3],
  ip: [serviceIp, serviceIp2, serviceIp3],
  realestate: [serviceRealestate, serviceRealestate2, serviceRealestate3],
  family: [serviceFamily, serviceFamily2, serviceFamily3],
  employment: [serviceEmployment, serviceEmployment2, serviceEmployment3],
};

export const iconForService = (key: string): LucideIcon => SERVICE_ICONS[key] || Briefcase;
export const imageForService = (key: string): string => SERVICE_IMAGES[key] || serviceCorporate;
export const imageSetForService = (key: string): string[] =>
  SERVICE_IMAGE_SETS[key] || [imageForService(key)];
