/**
 * Dashboard Page - Test page to view the layout
 */
export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="medical-card">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Tableau de bord
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bienvenue sur votre tableau de bord ! Vous pouvez voir le nouveau layout avec la Sidebar et la TopNavBar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="medical-card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Mes Sorties
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos sorties de camping
          </p>
        </div>

        <div className="medical-card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Statistiques
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Consultez vos statistiques
          </p>
        </div>

        <div className="medical-card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Badges
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Vos badges et achievements
          </p>
        </div>
      </div>
    </div>
  );
}

