// Supabase client is deprecated in this app after the Mongo/Express move.
// This stub prevents runtime crashes while legacy imports are removed.
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    getUser: async () => ({ data: { user: null } }),
    signOut: async () => ({}),
  },
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: [], error: null }),
    delete: () => ({ data: [], error: null }),
    update: () => ({ data: [], error: null }),
    eq: () => ({ data: [], error: null }),
    order: () => ({ data: [], error: null }),
  }),
};
