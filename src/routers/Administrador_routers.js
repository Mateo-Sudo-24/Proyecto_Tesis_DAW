import {Router} from 'express'
import { registro } from '../controllers/Administrador_controller.js'
const router = Router()


router.post('/registro',registro)


export default router