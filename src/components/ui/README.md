# 🎨 UI Components Library

Bibliothèque de composants UI réutilisables pour l'application Camping Adventures.

## 📦 Composants Disponibles

### 1. Card (`Card.tsx`)

Composant de carte avec variants, icône et actions.

```tsx
import { Card } from '@/components/ui';
import { MapPin } from 'lucide-react';

<Card
  title="Ma Sortie"
  icon={MapPin}
  variant="glassmorphism"
  actions={<Button>Voir plus</Button>}
>
  Contenu de la carte
</Card>
```

**Props:**
- `title?: string` - Titre de la carte
- `children: ReactNode` - Contenu
- `icon?: LucideIcon` - Icône dans le header
- `actions?: ReactNode` - Actions dans le footer
- `variant?: 'default' | 'glassmorphism' | 'outlined'`
- `onClick?: () => void` - Handler de clic (rend la carte cliquable)

---

### 2. Button (`Button.tsx`)

Bouton avec variants, tailles, état de chargement et effet ripple.

```tsx
import { Button } from '@/components/ui';
import { Save } from 'lucide-react';

<Button
  variant="primary"
  size="md"
  icon={Save}
  iconPosition="left"
  loading={isSaving}
  onClick={handleSave}
>
  Enregistrer
</Button>
```

**Props:**
- `children: ReactNode` - Contenu du bouton
- `variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'`
- `size?: 'sm' | 'md' | 'lg'`
- `loading?: boolean` - Affiche un spinner
- `disabled?: boolean`
- `icon?: LucideIcon` - Icône optionnelle
- `iconPosition?: 'left' | 'right'`
- `fullWidth?: boolean`

**Features:**
- ✅ Effet ripple au clic
- ✅ Touch target 44px minimum
- ✅ Animations hover/tap
- ✅ ARIA attributes

---

### 3. Input (`Input.tsx`)

Champ de saisie avec label, erreur, icône et accessibilité.

```tsx
import { Input } from '@/components/ui';
import { Mail } from 'lucide-react';

<Input
  label="Email"
  type="email"
  icon={Mail}
  iconPosition="left"
  error={errors.email}
  helperText="Entrez votre adresse email"
  required
/>
```

**Props:**
- `label?: string` - Label du champ
- `error?: string` - Message d'erreur
- `icon?: LucideIcon` - Icône optionnelle
- `iconPosition?: 'left' | 'right'`
- `helperText?: string` - Texte d'aide
- `fullWidth?: boolean` - Par défaut: true
- Toutes les props HTML input standard

**Features:**
- ✅ Font-size 16px sur mobile (évite zoom iOS)
- ✅ Focus ring animé
- ✅ Messages d'erreur avec animation
- ✅ ARIA attributes complets

---

### 4. Modal (`Modal.tsx`)

Modale avec backdrop, animations et support clavier.

```tsx
import { Modal, Button } from '@/components/ui';

<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmer l'action"
  actions={
    <>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Annuler
      </Button>
      <Button variant="primary" onClick={handleConfirm}>
        Confirmer
      </Button>
    </>
  }
>
  Êtes-vous sûr de vouloir continuer ?
</Modal>
```

**Props:**
- `open: boolean` - État d'ouverture
- `onClose: () => void` - Handler de fermeture
- `title?: string` - Titre de la modale
- `children: ReactNode` - Contenu
- `actions?: ReactNode` - Actions dans le footer
- `showCloseButton?: boolean` - Bouton X (défaut: true)
- `closeOnBackdropClick?: boolean` - Fermer au clic backdrop (défaut: true)
- `closeOnEscape?: boolean` - Fermer avec Escape (défaut: true)
- `fullWidth?: boolean` - Pleine largeur
- `maxWidth?: string` - Largeur max (défaut: 'max-w-2xl')

**Features:**
- ✅ Portal rendering (body)
- ✅ Full-screen sur mobile, centered sur desktop
- ✅ Animations scaleIn + fadeIn
- ✅ Support clavier (Escape)
- ✅ Bloque le scroll du body
- ✅ z-index: 100

---

### 5. Badge (`Badge.tsx`)

Badge avec variants, icône et animation pulse optionnelle.

```tsx
import { Badge } from '@/components/ui';
import { CheckCircle } from 'lucide-react';

<Badge
  text="Complété"
  variant="success"
  icon={CheckCircle}
  pulse={true}
  size="md"
/>
```

**Props:**
- `text: string` - Texte du badge
- `variant?: 'success' | 'warning' | 'danger' | 'info' | 'default'`
- `icon?: LucideIcon` - Icône optionnelle
- `pulse?: boolean` - Animation pulse
- `size?: 'sm' | 'md' | 'lg'`

---

## 🎨 Utilisation

### Import

```tsx
import { Card, Button, Input, Modal, Badge } from '@/components/ui';
// ou
import { Card } from '@/components/ui/Card';
```

### Exemple Complet

```tsx
import { useState } from 'react';
import { Card, Button, Input, Modal, Badge } from '@/components/ui';
import { MapPin, Plus, AlertCircle } from 'lucide-react';

function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Card
        title="Nouvelle Sortie"
        icon={MapPin}
        variant="glassmorphism"
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Créer
          </Button>
        }
      >
        <Input
          label="Nom de la sortie"
          placeholder="Ex: Randonnée Mont Blanc"
          icon={MapPin}
        />
        <Badge text="En attente" variant="warning" icon={AlertCircle} />
      </Card>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirmer"
      >
        <p>Voulez-vous créer cette sortie ?</p>
      </Modal>
    </div>
  );
}
```

---

## ♿ Accessibilité

Tous les composants incluent:
- ✅ ARIA attributes appropriés
- ✅ Support clavier complet
- ✅ Focus management
- ✅ Screen reader support
- ✅ Touch targets 44px minimum

---

## 🌙 Dark Mode

Tous les composants supportent le dark mode automatiquement via les classes Tailwind `dark:`.

---

## 📱 Responsive

- ✅ Mobile-first design
- ✅ Touch-friendly (44px minimum)
- ✅ Font-size 16px sur mobile (Input)
- ✅ Full-screen modals sur mobile

---

## 🎭 Animations

- ✅ Framer Motion pour transitions fluides
- ✅ Hover effects
- ✅ Ripple effect (Button)
- ✅ Scale animations
- ✅ Fade animations

