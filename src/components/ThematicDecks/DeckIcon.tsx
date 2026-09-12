import React from 'react';
import {
  BookOpen,
  Sparkles,
  Zap,
  ShoppingBag,
  Coffee,
  Heart,
  Home,
  Navigation,
  Users,
  Calendar,
  Layers,
  Briefcase,
  Landmark,
  Stethoscope,
  Radio,
  GraduationCap,
  Wrench,
  Baby,
  Car,
  Calculator,
  Receipt,
  Activity,
  CreditCard,
  Library,
  Archive,
  BookMarked,
  Droplets,
} from 'lucide-react';

interface DeckIconProps {
  name: string;
  className?: string;
}

export const DeckIcon: React.FC<DeckIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'Zap':
      return <Zap className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} />;
    case 'Coffee':
      return <Coffee className={className} />;
    case 'Heart':
      return <Heart className={className} />;
    case 'Home':
      return <Home className={className} />;
    case 'Navigation':
      return <Navigation className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'Calendar':
      return <Calendar className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'Landmark':
      return <Landmark className={className} />;
    case 'Stethoscope':
      return <Stethoscope className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'Calculator':
      return <Calculator className={className} />;
    case 'Receipt':
      return <Receipt className={className} />;
    case 'CreditCard':
      return <CreditCard className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Radio':
      return <Radio className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'Baby':
      return <Baby className={className} />;
    case 'Car':
      return <Car className={className} />;
    case 'Library':
      return <Library className={className} />;
    case 'Archive':
      return <Archive className={className} />;
    case 'BookMarked':
      return <BookMarked className={className} />;
    case 'Droplets':
      return <Droplets className={className} />;
    default:
      return <BookOpen className={className} />;
  }
};
