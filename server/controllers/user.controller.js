import model from '../models';
import crypto from 'crypto';
import RoleController from '../common/role.controller';

const {User, Avatar} = model;

class UserController {
  static signUpWithAvatar(req, res) {
    const {password, roles} = req.body;
    // hash the password before saving in the database
    const salt = crypto.randomBytes(16).toString('base64');
    const hash = crypto
      .createHmac('sha512', salt)
      .update(password)
      .digest('base64');
    const hashedPassword = salt + '$' + hash;

    const avatarId = req.params.avatarId;
    User.findAll({
      where: {avatarId},
      attributes: {include: ['id', 'email', 'avatarId', 'createdAt'], exclude: ['password']}
    }).then(user => {
      if (user.length > 0) {
        return res.status(400).send({message: 'User with avatar id ' + avatarId + ' already exists', user});
      } else {
        Avatar.findByPk(avatarId)
          .then(avatar => {
            if (avatar) {
              return User.create({
                email: avatar.email,
                password: hashedPassword,
                avatarId,
                roles: RoleController.convertToInteger(roles)
              })
                .then(userData =>
                  res.status(201).send({
                    success: true,
                    message: 'User successfully created',
                    userData
                  })
                )
                .catch(error => res.status(400).send(error));
            } else {
              return res.status(400).send({
                status: false,
                message: 'Avatar with id ' + avatarId + ' was not found in the database'
              });
            }
          })
          .catch(error => res.status(400).send(error));
      }
    });
  }

  static signUp(req, res) {
    const {email, password, roles, first_name, last_name} = req.body;

    // hash the password before saving in the database
    const salt = crypto.randomBytes(16).toString('base64');
    const hash = crypto
      .createHmac('sha512', salt)
      .update(password)
      .digest('base64');
    const hashedPassword = salt + '$' + hash;
    Avatar.create({
      first_name,
      last_name,
      email
    })
      .then(avatar => {
        return User.create({
          email,
          password: hashedPassword,
          avatarId: avatar.id,
          roles: RoleController.convertToInteger(roles)
        })
          .then(userData =>
            res.status(201).send({
              success: true,
              message: 'User successfully created',
              userData
            })
          )
          .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  }

  static login(req, res, next) {
    const {email, password} = req.body;

    User.findAll({
      where: {
        email
      }
    })
      .then(user => {
        if (!user[0]) {
          return res.status(404).send({message: 'User not found'});
        } else {
          const passwordFields = user[0].password.split('$');
          const salt = passwordFields[0];
          const hash = crypto
            .createHmac('sha512', salt)
            .update(password)
            .digest('base64');
          if (hash === passwordFields[1]) {
            // passwords are same, user authenticated
            Avatar.findByPk(user[0].avatarId)
              .then(avatar => {
                req.body = {
                  userId: user[0].id,
                  email: user[0].email,
                  roles: user[0].roles,
                  provider: 'email',
                  name: avatar.first_name + ' ' + avatar.last_name
                };

                return next();
              })
              .catch(error => {
                res.status(400).send(error);
              });
          }
        }
      })
      .catch(error => {
        res.status(400).send(error);
      });
  }

  static getAllUsers(req, res) {
    User.findAll()
      .then(users => {
        let message = 'Users successfully retrieved';
        if (users.length <= 0) {
          message = 'No users were found';
        }
        return res.status(200).send({
          status: true,
          message,
          users
        });
      })
      .catch(error => res.status(400).send(error));
  }
  static getUser(req, res) {
    const userId = req.params.userId;
    User.find({
      where: {id: userId}
    })
      .then(user => {
        let message = 'Leaves successfully retrieved';
        if (user) {
          message = 'No leaves were found';
        }
        return res.status(200).send({
          status: true,
          message,
          user
        });
      })
      .catch(error => res.status(400).send(error));
  }
}

export default UserController;
