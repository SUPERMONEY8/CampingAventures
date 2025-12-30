# 🧭 Navigation Components

Composants de navigation avancés pour l'application Camping Adventures.

## 📦 Composants Disponibles

### 1. Tabs (`Tabs.tsx`)

Composant d'onglets avec indicateur animé, scroll horizontal et navigation clavier.

```tsx
import { Tabs } from '@/components/navigation';
import { MapPin, Calendar, Users } from 'lucide-react';

const [activeTab, setActiveTab] = useState('trips');

<Tabs
  tabs={[
    { id: 'trips', label: 'Sorties', icon: MapPin, badge: 3 },
    { id: 'calendar', label: 'Calendrier', icon: Calendar },
    { id: 'participants', label: 'Participants', icon: Users },
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

**Props:**
- `tabs: TabItem[]` - Array d'onglets
- `activeTab: string` - ID de l'onglet actif
- `onChange: (tabId: string) => void` - Handler de changement
- `fullWidth?: boolean` - Onglets pleine largeur
- `className?: string` - Classes CSS additionnelles

**TabItem:**
- `id: string` - Identifiant unique
- `label: string` - Label de l'onglet
- `icon?: LucideIcon` - Icône optionnelle
- `badge?: number` - Badge optionnel
- `disabled?: boolean` - État désactivé

**Features:**
- ✅ Indicateur animé (underline)
- ✅ Scroll horizontal sur mobile
- ✅ Navigation clavier (flèches, Home, End)
- ✅ Touch-friendly (44px height)
- ✅ Badge support
- ✅ ARIA attributes complets

---

### 2. Breadcrumb (`Breadcrumb.tsx`)

Navigation fil d'Ariane avec séparateurs personnalisables et truncation mobile.

```tsx
import { Breadcrumb } from '@/components/navigation';
import { Home, MapPin, Calendar } from 'lucide-react';

<Breadcrumb
  items={[
    { label: 'Accueil', href: '/', icon: Home },
    { label: 'Sorties', href: '/trips', icon: MapPin },
    { label: 'Détails', href: '/trips/123' },
  ]}
  maxItems={3}
/>
```

**Props:**
- `items: BreadcrumbItem[]` - Array d'items
- `separator?: ReactNode` - Séparateur personnalisé (défaut: ChevronRight)
- `maxItems?: number` - Max items avant truncation (défaut: 3)
- `className?: string` - Classes CSS additionnelles

**BreadcrumbItem:**
- `label: string` - Label de l'item
- `href?: string` - Lien (optionnel pour page courante)
- `icon?: LucideIcon` - Icône optionnelle

**Features:**
- ✅ Séparateur personnalisable
- ✅ Truncation automatique sur mobile
- ✅ Page courante non cliquable
- ✅ Support icônes
- ✅ ARIA labels

---

### 3. BottomNavigation (`BottomNavigation.tsx`)

Navigation mobile uniquement avec icônes, badges et glassmorphism.

```tsx
import { BottomNavigation } from '@/components/navigation';

<BottomNavigation
  items={[
    { id: 'home', label: 'Accueil', path: '/', icon: Home, badge: 2 },
    { id: 'trips', label: 'Sorties', path: '/trips', icon: MapPin },
    { id: 'explore', label: 'Explorer', path: '/explore', icon: Compass },
    { id: 'profile', label: 'Profil', path: '/profile', icon: User },
  ]}
/>
```

**Props:**
- `items?: BottomNavItem[]` - Items de navigation (défaut: items par défaut)
- `className?: string` - Classes CSS additionnelles

**BottomNavItem:**
- `id: string` - Identifiant unique
- `label: string` - Label
- `path: string` - Route
- `icon: LucideIcon` - Icône
- `badge?: number` - Badge optionnel

**Features:**
- ✅ Mobile uniquement (hidden lg+)
- ✅ 4 items principaux
- ✅ Active state avec couleur primary
- ✅ Badge optionnel
- ✅ Fixed bottom
- ✅ Safe-area-inset compatible (iOS)
- ✅ Glassmorphism background
- ✅ Indicateur actif animé

---

## 🎨 Utilisation

### Import

```tsx
import { Tabs, Breadcrumb, BottomNavigation } from '@/components/navigation';
```

### Exemple Complet

```tsx
import { useState } from 'react';
import { Tabs, Breadcrumb, BottomNavigation } from '@/components/navigation';
import { Home, MapPin, Calendar } from 'lucide-react';

function MyPage() {
  const [activeTab, setActiveTab] = useState('upcoming');

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/', icon: Home },
          { label: 'Sorties', href: '/trips' },
          { label: 'À venir' },
        ]}
      />

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'upcoming', label: 'À venir', icon: Calendar },
          { id: 'past', label: 'Passées' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Content */}
      <div>{/* Contenu selon l'onglet actif */}</div>

      {/* Bottom Navigation (mobile only) */}
      <BottomNavigation />
    </div>
  );
}
```

---

## ♿ Accessibilité

Tous les composants incluent:
- ✅ ARIA attributes appropriés
- ✅ Navigation clavier complète
- ✅ Focus management
- ✅ Screen reader support
- ✅ Touch targets 44px minimum

---

## 📱 Responsive

- ✅ **Tabs**: Scroll horizontal sur mobile
- ✅ **Breadcrumb**: Truncation automatique sur mobile
- ✅ **BottomNavigation**: Visible uniquement sur mobile (< lg)

---

## 🎭 Animations

- ✅ Indicateur animé (Tabs)
- ✅ Transitions fluides
- ✅ Scale animations (BottomNavigation)
- ✅ Badge animations

---

## 💡 Bonnes Pratiques

1. **Tabs**: Utilisez max 5-6 onglets pour éviter le scroll
2. **Breadcrumb**: Limitez à 3-4 niveaux maximum
3. **BottomNavigation**: Ajoutez un padding-bottom au contenu pour éviter le chevauchement

```tsx
// Ajouter padding-bottom pour BottomNavigation
<main className="pb-20 lg:pb-0">
  {/* Contenu */}
</main>
```

