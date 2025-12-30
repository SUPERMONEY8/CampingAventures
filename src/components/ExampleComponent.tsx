import { motion } from 'framer-motion';
import { Tent } from 'lucide-react';

/**
 * Example component demonstrating the setup
 */
export const ExampleComponent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card p-8 text-center"
    >
      <Tent className="w-16 h-16 mx-auto mb-4 text-primary-600" />
      <h2 className="text-2xl font-bold text-gradient mb-2">
        Camping Adventure App
      </h2>
      <p className="text-gray-600">
        Votre application est prête ! Commencez à développer vos fonctionnalités.
      </p>
    </motion.div>
  );
};

