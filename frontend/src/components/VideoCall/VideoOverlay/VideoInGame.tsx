import React from 'react';
import { Flex } from '@chakra-ui/react';
import { useAppState } from '../../VideoCall/VideoFrontend/state';
import VideoGrid from '../../VideoCall/VideoOverlay/VideoOverlay';
import { VideoProvider } from '../../VideoCall/VideoFrontend/components/VideoProvider';
import useConnectionOptions from '../VideoFrontend/utils/useConnectionOptions/useConnectionOptions';

// Assuming 'Status' is passed as a prop to VideoIntegration
const VideoIntegration: React.FC<{ status: string }> = ({ status }) => {
  const { error, setError } = useAppState();
  const connectionOptions = useConnectionOptions();

  return (
    <VideoProvider options={connectionOptions} onError={setError}>
      <Flex direction='column' align='center'>
        <VideoGrid preferredMode='sidebar' gameStatus={status}/>
      </Flex>
    </VideoProvider>
  );
};

export default VideoIntegration;
