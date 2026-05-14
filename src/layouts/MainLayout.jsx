import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

export default function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{background:'#041C15'}}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6" style={{background:'linear-gradient(135deg, #041C15 0%, #06281F 50%, #041C15 100%)'}}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
