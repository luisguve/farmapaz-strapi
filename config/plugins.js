module.exports = () => ({
  'users-permissions': {
    config: {
      register: {
        allowedFields: ['firstName', 'lastName', 'phoneNumber', 'cedula', 'birthdate', 'role'],
      }
    },
  },
});
