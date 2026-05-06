import express from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from '../../../generated/client/enums';
import { StatsController } from './stats.controller';


const router = express.Router();

router.get(
    '/',
    checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT),
    StatsController.getDashboardStatsData
)


export const StatsRoutes = router;