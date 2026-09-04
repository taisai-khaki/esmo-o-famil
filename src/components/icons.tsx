import {
  Globe,
  Leaf,
  MapPin,
  Package,
  Palette,
  PawPrint,
  User,
  Users,
  Utensils,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  name: User,
  family: Users,
  city: MapPin,
  country: Globe,
  plant: Leaf,
  animal: PawPrint,
  object: Package,
  color: Palette,
  food: Utensils,
};

export function CategoryIcon({ id, ...props }: { id: string } & LucideProps) {
  const C = MAP[id] ?? User;
  return <C {...props} />;
}
