module.exports = ({ env }) => ({
  meilisearch: {
    config: {
      // Your meili host
      host: env('MEILISEARCH_HOST', 'http://localhost:7700'),
      // Your master key or private key
      apiKey: env('MEILISEARCH_KEY', 'masterKey'),
    },
  },
  'users-permissions': {
    config: {
      register: {
        allowedFields: ['firstName', 'lastName', 'phoneNumber', 'cedula', 'birthdate', 'role'],
      }
    },
  },
});
