import { ReactFlowProvider } from '@xyflow/react';
import EntityGraph from './components/EntityGraph';
import './App.css';

function App() {
  return (
    <ReactFlowProvider>
      <div className="w-screen h-screen">
        <EntityGraph />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
