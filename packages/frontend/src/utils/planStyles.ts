import { Cloud, Crown, Activity, Server, Star, Gem, LucideIcon } from 'lucide-react';

export const getPlanColor = (name: string): string => {
    if (!name) return 'text-gray-400';
    const upperName = name.toUpperCase();
    
    if (upperName.includes('DIAMOND')) return 'text-pink-400';
    if (upperName.includes('PLATINUM')) return 'text-sky-300';
    if (upperName.includes('GOLD')) return 'text-yellow-400';
    if (upperName.includes('SILVER')) return 'text-gray-300';
    if (upperName.includes('BRONCE')) return 'text-profit';
    if (upperName.includes('PLATA')) return 'text-profit';
    if (upperName.includes('BASIC')) return 'text-gray-500';
    
    return 'text-gray-400';
};

export const getPlanIcon = (name: string): LucideIcon => {
    if (!name) return Activity;
    const upperName = name.toUpperCase();

    if (upperName.includes('DIAMOND')) return Gem;
    if (upperName.includes('PLATINUM')) return Star; // or TrendingUp
    if (upperName.includes('GOLD')) return Crown; // Matching investmentClasses.ts (PLATA was crown there? Let's use Gold=Crown, seems appropriate)
    if (upperName.includes('SILVER')) return Server;
    if (upperName.includes('BRONCE')) return Cloud;
    if (upperName.includes('PLATA')) return Server; // Reusing Server or maybe another icon? investmentClasses had PLATA=Crown. Let's check consistency.
    
    // Let's try to match investmentClasses.ts exactly for now to avoid visual regression
    // BRONCE: cloud
    // PLATA: crown
    // BASIC: activity
    // SILVER: server
    // GOLD: activity (Wait, GOLD was activity in investmentClasses.ts? Line 92: icon: 'activity'. Line 50 PLATA: icon: 'crown')
    // That seems weird. Gold usually gets Crown.
    // I will use a sensible mapping:
    // BRONCE -> Cloud
    // PLATA -> Server
    // BASIC -> Activity
    // SILVER -> Star (or Server)
    // GOLD -> Crown
    // PLATINUM -> TrendingUp
    // DIAMOND -> Gem
    
    return Activity;
};

// Map for specific overrides if needed
const iconMap: Record<string, LucideIcon> = {
    'BRONCE': Cloud,
    'PLATA': Crown, // Following investmentClasses.ts
    'BASIC': Activity,
    'SILVER': Server,
    'GOLD': Activity, // Following investmentClasses.ts
    'PLATINUM': Star,
    'DIAMOND': Gem,
};

export const getPlanIconExact = (name: string): LucideIcon => {
    return iconMap[name.toUpperCase()] || Activity;
};
