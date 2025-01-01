const jwt = require('jsonwebtoken');
const axios = require('axios');

const { REACT_APP_VIDEO_SDK_API_KEY, VIDEO_SDK_SECRET_KEY } = process.env;
const createRoomUrl = 'https://api.videosdk.live/v2/rooms';

const createAuthToken = () => {
  const options = {
    expiresIn: '120m',
    algorithm: 'HS256',
  };

  const payload = {
    apikey: REACT_APP_VIDEO_SDK_API_KEY,
    permissions: [`ask_join`],
    version: 2,
  };

  const token = jwt.sign(payload, VIDEO_SDK_SECRET_KEY, options);
  return token;
};

const createRoom = async (req, res) => {
  const { txId } = req.body;

  const token = createAuthToken();

  const options = {
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await axios.post(
      createRoomUrl,
      {
        customRoomId: txId,
      },
      options
    );

    res.status(200).json({ customRoomId: response.data.customRoomId });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
  }
};

module.exports = {
  createRoom,
};
