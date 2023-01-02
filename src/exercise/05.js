// Optimize context value
// http://localhost:3000/isolated/exercise/05.js

import * as React from 'react';
import {
  useForceRerender,
  useDebouncedState,
  AppGrid,
  updateGridState,
  updateGridCellState,
} from '../utils';

const DogNameStateContext = React.createContext();
const GridStateContext = React.createContext();

const initialGrid = Array.from({ length: 100 }, () =>
  Array.from({ length: 100 }, () => Math.random() * 100),
);

function dogNameReducer(state, action) {
  switch (action.type) {
    case 'TYPED_IN_DOG_INPUT': {
      return { ...state, dogName: action.dogName };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function gridReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_GRID_CELL': {
      return { ...state, grid: updateGridCellState(state.grid, action) };
    }
    case 'UPDATE_GRID': {
      return { ...state, grid: updateGridState(state.grid) };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function DogNameProvider({ children }) {
  const [state, dispatch] = React.useReducer(dogNameReducer, { dogName: '', });
  const value = React.useMemo(() => [state, dispatch], [state]);
  return (
    <DogNameStateContext.Provider value={value}>
      {children}
    </DogNameStateContext.Provider>
  );
}

function GridProvider({ children }) {
  const [state, dispatch] = React.useReducer(gridReducer, { grid: initialGrid, });
  const value = React.useMemo(() => [state, dispatch], [state]);
  return (
    <GridStateContext.Provider value={value}>
      {children}
    </GridStateContext.Provider>
  );
}

function useDogNameState() {
  const context = React.useContext(DogNameStateContext);
  if (!context) {
    throw new Error('useDogNameState must be used within the DogNameProvider');
  }
  return context;
}

function useGridState() {
  const context = React.useContext(GridStateContext);
  if (!context) {
    throw new Error('useGridState must be used within the GridProvider');
  }
  return context;
}

function Grid() {
  const [, dispatch] = useGridState();
  const [rows, setRows] = useDebouncedState(50);
  const [columns, setColumns] = useDebouncedState(50);
  const updateGridData = () => dispatch({ type: 'UPDATE_GRID' });
  return (
    <AppGrid
      onUpdateGrid={updateGridData}
      rows={rows}
      handleRowsChange={setRows}
      columns={columns}
      handleColumnsChange={setColumns}
      Cell={Cell}
    />
  );
}
Grid = React.memo(Grid);

function Cell({ row, column }) {
  const [state, dispatch] = useGridState();
  const cell = state.grid[row][column];
  const handleClick = () => dispatch({ type: 'UPDATE_GRID_CELL', row, column });
  return (
    <button
      className="cell"
      onClick={handleClick}
      style={{
        color: cell > 50 ? 'white' : 'black',
        backgroundColor: `rgba(0, 0, 0, ${cell / 100})`,
      }}
    >
      {Math.floor(cell)}
    </button>
  );
}
Cell = React.memo(Cell);

function DogNameInput() {
  const [state, dispatch] = useDogNameState();
  const { dogName } = state;

  function handleChange(event) {
    const newDogName = event.target.value;
    dispatch({ type: 'TYPED_IN_DOG_INPUT', dogName: newDogName });
  }

  return (
    <form onSubmit={e => e.preventDefault()}>
      <label htmlFor="dogName">Dog Name</label>
      <input
        value={dogName}
        onChange={handleChange}
        id="dogName"
        placeholder="Toto"
      />
      {dogName ? (
        <div>
          <strong>{dogName}</strong>, I've a feeling we're not in Kansas anymore
        </div>
      ) : null}
    </form>
  );
}

function App() {
  const forceRerender = useForceRerender();
  return (
    <div className="grid-app">
      <button onClick={forceRerender}>force rerender</button>
      <div>
        <DogNameProvider>
          <DogNameInput />
        </DogNameProvider>
        <GridProvider>
          <Grid />
        </GridProvider>
      </div>
    </div>
  );
}

export default App

/*
eslint
  no-func-assign: 0,
*/
