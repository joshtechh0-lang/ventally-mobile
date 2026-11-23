import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { routes } from './routes';
import AdminUserDetail from '../screens/Admin/AdminUserDetail';
import AdminListenerRequests from '../screens/Admin/AdminListenerRequests';
import AdminReviewRequest from '../screens/Admin/AdminReviewRequest';
import AdminSubAdminProfile from '../screens/Admin/AdminSubAdminProfile';
import AdminAddSubAdmin from '../screens/Admin/AdminAddSubAdmin';
import AdminSelectPermissions from '../screens/Admin/AdminSelectPermissions';
import AdminReportDetail from '../screens/Admin/AdminReportDetail';
import AdminTakeAction from '../screens/Admin/AdminTakeAction';
import AdminViewChat from '../screens/Admin/AdminViewChat';
import AdminFinancialStats from '../screens/Admin/AdminFinancialStats';
import AdminPaymentHistory from '../screens/Admin/AdminPaymentHistory';
import AdminSecurity from '../screens/Admin/AdminSecurity';
import AdminResetPassword from '../screens/Admin/AdminResetPassword';
import AdminChangeEmailPhone from '../screens/Admin/AdminChangeEmailPhone';
import AdminVerifyOTP from '../screens/Admin/AdminVerifyOTP';
import AdminSecuritySuccess from '../screens/Admin/AdminSecuritySuccess';
import AdminRolesPermissions from '../screens/Admin/AdminRolesPermissions';
import AdminPermissionsUpdateSuccess from '../screens/Admin/AdminPermissionsUpdateSuccess';
import AdminCrisisConf from '../screens/Admin/AdminCrisisConf';
import AdminExports from '../screens/Admin/AdminExports';
import NotificationsSettings from '../screens/VenterHome/NotificationsSettings';

const Stack = createStackNavigator();

const AdminInternalStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name={routes.adminUserDetail} component={AdminUserDetail} />
            <Stack.Screen name={routes.adminListenerRequests} component={AdminListenerRequests} />
            <Stack.Screen name={routes.adminReviewRequest} component={AdminReviewRequest} />
            <Stack.Screen name={routes.adminSubAdminProfile} component={AdminSubAdminProfile} />
            <Stack.Screen name={routes.adminAddSubAdmin} component={AdminAddSubAdmin} />
            <Stack.Screen name={routes.adminSelectPermissions} component={AdminSelectPermissions} />
            <Stack.Screen name={routes.adminReportDetail} component={AdminReportDetail} />
            <Stack.Screen name={routes.adminTakeAction} component={AdminTakeAction} />
            <Stack.Screen name={routes.adminViewChat} component={AdminViewChat} />
            <Stack.Screen name={routes.adminFinancialStats} component={AdminFinancialStats} />
            <Stack.Screen name={routes.adminPaymentHistory} component={AdminPaymentHistory} />
            <Stack.Screen name={routes.adminSecurity} component={AdminSecurity} />
            <Stack.Screen name={routes.adminResetPassword} component={AdminResetPassword} />
            <Stack.Screen name={routes.adminChangeEmailPhone} component={AdminChangeEmailPhone} />
            <Stack.Screen name={routes.adminVerifyOTP} component={AdminVerifyOTP} />
            <Stack.Screen name={routes.adminSecuritySuccess} component={AdminSecuritySuccess} />
            <Stack.Screen name={routes.adminRolesPermissions} component={AdminRolesPermissions} />
            <Stack.Screen name={routes.adminPermissionsUpdateSuccess} component={AdminPermissionsUpdateSuccess} />
            <Stack.Screen name={routes.adminCrisisConf} component={AdminCrisisConf} />
            <Stack.Screen name={routes.adminExports} component={AdminExports} />
            <Stack.Screen name={routes.venterNotifications} component={NotificationsSettings} />
        </Stack.Navigator>
    );
};

export default AdminInternalStack;
