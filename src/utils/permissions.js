const config = require('../../config.json');

function hasRequiredRole(member) {
  if (!member) return false;
  return config.allowedRoleIds.some(roleId => member.roles.cache.has(roleId));
}
function hasHighStaffRole(member) {
  if (!member) return false;
  return config.highStaffRoleIds.some(roleId => member.roles.cache.has(roleId));
}

module.exports = { hasRequiredRole, hasHighStaffRole };