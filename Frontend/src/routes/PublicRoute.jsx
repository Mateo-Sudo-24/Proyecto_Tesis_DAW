import { Navigate, Outlet } from "react-router"
import storeAuth from "../context/storeAuth"


const PublicRoute = () => {

    const token = storeAuth((state) => state.token)
    return token ? <Navigate to="/dashboard" /> : <Outlet />
}

export default PublicRoute