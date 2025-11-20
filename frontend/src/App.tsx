import { ReactFlowProvider } from '@xyflow/react';
import EntityGraph from './components/EntityGraph';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <ReactFlowProvider>
        <div className="w-screen h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <EntityGraph />
        </div>
      </ReactFlowProvider>
    </ThemeProvider>
  );
}

export default App;
