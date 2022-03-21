module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '9c645c289c53766472e91203b616a6f8'),
  },
});
