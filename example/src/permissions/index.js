/* eslint-disable no-console */
const AccessControl = require('accesscontrol');

const permissionsOptionsDefaults = {};

// temporary ac-list
const ac = new AccessControl();
ac.grant('user') // define new or modify existing role. also takes an array.
  .createOwn('video') // equivalent to .createOwn('video', ['*'])
  .deleteOwn('video')
  .readAny('video')
  .grant('admin') // switch to another role without breaking the chain
  .extend('user') // inherit role capabilities. also takes an array
  .updateAny('video', ['title']) // explicitly defined attributes
  .deleteAny('video');

module.exports = (options = {}) => {
  const permissionsOptions = Object.assign({}, permissionsOptionsDefaults, options || {});

  return (req, res, next) => {
    // fetch permission table -> example ac
    req.permission = ac;

    // const permission = ac.can('user').createOwn('video');
    // console.log(permission.granted);    // —> true
    // console.log(permission.attributes); // —> ['*'] (all attributes)
    //
    // permission = ac.can('admin').updateAny('video');
    // console.log(permission.granted);    // —> true
    // console.log(permission.attributes); // —> ['title']

    console.debug('Permission Log :: ', permissionsOptions);

    // check public access
    if (req.permission) {
      return next();
    }

    return next();
  };
};
