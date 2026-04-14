import { Navigate } from "react-router"
import storeAuth from "../context/storeAuth"

const ProtectedRoute = ({ children }) => {
    const token = storeAuth(state => state.token)
    
    if (!token) {
        return <Navigate to="/login" replace />
    }
    
    return children
}

export default ProtectedRoute
