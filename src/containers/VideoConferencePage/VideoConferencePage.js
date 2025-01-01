import React, { useEffect, useState } from 'react';
import { VideoSDKMeeting } from '@videosdk.live/rtc-js-prebuilt';
import { denormalisedResponseEntities } from '../../util/data';
import { useSelector } from 'react-redux';
import { currentUserIdSelector } from '../../ducks/user.duck';
import { useConfiguration } from '../../context/configurationContext';
import { transitions } from '../../transactions/transactionProcessBooking';

const getTxById = async id => {
  const txRes = await window.app.sdk.transactions.show(
    {
      id,
      include: ['customer', 'provider', 'listing', 'listing.images', 'booking'],
    },
    { expand: true }
  );

  return denormalisedResponseEntities(txRes)[0];
};

function VideoConferencePage() {
  const [isLoading, setIsLoading] = useState(true);
  const currentUserId = useSelector(currentUserIdSelector);
  const config = useConfiguration();

  useEffect(() => {
    (async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const txId = urlParams.get('txId');

        const tx = await getTxById(txId);

        if (tx.attributes.lastTransition !== transitions.ACCEPT) {
          throw new Error('Transaction not accepted');
        }

        const isHost = tx.provider.id.uuid === currentUserId;
        const role = isHost ? 'provider' : 'customer';
        const name = tx[role].attributes.profile.displayName;
        const participantId = tx[role].id.uuid;
        const { meetingId } = tx.attributes.protectedData;

        const params = {
          name,
          meetingId,
          apiKey: process.env.REACT_APP_VIDEO_SDK_API_KEY,
          containerId: 'meeting-container',
          redirectOnLeave: `${window.location.origin}/${isHost ? 'sale' : 'order'}/${tx.id.uuid}`,

          //default config
          realtimeTranscription: {
            enabled: true,
            visible: true,
          },
          participantId,
          chatEnabled: true,
          screenShareEnabled: true,
          micEnabled: true,
          webcamEnabled: true,
          participantCanToggleSelfWebcam: true,
          participantCanToggleSelfMic: true,
          participantCanLeave: true,
          raiseHandEnabled: true,
          branding: {
            enabled: true,
            logoURL: config.branding.logoImageMobile.attributes.variants.scaled2x.url ?? '',
            name: config.marketplaceName ?? '',
            poweredBy: false,
          },
          moreOptionsEnabled: false,
        };

        const meeting = new VideoSDKMeeting();
        meeting.init(params);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        window.alert('Error starting meeting: ' + error?.message);
      }
    })();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      id="meeting-container"
      style={{ width: '100%', height: '100vh', flex: 1, backgroundColor: 'black' }}
    />
  );
}

export default VideoConferencePage;
