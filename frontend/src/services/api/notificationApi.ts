export const notificationApi = {
  getNotifications: async () => ({
    success: true,
    message: 'Notifications placeholder ready',
    data: [
      { id: '1', title: 'System Initialization', message: 'AHRAO Phase 1 active', time: 'Just now', read: false },
      { id: '2', title: 'SDG 4 Alignment Verified', message: 'Resource telemetry initialized', time: '10m ago', read: false }
    ],
    timestamp: new Date().toISOString(),
  }),
};
