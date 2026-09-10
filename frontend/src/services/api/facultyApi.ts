export const facultyApi = {
  getOverview: async () => ({
    success: true,
    message: 'Faculty API foundation ready',
    data: { domain: 'Faculty Instruction' },
    timestamp: new Date().toISOString(),
  }),
};
