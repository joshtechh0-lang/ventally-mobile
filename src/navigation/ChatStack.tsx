import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { routes } from './routes';

// Import chat screens
import RecentChatsScreen from '../screens/Chat/RecentChatsScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import ReportScreen from '../screens/Chat/ReportScreen';
import SessionRatingScreen from '../screens/Chat/SessionRatingScreen';
import SessionFeedbackScreen from '../screens/Chat/SessionFeedbackScreen';
import FindingListenerScreen from '../screens/Chat/FindingListenerScreen';
import ActiveCallScreen from '../screens/Chat/ActiveCallScreen';
import VenterCrisisOverlayScreen from '../screens/Chat/VenterCrisisOverlayScreen';

const Stack = createStackNavigator();

const ChatStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={routes.recentChats}
    >
      <Stack.Screen
        name={routes.recentChats}
        component={RecentChatsScreen}
      />
      <Stack.Screen
        name={routes.chat}
        component={ChatScreen}
      />
      <Stack.Screen
        name={routes.chatReport}
        component={ReportScreen}
      />
      <Stack.Screen
        name={routes.chatSessionRating}
        component={SessionRatingScreen}
      />
      <Stack.Screen
        name={routes.chatSessionFeedback}
        component={SessionFeedbackScreen}
      />
      <Stack.Screen
        name={routes.findingListener}
        component={FindingListenerScreen}
      />
      <Stack.Screen
        name={routes.activeCall}
        component={ActiveCallScreen}
      />
      <Stack.Screen
        name={routes.venterCrisisOverlay}
        component={VenterCrisisOverlayScreen}
      />
    </Stack.Navigator>
  );
};

export default ChatStack;
