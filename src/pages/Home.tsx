import { ExampleComponent } from '../components/ExampleComponent';

/**
 * Home page component
 */
export const Home = () => {
  return (
    <div className="container-camping section-padding">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-gradient">
          Bienvenue dans votre Aventure Camping
        </h1>
        <ExampleComponent />
      </div>
    </div>
  );
};

