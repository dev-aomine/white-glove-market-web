const { handleError, getTrustedSdk } = require('../api-util/sdk');

async function authenticateFlexUser(req, res, next) {
  try {
    console.log('authenticateFlexUser');
    const trustedSdk = await getTrustedSdk(req);
    const userResponse = await trustedSdk.currentUser.show();
    const tokenId = userResponse.data.data.id.uuid;

    req.tokenId = tokenId;

    next();
  } catch (error) {
    return handleError(error);
  }
}

module.exports = authenticateFlexUser;
