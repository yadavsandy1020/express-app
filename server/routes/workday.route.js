import express from 'express';
import multer from 'multer';
import WorkdayController from '../controllers/workday.controller';
import PermissionController from '../auth/permission.controller';
import AuthorizationValidationController from '../auth/authorization.validation.controller';
import configuration from '../common/env.config';

const {ADMIN, MANAGER, USER} = configuration.permissions;

const routes = express.Router();
const upload = multer({storage: multer.memoryStorage()});

routes.post('/:avatarId/upload', upload.single('reportFile'), [
  AuthorizationValidationController.validJWTNeeded,
  PermissionController.minimumPermissionRequired(MANAGER),
  WorkdayController.importTimelyFile
]);
routes.post('/:avatarId', [
  AuthorizationValidationController.validJWTNeeded,
  PermissionController.minimumPermissionRequired(MANAGER),
  WorkdayController.addWorkday
]);

routes.get('/:avatarId', [
  AuthorizationValidationController.validJWTNeeded,
  PermissionController.minimumPermissionRequired(USER),
  WorkdayController.getUserWorkdays
]);

routes.get('/', [
  AuthorizationValidationController.validJWTNeeded,
  PermissionController.minimumPermissionRequired(MANAGER),
  WorkdayController.getUserWorkdays
]);

export default routes;
