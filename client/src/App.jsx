import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MealList from './components/MealList.jsx';
import MealDetail from './components/MealDetail.jsx';
import MealForm from './components/MealForm.jsx';
import ArchiveList from './components/ArchiveList.jsx';
import BottomNav from './components/BottomNav.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<MealList />} />
          <Route path="/add" element={<MealForm />} />
          <Route path="/meal/:id" element={<MealDetail />} />
          <Route path="/meal/:id/edit" element={<MealForm />} />
          <Route path="/archive" element={<ArchiveList />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
