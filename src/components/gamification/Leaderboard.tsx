/**
 * Leaderboard Component
 * 
 * Real-time leaderboard showing top participants and rankings.
 */

import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { Card } from '../ui/Card';
import { Tabs } from '../navigation/Tabs';

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatarUrl?: string;
  points: number;
  level: number;
  badges: number;
  isCurrentUser?: boolean;
}

/**
 * Leaderboard props
 */
interface LeaderboardProps {
  /**
   * Leaderboard entries
   */
  entries: LeaderboardEntry[];

  /**
   * Current user ID
   */
  currentUserId?: string;

  /**
   * Filter type
   */
  filter?: 'trip' | 'all-time';

  /**
   * On filter change
   */
  onFilterChange?: (filter: 'trip' | 'all-time') => void;
}

/**
 * Leaderboard Component
 */
export function Leaderboard({
  entries,
  currentUserId,
  filter = 'trip',
  onFilterChange,
}: LeaderboardProps) {
  // Sort by points (descending)
  const sortedEntries = [...entries].sort((a, b) => b.points - a.points);

  // Get top 3
  const top3 = sortedEntries.slice(0, 3);
  const rest = sortedEntries.slice(3);

  // Find current user position
  const currentUserIndex = sortedEntries.findIndex((entry) => entry.userId === currentUserId);
  const currentUserEntry = currentUserIndex >= 0 ? sortedEntries[currentUserIndex] : null;

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      {onFilterChange && (
        <Tabs
          tabs={[
            { id: 'trip', label: 'Ce voyage' },
            { id: 'all-time', label: 'Tous les temps' },
          ]}
          activeTab={filter}
          onChange={(tab) => onFilterChange(tab as 'trip' | 'all-time')}
        />
      )}

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-2 mb-6">
          {/* 2nd Place */}
          {top3[1] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center flex-1"
            >
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-2 relative">
                {top3[1].avatarUrl ? (
                  <img
                    src={top3[1].avatarUrl}
                    alt={top3[1].userName}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <span className="text-lg font-semibold">
                    {top3[1].userName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                  <Medal className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-3 w-full text-center">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">2ème</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {top3[1].userName}
                </p>
                <p className="text-xs text-primary font-semibold">{top3[1].points} pts</p>
              </div>
            </motion.div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center flex-1"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mb-2 relative ring-4 ring-yellow-300">
                {top3[0].avatarUrl ? (
                  <img
                    src={top3[0].avatarUrl}
                    alt={top3[0].userName}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <span className="text-xl font-semibold text-white">
                    {top3[0].userName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg p-3 w-full text-center">
                <p className="text-xs font-semibold text-white mb-1">1er</p>
                <p className="text-sm font-bold text-white truncate">{top3[0].userName}</p>
                <p className="text-xs text-white font-semibold">{top3[0].points} pts</p>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center flex-1"
            >
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-2 relative">
                {top3[2].avatarUrl ? (
                  <img
                    src={top3[2].avatarUrl}
                    alt={top3[2].userName}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <span className="text-lg font-semibold">
                    {top3[2].userName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-3 w-full text-center">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">3ème</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {top3[2].userName}
                </p>
                <p className="text-xs text-primary font-semibold">{top3[2].points} pts</p>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Rest of the List */}
      {rest.length > 0 && (
        <div className="space-y-2">
          {rest.map((entry, index) => {
            const position = index + 4;
            const isCurrentUser = entry.userId === currentUserId;

            return (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Card
                  className={`${
                    isCurrentUser
                      ? 'border-primary bg-primary/10 ring-2 ring-primary'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      {entry.avatarUrl ? (
                        <img
                          src={entry.avatarUrl}
                          alt={entry.userName}
                          className="w-full h-full rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-semibold">
                          {entry.userName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 w-6">
                            #{position}
                          </span>
                          <span
                            className={`font-semibold ${
                              isCurrentUser
                                ? 'text-primary'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {entry.userName}
                            {isCurrentUser && ' (Vous)'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">{entry.points} pts</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Niveau {entry.level}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Current User Highlight (if not in top 3) */}
      {currentUserEntry && currentUserIndex >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Votre position
          </p>
          <Card className="border-primary bg-primary/10 ring-2 ring-primary">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                {currentUserEntry.avatarUrl ? (
                  <img
                    src={currentUserEntry.avatarUrl}
                    alt={currentUserEntry.userName}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <span className="text-sm font-semibold text-primary">
                    {currentUserEntry.userName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 w-6">
                      #{currentUserIndex + 1}
                    </span>
                    <span className="font-semibold text-primary">{currentUserEntry.userName}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{currentUserEntry.points} pts</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Niveau {currentUserEntry.level}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {sortedEntries.length === 0 && (
        <Card className="text-center py-8">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">Aucun participant</p>
        </Card>
      )}
    </div>
  );
}

