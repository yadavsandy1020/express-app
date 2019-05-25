import express from 'express';
const routes = express.Router();
import users from './user.route';
import avatars from './avatar.route';
import workday from './workday.route';
import leave from './leave.route';
import holiday from './holiday.route';

routes.use('/user', users);
routes.use('/avatar', avatars);
routes.use('/workday', workday);
routes.use('/leave', leave);
routes.use('/holiday', holiday);

export default routes;
