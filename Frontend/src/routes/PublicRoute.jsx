import { Navigate, Outlet } from "react-router"
import storeAuth from "../context/storeAuth"

const PublicRoute = () => {
    const token = storeAuth((state) => state.token)
    
    if (token) {
        return <Navigate to="/dashboard" replace />
    }
    
    return <Outlet />
}

export default PublicRoute